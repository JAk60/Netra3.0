"""
nlpLayer/general/sql_pattern_memory.py
----------------------------------------
SQL Pattern Memory — ChromaDB-backed cache for the GENERAL intent pipeline.

Parallel to PatternMemory (nlpLayer/pattern_memory.py) but stores
parameterised SQL templates instead of tool_json.

Key design decisions
--------------------
1. Exact key lookup is PRIMARY.
   The QueryShape vocabulary is finite and deterministic. If the shape
   classifier correctly identified "SEN|SHIP_MULTI", we want an O(1)
   metadata filter — not a nearest-neighbour search. Vector similarity
   is a confirmation check, not the primary retrieval mechanism.

2. Stricter similarity threshold (0.88 vs 0.85 in PatternMemory).
   A wrong SQL template silently returns bad data. Higher bar = fewer
   silent errors.

3. Separate ChromaDB collection ("sql_patterns").
   PatternMemory uses "nlp_patterns". Zero collision.
   Both can share the same PersistentClient on disk.

4. SQL templates use :param_name syntax.
   Entity IDs and dates are never baked into stored SQL.
   ParamBinder fills them at runtime.

Cache logic
-----------
    exact metadata filter on key              → HIT  (fastest, O(1))
    vector similarity ≥ 0.88 + key match      → HIT  (embedding confirms shape)
    vector similarity ≥ 0.88 + key mismatch   → MISS (shape differs, reject)
    vector similarity < 0.88                  → MISS

Confidence ladder: 0.6 → 0.75 → 0.85 → 0.95

ChromaDB document shape
-----------------------
    id:       "<uuid>"
    document: "<sql_template string>"
    metadata: {
        "key":          "SEN|SHIP",
        "param_schema": '{"ship_id": "uuid"}',
        "tables_used":  "sensor_readings,sensor_metadata,system_configuration",
        "hit_count":    0,
        "confidence":   0.6,
        "version":      1,
        "is_seed":      true | false
    }

Changes
-------
ASYNC  find(), store(), invalidate(), seed() are now all async.
       ChromaDB calls are synchronous under the hood (fast enough for
       in-process use); wrapped in asyncio.to_thread() for safety so
       they never block the event loop.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from backend.utils.nlpLayer.chat_logger import log_stage

logger = logging.getLogger(__name__)

_COLLECTION_NAME      = "sql_patterns"
_SIMILARITY_THRESHOLD = 0.88
_CONFIDENCE_LADDER    = [0.6, 0.75, 0.85, 0.95]


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------

@dataclass
class SQLPatternResult:
    """Returned by SQLPatternMemory.find() on a cache hit."""
    hit:          bool
    key:          str
    pattern_id:   str
    sql_template: str
    param_schema: Dict[str, str]   # {"param_name": "type_string"}
    tables_used:  List[str]
    confidence:   float
    is_seed:      bool


# ---------------------------------------------------------------------------
# Main class
# ---------------------------------------------------------------------------

class SQLPatternMemory:
    """
    ChromaDB-backed SQL pattern cache for the GENERAL intent pipeline.

    Instantiate once at app startup.
    Inject the same embedding_model used by PatternMemory for consistency.
    Optionally share the same chroma_client — different collection name
    ensures zero collision with PatternMemory's "nlp_patterns".
    """

    def __init__(
        self,
        embedding_model,
        chroma_client=None,
        persist_directory: str = "chroma_db",
    ):
        self._model = embedding_model

        if chroma_client is None:
            try:
                import chromadb
                self._chroma = chromadb.PersistentClient(path=persist_directory)
            except ImportError:
                logger.warning(
                    "chromadb not installed — SQLPatternMemory in no-cache mode."
                )
                self._chroma = None
        else:
            self._chroma = chroma_client

        self._collection = None
        if self._chroma:
            self._collection = self._chroma.get_or_create_collection(
                name=_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info(
                "SQLPatternMemory: collection '%s' ready (%d entries)",
                _COLLECTION_NAME,
                self._collection.count(),
            )

    # ------------------------------------------------------------------
    # Public API — all async
    # ------------------------------------------------------------------

    async def find(self, key: str, message: str) -> Optional[SQLPatternResult]:
        """
        Look up a cached SQL pattern.

        Primary   : exact metadata filter on key — no embedding needed.
        Fallback  : vector similarity ≥ threshold + key confirmation.

        Args:
            key:     Canonical QueryShape key e.g. "SEN|SHIP".
            message: Raw user message — used only for vector fallback.

        Returns:
            SQLPatternResult on hit, None on miss.
        """
        if not self._collection:
            log_stage("SQL_MEMORY", "ChromaDB unavailable → MISS")
            return None

        # ── Primary: exact key lookup ─────────────────────────────────
        try:
            exact = await asyncio.to_thread(
                self._collection.get,
                where={"key": key},
                include=["documents", "metadatas"],
                limit=1,
            )
        except Exception as exc:
            logger.warning("SQLPatternMemory exact lookup failed: %s", exc)
            exact = {"ids": [], "documents": [], "metadatas": []}

        if exact["ids"]:
            pattern_id   = exact["ids"][0]
            sql_template = exact["documents"][0]
            meta         = exact["metadatas"][0]
            confidence   = float(meta.get("confidence", 0.6))
            log_stage("SQL_MEMORY", f"exact HIT key={key} confidence={confidence:.2f}")
            await self._increment_hit(pattern_id, meta)
            return self._build_result(
                key=key,
                pattern_id=pattern_id,
                sql_template=sql_template,
                meta=meta,
            )

        # ── Fallback: vector similarity ───────────────────────────────
        log_stage("SQL_MEMORY", f"no exact match key={key} → vector search")

        query_vec = await asyncio.to_thread(self._embed, message)
        if query_vec is None:
            log_stage("SQL_MEMORY", "embedding failed → MISS")
            return None

        try:
            results = await asyncio.to_thread(
                self._collection.query,
                query_embeddings=[query_vec],
                n_results=3,
                include=["metadatas", "distances", "documents"],
            )
        except Exception as exc:
            logger.warning("SQLPatternMemory vector query failed: %s", exc)
            return None

        if not results["ids"] or not results["ids"][0]:
            log_stage("SQL_MEMORY", "no vector candidates → MISS")
            return None

        top_id         = results["ids"][0][0]
        top_distance   = results["distances"][0][0]
        top_similarity = 1.0 - top_distance
        top_meta       = results["metadatas"][0][0]
        top_key        = top_meta.get("key", "")
        top_sql        = results["documents"][0][0]

        log_stage("SQL_MEMORY", f"vector top={top_similarity:.3f} key={top_key}")

        if top_similarity < _SIMILARITY_THRESHOLD:
            log_stage(
                "SQL_MEMORY",
                f"similarity={top_similarity:.3f} < {_SIMILARITY_THRESHOLD} → MISS"
            )
            return None

        if top_key != key:
            log_stage(
                "SQL_MEMORY",
                f"similarity={top_similarity:.3f} ≥ threshold "
                f"but key={top_key} ≠ {key} → shape mismatch → MISS"
            )
            return None

        confidence = float(top_meta.get("confidence", 0.6))
        log_stage(
            "SQL_MEMORY",
            f"vector confirmed HIT key={key} "
            f"similarity={top_similarity:.3f} confidence={confidence:.2f}"
        )
        await self._increment_hit(top_id, top_meta)
        return self._build_result(
            key=key,
            pattern_id=top_id,
            sql_template=top_sql,
            meta=top_meta,
        )

    async def store(
        self,
        key:          str,
        message:      str,
        sql_template: str,
        param_schema: Dict[str, str],
        tables_used:  List[str],
        is_seed:      bool = False,
    ) -> Optional[str]:
        """
        Store a new SQL pattern.

        Called after a MISS + successful SQL generation, or during seeding.

        Returns:
            New pattern_id (str uuid) or None on failure.
        """
        if not self._collection:
            return None

        query_vec = await asyncio.to_thread(self._embed, message)
        if query_vec is None:
            logger.warning("SQLPatternMemory.store: embedding failed, not stored")
            return None

        pattern_id = str(uuid.uuid4())
        metadata   = {
            "key":          key,
            "param_schema": json.dumps(param_schema),
            "tables_used":  ",".join(tables_used),
            "hit_count":    0,
            "confidence":   _CONFIDENCE_LADDER[0],
            "version":      1,
            "is_seed":      is_seed,
        }

        try:
            await asyncio.to_thread(
                self._collection.add,
                ids=[pattern_id],
                embeddings=[query_vec],
                documents=[sql_template],
                metadatas=[metadata],
            )
            log_stage(
                "SQL_MEMORY",
                f"stored {'seed' if is_seed else 'new'} pattern "
                f"key={key} id={pattern_id}"
            )
            return pattern_id
        except Exception as exc:
            logger.warning("SQLPatternMemory.store failed: %s", exc)
            return None

    async def invalidate(self, key: str) -> bool:
        """
        Remove a cached pattern by key.

        Called by SQLTool when a cached template fails validation —
        e.g. after a schema change made a seed SQL stale.

        Returns True if deleted, False if not found.
        """
        if not self._collection:
            return False

        try:
            existing = await asyncio.to_thread(
                self._collection.get,
                where={"key": key},
                include=[],
                limit=1,
            )
            if not existing["ids"]:
                return False

            await asyncio.to_thread(
                self._collection.delete,
                ids=existing["ids"],
            )
            log_stage("SQL_MEMORY", f"invalidated key={key} id={existing['ids'][0]}")
            return True
        except Exception as exc:
            logger.warning("SQLPatternMemory.invalidate failed key=%s: %s", key, exc)
            return False

    async def seed(self, entries: List[Dict[str, Any]]) -> int:
        """
        Bulk-load hand-written SQL patterns.

        Safe to call on every startup — skips keys that already exist.

        Each entry dict must have:
            key, message, sql_template, param_schema, tables_used

        Returns:
            Number of new entries inserted.
        """
        if not self._collection:
            logger.warning("SQLPatternMemory.seed: ChromaDB unavailable, skipping")
            return 0

        inserted = 0
        for entry in entries:
            key = entry["key"]

            try:
                existing = await asyncio.to_thread(
                    self._collection.get,
                    where={"key": key},
                    include=[],
                    limit=1,
                )
                if existing["ids"]:
                    log_stage("SQL_MEMORY", f"seed skip — key={key} already exists")
                    continue
            except Exception:
                pass

            result = await self.store(
                key=key,
                message=entry["message"],
                sql_template=entry["sql_template"],
                param_schema=entry["param_schema"],
                tables_used=entry["tables_used"],
                is_seed=True,
            )
            if result:
                inserted += 1

        log_stage("SQL_MEMORY", f"seed complete — {inserted}/{len(entries)} inserted")
        return inserted

    def stats(self) -> Dict[str, Any]:
        """Basic stats for monitoring / admin endpoints. Sync — read-only."""
        if not self._collection:
            return {"available": False}
        try:
            return {
                "available":      True,
                "collection":     _COLLECTION_NAME,
                "total_patterns": self._collection.count(),
                "threshold":      _SIMILARITY_THRESHOLD,
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_result(
        self,
        key:          str,
        pattern_id:   str,
        sql_template: str,
        meta:         Dict[str, Any],
    ) -> SQLPatternResult:
        try:
            param_schema: Dict[str, str] = json.loads(meta.get("param_schema", "{}"))
        except (json.JSONDecodeError, TypeError):
            param_schema = {}

        tables_raw  = meta.get("tables_used", "")
        tables_used = [t.strip() for t in tables_raw.split(",") if t.strip()]

        return SQLPatternResult(
            hit=True,
            key=key,
            pattern_id=pattern_id,
            sql_template=sql_template,
            param_schema=param_schema,
            tables_used=tables_used,
            confidence=float(meta.get("confidence", 0.6)),
            is_seed=bool(meta.get("is_seed", False)),
        )

    async def _increment_hit(self, pattern_id: str, meta: Dict[str, Any]) -> None:
        """Increment hit_count and climb the confidence ladder."""
        try:
            hit_count    = int(meta.get("hit_count", 0)) + 1
            current_conf = float(meta.get("confidence", 0.6))
            next_conf    = current_conf
            for rung in _CONFIDENCE_LADDER:
                if rung > current_conf:
                    next_conf = rung
                    break

            await asyncio.to_thread(
                self._collection.update,
                ids=[pattern_id],
                metadatas=[{**meta, "hit_count": hit_count, "confidence": next_conf}],
            )
            log_stage(
                "SQL_MEMORY",
                f"confidence {current_conf:.2f} → {next_conf:.2f} (hits={hit_count})"
            )
        except Exception as exc:
            logger.warning("_increment_hit failed %s: %s", pattern_id, exc)

    def _embed(self, text: str) -> Optional[List[float]]:
        """Sync — called via asyncio.to_thread() from async methods."""
        try:
            return self._model.encode([text])[0].tolist()
        except Exception as exc:
            logger.warning("SQLPatternMemory embedding failed: %s", exc)
            return None
"""
nlpLayer/pattern_memory.py
---------------------------
Stage 3 — Pattern Memory.

ChromaDB-backed hybrid retrieval cache.
Stores query SHAPES (structural patterns), not entity IDs.
On cache hit, fills the stored template with the current query's entities.

Key insight: REL|CG→S+S|D and REL|CG→S,CG→S|D look similar in vector
space but produce different tool arguments. Vector similarity alone is
insufficient — key comparison is mandatory.

Cache logic:
    vector match + key match    → exact hit, reuse stored tool_json
    vector match + key mismatch → shape reuse, fill template with new entities
    no vector match             → miss, LLM builds new tool_json, store pattern

Confidence ladder: 0.6 → 0.75 → 0.85 → 0.95 (increments on each successful use)
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple

from .chat_logger import log_stage
from api.models.nlp.nlplayer import (
    IntentSignal,
    PatternMemoryResult,
    PipelineError,
    PipelineStage,
    QueryShape,
    ResolvedEntities,
    ResolvedPair,
    ResolvedTriplet,
    TemporalRange,
)

logger = logging.getLogger(__name__)

# Minimum vector similarity to consider a candidate at all
_SIMILARITY_THRESHOLD = 0.85

# Confidence ladder steps
_CONFIDENCE_LADDER = [0.6, 0.75, 0.85, 0.95]

# ChromaDB collection name
_COLLECTION_NAME = "nlp_patterns"


class PatternMemory:
    """
    Hybrid retrieval cache backed by ChromaDB.

    Instantiate once at app startup with an embedding model.
    Call find() per request. Call store() after a successful LLM build.
    """

    def __init__(self, embedding_model, chroma_client=None, persist_directory: str = "chroma_db"):
        """
        Args:
            embedding_model: sentence-transformers compatible model.
            chroma_client:   Optional pre-built chromadb.Client. If None, one is created.
            persist_directory: Path for ChromaDB persistence.
        """
        self._embedding_model = embedding_model

        if chroma_client is None:
            try:
                import chromadb
                self._chroma = chromadb.PersistentClient(path=persist_directory)
            except ImportError:
                logger.warning(
                    "chromadb not installed — PatternMemory will operate in no-cache mode. "
                    "Run: pip install chromadb"
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

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def find(
        self,
        message: str,
        resolved: ResolvedEntities,
        temporal: TemporalRange,
    ) -> Optional[PatternMemoryResult]:
        """
        Search for a matching pattern.

        Returns PatternMemoryResult (hit=True) if a usable pattern is found.
        Returns None on cache miss (caller must build tool_json via LLM).
        """
        if not self._collection:
            log_stage("MEMORY", "ChromaDB unavailable → MISS")
            return None

        # Build canonical key for current query
        current_key = self._build_key(resolved)
        log_stage("KEY", current_key)

        # Embed message
        query_vec = self._embed(message)
        if query_vec is None:
            return None

        # Vector search — top 3 candidates filtered by intent
        try:
            results = self._collection.query(
                query_embeddings=[query_vec],
                n_results=3,
                where={"intent": resolved.intent},
                include=["metadatas", "distances", "documents"],
            )
        except Exception as exc:
            logger.warning("ChromaDB query failed: %s", exc)
            return None

        if not results["ids"] or not results["ids"][0]:
            log_stage("MEMORY", "no candidates found → MISS")
            return None

        # Evaluate top candidate
        candidate_id = results["ids"][0][0]
        candidate_distance = results["distances"][0][0]
        candidate_similarity = 1.0 - candidate_distance  # cosine distance → similarity
        candidate_meta = results["metadatas"][0][0]
        candidate_key = candidate_meta.get("key", "")
        candidate_tool_json_str = results["documents"][0][0]

        log_stage(
            "MEMORY",
            f"vector top={candidate_similarity:.3f} key={candidate_key}"
        )

        # Exact key match — cache hit
        if candidate_key == current_key:
            log_stage("MEMORY", f"key match → HIT confidence={candidate_meta.get('confidence', 0.6)}")
            try:
                tool_json = json.loads(candidate_tool_json_str)
                filled = self._fill_template(tool_json, resolved, temporal)
                self._update_confidence(candidate_id, candidate_meta)
                return PatternMemoryResult(
                    hit=True,
                    key=current_key,
                    tool_json=filled,
                    confidence=candidate_meta.get("confidence", 0.6),
                    was_shape_reuse=False,
                )
            except Exception as exc:
                logger.warning("Failed to fill exact cache hit: %s", exc)
                return None

        # Vector similar but key differs — shape reuse only if similarity is high enough
        if candidate_similarity >= _SIMILARITY_THRESHOLD:
            log_stage(
                "MEMORY",
                f"similarity={candidate_similarity:.3f} ≥ {_SIMILARITY_THRESHOLD} "
                f"but key={candidate_key} ≠ {current_key} → shape mismatch → MISS"
            )
            # The key mismatch means structural difference. Do not reuse.
            return None

        log_stage("MEMORY", f"similarity={candidate_similarity:.3f} < threshold → MISS")
        return None

    def store(
        self,
        message: str,
        resolved: ResolvedEntities,
        temporal: TemporalRange,
        tool_json: Dict[str, Any],
    ) -> None:
        """
        Store a newly built tool_json as a pattern.
        Called after a cache miss and successful LLM build.
        """
        if not self._collection:
            return

        key = self._build_key(resolved)
        pattern_id = str(uuid.uuid4())
        query_vec = self._embed(message)
        if query_vec is None:
            return

        metadata = {
            "key": key,
            "intent": resolved.intent,
            "confidence": _CONFIDENCE_LADDER[0],
            "success_count": 1,
            "component_ids": json.dumps(resolved.all_component_ids),
            "ship_ids": json.dumps(resolved.all_ship_ids),
            "sensor_ids": json.dumps(resolved.all_sensor_ids) if resolved.triplets else "[]",
        }

        try:
            self._collection.add(
                ids=[pattern_id],
                embeddings=[query_vec],
                documents=[json.dumps(tool_json)],
                metadatas=[metadata],
            )
            log_stage("MEMORY", f"stored new pattern key={key} id={pattern_id}")
        except Exception as exc:
            logger.warning("Failed to store pattern: %s", exc)

    # ------------------------------------------------------------------
    # Key builder
    # ------------------------------------------------------------------

    def _build_key(self, resolved: ResolvedEntities) -> str:
        """
        Build the canonical shape key for a ResolvedEntities object.
        Key captures STRUCTURE only — not entity IDs.
        """
        intent = resolved.intent

        if resolved.pairs:
            return self._key_from_pairs(intent, resolved.pairs)
        if resolved.triplets:
            return self._key_from_triplets(intent, resolved.triplets)

        return f"{intent}|GENERAL"

    def _key_from_pairs(self, intent: str, pairs: List[ResolvedPair]) -> str:
        """Derive shape key from a list of resolved pairs."""
        # Group by ship to understand structure
        ship_groups: Dict[str, List[ResolvedPair]] = {}
        for pair in pairs:
            ship_groups.setdefault(pair.ship_id, []).append(pair)

        num_ships = len(ship_groups)
        groups_per_ship = [len(v) for v in ship_groups.values()]
        total_components = len(pairs)

        prefix = intent  # RELIABILITY or RCM

        # All components — only one component per group per ship
        # (ALL_C = all components on a ship were requested)
        # We detect this by checking if count matches total catalog size — approximation:
        # In practice the LLM/linker sets a flag or we detect via "all" in raw query.
        # For now: use pair counts to derive shape.

        if num_ships == 1:
            ship_id = list(ship_groups.keys())[0]
            group = ship_groups[ship_id]
            n = len(group)
            if n == 1:
                shape = f"{prefix}|C→S|D" if prefix == "RELIABILITY" else f"{prefix}|C→S"
            else:
                shape = f"{prefix}|CG→S|D" if prefix == "RELIABILITY" else f"{prefix}|CG→S"
        else:
            # Multi-ship
            groups = list(ship_groups.values())
            if all(len(g) == 1 for g in groups):
                # One component per ship — compare by component_id across ships
                comp_ids = [g[0].component_id for g in groups]
                if len(set(comp_ids)) == 1:
                    # Same component on two ships
                    shape = f"{prefix}|C→S+S|D" if prefix == "RELIABILITY" else f"{prefix}|C→S+S"
                else:
                    shape = f"{prefix}|C→S,C→S|D" if prefix == "RELIABILITY" else f"{prefix}|C→S,C→S"
            else:
                # Multiple components per ship
                comp_type_sets = [
                    {p.component_id for p in g} for g in groups
                ]
                if comp_type_sets[0] == comp_type_sets[1] if len(comp_type_sets) > 1 else False:
                    shape = f"{prefix}|CG→S+S|D" if prefix == "RELIABILITY" else f"{prefix}|CG→S+S"
                else:
                    shape = f"{prefix}|CG→S,CG→S|D" if prefix == "RELIABILITY" else f"{prefix}|CG→S,CG→S"

        return shape

    def _key_from_triplets(self, intent: str, triplets: List[ResolvedTriplet]) -> str:
        """Derive shape key from a list of resolved triplets."""
        prefix = "SEN" if intent == "SENSOR" else "RUL"

        ship_groups: Dict[str, List[ResolvedTriplet]] = {}
        for t in triplets:
            ship_groups.setdefault(t.ship_id, []).append(t)

        num_ships = len(ship_groups)

        if num_ships == 1:
            ship_id = list(ship_groups.keys())[0]
            group = ship_groups[ship_id]
            comp_groups: Dict[str, List[ResolvedTriplet]] = {}
            for t in group:
                comp_groups.setdefault(t.component_id, []).append(t)

            num_comps = len(comp_groups)
            num_sensors = len(group)

            if num_comps == 1:
                comp_id = list(comp_groups.keys())[0]
                sensors_for_comp = comp_groups[comp_id]
                if len(sensors_for_comp) == 1:
                    return f"{prefix}|SN→C→S"
                else:
                    return f"{prefix}|ALL_SN→C→S"
            else:
                return f"{prefix}|ALL_SN→S"
        else:
            # Multi-ship
            return f"{prefix}|ALL_SN→S+S"

    # ------------------------------------------------------------------
    # Template filler
    # ------------------------------------------------------------------

    def _fill_template(
        self,
        template: Dict[str, Any],
        resolved: ResolvedEntities,
        temporal: TemporalRange,
    ) -> Dict[str, Any]:
        """
        Fill a cached tool_json template with the current query's entities.
        The template stores shape — we replace IDs and names with the current ones.
        """
        filled = json.loads(json.dumps(template))  # deep copy

        time_params = temporal.to_params()
        if "arguments" in filled:
            args = filled["arguments"]

            # Inject temporal params
            for k, v in time_params.items():
                args[k] = v

            # Inject pairs
            if resolved.pairs and "pairs" in args:
                args["pairs"] = [
                    {
                        "component_id": p.component_id,
                        "nomenclature": p.nomenclature,
                        "ship_id": p.ship_id,
                        "ship_name": p.ship_name,
                    }
                    for p in resolved.pairs
                ]

            # Inject triplets
            if resolved.triplets and "triplets" in args:
                args["triplets"] = [
                    {
                        "sensor_id": t.sensor_id,
                        "sensor_name": t.sensor_name,
                        "component_id": t.component_id,
                        "nomenclature": t.nomenclature,
                        "ship_id": t.ship_id,
                        "ship_name": t.ship_name,
                    }
                    for t in resolved.triplets
                ]

        return filled

    # ------------------------------------------------------------------
    # Confidence update
    # ------------------------------------------------------------------

    def _update_confidence(
        self, pattern_id: str, meta: Dict[str, Any]
    ) -> None:
        """Increment success_count and bump confidence to next ladder rung."""
        try:
            success_count = int(meta.get("success_count", 1)) + 1
            current_confidence = float(meta.get("confidence", 0.6))
            next_confidence = current_confidence
            for rung in _CONFIDENCE_LADDER:
                if rung > current_confidence:
                    next_confidence = rung
                    break

            self._collection.update(
                ids=[pattern_id],
                metadatas=[{
                    **meta,
                    "success_count": success_count,
                    "confidence": next_confidence,
                }],
            )
            log_stage("MEMORY", f"confidence updated: {current_confidence} → {next_confidence} (n={success_count})")
        except Exception as exc:
            logger.warning("Failed to update confidence for %s: %s", pattern_id, exc)

    # ------------------------------------------------------------------
    # Embedding helper
    # ------------------------------------------------------------------

    def _embed(self, text: str) -> Optional[List[float]]:
        """Embed a text string. Returns None on failure."""
        try:
            vec = self._embedding_model.encode([text])[0]
            return vec.tolist()
        except Exception as exc:
            logger.warning("Embedding failed for pattern memory: %s", exc)
            return None
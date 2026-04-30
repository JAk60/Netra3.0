"""
reliability/rcm.py
"""

import logging
from typing import Any, Dict, List

from api.models.nlp.nlplayer import ResolvedPair
from api.db.repos.reliability.rcm import RcmRepository
from api.db.connection import get_session_context

logger = logging.getLogger(__name__)


class RCMService:

    def __init__(self):
        pass  # no repo at construction — session created per-call

    async def get_rcm(self, pairs: List[ResolvedPair]) -> List[Dict[str, Any]]:
        logger.info("[RCM] %d pairs", len(pairs))

        component_ids   = [str(pair.component_id) for pair in pairs]
        rcm_records_map = await self._batch_fetch_rcm_records(component_ids)

        results = []
        for pair in pairs:
            comp_id = str(pair.component_id)
            if comp_id in rcm_records_map:
                record = rcm_records_map[comp_id].copy()
                record["nomenclature"]        = pair.nomenclature
                record["ship"]                = pair.ship_name
                # ── Backwards-compat aliases (old UI reads these) ──────────
                record["ship_id"]             = pair.ship_id
                record["component_name"]      = record.get("component_name") or pair.nomenclature
                record["parent_nomenclature"] = getattr(pair, "parent_nomenclature", None)
                results.append(record)
            else:
                logger.warning("[RCM] No record for component_id=%s (%s)", comp_id, pair.nomenclature)
                results.append({
                    "component_id":        comp_id,
                    "nomenclature":        pair.nomenclature,
                    "ship":                pair.ship_name,
                    # ── Backwards-compat aliases ───────────────────────────
                    "ship_id":             pair.ship_id,
                    "component_name":      pair.nomenclature,
                    "parent_nomenclature": getattr(pair, "parent_nomenclature", None),
                    "error":               "No RCM record found",
                })

        return results

    async def _batch_fetch_rcm_records(self, component_ids: List[str]) -> Dict[str, Any]:
        if not component_ids:
            return {}
        try:
            with get_session_context() as session:
                records = await RcmRepository(session).get_by_component_ids(component_ids)
        except Exception as exc:
            logger.error("[RCM] Batch fetch failed: %s", exc)
            return {}

        return {str(r.get("component_id")): r for r in records}
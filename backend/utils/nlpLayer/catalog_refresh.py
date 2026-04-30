"""
utils/nlpLayer/catalog_refresh.py
----------------------------------
Helpers for refreshing the EntityLinker catalogs after DB mutations.

Usage in a route handler:

    from fastapi import BackgroundTasks, Request
    from utils.nlpLayer.catalog_refresh import schedule_catalog_rebuild

    @router.post("/components", status_code=201)
    async def create_component(
        ...,
        request: Request,
        background_tasks: BackgroundTasks,
    ):
        result = await repo.create(component_data)
        schedule_catalog_rebuild(request, background_tasks)
        return result

The rebuild runs as a FastAPI BackgroundTask — the HTTP response is sent
immediately, and the catalog is refreshed in the background (typically
< 1 second).
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import BackgroundTasks, Request

logger = logging.getLogger(__name__)


async def _rebuild_catalogs(entity_linker) -> None:
    """Async helper that BackgroundTasks can schedule."""
    try:
        await entity_linker.rebuild_catalogs()
    except Exception:
        logger.exception("[catalog_refresh] Background catalog rebuild failed")


def schedule_catalog_rebuild(
    request: "Request",
    background_tasks: "BackgroundTasks",
) -> None:
    """
    Schedule an EntityLinker catalog rebuild as a background task.

    Reads entity_linker from ``request.app.state``.  If the linker is
    not available (pipeline failed to initialise), the call is silently
    skipped — the chat endpoint will already return 503 in that case.
    """
    entity_linker = getattr(request.app.state, "entity_linker", None)
    if entity_linker is None:
        logger.debug(
            "[catalog_refresh] entity_linker not on app.state — skipping rebuild"
        )
        return

    background_tasks.add_task(_rebuild_catalogs, entity_linker)
    logger.info("[catalog_refresh] Catalog rebuild scheduled")

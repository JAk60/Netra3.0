import logging
import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
from sentence_transformers import SentenceTransformer
from api.db.schemaAwareSQL import initialize
from api.routes import ai, chat, sse_routes
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager

from api.routes.sensors import metadata, reading
from api.routes.sensors import failuremode
from api.routes.system import ship, utility, department, equipment
from api.routes.Reliability import config_routes, overhaul, reliability, calculation, monthly_utilization, eta_beta_calc
from api.routes.auth import auth, users
from api.routes.etl import jobs, logs, schedule, watchman
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from api.routes.etl import etl_components_endpoint
from api.routes.system import unregister_equipment
from api.routes.system import delete_specific_info
from api.routes.system import additional_info_tables
from api.db.dependencies import get_monthly_utilization_repository, get_overhaul_metadata_repo, get_overhaul_readings_repo, get_system_config_repository

from api.db.repos.system.sys_config import SystemConfigurationRepository
from api.db.repos.sensor.metadata import SensorRepository
from api.db.repos.reliability.alpha_beta import AlphaBetaRepository
from api.db.repos.reliability.assemblies.eta_beta import EtaBetaRepository
from api.db.repos.reliability.rcm import RcmRepository
from mcp.llm_service import LLMService
from utils.superuser import ensure_default_superuser

from api.routes.settings import settings_router
from api.db.repos.settings import SettingsRepository
from api.db.connection import get_session_context
from mcp.tools import build_available_tools, get_sql_tool   # ← added get_sql_tool

# ── nlpLayer pipeline imports ────────────────────────────────────────────────
from utils.nlpLayer import EntityLinker, TemporalResolver, PatternMemory
from mcp.llm import ChatOrchestrator, ToolOrchestrator
from reliabilty.relformulas import Reliability
from reliabilty.rcm import RCMService
from sensor.rul import RULCalculationService
from sensor.sensors import SensorReadingService


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # ===== STARTUP =====
    logger.info("=" * 70)
    logger.info("🚀 APPLICATION STARTING UP")
    logger.info("=" * 70)
    logger.info("Rate limiting: ENABLED")
    logger.info("Logging system: ACTIVE")
    logger.info("Account lockout: ENABLED")

    initialize()
    await ensure_default_superuser()

    with get_session_context() as session:
        SettingsRepository(session).seed_defaults()
    logger.info("✓ System settings seeded")

    # ── nlpLayer pipeline startup ────────────────────────────────────────────
    logger.info("Building nlpLayer pipeline...")

    try:
        # LLM service — Ollama wrapper, constructed once and shared
        llm_service = LLMService()

        # Repos for catalog build — open session once, extract repos
        with get_session_context() as session:
            system_repo = SystemConfigurationRepository(session)
            sensor_repo = SensorRepository(session)

        # Embedding model — shared by entity linker + pattern memory
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2", device="cuda")
        logger.info("✓ Embedding model loaded (all-MiniLM-L6-v2 on CUDA)")

        # Entity linker — builds instance/type/sensor in-memory catalogs from DB
        entity_linker = EntityLinker(embedding_model=embedding_model)
        await entity_linker.build_catalogs(system_repo, sensor_repo)
        logger.info("✓ Entity linker catalogs built")

        # Expose entity linker on app.state so route handlers can trigger
        # catalog rebuilds after equipment / sensor / ship mutations.
        app.state.entity_linker = entity_linker

        # Available tools — builds SQLTool (SQLGenerator + SQLPatternMemory)
        # Must be called before get_sql_tool()
        build_available_tools(llm_service, embedding_model)
        logger.info("✓ Available tools built (SQLTool ready)")

        # Pattern memory — ChromaDB, persists between restarts in ./chroma_db/
        pattern_memory = PatternMemory(
            embedding_model=embedding_model,
            persist_directory="chroma_db",
        )
        logger.info("✓ Pattern memory initialised")

        # Domain services
        tool_orchestrator = ToolOrchestrator(
            reliability_service=Reliability(
                alpha_beta_repo=AlphaBetaRepository(),
                eta_beta_repo=EtaBetaRepository(),
                utilization_repo=get_monthly_utilization_repository(),
                overhaul_metadata_repo=get_overhaul_metadata_repo(),
                overhaul_readings_repo=get_overhaul_readings_repo(),
            ),
            rcm_service=RCMService(),
            rul_service=RULCalculationService(),
            sensor_service=SensorReadingService(),
            sql_tool=get_sql_tool(),        # ← wired in; safe after build_available_tools()
        )

        # Store singleton on app.state — chat.py's get_orchestrator() reads from here
        app.state.orchestrator = ChatOrchestrator(
            llm_service=llm_service,
            entity_linker=entity_linker,
            temporal_resolver=TemporalResolver(),
            pattern_memory=pattern_memory,
            tool_orchestrator=tool_orchestrator,
        )
        logger.info("✓ ChatOrchestrator ready — nlpLayer pipeline active")

    except Exception as exc:
        logger.error("❌ nlpLayer startup failed: %s", exc, exc_info=True)
        app.state.orchestrator = None   # /chat returns 503 until fixed

    logger.info("=" * 70)
    logger.info("✓ APPLICATION READY")
    logger.info("=" * 70)

    yield

    # ===== SHUTDOWN =====
    logger.info("=" * 70)
    logger.info("🛑 APPLICATION SHUTTING DOWN")
    logger.info("=" * 70)


app = FastAPI(
    title="Netra_API",
    description="Naval Equipment Reliability Analyzer",
    version="1.0.0",
    lifespan=lifespan
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(additional_info_tables.router)
app.include_router(delete_specific_info.router, prefix="/api/v1")
app.include_router(unregister_equipment.router)
app.include_router(watchman.router)
app.include_router(etl_components_endpoint.router)
app.include_router(jobs.router)
app.include_router(logs.router)
app.include_router(schedule.router)
app.include_router(calculation.router)
app.include_router(eta_beta_calc.router)
app.include_router(monthly_utilization.router)
app.include_router(config_routes.mission_config_router)
app.include_router(overhaul.router)
app.include_router(config_routes.reliability_router)
app.include_router(auth.auth_router)
app.include_router(users.router)
app.include_router(settings_router)
app.include_router(ship.ship_router)
app.include_router(equipment.equipment_router)
app.include_router(department.department_router)
app.include_router(utility.systems_utility_router)
# app.include_router(ai.router, prefix="", tags=["AI"])
app.include_router(reliability.router, prefix="", tags=["Reliability"])
app.include_router(reliability.rcm_router)
app.include_router(metadata.router, prefix="/sensors", tags=["Sensor Metadata"])
app.include_router(reading.router, prefix="/sensors", tags=["Sensor Readings"])
app.include_router(failuremode.router, prefix="/sensors/failuremodes", tags=["failure modes"])
app.include_router(chat.router)
app.include_router(sse_routes.router, prefix="/analytics", tags=["Analytics"])


@app.get("/home")
def read_root():
    return {"message": "Welcome to Netra API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app", host="0.0.0.0", port=8000, reload=True)
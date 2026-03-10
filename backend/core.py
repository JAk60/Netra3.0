import logging
from api.db.schemaAwareSQL import initialize
from api.routes import ai, chat, sse_routes
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager

from api.routes.sensors import metadata, reading
from api.routes.sensors import failuremode
from api.routes.system import ship, utility, department, equipment
from api.routes.Reliability import config_routes, overhaul, reliability, calculation,monthly_utilization,eta_beta_calc
from api.routes.auth import auth, users
from api.routes.etl import jobs, logs, schedule, watchman
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from api.routes.etl import etl_components_endpoint
from api.routes.system import unregister_equipment
from api.routes.system import delete_specific_info
from api.routes.system import additional_info_tables
from utils.superuser import ensure_default_superuser

# Settings
from api.routes.settings import settings_router
from api.db.repos.settings import SettingsRepository
from api.db.connection import get_session_context


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # ===== STARTUP =====
    logger.info("=" * 70)
    logger.info("🚀 APPLICATION STARTING UP")
    logger.info("=" * 70)
    logger.info("Rate limiting: ENABLED")
    logger.info("Logging system: ACTIVE")
    logger.info("Account lockout: ENABLED")

    # Your existing initialization
    initialize()  # Your existing schema + agent init

    # Create default superuser
    await ensure_default_superuser()

    # Seed system settings (creates singleton row if not exists)
    with get_session_context() as session:
        SettingsRepository(session).seed_defaults()
    logger.info("✓ System settings seeded")

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
app.include_router(ai.router, prefix="", tags=["AI"])
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
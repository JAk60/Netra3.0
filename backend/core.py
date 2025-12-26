from api.db.schemaAwareSQL import initialize
from api.routes import ai, chat,sse_routes
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager

from api.routes.sensors import metadata, reading
from api.routes.sensors import failuremode
from api.routes.system import ship, utility, department,equipment
from api.routes.Reliability import config_routes, overhaul, reliability,calculation
from api.routes.auth import auth, users
from api.routes.etl import jobs, logs, schedule




@asynccontextmanager
async def lifespan(app: FastAPI):
   
    # await startup_database()

    # Proper schema + agent init
    initialize()  

    yield

    # await shutdown_database()

app = FastAPI(
    title="Netra_API",
    description="Naval Equipment Reliability Analyzer",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(jobs.router)
app.include_router(logs.router)
app.include_router(schedule.router)
app.include_router(calculation.router)
app.include_router(config_routes.mission_config_router)
app.include_router(overhaul.router)
app.include_router(config_routes.reliability_router)
app.include_router(auth.auth_router)
app.include_router(users.router)
app.include_router(ship.ship_router)
app.include_router(equipment.equipment_router)
app.include_router(department.department_router)
app.include_router(utility.systems_utility_router)
app.include_router(ai.router, prefix="", tags=["AI"])
app.include_router(reliability.router, prefix="", tags=["Reliability"])
app.include_router(reliability.rcm_router)
# In your main app file
app.include_router(metadata.router, prefix="/sensors", tags=["Sensor Metadata"])
app.include_router(reading.router, prefix="/sensors", tags=["Sensor Readings"])
app.include_router(failuremode.router, prefix="/sensors", tags=["failure modes"])
app.include_router(chat.router)
app.include_router(sse_routes.router, prefix="/analytics", tags=["Analytics"])
# app.include_router(sensor.router)

@app.get("/home")
def read_root():
    return {"message": "Welcome to Netra API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app", host="0.0.0.0", port=8000, reload=True)

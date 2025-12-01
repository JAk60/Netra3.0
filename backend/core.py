from api.db.schemaAwareSQL import initialize
from api.routes import auth, users, system_configuration,ai, reliability,chat,sse_routes,config_routes,overhaul
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager

from api.routes.sensors import metadata, reading
from api.routes.sensors import failuremode



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
app.include_router(config_routes.mission_config_router)
app.include_router(overhaul.router)
app.include_router(config_routes.reliability_router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(system_configuration.router)
app.include_router(ai.router, prefix="", tags=["AI"])
app.include_router(reliability.router, prefix="", tags=["Reliability"])
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

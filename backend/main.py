from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.database import create_tables
from app.routers import processes, simulation, ai, history, admin
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Smart CPU Scheduler API...")
    create_tables()
    yield
    logger.info("Shutting down Smart CPU Scheduler API...")

app = FastAPI(
    title="Smart CPU Scheduler API",
    description="Intelligent CPU Scheduling Simulation and Optimization System",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()] if "*" not in cors_origins else ["*"],
    allow_credentials=True if "*" not in cors_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(processes.router, prefix="/api/processes", tags=["Processes"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Smart CPU Scheduler API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

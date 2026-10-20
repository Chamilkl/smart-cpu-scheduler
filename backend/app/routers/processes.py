from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import ProcessInput
import random

router = APIRouter()

@router.post("/validate")
def validate_processes(processes: List[ProcessInput]):
    """Validate a list of processes"""
    if len(processes) == 0:
        raise HTTPException(status_code=400, detail="At least 1 process required")
    if len(processes) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 processes allowed")
    pids = [p.pid for p in processes]
    if len(pids) != len(set(pids)):
        raise HTTPException(status_code=400, detail="Process IDs must be unique")
    return {"valid": True, "count": len(processes)}

@router.get("/generate-sample")
def generate_sample(n: int = 5, seed: int = None):
    """Generate sample process data for testing"""
    if seed:
        random.seed(seed)
    processes = []
    arrival = 0
    for i in range(n):
        processes.append({
            "pid": f"P{i+1}",
            "arrival_time": arrival,
            "burst_time": random.randint(1, 20),
            "priority": random.randint(1, 5)
        })
        arrival += random.randint(0, 4)
    return {"processes": processes}

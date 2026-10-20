from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas import AIRecommendRequest, AIRecommendResponse
from app.simulation.base import Process
from app.ai.recommender import recommend_algorithm
from app.simulation.fcfs import simulate_fcfs
from app.simulation.sjf import simulate_sjf
from app.simulation.round_robin import simulate_rr
from app.simulation.metrics import calculate_metrics
from app.simulation import ALGORITHM_MAP
from copy import deepcopy

router = APIRouter()

@router.post("/recommend", response_model=AIRecommendResponse)
def get_recommendation(request: AIRecommendRequest):
    processes = [
        Process(pid=p.pid, arrival_time=p.arrival_time, burst_time=p.burst_time, priority=p.priority)
        for p in request.processes
    ]
    result = recommend_algorithm(processes, request.optimize_for)
    
    # Quick comparison preview
    comparison_preview = {}
    for algo in ["FCFS", "SJF", "RR", result["recommended_algorithm"]]:
        try:
            procs = deepcopy(processes)
            if algo == "RR":
                gantt, total_time = simulate_rr(procs, 3)
            else:
                func = ALGORITHM_MAP.get(algo)
                if not func:
                    continue
                gantt, total_time = func(procs)
            m = calculate_metrics(procs, gantt, total_time)
            comparison_preview[algo] = {
                "avg_waiting_time": m["avg_waiting_time"],
                "avg_turnaround_time": m["avg_turnaround_time"],
            }
        except Exception:
            pass

    return AIRecommendResponse(
        recommended_algorithm=result["recommended_algorithm"],
        confidence=result["confidence"],
        reasoning=result["reasoning"],
        features=result["features"],
        alternative=result.get("alternative"),
        comparison_preview=comparison_preview,
    )

@router.post("/train")
def train_model_endpoint(background_tasks: BackgroundTasks):
    """Trigger ML model training in background"""
    from app.ai.trainer import train_model
    background_tasks.add_task(train_model, 500)
    return {"message": "Model training started in background. This may take a few minutes."}

@router.get("/model-status")
def model_status():
    import os
    from app.ai.recommender import MODEL_PATH
    exists = os.path.exists(MODEL_PATH)
    return {"model_trained": exists, "model_path": MODEL_PATH if exists else None}

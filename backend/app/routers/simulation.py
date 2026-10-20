from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from copy import deepcopy
from typing import List
import uuid

from app.database import get_db
from app.schemas import SimulationRequest, SimulationResult, CompareRequest, ProcessResult, Metrics, GanttEntry
from app.simulation import ALGORITHM_MAP, calculate_metrics, assign_colors
from app.simulation.base import Process
from app.simulation.round_robin import simulate_rr
from app.ai.aics import run_aics
from app.models import SimulationHistory

router = APIRouter()

def build_processes(req_processes) -> List[Process]:
    return [
        Process(
            pid=p.pid,
            arrival_time=p.arrival_time,
            burst_time=p.burst_time,
            priority=p.priority,
        )
        for p in req_processes
    ]

@router.post("/run", response_model=SimulationResult)
def run_simulation(request: SimulationRequest, db: Session = Depends(get_db)):
    processes = build_processes(request.processes)
    algo = request.algorithm
    aics_decision = None

    if algo == "AICS":
        result = run_aics(processes, request.time_quantum or 2)
        gantt_colored = result["gantt"]
        procs = result["procs"]
        metrics_dict = result["metrics"]
        aics_decision = result["decision"]
    elif algo == "RR":
        procs = deepcopy(processes)
        gantt, total_time = simulate_rr(procs, request.time_quantum or 2)
        metrics_dict = calculate_metrics(procs, gantt, total_time)
        gantt_colored = assign_colors(gantt)
    else:
        func = ALGORITHM_MAP.get(algo)
        if not func:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm: {algo}")
        procs = deepcopy(processes)
        gantt, total_time = func(procs)
        metrics_dict = calculate_metrics(procs, gantt, total_time)
        gantt_colored = assign_colors(gantt)

    process_results = []
    pid_map = {p.pid: p for p in procs}
    for orig in processes:
        p = pid_map.get(orig.pid, orig)
        tat = p.completion_time - orig.arrival_time
        wt = max(0, tat - orig.burst_time)
        rt = max(0, p.start_time - orig.arrival_time) if p.start_time >= 0 else 0
        process_results.append(ProcessResult(
            pid=p.pid,
            arrival_time=orig.arrival_time,
            burst_time=orig.burst_time,
            priority=orig.priority,
            completion_time=p.completion_time,
            turnaround_time=tat,
            waiting_time=wt,
            response_time=rt,
        ))

    # Save history
    session_id = request.session_id or str(uuid.uuid4())
    try:
        history = SimulationHistory(
            session_id=session_id,
            algorithm=algo,
            processes_input=[p.model_dump() if hasattr(p, 'model_dump') else p.dict() for p in request.processes],
            parameters={"time_quantum": request.time_quantum},
            results={"gantt": gantt_colored, "process_results": [r.model_dump() if hasattr(r, 'model_dump') else r.dict() for r in process_results]},
            metrics=metrics_dict,
        )
        db.add(history)
        db.commit()
    except Exception as e:
        db.rollback()

    return SimulationResult(
        algorithm=algo,
        gantt_chart=[GanttEntry(**g) for g in gantt_colored],
        process_results=process_results,
        metrics=Metrics(**metrics_dict),
        aics_decision=aics_decision,
    )

@router.post("/compare")
def compare_algorithms(request: CompareRequest, db: Session = Depends(get_db)):
    """Run all specified algorithms on the same process set and compare"""
    results = {}
    for algo in request.algorithms:
        processes = build_processes(request.processes)
        if algo == "RR":
            procs = deepcopy(processes)
            gantt, total_time = simulate_rr(procs, request.time_quantum or 2)
        elif algo == "AICS":
            aics_result = run_aics(processes, request.time_quantum or 2)
            results["AICS"] = {
                "metrics": aics_result["metrics"],
                "selected_policy": aics_result["decision"]["selected_policy"],
            }
            continue
        else:
            func = ALGORITHM_MAP.get(algo)
            if not func:
                continue
            procs = deepcopy(processes)
            gantt, total_time = func(procs)
        
        metrics = calculate_metrics(procs, gantt, total_time)
        results[algo] = {"metrics": metrics}

    return {"processes_count": len(request.processes), "comparison": results}

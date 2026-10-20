from typing import List, Tuple
from app.simulation.base import Process, GanttSlot

def simulate_fcfs(processes: List[Process]) -> Tuple[List[GanttSlot], int]:
    """First Come First Served (Non-preemptive)"""
    procs = sorted(processes, key=lambda p: (p.arrival_time, p.pid))
    gantt: List[GanttSlot] = []
    current_time = 0

    for p in procs:
        if current_time < p.arrival_time:
            gantt.append(GanttSlot(pid="IDLE", start=current_time, end=p.arrival_time))
            current_time = p.arrival_time
        p.start_time = current_time
        p.response_time = current_time - p.arrival_time
        gantt.append(GanttSlot(pid=p.pid, start=current_time, end=current_time + p.burst_time))
        current_time += p.burst_time
        p.completion_time = current_time

    return gantt, current_time

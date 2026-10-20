from typing import List, Tuple
from app.simulation.base import Process, GanttSlot

def simulate_priority(processes: List[Process]) -> Tuple[List[GanttSlot], int]:
    """Priority Scheduling (Non-preemptive, lower number = higher priority)"""
    procs = [p for p in processes]
    gantt: List[GanttSlot] = []
    current_time = 0
    completed = set()

    while len(completed) < len(procs):
        available = [
            p for p in procs
            if p.pid not in completed and p.arrival_time <= current_time
        ]
        if not available:
            next_arrival = min(p.arrival_time for p in procs if p.pid not in completed)
            gantt.append(GanttSlot(pid="IDLE", start=current_time, end=next_arrival))
            current_time = next_arrival
            continue

        # Lower priority number = higher priority; tie-break by arrival then pid
        p = min(available, key=lambda x: (x.priority, x.arrival_time, x.pid))
        p.start_time = current_time
        p.response_time = current_time - p.arrival_time
        gantt.append(GanttSlot(pid=p.pid, start=current_time, end=current_time + p.burst_time))
        current_time += p.burst_time
        p.completion_time = current_time
        completed.add(p.pid)

    return gantt, current_time

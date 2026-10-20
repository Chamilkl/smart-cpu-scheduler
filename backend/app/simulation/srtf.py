from typing import List, Tuple
from copy import deepcopy
from app.simulation.base import Process, GanttSlot

def simulate_srtf(processes: List[Process]) -> Tuple[List[GanttSlot], int]:
    """Shortest Remaining Time First (Preemptive SJF)"""
    procs = deepcopy(processes)
    for p in procs:
        p.remaining_time = p.burst_time

    gantt: List[GanttSlot] = []
    current_time = 0
    completed = 0
    n = len(procs)
    prev_pid = None

    max_time = sum(p.burst_time for p in procs) + max(p.arrival_time for p in procs) + 1

    while completed < n and current_time <= max_time:
        available = [p for p in procs if p.arrival_time <= current_time and p.remaining_time > 0]
        if not available:
            next_t = min((p.arrival_time for p in procs if p.remaining_time > 0), default=current_time + 1)
            gantt.append(GanttSlot(pid="IDLE", start=current_time, end=next_t))
            current_time = next_t
            prev_pid = None
            continue

        p = min(available, key=lambda x: (x.remaining_time, x.arrival_time, x.pid))
        if p.start_time == -1:
            p.start_time = current_time
            p.response_time = current_time - p.arrival_time

        if gantt and gantt[-1].pid == p.pid:
            gantt[-1].end += 1
        else:
            gantt.append(GanttSlot(pid=p.pid, start=current_time, end=current_time + 1))

        p.remaining_time -= 1
        current_time += 1

        if p.remaining_time == 0:
            p.completion_time = current_time
            completed += 1

    # Sync back to original processes by pid
    pid_map = {p.pid: p for p in procs}
    for orig in processes:
        src = pid_map[orig.pid]
        orig.completion_time = src.completion_time
        orig.start_time = src.start_time
        orig.response_time = src.response_time
        orig.remaining_time = src.remaining_time

    return gantt, current_time

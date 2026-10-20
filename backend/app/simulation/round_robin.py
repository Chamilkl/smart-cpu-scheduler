from typing import List, Tuple
from collections import deque
from copy import deepcopy
from app.simulation.base import Process, GanttSlot

def simulate_rr(processes: List[Process], time_quantum: int = 2) -> Tuple[List[GanttSlot], int]:
    """Round Robin"""
    procs = deepcopy(processes)
    for p in procs:
        p.remaining_time = p.burst_time

    gantt: List[GanttSlot] = []
    current_time = 0
    queue: deque = deque()
    arrived = set()
    completed = 0
    n = len(procs)
    sorted_procs = sorted(procs, key=lambda x: x.arrival_time)

    # Add processes that arrive at time 0
    for p in sorted_procs:
        if p.arrival_time <= current_time and p.pid not in arrived:
            queue.append(p)
            arrived.add(p.pid)

    while completed < n:
        if not queue:
            next_arrival = min(p.arrival_time for p in procs if p.pid not in arrived)
            gantt.append(GanttSlot(pid="IDLE", start=current_time, end=next_arrival))
            current_time = next_arrival
            for p in sorted_procs:
                if p.arrival_time <= current_time and p.pid not in arrived:
                    queue.append(p)
                    arrived.add(p.pid)
            continue

        p = queue.popleft()
        if p.start_time == -1:
            p.start_time = current_time
            p.response_time = current_time - p.arrival_time

        exec_time = min(time_quantum, p.remaining_time)
        gantt.append(GanttSlot(pid=p.pid, start=current_time, end=current_time + exec_time))
        p.remaining_time -= exec_time
        current_time += exec_time

        # Enqueue newly arrived processes
        for sp in sorted_procs:
            if sp.arrival_time <= current_time and sp.pid not in arrived:
                queue.append(sp)
                arrived.add(sp.pid)

        if p.remaining_time == 0:
            p.completion_time = current_time
            completed += 1
        else:
            queue.append(p)

    # Sync back
    pid_map = {p.pid: p for p in procs}
    for orig in processes:
        src = pid_map[orig.pid]
        orig.completion_time = src.completion_time
        orig.start_time = src.start_time
        orig.response_time = src.response_time
        orig.remaining_time = src.remaining_time

    return gantt, current_time

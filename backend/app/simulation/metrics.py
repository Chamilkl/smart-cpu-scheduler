from typing import List, Dict, Any
from app.simulation.base import Process, GanttSlot

PROCESS_COLORS = [
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6",
    "#06b6d4", "#10b981", "#84cc16", "#f59e0b", "#e11d48"
]

def assign_colors(gantt: List[GanttSlot]) -> List[Dict]:
    pid_colors = {}
    color_idx = 0
    result = []
    for slot in gantt:
        if slot.pid not in pid_colors and slot.pid != "IDLE":
            pid_colors[slot.pid] = PROCESS_COLORS[color_idx % len(PROCESS_COLORS)]
            color_idx += 1
        result.append({
            "pid": slot.pid,
            "start": slot.start,
            "end": slot.end,
            "color": pid_colors.get(slot.pid, "#9ca3af"),
        })
    return result

def calculate_metrics(processes: List[Process], gantt: List[GanttSlot], total_time: int) -> Dict[str, Any]:
    n = len(processes)
    if n == 0:
        return {}
    
    for p in processes:
        p.turnaround_time = p.completion_time - p.arrival_time
        p.waiting_time = p.turnaround_time - p.burst_time
        p.response_time = p.start_time - p.arrival_time if p.start_time >= 0 else 0
        # Clamp negatives from rounding/edge cases
        p.waiting_time = max(0, p.waiting_time)
        p.response_time = max(0, p.response_time)

    busy_time = sum(s.end - s.start for s in gantt if s.pid != "IDLE")
    context_switches = sum(
        1 for i in range(1, len(gantt))
        if gantt[i].pid != gantt[i-1].pid and gantt[i].pid != "IDLE" and gantt[i-1].pid != "IDLE"
    )

    return {
        "avg_waiting_time": round(sum(p.waiting_time for p in processes) / n, 4),
        "avg_turnaround_time": round(sum(p.turnaround_time for p in processes) / n, 4),
        "avg_response_time": round(sum(p.response_time for p in processes) / n, 4),
        "cpu_utilization": round((busy_time / total_time * 100) if total_time > 0 else 100.0, 4),
        "throughput": round(n / total_time, 6) if total_time > 0 else 0.0,
        "context_switches": context_switches,
        "total_time": total_time,
    }

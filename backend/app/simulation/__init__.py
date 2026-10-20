from app.simulation.fcfs import simulate_fcfs
from app.simulation.sjf import simulate_sjf
from app.simulation.srtf import simulate_srtf
from app.simulation.round_robin import simulate_rr
from app.simulation.priority import simulate_priority
from app.simulation.metrics import calculate_metrics, assign_colors
from app.simulation.base import Process, GanttSlot

ALGORITHM_MAP = {
    "FCFS": simulate_fcfs,
    "SJF": simulate_sjf,
    "SRTF": simulate_srtf,
    "RR": simulate_rr,
    "PRIORITY": simulate_priority,
}

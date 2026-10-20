"""
AICS: Adaptive Intelligent CPU Scheduler

An adaptive scheduling algorithm that analyzes workload characteristics
and selects/configures the most appropriate scheduling policy dynamically.
"""
from typing import List, Dict, Any, Tuple
from copy import deepcopy
from app.simulation.base import Process, GanttSlot
from app.simulation.fcfs import simulate_fcfs
from app.simulation.sjf import simulate_sjf
from app.simulation.srtf import simulate_srtf
from app.simulation.round_robin import simulate_rr
from app.simulation.priority import simulate_priority
from app.simulation.metrics import calculate_metrics, assign_colors
from app.ai.feature_extractor import extract_features

class WorkloadAnalyzer:
    """Analyzes workload characteristics"""
    
    @staticmethod
    def analyze(processes: List[Process]) -> Dict[str, Any]:
        return extract_features(processes)

class SchedulingPolicySelector:
    """Selects policy based on workload analysis"""
    
    @staticmethod
    def select(features: Dict[str, Any]) -> Tuple[str, int, List[str]]:
        """
        Returns: (policy_name, time_quantum_if_rr, decision_reasons)
        """
        burst_cv = features["burst_cv"]
        priority_spread = features["priority_spread"]
        priority_unique = features["priority_unique"]
        all_arrive_together = features["all_arrive_together"]
        arrival_spread = features["arrival_spread"]
        short_ratio = features["short_ratio"]
        burst_mean = features["burst_mean"]
        n = features["n_processes"]

        decisions = []
        policy = "FCFS"
        tq = max(2, int(burst_mean * 0.4))

        decisions.append(f"Workload Analysis: {n} processes, burst CV={burst_cv:.2f}, priority levels={priority_unique}")

        # Decision tree for policy selection
        if priority_unique >= 3 and priority_spread > 1.5:
            policy = "PRIORITY"
            decisions.append("→ Significant priority differentiation detected. Selecting Priority Scheduling.")
        elif burst_cv > 0.75 and all_arrive_together:
            policy = "SJF"
            decisions.append(f"→ High burst variability (CV={burst_cv:.2f}) with batch arrival. Selecting SJF for minimum average wait.")
        elif burst_cv > 0.75 and not all_arrive_together:
            policy = "SRTF"
            decisions.append(f"→ High burst variability (CV={burst_cv:.2f}) with staggered arrivals. Selecting SRTF for optimal preemptive scheduling.")
        elif burst_cv < 0.3 and arrival_spread > 0.3:
            # Uniform bursts + mixed arrivals → RR is fair
            tq = max(2, int(burst_mean * 0.5))
            policy = "RR"
            decisions.append(f"→ Uniform burst times with mixed arrivals. Selecting Round Robin (TQ={tq}) for fairness.")
        elif short_ratio > 0.65:
            policy = "SJF"
            decisions.append(f"→ {short_ratio*100:.0f}% short jobs detected. Selecting SJF to minimize overall waiting time.")
        else:
            policy = "FCFS"
            decisions.append("→ General workload. Defaulting to FCFS for simplicity and predictability.")

        return policy, tq, decisions

class AdaptiveParameterController:
    """Fine-tunes parameters of selected policy"""
    
    @staticmethod
    def tune_rr_quantum(processes: List[Process], base_tq: int) -> Tuple[int, str]:
        import numpy as np
        burst_times = [p.burst_time for p in processes]
        p80 = np.percentile(burst_times, 80)
        # Heuristic: TQ ≈ 40% of 80th percentile burst
        tuned_tq = max(1, int(p80 * 0.4))
        reason = f"Time Quantum tuned to {tuned_tq} (≈40% of P80 burst time {p80:.1f})"
        return tuned_tq, reason

class PerformanceEvaluator:
    """Evaluates scheduling performance"""
    
    @staticmethod
    def evaluate(processes: List[Process], gantt: List[GanttSlot], total_time: int) -> Dict:
        return calculate_metrics(processes, gantt, total_time)

def run_aics(processes_input: List[Process], time_quantum: int = 2) -> Dict[str, Any]:
    """
    Main AICS entry point.
    Returns gantt, metrics, and full decision trace.
    """
    # Step 1: Analyze workload
    analyzer = WorkloadAnalyzer()
    features = analyzer.analyze(processes_input)

    # Step 2: Select policy
    selector = SchedulingPolicySelector()
    policy, base_tq, decisions = selector.select(features)

    # Step 3: Adapt parameters
    controller = AdaptiveParameterController()
    final_tq = base_tq
    tq_reason = None
    if policy == "RR":
        final_tq, tq_reason = controller.tune_rr_quantum(processes_input, base_tq)
        if tq_reason:
            decisions.append(tq_reason)

    # Step 4: Run simulation with selected policy
    procs = deepcopy(processes_input)
    algorithm_funcs = {
        "FCFS": lambda p: simulate_fcfs(p),
        "SJF": lambda p: simulate_sjf(p),
        "SRTF": lambda p: simulate_srtf(p),
        "RR": lambda p: simulate_rr(p, final_tq),
        "PRIORITY": lambda p: simulate_priority(p),
    }
    gantt, total_time = algorithm_funcs[policy](procs)

    # Step 5: Evaluate
    evaluator = PerformanceEvaluator()
    metrics = evaluator.evaluate(procs, gantt, total_time)

    # Step 6: Build gantt with colors
    gantt_colored = assign_colors(gantt)

    decision_trace = {
        "selected_policy": policy,
        "time_quantum_used": final_tq if policy == "RR" else None,
        "workload_features": features,
        "decision_steps": decisions,
        "components": [
            "WorkloadAnalyzer: extracted 14 workload features",
            f"SchedulingPolicySelector: evaluated rules → selected {policy}",
            "AdaptiveParameterController: tuned parameters" if tq_reason else "AdaptiveParameterController: no tuning needed",
            "PerformanceEvaluator: computed all metrics",
        ]
    }

    return {
        "gantt": gantt_colored,
        "procs": procs,
        "metrics": metrics,
        "decision": decision_trace,
        "total_time": total_time,
    }

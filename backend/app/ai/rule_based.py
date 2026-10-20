from typing import Dict, Any, List

def rule_based_recommend(features: Dict[str, Any], optimize_for: str = "waiting_time") -> Dict[str, Any]:
    """
    Rule-based algorithm recommendation.
    Returns recommended algorithm and reasoning.
    """
    n = features["n_processes"]
    burst_cv = features["burst_cv"]
    all_arrive_together = features["all_arrive_together"]
    short_ratio = features["short_ratio"]
    priority_spread = features["priority_spread"]
    priority_unique = features["priority_unique"]
    arrival_spread = features["arrival_spread"]

    reasons = []
    algorithm = "FCFS"
    confidence = 0.6

    # Rule 1: High priority diversity -> Priority Scheduling
    if priority_unique >= 3 and priority_spread > 1.5:
        algorithm = "PRIORITY"
        confidence = 0.75
        reasons.append(f"High priority diversity ({priority_unique} unique levels, std={priority_spread:.2f}) — Priority Scheduling handles urgency well")

    # Rule 2: Very high burst variation -> SJF/SRTF reduces waiting
    elif burst_cv > 0.8:
        if arrival_spread > 0.3:
            algorithm = "SRTF"
            confidence = 0.80
            reasons.append(f"High burst time variation (CV={burst_cv:.2f}) with staggered arrivals — SRTF minimizes average waiting time")
        else:
            algorithm = "SJF"
            confidence = 0.78
            reasons.append(f"High burst time variation (CV={burst_cv:.2f}) — SJF minimizes waiting time for batch workloads")

    # Rule 3: Many short jobs -> SJF
    elif short_ratio > 0.7 and burst_cv > 0.4:
        algorithm = "SJF"
        confidence = 0.72
        reasons.append(f"Mostly short jobs ({short_ratio*100:.0f}%) — SJF gives shorter average waiting time")

    # Rule 4: Mixed/interactive workload -> Round Robin
    elif not all_arrive_together and arrival_spread > 0.2 and burst_cv < 0.6:
        algorithm = "RR"
        confidence = 0.70
        reasons.append(f"Mixed interactive workload with staggered arrivals — Round Robin ensures fairness and good response time")

    # Rule 5: All arrive together, uniform burst -> FCFS is fine
    elif all_arrive_together and burst_cv < 0.3:
        algorithm = "FCFS"
        confidence = 0.65
        reasons.append("Uniform burst times with simultaneous arrival — FCFS is simple and performs adequately")

    else:
        algorithm = "FCFS"
        confidence = 0.55
        reasons.append("General workload — FCFS provides predictable non-preemptive scheduling")

    # Optimize for override hints
    if optimize_for == "response_time" and algorithm not in ("RR", "SRTF"):
        reasons.append("For best response time, Round Robin is often preferred in interactive scenarios")
    elif optimize_for == "turnaround_time" and algorithm not in ("SJF", "SRTF"):
        reasons.append("For best turnaround time, SJF/SRTF typically outperform other algorithms")

    return {
        "algorithm": algorithm,
        "confidence": round(confidence, 4),
        "reasons": reasons,
    }

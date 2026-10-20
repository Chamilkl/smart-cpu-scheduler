from typing import List, Dict, Any
import numpy as np
from app.simulation.base import Process

def extract_features(processes: List[Process]) -> Dict[str, Any]:
    """Extract workload features for ML model and AICS"""
    n = len(processes)
    burst_times = np.array([p.burst_time for p in processes])
    arrival_times = np.array([p.arrival_time for p in processes])
    priorities = np.array([p.priority for p in processes])

    burst_std = float(np.std(burst_times))
    burst_mean = float(np.mean(burst_times))
    burst_cv = burst_std / burst_mean if burst_mean > 0 else 0  # Coefficient of Variation

    # Arrival pattern: 0=all same time, 1=spread out
    arrival_spread = float(np.std(arrival_times)) / (float(np.max(arrival_times)) + 1e-9)
    all_arrive_together = 1 if np.std(arrival_times) == 0 else 0

    # Short vs Long jobs (relative to mean)
    short_jobs = int(np.sum(burst_times <= burst_mean))
    long_jobs = n - short_jobs
    short_ratio = short_jobs / n

    # Priority diversity
    priority_unique = len(set(priorities))
    priority_spread = float(np.std(priorities))

    # Inter-arrival time
    sorted_arrivals = np.sort(arrival_times)
    inter_arrivals = np.diff(sorted_arrivals)
    avg_inter_arrival = float(np.mean(inter_arrivals)) if len(inter_arrivals) > 0 else 0.0

    return {
        "n_processes": n,
        "burst_mean": round(burst_mean, 4),
        "burst_std": round(burst_std, 4),
        "burst_min": int(np.min(burst_times)),
        "burst_max": int(np.max(burst_times)),
        "burst_cv": round(burst_cv, 4),
        "arrival_spread": round(arrival_spread, 4),
        "all_arrive_together": all_arrive_together,
        "short_ratio": round(short_ratio, 4),
        "long_ratio": round(1 - short_ratio, 4),
        "priority_unique": priority_unique,
        "priority_spread": round(priority_spread, 4),
        "avg_inter_arrival": round(avg_inter_arrival, 4),
        "total_burst": int(np.sum(burst_times)),
    }

def features_to_vector(features: Dict[str, Any]) -> List[float]:
    """Convert feature dict to numeric vector for ML"""
    return [
        features["n_processes"],
        features["burst_mean"],
        features["burst_std"],
        features["burst_cv"],
        features["arrival_spread"],
        features["all_arrive_together"],
        features["short_ratio"],
        features["priority_unique"],
        features["priority_spread"],
        features["avg_inter_arrival"],
    ]

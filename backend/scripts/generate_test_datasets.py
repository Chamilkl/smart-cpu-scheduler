"""
Test dataset generator.
Generates 100+ labeled test datasets for performance evaluation.
"""
import json
import os
import sys
from copy import deepcopy
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import numpy as np
from app.simulation.base import Process
from app.simulation.fcfs import simulate_fcfs
from app.simulation.sjf import simulate_sjf
from app.simulation.srtf import simulate_srtf
from app.simulation.round_robin import simulate_rr
from app.simulation.priority import simulate_priority
from app.simulation.metrics import calculate_metrics

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'test_datasets_100.json')
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)


def make_processes(n, seed, scenario='random'):
    rng = np.random.default_rng(seed)
    procs = []
    t = 0

    if scenario == 'uniform':
        # Uniform burst times
        for i in range(n):
            procs.append({'pid': f'P{i+1}', 'arrival_time': int(t), 'burst_time': int(rng.integers(4, 7)), 'priority': int(rng.integers(1, 6))})
            t += rng.integers(1, 4)
    elif scenario == 'mixed':
        # Mix of very short and very long
        for i in range(n):
            bt = int(rng.integers(1, 3)) if rng.random() < 0.6 else int(rng.integers(15, 30))
            procs.append({'pid': f'P{i+1}', 'arrival_time': int(t), 'burst_time': bt, 'priority': int(rng.integers(1, 6))})
            t += rng.integers(0, 3)
    elif scenario == 'batch':
        # All arrive at time 0
        for i in range(n):
            procs.append({'pid': f'P{i+1}', 'arrival_time': 0, 'burst_time': int(rng.integers(1, 20)), 'priority': int(rng.integers(1, 6))})
    elif scenario == 'priority_heavy':
        # High priority diversity
        for i in range(n):
            procs.append({'pid': f'P{i+1}', 'arrival_time': int(t), 'burst_time': int(rng.integers(3, 15)), 'priority': int(rng.integers(1, 10))})
            t += rng.integers(0, 5)
    else:
        # Random
        for i in range(n):
            procs.append({'pid': f'P{i+1}', 'arrival_time': int(t), 'burst_time': int(rng.integers(1, 25)), 'priority': int(rng.integers(1, 6))})
            t += rng.integers(0, 5)

    return procs


def simulate_all(procs_data):
    results = {}
    algorithms = {
        'FCFS': lambda p: simulate_fcfs(p),
        'SJF': lambda p: simulate_sjf(p),
        'SRTF': lambda p: simulate_srtf(p),
        'RR_TQ2': lambda p: simulate_rr(p, 2),
        'RR_TQ4': lambda p: simulate_rr(p, 4),
        'PRIORITY': lambda p: simulate_priority(p),
    }
    for name, func in algorithms.items():
        procs = [Process(pid=d['pid'], arrival_time=d['arrival_time'], burst_time=d['burst_time'], priority=d['priority']) for d in procs_data]
        gantt, total = func(procs)
        m = calculate_metrics(procs, gantt, total)
        results[name] = {
            'avg_waiting_time': m['avg_waiting_time'],
            'avg_turnaround_time': m['avg_turnaround_time'],
            'avg_response_time': m['avg_response_time'],
            'context_switches': m['context_switches'],
            'cpu_utilization': m['cpu_utilization'],
        }
    return results


def generate_datasets(n_datasets=100):
    scenarios = ['random', 'uniform', 'mixed', 'batch', 'priority_heavy']
    datasets = []
    per_scenario = n_datasets // len(scenarios)
    idx = 0

    for scenario in scenarios:
        for i in range(per_scenario):
            n_procs = np.random.randint(3, 12)
            procs = make_processes(n_procs, seed=idx * 100 + i, scenario=scenario)
            metrics = simulate_all(procs)
            best_wt = min(metrics, key=lambda k: metrics[k]['avg_waiting_time'])
            datasets.append({
                'id': idx,
                'scenario': scenario,
                'n_processes': n_procs,
                'processes': procs,
                'metrics': metrics,
                'best_algorithm_by_waiting_time': best_wt,
            })
            idx += 1

    # Fill remaining with random
    while len(datasets) < n_datasets:
        n_procs = np.random.randint(3, 15)
        procs = make_processes(n_procs, seed=idx * 7, scenario='random')
        metrics = simulate_all(procs)
        best_wt = min(metrics, key=lambda k: metrics[k]['avg_waiting_time'])
        datasets.append({
            'id': idx,
            'scenario': 'random',
            'n_processes': n_procs,
            'processes': procs,
            'metrics': metrics,
            'best_algorithm_by_waiting_time': best_wt,
        })
        idx += 1

    return datasets


if __name__ == '__main__':
    print(f"Generating 100 test datasets...")
    datasets = generate_datasets(100)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(datasets, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(datasets)} datasets to {OUTPUT_FILE}")

    # Print summary
    from collections import Counter
    best_counts = Counter(d['best_algorithm_by_waiting_time'] for d in datasets)
    print("\nBest algorithm distribution:")
    for algo, count in best_counts.most_common():
        print(f"  {algo}: {count} datasets")

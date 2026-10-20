"""
ML Model Trainer for CPU Scheduler Recommendation.
Generates synthetic training data by simulating all algorithms and
labeling each workload with the best-performing algorithm.
"""
import os
import numpy as np
import joblib
from copy import deepcopy
from typing import List, Dict
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from app.simulation.base import Process
from app.simulation.fcfs import simulate_fcfs
from app.simulation.sjf import simulate_sjf
from app.simulation.srtf import simulate_srtf
from app.simulation.round_robin import simulate_rr
from app.simulation.priority import simulate_priority
from app.simulation.metrics import calculate_metrics
from app.ai.feature_extractor import extract_features, features_to_vector

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "scheduler_model.joblib")
LABEL_PATH = os.path.join(MODEL_DIR, "label_encoder.joblib")

def generate_process_set(n: int, seed: int) -> List[Process]:
    rng = np.random.default_rng(seed)
    processes = []
    t = 0
    for i in range(n):
        arrival = t + rng.integers(0, 5)
        burst = int(rng.integers(1, 30))
        priority = int(rng.integers(1, 6))
        processes.append(Process(pid=f"P{i+1}", arrival_time=int(arrival), burst_time=burst, priority=priority))
        t = arrival
    return processes

def simulate_all(processes: List[Process]):
    results = {}
    algorithms = {
        "FCFS": lambda p: simulate_fcfs(p),
        "SJF": lambda p: simulate_sjf(p),
        "SRTF": lambda p: simulate_srtf(p),
        "RR": lambda p: simulate_rr(p, 3),
        "PRIORITY": lambda p: simulate_priority(p),
    }
    for name, func in algorithms.items():
        procs = deepcopy(processes)
        gantt, total_time = func(procs)
        m = calculate_metrics(procs, gantt, total_time)
        results[name] = m["avg_waiting_time"]
    return results

def generate_dataset(n_samples: int = 500):
    X, y = [], []
    for seed in range(n_samples):
        n_procs = np.random.randint(3, 15)
        processes = generate_process_set(n_procs, seed)
        features = extract_features(processes)
        wait_times = simulate_all(processes)
        best_algo = min(wait_times, key=wait_times.get)
        X.append(features_to_vector(features))
        y.append(best_algo)
    return np.array(X), np.array(y)

def train_model(n_samples: int = 500):
    print(f"Generating {n_samples} training samples...")
    X, y = generate_dataset(n_samples)
    
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, LABEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return model, le, acc

if __name__ == "__main__":
    train_model(500)

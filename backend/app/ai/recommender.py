import os
import joblib
import numpy as np
from typing import List, Dict, Any, Optional
from app.simulation.base import Process
from app.ai.feature_extractor import extract_features, features_to_vector
from app.ai.rule_based import rule_based_recommend

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "scheduler_model.joblib")
LABEL_PATH = os.path.join(os.path.dirname(__file__), "model", "label_encoder.joblib")

def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(LABEL_PATH):
        model = joblib.load(MODEL_PATH)
        le = joblib.load(LABEL_PATH)
        return model, le
    return None, None

def ml_recommend(features: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """ML-based recommendation using trained model"""
    model, le = load_model()
    if model is None:
        return None
    
    feature_vector = np.array([features_to_vector(features)])
    probs = model.predict_proba(feature_vector)[0]
    pred_idx = np.argmax(probs)
    algorithm = le.inverse_transform([pred_idx])[0]
    confidence = float(probs[pred_idx])
    
    return {"algorithm": algorithm, "confidence": round(confidence, 4)}

def recommend_algorithm(processes: List[Process], optimize_for: str = "waiting_time") -> Dict[str, Any]:
    """Main recommendation function: ML + rule-based hybrid"""
    features = extract_features(processes)
    rule_result = rule_based_recommend(features, optimize_for)
    ml_result = ml_recommend(features)

    # Hybrid: prefer ML if confident, else use rule-based
    if ml_result and ml_result["confidence"] >= 0.65:
        algorithm = ml_result["algorithm"]
        confidence = ml_result["confidence"]
        method = "ml"
        reasons = rule_result["reasons"] + [f"ML model (Random Forest) agrees with confidence {confidence:.0%}"]
    else:
        algorithm = rule_result["algorithm"]
        confidence = rule_result["confidence"]
        method = "rule"
        reasons = rule_result["reasons"]
        if ml_result:
            reasons.append(f"ML model suggests {ml_result['algorithm']} (confidence {ml_result['confidence']:.0%}) — insufficient confidence to override rules")

    return {
        "recommended_algorithm": algorithm,
        "confidence": confidence,
        "reasoning": reasons,
        "features": features,
        "method": method,
        "alternative": ml_result["algorithm"] if ml_result and ml_result["algorithm"] != algorithm else rule_result["algorithm"],
    }

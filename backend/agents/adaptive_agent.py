import os
import time
import json
import numpy as np
from sklearn.ensemble import IsolationForest
from base_agent import BaseAgent
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai.gemini_service import analyze_security_event
from collections import deque

class AdaptiveAgent(BaseAgent):
    def __init__(self):
        super().__init__("adaptive_agent", "ADAPTIVE_AGENT_KEY")
        
        # Scikit-learn anomaly detection model
        # We use IsolationForest which is good for unsupervised anomaly detection
        self.model = IsolationForest(contamination=0.05, random_state=42)
        
        # We need to maintain a history of events to train on and compute features
        self.training_buffer = deque(maxlen=1000)
        self.is_fitted = False
        
        # For feature engineering, we'll keep track of simple metrics over time per IP
        self.ip_features = {}
        
    def extract_features(self, event: dict) -> list:
        """
        Convert an event into a numerical feature vector.
        Features:
        1. Query length (if present)
        2. Size MB (if present)
        3. Event type encoded (simple numerical mapping)
        """
        features = [0, 0, 0] # Default
        
        event_type = event.get('event_type')
        if event_type == 'login_attempt':
            features[2] = 1
        elif event_type == 'data_access':
            features[2] = 2
            query = event.get('query', '')
            features[0] = len(query)
        elif event_type == 'data_export':
            features[2] = 3
            features[1] = event.get('size_mb', 0)
            
        return features

    def analyze_event(self, event: dict):
        features = self.extract_features(event)
        
        if not self.is_fitted:
            # Accumulate data until we have enough to train
            self.training_buffer.append(features)
            if len(self.training_buffer) >= 100: # Need some minimum sample size
                self.log(f"Fitting initial Isolation Forest model with {len(self.training_buffer)} samples...")
                X = np.array(list(self.training_buffer))
                self.model.fit(X)
                self.is_fitted = True
            return
            
        # If model is fitted, predict anomaly
        # Return value -1 for outliers and 1 for inliers.
        X_test = np.array([features])
        prediction = self.model.predict(X_test)[0]
        
        if prediction == -1:
            # Anomaly detected!
            score = self.model.decision_function(X_test)[0] # How anomalous? Negative is more anomalous
            
            # AI Intelligence: Use Gemini to classify the anomaly
            # This turns raw "anomaly detected" into "Brute Force", "DDoS", etc.
            ai_insight = analyze_security_event({
                "agent": self.agent_name,
                "event_type": "raw_behavioral_anomaly",
                "original_telemetry": event,
                "anomaly_score": score
            })
            
            attack_type = ai_insight.get("attack_type", "behavioral_anomaly")
            severity = ai_insight.get("severity", "high" if score < -0.1 else "medium")

            self.log(f"AI Classification: {attack_type} (Confidence Score: {score})")

            self.send_alert(
                event=attack_type,
                severity=severity,
                ip=event.get('ip', 'unknown'),
                details={
                    "anomaly_score": round(float(score), 4),
                    "ai_classification": attack_type,
                    "original_event_type": event.get('event_type'),
                    "ai_recommendation": ai_insight.get("recommended_action")
                }
            )
            
        # Continuous learning:
        # Occasionally update the model with new data
        self.training_buffer.append(features)
        if len(self.training_buffer) == self.training_buffer.maxlen:
            # Retrain model (in a real scenario, do this asynchronously or less frequently)
            X = np.array(list(self.training_buffer))
            self.model.fit(X)

if __name__ == "__main__":
    agent = AdaptiveAgent()
    agent.log("Started. Listening to telemetry...")
    time.sleep(2)
    for event in agent.tail_telemetry():
        agent.analyze_event(event)

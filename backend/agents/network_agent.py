import os
import time
from base_agent import BaseAgent
from collections import defaultdict

class NetworkAgent(BaseAgent):
    def __init__(self):
        super().__init__("network_agent", "NETWORK_AGENT_KEY")
        self.ip_request_counts = defaultdict(list)
        self.RATE_LIMIT_THRESHOLD = 20 # requests per 10 seconds
        
    def analyze_event(self, event: dict):
        if 'ip' not in event:
            return
            
        ip = event['ip']
        current_time = time.time()
        
        # Clean up old requests
        self.ip_request_counts[ip] = [t for t in self.ip_request_counts[ip] if current_time - t < 10]
        
        # Add new request
        self.ip_request_counts[ip].append(current_time)
        
        if len(self.ip_request_counts[ip]) > self.RATE_LIMIT_THRESHOLD:
            # We detected a spike!
            self.send_alert(
                event="rate_spike_detected",
                severity="high",
                ip=ip,
                details={"requests_per_10s": len(self.ip_request_counts[ip])}
            )
            # Prevent spamming alerts for the same IP
            self.ip_request_counts[ip] = []

if __name__ == "__main__":
    agent = NetworkAgent()
    agent.log("Started. Listening to telemetry...")
    # Add a delay for the backend to create the log file if it's new
    time.sleep(2)
    for event in agent.tail_telemetry():
        agent.analyze_event(event)

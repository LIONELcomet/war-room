import os
import time
from base_agent import BaseAgent
from collections import defaultdict

class IdentityAgent(BaseAgent):
    def __init__(self):
        super().__init__("identity_agent", "IDENTITY_AGENT_KEY")
        self.failed_logins = defaultdict(list)
        self.BRUTE_FORCE_THRESHOLD = 5 # failures per 10 seconds
        
    def analyze_event(self, event: dict):
        if event.get('event_type') != 'login_attempt':
            return
            
        username = event.get('username')
        ip = event.get('ip')
        status = event.get('status')
        current_time = time.time()
        
        if status == 'failure':
            self.failed_logins[username] = [t for t in self.failed_logins[username] if current_time - t < 10]
            self.failed_logins[username].append(current_time)
            
            if len(self.failed_logins[username]) >= self.BRUTE_FORCE_THRESHOLD:
                self.send_alert(
                    event="brute_force_detected",
                    severity="high",
                    ip=ip,
                    details={"username": username, "failures_per_10s": len(self.failed_logins[username])}
                )
                self.failed_logins[username] = []
        elif status == 'success':
            # Clear failures on success
            if username in self.failed_logins:
                del self.failed_logins[username]

if __name__ == "__main__":
    agent = IdentityAgent()
    agent.log("Started. Listening to telemetry...")
    time.sleep(2)
    for event in agent.tail_telemetry():
        agent.analyze_event(event)

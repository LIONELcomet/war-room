import os
import time
from base_agent import BaseAgent

class InfraAgent(BaseAgent):
    def __init__(self):
        super().__init__("infra_agent", "INFRA_AGENT_KEY")
        
        # In a real scenario, this would monitor os logs (syslog, auth.log, dmesg)
        # For this simulation, we'll watch for specific "infrastructure" events 
        # that might be injected into our telemetry stream by our attack scripts
        
    def analyze_event(self, event: dict):
        event_type = event.get('event_type')
        
        if event_type == 'root_access_attempt':
            self.send_alert(
                event="root_access_attempt",
                severity="critical",
                ip=event.get('ip', 'unknown'),
                details={"user": event.get('user', 'unknown')}
            )
        elif event_type == 'suspicious_process':
            self.send_alert(
                event="suspicious_process_detected",
                severity="high",
                ip=event.get('ip', 'unknown'),
                details={"process_name": event.get('process_name', 'unknown')}
            )
        elif event_type == 'container_escape_attempt':
            self.send_alert(
                event="container_escape_simulation",
                severity="critical",
                ip=event.get('ip', 'unknown'),
                details={"method": event.get('method', 'unknown')}
            )

if __name__ == "__main__":
    agent = InfraAgent()
    agent.log("Started. Listening to telemetry...")
    time.sleep(2)
    for event in agent.tail_telemetry():
        agent.analyze_event(event)

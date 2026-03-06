import os
import time
from base_agent import BaseAgent

class DataAgent(BaseAgent):
    def __init__(self):
        super().__init__("data_agent", "DATA_AGENT_KEY")
        self.LARGE_EXPORT_MB = 100 # Alert on exports > 100MB
        
    def analyze_event(self, event: dict):
        if event.get('event_type') != 'data_export':
            return
            
        ip = event.get('ip')
        size_mb = event.get('size_mb', 0)
        
        if size_mb > self.LARGE_EXPORT_MB:
            severity = "critical" if size_mb > 1000 else "high"
            self.send_alert(
                event="large_data_export_detected",
                severity=severity,
                ip=ip,
                details={"size_mb": size_mb, "threshold_mb": self.LARGE_EXPORT_MB}
            )

if __name__ == "__main__":
    agent = DataAgent()
    agent.log("Started. Listening to telemetry...")
    time.sleep(2)
    for event in agent.tail_telemetry():
        agent.analyze_event(event)

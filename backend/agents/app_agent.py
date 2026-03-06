import os
import time
from base_agent import BaseAgent
import re

class ApplicationAgent(BaseAgent):
    def __init__(self):
        super().__init__("app_agent", "APP_AGENT_KEY")

        # Basic SQL injection patterns
        self.sql_injection_patterns = [
            r"(\%27)|(\')|(\-\-)|(\%23)|(#)",
            r"((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))",
            r"w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))",
            r"exec(\s|\+)+(s|x)p\w+"
        ]
        
    def analyze_event(self, event: dict):
        if event.get('event_type') != 'data_access':
            return
            
        query = str(event.get('query', ''))
        ip = event.get('ip')
        
        for pattern in self.sql_injection_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                self.send_alert(
                    event="injection_pattern_detected",
                    severity="critical",
                    ip=ip,
                    details={"query": query, "matched_pattern": pattern}
                )
                break

if __name__ == "__main__":
    agent = ApplicationAgent()
    agent.log("Started. Listening to telemetry...")
    time.sleep(2)
    for event in agent.tail_telemetry():
        agent.analyze_event(event)

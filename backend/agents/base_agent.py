import os
import requests
import json
import time
import uuid
import threading
from datetime import datetime
from dotenv import load_dotenv

# Search for .env in the backend folder relative to this file
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

class BaseAgent:
    def __init__(self, agent_name: str, api_key_env: str):
        self.agent_name = agent_name
        self.api_key = os.getenv(api_key_env)
        self.commander_api = os.getenv("COMMANDER_API", "http://localhost:8005")
        
        if not self.api_key:
            raise ValueError(f"Missing API key environment variable for {agent_name}: {api_key_env}")
            
        # Start heartbeat
        self.status = "Online"
        self._heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self._heartbeat_thread.start()
        
    def _heartbeat_loop(self):
        while True:
            headers = {"Content-Type": "application/json", "X-Agent-Key": self.api_key}
            try:
                requests.post(f"{self.commander_api}/agent-heartbeat", headers=headers, json={"status": self.status})
            except Exception:
                pass # Ignore if commander is down
            time.sleep(10)
    
    def log(self, message: str):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        # Capitalize agent name nicely (e.g. IdentityAgent)
        pretty_name = "".join(word.capitalize() for word in self.agent_name.split("_"))
        print(f"[{timestamp}] {pretty_name} -> {message}")
        
    def send_alert(self, event: str, severity: str, ip: str = "unknown", details: dict = None):
        """Sends an alert to the War Room Commander."""
        if details is None:
            details = {}
            
        alert_payload = {
            "id": str(uuid.uuid4()),
            "severity": severity.upper(),
            "attackType": event,
            "sourceIp": ip,
            "detectingAgent": self.agent_name,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "details": details
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-Agent-Key": self.api_key
        }
        
        try:
            response = requests.post(f"{self.commander_api}/agent-alert", headers=headers, json=alert_payload)
            response.raise_for_status()
            self.log(f"Alert sent successfully to Commander: {event} ({severity})")
            return True
        except requests.exceptions.RequestException as e:
            self.log(f"Error sending alert to Commander: {e}")
            return False

    def tail_telemetry(self, log_file: str = None):
        """Tails the telemetry log file and yields new JSON lines."""
        if log_file is None:
            log_file = os.getenv("TELEMETRY_PATH", "telemetry.log")
            
        self.log(f"Starting telemetry tail on {log_file}...")
        
        # Ensure file exists before tailing
        while not os.path.exists(log_file):
            self.log(f"Waiting for telemetry file to be created...")
            time.sleep(5)
            
        with open(log_file, 'r') as f:
            # Start from the beginning of the file to catch all tests
            f.seek(0)
            while True:
                line = f.readline()
                if not line:
                    # Windows specific: sometimes readline doesn't see updates
                    # without a seek to current position or a small delay
                    current_pos = f.tell()
                    f.seek(current_pos)
                    time.sleep(1)
                    continue
                
                try:
                    event = json.loads(line)
                    yield event
                except json.JSONDecodeError:
                    self.log(f"Failed to parse JSON line: {line}")
                    continue

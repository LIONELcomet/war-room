import requests
import json
import uuid
from datetime import datetime

url = "http://localhost:8005/agent-alert"
headers = {"X-Agent-Key": "net_secret_123"}
payload = {
    "id": str(uuid.uuid4()),
    "severity": "HIGH",
    "attackType": "brute_force_detected",
    "sourceIp": "1.2.3.4",
    "detectingAgent": "network_agent",
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "details": {"test": True}
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

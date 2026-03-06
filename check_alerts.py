import requests
import json

response = requests.get("http://localhost:8005/alerts")
alerts = response.json()
if alerts:
    print(json.dumps(alerts[-1], indent=2))
else:
    print("No alerts found.")

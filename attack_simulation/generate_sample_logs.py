import json
import time
import os
from datetime import datetime
import threading

TELEMETRY_FILE = "backend/telemetry.log"

def write_event(event_type, details):
    event = {
        "timestamp": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
        "component": "TELEMETRY",
        "event_type": event_type,
    }
    # Flatten details directly into the root event structure (as updated previously)
    event.update(details)
    
    with open(TELEMETRY_FILE, 'a') as f:
        f.write(json.dumps(event) + '\n')
    print(f"[*] Injected: {event_type} - {details.get('ip', details.get('username', 'system'))}")

def simulate_brute_force():
    print("--- Starting Brute Force (Identity Agent) ---")
    for _ in range(12):
        write_event('login_attempt', {
            'username': 'admin',
            'status': 'failed',
            'ip': '192.168.1.100',
            'user_agent': 'python-requests/2.31.0'
        })
        time.sleep(0.1)

def simulate_ddos():
    print("--- Starting DDoS (Network Agent) ---")
    for _ in range(35):
        write_event('data_access', {
            'ip': '10.0.0.99',
            'endpoint': '/data',
            'status_code': 200,
            'user_agent': 'python-requests/2.31.0'
        })
        time.sleep(0.05)

def simulate_data_exfiltration():
    print("--- Starting Data Exfiltration (Data Agent) ---")
    write_event('data_export', {
        'user': 'employee_5',
        'size_mb': 1500,
        'table': 'customers',
        'ip': '172.16.0.5'
    })

def simulate_privilege_escalation():
    print("--- Starting Privilege Escalation (Infra Agent) ---")
    for _ in range(4):
        write_event('root_access_attempt', {
            'user': 'www-data',
            'process': '/bin/bash',
            'ip': '10.1.1.50'
        })
        time.sleep(0.5)

def simulate_lateral_movement():
    print("--- Starting Lateral Movement (App Agent) ---")
    for target in ['/admin', '/aws/credentials', '/config.json', '/db_backup']:
        write_event('unauthorized_access', {
            'user': 'hacker',
            'path': target,
            'ip': '192.168.1.55',
            'status_code': 403
        })
        time.sleep(0.2)

if __name__ == "__main__":
    print("Initializing sample log generation...")
    os.makedirs(os.path.dirname(TELEMETRY_FILE), exist_ok=True)
    
    # Touch the file to ensure it exists
    with open(TELEMETRY_FILE, 'w') as f:
        pass
        
    # Start simulating various threats concurrently to generate a rich log
    threads = [
        threading.Thread(target=simulate_brute_force),
        threading.Thread(target=simulate_ddos),
        threading.Thread(target=simulate_data_exfiltration),
        threading.Thread(target=simulate_privilege_escalation),
        threading.Thread(target=simulate_lateral_movement),
    ]
    
    for t in threads:
        t.start()
        time.sleep(0.5) # Slight offset between attacks
        
    for t in threads:
        t.join()
        
    print("\n[+] Sample log generation complete! Telemetry file is heavily populated.")

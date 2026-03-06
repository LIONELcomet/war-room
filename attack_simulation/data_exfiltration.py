import requests
import json
import time

def simulate_data_exfiltration(target_url: str):
    """Simulates a large data export request."""
    print(f"[*] Starting data exfiltration simulation against {target_url}/export")
    
    # Send a few normal requests to build base telemetry
    for _ in range(3):
        requests.get(f"{target_url}/data")
        time.sleep(0.5)

    print(f"[*] Sending large data export request...")
    try:
        response = requests.get(f"{target_url}/export")
        if response.status_code == 200:
            print(f"[*] Request successful: {response.json()}")
        else:
            print(f"[-] Request failed with status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[-] Connection error: {e}")

if __name__ == "__main__":
    simulate_data_exfiltration("http://localhost:8006")

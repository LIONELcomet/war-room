import requests
import json
import time

def simulate_ddos(target_url: str, requests_count: int = 50):
    """Simulates a rapid spike in requests from a single IP."""
    print(f"[*] Starting DDoS simulation against {target_url}/data")
    print(f"[*] Sending {requests_count} rapid requests...")
    
    # Use a consistent IP to trigger the Network Agent's rate limiting
    attacker_ip = "10.0.0.99"
    headers = {"X-Forwarded-For": attacker_ip}
    
    success_count = 0
    
    for i in range(requests_count):
        try:
            response = requests.get(
                f"{target_url}/data?q=load_test_{i}", 
                headers=headers
            )
            if response.status_code == 200:
                success_count += 1
        except requests.exceptions.RequestException as e:
            print(f"[-] Connection error: {e}")
            break
            
        # Very small delay to simulate spike
        time.sleep(0.01)

    print(f"[*] DDoS simulation complete. Successful requests: {success_count}/{requests_count}")

if __name__ == "__main__":
    simulate_ddos("http://localhost:8006")

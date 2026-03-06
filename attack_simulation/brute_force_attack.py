import requests
import json
import time
import random
import argparse

def simulate_brute_force(target_url: str, username: str, attempts: int):
    """Simulates a brute force attack against the login endpoint."""
    print(f"[*] Starting brute force attack against {target_url}/login for user {username}")
    print(f"[*] Sending {attempts} login requests rapidly...")
    
    # We'll use a consistent attacker IP to trigger the Identity Agent
    attacker_ip = "192.168.1.100" 
    
    success_count = 0
    failure_count = 0
    
    for i in range(attempts):
        headers = {"X-Forwarded-For": attacker_ip} # Spoof IP if possible, or demo app uses client host
        payload = {"username": username, "password": f"password{i}"}
        
        try:
            # We don't care about the response, just hitting the endpoint
            response = requests.post(
                f"{target_url}/login", 
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                success_count += 1
            else:
                failure_count += 1
                
        except requests.exceptions.RequestException as e:
            print(f"[-] Connection error: {e}")
            break
            
        # Small delay to simulate automated script
        time.sleep(0.1)

    print(f"[*] Brute force complete. Successes: {success_count}, Failures: {failure_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Brute Force Attack Simulation")
    parser.add_argument("--url", default="http://localhost:8006", help="Target app URL")
    parser.add_argument("--user", default="admin", help="Target username")
    parser.add_argument("--attempts", type=int, default=20, help="Number of attempts")
    
    args = parser.parse_args()
    simulate_brute_force(args.url, args.user, args.attempts)

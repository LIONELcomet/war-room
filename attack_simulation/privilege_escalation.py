import json
import time
import os

def simulate_privilege_escalation():
    """Simulates a privilege escalation attempt by writing directly to the telemetry log."""
    print("[*] Starting privilege escalation simulation...")
    
    # We simulate this by writing a specific event type to the telemetry log
    # that the Infra Agent is looking for
    
    log_file = "backend/telemetry.log"
    
    event = {
        "event_type": "root_access_attempt",
        "ip": "10.0.0.50",
        "user": "www-data",
        "method": "suid_binary_exploit",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    
    try:
        # Ensure directory exists if running from different location
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        with open(log_file, "a") as f:
            f.write(json.dumps(event) + "\n")
        print(f"[*] Successfully injected root access attempt event into {log_file}")
        
    except Exception as e:
        print(f"[-] Failed to inject event: {e}")

if __name__ == "__main__":
    simulate_privilege_escalation()

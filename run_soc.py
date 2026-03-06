import subprocess
import time
import os
import sys

# COMMANDROOM SOC Orchestrator
# This script starts the entire SOC environment locally.

def start_backend():
    print("[*] Starting War Room Commander (Port 8005)...")
    cmd_commander = [sys.executable, "-m", "uvicorn", "commander.main:app", "--host", "0.0.0.0", "--port", "8005"]
    p_commander = subprocess.Popen(cmd_commander, cwd="backend")
    
    print("[*] Starting Demo Target App (Port 8006)...")
    cmd_target = [sys.executable, "-m", "uvicorn", "demo_app.main:app", "--host", "0.0.0.0", "--port", "8006"]
    p_target = subprocess.Popen(cmd_target, cwd="backend")
    
    return [p_commander, p_target]

def start_agents():
    agents = [
        "network_agent.py",
        "identity_agent.py",
        "app_agent.py",
        "infra_agent.py",
        "data_agent.py",
        "adaptive_agent.py"
    ]
    processes = []
    
    print("[*] Launching Security Agents...")
    for agent in agents:
        print(f"    -> Starting {agent}...")
        p = subprocess.Popen([sys.executable, f"agents/{agent}"], cwd="backend")
        processes.append(p)
    
    return processes

def start_frontend():
    print("[*] Starting React Dashboard (Vite)...")
    # Using shell=True for npm on Windows
    p_frontend = subprocess.Popen("npm run dev", cwd="frontend/platform-ui", shell=True)
    return [p_frontend]

if __name__ == "__main__":
    print("="*50)
    print("      COMMANDROOM - AGENTIC SOC ORCHESTRATOR")
    print("="*50)
    
    procs = []
    try:
        # 1. Start Servers
        procs.extend(start_backend())
        time.sleep(3) # Wait for servers to bind
        
        # 2. Start Agents
        procs.extend(start_agents())
        
        # 3. Start Frontend
        procs.extend(start_frontend())
        
        print("\n[!] SOC System is now running.")
        print("    - Dashboard: http://localhost:3000")
        print("    - Commander: http://localhost:8005")
        print("    - Target App: http://localhost:8006")
        print("\n[*] Press Ctrl+C to terminate all services.")
        
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n[!] Terminating all SOC services...")
        for p in procs:
            p.terminate()
        print("[*] Cleanup complete.")
    except Exception as e:
        print(f"\n[X] Error: {e}")
        for p in procs:
            p.terminate()

# COMMANDROOM - Agentic Cloud Security Operations Center (SOC)

COMMANDROOM is a full-stack simulation of an autonomous Security Operations Center. It features a decentralized team of AI security agents that monitor a target web application, coordinate alerts through a central "War Room Commander," and execute automated containment responses.

## 🚀 Quick Start (Local)

### 1. Prerequisites
- Python 3.9+ 
- Node.js & npm
- (Optional) Virtual Environment

### 2. Setup Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment (already preset for local demo)
# .env is located in the backend folder
```

### 3. Setup Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

### 4. Run the SOC (Unified Orchestrator)
From the root directory:
```bash
python run_soc.py
```
This script will start:
- **War Room Commander** (Port 8000)
- **Target Application** (Port 8001)
- **6 Security Agents** (Network, Identity, App, Infra, Data, Adaptive AI)
- **React Dashboard** (Port 5173)

### 5. Simulate Attacks
Once the SOC is running, open a new terminal and run any of the simulation scripts:
```bash
# Brute Force Attack
python attack_simulation/brute_force_attack.py

# DDoS Spike
python attack_simulation/ddos_attack.py

# Data Exfiltration
python attack_simulation/data_exfiltration.py

# Privilege Escalation
python attack_simulation/privilege_escalation.py

# Lateral Movement
python attack_simulation/lateral_movement.py
```

## 🛡️ System Architecture

### Agentic Components
- **Identity Agent**: Detects brute force and impossible logins.
- **Network Agent**: Detects traffic spikes and anomalies.
- **Application Agent**: Identifies SQL injection and API abuse patterns.
- **Data Agent**: Monitors for large data exports and sensitive access.
- **Infrastructure Agent**: Detects suspicious processes and root access attempts.
- **Adaptive Intelligence Agent**: Uses **scikit-learn (Isolation Forest)** to learn behavioral baselines and detect zero-day anomalies.

### Response Engine
The system can automatically:
- Block Attacker IPs
- Disable Compromised User Accounts
- Kill Suspicious Processes
- Isolate Servers (Visually updating the Network Map)

## ☁️ Deployment Guide

### Backend (AWS EC2)
1. Launch an EC2 instance (Ubuntu 22.04 recommended).
2. Install Python 3.10 and Pip.
3. Clone this repository.
4. Set up a systemd service for the Commander and Target App.
5. Example systemd entry:
   ```ini
   [Service]
   ExecStart=/usr/bin/python3 -m uvicorn commander.main:app --host 0.0.0.0 --port 8000
   ```
6. Update the `.env` file with your Public IP.

### Frontend (Netlify)
1. Connect your repository to Netlify.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.
4. Add environment variables if necessary (e.g., `VITE_API_URL`).

---
**Senior Cybersecurity Architect**: *Antigravity AI*

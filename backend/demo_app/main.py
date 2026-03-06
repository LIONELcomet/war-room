from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
import time
from datetime import datetime
import json
import logging
import os
import sys

# Add parent directory to path to import database manager
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db_manager import log_telemetry

app = FastAPI(title="Demo Login Application")

# Create templates directory if not exists
os.makedirs(os.path.join(os.path.dirname(__file__), "templates"), exist_ok=True)

# Generate HTML file
html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>COMMANDROOM Demo</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0B1220; color: #00E5FF; padding: 20px; }
        .panel { background: #1a2235; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #00E5FF33; }
        h2 { margin-top: 0; color: #fff; }
        input, button { padding: 10px; margin: 5px 0; width: 100%; box-sizing: border-box; background: #0B1220; color: #fff; border: 1px solid #00E5FF; border-radius: 4px; }
        button { background: #00E5FF; color: #000; font-weight: bold; cursor: pointer; }
        button:hover { background: #06D6A0; border-color: #06D6A0; }
        .attack-btn { background: #FF3B3B; color: #fff; border-color: #FF3B3B; }
        .attack-btn:hover { background: #ff5252; }
        pre { background: #000; padding: 10px; border-radius: 4px; overflow-x: auto; color: #06D6A0; }
    </style>
</head>
<body>
    <h1>COMMANDROOM Platform Demo</h1>
    
    <div class="panel">
        <h2>Login Panel</h2>
        <form id="loginForm">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <div id="loginResult"></div>
    </div>

    <div class="panel">
        <h2>Attack Simulation Panel</h2>
        <button class="attack-btn" onclick="simulateAttack('/attack/bruteforce')">Simulate Brute Force</button>
        <button class="attack-btn" onclick="simulateAttack('/attack/ddos')">Simulate DDoS</button>
        <button class="attack-btn" onclick="simulateAttack('/attack/data_exfiltration')">Simulate Data Exfiltration</button>
        <button class="attack-btn" onclick="simulateAttack('/attack/privilege_escalation')">Simulate Privilege Escalation</button>
        <div id="attackResult"></div>
    </div>

    <div class="panel">
        <h2>System Response Panel</h2>
        <p>Updates from Commander Response Engine:</p>
        <pre id="systemState">Loading...</pre>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                })
            });
            const data = await res.json();
            document.getElementById('loginResult').innerText = data.status === 'success' ? 'Login Successful' : 'Login Failed';
        });

        async function simulateAttack(endpoint) {
            const res = await fetch(endpoint, { method: 'POST' });
            const data = await res.json();
            document.getElementById('attackResult').innerText = data.message || 'Attack Simulated';
        }

        async function fetchSystemState() {
            try {
                const res = await fetch('http://localhost:8005/system-state');
                const data = await res.json();
                document.getElementById('systemState').innerText = JSON.stringify(data, null, 2);
            } catch (e) {
                document.getElementById('systemState').innerText = 'Could not fetch system state from Commander (Port 8005)';
            }
        }

        setInterval(fetchSystemState, 3000);
        fetchSystemState();
    </script>
</body>
</html>
"""

with open(os.path.join(os.path.dirname(__file__), "templates", "index.html"), "w") as f:
    f.write(html_content)

templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))

# File-based telemetry stream mapping (some components may still read file)
TELEMETRY_FILE = os.path.join(os.path.dirname(__file__), '..', 'telemetry.log')

def write_telemetry(component, event_type, details):
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    event_data = {
        "timestamp": timestamp,
        "component": component,
        "event_type": event_type,
    }
    # Merge details into root so agents can read ip, username, status etc. directly
    event_data.update(details)
    
    # Write to SQLite DB
    log_telemetry(component, event_type, details)
    
    # Continue writing to file for backward compatibility during upgrade
    with open(TELEMETRY_FILE, "a") as f:
        f.write(json.dumps(event_data) + "\n")
        
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {component} -> {event_type} detected")
    return event_data

@app.get("/demo", response_class=HTMLResponse)
async def get_demo(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/login")
async def login(request: Request):
    body = await request.json()
    username = body.get("username", f"rand_user_{random.randint(100, 999)}")
    ip = request.client.host if request.client else f"{random.randint(1, 255)}.{random.randint(1, 255)}.1.1"
    
    # Simulate random success/failure
    status = "success" if random.random() > 0.4 else "failure"
    
    event_details = {
        "ip": ip,
        "endpoint": "/login",
        "username": username,
        "status": status,
        "user_agent": request.headers.get("user-agent", "unknown")
    }
    
    write_telemetry("TELEMETRY", "login_attempt", event_details)
    return JSONResponse(status_code=200 if status == "success" else 401, content=event_details)

# --- Attack Simulation Endpoints ---

@app.post("/attack/bruteforce")
async def simulate_bruteforce(request: Request):
    ip = "192.168.1.50"
    for _ in range(10):
        write_telemetry("TELEMETRY", "login_attempt", {
            "ip": ip, "username": "admin", "status": "failure", "endpoint": "/login"
        })
    return {"message": "Simulated Brute Force attack"}

@app.post("/attack/ddos")
async def simulate_ddos(request: Request):
    ip = "10.0.0.99"
    for _ in range(50):
        write_telemetry("TELEMETRY", "request_spike", {
            "ip": ip, "endpoint": "/", "status": "success"
        })
    return {"message": "Simulated DDoS attack"}

@app.post("/attack/data_exfiltration")
async def simulate_exfiltration(request: Request):
    ip = "172.16.0.42"
    write_telemetry("TELEMETRY", "data_export", {
        "ip": ip, "endpoint": "/export", "size_mb": 5000, "status": "success"
    })
    return {"message": "Simulated Data Exfiltration"}

@app.post("/attack/privilege_escalation")
async def simulate_privilege_escalation(request: Request):
    ip = "192.168.2.15"
    write_telemetry("TELEMETRY", "privilege_escalation", {
        "ip": ip, "username": "guest_user", "target_role": "admin", "status": "success"
    })
    return {"message": "Simulated Privilege Escalation"}

# --- GET endpoints for attack simulation scripts ---

@app.get("/data")
async def get_data(request: Request, q: str = ""):
    """Endpoint hit by ddos_attack.py to generate telemetry with an ip field."""
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "127.0.0.1")
    write_telemetry("TELEMETRY", "data_access", {
        "ip": ip, "endpoint": "/data", "query": q, "status": "success"
    })
    return {"data": "sample_response", "query": q}

@app.get("/export")
async def get_export(request: Request):
    """Endpoint hit by data_exfiltration.py to generate data_export events."""
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "127.0.0.1")
    size_mb = random.randint(500, 5000)
    write_telemetry("TELEMETRY", "data_export", {
        "ip": ip, "endpoint": "/export", "size_mb": size_mb, "status": "success"
    })
    return {"exported": True, "size_mb": size_mb}

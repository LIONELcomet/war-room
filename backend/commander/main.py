from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv
from response_engine.actions import engine
from ai.gemini_service import analyze_security_event
import sys
import os

# Add parent directory to path to import database manager
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db_manager import log_alert, update_agent_health, log_response_action, init_db

load_dotenv()

app = FastAPI(title="War Room Commander API")

@app.on_event("startup")
def startup_event():
    init_db()
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Commander -> System initialized")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEYS = {
    os.getenv("NETWORK_AGENT_KEY", "net_secret_123"): "network_agent",
    os.getenv("IDENTITY_AGENT_KEY", "id_secret_123"): "identity_agent",
    os.getenv("DATA_AGENT_KEY", "data_secret_123"): "data_agent",
    os.getenv("APP_AGENT_KEY", "app_secret_123"): "app_agent",
    os.getenv("INFRA_AGENT_KEY", "infra_secret_123"): "infra_agent",
    os.getenv("ADAPTIVE_AGENT_KEY", "adaptive_secret_123"): "adaptive_agent",
}

api_key_header = APIKeyHeader(name="X-Agent-Key", auto_error=False)

def get_agent_name(api_key: str = Security(api_key_header)):
    if api_key in API_KEYS:
        return API_KEYS[api_key]
    raise HTTPException(status_code=403, detail="Could not validate credentials")

class Alert(BaseModel):
    id: str
    severity: str # CRITICAL, HIGH, MEDIUM, LOW
    attackType: str
    sourceIp: str
    detectingAgent: str
    timestamp: str
    details: Dict[str, Any] = {}
    # AI Enrichment fields
    ai_attack_type: str = "Pending Analysis"
    ai_severity: str = "TBD"
    ai_recommendation: str = "None"

class AlertStorage:
    alerts: List[Alert] = []

    @classmethod
    def add_alert(cls, alert: Alert):
        cls.alerts.append(alert)
        cls.correlate_events()
        
    @classmethod
    def correlate_events(cls):
        recent_highs = [a for a in cls.alerts if a.severity in ["high", "critical"]]
        if len(recent_highs) >= 3:
            print("CRITICAL: Multiple high severity alerts detected. Engaging Response Engine.")

@app.post("/agent-alert")
async def receive_alert(alert: Alert, agent_name: str = Depends(get_agent_name)):
    if alert.detectingAgent != agent_name:
        raise HTTPException(status_code=400, detail="Agent name mismatch")
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] Commander -> received alert from {agent_name}: {alert.attackType}")
    
    # AI Intelligence Layer: Analyze with Gemini
    ai_analysis = analyze_security_event({
        "agent": alert.detectingAgent,
        "event_type": alert.attackType,
        "source_ip": alert.sourceIp,
        "details": alert.details
    })
    
    # Enrich alert with Gemini intelligence
    alert.ai_attack_type = ai_analysis.get("attack_type", alert.attackType)
    alert.ai_severity = ai_analysis.get("severity", alert.severity)
    alert.ai_recommendation = ai_analysis.get("recommended_action", "manual_review")
    
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Commander -> correlating alerts")
    
    AlertStorage.add_alert(alert)
    
    # Log to SQLite DB
    log_alert({
        'id': alert.id,
        'timestamp': alert.timestamp,
        'severity': alert.severity,
        'attack_type': alert.attackType,
        'source_ip': alert.sourceIp,
        'detecting_agent': alert.detectingAgent,
        'details': alert.details,
        'ai_attack_type': alert.ai_attack_type,
        'ai_severity': alert.ai_severity,
        'ai_recommendation': alert.ai_recommendation
    })
    
    # Autonomous Response: Trigger engine based on AI recommendation or fallback rules
    # Fallback mapping for known attack types when AI doesn't return an actionable command
    ATTACK_TYPE_TO_ACTION = {
        "brute_force_detected": "block_ip",
        "rate_spike_detected": "block_ip",
        "large_data_export_detected": "block_ip",
        "injection_pattern_detected": "block_ip",
        "root_access_attempt": "disable_user",
        "suspicious_process_detected": "kill_process",
        "container_escape_simulation": "isolate_server",
        "behavioral_anomaly": "block_ip",
    }

    action = alert.ai_recommendation
    if action not in ["block_ip", "disable_user", "isolate_server", "kill_process"]:
        # AI didn't return an actionable command — use fallback for HIGH/CRITICAL
        if alert.severity.upper() in ["HIGH", "CRITICAL"]:
            action = ATTACK_TYPE_TO_ACTION.get(alert.attackType)

    if action in ["block_ip", "disable_user", "isolate_server", "kill_process"]:
        target = alert.sourceIp
        if action == "disable_user":
             target = alert.details.get("user", alert.details.get("username", "unknown_user"))
        
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Commander -> executing {action} on {target}")
        engine.execute_action(action, target)
        log_response_action(action, target, "executed")
    
    print(f"Final Alert Object: {alert.dict()}")
        
    return {"status": "AI_SOC_READY", "ai_insight": ai_analysis}

@app.get("/alerts")
async def get_alerts():
    return AlertStorage.alerts

@app.get("/system-state")
async def get_system_state():
    # Calculate global threat level based on alerts
    severity_map = {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 1, "LOW": 0}
    max_severity = "NORMAL"
    if AlertStorage.alerts:
        sorted_alerts = sorted(AlertStorage.alerts, key=lambda x: severity_map.get(x.severity, 0), reverse=True)
        max_severity = sorted_alerts[0].severity if severity_map.get(sorted_alerts[0].severity, -1) > 0 else "NORMAL"
        if max_severity == "NORMAL" and AlertStorage.alerts:
             max_severity = "ELEVATED"

    # Mock nodes and edges for React Flow
    nodes = [
        {"id": "internet", "type": "input", "data": {"label": "Internet"}, "position": {"x": 250, "y": 0}},
        {"id": "waf", "data": {"label": "WAF / Firewall"}, "position": {"x": 250, "y": 100}},
        {"id": "web_server", "data": {"label": "Web Server"}, "position": {"x": 100, "y": 200}},
        {"id": "api_server", "data": {"label": "API Server"}, "position": {"x": 400, "y": 200}},
        {"id": "database", "type": "output", "data": {"label": "Database"}, "position": {"x": 250, "y": 300}},
    ]
    edges = [
        {"id": "e1-2", "source": "internet", "target": "waf", "animated": True},
        {"id": "e2-3", "source": "waf", "target": "web_server"},
        {"id": "e2-4", "source": "waf", "target": "api_server"},
        {"id": "e3-5", "source": "web_server", "target": "database"},
        {"id": "e4-5", "source": "api_server", "target": "database"},
    ]

    response_state = engine.get_state()
    return {
        "commanderStatus": "ONLINE",
        "globalThreatLevel": max_severity,
        "systemHealth": max(0, 100 - len(AlertStorage.alerts) * 5),
        "activeIncidents": len(AlertStorage.alerts),
        "blockedIps": response_state.get("isolated_ips", []),
        "disabledUsers": response_state.get("disabled_users", []),
        "killedProcesses": response_state.get("killed_pids", []),
        "nodes": nodes,
        "edges": edges,
        "isolatedNodes": response_state.get("isolated_servers", [])
    }

class Heartbeat(BaseModel):
    status: str

@app.post("/agent-heartbeat")
async def receive_heartbeat(heartbeat: Heartbeat, agent_name: str = Depends(get_agent_name)):
    update_agent_health(agent_name, heartbeat.status)
    return {"status": "heartbeat_received"}

@app.get("/agent-status")
async def get_agent_status():
    import sqlite3
    from database.db_manager import DB_PATH
    
    agents = []
    default_agents = ["network_agent", "identity_agent", "app_agent", "infra_agent", "data_agent", "adaptive_agent"]
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT agent_name, status, last_seen_timestamp FROM agent_health")
        db_agents = cursor.fetchall()
        conn.close()
        
        agent_dict = {row[0]: {"status": row[1], "last_seen_timestamp": row[2]} for row in db_agents}
        
        # Build a map of most recent alert per detecting agent
        last_detection_map = {}
        for alert in AlertStorage.alerts:
            agent_key = alert.detectingAgent
            if agent_key not in last_detection_map or alert.timestamp > last_detection_map[agent_key]["timestamp"]:
                last_detection_map[agent_key] = {
                    "timestamp": alert.timestamp,
                    "attackType": alert.attackType,
                    "severity": alert.severity
                }

        for agent_name in default_agents:
            if agent_name in agent_dict:
                status = agent_dict[agent_name]["status"]
            else:
                status = "Offline"

            last_event = last_detection_map.get(agent_name)
                
            agents.append({
                "id": agent_name.replace("_agent", ""),
                "name": agent_name.replace("_", " ").title(),
                "status": status,
                "lastDetectionEvent": last_event,
                "healthIndicator": 100 if status == "Online" else (0 if status == "Offline" else 95)
            })
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Commander -> Error reading agent status: {e}")
        # Build a safe basic fallback
        agents = []
        for agent_name in default_agents:
            agents.append({
                "id": agent_name.replace("_agent", ""),
                "name": agent_name.replace("_", " ").title(),
                "status": "Offline",
                "lastDetectionEvent": None,
                "healthIndicator": 0
            })
    return agents

@app.get("/timeline")
async def get_timeline():
    timeline = []
    for alert in AlertStorage.alerts:
        timeline.append({
            "id": f"t-{alert.id}",
            "timestamp": alert.timestamp,
            "agent": alert.detectingAgent,
            "eventType": alert.attackType,
            "severity": alert.severity,
            "ai_insight": alert.ai_recommendation
        })
    return sorted(timeline, key=lambda x: x["timestamp"], reverse=True)

@app.post("/incident/analyze")
async def analyze_incident():
    return {"status": "analysis_started"}

@app.post("/incident/respond")
async def respond_to_incident(action: Dict[str, str]):
    action_type = action.get("action_type")
    target = action.get("target")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Commander -> triggering Response Engine: {action_type} on {target}")
    result = engine.execute_action(action_type, target)
    log_response_action(action_type, target, "manual_execution")
    return {"status": "response_executed", "result": result}

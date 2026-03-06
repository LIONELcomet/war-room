import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "commandroom.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Telemetry events table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS telemetry_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            component TEXT,
            event_type TEXT,
            details TEXT
        )
    """)

    # Alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            timestamp TEXT,
            severity TEXT,
            attack_type TEXT,
            source_ip TEXT,
            detecting_agent TEXT,
            details TEXT,
            ai_attack_type TEXT,
            ai_severity TEXT,
            ai_recommendation TEXT
        )
    """)

    # Agent health table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agent_health (
            agent_name TEXT PRIMARY KEY,
            status TEXT,
            last_seen_timestamp TEXT
        )
    """)

    # Response actions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS response_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            action_type TEXT,
            target TEXT,
            status TEXT
        )
    """)

    # Incident history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incident_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            description TEXT,
            resolution TEXT
        )
    """)

    conn.commit()
    conn.close()
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] DATABASE -> CommandRoom SQLite initialized.")

def log_telemetry(component, event_type, details):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute(
        "INSERT INTO telemetry_events (timestamp, component, event_type, details) VALUES (?, ?, ?, ?)",
        (timestamp, component, event_type, str(details))
    )
    conn.commit()
    conn.close()
    print(f"[{timestamp}] {component} -> {event_type}")

def log_alert(alert_data):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO alerts 
        (id, timestamp, severity, attack_type, source_ip, detecting_agent, details, ai_attack_type, ai_severity, ai_recommendation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert_data['id'], alert_data['timestamp'], alert_data['severity'], 
        alert_data['attack_type'], alert_data['source_ip'], alert_data['detecting_agent'],
        str(alert_data['details']), alert_data.get('ai_attack_type'), 
        alert_data.get('ai_severity'), alert_data.get('ai_recommendation')
    ))
    conn.commit()
    conn.close()

def update_agent_health(agent_name, status):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute(
        "INSERT OR REPLACE INTO agent_health (agent_name, status, last_seen_timestamp) VALUES (?, ?, ?)",
        (agent_name, status, timestamp)
    )
    conn.commit()
    conn.close()
    print(f"[{timestamp}] AgentHealth -> {agent_name} {status}")

def log_response_action(action_type, target, status="executed"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute(
        "INSERT INTO response_actions (timestamp, action_type, target, status) VALUES (?, ?, ?, ?)",
        (timestamp, action_type, target, status)
    )
    conn.commit()
    conn.close()
    print(f"[{timestamp}] ResponseEngine -> {action_type} on {target}")

if __name__ == "__main__":
    init_db()

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Using the user-requested gemini-1.5-flash
    model = genai.GenerativeModel('gemini-1.5-flash')
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] GeminiAI -> Initialized with 1.5-flash.")
else:
    model = None
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] GeminiAI -> WARNING: GEMINI_API_KEY not found.")

def analyze_security_event(event_data: dict):
    """
    Analyzes a security event using Gemini AI.
    Returns a dictionary with attack_type, severity, and recommended_action.
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if not model:
        return {
            "attack_type": "Unknown (AI Offline)",
            "severity": "MEDIUM",
            "recommended_action": "manual_review"
        }

    print(f"[{timestamp}] Commander -> sending event to Gemini AI")
    
    prompt = f"""
    You are a Senior Security Analyst in an Agentic SOC. 
    Analyze the following security event and provide a structured response.
    
    EVENT DATA:
    {json.dumps(event_data, indent=2)}
    
    RESPONSE FORMAT (JSON):
    {{
        "attack_type": "String (e.g., Brute Force, DDoS, Data Exfiltration, etc.)",
        "severity": "String (CRITICAL, HIGH, MEDIUM, LOW)",
        "recommended_action": "String (block_ip, disable_user, isolate_server, or manual_review)"
    }}
    
    ONLY return the JSON object.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        analysis = json.loads(text)
        
        log_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{log_timestamp}] GeminiAI -> threat classification: {analysis.get('attack_type')}")
        print(f"[{log_timestamp}] GeminiAI -> severity: {analysis.get('severity')}")

        return {
            "attack_type": analysis.get("attack_type", "Unknown"),
            "severity": analysis.get("severity", "MEDIUM").upper(),
            "recommended_action": analysis.get("recommended_action", "manual_review")
        }
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] GeminiAI -> Error: {e}")
        return {
            "attack_type": "Analysis Error",
            "severity": "HIGH",
            "recommended_action": "manual_review"
        }

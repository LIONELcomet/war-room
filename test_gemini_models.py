import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

for model_id in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']:
    try:
        model = genai.GenerativeModel(model_id)
        response = model.generate_content("Say 'Hello'")
        print(f"Success with {model_id}: {response.text}")
        break  # If one works, we're good
    except Exception as e:
        print(f"Failed with {model_id}: {e}")

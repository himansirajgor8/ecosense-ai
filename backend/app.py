import json
import os
import re
import time

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.air_quality import air_quality_bp
from routes.prediction import prediction_bp

# Force load .env file
load_dotenv(dotenv_path='.env', override=True)
load_dotenv(dotenv_path='backend/.env', override=True)

# Debug - print key status
openrouter_key = os.getenv('OPENROUTER_KEY')
gemini_key = os.getenv('GEMINI_KEY')
groq_key = os.getenv('GROQ_API_KEY') or os.getenv('GROQ_KEY')
print(f"OpenRouter Key loaded: {bool(openrouter_key)}")
print(f"Gemini Key loaded: {bool(gemini_key)}")
print(f"Groq Key loaded: {bool(groq_key)}")

app = Flask(__name__)
CORS(app)

app.register_blueprint(air_quality_bp, url_prefix='/api')
app.register_blueprint(prediction_bp, url_prefix='/api')

@app.route('/')
def health_check():
    return {'status': 'EcoSense AI backend running'}


def call_openrouter(api_url, headers, payload, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            result = response.json()

            # If rate limited, wait and retry
            if response.status_code == 429:
                wait_time = (attempt + 1) * 10
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue

            return result

        except Exception as e:
            print(f"Attempt {attempt + 1} failed:", str(e))
            time.sleep(5)

    return None


@app.route('/api/classify', methods=['POST'])
def classify_waste():
    data = request.get_json(silent=True) or {}
    image_data = data.get('image')
    media_type = data.get('mediaType', 'image/jpeg')

    if not image_data:
        return jsonify({'error': 'Missing image'}), 400

    groq_api_key = os.getenv('GROQ_API_KEY') or os.getenv('GROQ_KEY')
    if not groq_api_key:
        return jsonify({'error': 'Missing GROQ_API_KEY'}), 500

    api_url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "temperature": 0,
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{media_type};base64,{image_data}"
                    }
                },
                {
                    "type": "text",
                    "text": """Classify this waste item.
Reply ONLY in JSON:
{
  "category": "plastic" or "paper" or "metal" or "glass" or "food" or "electronic" or "other",
  "itemName": "exact name",
  "confidence": 85
}"""
                }
            ]
        }]
    }

    try:
        result = call_openrouter(api_url, headers, payload)

        if result is None:
            return jsonify({'error': 'API request failed after retries'}), 500

        print("Groq response:", result)

        if 'error' in result:
            error = result['error']
            if isinstance(error, dict):
                error = error.get('message') or json.dumps(error)
            return jsonify({'error': error}), 500

        text = result['choices'][0]['message'].get('content', '')

        if isinstance(text, list):
            text = ''.join(part.get('text', '') for part in text if isinstance(part, dict))

        # Clean and parse JSON
        clean = str(text).replace('```json', '').replace('```', '').strip()

        # Find JSON in response
        json_match = re.search(r'\{.*\}', clean, re.DOTALL)
        json_text = json_match.group() if json_match else clean

        try:
            parsed = json.loads(json_text)
        except ValueError:
            return jsonify({'error': f"Groq returned invalid JSON: {clean[:300] or 'empty response'}"}), 500

        return jsonify(parsed)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({
            'error': str(e),
            'category': 'other',
            'itemName': 'Could not classify',
            'confidence': 0
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

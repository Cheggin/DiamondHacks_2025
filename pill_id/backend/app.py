from flask import Flask, request, jsonify
import base64
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from Expo

genai.configure(api_key='YOUR_GEMINI_API_KEY')

model = genai.GenerativeModel('gemini-pro-vision')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    image_b64 = data.get('image')

    if not image_b64:
        return jsonify({'error': 'Image data is required'}), 400

    image_bytes = base64.b64decode(image_b64)

    response = model.generate_content([
        "Identify this pill and describe its function.",
        {"mime_type": "image/jpeg", "data": image_bytes}
    ])

    return jsonify({'response': response.text})

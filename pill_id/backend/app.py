from flask import Flask, request, jsonify
import google.generativeai as genai
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# 🔑 Replace with your actual Gemini API key
genai.configure(api_key='YOUR_GEMINI_API_KEY')

model = genai.GenerativeModel('gemini-pro-vision')

@app.route('/')
def index():
    return 'Pill ID Gemini API is running!'

@app.route('/analyze-both', methods=['POST'])
def analyze_both():
    try:
        data = request.get_json()
        image1_b64 = data.get('image1')
        image2_b64 = data.get('image2')

        if not image1_b64 or not image2_b64:
            return jsonify({'error': 'Both images are required'}), 400

        # Decode base64 strings
        image1_bytes = base64.b64decode(image1_b64)
        image2_bytes = base64.b64decode(image2_b64)

        # Generate Gemini responses
        result1 = model.generate_content([
            "What is this pill? Identify it and explain its common use.",
            {"mime_type": "image/jpeg", "data": image1_bytes}
        ])

        result2 = model.generate_content([
            "What is this pill? Identify it and explain its common use.",
            {"mime_type": "image/jpeg", "data": image2_bytes}
        ])

        return jsonify({
            'response1': result1.text,
            'response2': result2.text
        })

    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

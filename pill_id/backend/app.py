from flask import Flask, request, jsonify
import base64
from flask_cors import CORS
from inference import inference  # Import the inference function from the inference module

app = Flask(__name__)
CORS(app)  # Allow requests from Expo

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    image_b64 = data.get('image')

    if not image_b64:
        return jsonify({'error': 'Image data is required'}), 400

    image_bytes = base64.b64decode(image_b64)

    response = inference(image_bytes)

    return jsonify({'response': response.text})

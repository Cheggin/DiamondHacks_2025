from flask import Flask, request, jsonify
import base64
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from inference import query_pill_features, query_drugs, query_pill_count

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return 'Pill ID Gemini API is running!'

@app.route('/analyze-both', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        # print(data)
        image1_b64 = data.get('image1')
        image2_b64 = data.get('image2')

        if not image1_b64 or not image2_b64:
            return jsonify({'error': 'Both images are required'}), 400

        # Decode base64 strings
        image1_bytes = base64.b64decode(image1_b64)
        image2_bytes = base64.b64decode(image2_b64)

        # use PIL to concatenate the images, with image 1 being on the top and image 2 being on the bottom
        image1 = Image.open(BytesIO(image1_bytes))
        image2 = Image.open(BytesIO(image2_bytes))

        # combine them
        total_height = image1.height + image2.height
        new_image = Image.new('RGB', (max(image1.width, image2.width), total_height))
        new_image.paste(image1, (0, 0))
        new_image.paste(image2, (0, image1.height))

        combined_image_bytes = BytesIO()
        new_image.save(combined_image_bytes, format='PNG')
        combined_image_bytes.seek(0)  # Reset the BytesIO object to the beginning
        combined_image_bytes = combined_image_bytes.read()  # Read the bytes for inference
        
        result = query_drugs(*query_pill_features(combined_image_bytes))
        
        # print the variable names of result
        # print(result.__dict__.keys())

        # return jsonify({
        #     'response': result.text,
        #     # 'response': 'testing '
        # })
        print(result["1st choice"])
        return jsonify(result)
        

    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Test endpoint is working!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
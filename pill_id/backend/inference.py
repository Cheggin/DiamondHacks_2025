from google import genai
from google.genai import types
from google.cloud import aiplatform
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
import base64
import json

# Set environment variables directly
PROJECT_ID = '229875499807'
REGION = 'us-central1'
ENDPOINT_ID = '3163467576437112832'

def query_pill_features(image_bytes):
    client = genai.Client(
        vertexai=True,
        project="229875499807",
        location="us-central1",
    )

    msg1_image1 = types.Part.from_uri(
        file_uri="https://img.medscapestatic.com/pi/features/drugdirectory/octupdate/AUR00140.jpg",
        mime_type="image/jpeg",
    )

    model = "projects/229875499807/locations/us-central1/endpoints/3163467576437112832"
    contents = [
        types.Content(
            role="user",
            parts=[
                msg1_image1,
                types.Part.from_text(text="""Get the color, shape, and imprint of this pill.""")
            ]
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=0.2,
        top_p=0.8,
        max_output_tokens=1024,
        response_modalities=["TEXT"],
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="OFF"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="OFF"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="OFF"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="OFF"
            )
        ],
    )

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    features = response.text.split(",")
    imprint = features[0]
    color = features[1]
    shape = features[2]

    return imprint, color, shape

def query_drugs(imprint: str, color: str, shape: str):
    url = f"https://www.drugs.com/imprints.php?imprint={imprint}&color={color}&shape={shape}"

    response = requests.get(url)
    if response.status_code == 200:
        html_content = response.text
        soup = BeautifulSoup(html_content, "html.parser")
        
        pills = soup.find_all("a", string="View details")
        
        results = []
        for pill_link in pills:
            container = pill_link.find_parent("div")
            if container:
                text = container.get_text(" ", strip=True)
                results.append(text)
        
        if results:
            print("Found pill information:")
            for r in results:
                print("-" * 40)
                print(r)
        else:
            print("No pill details found using the current parsing strategy.")
    else:
        print(f"Error fetching page: Status code {response.status_code}")

def query_pill_count(imprint: str, color: str, shape: str):
    # Load environment variables for API key
    load_dotenv()
    
    # Initialize client for Flash 2.0 (not Vertex AI)
    client = genai.Client(
        api_key=os.getenv("GENAI-APIKEY")
    )
    
    # Use Gemini Flash 2.0 model
    model = client.get_model("models/gemini-flash-2")
    
    # Create a simple hello world prompt
    prompt = "Hello world! Please give a brief response."
    
    # Generate content
    response = model.generate_content(prompt)
    
    # Print the response
    print("Flash 2.0 Model Response:")
    print(response.text)
    
    return imprint, color, shape


# Load image and run inference
with open("pill_id/backend/pill.jpeg", "rb") as file:
    local_image_bytes = file.read()

query_drugs(*query_pill_features(local_image_bytes))
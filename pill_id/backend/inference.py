from google import genai
from google.genai.types import HttpOptions, Part
import requests
from bs4 import BeautifulSoup
import time

from dotenv import load_dotenv
import os


load_dotenv()
genai_apikey = os.getenv('GENAI-APIKEY')
if not genai_apikey:
    print("Error: GENAI-APIKEY environment variable is not set.")
    exit(1)

client = genai.Client(api_key=genai_apikey)

def inference(image_bytes):

    """
    EXAMPLE FROM LOCAL IMAGE
    """
    # with open("pill_id backend/pill.jpeg", "rb") as file:
    #     local_image_bytes = file.read()

    # response = client.models.generate_content(
    #     model="gemini-2.0-flash",
    #     contents=["I should have given you an image of a pill. Only respond with the imprint of the pill, the shape of the pill, and the color of the pill and only those three pieces of information, each on a new line, without any additional text or explanations.",
    #             Part.from_bytes(data=local_image_bytes, mime_type="image/png"),
    #             ]
    # )

    """
    GET RESPONSE FROM GIVEN IMAGE BYTES
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=["I should have given you an image of a pill. Only respond with the imprint of the pill, the shape of the pill, and the color of the pill and only those three pieces of information, each on a new line, without any additional text or explanations.",
                Part.from_bytes(data=image_bytes, mime_type="image/png"),
                ]
    )

    features = response.text.split("\n")
    imprint = features[0].strip().replace(" ", "+")
    color = features[1].strip().lower()
    shape = features[2].strip().lower()

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

    
with open("backend/pill.jpeg", "rb") as file:
    local_image_bytes = file.read()

inference(local_image_bytes)  # Replace None with actual image bytes when calling the function

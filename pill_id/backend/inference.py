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
    try:
        parts = response.candidates[0].content.parts
        if not parts:
            print("No content parts found in response.")
            return

        text = parts[0].text
        if not text:
            print("Text content is empty.")
            return

        features = text.strip().split("\n")
        if len(features) < 3:
            print("Not enough features extracted from Gemini response.")
            return

        imprint = features[0].strip().replace(" ", "+")
        color = features[1].strip().lower()
        shape = features[2].strip().lower()
    except Exception as e:
        print("Error parsing Gemini response:", e)
        return


    url = f"https://www.drugs.com/imprints.php?imprint={imprint}&color={color}&shape={shape}"

    response = requests.get(url)
    if response.status_code == 200:
        if response:
            html_content = response.text
            soup = BeautifulSoup(html_content, "html.parser")
            
            pills = soup.find_all("a", string="View details")
            
            results = []
            for pill_link in pills:
                container = pill_link.find_parent("div")
                if container:
                    text = container.get_text(" ", strip=True)
                    results.append(text)
            
            i = 0
            output = []
            if results:
                print("Found pill information!")
                for r in results:
                    if i < 3:
                        if r is None:
                            print("Bad pill data")
                        else:
                            # print("-" * 40)
                            # print(r)
                            output.append(r)
                        i += 1
            else:
                print("No pill details found using the current parsing strategy.")
    else:
        print(f"Error fetching page: Status code {response.status_code}")
        
    return {
        "imprint": imprint,
        "color": color,
        "shape": shape,
        "1st choice": output[0] if len(output) > 0 else "N/A",
        "2nd choice": output[1] if len(output) > 1 else "N/A",
        "3rd choice": output[2] if len(output) > 2 else "N/A",
    }
        
    

    
# with open("backend/pill.jpeg", "rb") as file:
#     local_image_bytes = file.read()

# inference(local_image_bytes)  # Replace None with actual image bytes when calling the function

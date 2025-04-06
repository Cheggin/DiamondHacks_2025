from google import genai
from google.genai import types
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

    msg1_image1 = types.Part.from_bytes(
        data=image_bytes,
        mime_type="image/png",
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
        

def query_pill_count(image_bytes, imprint: str, color: str, shape: str):
    # Load environment variables for API key
    load_dotenv()
    
    # Initialize client for Flash 2.0 (not Vertex AI)
    client = genai.Client(
        api_key=os.getenv("GENAI-APIKEY")
    )

    image = types.Part.from_bytes(
        data=image_bytes,
        mime_type="image/png",
    )
    
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=["Please count the number of pills with these characteristics: imprint: {}, color: {}, shape: {}. Return nothing but the number.".format(imprint, color, shape),
                  image]
    )   

    print(response.text)
    
    return response.text

# query this to print the side effects of ibuprofen (https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"ibuprofen"&limit=10)
def query_side_effects(drug_name: str):
    url = f"https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:\"{drug_name}\"&limit=10"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        side_effects = []
        
        for event in data.get("results", []):
            reactions = event.get("patient", {}).get("reaction", [])
            for reaction in reactions:
                if "reactionmeddrapt" in reaction:
                    side_effects.append(reaction["reactionmeddrapt"])
        
        return list(set(side_effects))  # Remove duplicates
    else:
        print(f"Error fetching side effects: Status code {response.status_code}")
        return []

# import requests

# def get_rxcui(drug_name):
#     """
#     Retrieve the RxCUI for a given drug name using the RxNav API.
#     """
#     url = f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug_name}"
#     response = requests.get(url)
#     response.raise_for_status()
#     data = response.json()
#     # Assuming the first RxCUI is the one we need:
#     rxcui = data["idGroup"].get("rxnormId", [None])[0]
#     if rxcui:
#         print(f"{drug_name} RxCUI: {rxcui}")
#         return rxcui
#     else:
#         raise ValueError(f"No RxCUI found for {drug_name}")

# def get_ddi(rxcui_list):
#     """
#     Retrieve drug-drug interactions given a list of RxCUIs.
#     RxNav expects multiple RxCUIs separated by plus signs.
#     """
#     # Create a string with plus signs between RxCUIs
#     rxcuis = "+".join(rxcui_list)
#     url = f"https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis={rxcuis}"
#     response = requests.get(url)
#     response.raise_for_status()
#     ddi_data = response.json()
#     return ddi_data

# def main():
#     # Define the drug names
#     drugs = ["ibuprofen", "aspirin"]
    
#     # Retrieve RxCUIs for each drug
#     try:
#         rxcui_list = [get_rxcui(drug) for drug in drugs]
#     except Exception as e:
#         print(f"Error retrieving RxCUI: {e}")
#         return
    
#     # Query the interactions endpoint using the RxCUIs
#     try:
#         ddi_results = get_ddi(rxcui_list)
#         print("Drug-Drug Interaction Results:")
#         print(ddi_results)
#     except Exception as e:
#         print(f"Error retrieving drug-drug interactions: {e}")

# if __name__ == "__main__":
#     main()

import requests
from bs4 import BeautifulSoup

def search_drug(drug_name):
    # Construct a search URL using Drugs.com's search endpoint.
    # (This URL format is based on current observations and may change.)
    search_url = f"https://www.drugs.com/search.php?searchterm={drug_name}"
    response = requests.get(search_url)
    response.raise_for_status()
    return response.text

def parse_search_results(html_content):
    # Parse the search results to find the URL for the first matching drug detail page.
    soup = BeautifulSoup(html_content, 'html.parser')
    # For example, assume search results are contained in <div class="result"> elements.
    # Adjust the selector based on actual page structure.
    result_link = soup.find('a', href=True, string=lambda s: s and drug_name.lower() in s.lower())
    if result_link:
        detail_url = result_link['href']
        # Ensure the URL is absolute
        if not detail_url.startswith('http'):
            detail_url = "https://www.drugs.com" + detail_url
        return detail_url
    else:
        raise ValueError("No matching drug detail page found.")

def get_drug_internal_id(detail_url):
    # Fetch the drug detail page
    response = requests.get(detail_url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Look for the link/button that leads to the interactions checker.
    # Often, this link might look like:
    # <a href="/interactions-check.php?drug_list=243-0">Check Interactions</a>
    interactions_link = soup.find('a', href=lambda href: href and "interactions-check.php" in href)
    if interactions_link:
        # Parse the query parameter "drug_list" from the href
        href = interactions_link['href']
        # For example, if href is "/interactions-check.php?drug_list=123-0"
        # we can split it to extract the drug_list value.
        import urllib.parse as urlparse
        parsed = urlparse.urlparse(href)
        params = urlparse.parse_qs(parsed.query)
        drug_list = params.get('drug_list', [None])[0]
        if drug_list:
            return drug_list
    raise ValueError("Could not extract internal drug ID from the detail page.")

if __name__ == "__main__":
    drug_name = "Tylenol"  # example drug name
    try:
        # Step 1: Simulate search for the drug
        search_html = search_drug(drug_name)
        
        # Step 2: Parse the search results to get the detail page URL
        detail_page_url = parse_search_results(search_html)
        print(f"Detail page URL for {drug_name}: {detail_page_url}")
        
        # Step 3: On the detail page, parse out the internal ID (drug_list value)
        internal_id = get_drug_internal_id(detail_page_url)
        print(f"Internal drug ID for {drug_name}: {internal_id}")
        
        # Now you can use this ID to build the interactions checker URL:
        ddi_url = f"https://www.drugs.com/interactions-check.php?drug_list={internal_id}"
        print(f"DDI URL for {drug_name}: {ddi_url}")
        
    except Exception as e:
        print(f"Error: {e}")

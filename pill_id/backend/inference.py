from google import genai
from google.genai import types
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from selenium.webdriver.chrome.options import Options
import os
import base64
import json
from selenium import webdriver
import time
import bs4
import requests

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

chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--disable-gpu")  # Disable GPU acceleration (often recommended)

def get_id(drug_name, sleep_time=1):
    # Initialize the WebDriver with the headless option
    driver = webdriver.Chrome(options=chrome_options)

    # Now this will run without opening a window
    driver.get(f"https://www.drugs.com/interaction/list/?searchterm={drug_name}")
    previous_url = driver.current_url

    time.sleep(sleep_time)
    current_url = driver.current_url
    drug_id = None
    if current_url != previous_url:
        print(f'URL changed to: {current_url}')
        drug_id = current_url.split('?drug_list=')[1]
        print(f'Drug ID: {drug_id}')
    else:
        print("URL did not change. Retrying...")
        # In a real scenario, you might want to implement a retry mechanism here
        # For now, we will just exit
        get_id(drug_name, sleep_time + 1)
        
    driver.quit()

    return drug_id

def query_ddi(drug_name1, drug_name2):
    """
    Queries the interactions-check page for the provided drugs and extracts
    instances from the "Drug and food interactions" section.
    
    Each interaction instance is expected to have:
      - A header (<h3>) that includes the drug name and the word "food"
      - A paragraph with "Applies to: ..." text
      - A subsequent paragraph with the description.
    """
    url = f'https://www.drugs.com/interactions-check.php?drug_list={get_id(drug_name1)},{get_id(drug_name2)}'
    response = requests.get(url)
    response.raise_for_status()  # Ensure we got a valid response

    soup = bs4.BeautifulSoup(response.text, 'html.parser')
    # Uncomment the next line to print the entire HTML structure for debugging:
    # print(soup.prettify())

    results = {}

    # Locate the "Drug and food interactions" section header (assumed to be an <h2>)
    header = soup.find('h2', string=lambda s: s and 'drug and food interactions' in s.lower())
    if not header:
        results["message"] = "No 'Drug and food interactions' section found on the page."
        return results

    # The interactions should be inside the next sibling div with the class "interactions-reference-wrapper"
    wrapper = header.find_next_sibling("div", class_="interactions-reference-wrapper")
    if not wrapper:
        results["message"] = "No interactions wrapper found."
        return results

    # Each interaction instance is contained in a div with the class "interactions-reference"
    instances = wrapper.find_all("div", class_="interactions-reference")
    if not instances:
        results["message"] = "No drug-food interaction instances found."
        return results

    def ordinal(n):
        if 10 <= n % 100 <= 20:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
        return str(n) + suffix

    # Process each instance
    for i, instance in enumerate(instances, start=1):
        item = {}
        # The header part of the instance (contains <h3> and the "Applies to:" paragraph)
        header_div = instance.find("div", class_="interactions-reference-header")
        if header_div:
            # Extract the title from the <h3> tag (this will include the drug name and "food")
            h3_tag = header_div.find("h3")
            if h3_tag:
                item["title"] = h3_tag.get_text(" ", strip=True)
            # Extract the "Applies to:" text
            applies_to_tag = header_div.find("p")
            if applies_to_tag:
                item["applies_to"] = applies_to_tag.get_text(strip=True)
        # The description is in one or more <p> tags that are outside the header_div
        description_paragraphs = []
        for p in instance.find_all("p", recursive=False):
            # Skip paragraphs that include a link to the professional version
            if "Switch to professional" in p.get_text():
                continue
            # Skip paragraphs that were already included in the header_div
            if header_div and p in header_div.find_all("p"):
                continue
            description_paragraphs.append(p.get_text(strip=True))
        if description_paragraphs:
            item["description"] = " ".join(description_paragraphs)
        results[f"{ordinal(i)} interaction"] = item

    return results


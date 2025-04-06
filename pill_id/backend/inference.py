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

def parse_html_table(html_str):
    """
    Parses an HTML table and returns its contents as a list of dictionaries.
    Each dictionary represents a row with keys "col1", "col2", etc.
    If a cell contains a <list> element, the cell value becomes a list of
    text from each <item> element.
    """
    soup = BeautifulSoup(html_str, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    
    rows = []
    for tr in table.find_all("tr"):
        cols = tr.find_all("td")
        if not cols:
            continue  # Skip rows without <td> elements
        row = {}
        for i, td in enumerate(cols, start=1):
            list_tag = td.find("list")
            if list_tag:
                items = [item.get_text(strip=True) for item in list_tag.find_all("item")]
                cell_value = items
            else:
                cell_value = td.get_text(strip=True)
            row[f"col{i}"] = cell_value
        rows.append(row)
    return rows

def get_product_labeling(drug_name, limit=1):
    """
    Retrieves product labeling information from openFDA for a given drug's name.
    It first searches using the openFDA.brand_name field; if no results are found,
    it then searches using the openFDA.generic_name field.
    """
    base_url = "https://api.fda.gov/drug/label.json"
    
    # Try searching using the brand name field
    query_brand = f'openfda.brand_name:"{drug_name}"'
    params = {"search": query_brand, "limit": limit}
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data.get("results"):
            return data
    
    # If no results, try searching using the generic name field
    query_generic = f'openfda.generic_name:"{drug_name}"'
    params = {"search": query_generic, "limit": limit}
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data.get("results"):
            return data
    
    print(f"Error {response.status_code}: {response.text}")
    return None

def get_section(drug_name, section_key, limit=1):
    """
    Retrieves a specific section from the product labeling data.
    If the content contains an HTML table, it is parsed into a structured format.
    
    Returns:
        list: A list containing the section data for each result.
    """
    labeling_data = get_product_labeling(drug_name, limit)
    section_results = []
    if not labeling_data:
        return section_results

    for result in labeling_data.get("results", []):
        section_data = result.get(section_key)
        if section_data:
            parsed_data = []
            for content in section_data:
                if "<table" in content.lower():
                    parsed_table = parse_html_table(content)
                    parsed_data.append(parsed_table)
                else:
                    parsed_data.append(content)
            section_results.append(parsed_data)
        else:
            section_results.append(None)
    return section_results

def get_ask_doctor(drug_name, limit=1):
    return get_section(drug_name, "ask_doctor", limit)

def get_ask_doctor_or_pharmacist(drug_name, limit=1):
    return get_section(drug_name, "ask_doctor_or_pharmacist", limit)

def get_stop_use(drug_name, limit=1):
    return get_section(drug_name, "stop_use", limit)

def get_pregnancy_or_breast_feeding(drug_name, limit=1):
    return get_section(drug_name, "pregnancy_or_breast_feeding", limit)

def get_keep_out_of_reach_of_children(drug_name, limit=1):
    return get_section(drug_name, "keep_out_of_reach_of_children", limit)

def get_dosage_and_administration(drug_name, limit=1):
    return get_section(drug_name, "dosage_and_administration", limit)

def get_dosage_and_administration_table(drug_name, limit=1):
    return get_section(drug_name, "dosage_and_administration_table", limit)

def get_indications_and_usage(drug_name, limit=1):
    return get_section(drug_name, "indications_and_usage", limit)

def get_storage_and_handling(drug_name, limit=1):
    return get_section(drug_name, "storage_and_handling", limit)

def get_purpose(drug_name, limit=1):
    return get_section(drug_name, "purpose", limit)

def get_all_info(drug_name, limit=1):
    """
    Retrieves all relevant sections from the product labeling for a given drug.
    
    Returns:
        dict: A dictionary containing all sections retrieved.
    """
    sections = [
        "ask_doctor",
        "ask_doctor_or_pharmacist",
        "stop_use",
        "pregnancy_or_breast_feeding",
        "keep_out_of_reach_of_children",
        "dosage_and_administration",
        "dosage_and_administration_table",
        "storage_and_handling",
        "purpose",
        "indications_and_usage"
    ]
    
    all_info = {}
    for section in sections:
        all_info[section] = get_section(drug_name, section, limit)
    
    return all_info

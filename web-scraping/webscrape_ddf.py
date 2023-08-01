import requests
from bs4 import BeautifulSoup
import json
import re

print('--- DDF Episode Scraper ---')
print('Starting ...')

base_url = "https://dreifragezeichen.de/produktwelt/hoerspiele"  # Replace with the base URL of the audiobook series
page = requests.get(base_url)
soup = BeautifulSoup(page.content, "html.parser")

# Get the amount of subpages
max_page = soup.find('ul', class_='pagination').find_all('li')[-2].text
print(f'Amount of Subpages: {max_page}')

# ------ Get Content from Subpages ------
# iterate over each subpage
#max_page = 2   # limit pages for testing
episode_list = []
for page in range(1, int(max_page)+1):
    subpage_url = f"{base_url}?page={page}"  # Replace with the subpage URL format
    print(f'\nGetting page {page} ...')
    print(f'\t{subpage_url}')

    response = requests.get(subpage_url)
    soup = BeautifulSoup(response.text, "html.parser", from_encoding="utf-8")
    #soup = BeautifulSoup(response.text, 'html.parser')

    # --- Get all episode cards ---
    # Find all the episode elements on the current subpage
    episode_cards = soup.find_all("div", class_="card-expandable")  # Replace with the appropriate HTML element and class

    # --- Extract episode numbers and links ---
    for episode_card in episode_cards:
        # get episode number
        episode_number = episode_card.find("span", class_="d-block").text   # episode number

        # if 'Folge' not 'Special' or something else, skip
        if 'Folge' in episode_number:
            # if episode number already in list, skip
            if any(d['episode_number'] == episode_number for d in episode_list):
                continue
            
            # --- get episode number, title, description, date, image ---
            episode_dict = {}
            episode_dict['episode_number'] = episode_number.strip('Folge ')  # remove 'Folge ' from episode number

            # episode title
            episode_title = episode_card.find("h3", class_="card-title").text 
            episode_title = episode_title.replace('\n', '').replace('\t', '')      # remove \n and \t
            episode_title = episode_title.strip()                                  # remove leading and trailing whitespaces
            episode_dict['episode_title'] = episode_title

            # episode description
            episode_description = episode_card.find('div', class_='card-expander-content').find('p').text   # episode description
            episode_dict['episode_description'] = episode_description
            
            # episode date
            episode_date = episode_card.find('div', class_='card-expander-content-title').find_all('span', class_='d-inline')[2].text
            date_pattern = re.compile(r'\d{2}\.\d{2}\.\d{4}')   # regex pattern for date
            episode_date = date_pattern.search(episode_date).group()   # get date from string
            episode_dict['episode_date'] = episode_date

            # episode image
            episode_image = episode_card.find('img', class_='product-thumb')['src'] 
            episode_dict['episode_image'] = episode_image

            # episode page
            episode_dict['on_page'] = page


            # --- get all links ---
            episode_socialRow = episode_card.find("div", class_="social-row")  # social row with all links
            episode_allLinks = []
            for link in episode_socialRow.find_all('a'):
                episode_allLinks.append(link.get('href'))

            # sort out the episode link by streaming service
            links = {}
            for link in episode_allLinks:
                if 'spotify' in link:
                    links['spotify'] = link
                elif 'apple' in link:
                    links['apple'] = link
                elif 'amazon' in link:
                    links['amazon'] = link
                elif 'youtube' in link:
                    links['youtube'] = link
                elif 'deezer' in link:
                    links['deezer'] = link
                elif 'horspielplayer' in link:
                    links['horspielplayer'] = link
            
            # sort dict alphabetically by key
            links = dict(sorted(links.items()))
            episode_dict['episode_links'] = links

            # add dict to list
            episode_list.append(episode_dict)
            
print(f"\nFound {len(episode_list)} episodes.")

# --- sort and save ---
# sort dict by episode number
episode_list.sort(key=lambda x: int(x['episode_number']))
episode_list_json = json.dumps(episode_list, indent=4)

# write json to file
with open('episode_list.json', 'w') as outfile:
    json.dump(episode_list, outfile, indent=4)
print('\nSaved to episode_list.json')

print('\nDone!')
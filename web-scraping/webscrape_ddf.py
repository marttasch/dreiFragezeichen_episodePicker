import requests
from bs4 import BeautifulSoup
import json
import re
import os
import shutil

print('--- DDF Episode Scraper ---')

root_url = "https://dreifragezeichen.de"  # Replace with the root URL of the audiobook series
base_url = "https://dreifragezeichen.de/produktwelt/hoerspiele"  # Replace with the base URL of the audiobook series

root_url_kids = "https://www.dreifragezeichen-kids.de"  # Replace with the root URL of the audiobook series
base_url_kids = "https://www.dreifragezeichen-kids.de/produktwelt/hoerspiele"  # Replace with the base URL of the audiobook series

output_name = "episode_list.json"  # Replace with the name of the output file
output_name_kids = "episode_list_kids.json"  # Replace with the name of the output file

image_foldername = 'episode_images'  # Replace with the name of the folder where the images should be saved
image_foldername_kids = 'episode_images_kids'  # Replace with the name of the folder where the images should be saved

get_kids_episodes = True  # Set to True to scrape the kids episodes

if get_kids_episodes:
    print('Scraping Kids Episodes ...')
    root_url = root_url_kids
    base_url = base_url_kids
    output_name = output_name_kids
    image_foldername = image_foldername_kids
else:
    print('Scraping Episodes ...')

print('Getting Informations...')

page = requests.get(base_url)
soup = BeautifulSoup(page.content, "html.parser")

max_page = soup.find('ul', class_='pagination').find_all('li')[-2].text
print(f'Amount of Subpages: {max_page}')

# ------ Get Content from Subpages ------
# iterate over each subpage
episode_list = []
for page in range(1, int(max_page)+1):
    subpage_url = f"{base_url}?page={page}"  # Replace with the subpage URL format
    print(f'\nGetting page {page} ...')
    print(f'\t{subpage_url}')

    response = requests.get(subpage_url)
    soup = BeautifulSoup(response.text, "html.parser")
    #soup = BeautifulSoup(response.text, 'html.parser')

    # --- Get all episode cards ---
    # Find all the episode elements on the current subpage
    episode_cards = soup.find_all("div", class_="card-expandable")  # Replace with the appropriate HTML element and class

    # --- Extract episode numbers and links ---
    for episode_card in episode_cards:

        try:
            # get episode number
            episode_number = episode_card.find("span", class_="d-block").text   # episode number

            # if 'Folge' not 'Special' or something else, skip
            if 'Folge' in episode_number:
                # if episode number already in list, skip
                if any(d['episode_number'] == episode_number for d in episode_list):
                    continue
                
                # --- get episode number, title, description, date, image ---
                dict = {}
                dict['episode_number'] = episode_number.strip('Folge ')  # remove 'Folge ' from episode number

                # episode title
                episode_title = episode_card.find("h3", class_="card-title").text 
                episode_title = episode_title.replace('\n', '').replace('\t', '')      # remove \n and \t
                episode_title = episode_title.strip()                                  # remove leading and trailing whitespaces
                dict['episode_title'] = episode_title

                # print episode number and title
                print(f"\t{episode_number} - {episode_title}")

                # episode recommended age
                episode_age = episode_card.find('div', class_='card-expander-content-title').find_all('span', class_='d-inline')[1].text
                # only keep digits
                episode_age = ''.join(filter(str.isdigit, episode_age))
                dict['episode_age'] = episode_age

                print(f"\t{episode_age}")
                
                # episode date
                episode_date = episode_card.find('div', class_='card-expander-content-title').find_all('span', class_='d-inline')[2].text
                date_pattern = re.compile(r'\d{2}\.\d{2}\.\d{4}')   # regex pattern for date
                episode_date = date_pattern.search(episode_date).group()   # get date from string
                dict['episode_date'] = episode_date

                # episode image
                episode_image = episode_card.find('img', class_='product-thumb')['src'] 
                dict['episode_image'] = episode_image

                # episode page
                dict['on_page'] = page


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

                # sort links alphabetically by streaming service
                links = {k: v for k, v in sorted(links.items(), key=lambda item: item[0])}

                #links = dict(sorted(links.items()))
                dict['episode_links'] = links

                # episode page link
                # episode expander
                episode_expander = episode_card.find('div', class_='card-expander-content')
                episode_Pagelink = episode_expander.find('a').get('href')   # episode page link
                episode_Pagelink = f"{root_url}{episode_Pagelink}"   # add base url to link
                dict['episode_Pagelink'] = episode_Pagelink

                # scrape episode page for description
                episode_pageRequest = requests.get(episode_Pagelink)
                episode_pageSoup = BeautifulSoup(episode_pageRequest.text, "html.parser")
                episode_description = episode_pageSoup.find('div', id='info-inhalt').find('p').text   # episode description
                dict['episode_description'] = episode_description

                # add dict to list
                episode_list.append(dict)
        except Exception as e:
            print(f'\tError: {e}')
            continue
print(f"\nFound {len(episode_list)} episodes.")

# ------ sort and save ------
# sort dict by episode number
episode_list.sort(key=lambda x: int(x['episode_number']))

# find duplicate episode numbers and rename them with a suffix
seen = set()
uniq = []
for x in episode_list:
    if x['episode_number'] not in seen:
        uniq.append(x)
        seen.add(x['episode_number'])
    else:
        # find index of duplicate episode number
        index = next((index for (index, d) in enumerate(uniq) if d["episode_number"] == x['episode_number']), None)
        # rename episode number
        x['episode_number'] = f"{x['episode_number']}_1"
        # insert duplicate episode number at index
        uniq.insert(index, x)
        print(f"Duplicate episode number: {x['episode_number']}")

episode_list = uniq

# epsidoe list json
episode_list_json = json.dumps(episode_list, indent=4)

# write json to file
with open(output_name, 'w', encoding='utf-8') as outfile:
    json.dump(episode_list, outfile, indent=4, ensure_ascii=False)    



# ------ download all images from CDN ------
print('\nStart downloading all images from CDN...')
# reverse list
episode_list.reverse()

# create folder if not exists
if not os.path.exists(image_foldername):
    os.makedirs(image_foldername)

# check if image already exists
for episode in episode_list:
    image_url = episode['episode_image']
    image_name = image_url.split('/')[-1]
    if os.path.isfile(f'{image_foldername}/{image_name}'):
        print(f"image {image_name} already exists")
        episode_list.remove(episode)

# download images
for episode in episode_list:
    print(f"\n\tDownloading image {episode['episode_number']} - {episode['episode_title']}...")
    image_url = episode['episode_image']
    image_name = image_url.split('/')[-1]

    # add https to image url
    if not image_url.startswith('https:'):
        image_url = 'https:' + image_url

    res = requests.get(image_url, stream=True)

    if res.status_code == 200:
        with open(f'{image_foldername}/{image_name}', 'wb') as f:
            shutil.copyfileobj(res.raw, f)
            print('\tImage sucessfully Downloaded: ', image_name)
    else:
        print('Image Couldn\'t be retreived', image_name)


print('\nDone!')
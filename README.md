# dieDreiFragezeichen_EpisodePicker
This Repository contains a Python Script to scrape all Episode from dreifragezeichen.de and Webpage to pick a random episode and open with streaming provider.

## Webscraping
The Webscraping is done with the Python Library BeautifulSoup4. The Script will scrape all Episodes from the Website `https://dreifragezeichen.de/produktwelt/hoerspiele` and save them in a JSON File, wich will be used by the Webpage.
- You can use the Script `webscrape_ddf.py` to update the JSON File.
 - The Jupyter Notebook `webscrape_ddf.ipynb` contains the same Code as the Script, but can be used in a more interactive way and also offers to download all Images from the CDN to be used locally on the Webpage, wich is a more privacy friendly way.

## Webpage
The Webpage is a simple HTML Page with a little bit of CSS and JavaScript. It uses the JSON File to pick a random Episode and open the Episode on the Streaming Provider of your choice. 
The Webpage is hosted on GitHub Pages and can be found here: https://ddf.taschcloud.de/
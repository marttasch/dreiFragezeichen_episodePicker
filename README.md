# dieDreiFragezeichen_EpisodePicker
This is a little Project to make it easier to pick a Episode of the German Hörspielserie "Die drei Fragezeichen" and open it on the Streaming Provider of your choice, because it can be hard to quickly pick on of the 200+ Episodes on different Streaming Providers (Spotify, Deezer, Amazon Music, Apple Music, YouTube Music, ...).

Therefore I created a little Webpage, that picks a random Episode and lets you open it on the Streaming Provider of your choice. You can also favorite Episodes.

## Features
- Pick a random Episode
- Open the Episode on the Streaming Provider of your choice
- Favorite Episodes
- Install as PWA and use it offline


## Webpage
The Webpage is hosted on GitHub Pages and can be found here: 
https://ddf.martintasch.de

It is a simple HTML Page with some JavaScript and CSS. The JavaScript is used to load the JSON File with the Episodes and to display the Episodes on the Page. The page is responsive and should work on all devices, but it is optimized for mobile devices. Also the page can be installed as a PWA (Progressive Web App) and can be used offline.

All assets are loaded from the GitHub Repository, so there are no external dependencies. There are no Cookies or other tracking methods used on the page.

## Webscraping
The Webscraping is done with the Python Library BeautifulSoup4. The Script will scrape all Episodes from the Website `https://dreifragezeichen.de/produktwelt/hoerspiele` and save them in a JSON File, wich will be used by the Webpage.
- You can use the Script `webscrape_ddf.py` to update the JSON File.
- The Jupyter Notebook `webscrape_ddf.ipynb` contains the same Code as the Script, but can be used in a more interactive way.

The JSON File for the hosted Webpage is not being updated automatically. If you want to update the JSON File, you have to run the Script manually.



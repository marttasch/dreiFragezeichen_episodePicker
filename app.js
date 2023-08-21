// get root path of website
var rootPath = window.location.pathname.split('/').slice(0, -1).join('/');

var jsonData; // Variable to store the JSON data
let dropdown = document.getElementById('episode_dropdown');

// ###### Functions ######
// #### Setup ####
// Function to read the JSON file
function readJSONFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
// Function to display the JSON data
function displayJSONData(data) {
    jsonData = JSON.parse(data);
    console.log('JSON data loaded')
    //outputElement.textContent = JSON.stringify(jsonData, null, 4);
}
function createDropdown() {
    // create dropdown with all episodes
    for (var i = 0; i < jsonData.length; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.text = jsonData[i]['episode_number'] + ' - ' + jsonData[i]['episode_title'];
        document.getElementById('episode_dropdown').appendChild(option);
    }

    // add event listener to dropdown
    document.getElementById('episode_dropdown').addEventListener('change', function() {
        setEpisodeContainer('episodeContainerTransition', jsonData[this.value]);
        displayEpisode(pickRandomEntry());
    });
};

// #### Change Tab ####
function changeTab(tabIndex) {
    var tabs = document.getElementsByClassName('tab');
    var content = document.getElementsByClassName('content');

    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
        content[i].classList.add('hidden');
        //content[i].style.display = 'none';
    }

    tabs[tabIndex].classList.add('active');
    content[tabIndex].classList.remove('hidden');
    //content[tabIndex].style.display = 'block';
}
function onFavoritesTabHandler(tabIndex=1) {
    listFavorites();
    changeTab(tabIndex);
}

// #### Random Episode ####
// Function to pick a random entry from the JSON data
function pickRandomEntry() {
    var outputElement = document.getElementById('episodeContainer');
    if (jsonData && jsonData.length > 0) {
        var randomIndex = Math.floor(Math.random() * jsonData.length);
        var randomEntry = jsonData[randomIndex];

        // if image is local available, replace path with local path
        imageURL = randomEntry['episode_image'];
        imageName = imageURL.split('/').pop();
        // replace image path with local path
        //check if rootPath is set and ends with a slash
        if (rootPath && rootPath.slice(-1) != '/') {
            rootPath = rootPath + '/';
        }
        randomEntry['episode_image'] = rootPath + 'assets/episode_images/' + imageName;      
    } else {
        outputElement.textContent = "No Episode data available.";
        console.log('No JSON data available. Cant pick random entry.')
    }

    return randomEntry;
}

function getHTMLOutput(randomEntry){
    // --- streaming links
    var linkList = document.createElement('div');
    linkList.className = 'link_list';

    // add links to list if not empty
    for (const [key, value] of Object.entries(randomEntry['episode_links'])) {
        if (value != '') {
            var linkItem = document.createElement('div');
            linkItem.className = 'link_item';
            var link = document.createElement('a');
            link.className = 'link ' + key.toLowerCase();
            link.href = value;
            link.target = '_blank';
            if (key == 'horspielplayer') {
                link.innerHTML = '<iconify-icon icon="mdi:play-circle-outline"></iconify-icon>'
                //link.innerHTML = '<i class="link-icon fa-solid fa-circle-play"></i>';
                link.innerHTML += '<p class="link-name">Hörspielplayer</p>' ;
            } else {
                // make capital letter uppercase
                keyCapital = key.charAt(0).toUpperCase() + key.slice(1);

                link.innerHTML = '<iconify-icon icon="fa-brands:' + key.toLowerCase() + '"></iconify-icon>';
                link.innerHTML += '<p class="link-name">' + keyCapital + '</p>' ;
            }
            linkItem.appendChild(link);
            linkList.appendChild(linkItem);
        };
    };

    // if episode is in favorites, mark it
    favorites = JSON.parse(localStorage.getItem('favorites'));
    if (!favorites) {
        favorites = [];
    }
    if (favorites.includes(randomEntry['episode_number'])) {
        var favoriteIcon = '<iconify-icon icon="mdi:heart"></iconify-icon>';
    } else {
        var favoriteIcon = '<iconify-icon icon="mdi:heart-outline"></iconify-icon>';
    }

    
    var htmlOutput = `
        <span class="title">    
            <h2>${randomEntry['episode_title']}</h2>
            <div class="subtitle">
                <h3>Folge ${randomEntry['episode_number']}</h3> - <p>${randomEntry['episode_date']}</p>
            </div>
        </span>
        <span class="thumb" >
            <img id="episodeThumb" src="${randomEntry['episode_image']}" alt="${randomEntry['episode_title']}">
        </span>
        
        <span class="markFavorite" onClick="markFavoriteHandler()" >${favoriteIcon}</span>
        <div class="episode_description short_description" ><p>${randomEntry['episode_description'].split(' ').slice(0, 25).join(' ') + ' [...]'}</p></div>
        <div class="episode_description long_description" ><p>${randomEntry['episode_description']}</p></div>
        <button id="btn-readMore" class="btn" onClick="readMoreHandler()" ><iconify-icon icon="mingcute:more-3-line"></iconify-icon>mehr lesen</button>
        <a href="${randomEntry['episode_Pagelink']}" target="blank" ><button id="btn-moreInfo" class="btn" ><iconify-icon icon="material-symbols:info-outline"></iconify-icon>Weitere Infos</Button></a>
        ${linkList.outerHTML}
    `;
    return htmlOutput;
}
// fuction to set an episode container with entry
function setEpisodeContainer(containerID, randomEntry){
    var htmlOutput = getHTMLOutput(randomEntry)
    var container = document.getElementById(containerID);

    container.innerHTML = htmlOutput;
    container.style.backgroundImage = 'url(' + randomEntry['episode_image'] +')';
    // add custom attributes to episode container
    container.setAttribute('episodeIndex', jsonData.indexOf(randomEntry));
    container.setAttribute('episodeNumber', randomEntry['episode_number']);
    container.setAttribute('episodeTitle', randomEntry['episode_title']);
}

// function to display an episode, handles transition
function displayEpisode(randomEntry) {
    var episodeContainer = document.getElementById('episodeContainer');
    var episodeContainerTransiton = document.getElementById('episodeContainerTransition');  
    
    var htmlOutput = getHTMLOutput(randomEntry)

    // fade in new episode
    episodeContainerTransiton.style.opacity = 1;
    episodeContainerTransiton.style.zIndex = 10;
    episodeContainer.style.zIndex = -1;
    
    // get current episode index
    var currentIndex = episodeContainerTransiton.getAttribute('episodeIndex');
    var currentEntry = jsonData[currentIndex];
    document.getElementById('episode_dropdown').value = currentIndex;  

    // hide episodeContainerTransition
    setTimeout(function(){
        setEpisodeContainer('episodeContainer', currentEntry);
        episodeContainerTransiton.style.opacity = 0;
        episodeContainerTransiton.style.zIndex = -1;
        episodeContainer.style.zIndex = 10;
    }, 400);
    // prepare and load next episode for transition
    setTimeout(function(){
        setEpisodeContainer('episodeContainerTransition', randomEntry);
    }, 900);
}

// --- Button Handler ---
function shuffleButtonHandler() {   
    var randomEntry = pickRandomEntry();
    displayEpisode(randomEntry);
}
function readMoreHandler(){
    document.querySelector('.short_description').style.display = 'none';
    document.querySelector('.long_description').style.display = 'block';
    document.getElementById('btn-readMore').style.display = 'none';
}


// #### Favorites ####
function markFavoriteHandler(){
    favorites = JSON.parse(localStorage.getItem('favorites'));
    if (!favorites) {
        favorites = [];
    }
    //get episode index
    var episodeNumber = document.getElementById('episodeContainer').getAttribute('episodeNumber');

    // if marked as favorite, unmark it
    if (favorites.includes(episodeNumber)) {
        // -- unmark favorite
        favorites.splice(favorites.indexOf(episodeNumber), 1);   // remove item from favorites
        localStorage.setItem('favorites', JSON.stringify(favorites));   // save favorites to local storage
        document.querySelector('.markFavorite').innerHTML = '<iconify-icon icon="mdi:heart-outline"></iconify-icon>';   // change icon
    } else {
        // -- mark favorite
        favorites.push(episodeNumber);   // add item to favorites
        favorites = [...new Set(favorites)];   // remove duplicates
        localStorage.setItem('favorites', JSON.stringify(favorites));    // save favorites to local storage
        document.querySelector('.markFavorite').innerHTML = '<iconify-icon icon="mdi:heart"></iconify-icon>';   // change icon
    }
}

// fuction to display all favorites 
function listFavorites() {
    favoritesContainer = document.getElementById('favoritesContainer');
    favoritesContainer.innerHTML = '';

    favorites = JSON.parse(localStorage.getItem('favorites'));
    if (!favorites) {
        favorites = [];
    }
    if (favorites.length > 0) {
        // sort favorites by episode number
        favorites.sort(function(a, b){return a-b});

        // create container for each favorite
        for (var i = 0; i < favorites.length; i++) {
            var episodeNumber = favorites[i]
            // search for episode with episodeNumber in jsonData
            var episode = jsonData.find(episode => episode['episode_number'] == episodeNumber);

            container = document.createElement('div');
            container.className = 'FavEpisodeContainer';
            container.style.backgroundImage = 'url(' + episode['episode_image'] +')';
            container.setAttribute('episodeNumber', episode['episode_number']);
            container.setAttribute('episodeTitle', episode['episode_title']);
            container.setAttribute('episodeIndex', jsonData.indexOf(episode));
            container.setAttribute('onClick', 'favEpisodeContainerHandler(this)');

            container.innerHTML = `
                <span class="thumb" >
                    <img id="episodeThumb" src="${episode['episode_image']}" alt="${episode['episode_title']}">
                </span>
                <span class="infos">
                    <h2>${episode['episode_title']}</h2>
                    <div class="subtitle">
                        <h3>Folge ${episode['episode_number']}</h3> - <p>${episode['episode_date']}</p>
                    </div>
                </span>
                    `
            favoritesContainer.appendChild(container);
        }
    } else {
        favoritesContainer.innerHTML = '<p>Keine Favoriten vorhanden.</p>';
        console.log('No favorites available.');
    }
}

// function to handle click on favorite episode container
function favEpisodeContainerHandler(container) {
    var episodeNumber = container.getAttribute('episodeNumber');
    // search for episode with episodeNumber in jsonData
    var episode = jsonData.find(episode => episode['episode_number'] == episodeNumber);
    var episodeIndex = jsonData.indexOf(episode);

    document.getElementById('episode_dropdown').value = episodeIndex;  
    setEpisodeContainer('episodeContainer', episode);
    changeTab(0);
}

// ###### Main #####
// #################
// -- variables --
var episodeContainer = document.getElementById('episodeContainer');
var episodeContainerTransiton = document.getElementById('episodeContainerTransition');  

var jsonFilePath = "episode_list.json";   // Specify the path to your JSON file

// Read the JSON file
readJSONFile(jsonFilePath, displayJSONData);

// wait for JSON data to be loaded, break if not loaded after 5 seconds
setTimeout(function(){
    createDropdown();
    listFavorites();
    // Pick a random entry from the JSON data and display it
    var randomEntry = pickRandomEntry();
    setEpisodeContainer('episodeContainer', randomEntry);
    episodeContainer.style.opacity = 1;
    document.getElementById('episode_dropdown').value = jsonData.indexOf(randomEntry);

    // prepare next episode in transition container
    var randomEntry = pickRandomEntry();
    setEpisodeContainer('episodeContainerTransition', randomEntry);
    episodeContainerTransiton.style.opacity = 0;


    // install service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceWorker.js')
            .then((reg) => console.log('service worker registered', reg))
            .catch((err) => console.log('service worker not registered', err));
    } else {
        console.log('service worker not supported');
    }


}, 300);


// Check if the PWA install prompt event is supported in the current browser
if ('onbeforeinstallprompt' in window) {
    console.log('PWA installation is possible');
    let deferredPrompt;

    // Function to show the install button when the PWA installation is possible
    const showInstallButton = () => {
        const installButtonWrapper = document.getElementById('installButtonWrapper');
        installButtonWrapper.style.display = 'block';
    };
    

    // Function to handle the PWA installation
    const handleInstall = () => {
        console.log('PWA installation triggered');
        if (deferredPrompt) {
            // Show the PWA installation prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('PWA installation accepted');
                } else {
                    console.log('PWA installation dismissed');
                }
                deferredPrompt = null;
            });
        }
    };

    // Event listener to show the install button when the PWA installation is possible
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    // add event listener to install button
    document.getElementById('installButton').addEventListener('click', handleInstall);
} else {
    console.log('PWA installation is not possible');
}


// set headerImage src to root path/assets/die-drei-fragezeichen-logo.png
var headerImage = document.getElementById('headerImage');
headerImage.src = rootPath + '/assets/die-drei-fragezeichen-logo.png';










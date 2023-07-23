var jsonData; // Variable to store the JSON data

let dropdown = document.getElementById('episode_dropdown');

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
    var outputElement = document.getElementById('output');
    jsonData = JSON.parse(data);
    console.log('JSON data loaded')
    //outputElement.textContent = JSON.stringify(jsonData, null, 4);
}


// Function to pick a random entry from the JSON data
function pickRandomEntry() {
    var outputElement = document.getElementById('output');
    if (jsonData && jsonData.length > 0) {
        var randomIndex = Math.floor(Math.random() * jsonData.length);
        var randomEntry = jsonData[randomIndex];

        // if image is local available, replace path with local path
        imageURL = randomEntry['episode_image'];
        imageName = imageURL.split('/').pop();
        // rplace image path with local path
        randomEntry['episode_image'] = '/images/' + imageName;

        document.getElementById('episode_dropdown').value = randomIndex;

        displayEpisode(randomEntry);

        
    } else {
        outputElement.textContent = "No JSON data available.";
    }
}



function displayEpisode(randomEntry) {
    var outputElement = document.getElementById('output');
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
                link.innerHTML = '<i class="link-icon fa-solid fa-circle-play"></i>';
                link.innerHTML += '<p class="link-name">Hörspielplayer</p>' ;
            } else {
                link.innerHTML = '<i class="link-icon fa-brands fa-' + key.toLowerCase() + '"></i>';
                link.innerHTML += '<p class="link-name">' + key + '</p>' ;
            }
            linkItem.appendChild(link);
            linkList.appendChild(linkItem);
        };
    };
    
    var htmlOutput = `
        <span class="title">    
            <h2>${randomEntry['episode_title']}</h2>
            <div class="subtitle">
                <h3>Folge ${randomEntry['episode_number']}</h3> - <p>${randomEntry['episode_date']}</p>
            </div>
        </span>
        <span class="thumb"><img src="${randomEntry['episode_image']}" alt="${randomEntry['episode_title']}"></span>
        <div class="episode_description" ><p>${randomEntry['episode_description']}</p></div>
        ${linkList.outerHTML}

    `;
    outputElement.innerHTML = htmlOutput;
    outputElement.style.backgroundImage = 'url(' + randomEntry['episode_image'] + ')';
}

// Specify the path to your JSON file
var jsonFilePath = "episode_list.json";

// Read the JSON file and display the data
readJSONFile(jsonFilePath, displayJSONData);

// Pick a random entry from the JSON data
pickRandomEntry();

function createDropdown() {
    // create dropdown with all episodes
    for (var i = 0; i < jsonData.length; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.text = jsonData[i]['episode_number'] + ' - ' + jsonData[i]['episode_title'];
        document.getElementById('episode_dropdown').appendChild(option);
    }
    document.getElementById('episode_dropdown').addEventListener('change', function() {
        displayEpisode(jsonData[this.value]);
    });
};

// install service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then((reg) => console.log('service worker registered', reg))
        .catch((err) => console.log('service worker not registered', err));
} else {
    console.log('service worker not supported');
}
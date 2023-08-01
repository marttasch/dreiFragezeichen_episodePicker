const staticCacheName = 'site-static-v1';

let assets = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/episode_list.json',
    '/images/ddf_cd_167.jpg',
    '/images/*.jpg'
]

// read the JSON file and store the image URLs in assets
for (var i = 0; i < jsonData.length; i++) {
    assets.push(jsonData[i]['episode_image']);
}

console.log(assets);

// install event
self.addEventListener('install', evt => {
    //console.log('service worker installed');
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', evt => {
    //console.log('fetch event', evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    )
});
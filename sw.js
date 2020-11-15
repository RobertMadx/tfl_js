const statisCacheName='site-static-v10';
const dynamicCacheName='site-dynamic-v10';
const assets = [
    '/tfl_js/',
    '/tfl_js/tfl_js/index.html',
    '/tfl_js/tfl_js/database.html',
    '/tfl_js/tfl_js/index.js',
    '/tfl_js/tfl_js/helper.js',
    '/tfl_js/tfl_js/jquery-3.5.1.min.js',
    '/tfl_js/tfl_js/style.css',
    '/tfl_js/tfl_js/bootstrap.min.css',
    '/tfl_js/tfl_js/bootstrap.min.css.map',
    '/tfl_js/tfl_js/manifest.json',
    '/tfl_js/tfl_js/bootstrap.min.js',
    '/tfl_js/tfl_js/db.js',
    '/tfl_js/tfl_js/favicon.ico',
    '/tfl_js/tfl_js/icon-144x144.png',
    '/tfl_js/tfl_js/jsstore.min.js',
    '/tfl_js/tfl_js/jsstore.worker.min.js',
    '/tfl_js/tfl_js/popper.min.js',
];

self.addEventListener('install', evt => {
    //console.log('Service worked has been installed')
    evt.waitUntil(
        caches.open(statisCacheName).then(cache => {
            console.log('Caching')
            cache.addAll(assets);
        })
    )
});

self.addEventListener('activate', evt => {
    //console.log('Service worked has been activated')
    evt.waitUntil(
        caches.keys().then(keys =>{
            //console.log(keys);
            return Promise.all(
                keys.filter(key => key !== statisCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    )
})

self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes =>{
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone())
                    return fetchRes;
                })
            });
        })
    )
})
const statisCacheName='site-static-v9';
const dynamicCacheName='site-dynamic-v9';
const assets = [
    '/tfl_js/',
    '/tfl_js/index.html',
    '/tfl_js/database.html',
    '/tfl_js/js/index.js',
    '/tfl_js/js/helper.js',
    '/tfl_js/js/jquery-3.5.1.min.js',
    '/tfl_js/js/jsstore.min.js',
    '/tfl_js/js/jsstore.worker.min',
    '/tfl_js/css/style.css',
    '/tfl_js/css/bootstrap.min.css',
    '/tfl_js/css/bootstrap.min.css.map',
    '/tfl_js/manifest.json',
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
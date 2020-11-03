const statisCacheName='site-static-v2';
const dynamicCacheName='site-dynamic-v2';
const assets = [
    './',
    './index.html',
    './js/index.js',
    './js/jquery-3.5.1.min.js',
    './js/jsstore.min.js',
    './js/jsstore.worker.min',
    './css/style.css',
    './css/bootstrap.min.css',
    '/manifest.json',
    '/img/icons/icon-144x144.png'
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
    //console.log('fetch event',evt)
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
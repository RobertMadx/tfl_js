const statisCacheName='site-static-v10';
const dynamicCacheName='site-dynamic-v10';
const assets = [
    './',
    './index.html',
    './database.html',
    './index.js',
    './helper.js',
    './jquery-3.5.1.min.js',
    './style.css',
    './bootstrap.min.css',
    './bootstrap.min.css.map',
    './manifest.json',
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
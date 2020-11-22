var APP_PREFIX = 'TheFinishLine_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_13'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [                            // Add URL you want to cache in this list.
    '/tfl_js/',                     // If you have separate JS/CSS files,
    '/tfl_js/index.html',            // add path to those files here
    '/tfl_js/database.html',
    '/tfl_js/entries.html',
    '/tfl_js/results.html',
    '/tfl_js/season_class.html',
    '/tfl_js/racers.html',
    '/tfl_js/js/index.js',
    '/tfl_js/js/results.js',
    '/tfl_js/js/database.js',
    '/tfl_js/js/helper.js',
    '/tfl_js/js/jquery-3.5.1.min.js',
    '/tfl_js/css/bootstrap.min.css',
    '/tfl_js/css/bootstrap.min.css.map',
    '/tfl_js/manifest.json',
    '/tfl_js/js/bootstrap.min.js',
    '/tfl_js/js/db.js',
    '/tfl_js/js/entries.js',
    '/tfl_js/js/racers.js',
    '/tfl_js/js/season_class.js',
    '/tfl_js/favicon.ico',
    '/tfl_js/img/icons/icon-72x72.png',
    '/tfl_js/img/icons/icon-96x96.png',
    '/tfl_js/img/icons/icon-128x128.png',
    '/tfl_js/img/icons/icon-144x144.png',
    '/tfl_js/img/icons/icon-152x152.png',
    '/tfl_js/img/icons/icon-192x192.png',
    '/tfl_js/img/icons/icon-384x384.png',
    '/tfl_js/img/icons/icon-512x512.png',
    '/tfl_js/js/jsstore.min.js',
    '/tfl_js/js/jsstore.worker.min.js',
    '/tfl_js/js/popper.min.js',
    '/tfl_js/js/jszip.js',
    '/tfl_js/js/xlsx.core.min.js',
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    // console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
                // console.log('responding with cache : ' + e.request.url)
                return request
            } else {       // if there are no cache, try fetching request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }

            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })
    )
})

// Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(URLS)
        })
    )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            // `keyList` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create white list
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX)
            })
            // add current cache name to white list
            cacheWhitelist.push(CACHE_NAME)
            console.log(`new cache added: ${CACHE_NAME}`)

            return Promise.all(keyList.map(function (key, i) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i])
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
})
var APP_PREFIX = 'TheFinishLine_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_02'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [                            // Add URL you want to cache in this list.
    '/tfl_js/',                     // If you have separate JS/CSS files,
    '/tfl_js/index.html',            // add path to those files here
    '/tfl_js/database.html',
    '/tfl_js/index.js',
    '/tfl_js/helper.js',
    '/tfl_js/jquery-3.5.1.min.js',
    '/tfl_js/style.css',
    '/tfl_js/bootstrap.min.css',
    '/tfl_js/bootstrap.min.css.map',
    '/tfl_js/manifest.json',
    '/tfl_js/bootstrap.min.js',
    '/tfl_js/db.js',
    '/tfl_js/favicon.ico',
    '/tfl_js/icon-144x144.png',
    '/tfl_js/jsstore.min.js',
    '/tfl_js/jsstore.worker.min.js',
    '/tfl_js/popper.min.js',
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
                console.log('responding with cache : ' + e.request.url)
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

            return Promise.all(keyList.map(function (key, i) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i])
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
})
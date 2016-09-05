// Only supported in Chrome
// https://wicg.github.io/BackgroundSync/spec/

var version = "v3";

self.addEventListener('install', function(event) {
    console.log("Installing service worker for offline");
    event.waitUntil(
        caches.open("offline-demo-" + version).then(function(cache) {
            return cache.addAll([
                '/offline-demo/',
                '/offline-demo/index.css',
                '/offline-demo/index.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                    if (response) {
                        console.log("Fetching from cache:", event.request.url);
                        return response;
                    } else {
                        console.log("Fetching from server:", event.request.url);
                        return fetch(event.request);
                    }
                }
            )
    );
});

self.addEventListener('activate', function(event) {
    console.log("Service worker activating");
    self.clients.claim();

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== "offline-demo-" + version) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('sync', function(event) {
    event.waitUntil(sendLocalImages());
});


self.addEventListener('periodicsync', function(event) {
    event.waitUntil(sendLocalImages());
});


function sendLocalImages() {
    console.log("Service worker will delete local images");

    return new Promise(function(resolve, reject) {
        var request = indexedDB.open("database");

        request.onsuccess = function() {
            db = request.result;

            var objectStore = db.transaction(["multimedia"], "readwrite").objectStore("multimedia");

            objectStore.onerror = function(event) {
                console.log(error.message);
                reject(new Error("Database error"));
            };

            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    notifyClients();
                    resolve();
                }
            };

        };
    });
}


function notifyClients() {
    clients.matchAll().then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            console.log("Notifying client");
            client.postMessage("ok");
        }
    });
}





// Only supported in Chrome or Firefox


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('offline-demo-v1').then(function(cache) {
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
                    console.log('[fetch] Returning from Service Worker cache: ',event.request.url);
                    return response;
                } else {
                    console.log('[fetch] Returning from server: ', event.request.url);
                    return fetch(event.request);
                }
            }
            )
    );
});
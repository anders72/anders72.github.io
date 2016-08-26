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
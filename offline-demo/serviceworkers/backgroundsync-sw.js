// Only supported in Chrome
// https://wicg.github.io/BackgroundSync/spec/


self.addEventListener('sync', function(event) {
    event.waitUntil(sendLocalImages());
});


self.addEventListener('periodicsync', function(event) {
    event.waitUntil(sendLocalImages());
});


function sendLocalImages() {
    return new Promise((resolve, reject) => {
        var request = indexedDB.open("database");

        request.onsuccess = function() {
            db = request.result;

            var objectStore = db.transaction(["multimedia"], "readwrite").objectStore("multimedia");

            objectStore.onerror = function(event) {
                console.log(error.message);
                reject(new Error("Database error"));
            };

            objectStore.openCursor().onsuccess = function(event) {
                console.log("cursor");
                var cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                    notifyClients();
                }
            };

        };
    });
}


function notifyClients() {
    clients.matchAll({includeUncontrolled: true}).then(clientList => {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            client.postMessage("ok");
        }
    });
}
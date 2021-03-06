var db;

createDataBase();
addEventListeners();
registerServiceWorker();


function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('offline-sw.js', { scope: '/offline-demo/' })
            .catch(function(error) {
                console.log(error.message);

        });

        navigator.serviceWorker.addEventListener('message', function(event){
            var message = event.data;
            log("Service worker has sent us a message:" + message);
            if (message == "update") {
                displayLocalFiles();
            }
        });
    }
}


function log(logMessage) {
    var log = document.getElementById("log");
    var p = document.createElement("p");
    p.innerText = logMessage;
    log.appendChild(p);
}

function performSingleSync(event) {
    event.preventDefault();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(serviceWorkerReg) {
            if (serviceWorkerReg.sync) {
                serviceWorkerReg.sync.register('multimediaSync')
                    .then(function() {
                        log("Sync registered");
                    }).catch(function(error) {
                        log("Setup sync failed");
                    });
            } else {
                // Sync not supported
                log("Browser does not support sync");
            }
        });
    } else {
        // Sync without service worker
        log("Browser does not support sync");
    }
}

function setupPeriodicSync(event) {
    event.preventDefault();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(serviceWorkerReg) {
            if (serviceWorkerReg.periodicSync) {
                log("Setup periodic service worker sync");
                serviceWorkerReg.periodicSync.register({
                    tag: 'periodicSync',
                    minPeriod: 0,
                    powerState: 'auto',
                    networkState: 'any'
                }).then(function(event){
                    console.log("Periodic sync was registered");
                }).catch(function(error) {
                    console.log("Setup periodic sync failed");
                });
            } else {
                // Sync not supported
                log("Browser does not support sync");
            }
        });
    } else {
        // Sync without service worker
        log("Browser does not support sync");
    }

}

function addEventListeners() {
    // Buttons
    var input = document.getElementById("fileInput");
    input.addEventListener("change", handleFileSelect);

    var syncButton = document.getElementById("syncButton");
    syncButton.addEventListener("click", performSingleSync);

    var syncPeriodicButton = document.getElementById("syncPeriodicButton");
    syncPeriodicButton.addEventListener("click", setupPeriodicSync);


    // Network information
    window.addEventListener('online', networkOnline);
    window.addEventListener('offline', networkOffline);

    // Network type - Chrome on Android
    if ('connection' in navigator) {
        navigator.connection.addEventListener('typechange', function(e) {
            var networkInfo = e.target;
            log("Connection type: " + networkInfo.type);
        });
    }
}

function handleFileSelect(e) {
    var files = e.target.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        saveFileLocally(file);
    }
}

function saveFileLocally(file) {
    var transaction = db.transaction("multimedia", "readwrite");

    var addRequest = transaction.objectStore("multimedia").put(file, file.name);
    addRequest.onsuccess = function() {
        log("Saved file in browser:" + file.name);
        addImageToPage(file);
    };

    addRequest.onerror = function(event) {
        alert(event.target.error);
    };
}

function displayLocalFiles() {
    document.getElementById("imageList").innerHTML = "";

    var objectStore = db.transaction("multimedia", "readonly").objectStore("multimedia");

    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            addImageToPage(cursor.value);
            cursor.continue();
        }
    };

}

function addImageToPage(file) {
    var imageList = document.getElementById("imageList");

    var img = document.createElement("img");
    img.src = window.URL.createObjectURL(file);

    img.onload = function() {
        window.URL.revokeObjectURL(this.src);
    };

    imageList.appendChild(img);
}

function createDataBase() {
    var request = window.indexedDB.open("database");

    request.onupgradeneeded = function() {
        // Create object store
        var db = request.result;
        db.createObjectStore("multimedia");
    };

    request.onsuccess = function() {
        db = request.result;
        displayLocalFiles();
    };
}


function networkOnline() {
    log("Network is online");
}

function networkOffline() {
    log("Network is offline");
}
let db;
const request = indexedDB.open("budget", 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)

request.onupgradeneeded = function({ target }) {
    const db = target.result;
    db.createObjectStore("entry", { autoIncrement: true });
};

request.onsuccess = function({ target }) {
    db = target.result;
    if (navigator.onLine) {
        uploadEntry();
    }
};

request.onerror = function({ target }) {
    // log error here
    console.log(target.errorCode);
};

// This function will be executed if we attempt to submit a new entry and there's no internet connection

function saveRecord(record) {
    const transaction = db.transaction(["entry"], "readwrite");
    const entryObjectStore = transaction.objectStore("entry");
    entryObjectStore.add(record);
}

function uploadEntry() {
    const transaction = db.transaction(["entry"], "readwrite");
    const entryObjectStore = transaction.objectStore("entry");
    const getAll = entryObjectStore.getAll();
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
              // open one more transaction
              const transaction = db.transaction(["entry"], 'readwrite');
              const entryObjectStore = transaction.objectStore("entry");
              // clear all items in your store
              entryObjectStore.clear();
    
              alert('All saved entries have been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
      };
}

window.addEventListener('online', uploadEntry);
let db;
const request = indexedDB.open("budget", 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)

request.onupgradeneeded = function({ target }) {
    const db = target.result;
    db.createObjectStore("entry", { autoIncrement: true });
};

request.onsuccess = funnction({ target }) {
    db = target.result;

    if (navigator.onLine) {
        // uploadEntry();
    }
};

request.onerror = function({ target }) {
    // log error here
    console.log(target.errorCode);
}
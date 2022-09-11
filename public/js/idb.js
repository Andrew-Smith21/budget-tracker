// creating variable to hold db connection
let db;

// establish conection, name it, set the version as 1
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the db version changes including the initial 1
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store, set an auto incrementing primary key 
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
    db = event.target.result;

    // check if app is online, if yes upload the data to send local db data to api
    if (navigator.online) {
        // uncomment once created
        // uploadTransactions();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// function will execute if we attempt to submit a new transaction and are offline
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to the object store
    transactionObjectStore.add(record);
}
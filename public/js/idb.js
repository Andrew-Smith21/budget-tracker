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
        uploadTransactions();
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

// function to upload data when reconnected
function uploadTransactions() {
    // open transaction on the db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
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

                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const transactionObjectStore = transaction.objectStore('new_transaction');

                transactionObjectStore.clear();

                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};

// listen for app coming back online
window.addEventListener('online', uploadTransactions);
const request = window.indexedDB.open("Track", 1);
let db,
    tx,
    store;

request.onupgradeneeded = function (e) {
    const db = request.result;
    db.createObjectStore("pending", { keyPath: "_id" });
};

request.onerror = function (e) {
    console.log("There was an error");
};

request.onsuccess = function (e) {
    db = request.result;
    tx = db.transaction(["pending"], "readwrite");
    store = tx.objectStore("pending");

    db.onerror = function (e) {
        console.log("error");
    };
    if (method === "put") {
        store.put(object);
    } else if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function () {
            resolve(all.result);
        };
    } else if (method === "delete") {
        store.delete(object._id);
    }
    tx.oncomplete = function () {
        db.close();
    };

    if(navigator.onLine){
        checkDb();
    }
};

function checkDb() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function () {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(() => {
            const transaction = db.transaction(["pending"], "readwrite");
            const store = transaction.objectStore("pending");
            store.clear();
          });
      }
    };
  }

window.addEventListener("online", checkDb)
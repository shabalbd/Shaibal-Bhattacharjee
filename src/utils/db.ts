const DB_NAME = 'academic_portfolio_db';
const STORE_NAME = 'site_data';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves a key-value record to the browser's IndexedDB.
 * Supports large payloads (such as multiple base64 files and high-res images) up to 5GB.
 */
export async function saveToIndexedDB(key: string, value: any): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('IndexedDB put operation failed:', request.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('IndexedDB initialization failed:', err);
    return false;
  }
}

/**
 * Fetch a key-value record from IndexedDB.
 */
export async function getFromIndexedDB(key: string): Promise<any> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('IndexedDB get operation failed:', request.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('IndexedDB fetching failed:', err);
    return null;
  }
}

/**
 * Removes a key-value record from IndexedDB.
 */
export async function removeFromIndexedDB(key: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('IndexedDB delete operation failed:', request.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('IndexedDB deletion failed:', err);
    return false;
  }
}

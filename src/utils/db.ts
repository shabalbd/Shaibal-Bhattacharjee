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

/**
 * Recursively overlays/merges keys and array elements representing new codebase components or fields
 * from codeMaster (INITIAL_DATA) to the stored data, ensuring zero database-overwriting loss while
 * automatically displaying newly added publications, blogs, or config fields.
 */
export function smartMergeData(stored: any, codeMaster: any): { merged: any; updated: boolean } {
  let updated = false;

  if (typeof stored !== typeof codeMaster || stored === null || codeMaster === null) {
    return { merged: codeMaster, updated: true };
  }

  // Handle arrays
  if (Array.isArray(codeMaster)) {
    if (!Array.isArray(stored)) {
      return { merged: codeMaster, updated: true };
    }

    const mergedArray = [...stored];
    // Check if items in codeMaster are missing in stored
    for (const codeItem of codeMaster) {
      if (codeItem && typeof codeItem === 'object' && codeItem.id) {
        // Match by id
        const exists = stored.some((item: any) => item && item.id === codeItem.id);
        if (!exists) {
          mergedArray.push(codeItem);
          updated = true;
        } else {
          // If exists, check recursively inside it (nested values)
          const storedIndex = mergedArray.findIndex((item: any) => item && item.id === codeItem.id);
          const { merged: mergedEl, updated: elUpdated } = smartMergeData(mergedArray[storedIndex], codeItem);
          if (elUpdated) {
            mergedArray[storedIndex] = mergedEl;
            updated = true;
          }
        }
      } else if (typeof codeItem !== 'object') {
        // Primitive array: match by value
        const exists = stored.includes(codeItem);
        if (!exists) {
          mergedArray.push(codeItem);
          updated = true;
        }
      }
    }
    return { merged: mergedArray, updated };
  }

  // Handle objects
  if (typeof codeMaster === 'object') {
    const mergedObj = { ...stored };
    for (const key in codeMaster) {
      if (!(key in stored)) {
        // Missing property in stored dataset, import it from codeMaster
        mergedObj[key] = codeMaster[key];
        updated = true;
      } else {
        // Recursively merge
        const { merged: mergedVal, updated: valUpdated } = smartMergeData(stored[key], codeMaster[key]);
        if (valUpdated) {
          mergedObj[key] = mergedVal;
          updated = true;
        }
      }
    }
    return { merged: mergedObj, updated };
  }

  return { merged: stored, updated };
}

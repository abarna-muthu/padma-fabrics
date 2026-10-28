/**
 * Padmanabha Fabrics - Browser Persistent IndexedDB Storage
 * Overcomes the 5MB localStorage quota limit for user-uploaded products and high-res variant images.
 */

const DB_NAME = "padma_fabrics_db";
const STORE_NAME = "catalog_products";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Upserts a list of products in IndexedDB without clearing existing items.
 */
export async function idbSaveProducts(products: any[]): Promise<boolean> {
  try {
    const db = await openDb();
    if (!db) return false;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const p of products) {
      if (p && p.id) {
        store.put(p);
      }
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (err) {
    console.warn("[IndexedDB] Save products error:", err);
    return false;
  }
}

/**
 * Upserts a single product in IndexedDB immediately.
 */
export async function idbSaveSingleProduct(product: any): Promise<boolean> {
  try {
    if (!product || !product.id) return false;
    const db = await openDb();
    if (!db) return false;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(product);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (err) {
    console.warn("[IndexedDB] Save single product error:", err);
    return false;
  }
}

/**
 * Permanently deletes a single product from IndexedDB by id.
 */
export async function idbDeleteProduct(id: string): Promise<boolean> {
  try {
    if (!id) return false;
    const db = await openDb();
    if (!db) return false;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(String(id));
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch (err) {
    console.warn("[IndexedDB] Delete product error:", err);
    return false;
  }
}

/**
 * Retrieves all stored products from IndexedDB.
 */
export async function idbGetProducts(): Promise<any[] | null> {
  try {
    const db = await openDb();
    if (!db) return null;
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        const results = req.result;
        resolve(Array.isArray(results) && results.length > 0 ? results : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("[IndexedDB] Get products error:", err);
    return null;
  }
}

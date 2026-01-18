import { PromptEntry } from '../types';
import { MOCK_PROMPTS } from '../constants';

const DB_NAME = 'PromptLibManager';
const STORE_NAME = 'prompts';
const DB_VERSION = 1;

/**
 * Servicio de Almacenamiento Profesional usando IndexedDB
 * Implementa patrón Singleton para la conexión para evitar bloqueos.
 */

let dbInstance: IDBDatabase | null = null;

export const storageService = {
  
  // Helper privado para abrir o reutilizar la conexión
  getDB: async (): Promise<IDBDatabase> => {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        console.error("IndexedDB connection error:", request.error);
        reject(request.error);
      };
      
      request.onsuccess = (event) => {
        dbInstance = request.result;
        
        // Manejar cierre inesperado (ej. otra pestaña actualiza versión)
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
          console.warn("Database connection closed due to version change");
        };

        dbInstance.onclose = () => {
          dbInstance = null;
        };

        resolve(dbInstance);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  // 1. Inicialización
  init: async (): Promise<boolean> => {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persistent storage granted: ${isPersisted}`);
        return isPersisted;
      } catch (err) {
        console.warn("Could not request persistent storage", err);
        return false;
      }
    }
    return false;
  },

  // 2. Cargar Datos
  loadPrompts: async (): Promise<PromptEntry[]> => {
    try {
      const db = await storageService.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result;
          // Si es la primera vez (vacío), cargamos mocks
          if (!results || results.length === 0) {
             console.log("Database empty, returning mocks.");
             resolve(MOCK_PROMPTS);
          } else {
             console.log(`Loaded ${results.length} prompts from DB.`);
             resolve(results);
          }
        };
        
        request.onerror = () => {
          console.error("Error reading from store:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Critical failure in loadPrompts:", error);
      throw error; // Re-throw para que App.tsx sepa que falló
    }
  },

  // 3. Guardar Datos (Transacción Segura)
  savePrompts: async (prompts: PromptEntry[]): Promise<void> => {
    try {
      const db = await storageService.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Estrategia: Clear y luego Put
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
           // Usamos un contador o promesa simple para asegurarnos que todos los put se disparen
           // aunque IndexedDB gestiona la transacción automáticamente
           prompts.forEach(prompt => {
             store.put(prompt);
           });
        };

        clearRequest.onerror = (e) => {
            console.error("Error clearing store:", e);
            reject(e);
        }

        transaction.oncomplete = () => {
          console.log(`Successfully saved ${prompts.length} prompts to DB.`);
          resolve();
        };

        transaction.onerror = (event) => {
          console.error("Transaction error during save:", transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error("Failed to save prompts to IndexedDB", error);
      throw error;
    }
  },

  // 4. Resetear
  resetStorage: async (): Promise<void> => {
    const db = await storageService.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    console.log("Database cleared.");
  },

  checkCloudConnection: async (): Promise<boolean> => {
    return false;
  }
};
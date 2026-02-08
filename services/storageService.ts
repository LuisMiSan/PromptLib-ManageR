import { PromptEntry, SupabaseConfig } from '../types';
import { MOCK_PROMPTS } from '../constants';

const DB_NAME = 'PromptLibManager';
const STORE_NAME = 'prompts';
const DB_VERSION = 1;
const SUPABASE_CONFIG_KEY = 'promptlib_supabase_config';

// Declare Supabase global
declare const supabase: any;

let dbInstance: IDBDatabase | null = null;
let supabaseClient: any | null = null;

export const storageService = {
  
  // --- LOCAL DB (IndexedDB) ---
  getDB: async (): Promise<IDBDatabase> => {
    if (dbInstance) return dbInstance;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbInstance = request.result;
        dbInstance.onversionchange = () => { dbInstance?.close(); dbInstance = null; };
        dbInstance.onclose = () => { dbInstance = null; };
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

  // --- SUPABASE CONFIG ---
  initSupabase: (config: SupabaseConfig) => {
    if (typeof supabase !== 'undefined') {
      try {
        supabaseClient = supabase.createClient(config.url, config.key);
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
        return true;
      } catch (e) {
        console.error("Supabase init error:", e);
        return false;
      }
    }
    return false;
  },

  disconnectSupabase: () => {
    supabaseClient = null;
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
  },

  isCloudActive: () => {
    return !!supabaseClient;
  },

  // --- MAIN ACTIONS ---
  
  init: async (): Promise<boolean> => {
    // 1. Check for stored Supabase config
    const storedConfig = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        storageService.initSupabase(config);
      } catch (e) { console.error("Invalid stored config"); }
    }

    // 2. Check Local Storage persistence
    if (navigator.storage && navigator.storage.persist) {
      try { return await navigator.storage.persist(); } 
      catch (err) { return false; }
    }
    return false;
  },

  loadPrompts: async (): Promise<PromptEntry[]> => {
    // A. TRY CLOUD FIRST
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('prompts').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data;
        }
        console.error("Supabase fetch error:", error);
      } catch (e) {
        console.error("Supabase connection failed, falling back to local.", e);
      }
    }

    // B. FALLBACK TO LOCAL
    try {
      const db = await storageService.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result;
          resolve((!results || results.length === 0) ? MOCK_PROMPTS : results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw error;
    }
  },

  savePrompts: async (prompts: PromptEntry[]): Promise<void> => {
    // ALWAYS SAVE LOCAL (Backup/Offline support)
    try {
      const db = await storageService.getDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear().onsuccess = () => {
        prompts.forEach(p => store.put(p));
      };
    } catch (e) { console.error("Local save error", e); }

    // IF CLOUD, SYNC
    if (supabaseClient) {
      try {
        // Upsert all prompts. Note: Supabase upsert requires IDs to match.
        const { error } = await supabaseClient.from('prompts').upsert(prompts);
        if (error) console.error("Supabase save error:", error);
      } catch (e) {
        console.error("Supabase crash:", e);
      }
    }
  },

  // One-time sync from Local to Cloud
  syncLocalToCloud: async (localPrompts: PromptEntry[]) => {
    if (!supabaseClient) throw new Error("No cloud connection");
    const { error } = await supabaseClient.from('prompts').upsert(localPrompts);
    if (error) throw error;
  },

  resetStorage: async (): Promise<void> => {
    const db = await storageService.getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    if(supabaseClient) {
       // Optional: Delete from cloud too? Maybe dangerous. Let's just clear local for "Factory Reset".
       // Or delete all. Let's stick to local reset to be safe unless requested.
    }
  }
};
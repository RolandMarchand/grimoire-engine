
const DB_NAME = 'TextRPGSaves';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

export type SaveMetadata = {
  slotId: string;
  timestamp: number;
  location: string;
};

export type SaveData = {
  slotId: string;
  timestamp: number;
  location: string;
  gameState: {
    currentRoom: string;
    inventory: string[];
    flag: Record<string, boolean>;
    data: Record<string, any>;
    messageHistory: Array<string>;
  };
};

class IndexedDBManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    //if this dbPromise not null, return instance is open
    if (this.dbPromise) {
      return this.dbPromise;
    }

    //else open the db conn
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'slotId' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async saveGame(saveData: SaveData): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.put(saveData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  }

  async loadGame(slotId: string): Promise<SaveData | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(slotId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  }

  async exportSave(save: SaveData): Promise<void> {
    try {
    const jsonString = JSON.stringify(save, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Grimoire-Demo-save-${Date.now()}.json`; // Filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    } catch (error) {
      console.error('An error ocurred while downloading save:', error);
    }
  }

  async importGame(inputFile: File, saveId: string): Promise<boolean> {
    //convert the file into a parsed json (everything but the saveID of the imported file)
    try{
      const text = await inputFile.text();
      const save = JSON.parse(text);

      save.slotId = saveId;

      //send the parsed file (saved as a SaveData object) to saveGame
      await this.saveGame(save as SaveData);
      return true;

    } catch (error) {
      console.error('Error importing save:', error);
      return false;
    }
    
  }

  async getSaveMetadata(slotId: string): Promise<SaveMetadata | null> {
    try {
      const saveData = await this.loadGame(slotId);
      if (!saveData) return null;

      return {
        slotId: saveData.slotId,
        timestamp: saveData.timestamp,
        location: saveData.location,
      };
    } catch (error) {
      console.error('Error getting save metadata:', error);
      return null;
    }
  }

  async getAllSaveMetadata(): Promise<SaveMetadata[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const saves = request.result || [];
          const metadata = saves.map((save: SaveData) => ({
            slotId: save.slotId,
            timestamp: save.timestamp,
            location: save.location,
          }));
          resolve(metadata);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all save metadata:', error);
      return [];
    }
  }

  async deleteSave(slotId: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.delete(slotId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting save:', error);
      throw error;
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      await this.openDB();
      return true;
    } catch {
      return false;
    }
  }
}

export const saveManager = new IndexedDBManager();

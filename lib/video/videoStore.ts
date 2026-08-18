// ============================================================
// ClipRadar AI — IndexedDB Video File Persistence Store
// Keeps uploaded video files across route navigation & reloads
// ============================================================

const DB_NAME = "clipradar_video_db";
const STORE_NAME = "videos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class VideoFileStore {
  private inMemoryBlobUrl: string | null = null;
  private inMemoryFile: File | null = null;

  async setFile(file: File | null): Promise<void> {
    this.inMemoryFile = file;
    if (this.inMemoryBlobUrl) {
      URL.revokeObjectURL(this.inMemoryBlobUrl);
      this.inMemoryBlobUrl = null;
    }

    if (typeof window === "undefined") return;

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      if (file) {
        store.put(file, "active_video");
        this.inMemoryBlobUrl = URL.createObjectURL(file);
      } else {
        store.delete("active_video");
      }
    } catch {
      if (file) {
        this.inMemoryBlobUrl = URL.createObjectURL(file);
      }
    }
  }

  async getFile(): Promise<File | null> {
    if (this.inMemoryFile) return this.inMemoryFile;
    if (typeof window === "undefined") return null;

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get("active_video");
        req.onsuccess = () => {
          const file = (req.result as File) || null;
          this.inMemoryFile = file;
          resolve(file);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async getObjectUrl(): Promise<string | null> {
    if (this.inMemoryBlobUrl) return this.inMemoryBlobUrl;
    const file = await this.getFile();
    if (file) {
      this.inMemoryBlobUrl = URL.createObjectURL(file);
      return this.inMemoryBlobUrl;
    }
    return null;
  }
}

export const videoFileStore = new VideoFileStore();

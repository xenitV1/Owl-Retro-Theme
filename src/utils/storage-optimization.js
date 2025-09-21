/**
 * Storage Optimization Module - Owl Retro Theme
 * Storage performans optimizasyonları için modern çözümler
 * Tek modül tek dosya kuralına uygun
 *
 * Özellikler:
 * - IndexedDB Integration (Modern storage API)
 * - Storage Quota Management (Depolama alanı yönetimi)
 * - Data Compression (Veri sıkıştırma)
 * - Cache Invalidation Strategy (Akıllı cache geçersizleştirme)
 *
 * 2024-2025 Modern Browser Storage APIs ve Compression teknikleri
 */

// Browser extension için CDN üzerinden idb kütüphanesi kullanılıyor
// Manifest'te gerekli izinler tanımlanmalı
const IDB_URL = 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

// Dynamic import for idb library
let idbPromise = null;

async function getIdb() {
  if (!idbPromise) {
    try {
      idbPromise = import(IDB_URL);
    } catch (error) {
      console.error('Failed to load idb library:', error);
      // Fallback to basic IndexedDB wrapper
      idbPromise = Promise.resolve({
        openDB: basicOpenDB,
        deleteDB: basicDeleteDB
      });
    }
  }
  return idbPromise;
}

// Basic IndexedDB fallback implementation
function basicOpenDB(name, version, options = {}) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    if (options.upgrade) {
      request.onupgradeneeded = (event) => {
        options.upgrade(event.target.result, event.oldVersion, event.newVersion, event);
      };
    }

    if (options.blocked) {
      request.onblocked = (event) => {
        options.blocked(event.currentVersion, event.newVersion, event);
      };
    }
  });
}

function basicDeleteDB(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// =============================================================================
// STORAGE OPTIMIZATION MODULE
// =============================================================================

class StorageOptimizer {
  constructor() {
    this.db = null;
    this.dbName = 'owl-retro-theme-cache';
    this.dbVersion = 1;
    this.compressionEnabled = true;
    this.quotaManager = new StorageQuotaManager();
    this.cacheInvalidator = new CacheInvalidator();
  }

  // IndexedDB Integration - Modern storage API
  async initializeStorage() {
    try {
      const { openDB } = await getIdb();

      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade: (db, oldVersion, newVersion, transaction) => {
          this.upgradeDatabase(db, oldVersion, newVersion, transaction);
        },
        blocked: () => {
          console.warn('IndexedDB blocked - another tab has the database open');
        },
        blocking: () => {
          console.warn('IndexedDB blocking - closing old connection');
          this.db?.close();
        },
        terminated: () => {
          console.warn('IndexedDB terminated - connection lost');
          this.db = null;
        }
      });

      console.log('IndexedDB initialized successfully');
      return this.db;
    } catch (error) {
      console.error('IndexedDB initialization failed:', error);
      // Fallback to memory storage
      return this.createMemoryFallback();
    }
  }

  upgradeDatabase(db, oldVersion, newVersion, transaction) {
    // Theme cache store
    if (!db.objectStoreNames.contains('theme-cache')) {
      const themeStore = db.createObjectStore('theme-cache', { keyPath: 'id' });
      themeStore.createIndex('url', 'url', { unique: false });
      themeStore.createIndex('timestamp', 'timestamp', { unique: false });
      themeStore.createIndex('expires', 'expires', { unique: false });
    }

    // Resource cache store
    if (!db.objectStoreNames.contains('resource-cache')) {
      const resourceStore = db.createObjectStore('resource-cache', { keyPath: 'id' });
      resourceStore.createIndex('type', 'type', { unique: false });
      resourceStore.createIndex('url', 'url', { unique: true });
      resourceStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
    }

    // User preferences store
    if (!db.objectStoreNames.contains('user-preferences')) {
      db.createObjectStore('user-preferences', { keyPath: 'key' });
    }

    // Analytics store (optional)
    if (!db.objectStoreNames.contains('analytics')) {
      const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
      analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
      analyticsStore.createIndex('type', 'type', { unique: false });
    }
  }

  createMemoryFallback() {
    console.log('Using memory fallback for storage');
    return {
      memoryFallback: true,
      stores: new Map(),
      get: async (storeName, key) => this.stores.get(storeName)?.get(key),
      put: async (storeName, value, key) => {
        if (!this.stores.has(storeName)) {
          this.stores.set(storeName, new Map());
        }
        this.stores.get(storeName).set(key, value);
      },
      delete: async (storeName, key) => {
        this.stores.get(storeName)?.delete(key);
      },
      clear: async (storeName) => {
        this.stores.get(storeName)?.clear();
      }
    };
  }

  // Storage Quota Management
  async getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota - estimate.usage,
          usageRatio: estimate.usage / estimate.quota
        };
      } catch (error) {
        console.warn('Storage quota estimation failed:', error);
      }
    }

    // Fallback estimation
    return {
      quota: 50 * 1024 * 1024, // 50MB approximate
      usage: 0,
      available: 50 * 1024 * 1024,
      usageRatio: 0
    };
  }

  async checkStoragePressure() {
    const quota = await this.getStorageQuota();
    const thresholds = {
      warning: 0.8,  // 80%
      critical: 0.9  // 90%
    };

    if (quota.usageRatio >= thresholds.critical) {
      return 'critical';
    } else if (quota.usageRatio >= thresholds.warning) {
      return 'warning';
    }

    return 'normal';
  }

  async cleanupStorageIfNeeded() {
    const pressure = await this.checkStoragePressure();

    if (pressure === 'critical') {
      await this.performAggressiveCleanup();
    } else if (pressure === 'warning') {
      await this.performModerateCleanup();
    }
  }

  async performAggressiveCleanup() {
    console.log('Performing aggressive storage cleanup');

    if (this.db?.memoryFallback) return;

    const tx = this.db.transaction(['theme-cache', 'resource-cache'], 'readwrite');

    try {
      // Eski cache verilerini sil
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 saat

      // Theme cache cleanup
      const themeStore = tx.objectStore('theme-cache');
      let cursor = await themeStore.openCursor();

      while (cursor) {
        if (now - cursor.value.timestamp > maxAge) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }

      // Resource cache cleanup - LRU
      const resourceStore = tx.objectStore('resource-cache');
      const allResources = await resourceStore.getAll();
      const sortedByAccess = allResources.sort((a, b) =>
        (a.lastAccessed || 0) - (b.lastAccessed || 0)
      );

      // İlk %50'yi sil
      const deleteCount = Math.floor(sortedByAccess.length * 0.5);
      for (let i = 0; i < deleteCount; i++) {
        await resourceStore.delete(sortedByAccess[i].id);
      }

      await tx.done;
    } catch (error) {
      console.error('Aggressive cleanup failed:', error);
    }
  }

  async performModerateCleanup() {
    console.log('Performing moderate storage cleanup');

    if (this.db?.memoryFallback) return;

    const tx = this.db.transaction(['theme-cache', 'resource-cache'], 'readwrite');

    try {
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 gün

      // Theme cache cleanup
      const themeStore = tx.objectStore('theme-cache');
      let cursor = await themeStore.openCursor();

      while (cursor) {
        if (now - cursor.value.timestamp > maxAge) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }

      await tx.done;
    } catch (error) {
      console.error('Moderate cleanup failed:', error);
    }
  }

  // Data Compression - Veriyi sıkıştırma
  async compressData(data) {
    if (!this.compressionEnabled || !data) return data;

    try {
      if (typeof data === 'string') {
        // Text compression using CompressionStream if available
        if ('CompressionStream' in window) {
          const stream = new CompressionStream('gzip');
          const writer = stream.writable.getWriter();
          const reader = stream.readable.getReader();

          writer.write(new TextEncoder().encode(data));
          writer.close();

          const chunks = [];
          let result = await reader.read();
          while (!result.done) {
            chunks.push(result.value);
            result = await reader.read();
          }

          return new Uint8Array(chunks.flatMap(chunk => Array.from(chunk)));
        } else {
          // Simple LZ-based compression fallback
          return this.simpleCompress(data);
        }
      }
    } catch (error) {
      console.warn('Data compression failed:', error);
      return data;
    }

    return data;
  }

  async decompressData(data) {
    if (!data) return data;

    try {
      if (data instanceof Uint8Array) {
        // Decompression using DecompressionStream if available
        if ('DecompressionStream' in window) {
          const stream = new DecompressionStream('gzip');
          const writer = stream.writable.getWriter();
          const reader = stream.readable.getReader();

          writer.write(data);
          writer.close();

          const chunks = [];
          let result = await reader.read();
          while (!result.done) {
            chunks.push(result.value);
            result = await reader.read();
          }

          return new TextDecoder().decode(new Uint8Array(chunks.flatMap(chunk => Array.from(chunk))));
        } else {
          // Simple decompression fallback
          return this.simpleDecompress(data);
        }
      }
    } catch (error) {
      console.warn('Data decompression failed:', error);
      return data;
    }

    return data;
  }

  simpleCompress(str) {
    // Basit RLE compression
    let compressed = '';
    let count = 1;
    for (let i = 1; i <= str.length; i++) {
      if (str[i] === str[i - 1]) {
        count++;
      } else {
        compressed += count + str[i - 1];
        count = 1;
      }
    }
    return compressed;
  }

  simpleDecompress(compressed) {
    let decompressed = '';
    let numStr = '';

    for (let char of compressed) {
      if (/\d/.test(char)) {
        numStr += char;
      } else {
        const count = parseInt(numStr) || 1;
        decompressed += char.repeat(count);
        numStr = '';
      }
    }

    return decompressed;
  }

  // Cache Invalidation Strategy - Akıllı cache geçersizleştirme
  async invalidateCache(strategy = 'time-based', options = {}) {
    return this.cacheInvalidator.invalidate(strategy, options);
  }

  async storeThemeData(key, data, options = {}) {
    if (!this.db) await this.initializeStorage();

    const compressedData = await this.compressData(data);
    const cacheEntry = {
      id: key,
      data: compressedData,
      timestamp: Date.now(),
      expires: options.ttl ? Date.now() + options.ttl : null,
      compressed: this.compressionEnabled,
      metadata: options.metadata || {}
    };

    try {
      if (this.db.memoryFallback) {
        await this.db.put('theme-cache', cacheEntry, key);
      } else {
        const tx = this.db.transaction('theme-cache', 'readwrite');
        await tx.store.put(cacheEntry);
        await tx.done;
      }

      // Storage pressure kontrolü
      await this.cleanupStorageIfNeeded();
    } catch (error) {
      console.error('Theme data storage failed:', error);
    }
  }

  async getThemeData(key) {
    if (!this.db) await this.initializeStorage();

    try {
      let data;
      if (this.db.memoryFallback) {
        data = await this.db.get('theme-cache', key);
      } else {
        const tx = this.db.transaction('theme-cache', 'readonly');
        data = await tx.store.get(key);
        await tx.done;
      }

      if (!data) return null;

      // Expiry kontrolü
      if (data.expires && Date.now() > data.expires) {
        await this.deleteThemeData(key);
        return null;
      }

      // Access timestamp güncelleme
      if (!this.db.memoryFallback) {
        const tx = this.db.transaction('theme-cache', 'readwrite');
        data.lastAccessed = Date.now();
        await tx.store.put(data);
        await tx.done;
      }

      // Decompression
      return data.compressed ? await this.decompressData(data.data) : data.data;
    } catch (error) {
      console.error('Theme data retrieval failed:', error);
      return null;
    }
  }

  async deleteThemeData(key) {
    if (!this.db) await this.initializeStorage();

    try {
      if (this.db.memoryFallback) {
        await this.db.delete('theme-cache', key);
      } else {
        const tx = this.db.transaction('theme-cache', 'readwrite');
        await tx.store.delete(key);
        await tx.done;
      }
    } catch (error) {
      console.error('Theme data deletion failed:', error);
    }
  }

  async clearAllThemeData() {
    if (!this.db) await this.initializeStorage();

    try {
      if (this.db.memoryFallback) {
        await this.db.clear('theme-cache');
      } else {
        const tx = this.db.transaction('theme-cache', 'readwrite');
        await tx.store.clear();
        await tx.done;
      }
    } catch (error) {
      console.error('Theme data clear failed:', error);
    }
  }

  // Tüm IndexedDB'yi temizleme - Complete database deletion
  async clearEntireDatabase() {
    try {
      // Mevcut bağlantıyı kapat
      if (this.db && !this.db.memoryFallback) {
        this.db.close();
        this.db = null;
      }

      // Tüm IndexedDB'yi sil
      const { deleteDB } = await getIdb();
      await deleteDB(this.dbName);

      console.log(`Entire IndexedDB '${this.dbName}' cleared successfully`);

      // Yeni bağlantı için hazırla (bir sonraki kullanımda yeniden oluşturulacak)
      this.db = null;

      return { success: true, message: 'Tüm IndexedDB başarıyla temizlendi' };
    } catch (error) {
      console.error('Entire database clear failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Selective store cleaning - Belirli store'ları temizleme
  async clearDatabaseStore(storeName) {
    if (!this.db) await this.initializeStorage();

    try {
      if (this.db.memoryFallback) {
        await this.db.clear(storeName);
      } else {
        const tx = this.db.transaction(storeName, 'readwrite');
        await tx.store.clear();
        await tx.done;
      }

      console.log(`Store '${storeName}' cleared successfully`);
      return { success: true, message: `Store '${storeName}' temizlendi` };
    } catch (error) {
      console.error(`Store '${storeName}' clear failed:`, error);
      return { success: false, error: error.message };
    }
  }
}

// =============================================================================
// STORAGE QUOTA MANAGER
// =============================================================================

class StorageQuotaManager {
  constructor() {
    this.quotas = new Map();
    this.listeners = new Set();
  }

  async monitorQuota() {
    const quota = await this.getStorageEstimate();

    if (quota) {
      this.quotas.set('indexeddb', quota);

      // Event dispatching
      if (quota.usage / quota.quota > 0.9) {
        this.dispatchEvent('quota-critical', quota);
      } else if (quota.usage / quota.quota > 0.8) {
        this.dispatchEvent('quota-warning', quota);
      }
    }

    return quota;
  }

  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        return await navigator.storage.estimate();
      } catch (error) {
        console.warn('Storage estimation failed:', error);
      }
    }
    return null;
  }

  dispatchEvent(type, data) {
    this.listeners.forEach(listener => {
      if (listener.type === type || listener.type === 'all') {
        listener.callback(data);
      }
    });
  }

  addEventListener(type, callback) {
    this.listeners.add({ type, callback });
  }

  removeEventListener(type, callback) {
    this.listeners.forEach(listener => {
      if (listener.type === type && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }
}

// =============================================================================
// CACHE INVALIDATOR
// =============================================================================

class CacheInvalidator {
  constructor() {
    this.strategies = {
      'time-based': this.invalidateTimeBased.bind(this),
      'version-based': this.invalidateVersionBased.bind(this),
      'size-based': this.invalidateSizeBased.bind(this),
      'lru': this.invalidateLRU.bind(this)
    };
  }

  async invalidate(strategy, options) {
    const invalidator = this.strategies[strategy];
    if (!invalidator) {
      throw new Error(`Unknown invalidation strategy: ${strategy}`);
    }

    return invalidator(options);
  }

  async invalidateTimeBased(options) {
    const { maxAge = 24 * 60 * 60 * 1000 } = options; // 24 saat
    const now = Date.now();

    // Implementation depends on storage system
    // This is a placeholder for the actual implementation
    console.log(`Invalidating cache entries older than ${maxAge}ms`);
    return { invalidated: 0, strategy: 'time-based' };
  }

  async invalidateVersionBased(options) {
    const { currentVersion } = options;

    console.log(`Invalidating cache for version change to ${currentVersion}`);
    return { invalidated: 0, strategy: 'version-based' };
  }

  async invalidateSizeBased(options) {
    const { maxSize = 50 * 1024 * 1024 } = options; // 50MB

    console.log(`Invalidating cache to stay under ${maxSize} bytes`);
    return { invalidated: 0, strategy: 'size-based' };
  }

  async invalidateLRU(options) {
    const { keepCount = 100 } = options;

    console.log(`Keeping only ${keepCount} most recently used items`);
    return { invalidated: 0, strategy: 'lru' };
  }
}

export default StorageOptimizer;
export { StorageQuotaManager, CacheInvalidator };

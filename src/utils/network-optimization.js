/**
 * Network Optimization Module - Owl Retro Theme
 * Network performans optimizasyonları için modern çözümler
 * Tek modül tek dosya kuralına uygun
 *
 * Özellikler:
 * - Resource Preloading (Critical resources ön yükleme)
 * - Connection Pooling (Bağlantı havuzu yönetimi)
 * - Request Batching (İstek gruplama ve batch processing)
 * - Cache Strategy Optimization (Akıllı cache yönetimi)
 *
 * 2024-2025 Modern Browser APIs ve Network Optimization teknikleri
 */

class NetworkOptimizer {
  constructor() {
    this.preloadQueue = new Map();
    this.connectionPool = new Map();
    this.batchQueue = new Map();
    this.cacheStrategy = new Map();
    this.requestIdleCallback = window.requestIdleCallback ||
                               ((cb) => setTimeout(cb, 1));
  }

  // Resource Preloading - Critical resources'ı önceden yükleme
  async preloadResources(resources, priority = 'low') {
    if (!resources || !Array.isArray(resources)) return;

    const preloadPromises = resources.map(async (resource) => {
      try {
        if (resource.type === 'style') {
          return this.preloadStylesheet(resource.url, priority);
        } else if (resource.type === 'script') {
          return this.preloadScript(resource.url, priority);
        } else if (resource.type === 'image') {
          return this.preloadImage(resource.url, priority);
        }
      } catch (error) {
        console.warn('Resource preload failed:', resource.url, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  async preloadStylesheet(url, priority) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'style';
    link.crossOrigin = 'anonymous';

    if (priority === 'high') {
      link.fetchPriority = 'high';
    }

    return new Promise((resolve, reject) => {
      link.onload = () => {
        // Preload'dan cache'e taşı
        link.rel = 'stylesheet';
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  async preloadScript(url, priority) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'script';
    link.crossOrigin = 'anonymous';

    if (priority === 'high') {
      link.fetchPriority = 'high';
    }

    return new Promise((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  async preloadImage(url, priority) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'image';

    if (priority === 'high') {
      link.fetchPriority = 'high';
    }

    return new Promise((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // Connection Pooling - Bağlantı havuzu yönetimi
  async getConnection(endpoint, options = {}) {
    const key = `${endpoint}_${JSON.stringify(options)}`;

    if (this.connectionPool.has(key)) {
      const connection = this.connectionPool.get(key);
      if (this.isConnectionValid(connection)) {
        return connection;
      }
      this.connectionPool.delete(key);
    }

    try {
      const connection = await this.createConnection(endpoint, options);
      this.connectionPool.set(key, {
        connection,
        created: Date.now(),
        lastUsed: Date.now(),
        options
      });
      return connection;
    } catch (error) {
      console.error('Connection creation failed:', error);
      throw error;
    }
  }

  isConnectionValid(connectionData) {
    const { created, lastUsed } = connectionData;
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 dakika
    const maxIdle = 2 * 60 * 1000; // 2 dakika

    return (now - created) < maxAge && (now - lastUsed) < maxIdle;
  }

  async createConnection(endpoint, options) {
    // Browser extension context'te connection pooling için basit implementation
    return { endpoint, options, created: Date.now() };
  }

  // Request Batching - İstekleri gruplama ve batch processing
  batchRequest(endpoint, requests, batchOptions = {}) {
    const batchKey = endpoint;
    const batchSize = batchOptions.batchSize || 10;
    const delay = batchOptions.delay || 100;

    if (!this.batchQueue.has(batchKey)) {
      this.batchQueue.set(batchKey, {
        requests: [],
        timeout: null,
        options: batchOptions
      });
    }

    const batch = this.batchQueue.get(batchKey);
    batch.requests.push(...requests);

    if (batch.requests.length >= batchSize) {
      return this.executeBatch(batchKey);
    }

    if (batch.timeout) {
      clearTimeout(batch.timeout);
    }

    batch.timeout = setTimeout(() => {
      this.executeBatch(batchKey);
    }, delay);

    return new Promise((resolve) => {
      batch.requests.push({ resolve });
    });
  }

  async executeBatch(batchKey) {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.requests.length === 0) return;

    this.batchQueue.delete(batchKey);

    try {
      const results = await this.processBatchRequests(batch.requests, batch.options);
      batch.requests.forEach((request, index) => {
        if (request.resolve) {
          request.resolve(results[index]);
        }
      });
    } catch (error) {
      console.error('Batch execution failed:', error);
      batch.requests.forEach(request => {
        if (request.reject) {
          request.reject(error);
        }
      });
    }
  }

  async processBatchRequests(requests, options) {
    // Browser extension context'te batch processing
    // Her request'i paralel olarak işle
    return Promise.allSettled(
      requests.map(async (request) => {
        if (typeof request === 'function') {
          return request();
        }
        return request;
      })
    );
  }

  // Cache Strategy Optimization - Akıllı cache yönetimi
  async optimizeCacheStrategy(cacheKey, strategy = 'lru') {
    const cache = this.cacheStrategy.get(cacheKey) || {
      items: new Map(),
      strategy,
      maxSize: 100,
      ttl: 30 * 60 * 1000 // 30 dakika
    };

    this.cacheStrategy.set(cacheKey, cache);

    // Cache temizliği ve optimizasyonu
    this.requestIdleCallback(() => {
      this.cleanupCache(cacheKey);
    });

    return cache;
  }

  async cleanupCache(cacheKey) {
    const cache = this.cacheStrategy.get(cacheKey);
    if (!cache) return;

    const now = Date.now();
    const itemsToDelete = [];

    for (const [key, item] of cache.items) {
      if (now - item.timestamp > cache.ttl) {
        itemsToDelete.push(key);
      }
    }

    itemsToDelete.forEach(key => cache.items.delete(key));

    // LRU strategy - en az kullanılanları temizle
    if (cache.strategy === 'lru' && cache.items.size > cache.maxSize) {
      const sortedItems = Array.from(cache.items.entries())
        .sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed);

      const excessCount = cache.items.size - cache.maxSize;
      for (let i = 0; i < excessCount; i++) {
        cache.items.delete(sortedItems[i][0]);
      }
    }
  }

  async getCached(cacheKey, key) {
    const cache = this.cacheStrategy.get(cacheKey);
    if (!cache) return null;

    const item = cache.items.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > cache.ttl) {
      cache.items.delete(key);
      return null;
    }

    item.lastAccessed = Date.now();
    return item.value;
  }

  async setCached(cacheKey, key, value) {
    const cache = this.cacheStrategy.get(cacheKey);
    if (!cache) return;

    cache.items.set(key, {
      value,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
  }
}

export default NetworkOptimizer;

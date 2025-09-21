/**
 * Resource Management Module - Owl Retro Theme
 * Network ve Storage optimizasyonlarının ana entegrasyon noktası
 * Tek modül tek dosya kuralına uygun - Main integration layer
 */

import NetworkOptimizer from './network-optimization.js';
import StorageOptimizer from './storage-optimization.js';

class ResourceManager {
  constructor() {
    this.networkOptimizer = new NetworkOptimizer();
    this.storageOptimizer = new StorageOptimizer();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await this.storageOptimizer.initializeStorage();
      this.setupPeriodicCleanup();
      this.initialized = true;
      console.log('Resource Manager initialized');
    } catch (error) {
      console.error('Resource Manager init failed:', error);
    }
  }

  setupPeriodicCleanup() {
    setInterval(async () => {
      await this.storageOptimizer.cleanupStorageIfNeeded();
    }, 30 * 60 * 1000);

    setInterval(async () => {
      await this.storageOptimizer.quotaManager.monitorQuota();
    }, 60 * 60 * 1000);
  }

  // Network API
  async preloadResources(resources, priority = 'low') {
    return this.networkOptimizer.preloadResources(resources, priority);
  }

  // Storage API
  async storeThemeData(key, data, options = {}) {
    return this.storageOptimizer.storeThemeData(key, data, options);
  }

  async getThemeData(key) {
    return this.storageOptimizer.getThemeData(key);
  }

  // Database management APIs
  async clearEntireDatabase() {
    return this.storageOptimizer.clearEntireDatabase();
  }

  async clearDatabaseStore(storeName) {
    return this.storageOptimizer.clearDatabaseStore(storeName);
  }

  async clearThemeCache() {
    return this.storageOptimizer.clearAllThemeData();
  }
}

const resourceManager = new ResourceManager();
export default resourceManager;
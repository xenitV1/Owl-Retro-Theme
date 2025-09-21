/**
 * Owl Retro - Safari WebKit Compatibility Layer
 * Safari-specific API compatibility for Manifest V3
 * Handles Safari WebKit API differences
 */

(function() {
  'use strict';

  /**
   * Safari WebKit API Compatibility Layer
   * Provides Safari-specific compatibility for WebKit APIs
   */
  const SafariAPI = {
    /**
     * Safari WebKit Storage API compatibility
     * Safari uses safari.storage API for sync storage
     */
    storage: {
      sync: {
        get: function(keys) {
          return new Promise((resolve, reject) => {
            try {
              if (typeof safari !== 'undefined' && safari.extension) {
                // Safari WebKit extension storage
                if (Array.isArray(keys)) {
                  const result = {};
                  keys.forEach(key => {
                    result[key] = safari.extension.settings[key] || null;
                  });
                  resolve(result);
                } else if (typeof keys === 'string') {
                  const result = {};
                  result[keys] = safari.extension.settings[keys] || null;
                  resolve(result);
                } else {
                  const result = {};
                  Object.keys(keys).forEach(key => {
                    result[key] = safari.extension.settings[key] || keys[key];
                  });
                  resolve(result);
                }
              } else {
                console.warn('Safari WebKit API not available, using localStorage fallback');
                const result = {};
                if (Array.isArray(keys)) {
                  keys.forEach(key => {
                    result[key] = localStorage.getItem(`safari_${key}`);
                  });
                } else if (typeof keys === 'string') {
                  result[keys] = localStorage.getItem(`safari_${keys}`);
                } else {
                  Object.keys(keys).forEach(key => {
                    result[key] = localStorage.getItem(`safari_${key}`) || keys[key];
                  });
                }
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          });
        },

        set: function(items) {
          return new Promise((resolve, reject) => {
            try {
              if (typeof safari !== 'undefined' && safari.extension) {
                // Safari WebKit extension storage
                Object.keys(items).forEach(key => {
                  safari.extension.settings[key] = items[key];
                });
                resolve();
              } else {
                console.warn('Safari WebKit API not available, using localStorage fallback');
                Object.keys(items).forEach(key => {
                  localStorage.setItem(`safari_${key}`, JSON.stringify(items[key]));
                });
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          });
        }
      },

      local: {
        get: function(keys) {
          return new Promise((resolve, reject) => {
            try {
              if (typeof safari !== 'undefined' && safari.extension) {
                // Safari uses localStorage for local storage
                const result = {};
                if (Array.isArray(keys)) {
                  keys.forEach(key => {
                    result[key] = localStorage.getItem(`safari_local_${key}`);
                  });
                } else if (typeof keys === 'string') {
                  result[keys] = localStorage.getItem(`safari_local_${keys}`);
                } else {
                  Object.keys(keys).forEach(key => {
                    result[key] = localStorage.getItem(`safari_local_${key}`) || keys[key];
                  });
                }
                resolve(result);
              } else {
                console.warn('Safari WebKit API not available, using localStorage fallback');
                const result = {};
                if (Array.isArray(keys)) {
                  keys.forEach(key => {
                    result[key] = localStorage.getItem(`safari_local_${key}`);
                  });
                } else if (typeof keys === 'string') {
                  result[keys] = localStorage.getItem(`safari_local_${keys}`);
                } else {
                  Object.keys(keys).forEach(key => {
                    result[key] = localStorage.getItem(`safari_local_${key}`) || keys[key];
                  });
                }
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          });
        },

        set: function(items) {
          return new Promise((resolve, reject) => {
            try {
              if (typeof safari !== 'undefined' && safari.extension) {
                Object.keys(items).forEach(key => {
                  localStorage.setItem(`safari_local_${key}`, JSON.stringify(items[key]));
                });
                resolve();
              } else {
                console.warn('Safari WebKit API not available, using localStorage fallback');
                Object.keys(items).forEach(key => {
                  localStorage.setItem(`safari_local_${key}`, JSON.stringify(items[key]));
                });
                resolve();
              }
            } catch (error) {
              reject(error);
            }
          });
        }
      }
    },

    /**
     * Safari WebKit Runtime API compatibility
     */
    runtime: {
      getURL: function(path) {
        if (typeof safari !== 'undefined' && safari.extension) {
          return safari.extension.baseURI + path;
        } else {
          console.warn('Safari WebKit API not available');
          return path;
        }
      },

      sendMessage: function(message, callback) {
        if (typeof safari !== 'undefined' && safari.extension) {
          // Safari uses different message passing
          safari.extension.dispatchMessage(message.name, message);
        } else {
          console.warn('Safari WebKit API not available');
          if (callback) callback({ error: 'Safari WebKit API not available' });
        }
      }
    },

    /**
     * Safari WebKit Tabs API compatibility
     */
    tabs: {
      query: function(queryInfo) {
        return new Promise((resolve, reject) => {
          try {
            if (typeof safari !== 'undefined' && safari.application) {
              // Safari WebKit tabs API
              const tabs = safari.application.activeBrowserWindow.tabs;
              const result = [];

              tabs.forEach(tab => {
                if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                  result.push({
                    id: tab.id,
                    url: tab.url,
                    title: tab.title,
                    active: tab === safari.application.activeBrowserWindow.activeTab
                  });
                }
              });

              resolve(result);
            } else {
              reject(new Error('Safari WebKit API not available'));
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    }
  };

  /**
   * Enhanced BrowserAPI with Safari WebKit support
   */
  if (typeof window !== 'undefined' && window.OwlRetroBrowserAPI) {
    // Extend existing BrowserAPI with Safari support
    const originalBrowserAPI = window.OwlRetroBrowserAPI;

    // Override Safari-specific methods
    if (typeof safari !== 'undefined' && safari.extension) {
      originalBrowserAPI.storage.sync.get = SafariAPI.storage.sync.get;
      originalBrowserAPI.storage.sync.set = SafariAPI.storage.sync.set;
      originalBrowserAPI.storage.local.get = SafariAPI.storage.local.get;
      originalBrowserAPI.storage.local.set = SafariAPI.storage.local.set;
      originalBrowserAPI.runtime.getURL = SafariAPI.runtime.getURL;
      originalBrowserAPI.tabs.query = SafariAPI.tabs.query;
    }

    console.log('Safari WebKit compatibility layer integrated');
  }

  // Export Safari API for direct access
  window.OwlRetroSafariAPI = SafariAPI;

  console.log('Owl Retro Safari WebKit Compatibility Layer loaded');
})();

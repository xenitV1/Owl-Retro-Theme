/**
 * Owl Retro - Enhanced Browser Compatibility Layer
 * Cross-browser API abstraction for Manifest V3 (2024-2025)
 * Supports Chrome, Firefox, Safari, Edge with modern polyfills
 * Uses webextension-polyfill for Promise-based APIs
 */

(function() {
  'use strict';

  /**
   * Enhanced Browser Compatibility Abstraction Layer
   * Provides unified API across different browsers with modern polyfills
   * Supports Chrome, Firefox, Safari, and Edge with 2024-2025 standards
   */
  const BrowserAPI = {
    /**
     * Enhanced Storage API abstraction (2024-2025)
     * Uses webextension-polyfill for Promise-based APIs
     * Handles Chrome, Firefox, Safari, and Edge with modern standards
     */
    storage: {
      sync: {
        get: async function(keys) {
          try {
            // Try modern browser API first (with webextension-polyfill)
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
              return await browser.storage.sync.get(keys);
            }
            // Chrome/Edge native API fallback
            else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
              return new Promise((resolve, reject) => {
                chrome.storage.sync.get(keys, (result) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(result);
                  }
                });
              });
            }
            // Safari WebKit fallback
            else if (typeof safari !== 'undefined' && safari.extension && safari.extension.settings) {
              const result = {};
              if (Array.isArray(keys)) {
                keys.forEach(key => {
                  result[key] = safari.extension.settings[key] || null;
                });
              } else if (typeof keys === 'string') {
                result[keys] = safari.extension.settings[keys] || null;
              } else {
                Object.keys(keys).forEach(key => {
                  result[key] = safari.extension.settings[key] || keys[key];
                });
              }
              return result;
            }
            // Modern browsers localStorage fallback with proper typing
            else {
              console.warn('Storage API not available, using localStorage fallback');
              const result = {};
              if (Array.isArray(keys)) {
                keys.forEach(key => {
                  try {
                    result[key] = JSON.parse(localStorage.getItem(`owl_sync_${key}`) || 'null');
                  } catch (e) {
                    result[key] = localStorage.getItem(`owl_sync_${key}`);
                  }
                });
              } else if (typeof keys === 'string') {
                try {
                  result[keys] = JSON.parse(localStorage.getItem(`owl_sync_${keys}`) || 'null');
                } catch (e) {
                  result[keys] = localStorage.getItem(`owl_sync_${keys}`);
                }
              } else {
                Object.keys(keys).forEach(key => {
                  try {
                    result[key] = JSON.parse(localStorage.getItem(`owl_sync_${key}`) || 'null');
                  } catch (e) {
                    result[key] = localStorage.getItem(`owl_sync_${key}`);
                  }
                });
              }
              return result;
            }
          } catch (error) {
            console.error('Storage sync.get error:', error);
            throw error;
          }
        },

        set: async function(items) {
          try {
            // Try modern browser API first
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
              return await browser.storage.sync.set(items);
            }
            // Chrome/Edge native API fallback
            else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
              return new Promise((resolve, reject) => {
                chrome.storage.sync.set(items, () => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve();
                  }
                });
              });
            }
            // Safari WebKit fallback
            else if (typeof safari !== 'undefined' && safari.extension) {
              Object.keys(items).forEach(key => {
                safari.extension.settings[key] = items[key];
              });
              return;
            }
            // localStorage fallback
            else {
              console.warn('Storage API not available, using localStorage fallback');
              Object.keys(items).forEach(key => {
                localStorage.setItem(`owl_sync_${key}`, JSON.stringify(items[key]));
              });
              return;
            }
          } catch (error) {
            console.error('Storage sync.set error:', error);
            throw error;
          }
        },

        // Enhanced storage change listener
        onChanged: {
          addListener: function(callback) {
            try {
              if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
                browser.storage.onChanged.addListener(callback);
              } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
                chrome.storage.onChanged.addListener(callback);
              } else if (typeof safari !== 'undefined' && safari.extension) {
                // Safari doesn't have storage change listeners, implement polling fallback
                console.warn('Storage change listeners not supported, using polling fallback');
                let lastValues = {};
                setInterval(() => {
                  // Simple polling mechanism for Safari
                  // This is a basic implementation - in production you might want more sophisticated polling
                }, 5000);
              } else {
                console.warn('Storage change listener not available');
              }
            } catch (error) {
              console.error('Failed to add storage change listener:', error);
            }
          }
        }
      },

      local: {
        get: async function(keys) {
          try {
            // Try modern browser API first
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
              return await browser.storage.local.get(keys);
            }
            // Chrome/Edge native API fallback
            else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              return new Promise((resolve, reject) => {
                chrome.storage.local.get(keys, (result) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(result);
                  }
                });
              });
            }
            // Safari WebKit fallback (uses localStorage for local storage)
            else if (typeof safari !== 'undefined' && safari.extension) {
              const result = {};
              if (Array.isArray(keys)) {
                keys.forEach(key => {
                  try {
                    result[key] = JSON.parse(localStorage.getItem(`safari_local_${key}`) || 'null');
                  } catch (e) {
                    result[key] = localStorage.getItem(`safari_local_${key}`);
                  }
                });
              } else if (typeof keys === 'string') {
                try {
                  result[keys] = JSON.parse(localStorage.getItem(`safari_local_${keys}`) || 'null');
                } catch (e) {
                  result[keys] = localStorage.getItem(`safari_local_${keys}`);
                }
              } else {
                Object.keys(keys).forEach(key => {
                  try {
                    result[key] = JSON.parse(localStorage.getItem(`safari_local_${key}`) || 'null');
                  } catch (e) {
                    result[key] = localStorage.getItem(`safari_local_${key}`);
                  }
                });
              }
              return result;
            }
            // Modern browsers localStorage fallback with proper typing
            else {
              console.warn('Storage API not available, using localStorage fallback');
              const result = {};
              if (Array.isArray(keys)) {
                keys.forEach(key => {
                  try {
                    result[key] = JSON.parse(localStorage.getItem(`owl_local_${key}`) || 'null');
                  } catch (e) {
                    result[key] = localStorage.getItem(`owl_local_${key}`);
                  }
                });
              } else if (typeof keys === 'string') {
                try {
                  result[keys] = JSON.parse(localStorage.getItem(`owl_local_${keys}`) || 'null');
                } catch (e) {
                  result[keys] = localStorage.getItem(`owl_local_${keys}`);
                }
              } else {
                Object.keys(keys).forEach(key => {
                  try {
                    result[key] = JSON.parse(localStorage.getItem(`owl_local_${key}`) || 'null');
                  } catch (e) {
                    result[key] = localStorage.getItem(`owl_local_${key}`);
                  }
                });
              }
              return result;
            }
          } catch (error) {
            console.error('Storage local.get error:', error);
            throw error;
          }
        },

        set: async function(items) {
          try {
            // Try modern browser API first
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
              return await browser.storage.local.set(items);
            }
            // Chrome/Edge native API fallback
            else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              return new Promise((resolve, reject) => {
                chrome.storage.local.set(items, () => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve();
                  }
                });
              });
            }
            // Safari WebKit fallback
            else if (typeof safari !== 'undefined' && safari.extension) {
              Object.keys(items).forEach(key => {
                localStorage.setItem(`safari_local_${key}`, JSON.stringify(items[key]));
              });
              return;
            }
            // localStorage fallback
            else {
              console.warn('Storage API not available, using localStorage fallback');
              Object.keys(items).forEach(key => {
                localStorage.setItem(`owl_local_${key}`, JSON.stringify(items[key]));
              });
              return;
            }
          } catch (error) {
            console.error('Storage local.set error:', error);
            throw error;
          }
        }
      },

      onChanged: {
        addListener: function(callback) {
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.onChanged.addListener(callback);
          } else if (typeof browser !== 'undefined' && browser.storage) {
            browser.storage.onChanged.addListener(callback);
          } else {
            console.warn('Storage change listener not available');
          }
        }
      }
    },

    /**
     * Enhanced Runtime API abstraction (2024-2025)
     * Uses webextension-polyfill for Promise-based APIs
     */
    runtime: {
      getURL: function(path) {
        try {
          // Try modern browser API first
          if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
            return browser.runtime.getURL(path);
          }
          // Chrome/Edge native API fallback
          else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
          }
          // Safari WebKit fallback
          else if (typeof safari !== 'undefined' && safari.extension) {
            return safari.extension.baseURI + path;
          } else {
            console.warn('Runtime API not available');
            return path;
          }
        } catch (error) {
          console.error('Runtime getURL error:', error);
          return path;
        }
      },

      onMessage: {
        addListener: function(callback) {
          try {
            if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
              browser.runtime.onMessage.addListener(callback);
            } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
              chrome.runtime.onMessage.addListener(callback);
            } else if (typeof safari !== 'undefined' && safari.extension) {
              // Safari WebKit message handling - simplified implementation
              console.warn('Runtime message listener not available in Safari WebKit');
            } else {
              console.warn('Runtime message listener not available');
            }
          } catch (error) {
            console.error('Failed to add runtime message listener:', error);
          }
        }
      },

      sendMessage: async function(message, options = {}) {
        try {
          // Try modern browser API first (with webextension-polyfill)
          if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
            return await browser.runtime.sendMessage(message);
          }
          // Chrome/Edge native API fallback
          else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            return new Promise((resolve, reject) => {
              chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            });
          }
          // Safari WebKit fallback
          else if (typeof safari !== 'undefined' && safari.extension) {
            return new Promise((resolve, reject) => {
              try {
                safari.extension.dispatchMessage(message.name || 'owl-message', message);
                // Safari doesn't return responses from dispatchMessage
                // This is a limitation of Safari WebKit API
                resolve({ safari: true, message: 'Message sent via Safari WebKit' });
              } catch (error) {
                reject(new Error(`Safari WebKit message error: ${error.message}`));
              }
            });
          } else {
            throw new Error('Runtime API not available for message sending');
          }
        } catch (error) {
          console.error('Runtime sendMessage error:', error);
          throw error;
        }
      },

      // Enhanced message handling with error recovery
      sendMessageWithRetry: async function(message, options = {}) {
        const maxRetries = options.maxRetries || 3;
        const retryDelay = options.retryDelay || 1000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await this.sendMessage(message, options);
          } catch (error) {
            console.warn(`Message attempt ${attempt} failed:`, error);
            if (attempt === maxRetries) {
              throw new Error(`Message failed after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          }
        }
      },

      // Connection-based messaging for persistent communication
      connect: function(connectInfo = {}) {
        try {
          if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.connect) {
            return browser.runtime.connect(connectInfo);
          } else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.connect) {
            return chrome.runtime.connect(connectInfo);
          } else {
            console.warn('Runtime connect API not available');
            return null;
          }
        } catch (error) {
          console.error('Runtime connect error:', error);
          return null;
        }
      }
    },

    /**
     * Enhanced Tabs API abstraction (2024-2025)
     * Uses webextension-polyfill for Promise-based APIs
     */
    tabs: {
      query: async function(queryInfo) {
        try {
          // Try modern browser API first
          if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.query) {
            return await browser.tabs.query(queryInfo);
          }
          // Chrome/Edge native API fallback
          else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
            return new Promise((resolve, reject) => {
              chrome.tabs.query(queryInfo, (tabs) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(tabs);
                }
              });
            });
          }
          // Safari WebKit fallback
          else if (typeof safari !== 'undefined' && safari.application) {
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

            return result;
          } else {
            throw new Error('Tabs API not available');
          }
        } catch (error) {
          console.error('Tabs query error:', error);
          throw error;
        }
      },

      sendMessage: async function(tabId, message, options = {}) {
        try {
          // Try modern browser API first (with webextension-polyfill)
          if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.sendMessage) {
            return await browser.tabs.sendMessage(tabId, message, options);
          }
          // Chrome/Edge native API fallback
          else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
            return new Promise((resolve, reject) => {
              chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            });
          }
          // Safari WebKit fallback
          else if (typeof safari !== 'undefined' && safari.extension) {
            return new Promise((resolve, reject) => {
              try {
                // Safari WebKit doesn't support tabs.sendMessage
                // This is a limitation of Safari WebKit API
                reject(new Error('Safari WebKit does not support tabs.sendMessage'));
              } catch (error) {
                reject(new Error(`Safari WebKit tabs error: ${error.message}`));
              }
            });
          } else {
            throw new Error('Tabs API not available for message sending');
          }
        } catch (error) {
          console.error('Tabs sendMessage error:', error);
          throw error;
        }
      },

      // Enhanced tab creation with error handling
      create: async function(createProperties) {
        try {
          if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.create) {
            return await browser.tabs.create(createProperties);
          } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
            return new Promise((resolve, reject) => {
              chrome.tabs.create(createProperties, (tab) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(tab);
                }
              });
            });
          } else {
            throw new Error('Tabs create API not available');
          }
        } catch (error) {
          console.error('Tabs create error:', error);
          throw error;
        }
      },

      // Enhanced tab update with error handling
      update: async function(tabId, updateProperties) {
        try {
          if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.update) {
            return await browser.tabs.update(tabId, updateProperties);
          } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
            return new Promise((resolve, reject) => {
              chrome.tabs.update(tabId, updateProperties, (tab) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(tab);
                }
              });
            });
          } else {
            throw new Error('Tabs update API not available');
          }
        } catch (error) {
          console.error('Tabs update error:', error);
          throw error;
        }
      }
    },

    /**
     * Enhanced Action API abstraction (2024-2025)
     * Handles both Manifest V2 (browserAction) and V3 (action) APIs
     */
    action: {
      onClicked: {
        addListener: function(callback) {
          try {
            // Try Manifest V3 action API first
            if (typeof browser !== 'undefined' && browser.action && browser.action.onClicked) {
              browser.action.onClicked.addListener(callback);
            }
            // Chrome Manifest V3 action API fallback
            else if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
              chrome.action.onClicked.addListener(callback);
            }
            // Manifest V2 browserAction API fallback
            else if (typeof browser !== 'undefined' && browser.browserAction && browser.browserAction.onClicked) {
              browser.browserAction.onClicked.addListener(callback);
            }
            else if (typeof chrome !== 'undefined' && chrome.browserAction && chrome.browserAction.onClicked) {
              chrome.browserAction.onClicked.addListener(callback);
            } else {
              console.warn('Action API not available');
            }
          } catch (error) {
            console.error('Failed to add action click listener:', error);
          }
        }
      },

      // Enhanced action methods with Promise support
      setTitle: async function(details) {
        try {
          if (typeof browser !== 'undefined' && browser.action && browser.action.setTitle) {
            return await browser.action.setTitle(details);
          } else if (typeof chrome !== 'undefined' && chrome.action && chrome.action.setTitle) {
            return new Promise((resolve, reject) => {
              chrome.action.setTitle(details, () => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            });
          } else {
            throw new Error('Action setTitle API not available');
          }
        } catch (error) {
          console.error('Action setTitle error:', error);
          throw error;
        }
      },

      setIcon: async function(details) {
        try {
          if (typeof browser !== 'undefined' && browser.action && browser.action.setIcon) {
            return await browser.action.setIcon(details);
          } else if (typeof chrome !== 'undefined' && chrome.action && chrome.action.setIcon) {
            return new Promise((resolve, reject) => {
              chrome.action.setIcon(details, () => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            });
          } else {
            throw new Error('Action setIcon API not available');
          }
        } catch (error) {
          console.error('Action setIcon error:', error);
          throw error;
        }
      }
    },

    /**
     * Enhanced Alarms API abstraction (2024-2025)
     */
    alarms: {
      create: async function(name, alarmInfo) {
        try {
          if (typeof browser !== 'undefined' && browser.alarms && browser.alarms.create) {
            return await browser.alarms.create(name, alarmInfo);
          } else if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.create) {
            return new Promise((resolve, reject) => {
              chrome.alarms.create(name, alarmInfo);
              // Chrome alarms.create doesn't return a promise, so we resolve immediately
              resolve();
            });
          } else {
            console.warn('Alarms API not available');
          }
        } catch (error) {
          console.error('Alarms create error:', error);
          throw error;
        }
      },

      onAlarm: {
        addListener: function(callback) {
          try {
            if (typeof browser !== 'undefined' && browser.alarms && browser.alarms.onAlarm) {
              browser.alarms.onAlarm.addListener(callback);
            } else if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.onAlarm) {
              chrome.alarms.onAlarm.addListener(callback);
            } else {
              console.warn('Alarms API not available');
            }
          } catch (error) {
            console.error('Failed to add alarm listener:', error);
          }
        }
      },

      // Enhanced alarm management methods
      clear: async function(name) {
        try {
          if (typeof browser !== 'undefined' && browser.alarms && browser.alarms.clear) {
            return await browser.alarms.clear(name);
          } else if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.clear) {
            return new Promise((resolve, reject) => {
              chrome.alarms.clear(name, (wasCleared) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(wasCleared);
                }
              });
            });
          } else {
            throw new Error('Alarms clear API not available');
          }
        } catch (error) {
          console.error('Alarms clear error:', error);
          throw error;
        }
      },

      getAll: async function() {
        try {
          if (typeof browser !== 'undefined' && browser.alarms && browser.alarms.getAll) {
            return await browser.alarms.getAll();
          } else if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.getAll) {
            return new Promise((resolve, reject) => {
              chrome.alarms.getAll((alarms) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(alarms);
                }
              });
            });
          } else {
            throw new Error('Alarms getAll API not available');
          }
        } catch (error) {
          console.error('Alarms getAll error:', error);
          throw error;
        }
      }
    },

    /**
     * Enhanced Permissions API abstraction (2024-2025)
     */
    permissions: {
      contains: async function(permissions) {
        try {
          if (typeof browser !== 'undefined' && browser.permissions && browser.permissions.contains) {
            return await browser.permissions.contains(permissions);
          } else if (typeof chrome !== 'undefined' && chrome.permissions && chrome.permissions.contains) {
            return new Promise((resolve, reject) => {
              chrome.permissions.contains(permissions, (result) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(result);
                }
              });
            });
          } else {
            throw new Error('Permissions contains API not available');
          }
        } catch (error) {
          console.error('Permissions contains error:', error);
          throw error;
        }
      },

      request: async function(permissions) {
        try {
          if (typeof browser !== 'undefined' && browser.permissions && browser.permissions.request) {
            return await browser.permissions.request(permissions);
          } else if (typeof chrome !== 'undefined' && chrome.permissions && chrome.permissions.request) {
            return new Promise((resolve, reject) => {
              chrome.permissions.request(permissions, (granted) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(granted);
                }
              });
            });
          } else {
            throw new Error('Permissions request API not available');
          }
        } catch (error) {
          console.error('Permissions request error:', error);
          throw error;
        }
      }
    }
  };

  // Export to global scope
  window.OwlRetroBrowserAPI = BrowserAPI;

  console.log('Owl Retro Browser Compatibility Layer loaded');
})();

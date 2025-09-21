/**
 * Owl Retro - Service Worker
 * Background script for extension lifecycle management
 * Cross-browser compatible using BrowserAPI abstraction layer
 */

// Import browser compatibility layer
// Note: In service worker context, we rely on native browser APIs
// The browser compatibility layer is primarily for content scripts

// Default preferences
const DEFAULT_PREFERENCES = {
  enabled: true,
  mode: 'auto',
  useMonospace: true,
  intensity: 0.8,
  siteAllowlist: [],
  siteBlocklist: [],
  cacheEnabled: true,
  performanceMode: 'balanced'
};

// Initialize on installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Owl Retro installed/updated', details);

  if (details.reason === 'install') {
    // First installation - set defaults
    chrome.storage.sync.set({
      owl_preferences: DEFAULT_PREFERENCES,
      owl_version: chrome.runtime.getManifest().version
    }).catch((error) => {
      console.error('Failed to set initial preferences:', error);
    });

    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'src/welcome/welcome.html' });
  } else if (details.reason === 'update') {
    // Extension updated
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;

    console.log(`Updated from ${previousVersion} to ${currentVersion}`);

    // Perform any necessary migrations
    migrateSettings(previousVersion, currentVersion).catch((error) => {
      console.error('Migration failed:', error);
    });
  }
});

// Handle action icon click
chrome.action.onClicked.addListener((tab) => {
  // Since we have a popup, this won't be triggered
  // But keeping it for future use if we remove the popup
  console.log('Action clicked for tab:', tab.id);
});

// Message handler for communication with content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getPreferences':
      handleGetPreferences(sendResponse);
      return true; // Keep channel open for async response

    case 'setPreferences':
      handleSetPreferences(request.preferences, sendResponse);
      return true;

    case 'clearSiteCache':
      handleClearSiteCache(request.site, sendResponse);
      return true;

    case 'clearAllCache':
      handleClearAllCache(sendResponse);
      return true;

    case 'getActiveTab':
      handleGetActiveTab(sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
      return false;
  }
});

// Get preferences
async function handleGetPreferences(sendResponse) {
  try {
    const result = await chrome.storage.sync.get('owl_preferences');
    const preferences = result.owl_preferences || DEFAULT_PREFERENCES;
    sendResponse({ success: true, preferences });
  } catch (error) {
    console.error('Failed to get preferences:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Set preferences
async function handleSetPreferences(preferences, sendResponse) {
  try {
    await chrome.storage.sync.set({ owl_preferences: preferences });

    // Notify all tabs about preference change
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      // Only send to valid web pages
      if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'preferencesUpdated',
          preferences: preferences
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      }
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to set preferences:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Clear site cache
async function handleClearSiteCache(site, sendResponse) {
  try {
    const cacheKey = `owl_cache_${site}`;
    await chrome.storage.local.set({ [cacheKey]: null });
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to clear site cache:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Clear all cache
async function handleClearAllCache(sendResponse) {
  try {
    const allData = await chrome.storage.local.get(null);
    const cacheKeys = Object.keys(allData).filter(key => key.startsWith('owl_cache_'));

    if (cacheKeys.length > 0) {
      const clearData = {};
      cacheKeys.forEach(key => {
        clearData[key] = null;
      });
      await chrome.storage.local.set(clearData);
    }

    sendResponse({ success: true, cleared: cacheKeys.length });
  } catch (error) {
    console.error('Failed to clear all cache:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get active tab
async function handleGetActiveTab(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    sendResponse({ success: true, tab });
  } catch (error) {
    console.error('Failed to get active tab:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Migrate settings between versions
async function migrateSettings(fromVersion, toVersion) {
  console.log(`Migrating settings from ${fromVersion} to ${toVersion}`);

  // Get current preferences
  const result = await chrome.storage.sync.get('owl_preferences');
  let preferences = result.owl_preferences || {};

  // Apply any necessary migrations based on version
  // Example: if (fromVersion < '1.1.0') { ... }

  // Merge with defaults to ensure all properties exist
  preferences = { ...DEFAULT_PREFERENCES, ...preferences };

  // Save updated preferences
  await chrome.storage.sync.set({
    owl_preferences: preferences,
    owl_version: toVersion
  });
}

// Set up periodic cache cleanup (every 24 hours)
// Note: Alarms API is handled by the browser compatibility layer
// This will work across Chrome, Firefox, Safari, and Edge
if (typeof chrome !== 'undefined' && chrome.alarms) {
  chrome.alarms.create('cleanupCache', { periodInMinutes: 24 * 60 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanupCache') {
      console.log('Running cache cleanup');

      chrome.storage.local.get(null)
        .then((allData) => {
          const now = Date.now();
          const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
          const keysToRemove = [];

          for (const [key, value] of Object.entries(allData)) {
            if (key.startsWith('owl_cache_') && value && value.timestamp) {
              if (now - value.timestamp > TTL) {
                keysToRemove.push(key);
              }
            }
          }

          if (keysToRemove.length > 0) {
            const clearData = {};
            keysToRemove.forEach(key => {
              clearData[key] = null;
            });
            return chrome.storage.local.set(clearData);
          }
        })
        .then(() => {
          console.log(`Cleaned up ${keysToRemove.length} expired cache entries`);
        })
        .catch((error) => {
          console.error('Cache cleanup failed:', error);
        });
    }
  });
}

// Listen for tab updates to inject content script if needed
// Note: Tab update listener is not available in the BrowserAPI abstraction
// This functionality is handled by the manifest content_scripts configuration
/**
 * Owl Retro - Storage Manager
 * Chrome storage API ile tercih ve cache yönetimi
 */

import { STORAGE_KEYS, DEFAULT_PREFERENCES, CACHE_CONFIG } from './constants.js';

/**
 * Get value from storage
 */
export async function get(key, isLocal = false) {
  const storage = isLocal ? chrome.storage.local : chrome.storage.sync;
  
  return new Promise((resolve) => {
    storage.get(key, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Storage get error:', chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(result[key] || null);
      }
    });
  });
}

/**
 * Set value in storage
 */
export async function set(key, value, isLocal = false) {
  const storage = isLocal ? chrome.storage.local : chrome.storage.sync;
  
  return new Promise((resolve, reject) => {
    storage.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage set error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get all storage data
 */
export async function getAll(isLocal = false) {
  const storage = isLocal ? chrome.storage.local : chrome.storage.sync;
  
  return new Promise((resolve) => {
    storage.get(null, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Storage getAll error:', chrome.runtime.lastError);
        resolve({});
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Watch for storage changes
 */
export function watch(callback, isLocal = false) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    const targetArea = isLocal ? 'local' : 'sync';
    if (areaName === targetArea) {
      callback(changes);
    }
  });
}

/**
 * Get user preferences
 */
export async function getPreferences() {
  let prefs = await get(STORAGE_KEYS.PREFERENCES);
  
  if (!prefs) {
    prefs = DEFAULT_PREFERENCES;
    await setPreferences(prefs);
  }
  
  return { ...DEFAULT_PREFERENCES, ...prefs };
}

/**
 * Set user preferences
 */
export async function setPreferences(preferences) {
  return set(STORAGE_KEYS.PREFERENCES, preferences);
}

/**
 * Update specific preference
 */
export async function updatePreference(key, value) {
  const prefs = await getPreferences();
  prefs[key] = value;
  return setPreferences(prefs);
}

/**
 * Get site-specific cache
 */
export async function getSiteCache(origin) {
  const cacheKey = `${CACHE_CONFIG.STORAGE_KEY_PREFIX}${origin}`;
  const cache = await get(cacheKey, true);
  
  if (!cache) return null;
  
  // Check if cache is expired
  const now = Date.now();
  if (cache.timestamp && (now - cache.timestamp) > CACHE_CONFIG.TTL_MS) {
    await clearSiteCache(origin);
    return null;
  }
  
  // Check version compatibility
  if (cache.version !== CACHE_CONFIG.VERSION) {
    await clearSiteCache(origin);
    return null;
  }
  
  return cache;
}

/**
 * Set site-specific cache
 */
export async function setSiteCache(origin, data) {
  const cacheKey = `${CACHE_CONFIG.STORAGE_KEY_PREFIX}${origin}`;
  const cacheData = {
    ...data,
    timestamp: Date.now(),
    version: CACHE_CONFIG.VERSION
  };
  
  return set(cacheKey, cacheData, true);
}

/**
 * Clear site-specific cache
 */
export async function clearSiteCache(origin) {
  const cacheKey = `${CACHE_CONFIG.STORAGE_KEY_PREFIX}${origin}`;
  return chrome.storage.local.remove(cacheKey);
}

/**
 * Clear all cache
 */
export async function clearAllCache() {
  const allData = await getAll(true);
  const cacheKeys = Object.keys(allData).filter(key => 
    key.startsWith(CACHE_CONFIG.STORAGE_KEY_PREFIX)
  );
  
  if (cacheKeys.length > 0) {
    return chrome.storage.local.remove(cacheKeys);
  }
}

/**
 * Initialize storage with defaults
 */
export async function initialize() {
  // Check if first install
  const version = await get(STORAGE_KEYS.VERSION);
  
  if (!version) {
    // First install - set defaults
    await set(STORAGE_KEYS.VERSION, CACHE_CONFIG.VERSION);
    await setPreferences(DEFAULT_PREFERENCES);
    return { firstInstall: true };
  }
  
  // Check for version update
  if (version !== CACHE_CONFIG.VERSION) {
    // Perform migration if needed
    await migrate(version, CACHE_CONFIG.VERSION);
    await set(STORAGE_KEYS.VERSION, CACHE_CONFIG.VERSION);
    return { updated: true, fromVersion: version };
  }
  
  return { existing: true };
}

/**
 * Migrate storage data between versions
 */
async function migrate(fromVersion, toVersion) {
  console.log(`Migrating from ${fromVersion} to ${toVersion}`);
  
  // Add migration logic here as needed
  // For now, just clear cache on version change
  await clearAllCache();
}

/**
 * Check if site is allowed
 */
export async function isSiteAllowed(hostname) {
  const prefs = await getPreferences();
  
  // Check blocklist first
  if (prefs.siteBlocklist && prefs.siteBlocklist.includes(hostname)) {
    return false;
  }
  
  // Check allowlist if it exists
  if (prefs.siteAllowlist && prefs.siteAllowlist.length > 0) {
    return prefs.siteAllowlist.includes(hostname);
  }
  
  // Default to allowed if not in blocklist
  return true;
}

/**
 * Add site to allowlist
 */
export async function addToAllowlist(hostname) {
  const prefs = await getPreferences();
  
  if (!prefs.siteAllowlist) {
    prefs.siteAllowlist = [];
  }
  
  if (!prefs.siteAllowlist.includes(hostname)) {
    prefs.siteAllowlist.push(hostname);
    
    // Remove from blocklist if present
    if (prefs.siteBlocklist) {
      prefs.siteBlocklist = prefs.siteBlocklist.filter(h => h !== hostname);
    }
    
    await setPreferences(prefs);
  }
}

/**
 * Add site to blocklist
 */
export async function addToBlocklist(hostname) {
  const prefs = await getPreferences();
  
  if (!prefs.siteBlocklist) {
    prefs.siteBlocklist = [];
  }
  
  if (!prefs.siteBlocklist.includes(hostname)) {
    prefs.siteBlocklist.push(hostname);
    
    // Remove from allowlist if present
    if (prefs.siteAllowlist) {
      prefs.siteAllowlist = prefs.siteAllowlist.filter(h => h !== hostname);
    }
    
    await setPreferences(prefs);
  }
}
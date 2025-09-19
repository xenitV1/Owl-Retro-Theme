/**
 * Owl Retro - Popup Controller
 * Popup arayüzü kontrol scripti
 */

let currentTab = null;
let preferences = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  
  // Display site name
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      document.getElementById('current-site').textContent = url.hostname;
    } catch {
      document.getElementById('current-site').textContent = 'Unknown';
    }
  }
  
  // Load preferences
  await loadPreferences();
  
  // Set up event listeners
  setupEventListeners();
});

// Load preferences from storage
async function loadPreferences() {
  const result = await chrome.storage.sync.get('owl_preferences');
  preferences = result.owl_preferences || {
    enabled: true,
    mode: 'auto',
    useMonospace: true,
    intensity: 0.8,
    siteAllowlist: [],
    siteBlocklist: []
  };
  
  // Update UI to reflect preferences
  updateUI();
}

// Update UI elements
function updateUI() {
  // Enable toggle
  document.getElementById('enable-toggle').checked = preferences.enabled;
  updateStatus(preferences.enabled);
  
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === preferences.mode);
  });
  
  // Font toggle
  document.getElementById('font-toggle').checked = preferences.useMonospace;
  
  // Intensity slider
  const intensityValue = Math.round(preferences.intensity * 100);
  document.getElementById('intensity-slider').value = intensityValue;
  document.getElementById('intensity-value').textContent = intensityValue + '%';
}

// Update status indicator
function updateStatus(enabled) {
  const statusText = document.getElementById('status-text');
  const statusDot = document.querySelector('.status-dot');
  
  if (enabled) {
    statusText.textContent = 'Active';
    statusDot.classList.add('active');
  } else {
    statusText.textContent = 'Inactive';
    statusDot.classList.remove('active');
  }
}

// Save preferences to storage
async function savePreferences() {
  await chrome.storage.sync.set({ owl_preferences: preferences });
  
  // Send message to current tab
  if (currentTab && currentTab.id) {
    try {
      await chrome.tabs.sendMessage(currentTab.id, {
        action: 'preferencesUpdated',
        preferences: preferences
      });
    } catch (error) {
      console.error('Failed to send message to tab:', error);
    }
  }
}

// Set up event listeners
function setupEventListeners() {
  // Enable toggle
  document.getElementById('enable-toggle').addEventListener('change', async (e) => {
    preferences.enabled = e.target.checked;
    updateStatus(e.target.checked);
    await savePreferences();
    
    // Send toggle message to content script
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'toggle',
        enabled: e.target.checked
      });
    }
  });
  
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      // Update UI
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update preference
      preferences.mode = btn.dataset.mode;
      await savePreferences();
      
      // Send message to content script
      if (currentTab && currentTab.id) {
        chrome.tabs.sendMessage(currentTab.id, {
          action: 'changeMode',
          mode: btn.dataset.mode
        });
      }
    });
  });
  
  // Font toggle
  document.getElementById('font-toggle').addEventListener('change', async (e) => {
    preferences.useMonospace = e.target.checked;
    await savePreferences();
    
    // Send message to content script
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'toggleFont',
        useMonospace: e.target.checked
      });
    }
  });
  
  // Intensity slider
  document.getElementById('intensity-slider').addEventListener('input', (e) => {
    document.getElementById('intensity-value').textContent = e.target.value + '%';
  });
  
  document.getElementById('intensity-slider').addEventListener('change', async (e) => {
    preferences.intensity = parseInt(e.target.value) / 100;
    await savePreferences();
    
    // Send message to content script
    if (currentTab && currentTab.id) {
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'changeIntensity',
        intensity: preferences.intensity
      });
    }
  });
  
  // Site controls
  document.getElementById('allow-site').addEventListener('click', async () => {
    if (currentTab && currentTab.url) {
      try {
        const url = new URL(currentTab.url);
        const hostname = url.hostname;
        
        // Remove from blocklist if present
        preferences.siteBlocklist = preferences.siteBlocklist.filter(h => h !== hostname);
        
        // Add to allowlist if not present
        if (!preferences.siteAllowlist.includes(hostname)) {
          preferences.siteAllowlist.push(hostname);
        }
        
        await savePreferences();
        
        // Reload the tab
        chrome.tabs.reload(currentTab.id);
      } catch (error) {
        console.error('Failed to add to allowlist:', error);
      }
    }
  });
  
  document.getElementById('block-site').addEventListener('click', async () => {
    if (currentTab && currentTab.url) {
      try {
        const url = new URL(currentTab.url);
        const hostname = url.hostname;
        
        // Remove from allowlist if present
        preferences.siteAllowlist = preferences.siteAllowlist.filter(h => h !== hostname);
        
        // Add to blocklist if not present
        if (!preferences.siteBlocklist.includes(hostname)) {
          preferences.siteBlocklist.push(hostname);
        }
        
        await savePreferences();
        
        // Reload the tab
        chrome.tabs.reload(currentTab.id);
      } catch (error) {
        console.error('Failed to add to blocklist:', error);
      }
    }
  });
  
  // Clear cache button
  document.getElementById('clear-cache').addEventListener('click', async () => {
    if (currentTab && currentTab.url) {
      try {
        const url = new URL(currentTab.url);
        const hostname = url.hostname;
        const cacheKey = `owl_cache_${hostname}`;
        
        await chrome.storage.local.remove(cacheKey);
        
        // Show feedback (optional - you can add a toast notification)
        const btn = document.getElementById('clear-cache');
        const originalText = btn.textContent;
        btn.textContent = 'Cleared!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 1500);
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  });
  
  // Options button
  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}
/**
 * Owl Retro - Options Page Controller
 */

let preferences = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadPreferences();
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
    siteBlocklist: [],
    cacheEnabled: true
  };
  
  updateUI();
}

// Update UI with current preferences
function updateUI() {
  document.getElementById('default-mode').value = preferences.mode;
  document.getElementById('enable-monospace').checked = preferences.useMonospace;
  document.getElementById('default-intensity').value = preferences.intensity * 100;
  document.getElementById('intensity-display').textContent = Math.round(preferences.intensity * 100) + '%';
  document.getElementById('enable-cache').checked = preferences.cacheEnabled;
  
  renderSiteLists();
}

// Render site lists
function renderSiteLists() {
  const allowlist = document.getElementById('allowlist');
  const blocklist = document.getElementById('blocklist');
  
  allowlist.innerHTML = '';
  blocklist.innerHTML = '';
  
  preferences.siteAllowlist.forEach(site => {
    allowlist.appendChild(createSiteItem(site, 'allow'));
  });
  
  preferences.siteBlocklist.forEach(site => {
    blocklist.appendChild(createSiteItem(site, 'block'));
  });
  
  if (preferences.siteAllowlist.length === 0) {
    allowlist.innerHTML = '<p style="color: #999; font-size: 12px; padding: 10px;">No sites added</p>';
  }
  
  if (preferences.siteBlocklist.length === 0) {
    blocklist.innerHTML = '<p style="color: #999; font-size: 12px; padding: 10px;">No sites added</p>';
  }
}

// Create site item element
function createSiteItem(site, type) {
  const div = document.createElement('div');
  div.className = 'site-item';
  
  const span = document.createElement('span');
  span.textContent = site;
  
  const button = document.createElement('button');
  button.textContent = 'Remove';
  button.onclick = () => removeSite(site, type);
  
  div.appendChild(span);
  div.appendChild(button);
  
  return div;
}

// Remove site from list
function removeSite(site, type) {
  if (type === 'allow') {
    preferences.siteAllowlist = preferences.siteAllowlist.filter(s => s !== site);
  } else {
    preferences.siteBlocklist = preferences.siteBlocklist.filter(s => s !== site);
  }
  
  renderSiteLists();
}

// Set up event listeners
function setupEventListeners() {
  // Intensity slider
  document.getElementById('default-intensity').addEventListener('input', (e) => {
    document.getElementById('intensity-display').textContent = e.target.value + '%';
  });
  
  // Add allow site
  document.getElementById('add-allow-site').addEventListener('click', () => {
    const input = document.getElementById('allow-site-input');
    const site = input.value.trim().toLowerCase();
    
    if (site && !preferences.siteAllowlist.includes(site)) {
      preferences.siteAllowlist.push(site);
      preferences.siteBlocklist = preferences.siteBlocklist.filter(s => s !== site);
      input.value = '';
      renderSiteLists();
    }
  });
  
  // Add block site
  document.getElementById('add-block-site').addEventListener('click', () => {
    const input = document.getElementById('block-site-input');
    const site = input.value.trim().toLowerCase();
    
    if (site && !preferences.siteBlocklist.includes(site)) {
      preferences.siteBlocklist.push(site);
      preferences.siteAllowlist = preferences.siteAllowlist.filter(s => s !== site);
      input.value = '';
      renderSiteLists();
    }
  });
  
  // Enter key support for inputs
  document.getElementById('allow-site-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('add-allow-site').click();
    }
  });
  
  document.getElementById('block-site-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('add-block-site').click();
    }
  });
  
  // Clear all cache
  document.getElementById('clear-all-cache').addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ action: 'clearAllCache' });
    if (response.success) {
      const button = document.getElementById('clear-all-cache');
      const originalText = button.textContent;
      button.textContent = `Cleared ${response.cleared || 0} entries`;
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  });
  
  // Reset settings
  document.getElementById('reset-settings').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      preferences = {
        enabled: true,
        mode: 'auto',
        useMonospace: true,
        intensity: 0.8,
        siteAllowlist: [],
        siteBlocklist: [],
        cacheEnabled: true
      };
      updateUI();
      savePreferences();
    }
  });
  
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', savePreferences);
}

// Save preferences
async function savePreferences() {
  preferences.mode = document.getElementById('default-mode').value;
  preferences.useMonospace = document.getElementById('enable-monospace').checked;
  preferences.intensity = document.getElementById('default-intensity').value / 100;
  preferences.cacheEnabled = document.getElementById('enable-cache').checked;
  
  await chrome.storage.sync.set({ owl_preferences: preferences });
  
  // Show saved message
  const button = document.getElementById('save-settings');
  const originalText = button.textContent;
  button.textContent = 'Saved!';
  button.style.background = '#4CAF50';
  
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = '';
  }, 1500);
}
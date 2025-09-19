/**
 * Owl Retro - Main Content Script
 * Ana içerik betiği - Tüm modülleri koordine eder
 */

(async function() {
  'use strict';

  // State management
  let currentMode = 'light';
  let currentIntensity = 0.8;
  let isEnabled = true;
  let useMonospace = true;
  let preferences = null;

  /**
   * Determine theme mode (auto detection)
   */
  function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Load preferences from storage
   */
  async function loadPreferences() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('owl_preferences', (result) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to load preferences:', chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(result.owl_preferences || null);
        }
      });
    });
  }

  /**
   * Check if current site is allowed
   */
  async function isSiteAllowed() {
    const hostname = window.location.hostname;
    
    if (!preferences) return true;
    
    // Check blocklist first
    if (preferences.siteBlocklist && preferences.siteBlocklist.includes(hostname)) {
      return false;
    }
    
    // Check allowlist if it exists
    if (preferences.siteAllowlist && preferences.siteAllowlist.length > 0) {
      return preferences.siteAllowlist.includes(hostname);
    }
    
    return true;
  }

  /**
   * Load CSS files
   */
  async function loadThemeCSS() {
    try {
      const lightCSS = chrome.runtime.getURL('src/styles/retro-light.css');
      const darkCSS = chrome.runtime.getURL('src/styles/retro-dark.css');
      
      const [lightResponse, darkResponse] = await Promise.all([
        fetch(lightCSS),
        fetch(darkCSS)
      ]);
      
      const [lightText, darkText] = await Promise.all([
        lightResponse.text(),
        darkResponse.text()
      ]);
      
      // Inject both stylesheets
      const style = document.createElement('style');
      style.id = 'owl-retro-theme-styles';
      style.textContent = lightText + '\n' + darkText;
      
      if (document.head) {
        document.head.appendChild(style);
      } else {
        document.documentElement.appendChild(style);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to load theme CSS:', error);
      return false;
    }
  }

  /**
   * Apply theme to page
   */
  function applyTheme() {
    if (!isEnabled) return;
    
    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('owl-retro-light', 'owl-retro-dark');
    
    // Apply theme class
    const themeClass = currentMode === 'dark' ? 'owl-retro-dark' : 'owl-retro-light';
    html.classList.add('owl-retro', themeClass);
    
    // Apply monospace font
    if (useMonospace) {
      html.classList.add('owl-font');
    } else {
      html.classList.remove('owl-font');
    }
    
    // Set attribute for tracking
    html.setAttribute('data-owl-theme', currentMode);
  }

  /**
   * Remove theme from page
   */
  function removeTheme() {
    const html = document.documentElement;
    html.classList.remove('owl-retro', 'owl-retro-light', 'owl-retro-dark', 'owl-font');
    html.removeAttribute('data-owl-theme');
  }

  /**
   * Handle messages from popup/background
   */
  function handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'toggle':
        isEnabled = request.enabled;
        if (isEnabled) {
          applyTheme();
        } else {
          removeTheme();
        }
        sendResponse({ success: true });
        break;
        
      case 'changeMode':
        currentMode = request.mode;
        if (currentMode === 'auto') {
          currentMode = detectSystemTheme();
        }
        applyTheme();
        sendResponse({ success: true });
        break;
        
      case 'toggleFont':
        useMonospace = request.useMonospace;
        applyTheme();
        sendResponse({ success: true });
        break;
        
      case 'changeIntensity':
        currentIntensity = request.intensity;
        applyTheme();
        sendResponse({ success: true });
        break;
        
      case 'getStatus':
        sendResponse({
          enabled: isEnabled,
          mode: currentMode,
          useMonospace: useMonospace,
          intensity: currentIntensity
        });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
  }

  /**
   * Initialize the extension
   */
  async function initialize() {
    try {
      // Load preferences
      preferences = await loadPreferences();
      
      // Set default values if no preferences
      if (!preferences) {
        preferences = {
          enabled: true,
          mode: 'auto',
          useMonospace: true,
          intensity: 0.8,
          siteAllowlist: [],
          siteBlocklist: []
        };
      }
      
      // Update state from preferences
      isEnabled = preferences.enabled;
      currentMode = preferences.mode;
      useMonospace = preferences.useMonospace;
      currentIntensity = preferences.intensity;
      
      // Auto-detect theme if mode is auto
      if (currentMode === 'auto') {
        currentMode = detectSystemTheme();
      }
      
      // Check if site is allowed
      const siteAllowed = await isSiteAllowed();
      if (!siteAllowed) {
        console.log('Owl Retro: Site is blocked');
        return;
      }
      
      // Load CSS
      const cssLoaded = await loadThemeCSS();
      if (!cssLoaded) {
        console.error('Failed to load CSS files');
        return;
      }
      
      // Apply theme if enabled
      if (isEnabled) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyTheme);
        } else {
          applyTheme();
        }
      }
      
      // Listen for messages
      chrome.runtime.onMessage.addListener(handleMessage);
      
      // Listen for storage changes
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.owl_preferences) {
          preferences = changes.owl_preferences.newValue;
          
          // Update state
          isEnabled = preferences.enabled;
          currentMode = preferences.mode;
          useMonospace = preferences.useMonospace;
          currentIntensity = preferences.intensity;
          
          if (currentMode === 'auto') {
            currentMode = detectSystemTheme();
          }
          
          // Reapply theme
          if (isEnabled) {
            applyTheme();
          } else {
            removeTheme();
          }
        }
      });
      
      // Listen for system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (preferences.mode === 'auto') {
            currentMode = e.matches ? 'dark' : 'light';
            if (isEnabled) {
              applyTheme();
            }
          }
        });
      }
      
      console.log('Owl Retro initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize Owl Retro:', error);
    }
  }

  // Start initialization
  initialize();
})();
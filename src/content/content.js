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
   * Load preferences from storage (2024-2025 enhanced)
   */
  async function loadPreferences() {
    try {
      // Use enhanced browser compatibility layer with modern Promise-based APIs
      const storageAPI = (typeof window !== 'undefined' && window.OwlRetroBrowserAPI && window.OwlRetroBrowserAPI.storage) ?
        window.OwlRetroBrowserAPI.storage : chrome.storage;

      const result = await storageAPI.sync.get('owl_preferences');
      return result.owl_preferences || null;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
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
   * Load CSS files (2024-2025 enhanced)
   */
  async function loadThemeCSS() {
    try {
      // Use enhanced browser compatibility layer with modern Promise-based APIs
      const runtimeAPI = (typeof window !== 'undefined' && window.OwlRetroBrowserAPI && window.OwlRetroBrowserAPI.runtime) ?
        window.OwlRetroBrowserAPI.runtime : chrome.runtime;

      const lightCSS = runtimeAPI.getURL('src/styles/retro-light.css');
      const darkCSS = runtimeAPI.getURL('src/styles/retro-dark.css');
      const minimalCSS = runtimeAPI.getURL('src/styles/retro-minimal.css');
      const whiteSpaceDetectorCSS = runtimeAPI.getURL('src/styles/white-space-detector.css');
      const darkSpaceDetectorCSS = runtimeAPI.getURL('src/styles/dark-space-detector.css');

      const [lightResponse, darkResponse, minimalResponse, whiteSpaceResponse, darkSpaceResponse] = await Promise.all([
        fetch(lightCSS),
        fetch(darkCSS),
        fetch(minimalCSS),
        fetch(whiteSpaceDetectorCSS),
        fetch(darkSpaceDetectorCSS)
      ]);

      const [lightText, darkText, minimalText, whiteSpaceText, darkSpaceText] = await Promise.all([
        lightResponse.text(),
        darkResponse.text(),
        minimalResponse.text(),
        whiteSpaceResponse.text(),
        darkSpaceResponse.text()
      ]);

      // Inject all stylesheets with enhanced error handling
      const style = document.createElement('style');
      style.id = 'owl-retro-theme-styles';
      style.textContent = lightText + '\n' + darkText + '\n' + minimalText + '\n' + whiteSpaceText + '\n' + darkSpaceText;

      // Enhanced DOM insertion with fallback
      const targetElement = document.head || document.documentElement;
      if (targetElement) {
        targetElement.appendChild(style);
      } else {
        console.warn('Could not find suitable element to inject styles, creating new style element');
        document.body ? document.body.appendChild(style) : document.documentElement.appendChild(style);
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
   * Initialize CSS injection optimization system (2024-2025)
   * Modern CSS performance optimizasyonları ve injection sistemleri
   */
  async function initializeCSSInjectionOptimizations() {
    try {
      // CSS injection system is already loaded via content script manifest
      // Initialize the CSS injection optimization system
      const optimizationResult = await window.initializeCSSInjectionOptimizations();
      console.log('🦉 Owl Retro: CSS injection optimizations initialized', optimizationResult);

      // Log optimization statistics if available
      if (typeof window.getCSSOptimizationStats === 'function') {
        try {
          const stats = window.getCSSOptimizationStats();
          console.log('🦉 Owl Retro: CSS optimization statistics:', stats);
        } catch (statsError) {
          console.warn('🦉 Owl Retro: Failed to get optimization stats:', statsError);
        }
      } else {
        console.log('🦉 Owl Retro: CSS optimization stats not available');
      }

      // Check for CSS-in-JS frameworks
      if (typeof window.hasCSSInJS === 'function') {
        const hasCSSInJSFrameworks = window.hasCSSInJS();
        if (hasCSSInJSFrameworks) {
          console.log('🦉 Owl Retro: CSS-in-JS frameworks detected');

          if (typeof window.getActiveCSSInJSFrameworks === 'function') {
            const frameworks = window.getActiveCSSInJSFrameworks();
            console.log('🦉 Owl Retro: Active frameworks:', frameworks);
          }

          if (typeof window.getCurrentInjectionStrategy === 'function') {
            const strategy = window.getCurrentInjectionStrategy();
            console.log('🦉 Owl Retro: Current injection strategy:', strategy);
          }
        }
      }

      console.log('✅ Owl Retro: CSS injection optimization system fully initialized');
    } catch (error) {
      console.warn('🦉 Owl Retro: Failed to initialize CSS injection optimizations:', error);
      // Continue without CSS injection optimizations - don't break the main theme
    }
  }

  /**
   * Handle route changes from SPA detector (2024-2025 SPA Support)
   */
  function handleRouteChange(routeInfo) {
    console.log('Owl Retro: Handling route change', routeInfo);

    // Re-apply theme on route changes for SPA compatibility
    if (isEnabled) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        applyTheme();

        // Re-check site allowlist for new route
        isSiteAllowed().then(allowed => {
          if (!allowed) {
            console.log('Owl Retro: Route blocked by site allowlist');
            removeTheme();
          }
        });
      }, 100);
    }
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

      // Check for Edge-specific issues
      const isEdge = navigator.userAgent.includes('Edg/');
      if (isEdge) {
        console.log('Owl Retro: Edge browser detected, applying Edge-specific fixes');
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
          document.addEventListener('DOMContentLoaded', () => {
            applyTheme();
            initializeCSSInjectionOptimizations();
          });
        } else {
          applyTheme();
          initializeCSSInjectionOptimizations();
        }
      }
      
      // Listen for messages - use chrome.runtime for content scripts
      chrome.runtime.onMessage.addListener(handleMessage);

      // Listen for storage changes - use chrome.storage for content scripts
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

  // Expose functions globally for SPA detector integration (2024-2025)
  window.OwlRetroContentScript = {
    handleRouteChange,
    applyTheme,
    removeTheme,
    getStatus: () => ({
      enabled: isEnabled,
      mode: currentMode,
      useMonospace: useMonospace,
      intensity: currentIntensity
    })
  };

  // Start initialization
  initialize();
})();
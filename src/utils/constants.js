/**
 * Owl Retro - Constants and Configuration
 * Retro tema renk paleti ve yapılandırma sabitleri
 */

(function() {
  'use strict';
  
  // Make available globally for content scripts
  window.OwlRetro = window.OwlRetro || {};
  
  // Retro Color Palette
  const RETRO_PALETTE = {
  primary: '#fbcd43',    // Sarı
  secondary: '#e64b35',  // Kırmızı
  tertiary: '#c6312b',   // Koyu kırmızı
  quaternary: '#992d3c', // Bordo
  quinary: '#6d2744',    // Mor
  neutral: '#b7b2a5',    // Bej
  accent: '#685a3c'      // Kahverengi
};

// Theme Modes
  const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Default Preferences
  const DEFAULT_PREFERENCES = {
  enabled: true,
  mode: THEME_MODES.AUTO,
  useMonospace: true,
  intensity: 0.8,
  siteAllowlist: [],
  siteBlocklist: [],
  cacheEnabled: true,
  performanceMode: 'balanced' // 'fast', 'balanced', 'quality'
};

// CSS Classes and Attributes
  const CSS_CLASSES = {
  ROOT_THEME: 'owl-retro',
  THEME_LIGHT: 'owl-retro-light',
  THEME_DARK: 'owl-retro-dark',
  MONOSPACE: 'owl-font',
  PROCESSED: 'owl-processed',
  SKIP: 'owl-skip'
};

const DATA_ATTRIBUTES = {
  THEME_APPLIED: 'data-owl-theme',
  ORIGINAL_COLOR: 'data-owl-original-color',
  ORIGINAL_BG: 'data-owl-original-bg',
  PROCESS_TIME: 'data-owl-process-time'
};

// Performance Thresholds
  const PERFORMANCE_CONFIG = {
  MAX_SCAN_TIME_MS: 50,
  MAX_APPLY_TIME_MS: 100,
  CHUNK_SIZE: 100,
  THROTTLE_DELAY_MS: 16, // ~60fps
  MUTATION_BATCH_SIZE: 50,
  IDLE_CALLBACK_TIMEOUT: 30,
  VISIBILITY_CHECK_THRESHOLD: 0.1 // IntersectionObserver threshold
};

// Cache Configuration
  const CACHE_CONFIG = {
  VERSION: '1.0.0',
  TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_ENTRIES: 1000,
  STORAGE_KEY_PREFIX: 'owl_cache_'
};

// Storage Keys
  const STORAGE_KEYS = {
  PREFERENCES: 'owl_preferences',
  SITE_CACHE: 'owl_site_cache',
  ANALYTICS: 'owl_analytics',
  VERSION: 'owl_version'
};

// Font Configuration
  const FONT_CONFIG = {
  MONOSPACE_STACK: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  SAFE_SELECTORS: 'p, span, div, li, td, th, h1, h2, h3, h4, h5, h6, a, label',
  EXCLUDE_SELECTORS: 'code, pre, .fa, .fas, .far, .fab, .icon, svg, math, input, textarea, select'
};

// Color Mapping Strategy
  const COLOR_STRATEGY = {
  LUMINANCE_THRESHOLD: 0.5,
  CONTRAST_MIN: 4.5, // WCAG AA
  CONTRAST_TARGET: 7, // WCAG AAA
  SATURATION_BOOST: 1.2,
  HUE_SHIFT_MAX: 30
};

// Site-specific Configurations
  const SITE_CONFIGS = {
  'twitter.com': {
    additionalSelectors: '[data-testid*="Tweet"]',
    skipSelectors: '[aria-label="Emoji"]',
    useDynamicObserver: true
  },
  'facebook.com': {
    additionalSelectors: '[role="article"]',
    skipSelectors: '.emoji',
    useDynamicObserver: true
  },
  'linkedin.com': {
    additionalSelectors: '.feed-shared-update-v2',
    skipSelectors: '.reactions-icon',
    useDynamicObserver: true
  },
  'github.com': {
    additionalSelectors: '.markdown-body',
    preserveCodeBlocks: true
  }
};

// Debug Configuration
  const DEBUG = {
    ENABLED: false,
    LOG_PERFORMANCE: false,
    LOG_MUTATIONS: false,
    LOG_CACHE: false,
    VISUAL_INDICATORS: false
  };
  
  // Export to global
  window.OwlRetro.RETRO_PALETTE = RETRO_PALETTE;
  window.OwlRetro.THEME_MODES = THEME_MODES;
  window.OwlRetro.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;
  window.OwlRetro.CSS_CLASSES = CSS_CLASSES;
  window.OwlRetro.DATA_ATTRIBUTES = DATA_ATTRIBUTES;
  window.OwlRetro.PERFORMANCE_CONFIG = PERFORMANCE_CONFIG;
  window.OwlRetro.CACHE_CONFIG = CACHE_CONFIG;
  window.OwlRetro.STORAGE_KEYS = STORAGE_KEYS;
  window.OwlRetro.FONT_CONFIG = FONT_CONFIG;
  window.OwlRetro.COLOR_STRATEGY = COLOR_STRATEGY;
  window.OwlRetro.SITE_CONFIGS = SITE_CONFIGS;
  window.OwlRetro.DEBUG = DEBUG;
})();

/**
 * Owl Retro - Critical CSS Extractor Module
 * Above-the-fold CSS'i otomatik olarak çıkarır ve optimize eder
 * 2024-2025 Critical CSS extraction teknikleri
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../constants.js';

/**
 * Critical CSS Detection Engine
 */
class CriticalCSSDetector {
  constructor() {
    this.criticalSelectors = new Set();
    this.viewportMetrics = {
      width: 0,
      height: 0,
      devicePixelRatio: 1
    };
    this.initializeViewportMetrics();
  }

  /**
   * Initialize viewport metrics for critical CSS detection
   */
  initializeViewportMetrics() {
    this.viewportMetrics.width = window.innerWidth || document.documentElement.clientWidth || 1920;
    this.viewportMetrics.height = window.innerHeight || document.documentElement.clientHeight || 1080;
    this.viewportMetrics.devicePixelRatio = window.devicePixelRatio || 1;

    // Listen for viewport changes
    window.addEventListener('resize', this.updateViewportMetrics.bind(this));
    window.addEventListener('orientationchange', this.updateViewportMetrics.bind(this));
  }

  /**
   * Update viewport metrics
   */
  updateViewportMetrics() {
    this.viewportMetrics.width = window.innerWidth || document.documentElement.clientWidth || 1920;
    this.viewportMetrics.height = window.innerHeight || document.documentElement.clientHeight || 1080;
    this.viewportMetrics.devicePixelRatio = window.devicePixelRatio || 1;
  }

  /**
   * Analyze DOM to find critical elements above the fold
   */
  analyzeDOMForCriticalElements() {
    const criticalElements = [];
    const viewportHeight = this.viewportMetrics.height;

    // Get all visible elements
    const allElements = document.querySelectorAll('*');

    for (const element of allElements) {
      const rect = element.getBoundingClientRect();

      // Check if element is visible and above the fold
      if (this.isElementAboveFold(rect, viewportHeight) &&
          this.isElementVisible(element)) {
        criticalElements.push({
          element,
          rect,
          computedStyle: window.getComputedStyle(element),
          tagName: element.tagName,
          classes: Array.from(element.classList),
          id: element.id
        });
      }
    }

    return criticalElements;
  }

  /**
   * Check if element is above the fold
   */
  isElementAboveFold(rect, viewportHeight) {
    // Consider element above fold if it's within viewport height
    // or extends into viewport from above
    return rect.bottom > 0 && rect.top < viewportHeight;
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  /**
   * Extract critical selectors from analyzed elements
   */
  extractCriticalSelectors(criticalElements) {
    const selectors = new Set();

    for (const { element, tagName, classes, id } of criticalElements) {
      // Add ID selector if exists
      if (id) {
        selectors.add(`#${CSS.escape(id)}`);
      }

      // Add tag selector
      selectors.add(tagName.toLowerCase());

      // Add class selectors
      for (const className of classes) {
        selectors.add(`.${CSS.escape(className)}`);
      }

      // Add compound selectors (tag.class)
      if (classes.length > 0) {
        selectors.add(`${tagName.toLowerCase()}.${CSS.escape(classes[0])}`);
      }
    }

    return Array.from(selectors);
  }

  /**
   * Generate critical CSS rules
   */
  generateCriticalCSSRules(selectors, themeStyles) {
    const criticalRules = [];

    for (const selector of selectors) {
      // Find matching elements for this selector
      const elements = document.querySelectorAll(selector);

      for (const element of elements) {
        const computedStyle = window.getComputedStyle(element);
        const criticalProperties = this.getCriticalProperties(computedStyle);

        if (criticalProperties.length > 0) {
          const rule = this.createCSSRule(selector, criticalProperties);
          criticalRules.push(rule);
        }
      }
    }

    return criticalRules.join('\n');
  }

  /**
   * Get critical CSS properties for performance
   */
  getCriticalProperties(computedStyle) {
    const criticalProps = [
      'display', 'position', 'width', 'height', 'min-width', 'min-height',
      'max-width', 'max-height', 'margin', 'padding', 'border', 'background',
      'background-color', 'color', 'font-size', 'font-family', 'font-weight',
      'line-height', 'text-align', 'vertical-align', 'box-sizing', 'flex',
      'grid', 'float', 'clear', 'z-index', 'opacity', 'visibility',
      'overflow', 'overflow-x', 'overflow-y', 'transform', 'transition'
    ];

    const criticalValues = [];

    for (const prop of criticalProps) {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
        criticalValues.push(`${prop}: ${value};`);
      }
    }

    return criticalValues;
  }

  /**
   * Create CSS rule for selector
   */
  createCSSRule(selector, properties) {
    return `${selector} {
  ${properties.join('\n  ')}
}`;
  }

  /**
   * Detect critical CSS from existing stylesheets
   */
  detectCriticalCSSFromStylesheets() {
    const criticalCSS = [];
    const styleSheets = document.styleSheets;

    for (const sheet of styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (const rule of rules) {
          if (rule.type === CSSRule.STYLE_RULE) {
            const selector = rule.selectorText;
            const cssText = rule.cssText;

            // Check if this rule might be critical
            if (this.isPotentiallyCritical(selector, cssText)) {
              criticalCSS.push(cssText);
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
        continue;
      }
    }

    return criticalCSS.join('\n');
  }

  /**
   * Check if a CSS rule is potentially critical
   */
  isPotentiallyCritical(selector, cssText) {
    // Simple heuristics for critical CSS detection
    const criticalIndicators = [
      'body', 'html', 'h1', 'h2', 'h3', 'p', 'div', 'header', 'nav', 'main',
      'width', 'height', 'display', 'position', 'background', 'color', 'font'
    ];

    const selectorLower = selector.toLowerCase();
    const cssLower = cssText.toLowerCase();

    return criticalIndicators.some(indicator =>
      selectorLower.includes(indicator) || cssLower.includes(indicator)
    );
  }
}

/**
 * Critical CSS Optimizer
 */
class CriticalCSSOptimizer {
  constructor() {
    this.detector = new CriticalCSSDetector();
    this.criticalCSSCache = new Map();
    this.optimizationRules = this.initializeOptimizationRules();
  }

  /**
   * Initialize CSS optimization rules
   */
  initializeOptimizationRules() {
    return {
      // Remove unused rules
      removeUnused: true,

      // Merge duplicate properties
      mergeDuplicates: true,

      // Optimize property order
      optimizeOrder: true,

      // Remove redundant rules
      removeRedundant: true,

      // Minify CSS
      minify: PERFORMANCE_CONFIG.MINIFY_CSS
    };
  }

  /**
   * Extract and optimize critical CSS
   */
  async extractCriticalCSS(themeStyles) {
    const cacheKey = `${this.detector.viewportMetrics.width}x${this.detector.viewportMetrics.height}`;

    // Check cache first
    if (this.criticalCSSCache.has(cacheKey)) {
      return this.criticalCSSCache.get(cacheKey);
    }

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('Extracting critical CSS for viewport:', this.detector.viewportMetrics);
    }

    const startTime = performance.now();

    // Analyze DOM for critical elements
    const criticalElements = this.detector.analyzeDOMForCriticalElements();

    // Extract critical selectors
    const criticalSelectors = this.detector.extractCriticalSelectors(criticalElements);

    // Generate critical CSS
    let criticalCSS = this.detector.generateCriticalCSSRules(criticalSelectors, themeStyles);

    // Add existing critical CSS from stylesheets
    const existingCriticalCSS = this.detector.detectCriticalCSSFromStylesheets();
    if (existingCriticalCSS) {
      criticalCSS = `${existingCriticalCSS}\n${criticalCSS}`;
    }

    // Apply optimizations
    criticalCSS = this.applyOptimizations(criticalCSS);

    // Cache the result
    this.criticalCSSCache.set(cacheKey, criticalCSS);

    const extractionTime = performance.now() - startTime;

    if (DEBUG.LOG_PERFORMANCE) {
      console.log(`Critical CSS extracted in ${extractionTime.toFixed(2)}ms`);
      console.log(`Critical CSS size: ${criticalCSS.length} characters`);
      console.log(`Critical selectors found: ${criticalSelectors.length}`);
    }

    return criticalCSS;
  }

  /**
   * Apply CSS optimizations
   */
  applyOptimizations(cssText) {
    let optimized = cssText;

    if (this.optimizationRules.minify) {
      optimized = this.minifyCSS(optimized);
    }

    if (this.optimizationRules.mergeDuplicates) {
      optimized = this.mergeDuplicateProperties(optimized);
    }

    if (this.optimizationRules.optimizeOrder) {
      optimized = this.optimizePropertyOrder(optimized);
    }

    return optimized;
  }

  /**
   * Minify CSS for better performance
   */
  minifyCSS(cssText) {
    return cssText
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/\s*{\s*/g, '{')       // Remove spaces around braces
      .replace(/\s*}\s*/g, '}')       // Remove spaces around closing braces
      .replace(/;\s*}/g, '}')         // Remove last semicolon in rule
      .replace(/;\s*([;}])/g, '$1')   // Remove unnecessary semicolons
      .trim();
  }

  /**
   * Merge duplicate CSS properties
   */
  mergeDuplicateProperties(cssText) {
    // Simple duplicate property merger
    const rules = cssText.match(/{[^}]+}/g) || [];

    for (const rule of rules) {
      const properties = {};
      const propMatches = rule.match(/([a-zA-Z-]+)\s*:\s*[^;]+/g) || [];

      for (const prop of propMatches) {
        const [property, value] = prop.split(':').map(s => s.trim());
        properties[property] = value;
      }

      // Keep only unique properties
      const uniqueProps = Object.entries(properties)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');

      cssText = cssText.replace(rule, `{ ${uniqueProps} }`);
    }

    return cssText;
  }

  /**
   * Optimize CSS property order for better rendering performance
   */
  optimizePropertyOrder(cssText) {
    const propertyOrder = [
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
      'margin', 'padding', 'border', 'background', 'color', 'font',
      'text', 'line-height', 'vertical-align', 'z-index', 'opacity',
      'transform', 'transition', 'animation'
    ];

    return cssText; // Simplified for now
  }

  /**
   * Clear cache when viewport changes significantly
   */
  clearCache() {
    this.criticalCSSCache.clear();
  }
}

/**
 * Critical CSS Preloader
 */
class CriticalCSSPreloader {
  constructor() {
    this.preloaded = false;
  }

  /**
   * Preload critical CSS before theme injection
   */
  async preloadCriticalCSS(themeStyles) {
    if (this.preloaded) return;

    const optimizer = new CriticalCSSOptimizer();
    const criticalCSS = await optimizer.extractCriticalCSS(themeStyles);

    if (criticalCSS) {
      // Create critical CSS style element
      const criticalStyle = document.createElement('style');
      criticalStyle.id = 'owl-retro-critical-css';
      criticalStyle.setAttribute('data-critical', 'true');
      criticalStyle.textContent = criticalCSS;

      // Insert as first style element for highest priority
      if (document.head && document.head.firstChild) {
        document.head.insertBefore(criticalStyle, document.head.firstChild);
      } else if (document.head) {
        document.head.appendChild(criticalStyle);
      }

      this.preloaded = true;

      if (DEBUG.LOG_PERFORMANCE) {
        console.log('Critical CSS preloaded successfully');
      }
    }
  }
}

// Singleton instances
let criticalCSSOptimizer = null;

/**
 * Initialize critical CSS system
 */
export function initializeCriticalCSS() {
  if (!criticalCSSOptimizer) {
    criticalCSSOptimizer = new CriticalCSSOptimizer();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('Critical CSS System Initialized');
    }
  }

  return criticalCSSOptimizer;
}

/**
 * Extract critical CSS from current page
 */
export async function extractCriticalCSS(themeStyles) {
  const optimizer = initializeCriticalCSS();
  return await optimizer.extractCriticalCSS(themeStyles);
}

/**
 * Preload critical CSS for better performance
 */
export async function preloadCriticalCSS(themeStyles) {
  const preloader = new CriticalCSSPreloader();
  return await preloader.preloadCriticalCSS(themeStyles);
}

/**
 * Get critical CSS statistics
 */
export function getCriticalCSSStats() {
  const optimizer = initializeCriticalCSS();
  return {
    cacheSize: optimizer.criticalCSSCache.size,
    viewportMetrics: optimizer.detector.viewportMetrics
  };
}

/**
 * Clear critical CSS cache
 */
export function clearCriticalCSSCache() {
  const optimizer = initializeCriticalCSS();
  optimizer.clearCache();
}

/**
 * Export classes for external use
 */
export { CriticalCSSDetector, CriticalCSSOptimizer, CriticalCSSPreloader };

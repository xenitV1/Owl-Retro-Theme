/**
 * Owl Retro - CSS-in-JS Compatibility Module
 * Modern CSS-in-JS framework'leri ile uyumluluk sağlar
 * 2024-2025 teknikleri ile optimize edilmiş
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../constants.js';

/**
 * CSS-in-JS Framework Detection System
 */
class CSSInJSDetector {
  constructor() {
    this.frameworks = new Map();
    this.initializeFrameworkDetectors();
  }

  /**
   * Initialize framework detection patterns
   */
  initializeFrameworkDetectors() {
    this.frameworks.set('emotion', {
      test: () => window.emotion || document.querySelector('[data-emotion]'),
      injectionMethod: 'emotion'
    });

    this.frameworks.set('styled-components', {
      test: () => window.styled || document.querySelector('[data-styled-version]'),
      injectionMethod: 'styled'
    });

    this.frameworks.set('jss', {
      test: () => window.jss || document.querySelector('[data-jss]'),
      injectionMethod: 'jss'
    });

    this.frameworks.set('goober', {
      test: () => window.goober || document.querySelector('[data-goober]'),
      injectionMethod: 'goober'
    });

    this.frameworks.set('stitches', {
      test: () => window.__stitches__ || document.querySelector('[data-css]'),
      injectionMethod: 'stitches'
    });
  }

  /**
   * Detect active CSS-in-JS frameworks
   */
  detectActiveFrameworks() {
    const active = [];

    for (const [name, config] of this.frameworks) {
      if (config.test()) {
        active.push(name);
      }
    }

    return active;
  }

  /**
   * Get compatibility strategy for detected frameworks
   */
  getCompatibilityStrategy(frameworks) {
    if (frameworks.length === 0) {
      return 'standard-injection';
    }

    if (frameworks.includes('emotion')) {
      return 'emotion-optimized';
    }

    if (frameworks.includes('styled-components')) {
      return 'styled-components-optimized';
    }

    if (frameworks.length > 1) {
      return 'multi-framework-compat';
    }

    return 'generic-css-in-js-compat';
  }
}

/**
 * CSS-in-JS Injection Manager
 */
class CSSInJSManager {
  constructor() {
    this.detector = new CSSInJSDetector();
    this.injectionStrategies = new Map();
    this.initializeStrategies();
  }

  /**
   * Initialize injection strategies for different frameworks
   */
  initializeStrategies() {
    // Standard CSS injection strategy
    this.injectionStrategies.set('standard-injection', {
      priority: 'low',
      isolation: false,
      compatibility: 'full'
    });

    // Emotion optimized strategy
    this.injectionStrategies.set('emotion-optimized', {
      priority: 'high',
      isolation: true,
      compatibility: 'full',
      targetSelector: '[data-emotion]',
      insertionMethod: 'prepend'
    });

    // Styled Components optimized strategy
    this.injectionStrategies.set('styled-components-optimized', {
      priority: 'high',
      isolation: true,
      compatibility: 'full',
      targetSelector: '[data-styled-version]',
      insertionMethod: 'prepend'
    });

    // Multi-framework compatibility strategy
    this.injectionStrategies.set('multi-framework-compat', {
      priority: 'medium',
      isolation: true,
      compatibility: 'selective',
      targetSelector: '[data-emotion], [data-styled-version], [data-jss]',
      insertionMethod: 'isolate'
    });

    // Generic CSS-in-JS compatibility strategy
    this.injectionStrategies.set('generic-css-in-js-compat', {
      priority: 'medium',
      isolation: false,
      compatibility: 'partial',
      insertionMethod: 'append'
    });
  }

  /**
   * Get optimal injection strategy based on detected frameworks
   */
  getOptimalStrategy() {
    const activeFrameworks = this.detector.detectActiveFrameworks();
    const strategyName = this.detector.getCompatibilityStrategy(activeFrameworks);
    return this.injectionStrategies.get(strategyName);
  }

  /**
   * Create CSS-in-JS compatible style element
   */
  createCompatibleStyleElement(cssText, strategy) {
    const style = document.createElement('style');
    style.id = 'owl-retro-css-in-js-compat';

    // Apply strategy-specific attributes
    if (strategy.isolation) {
      style.setAttribute('data-owl-retro-isolated', 'true');
    }

    style.textContent = cssText;

    return style;
  }

  /**
   * Inject CSS with CSS-in-JS compatibility
   */
  injectCompatibleCSS(cssText) {
    const strategy = this.getOptimalStrategy();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('CSS-in-JS Injection Strategy:', strategy);
      console.log('Active Frameworks:', this.detector.detectActiveFrameworks());
    }

    // Create compatible style element
    const styleElement = this.createCompatibleStyleElement(cssText, strategy);

    // Determine insertion point based on strategy
    let insertionPoint = null;

    switch (strategy.insertionMethod) {
      case 'prepend':
        insertionPoint = document.head?.firstChild;
        break;
      case 'append':
        insertionPoint = null; // Append to end
        break;
      case 'isolate':
        // Create isolation container
        insertionPoint = this.createIsolationContainer();
        break;
      default:
        insertionPoint = null;
    }

    // Inject the style element
    if (insertionPoint && document.head) {
      document.head.insertBefore(styleElement, insertionPoint);
    } else if (document.head) {
      document.head.appendChild(styleElement);
    } else {
      document.documentElement.appendChild(styleElement);
    }

    return styleElement;
  }

  /**
   * Create isolation container for multi-framework scenarios
   */
  createIsolationContainer() {
    if (!document.head) return null;

    let container = document.getElementById('owl-retro-isolation-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'owl-retro-isolation-container';
      container.style.display = 'none';
      document.head.appendChild(container);
    }

    return container;
  }
}

/**
 * CSS-in-JS Performance Monitor
 */
class CSSInJSPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  /**
   * Monitor CSS-in-JS injection performance
   */
  monitorInjection(framework, injectionTime) {
    if (!this.metrics.has(framework)) {
      this.metrics.set(framework, {
        injectionCount: 0,
        totalTime: 0,
        avgTime: 0,
        lastInjection: 0
      });
    }

    const frameworkMetrics = this.metrics.get(framework);
    frameworkMetrics.injectionCount++;
    frameworkMetrics.totalTime += injectionTime;
    frameworkMetrics.avgTime = frameworkMetrics.totalTime / frameworkMetrics.injectionCount;
    frameworkMetrics.lastInjection = injectionTime;
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      totalFrameworks: this.metrics.size,
      frameworkMetrics: Object.fromEntries(this.metrics),
      totalMonitoringTime: performance.now() - this.startTime
    };
  }
}

// Singleton instances
let cssInJSManager = null;
let performanceMonitor = null;

/**
 * Initialize CSS-in-JS compatibility system
 */
export function initializeCSSInJSCompatibility() {
  if (!cssInJSManager) {
    cssInJSManager = new CSSInJSManager();
    performanceMonitor = new CSSInJSPerformanceMonitor();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('CSS-in-JS Compatibility System Initialized');
    }
  }

  return cssInJSManager;
}

/**
 * Inject CSS with CSS-in-JS compatibility
 */
export function injectCSSInJSCompatible(cssText) {
  const manager = initializeCSSInJSCompatibility();

  const startTime = performance.now();
  const styleElement = manager.injectCompatibleCSS(cssText);
  const injectionTime = performance.now() - startTime;

  // Monitor performance
  const activeFrameworks = manager.detector.detectActiveFrameworks();
  activeFrameworks.forEach(framework => {
    performanceMonitor.monitorInjection(framework, injectionTime);
  });

  if (DEBUG.LOG_PERFORMANCE) {
    console.log(`CSS-in-JS Compatible injection completed in ${injectionTime.toFixed(2)}ms`);
    console.log('Performance Report:', performanceMonitor.getPerformanceReport());
  }

  return styleElement;
}

/**
 * Check if page uses CSS-in-JS
 */
export function hasCSSInJS() {
  const manager = initializeCSSInJSCompatibility();
  return manager.detector.detectActiveFrameworks().length > 0;
}

/**
 * Get CSS-in-JS frameworks on current page
 */
export function getActiveCSSInJSFrameworks() {
  const manager = initializeCSSInJSCompatibility();
  return manager.detector.detectActiveFrameworks();
}

/**
 * Get current injection strategy
 */
export function getCurrentInjectionStrategy() {
  const manager = initializeCSSInJSCompatibility();
  return manager.getOptimalStrategy();
}

/**
 * Export performance monitor for external access
 */
export { CSSInJSPerformanceMonitor, CSSInJSManager, CSSInJSDetector };

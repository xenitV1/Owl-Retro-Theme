/**
 * Owl Retro - Style Recalculation Minimizer Module
 * DOM mutation'lardan etkilenmeyecek CSS kuralları oluşturur
 * 2024-2025 Style Recalculation teknikleri
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../constants.js';

/**
 * Mutation Types for Style Impact Analysis
 */
const MUTATION_TYPES = {
  CHILD_ADDED: 'childList',
  ATTRIBUTES: 'attributes',
  CHARACTER_DATA: 'characterData',
  STYLE: 'style'
};

/**
 * Style Impact Levels
 */
const IMPACT_LEVELS = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Style Recalculation Analyzer
 */
class StyleRecalculationAnalyzer {
  constructor() {
    this.mutationObserver = null;
    this.styleImpactMap = new WeakMap();
    this.recalculationPatterns = new Map();
    this.initializeRecalculationPatterns();
  }

  /**
   * Initialize common recalculation patterns
   */
  initializeRecalculationPatterns() {
    this.recalculationPatterns.set('class-changes', {
      pattern: /class(Name)?/,
      impact: IMPACT_LEVELS.HIGH,
      description: 'Class changes trigger full style recalculation'
    });

    this.recalculationPatterns.set('style-attributes', {
      pattern: /style/,
      impact: IMPACT_LEVELS.CRITICAL,
      description: 'Direct style changes trigger immediate recalculation'
    });

    this.recalculationPatterns.set('data-attributes', {
      pattern: /^data-/,
      impact: IMPACT_LEVELS.LOW,
      description: 'Data attributes usually don\'t affect styles'
    });

    this.recalculationPatterns.set('layout-attributes', {
      pattern: /^(width|height|position|display|float|clear)$/,
      impact: IMPACT_LEVELS.HIGH,
      description: 'Layout properties trigger layout recalculation'
    });

    this.recalculationPatterns.set('visual-attributes', {
      pattern: /^(color|background|border|font|text)/,
      impact: IMPACT_LEVELS.MEDIUM,
      description: 'Visual properties trigger paint operations'
    });
  }

  /**
   * Analyze DOM mutation for style impact
   */
  analyzeMutationForStyleImpact(mutation) {
    const analysis = {
      mutation,
      styleImpact: IMPACT_LEVELS.NONE,
      affectedElements: [],
      recalculationRequired: false,
      optimizationOpportunities: []
    };

    switch (mutation.type) {
      case MUTATION_TYPES.CHILD_ADDED:
        analysis.styleImpact = this.analyzeChildAddition(mutation);
        break;

      case MUTATION_TYPES.ATTRIBUTES:
        analysis.styleImpact = this.analyzeAttributeChange(mutation);
        break;

      case MUTATION_TYPES.CHARACTER_DATA:
        analysis.styleImpact = this.analyzeTextChange(mutation);
        break;

      case MUTATION_TYPES.STYLE:
        analysis.styleImpact = IMPACT_LEVELS.CRITICAL;
        analysis.recalculationRequired = true;
        break;
    }

    return analysis;
  }

  /**
   * Analyze child addition for style impact
   */
  analyzeChildAddition(mutation) {
    let maxImpact = IMPACT_LEVELS.NONE;

    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        const impact = this.assessElementStyleImpact(element);

        if (impact > maxImpact) {
          maxImpact = impact;
        }

        analysis.affectedElements.push(element);
      }
    }

    return maxImpact;
  }

  /**
   * Analyze attribute change for style impact
   */
  analyzeAttributeChange(mutation) {
    const attributeName = mutation.attributeName;

    if (!attributeName) return IMPACT_LEVELS.NONE;

    // Check if attribute affects styles
    for (const [patternName, pattern] of this.recalculationPatterns) {
      if (pattern.pattern.test(attributeName)) {
        return pattern.impact;
      }
    }

    return IMPACT_LEVELS.NONE;
  }

  /**
   * Analyze text change for style impact
   */
  analyzeTextChange(mutation) {
    // Text changes rarely affect layout unless they're in specific contexts
    const target = mutation.target;

    // Check if text node is in an element that might be affected
    if (target.parentElement) {
      const parentStyle = window.getComputedStyle(target.parentElement);

      // If parent has specific sizing, text changes might affect layout
      if (parentStyle.width === 'auto' || parentStyle.height === 'auto') {
        return IMPACT_LEVELS.LOW;
      }
    }

    return IMPACT_LEVELS.NONE;
  }

  /**
   * Assess element's potential style impact
   */
  assessElementStyleImpact(element) {
    const tagName = element.tagName.toLowerCase();
    const computedStyle = window.getComputedStyle(element);

    // High-impact elements
    const highImpactElements = ['img', 'video', 'canvas', 'iframe', 'object', 'embed'];
    if (highImpactElements.includes(tagName)) {
      return IMPACT_LEVELS.HIGH;
    }

    // Elements with intrinsic size
    if (tagName === 'img' && !element.hasAttribute('width') && !element.hasAttribute('height')) {
      return IMPACT_LEVELS.HIGH;
    }

    // Elements with fixed positioning
    if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
      return IMPACT_LEVELS.MEDIUM;
    }

    // Elements with transforms
    if (computedStyle.transform !== 'none') {
      return IMPACT_LEVELS.LOW;
    }

    return IMPACT_LEVELS.NONE;
  }

  /**
   * Start monitoring DOM mutations
   */
  startMutationMonitoring(callback) {
    if (this.mutationObserver) {
      this.stopMutationMonitoring();
    }

    const config = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeFilter: [
        'class', 'style', 'id', 'width', 'height', 'src',
        'data-theme', 'data-owl-retro', 'data-theme-applied'
      ]
    };

    this.mutationObserver = new MutationObserver((mutations) => {
      this.processMutations(mutations, callback);
    });

    this.mutationObserver.observe(document.body, config);

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('Style recalculation monitoring started');
    }
  }

  /**
   * Stop monitoring DOM mutations
   */
  stopMutationMonitoring() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;

      if (DEBUG.LOG_PERFORMANCE) {
        console.log('Style recalculation monitoring stopped');
      }
    }
  }

  /**
   * Process mutations and identify optimization opportunities
   */
  processMutations(mutations, callback) {
    const styleImpacts = [];
    let maxImpact = IMPACT_LEVELS.NONE;

    for (const mutation of mutations) {
      const analysis = this.analyzeMutationForStyleImpact(mutation);

      if (analysis.styleImpact !== IMPACT_LEVELS.NONE) {
        styleImpacts.push(analysis);

        if (analysis.styleImpact > maxImpact) {
          maxImpact = analysis.styleImpact;
        }
      }
    }

    if (styleImpacts.length > 0) {
      callback({
        mutations: styleImpacts,
        maxImpact,
        optimizationNeeded: maxImpact >= IMPACT_LEVELS.MEDIUM
      });
    }
  }
}

/**
 * Style Recalculation Minimizer
 */
class StyleRecalculationMinimizer {
  constructor() {
    this.analyzer = new StyleRecalculationAnalyzer();
    this.minimizationStrategies = new Map();
    this.activeOptimizations = new Set();
    this.performanceMonitor = new RecalculationPerformanceMonitor();
    this.initializeMinimizationStrategies();
  }

  /**
   * Initialize minimization strategies
   */
  initializeMinimizationStrategies() {
    this.minimizationStrategies.set('debounce-style-changes', {
      name: 'Debounce Style Changes',
      description: 'Group multiple style changes together',
      priority: 'high',
      implementation: this.implementDebouncedStyleChanges.bind(this)
    });

    this.minimizationStrategies.set('css-containment', {
      name: 'CSS Containment',
      description: 'Use CSS containment to isolate style calculations',
      priority: 'high',
      implementation: this.implementCSSContainment.bind(this)
    });

    this.minimizationStrategies.set('virtual-styles', {
      name: 'Virtual Styles',
      description: 'Use transform3d and will-change for GPU acceleration',
      priority: 'medium',
      implementation: this.implementVirtualStyles.bind(this)
    });

    this.minimizationStrategies.set('layout-batching', {
      name: 'Layout Batching',
      description: 'Batch DOM changes to reduce layout thrashing',
      priority: 'high',
      implementation: this.implementLayoutBatching.bind(this)
    });

    this.minimizationStrategies.set('style-invalidation-prevention', {
      name: 'Style Invalidation Prevention',
      description: 'Prevent style invalidation through smart attribute usage',
      priority: 'medium',
      implementation: this.implementStyleInvalidationPrevention.bind(this)
    });
  }

  /**
   * Start minimization process
   */
  startMinimization() {
    // Sort strategies by priority
    const sortedStrategies = Array.from(this.minimizationStrategies.values())
      .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));

    for (const strategy of sortedStrategies) {
      try {
        strategy.implementation();
        this.activeOptimizations.add(strategy.name);

        if (DEBUG.LOG_PERFORMANCE) {
          console.log(`Applied minimization strategy: ${strategy.name}`);
        }
      } catch (error) {
        if (DEBUG.LOG_PERFORMANCE) {
          console.warn(`Failed to apply strategy ${strategy.name}:`, error);
        }
      }
    }

    // Start monitoring for dynamic optimizations
    this.startDynamicOptimization();
  }

  /**
   * Get priority score for strategy
   */
  getPriorityScore(priority) {
    const scores = { 'high': 3, 'medium': 2, 'low': 1 };
    return scores[priority] || 0;
  }

  /**
   * Start dynamic optimization based on mutations
   */
  startDynamicOptimization() {
    this.analyzer.startMutationMonitoring((analysis) => {
      this.handleStyleImpactingMutations(analysis);
    });
  }

  /**
   * Handle mutations that impact styles
   */
  handleStyleImpactingMutations(analysis) {
    if (analysis.optimizationNeeded) {
      this.performanceMonitor.recordStyleImpact(analysis);

      // Apply additional optimizations based on impact level
      if (analysis.maxImpact === IMPACT_LEVELS.CRITICAL) {
        this.applyCriticalOptimizations();
      } else if (analysis.maxImpact === IMPACT_LEVELS.HIGH) {
        this.applyHighImpactOptimizations();
      }

      if (DEBUG.LOG_PERFORMANCE) {
        console.log('Style impact detected:', analysis);
      }
    }
  }

  /**
   * Apply critical optimizations for high-impact mutations
   */
  applyCriticalOptimizations() {
    // Force layout stabilization
    this.stabilizeLayout();

    // Apply emergency containment
    this.applyEmergencyContainment();
  }

  /**
   * Apply optimizations for high-impact mutations
   */
  applyHighImpactOptimizations() {
    // Debounce non-critical style changes
    this.debounceStyleChanges();

    // Optimize affected elements
    this.optimizeAffectedElements();
  }

  /**
   * Implement debounced style changes
   */
  implementDebouncedStyleChanges() {
    let styleChangeTimeout = null;
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;

    CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
      if (priority !== 'owl-retro-critical') {
        // Debounce non-critical changes
        if (styleChangeTimeout) {
          clearTimeout(styleChangeTimeout);
        }

        styleChangeTimeout = setTimeout(() => {
          originalSetProperty.call(this, property, value, priority);
        }, PERFORMANCE_CONFIG.STYLE_CHANGE_DEBOUNCE_MS);
      } else {
        // Apply critical changes immediately
        originalSetProperty.call(this, property, value, priority);
      }
    };
  }

  /**
   * Implement CSS containment for optimization
   */
  implementCSSContainment() {
    // Add containment styles to theme elements
    const containmentCSS = `
      [data-owl-retro-theme] {
        contain: layout style;
      }

      [data-theme-applied] {
        contain: layout;
      }

      .owl-retro-theme {
        contain: style paint;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'owl-retro-containment-styles';
    styleElement.textContent = containmentCSS;
    document.head.appendChild(styleElement);
  }

  /**
   * Implement virtual styles for GPU acceleration
   */
  implementVirtualStyles() {
    // Add will-change properties for better performance
    const virtualStylesCSS = `
      [data-owl-retro-theme] {
        will-change: transform;
        transform: translateZ(0);
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'owl-retro-virtual-styles';
    styleElement.textContent = virtualStylesCSS;
    document.head.appendChild(styleElement);
  }

  /**
   * Implement layout batching
   */
  implementLayoutBatching() {
    let batchedChanges = [];
    let batchTimeout = null;

    // Override common DOM manipulation methods
    const originalAppendChild = Element.prototype.appendChild;
    const originalInsertBefore = Element.prototype.insertBefore;
    const originalRemoveChild = Element.prototype.removeChild;

    const batchDOMChange = (operation, element, ...args) => {
      batchedChanges.push({ operation, element, args });

      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }

      batchTimeout = setTimeout(() => {
        this.processBatchedChanges(batchedChanges);
        batchedChanges = [];
      }, PERFORMANCE_CONFIG.LAYOUT_BATCH_DELAY_MS);
    };

    Element.prototype.appendChild = function(child) {
      batchDOMChange('append', this, child);
      return child;
    };

    Element.prototype.insertBefore = function(child, reference) {
      batchDOMChange('insertBefore', this, child, reference);
      return child;
    };

    Element.prototype.removeChild = function(child) {
      batchDOMChange('remove', this, child);
      return child;
    };
  }

  /**
   * Implement style invalidation prevention
   */
  implementStyleInvalidationPrevention() {
    // Use data attributes instead of class changes when possible
    const originalSetAttribute = Element.prototype.setAttribute;

    Element.prototype.setAttribute = function(name, value) {
      if (name === 'class' && this.hasAttribute('data-owl-retro-style-id')) {
        // Use data attribute instead of class for theme changes
        originalSetAttribute.call(this, 'data-owl-retro-theme-class', value);
        return;
      }

      return originalSetAttribute.call(this, name, value);
    };
  }

  /**
   * Process batched DOM changes
   */
  processBatchedChanges(changes) {
    // Group changes by parent element
    const changesByParent = new Map();

    for (const change of changes) {
      if (!changesByParent.has(change.element)) {
        changesByParent.set(change.element, []);
      }
      changesByParent.get(change.element).push(change);
    }

    // Apply changes in batch
    requestAnimationFrame(() => {
      for (const [parent, parentChanges] of changesByParent) {
        for (const change of parentChanges) {
          switch (change.operation) {
            case 'append':
              parent.appendChild(change.args[0]);
              break;
            case 'insertBefore':
              parent.insertBefore(change.args[0], change.args[1]);
              break;
            case 'remove':
              parent.removeChild(change.args[0]);
              break;
          }
        }
      }
    });
  }

  /**
   * Stabilize layout after changes
   */
  stabilizeLayout() {
    // Force layout calculation
    document.body.offsetHeight;
  }

  /**
   * Apply emergency containment for critical situations
   */
  applyEmergencyContainment() {
    const criticalElements = document.querySelectorAll(`
      [data-owl-retro-theme],
      [data-theme-applied],
      .owl-retro-theme
    `);

    for (const element of criticalElements) {
      element.style.contain = 'layout style paint';
    }
  }

  /**
   * Debounce style changes for better performance
   */
  debounceStyleChanges() {
    // Implementation handled in implementDebouncedStyleChanges
  }

  /**
   * Optimize affected elements
   */
  optimizeAffectedElements() {
    const themeElements = document.querySelectorAll(`
      [data-owl-retro-theme],
      [data-theme-applied]
    `);

    for (const element of themeElements) {
      element.style.willChange = 'auto';
      element.style.transform = 'translateZ(0)';
    }
  }

  /**
   * Get minimization statistics
   */
  getMinimizationStats() {
    return {
      activeOptimizations: Array.from(this.activeOptimizations),
      performanceMetrics: this.performanceMonitor.getMetrics(),
      mutationAnalysis: this.analyzer.getAnalysisStats()
    };
  }
}

/**
 * Recalculation Performance Monitor
 */
class RecalculationPerformanceMonitor {
  constructor() {
    this.metrics = {
      styleImpacts: 0,
      criticalImpacts: 0,
      highImpacts: 0,
      optimizationsApplied: 0,
      performanceGain: 0
    };
    this.startTime = performance.now();
  }

  /**
   * Record style impact
   */
  recordStyleImpact(analysis) {
    this.metrics.styleImpacts++;

    if (analysis.maxImpact === IMPACT_LEVELS.CRITICAL) {
      this.metrics.criticalImpacts++;
    } else if (analysis.maxImpact === IMPACT_LEVELS.HIGH) {
      this.metrics.highImpacts++;
    }
  }

  /**
   * Record optimization application
   */
  recordOptimization() {
    this.metrics.optimizationsApplied++;
  }

  /**
   * Calculate performance gain
   */
  calculatePerformanceGain() {
    const baseScore = this.metrics.optimizationsApplied * 10;
    const criticalPrevention = this.metrics.criticalImpacts * 50;
    const highImpactPrevention = this.metrics.highImpacts * 25;

    return baseScore + criticalPrevention + highImpactPrevention;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      performanceGain: this.calculatePerformanceGain(),
      monitoringDuration: performance.now() - this.startTime
    };
  }
}

// Singleton instances
let styleRecalculationMinimizer = null;

/**
 * Initialize style recalculation minimization
 */
export function initializeStyleRecalculationMinimization() {
  if (!styleRecalculationMinimizer) {
    styleRecalculationMinimizer = new StyleRecalculationMinimizer();
    styleRecalculationMinimizer.startMinimization();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('Style Recalculation Minimization System Initialized');
    }
  }

  return styleRecalculationMinimizer;
}

/**
 * Get minimization statistics
 */
export function getStyleRecalculationStats() {
  const minimizer = initializeStyleRecalculationMinimization();
  return minimizer.getMinimizationStats();
}

/**
 * Force optimization for specific element
 */
export function forceOptimizeElement(element) {
  const minimizer = initializeStyleRecalculationMinimizer();

  // Apply virtual styles
  element.style.willChange = 'auto';
  element.style.transform = 'translateZ(0)';

  // Apply containment
  element.style.contain = 'layout style';

  return true;
}

/**
 * Export classes for external use
 */
export { StyleRecalculationAnalyzer, StyleRecalculationMinimizer, RecalculationPerformanceMonitor };

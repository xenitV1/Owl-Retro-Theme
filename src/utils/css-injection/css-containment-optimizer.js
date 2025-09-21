/**
 * Owl Retro - CSS Containment Optimizer Module
 * CSS containment kullanarak style recalculation'ı minimize eder
 * 2024-2025 CSS Containment teknikleri
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../constants.js';

/**
 * CSS Containment Types
 */
const CONTAINMENT_TYPES = {
  LAYOUT: 'layout',
  PAINT: 'paint',
  SIZE: 'size',
  STYLE: 'style',
  ALL: 'strict'
};

/**
 * Containment Strategy Configuration
 */
const CONTAINMENT_STRATEGIES = {
  STRICT: {
    types: [CONTAINMENT_TYPES.LAYOUT, CONTAINMENT_TYPES.PAINT, CONTAINMENT_TYPES.SIZE],
    performance: 'high',
    compatibility: 'modern'
  },
  LAYOUT_ONLY: {
    types: [CONTAINMENT_TYPES.LAYOUT],
    performance: 'medium',
    compatibility: 'universal'
  },
  STYLE_ONLY: {
    types: [CONTAINMENT_TYPES.STYLE],
    performance: 'low',
    compatibility: 'universal'
  },
  PROGRESSIVE: {
    types: [CONTAINMENT_TYPES.SIZE, CONTAINMENT_TYPES.LAYOUT],
    performance: 'medium',
    compatibility: 'progressive'
  }
};

/**
 * CSS Containment Analyzer
 */
class ContainmentAnalyzer {
  constructor() {
    this.containedElements = new WeakMap();
    this.browserSupport = this.detectBrowserSupport();
  }

  /**
   * Detect browser support for CSS containment
   */
  detectBrowserSupport() {
    // Test containment support
    const testElement = document.createElement('div');
    testElement.style.contain = 'layout';
    const supported = testElement.style.contain !== '';

    return {
      supported,
      containmentTypes: {
        layout: supported,
        paint: supported,
        size: supported,
        style: supported,
        strict: supported
      }
    };
  }

  /**
   * Analyze element for containment opportunities
   */
  analyzeElementForContainment(element) {
    const analysis = {
      element,
      recommendedStrategy: null,
      containmentBenefits: [],
      risks: []
    };

    // Check if element is already contained
    if (this.containedElements.has(element)) {
      analysis.recommendedStrategy = 'already-contained';
      return analysis;
    }

    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    // Analyze containment opportunities
    const opportunities = this.identifyContainmentOpportunities(element, computedStyle, rect);

    if (opportunities.length > 0) {
      analysis.recommendedStrategy = this.selectOptimalStrategy(opportunities);
      analysis.containmentBenefits = opportunities;
    } else {
      analysis.recommendedStrategy = 'no-containment';
    }

    return analysis;
  }

  /**
   * Identify containment opportunities for element
   */
  identifyContainmentOpportunities(element, computedStyle, rect) {
    const opportunities = [];

    // Layout containment opportunity
    if (this.canBenefitFromLayoutContainment(element, computedStyle)) {
      opportunities.push({
        type: CONTAINMENT_TYPES.LAYOUT,
        benefit: 'Prevents layout recalculation of descendants',
        performance: 'high'
      });
    }

    // Paint containment opportunity
    if (this.canBenefitFromPaintContainment(element, computedStyle)) {
      opportunities.push({
        type: CONTAINMENT_TYPES.PAINT,
        benefit: 'Isolates paint operations to element bounds',
        performance: 'medium'
      });
    }

    // Size containment opportunity
    if (this.canBenefitFromSizeContainment(element, computedStyle)) {
      opportunities.push({
        type: CONTAINMENT_TYPES.SIZE,
        benefit: 'Prevents size recalculation of element',
        performance: 'medium'
      });
    }

    // Style containment opportunity
    if (this.canBenefitFromStyleContainment(element, computedStyle)) {
      opportunities.push({
        type: CONTAINMENT_TYPES.STYLE,
        benefit: 'Prevents style recalculation of descendants',
        performance: 'high'
      });
    }

    return opportunities;
  }

  /**
   * Check if element can benefit from layout containment
   */
  canBenefitFromLayoutContainment(element, computedStyle) {
    // Elements that frequently change size or position
    const dynamicElements = ['img', 'video', 'canvas', 'iframe'];
    const isDynamic = dynamicElements.includes(element.tagName.toLowerCase());

    // Elements with fixed dimensions
    const hasFixedSize = computedStyle.width !== 'auto' && computedStyle.height !== 'auto';

    // Elements that are absolutely positioned
    const isPositioned = computedStyle.position === 'absolute' ||
                        computedStyle.position === 'fixed' ||
                        computedStyle.position === 'sticky';

    return isDynamic || hasFixedSize || isPositioned;
  }

  /**
   * Check if element can benefit from paint containment
   */
  canBenefitFromPaintContainment(element, computedStyle) {
    // Elements with complex backgrounds or effects
    const hasComplexVisual = computedStyle.backgroundImage !== 'none' ||
                            computedStyle.boxShadow !== 'none' ||
                            computedStyle.borderRadius !== '0px' ||
                            computedStyle.transform !== 'none';

    // Elements with overflow
    const hasOverflow = computedStyle.overflow !== 'visible';

    // Animated elements
    const isAnimated = computedStyle.transition !== 'all 0s ease 0s' ||
                      computedStyle.animationName !== 'none';

    return hasComplexVisual || hasOverflow || isAnimated;
  }

  /**
   * Check if element can benefit from size containment
   */
  canBenefitFromSizeContainment(element, computedStyle) {
    // Elements with intrinsic size
    const hasIntrinsicSize = computedStyle.width !== 'auto' ||
                            computedStyle.height !== 'auto';

    // Replaced elements
    const replacedElements = ['img', 'video', 'canvas', 'input', 'textarea', 'select'];
    const isReplaced = replacedElements.includes(element.tagName.toLowerCase());

    return hasIntrinsicSize || isReplaced;
  }

  /**
   * Check if element can benefit from style containment
   */
  canBenefitFromStyleContainment(element, computedStyle) {
    // Elements with many children
    const hasManyChildren = element.children.length > 5;

    // Elements that frequently have styles changed
    const hasDynamicStyles = element.hasAttribute('data-dynamic-styles') ||
                            element.classList.contains('dynamic-style');

    // Elements with complex CSS selectors
    const hasComplexSelectors = Array.from(element.classList).some(cls =>
      cls.includes('theme') || cls.includes('state')
    );

    return hasManyChildren || hasDynamicStyles || hasComplexSelectors;
  }

  /**
   * Select optimal containment strategy
   */
  selectOptimalStrategy(opportunities) {
    if (opportunities.length === 0) {
      return 'no-containment';
    }

    // Prioritize strategies based on browser support and benefits
    const strategyScores = {
      [CONTAINMENT_STRATEGIES.STRICT]: 10,
      [CONTAINMENT_STRATEGIES.PROGRESSIVE]: 7,
      [CONTAINMENT_STRATEGIES.LAYOUT_ONLY]: 5,
      [CONTAINMENT_STRATEGIES.STYLE_ONLY]: 3
    };

    let bestStrategy = CONTAINMENT_STRATEGIES.LAYOUT_ONLY;
    let bestScore = 0;

    for (const strategy of Object.values(CONTAINMENT_STRATEGIES)) {
      const score = this.calculateStrategyScore(strategy, opportunities);
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = strategy;
      }
    }

    return bestStrategy;
  }

  /**
   * Calculate score for containment strategy
   */
  calculateStrategyScore(strategy, opportunities) {
    let score = 0;

    for (const opportunity of opportunities) {
      if (strategy.types.includes(opportunity.type)) {
        score += opportunity.performance === 'high' ? 3 :
                 opportunity.performance === 'medium' ? 2 : 1;
      }
    }

    // Adjust for browser compatibility
    if (!this.browserSupport.supported) {
      score *= 0.5;
    }

    return score;
  }
}

/**
 * CSS Containment Manager
 */
class ContainmentManager {
  constructor() {
    this.analyzer = new ContainmentAnalyzer();
    this.containedElements = new Set();
    this.performanceMonitor = new ContainmentPerformanceMonitor();
  }

  /**
   * Apply containment to element
   */
  applyContainment(element, strategy) {
    if (!this.analyzer.browserSupport.supported) {
      if (DEBUG.LOG_PERFORMANCE) {
        console.log('CSS Containment not supported in this browser');
      }
      return false;
    }

    // Check if already contained
    if (this.containedElements.has(element)) {
      return true;
    }

    try {
      const containmentValue = strategy.types.join(' ');
      element.style.contain = containmentValue;

      // Mark as contained
      this.containedElements.add(element);
      this.performanceMonitor.recordContainment(element, strategy);

      if (DEBUG.LOG_PERFORMANCE) {
        console.log(`Applied containment to element:`, element);
        console.log(`Containment strategy:`, strategy);
      }

      return true;
    } catch (error) {
      if (DEBUG.LOG_PERFORMANCE) {
        console.warn('Failed to apply containment:', error);
      }
      return false;
    }
  }

  /**
   * Remove containment from element
   */
  removeContainment(element) {
    if (this.containedElements.has(element)) {
      element.style.contain = '';
      this.containedElements.delete(element);

      if (DEBUG.LOG_PERFORMANCE) {
        console.log('Removed containment from element:', element);
      }
    }
  }

  /**
   * Apply containment to multiple elements
   */
  applyContainmentToElements(elements, strategy) {
    const results = {
      successful: 0,
      failed: 0,
      skipped: 0
    };

    for (const element of elements) {
      const analysis = this.analyzer.analyzeElementForContainment(element);

      if (analysis.recommendedStrategy === 'already-contained') {
        results.skipped++;
        continue;
      }

      if (analysis.recommendedStrategy !== 'no-containment') {
        const success = this.applyContainment(element, strategy);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
        }
      } else {
        results.skipped++;
      }
    }

    return results;
  }

  /**
   * Auto-apply containment to theme-related elements
   */
  autoApplyThemeContainment() {
    const themeElements = document.querySelectorAll(`
      [data-owl-retro-theme],
      [data-theme-applied],
      .owl-retro-theme,
      .owl-retro-dark,
      .owl-retro-light
    `);

    const strategy = CONTAINMENT_STRATEGIES.PROGRESSIVE;
    return this.applyContainmentToElements(Array.from(themeElements), strategy);
  }

  /**
   * Get containment statistics
   */
  getContainmentStats() {
    return {
      containedElements: this.containedElements.size,
      browserSupport: this.analyzer.browserSupport,
      performanceMetrics: this.performanceMonitor.getMetrics()
    };
  }
}

/**
 * Containment Performance Monitor
 */
class ContainmentPerformanceMonitor {
  constructor() {
    this.metrics = {
      containmentApplied: 0,
      styleRecalculationsPrevented: 0,
      layoutThrashingPrevented: 0,
      paintOperationsOptimized: 0
    };
    this.startTime = performance.now();
  }

  /**
   * Record containment application
   */
  recordContainment(element, strategy) {
    this.metrics.containmentApplied++;

    // Estimate performance benefits based on strategy
    if (strategy.types.includes(CONTAINMENT_TYPES.STYLE)) {
      this.metrics.styleRecalculationsPrevented += this.estimateChildCount(element);
    }

    if (strategy.types.includes(CONTAINMENT_TYPES.LAYOUT)) {
      this.metrics.layoutThrashingPrevented++;
    }

    if (strategy.types.includes(CONTAINMENT_TYPES.PAINT)) {
      this.metrics.paintOperationsOptimized++;
    }
  }

  /**
   * Estimate number of child elements
   */
  estimateChildCount(element) {
    return element.children.length + Array.from(element.querySelectorAll('*')).length;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      monitoringDuration: performance.now() - this.startTime,
      estimatedPerformanceGain: this.calculateEstimatedPerformanceGain()
    };
  }

  /**
   * Calculate estimated performance gain
   */
  calculateEstimatedPerformanceGain() {
    const baseScore = this.metrics.styleRecalculationsPrevented * 2 +
                     this.metrics.layoutThrashingPrevented * 3 +
                     this.metrics.paintOperationsOptimized * 1.5;

    return Math.round(baseScore * 100) / 100;
  }
}

/**
 * CSS Containment Utilities
 */
class ContainmentUtils {
  /**
   * Check if element is contained
   */
  static isElementContained(element) {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.contain !== 'none' && computedStyle.contain !== '';
  }

  /**
   * Get containment types for element
   */
  static getElementContainment(element) {
    const computedStyle = window.getComputedStyle(element);
    const containValue = computedStyle.contain;

    if (containValue === 'none' || containValue === '') {
      return [];
    }

    return containValue.split(' ').filter(type => type.trim());
  }

  /**
   * Create contained element
   */
  static createContainedElement(tagName = 'div', containmentTypes = [CONTAINMENT_TYPES.SIZE, CONTAINMENT_TYPES.LAYOUT]) {
    const element = document.createElement(tagName);
    element.style.contain = containmentTypes.join(' ');
    return element;
  }

  /**
   * Optimize containment for performance
   */
  static optimizeContainment(element) {
    const currentContainment = this.getElementContainment(element);
    const optimizedContainment = this.selectOptimalContainment(element, currentContainment);

    if (optimizedContainment.length !== currentContainment.length ||
        !optimizedContainment.every(type => currentContainment.includes(type))) {
      element.style.contain = optimizedContainment.join(' ');
      return true;
    }

    return false;
  }

  /**
   * Select optimal containment for element
   */
  static selectOptimalContainment(element, currentContainment) {
    // Remove redundant containment types
    const optimized = [...currentContainment];

    // If 'strict' is present, keep only that
    if (optimized.includes('strict')) {
      return ['strict'];
    }

    // Remove 'size' if element has no intrinsic size
    const computedStyle = window.getComputedStyle(element);
    if (optimized.includes('size') &&
        computedStyle.width === 'auto' &&
        computedStyle.height === 'auto') {
      const index = optimized.indexOf('size');
      optimized.splice(index, 1);
    }

    return optimized;
  }
}

// Singleton instances
let containmentManager = null;

/**
 * Initialize containment system
 */
export function initializeContainmentSystem() {
  if (!containmentManager) {
    containmentManager = new ContainmentManager();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('CSS Containment System Initialized');
      console.log('Browser Support:', containmentManager.analyzer.browserSupport);
    }
  }

  return containmentManager;
}

/**
 * Apply containment to element
 */
export function applyElementContainment(element, strategy = CONTAINMENT_STRATEGIES.PROGRESSIVE) {
  const manager = initializeContainmentSystem();
  return manager.applyContainment(element, strategy);
}

/**
 * Auto-apply containment to theme elements
 */
export function autoApplyThemeContainment() {
  const manager = initializeContainmentSystem();
  return manager.autoApplyThemeContainment();
}

/**
 * Get containment statistics
 */
export function getContainmentStats() {
  const manager = initializeContainmentSystem();
  return manager.getContainmentStats();
}

/**
 * Utility functions
 */
export const ContainmentUtils = ContainmentUtils;

/**
 * Export containment types and strategies
 */
export { CONTAINMENT_TYPES, CONTAINMENT_STRATEGIES };

/**
 * Export classes for external use
 */
export { ContainmentAnalyzer, ContainmentManager, ContainmentPerformanceMonitor };

/**
 * Owl Retro - CSS Selector Optimizer Module
 * Performance için optimal CSS selector'lar kullanır
 * 2024-2025 CSS Selector optimization teknikleri
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../constants.js';

/**
 * CSS Selector Performance Categories
 */
const SELECTOR_PERFORMANCE = {
  FAST: 'fast',           // ID, class, tag selectors
  MEDIUM: 'medium',       // Attribute selectors, pseudo-classes
  SLOW: 'slow',           // Universal, complex selectors
  VERY_SLOW: 'very-slow'  // Complex combinators, :not() with complex selectors
};

/**
 * Selector Complexity Scores
 */
const SELECTOR_COMPLEXITY = {
  // Very fast selectors
  ID: { performance: SELECTOR_PERFORMANCE.FAST, complexity: 1, weight: 100 },
  CLASS: { performance: SELECTOR_PERFORMANCE.FAST, complexity: 2, weight: 50 },
  TAG: { performance: SELECTOR_PERFORMANCE.FAST, complexity: 3, weight: 25 },

  // Medium performance selectors
  ATTRIBUTE: { performance: SELECTOR_PERFORMANCE.MEDIUM, complexity: 4, weight: 10 },
  UNIVERSAL: { performance: SELECTOR_PERFORMANCE.SLOW, complexity: 5, weight: 1 },

  // Slow performance selectors
  PSEUDO_CLASS: { performance: SELECTOR_PERFORMANCE.MEDIUM, complexity: 6, weight: 8 },
  PSEUDO_ELEMENT: { performance: SELECTOR_PERFORMANCE.MEDIUM, complexity: 7, weight: 8 },

  // Very slow performance selectors
  COMBINATOR: { performance: SELECTOR_PERFORMANCE.SLOW, complexity: 8, weight: 5 },
  COMPLEX_NOT: { performance: SELECTOR_PERFORMANCE.VERY_SLOW, complexity: 9, weight: 2 }
};

/**
 * CSS Selector Analyzer
 */
class SelectorAnalyzer {
  constructor() {
    this.selectorCache = new Map();
    this.performanceStats = new Map();
    this.initializeSelectorPatterns();
  }

  /**
   * Initialize selector pattern recognition
   */
  initializeSelectorPatterns() {
    this.patterns = {
      // ID selectors
      id: /^#[a-zA-Z][\w-]*$/,

      // Class selectors
      class: /^\.[a-zA-Z][\w-]*$/,

      // Tag selectors
      tag: /^[a-zA-Z][\w-]*$/,

      // Simple attribute selectors
      simpleAttribute: /^\[[a-zA-Z][\w-]*\]$/,

      // Complex attribute selectors
      complexAttribute: /^\[[a-zA-Z][\w-]*[\*\^\$\~]?=/,

      // Universal selector
      universal: /^\*$/,

      // Simple pseudo-classes
      simplePseudo: /^:(hover|focus|active|visited|link|first-child|last-child)$/,

      // Complex pseudo-classes
      complexPseudo: /^:(not|nth-child|nth-last-child|nth-of-type)/,

      // Pseudo-elements
      pseudoElement: /^::(before|after|first-line|first-letter)/,

      // Simple combinators
      simpleCombinator: /^[>#+\s]+$/
    };
  }

  /**
   * Analyze selector performance
   */
  analyzeSelector(selector) {
    if (this.selectorCache.has(selector)) {
      return this.selectorCache.get(selector);
    }

    const analysis = {
      selector,
      performance: SELECTOR_PERFORMANCE.FAST,
      complexity: 0,
      score: 100,
      issues: [],
      optimizations: []
    };

    try {
      // Parse selector into parts
      const parts = this.parseSelector(selector);

      // Calculate complexity and performance
      let totalComplexity = 0;
      let totalWeight = 0;

      for (const part of parts) {
        const partAnalysis = this.analyzeSelectorPart(part);
        totalComplexity += partAnalysis.complexity;
        totalWeight += partAnalysis.weight;

        if (partAnalysis.performance < analysis.performance) {
          analysis.performance = partAnalysis.performance;
        }

        analysis.issues.push(...partAnalysis.issues);
        analysis.optimizations.push(...partAnalysis.optimizations);
      }

      // Calculate final score
      analysis.complexity = totalComplexity;
      analysis.score = Math.max(0, Math.min(100, totalWeight));

      // Determine performance category
      if (analysis.score < 20) {
        analysis.performance = SELECTOR_PERFORMANCE.VERY_SLOW;
      } else if (analysis.score < 50) {
        analysis.performance = SELECTOR_PERFORMANCE.SLOW;
      } else if (analysis.score < 80) {
        analysis.performance = SELECTOR_PERFORMANCE.MEDIUM;
      }

      this.selectorCache.set(selector, analysis);
      this.updatePerformanceStats(selector, analysis);

      return analysis;
    } catch (error) {
      analysis.issues.push(`Invalid selector: ${error.message}`);
      analysis.performance = SELECTOR_PERFORMANCE.VERY_SLOW;
      analysis.score = 0;

      return analysis;
    }
  }

  /**
   * Parse selector into individual parts
   */
  parseSelector(selector) {
    // Simple parsing - split by combinators
    const combinatorRegex = /\s*[>+~]\s*/g;
    const parts = selector.split(combinatorRegex).filter(part => part.trim());

    return parts;
  }

  /**
   * Analyze individual selector part
   */
  analyzeSelectorPart(part) {
    const trimmed = part.trim();
    let bestMatch = null;
    let bestComplexity = Infinity;

    // Test against all patterns
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(trimmed)) {
        const complexity = this.getPatternComplexity(patternName);
        if (complexity < bestComplexity) {
          bestMatch = patternName;
          bestComplexity = complexity;
        }
      }
    }

    const analysis = {
      part: trimmed,
      pattern: bestMatch,
      performance: this.getPatternPerformance(bestMatch),
      complexity: bestComplexity,
      weight: this.getPatternWeight(bestMatch),
      issues: [],
      optimizations: []
    };

    // Add specific analysis for the matched pattern
    switch (bestMatch) {
      case 'universal':
        analysis.issues.push('Universal selector (*) is very slow');
        analysis.optimizations.push('Replace with more specific selector');
        break;

      case 'complexAttribute':
        analysis.issues.push('Attribute selector with operators is slow');
        analysis.optimizations.push('Use ID or class selector if possible');
        break;

      case 'complexPseudo':
        analysis.issues.push('Complex pseudo-class may impact performance');
        analysis.optimizations.push('Consider using simpler pseudo-class or class-based approach');
        break;
    }

    return analysis;
  }

  /**
   * Get complexity for pattern
   */
  getPatternComplexity(patternName) {
    const complexities = {
      id: 1, class: 2, tag: 3,
      simpleAttribute: 4, complexAttribute: 6,
      universal: 7, simplePseudo: 5,
      complexPseudo: 8, pseudoElement: 6
    };

    return complexities[patternName] || 10;
  }

  /**
   * Get performance category for pattern
   */
  getPatternPerformance(patternName) {
    const performances = {
      id: SELECTOR_PERFORMANCE.FAST,
      class: SELECTOR_PERFORMANCE.FAST,
      tag: SELECTOR_PERFORMANCE.FAST,
      simpleAttribute: SELECTOR_PERFORMANCE.MEDIUM,
      complexAttribute: SELECTOR_PERFORMANCE.SLOW,
      universal: SELECTOR_PERFORMANCE.SLOW,
      simplePseudo: SELECTOR_PERFORMANCE.MEDIUM,
      complexPseudo: SELECTOR_PERFORMANCE.SLOW,
      pseudoElement: SELECTOR_PERFORMANCE.MEDIUM
    };

    return performances[patternName] || SELECTOR_PERFORMANCE.VERY_SLOW;
  }

  /**
   * Get weight for pattern
   */
  getPatternWeight(patternName) {
    const weights = {
      id: 100, class: 50, tag: 25,
      simpleAttribute: 15, complexAttribute: 8,
      universal: 1, simplePseudo: 12,
      complexPseudo: 6, pseudoElement: 10
    };

    return weights[patternName] || 1;
  }

  /**
   * Update performance statistics
   */
  updatePerformanceStats(selector, analysis) {
    if (!this.performanceStats.has(analysis.performance)) {
      this.performanceStats.set(analysis.performance, {
        count: 0,
        totalScore: 0,
        averageScore: 0,
        selectors: []
      });
    }

    const stats = this.performanceStats.get(analysis.performance);
    stats.count++;
    stats.totalScore += analysis.score;
    stats.averageScore = stats.totalScore / stats.count;
    stats.selectors.push(selector);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats = {};

    for (const [performance, data] of this.performanceStats) {
      stats[performance] = {
        ...data,
        percentage: (data.count / this.getTotalSelectorCount()) * 100
      };
    }

    return stats;
  }

  /**
   * Get total selector count
   */
  getTotalSelectorCount() {
    let total = 0;

    for (const data of this.performanceStats.values()) {
      total += data.count;
    }

    return total;
  }
}

/**
 * CSS Selector Optimizer
 */
class SelectorOptimizer {
  constructor() {
    this.analyzer = new SelectorAnalyzer();
    this.optimizationRules = this.initializeOptimizationRules();
    this.optimizedSelectors = new Map();
  }

  /**
   * Initialize optimization rules
   */
  initializeOptimizationRules() {
    return {
      // Replace slow selectors with faster alternatives
      replaceSlowSelectors: true,

      // Optimize selector combinators
      optimizeCombinators: true,

      // Remove redundant selectors
      removeRedundant: true,

      // Simplify complex selectors
      simplifyComplex: true,

      // Use most specific selectors when possible
      preferSpecific: true,

      // Cache optimized selectors
      enableCaching: true
    };
  }

  /**
   * Optimize CSS rule selectors
   */
  optimizeCSSRule(cssRule) {
    if (!cssRule.selectorText) return cssRule;

    const originalSelector = cssRule.selectorText;
    const optimizedSelector = this.optimizeSelector(originalSelector);

    if (optimizedSelector !== originalSelector) {
      try {
        cssRule.selectorText = optimizedSelector;
        return cssRule;
      } catch (error) {
        if (DEBUG.LOG_PERFORMANCE) {
          console.warn(`Failed to optimize selector: ${originalSelector}`, error);
        }
        return cssRule;
      }
    }

    return cssRule;
  }

  /**
   * Optimize individual selector
   */
  optimizeSelector(selector) {
    if (this.optimizedSelectors.has(selector)) {
      return this.optimizedSelectors.get(selector);
    }

    const analysis = this.analyzer.analyzeSelector(selector);

    if (analysis.score >= 80) {
      // Already well-optimized
      this.optimizedSelectors.set(selector, selector);
      return selector;
    }

    let optimized = selector;

    // Apply optimization strategies
    if (this.optimizationRules.replaceSlowSelectors) {
      optimized = this.replaceSlowSelectors(optimized, analysis);
    }

    if (this.optimizationRules.optimizeCombinators) {
      optimized = this.optimizeSelectorCombinators(optimized);
    }

    if (this.optimizationRules.simplifyComplex) {
      optimized = this.simplifyComplexSelector(optimized);
    }

    if (this.optimizationRules.removeRedundant) {
      optimized = this.removeRedundantParts(optimized);
    }

    this.optimizedSelectors.set(selector, optimized);
    return optimized;
  }

  /**
   * Replace slow selectors with faster alternatives
   */
  replaceSlowSelectors(selector, analysis) {
    let optimized = selector;

    // Replace universal selector with more specific alternatives
    if (optimized.includes('*')) {
      const universalMatches = optimized.match(/\*\s*[>+~]?\s*[a-zA-Z]/g);
      for (const match of universalMatches || []) {
        const replacement = match.replace('*', 'div');
        optimized = optimized.replace(match, replacement);
      }
    }

    // Replace complex attribute selectors
    const complexAttrMatches = optimized.match(/\[[a-zA-Z][\w-]*[\*\^\$\~]?="[^"]*"\]/g);
    for (const match of complexAttrMatches || []) {
      // Try to replace with class or ID if possible
      const attrName = match.match(/\[([a-zA-Z][\w-]*)/)?.[1];
      if (attrName) {
        const classSelector = `.${attrName}`;
        optimized = optimized.replace(match, classSelector);
      }
    }

    return optimized;
  }

  /**
   * Optimize selector combinators for better performance
   */
  optimizeSelectorCombinators(selector) {
    let optimized = selector;

    // Replace child combinator with descendant when appropriate
    optimized = optimized.replace(/\s*>\s*/g, ' ');

    // Replace adjacent sibling with general sibling when appropriate
    optimized = optimized.replace(/\s*\+\s*/g, ' ~ ');

    return optimized;
  }

  /**
   * Simplify complex selectors
   */
  simplifyComplexSelector(selector) {
    // Remove unnecessary nesting
    const parts = selector.split(/\s+/);
    const simplified = [];

    for (const part of parts) {
      if (!this.isRedundantPart(part, simplified)) {
        simplified.push(part);
      }
    }

    return simplified.join(' ');
  }

  /**
   * Check if part is redundant given previous parts
   */
  isRedundantPart(part, previousParts) {
    // If we have an ID, class selectors are redundant
    if (part.startsWith('#') && previousParts.some(p => p.startsWith('#'))) {
      return true;
    }

    // If we have a class, tag selectors might be redundant
    if (part.match(/^[a-zA-Z]+$/) && previousParts.some(p => p.startsWith('.'))) {
      return true;
    }

    return false;
  }

  /**
   * Remove redundant parts from selector
   */
  removeRedundantParts(selector) {
    const parts = selector.split(/\s+/);
    const optimized = [];

    for (const part of parts) {
      if (part && part !== '*' && !this.isRedundantPart(part, optimized)) {
        optimized.push(part);
      }
    }

    return optimized.join(' ');
  }

  /**
   * Optimize entire CSS stylesheet
   */
  optimizeStylesheet(cssText) {
    const optimizedRules = [];
    let totalImprovement = 0;

    // Parse CSS rules
    const ruleMatches = cssText.match(/([^{]+){[^}]+}/g);
    if (!ruleMatches) return cssText;

    for (const ruleMatch of ruleMatches) {
      const rule = ruleMatch.trim();
      if (!rule) continue;

      // Extract selector
      const selectorMatch = rule.match(/^([^{]+){/);
      if (!selectorMatch) continue;

      const originalSelector = selectorMatch[1].trim();
      const optimizedSelector = this.optimizeSelector(originalSelector);

      if (optimizedSelector !== originalSelector) {
        const optimizedRule = rule.replace(originalSelector, optimizedSelector);
        optimizedRules.push(optimizedRule);

        // Calculate improvement
        const originalAnalysis = this.analyzer.analyzeSelector(originalSelector);
        const optimizedAnalysis = this.analyzer.analyzeSelector(optimizedSelector);
        totalImprovement += optimizedAnalysis.score - originalAnalysis.score;
      } else {
        optimizedRules.push(rule);
      }
    }

    if (DEBUG.LOG_PERFORMANCE && totalImprovement > 0) {
      console.log(`CSS Selector optimization: +${totalImprovement} performance points`);
    }

    return optimizedRules.join('\n');
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats() {
    return {
      totalOptimized: this.optimizedSelectors.size,
      performanceStats: this.analyzer.getPerformanceStats(),
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    const totalSelectors = this.selectorCache.size + this.optimizedSelectors.size;
    return totalSelectors > 0 ? (this.optimizedSelectors.size / totalSelectors) * 100 : 0;
  }
}

/**
 * CSS Selector Performance Monitor
 */
class SelectorPerformanceMonitor {
  constructor() {
    this.metrics = {
      fastSelectors: 0,
      mediumSelectors: 0,
      slowSelectors: 0,
      verySlowSelectors: 0,
      totalScore: 0,
      averageScore: 0,
      optimizationOpportunities: 0
    };
    this.startTime = performance.now();
  }

  /**
   * Monitor selector performance
   */
  monitorSelectorPerformance(selector, analysis) {
    this.metrics.totalScore += analysis.score;

    switch (analysis.performance) {
      case SELECTOR_PERFORMANCE.FAST:
        this.metrics.fastSelectors++;
        break;
      case SELECTOR_PERFORMANCE.MEDIUM:
        this.metrics.mediumSelectors++;
        break;
      case SELECTOR_PERFORMANCE.SLOW:
        this.metrics.slowSelectors++;
        this.metrics.optimizationOpportunities++;
        break;
      case SELECTOR_PERFORMANCE.VERY_SLOW:
        this.metrics.verySlowSelectors++;
        this.metrics.optimizationOpportunities++;
        break;
    }

    this.metrics.averageScore = this.metrics.totalScore /
      (this.metrics.fastSelectors + this.metrics.mediumSelectors +
       this.metrics.slowSelectors + this.metrics.verySlowSelectors);
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const totalSelectors = this.metrics.fastSelectors + this.metrics.mediumSelectors +
                          this.metrics.slowSelectors + this.metrics.verySlowSelectors;

    return {
      ...this.metrics,
      totalSelectors,
      performanceDistribution: {
        fast: (this.metrics.fastSelectors / totalSelectors) * 100,
        medium: (this.metrics.mediumSelectors / totalSelectors) * 100,
        slow: (this.metrics.slowSelectors / totalSelectors) * 100,
        verySlow: (this.metrics.verySlowSelectors / totalSelectors) * 100
      },
      optimizationPotential: this.calculateOptimizationPotential(),
      monitoringDuration: performance.now() - this.startTime
    };
  }

  /**
   * Calculate optimization potential
   */
  calculateOptimizationPotential() {
    const slowWeight = this.metrics.slowSelectors * 25;
    const verySlowWeight = this.metrics.verySlowSelectors * 50;

    return slowWeight + verySlowWeight;
  }
}

// Singleton instances
let selectorOptimizer = null;
let performanceMonitor = null;

/**
 * Initialize CSS selector optimization system
 */
export function initializeSelectorOptimization() {
  if (!selectorOptimizer) {
    selectorOptimizer = new SelectorOptimizer();
    performanceMonitor = new SelectorPerformanceMonitor();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('CSS Selector Optimization System Initialized');
    }
  }

  return selectorOptimizer;
}

/**
 * Optimize CSS text
 */
export function optimizeCSSSelectors(cssText) {
  const optimizer = initializeSelectorOptimization();
  return optimizer.optimizeStylesheet(cssText);
}

/**
 * Analyze selector performance
 */
export function analyzeSelectorPerformance(selector) {
  const optimizer = initializeSelectorOptimization();
  return optimizer.analyzer.analyzeSelector(selector);
}

/**
 * Get selector optimization statistics
 */
export function getSelectorOptimizationStats() {
  const optimizer = initializeSelectorOptimization();
  return optimizer.getOptimizationStats();
}

/**
 * Get performance report
 */
export function getSelectorPerformanceReport() {
  return performanceMonitor.getPerformanceReport();
}

/**
 * Export classes for external use
 */
export { SelectorAnalyzer, SelectorOptimizer, SelectorPerformanceMonitor };

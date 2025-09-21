/**
 * Owl Retro - CSS Specificity Manager Module
 * CSS specificity'yi optimize eder ve çakışmaları önler
 * 2024-2025 CSS Specificity management teknikleri
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../constants.js';

/**
 * CSS Specificity Levels
 */
const SPECIFICITY_LEVELS = {
  INLINE: { value: 1000, name: 'inline', description: 'Inline styles' },
  ID: { value: 100, name: 'id', description: 'ID selectors' },
  CLASS: { value: 10, name: 'class', description: 'Class, pseudo-class, attribute selectors' },
  TAG: { value: 1, name: 'tag', description: 'Tag selectors' },
  UNIVERSAL: { value: 0, name: 'universal', description: 'Universal selector' }
};

/**
 * Specificity Categories
 */
const SPECIFICITY_CATEGORIES = {
  LOW: 'low',           // 0-10
  MEDIUM: 'medium',     // 11-100
  HIGH: 'high',         // 101-1000
  VERY_HIGH: 'very-high' // 1000+
};

/**
 * CSS Specificity Analyzer
 */
class SpecificityAnalyzer {
  constructor() {
    this.specificityCache = new Map();
    this.specificityPatterns = this.initializeSpecificityPatterns();
  }

  /**
   * Initialize specificity calculation patterns
   */
  initializeSpecificityPatterns() {
    return {
      // Inline styles (highest specificity)
      inline: /style\s*=/,

      // ID selectors
      id: /#[a-zA-Z][\w-]*/g,

      // Class selectors
      class: /\.[a-zA-Z][\w-]*/g,

      // Attribute selectors
      attribute: /\[[a-zA-Z][\w-]*[^\]]*\]/g,

      // Pseudo-classes
      pseudoClass: /:[a-zA-Z][\w-]*(\([^)]*\))?/g,

      // Pseudo-elements
      pseudoElement: /::[a-zA-Z][\w-]*(\([^)]*\))?/g,

      // Tag selectors
      tag: /^[a-zA-Z][\w-]*/,

      // Universal selector
      universal: /^\*/
    };
  }

  /**
   * Calculate specificity for a CSS selector
   */
  calculateSpecificity(selector) {
    if (this.specificityCache.has(selector)) {
      return this.specificityCache.get(selector);
    }

    const specificity = {
      inline: 0,
      id: 0,
      class: 0,
      tag: 0,
      total: 0,
      category: SPECIFICITY_CATEGORIES.LOW
    };

    try {
      // Check for inline styles
      if (this.specificityPatterns.inline.test(selector)) {
        specificity.inline = 1;
        specificity.total = SPECIFICITY_LEVELS.INLINE.value;
        specificity.category = SPECIFICITY_CATEGORIES.VERY_HIGH;
      } else {
        // Parse selector for different specificity components
        specificity.id = this.countMatches(selector, this.specificityPatterns.id);
        specificity.class = this.countMatches(selector, this.specificityPatterns.class) +
                           this.countMatches(selector, this.specificityPatterns.attribute) +
                           this.countMatches(selector, this.specificityPatterns.pseudoClass);
        specificity.tag = this.countMatches(selector, this.specificityPatterns.tag) +
                         this.countMatches(selector, this.specificityPatterns.pseudoElement);

        // Universal selector handling
        if (this.specificityPatterns.universal.test(selector)) {
          specificity.tag = Math.max(1, specificity.tag);
        }

        // Calculate total specificity
        specificity.total = (specificity.id * SPECIFICITY_LEVELS.ID.value) +
                          (specificity.class * SPECIFICITY_LEVELS.CLASS.value) +
                          (specificity.tag * SPECIFICITY_LEVELS.TAG.value);

        // Determine category
        specificity.category = this.determineSpecificityCategory(specificity.total);
      }

      this.specificityCache.set(selector, specificity);
      return specificity;
    } catch (error) {
      specificity.total = 0;
      specificity.category = SPECIFICITY_CATEGORIES.LOW;
      specificity.error = error.message;
      return specificity;
    }
  }

  /**
   * Count matches for a pattern in selector
   */
  countMatches(selector, pattern) {
    const matches = selector.match(pattern);
    return matches ? matches.length : 0;
  }

  /**
   * Determine specificity category
   */
  determineSpecificityCategory(totalSpecificity) {
    if (totalSpecificity >= 1000) return SPECIFICITY_CATEGORIES.VERY_HIGH;
    if (totalSpecificity >= 100) return SPECIFICITY_CATEGORIES.HIGH;
    if (totalSpecificity >= 10) return SPECIFICITY_CATEGORIES.MEDIUM;
    return SPECIFICITY_CATEGORIES.LOW;
  }

  /**
   * Analyze CSS rule for specificity issues
   */
  analyzeCSSRule(cssRule) {
    const selector = cssRule.selectorText;
    if (!selector) return null;

    const specificity = this.calculateSpecificity(selector);

    const analysis = {
      selector,
      specificity,
      issues: [],
      recommendations: [],
      conflicts: []
    };

    // Check for specificity issues
    if (specificity.total > 1000) {
      analysis.issues.push('Overly specific selector (specificity > 1000)');
      analysis.recommendations.push('Reduce specificity by using fewer ID selectors');
    }

    if (specificity.id > 3) {
      analysis.issues.push('Too many ID selectors');
      analysis.recommendations.push('Use class selectors instead of multiple IDs');
    }

    if (specificity.class > 5) {
      analysis.issues.push('Too many class selectors');
      analysis.recommendations.push('Consider using a single class or ID instead');
    }

    if (specificity.total === 0) {
      analysis.issues.push('Universal selector or overly generic selector');
      analysis.recommendations.push('Add more specific selectors for better performance');
    }

    return analysis;
  }

  /**
   * Compare specificity of two selectors
   */
  compareSpecificity(selector1, selector2) {
    const spec1 = this.calculateSpecificity(selector1);
    const spec2 = this.calculateSpecificity(selector2);

    return {
      selector1: spec1,
      selector2: spec2,
      comparison: spec1.total - spec2.total,
      winner: spec1.total > spec2.total ? 'selector1' :
              spec2.total > spec1.total ? 'selector2' : 'tie'
    };
  }

  /**
   * Find potential specificity conflicts
   */
  findSpecificityConflicts(selectors) {
    const conflicts = [];

    for (let i = 0; i < selectors.length; i++) {
      for (let j = i + 1; j < selectors.length; j++) {
        const comparison = this.compareSpecificity(selectors[i], selectors[j]);

        if (Math.abs(comparison.comparison) < 10) {
          conflicts.push({
            selectors: [selectors[i], selectors[j]],
            comparison,
            severity: Math.abs(comparison.comparison) < 5 ? 'high' : 'medium'
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Get specificity statistics
   */
  getSpecificityStats(selectors) {
    const stats = {
      total: selectors.length,
      categories: {
        [SPECIFICITY_CATEGORIES.LOW]: 0,
        [SPECIFICITY_CATEGORIES.MEDIUM]: 0,
        [SPECIFICITY_CATEGORIES.HIGH]: 0,
        [SPECIFICITY_CATEGORIES.VERY_HIGH]: 0
      },
      averageSpecificity: 0,
      maxSpecificity: 0,
      minSpecificity: Infinity,
      issues: 0,
      conflicts: 0
    };

    let totalSpecificity = 0;

    for (const selector of selectors) {
      const specificity = this.calculateSpecificity(selector);

      stats.categories[specificity.category]++;
      totalSpecificity += specificity.total;

      stats.maxSpecificity = Math.max(stats.maxSpecificity, specificity.total);
      stats.minSpecificity = Math.min(stats.minSpecificity, specificity.total);

      if (specificity.issues && specificity.issues.length > 0) {
        stats.issues++;
      }
    }

    stats.averageSpecificity = totalSpecificity / selectors.length;

    // Find conflicts
    stats.conflicts = this.findSpecificityConflicts(selectors).length;

    return stats;
  }
}

/**
 * CSS Specificity Optimizer
 */
class SpecificityOptimizer {
  constructor() {
    this.analyzer = new SpecificityAnalyzer();
    this.optimizationStrategies = this.initializeOptimizationStrategies();
  }

  /**
   * Initialize specificity optimization strategies
   */
  initializeOptimizationStrategies() {
    return {
      // Reduce overly specific selectors
      reduceOverlySpecific: true,

      // Increase specificity of weak selectors
      increaseWeakSpecificity: true,

      // Resolve specificity conflicts
      resolveConflicts: true,

      // Standardize specificity levels
      standardizeLevels: true,

      // Optimize for performance
      optimizeForPerformance: true
    };
  }

  /**
   * Optimize CSS specificity
   */
  optimizeCSSSpecificity(cssText) {
    const optimizedRules = [];
    let totalOptimizations = 0;

    // Parse CSS rules
    const ruleMatches = cssText.match(/([^{]+){[^}]+}/g);
    if (!ruleMatches) return cssText;

    for (const ruleMatch of ruleMatches) {
      const rule = ruleMatch.trim();
      if (!rule) continue;

      const selectorMatch = rule.match(/^([^{]+){/);
      if (!selectorMatch) continue;

      const originalSelector = selectorMatch[1].trim();
      const optimizedSelector = this.optimizeSelectorSpecificity(originalSelector);

      if (optimizedSelector !== originalSelector) {
        const optimizedRule = rule.replace(originalSelector, optimizedSelector);
        optimizedRules.push(optimizedRule);
        totalOptimizations++;
      } else {
        optimizedRules.push(rule);
      }
    }

    if (DEBUG.LOG_PERFORMANCE && totalOptimizations > 0) {
      console.log(`CSS Specificity optimization: ${totalOptimizations} selectors optimized`);
    }

    return optimizedRules.join('\n');
  }

  /**
   * Optimize individual selector specificity
   */
  optimizeSelectorSpecificity(selector) {
    const analysis = this.analyzer.analyzeCSSRule({ selectorText: selector });
    if (!analysis) return selector;

    const specificity = analysis.specificity;
    let optimized = selector;

    // Apply optimization strategies
    if (this.optimizationStrategies.reduceOverlySpecific && specificity.total > 1000) {
      optimized = this.reduceOverlySpecificSelector(optimized, specificity);
    }

    if (this.optimizationStrategies.increaseWeakSpecificity && specificity.total < 10) {
      optimized = this.increaseWeakSpecificity(optimized, specificity);
    }

    if (this.optimizationStrategies.resolveConflicts) {
      optimized = this.resolveSpecificityConflicts(optimized);
    }

    return optimized;
  }

  /**
   * Reduce overly specific selector
   */
  reduceOverlySpecificSelector(selector, specificity) {
    let optimized = selector;

    // If has inline styles, can't reduce further
    if (specificity.inline > 0) return selector;

    // Remove unnecessary ID selectors
    if (specificity.id > 1) {
      const idMatches = selector.match(/#[a-zA-Z][\w-]*/g);
      if (idMatches && idMatches.length > 1) {
        // Keep only the last ID (most specific)
        const lastId = idMatches[idMatches.length - 1];
        optimized = lastId;
      }
    }

    // Reduce multiple class selectors
    if (specificity.class > 3) {
      const classMatches = selector.match(/\.[a-zA-Z][\w-]*/g);
      if (classMatches && classMatches.length > 3) {
        // Keep only the most specific classes
        optimized = classMatches.slice(-2).join('');
      }
    }

    return optimized;
  }

  /**
   * Increase specificity of weak selectors
   */
  increaseWeakSpecificity(selector, specificity) {
    // If selector is too generic, add specificity
    if (specificity.total === 0) {
      return `.owl-retro-theme ${selector}`;
    }

    if (specificity.total < 10) {
      return `.owl-retro-specific ${selector}`;
    }

    return selector;
  }

  /**
   * Resolve specificity conflicts
   */
  resolveSpecificityConflicts(selector) {
    // Add specificity class for theme-related selectors
    if (selector.includes('owl-retro') || selector.includes('theme')) {
      return `${selector}.owl-retro-specific`;
    }

    return selector;
  }

  /**
   * Optimize specificity for theme rules
   */
  optimizeThemeSpecificity(cssRule, themeSelector = '.owl-retro-theme') {
    const originalSelector = cssRule.selectorText;
    if (!originalSelector) return cssRule;

    // Add theme specificity to avoid conflicts
    const optimizedSelector = `${themeSelector} ${originalSelector}`;
    cssRule.selectorText = optimizedSelector;

    return cssRule;
  }

  /**
   * Create specificity hierarchy
   */
  createSpecificityHierarchy(selectors) {
    const hierarchy = {
      [SPECIFICITY_CATEGORIES.VERY_HIGH]: [],
      [SPECIFICITY_CATEGORIES.HIGH]: [],
      [SPECIFICITY_CATEGORIES.MEDIUM]: [],
      [SPECIFICITY_CATEGORIES.LOW]: []
    };

    for (const selector of selectors) {
      const specificity = this.analyzer.calculateSpecificity(selector);
      hierarchy[specificity.category].push({
        selector,
        specificity
      });
    }

    return hierarchy;
  }

  /**
   * Detect specificity conflicts in CSS
   */
  detectSpecificityConflicts(cssText) {
    const selectors = [];
    const conflicts = [];

    // Extract all selectors
    const ruleMatches = cssText.match(/([^{]+){[^}]+}/g);
    if (!ruleMatches) return conflicts;

    for (const ruleMatch of ruleMatches) {
      const selectorMatch = ruleMatch.match(/^([^{]+){/);
      if (selectorMatch) {
        selectors.push(selectorMatch[1].trim());
      }
    }

    // Find conflicts
    return this.analyzer.findSpecificityConflicts(selectors);
  }

  /**
   * Get specificity optimization report
   */
  getOptimizationReport(cssText) {
    const selectors = [];
    const issues = [];

    // Extract selectors
    const ruleMatches = cssText.match(/([^{]+){[^}]+}/g);
    if (!ruleMatches) return { selectors: [], issues: [], stats: {} };

    for (const ruleMatch of ruleMatches) {
      const selectorMatch = ruleMatch.match(/^([^{]+){/);
      if (selectorMatch) {
        const selector = selectorMatch[1].trim();
        const analysis = this.analyzer.analyzeCSSRule({ selectorText: selector });

        selectors.push(selector);

        if (analysis && analysis.issues.length > 0) {
          issues.push(analysis);
        }
      }
    }

    const stats = this.analyzer.getSpecificityStats(selectors);

    return {
      selectors,
      issues,
      stats,
      conflicts: this.detectSpecificityConflicts(cssText)
    };
  }
}

/**
 * Specificity Conflict Resolver
 */
class SpecificityConflictResolver {
  constructor() {
    this.resolutionStrategies = this.initializeResolutionStrategies();
  }

  /**
   * Initialize conflict resolution strategies
   */
  initializeResolutionStrategies() {
    return {
      // Add specificity class
      addSpecificityClass: true,

      // Reorder rules
      reorderRules: true,

      // Split complex selectors
      splitComplexSelectors: true,

      // Use !important as last resort
      useImportant: false
    };
  }

  /**
   * Resolve specificity conflicts
   */
  resolveConflicts(conflicts, cssText) {
    let resolvedCSS = cssText;

    for (const conflict of conflicts) {
      resolvedCSS = this.resolveConflict(conflict, resolvedCSS);
    }

    return resolvedCSS;
  }

  /**
   * Resolve individual conflict
   */
  resolveConflict(conflict, cssText) {
    if (!this.resolutionStrategies.addSpecificityClass) {
      return cssText;
    }

    // Add specificity class to weaker selector
    const weakerSelector = conflict.comparison.winner === 'selector1' ?
                          conflict.selectors[1] : conflict.selectors[0];

    const strongerSelector = conflict.comparison.winner === 'selector1' ?
                           conflict.selectors[0] : conflict.selectors[1];

    // Add specificity class to weaker selector
    const specificityClass = '.owl-retro-specific';
    const resolvedSelector = `${specificityClass} ${weakerSelector}`;

    // Replace in CSS
    return cssText.replace(weakerSelector, resolvedSelector);
  }

  /**
   * Create specificity-safe CSS
   */
  createSpecificitySafeCSS(cssText, baseSpecificity = 100) {
    const safeCSS = cssText.replace(
      /([a-zA-Z][\w-]*\s*{\s*)/g,
      `.owl-retro-theme $${baseSpecificity} `
    );

    return safeCSS;
  }
}

// Singleton instances
let specificityOptimizer = null;
let conflictResolver = null;

/**
 * Initialize specificity management system
 */
export function initializeSpecificityManagement() {
  if (!specificityOptimizer) {
    specificityOptimizer = new SpecificityOptimizer();
    conflictResolver = new SpecificityConflictResolver();

    if (DEBUG.LOG_PERFORMANCE) {
      console.log('CSS Specificity Management System Initialized');
    }
  }

  return specificityOptimizer;
}

/**
 * Optimize CSS specificity
 */
export function optimizeCSSSpecificity(cssText) {
  const optimizer = initializeSpecificityManagement();
  return optimizer.optimizeCSSSpecificity(cssText);
}

/**
 * Get specificity optimization report
 */
export function getSpecificityReport(cssText) {
  const optimizer = initializeSpecificityManagement();
  return optimizer.getOptimizationReport(cssText);
}

/**
 * Resolve specificity conflicts
 */
export function resolveSpecificityConflicts(conflicts, cssText) {
  const resolver = conflictResolver || new SpecificityConflictResolver();
  return resolver.resolveConflicts(conflicts, cssText);
}

/**
 * Create specificity-safe CSS
 */
export function createSpecificitySafeCSS(cssText, baseSpecificity = 100) {
  const resolver = conflictResolver || new SpecificityConflictResolver();
  return resolver.createSpecificitySafeCSS(cssText, baseSpecificity);
}

/**
 * Export classes for external use
 */
export { SpecificityAnalyzer, SpecificityOptimizer, SpecificityConflictResolver };

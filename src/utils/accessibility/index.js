/**
 * Owl Retro - Integrated Accessibility Validation System
 * Tüm accessibility modüllerini bir araya getiren entegre sistem
 */

// Import all accessibility modules
import {
  validateWCAG_AA,
  validateWCAG_AAA,
  getContrastValidation,
  validateColorCombinations,
  suggestColorImprovements,
  generateWCAGComplianceReport,
  auditPageWCAGCompliance
} from './wcag-validation.js';

import {
  COLOR_BLINDNESS_TYPES,
  simulateColorBlindness,
  getAllColorBlindnessSimulations,
  checkColorBlindnessContrast,
  validateColorAccessibility
} from './color-blindness.js';

import {
  HIGH_CONTRAST_MODES,
  prefersHighContrast,
  getHighContrastColor,
  applyHighContrastToPair,
  generateHighContrastPalette,
  shouldApplyHighContrast,
  optimizeForHighContrast,
  getHighContrastTheme,
  validateHighContrastImplementation
} from './high-contrast.js';

import {
  MOTION_PREFERENCES,
  prefersReducedMotion,
  getMotionPreference,
  generateMotionSafeCSS,
  applyReducedMotionToClass,
  generateMotionPreferenceCSS,
  shouldDisableAnimation,
  getMotionSafeDuration,
  applyMotionAccessibility,
  createAccessibleAnimation,
  monitorMotionPreference,
  validateMotionAccessibility
} from './reduced-motion.js';

/**
 * Comprehensive accessibility validation for a color combination
 */
export function validateAccessibility(colorCombination, options = {}) {
  const {
    foreground,
    background,
    fontSize = 14,
    fontWeight = 400,
    includeColorBlindness = true,
    includeHighContrast = true,
    includeMotion = false
  } = colorCombination;

  const results = {
    wcag: {},
    colorBlindness: {},
    highContrast: {},
    motion: {},
    overall: {
      accessible: true,
      issues: [],
      recommendations: []
    }
  };

  // WCAG Validation
  results.wcag = {
    aa: validateWCAG_AA(foreground, background, fontSize, fontWeight),
    aaa: validateWCAG_AAA(foreground, background, fontSize, fontWeight),
    details: getContrastValidation(foreground, background, fontSize, fontWeight)
  };

  if (!results.wcag.aa) {
    results.overall.accessible = false;
    results.overall.issues.push('WCAG AA contrast requirement not met');
    const suggestions = suggestColorImprovements(foreground, background, fontSize, fontWeight);
    results.overall.recommendations.push(...suggestions.suggestions);
  }

  // Color Blindness Validation
  if (includeColorBlindness) {
    results.colorBlindness = validateColorAccessibility(foreground, background);
    if (!results.colorBlindness.allPass) {
      results.overall.accessible = false;
      results.overall.issues.push(`Color blindness issues: ${results.colorBlindness.summary.failingTypes} types fail contrast`);
      results.overall.recommendations.push({
        type: 'color_blindness',
        message: `Worst case: ${results.colorBlindness.worstCase.type} (${results.colorBlindness.worstCase.contrast}:1 contrast)`
      });
    }
  }

  // High Contrast Validation
  if (includeHighContrast && shouldApplyHighContrast()) {
    const highContrastPair = applyHighContrastToPair(foreground, background);
    results.highContrast = {
      applied: true,
      colors: highContrastPair,
      validation: getContrastValidation(highContrastPair.foreground, highContrastPair.background, fontSize, fontWeight)
    };
  }

  // Motion Validation (if elements provided)
  if (includeMotion && options.elements) {
    results.motion = validateMotionAccessibility(options.elements);
    if (!results.motion.allAccessible) {
      results.overall.accessible = false;
      results.overall.issues.push(`Motion accessibility issues: ${results.motion.summary.inaccessibleElements} elements`);
    }
  }

  return results;
}

/**
 * Validate entire design system for accessibility
 */
export function validateDesignSystem(designTokens, options = {}) {
  const {
    fontSize = 14,
    fontWeight = 400,
    includeColorBlindness = true,
    includeHighContrast = true
  } = options;

  const results = {
    colorCombinations: {},
    overall: {
      total: 0,
      accessible: 0,
      issues: [],
      recommendations: []
    }
  };

  // Extract color combinations from design tokens
  const combinations = extractColorCombinations(designTokens);

  combinations.forEach((combo, index) => {
    const key = combo.label || `combination_${index + 1}`;
    results.colorCombinations[key] = validateAccessibility(combo, {
      fontSize,
      fontWeight,
      includeColorBlindness,
      includeHighContrast
    });

    results.overall.total++;
    if (results.colorCombinations[key].overall.accessible) {
      results.overall.accessible++;
    } else {
      results.overall.issues.push(...results.colorCombinations[key].overall.issues);
      results.overall.recommendations.push(...results.colorCombinations[key].overall.recommendations);
    }
  });

  results.overall.accessibilityRate = results.overall.total > 0 ?
    Math.round((results.overall.accessible / results.overall.total) * 100) : 0;

  return results;
}

/**
 * Extract color combinations from design tokens
 */
function extractColorCombinations(designTokens) {
  const combinations = [];

  // Common patterns for extracting color pairs
  const patterns = [
    { fg: 'text', bg: 'background' },
    { fg: 'primary', bg: 'background' },
    { fg: 'secondary', bg: 'background' },
    { fg: 'error', bg: 'background' },
    { fg: 'warning', bg: 'background' },
    { fg: 'success', bg: 'background' },
    { fg: 'text', bg: 'surface' },
    { fg: 'primary', bg: 'surface' }
  ];

  patterns.forEach(pattern => {
    const fgColor = findColorInTokens(designTokens, pattern.fg);
    const bgColor = findColorInTokens(designTokens, pattern.bg);

    if (fgColor && bgColor) {
      combinations.push({
        foreground: fgColor,
        background: bgColor,
        label: `${pattern.fg}_on_${pattern.bg}`
      });
    }
  });

  return combinations;
}

/**
 * Find color in design tokens
 */
function findColorInTokens(tokens, key) {
  // Simple key lookup
  if (tokens[key]) return tokens[key];

  // Nested lookup
  for (const [tokenKey, value] of Object.entries(tokens)) {
    if (typeof value === 'object') {
      const found = findColorInTokens(value, key);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Generate comprehensive accessibility report
 */
export function generateAccessibilityReport(target, options = {}) {
  const {
    type = 'page', // 'page', 'component', 'design-system'
    includeColorBlindness = true,
    includeHighContrast = true,
    includeMotion = true,
    level = 'AA'
  } = options;

  const report = {
    timestamp: new Date().toISOString(),
    type,
    target,
    options,
    results: {},
    summary: {
      overallAccessible: true,
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      accessibilityScore: 100
    },
    recommendations: []
  };

  switch (type) {
    case 'page':
      report.results = auditPageWCAGCompliance({ level });
      break;

    case 'component':
      if (target.elements) {
        report.results = validateAccessibility(target, { includeMotion, elements: target.elements });
      }
      break;

    case 'design-system':
      if (target.tokens) {
        report.results = validateDesignSystem(target.tokens, { includeColorBlindness, includeHighContrast });
      }
      break;
  }

  // Calculate summary
  if (report.results.summary) {
    report.summary.totalChecks = report.results.summary.total || report.results.summary.totalElements || 0;
    report.summary.passedChecks = report.results.summary.compliant || report.results.summary.valid || 0;
    report.summary.failedChecks = report.summary.totalChecks - report.summary.passedChecks;
    report.summary.accessibilityScore = report.summary.totalChecks > 0 ?
      Math.round((report.summary.passedChecks / report.summary.totalChecks) * 100) : 100;
    report.summary.overallAccessible = report.summary.failedChecks === 0;
  }

  return report;
}

/**
 * Auto-fix accessibility issues
 */
export function autoFixAccessibilityIssues(issues, options = {}) {
  const {
    aggressive = false,
    preserveDesign = true
  } = options;

  const fixes = {
    applied: [],
    suggested: [],
    impossible: []
  };

  issues.forEach(issue => {
    switch (issue.type) {
      case 'contrast':
        if (aggressive) {
          // Auto-fix by adjusting colors
          fixes.applied.push({
            type: 'contrast_fix',
            original: issue.colors,
            fixed: suggestColorImprovements(issue.colors.foreground, issue.colors.background).suggestions[0]
          });
        } else {
          fixes.suggested.push({
            type: 'contrast_suggestion',
            message: 'Consider using higher contrast colors',
            suggestions: suggestColorImprovements(issue.colors.foreground, issue.colors.background).suggestions
          });
        }
        break;

      case 'color_blindness':
        fixes.suggested.push({
          type: 'color_blindness_fix',
          message: 'Test color combinations with color blindness simulators',
          suggestions: ['Use color with sufficient contrast for all color blindness types']
        });
        break;

      case 'motion':
        fixes.applied.push({
          type: 'motion_fix',
          message: 'Apply reduced motion preferences',
          fix: { applyReducedMotion: true }
        });
        break;

      default:
        fixes.impossible.push({
          type: 'unknown_issue',
          issue,
          message: 'Cannot auto-fix this accessibility issue'
        });
    }
  });

  return fixes;
}

/**
 * Monitor accessibility compliance
 */
export function monitorAccessibility(callback, options = {}) {
  const {
    interval = 5000, // Check every 5 seconds
    target = 'page',
    continuous = true
  } = options;

  let lastReport = null;

  const checkAccessibility = () => {
    const report = generateAccessibilityReport({ type: target }, options);

    // Only report changes
    if (!lastReport || JSON.stringify(report.summary) !== JSON.stringify(lastReport.summary)) {
      callback(report);
      lastReport = report;
    }

    if (continuous) {
      setTimeout(checkAccessibility, interval);
    }
  };

  // Start monitoring
  checkAccessibility();

  // Return stop function
  return () => {
    continuous = false;
  };
}

// Export all individual modules for direct access
export {
  // WCAG Validation
  validateWCAG_AA,
  validateWCAG_AAA,
  getContrastValidation,
  validateColorCombinations,
  suggestColorImprovements,
  generateWCAGComplianceReport,
  auditPageWCAGCompliance,

  // Color Blindness
  COLOR_BLINDNESS_TYPES,
  simulateColorBlindness,
  getAllColorBlindnessSimulations,
  checkColorBlindnessContrast,
  validateColorAccessibility,

  // High Contrast
  HIGH_CONTRAST_MODES,
  prefersHighContrast,
  getHighContrastColor,
  applyHighContrastToPair,
  generateHighContrastPalette,
  shouldApplyHighContrast,
  optimizeForHighContrast,
  getHighContrastTheme,
  validateHighContrastImplementation,

  // Reduced Motion
  MOTION_PREFERENCES,
  prefersReducedMotion,
  getMotionPreference,
  generateMotionSafeCSS,
  applyReducedMotionToClass,
  generateMotionPreferenceCSS,
  shouldDisableAnimation,
  getMotionSafeDuration,
  applyMotionAccessibility,
  createAccessibleAnimation,
  monitorMotionPreference,
  validateMotionAccessibility
};

/**
 * Get accessibility system version and capabilities
 */
export function getAccessibilitySystemInfo() {
  return {
    version: '1.0.0',
    modules: [
      'wcag-validation',
      'color-blindness',
      'high-contrast',
      'reduced-motion',
      'integrated-validation'
    ],
    capabilities: [
      'WCAG 2.1 AA/AAA compliance',
      '8-type color blindness simulation',
      'High contrast mode optimization',
      'Reduced motion support',
      'Automated accessibility auditing',
      'Real-time accessibility monitoring',
      'Auto-fix suggestions'
    ],
    supportedStandards: [
      'WCAG 2.1',
      'WCAG 2.0',
      'Section 508',
      'EN 301 549'
    ]
  };
}

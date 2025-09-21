/**
 * Owl Retro - WCAG Accessibility Validation Module
 * WCAG 2.1 AA/AAA compliance validation fonksiyonları
 */

import { parseColor, getLuminance, getContrastRatio, rgbToHsl, hslToRgb } from '../color-utils.js';

/**
 * WCAG 2.1 Color Contrast Validation
 */
export const WCAG_CONTRAST_RATIOS = {
  AA: {
    normal: 4.5,
    large: 3.0,
    ui: 3.0
  },
  AAA: {
    normal: 7.0,
    large: 4.5
  }
};

/**
 * Check if text size qualifies as "large" per WCAG guidelines
 */
export function isLargeText(fontSize, fontWeight = 400) {
  // Large text: 18pt+ (14px+) normal, or 14pt+ (12px+) bold
  const isBold = fontWeight >= 700;
  return (isBold && fontSize >= 12) || (!isBold && fontSize >= 14);
}

/**
 * Validate color contrast according to WCAG 2.1 AA standards
 */
export function validateWCAG_AA(foregroundColor, backgroundColor, fontSize = 14, fontWeight = 400) {
  const fg = parseColor(foregroundColor);
  const bg = parseColor(backgroundColor);

  if (!fg || !bg) return false;

  const contrastRatio = getContrastRatio(fg, bg);
  const isLarge = isLargeText(fontSize, fontWeight);

  const requiredRatio = isLarge ? WCAG_CONTRAST_RATIOS.AA.large : WCAG_CONTRAST_RATIOS.AA.normal;

  return contrastRatio >= requiredRatio;
}

/**
 * Validate color contrast according to WCAG 2.1 AAA standards
 */
export function validateWCAG_AAA(foregroundColor, backgroundColor, fontSize = 14, fontWeight = 400) {
  const fg = parseColor(foregroundColor);
  const bg = parseColor(backgroundColor);

  if (!fg || !bg) return false;

  const contrastRatio = getContrastRatio(fg, bg);
  const isLarge = isLargeText(fontSize, fontWeight);

  const requiredRatio = isLarge ? WCAG_CONTRAST_RATIOS.AAA.large : WCAG_CONTRAST_RATIOS.AAA.normal;

  return contrastRatio >= requiredRatio;
}

/**
 * Get comprehensive contrast validation result
 */
export function getContrastValidation(foregroundColor, backgroundColor, fontSize = 14, fontWeight = 400) {
  const fg = parseColor(foregroundColor);
  const bg = parseColor(backgroundColor);

  if (!fg || !bg) {
    return {
      valid: false,
      contrastRatio: 0,
      aa: false,
      aaa: false,
      isLargeText: false,
      requiredRatio: { aa: 0, aaa: 0 }
    };
  }

  const contrastRatio = getContrastRatio(fg, bg);
  const isLarge = isLargeText(fontSize, fontWeight);

  const aaRequired = isLarge ? WCAG_CONTRAST_RATIOS.AA.large : WCAG_CONTRAST_RATIOS.AA.normal;
  const aaaRequired = isLarge ? WCAG_CONTRAST_RATIOS.AAA.large : WCAG_CONTRAST_RATIOS.AAA.normal;

  return {
    valid: contrastRatio >= aaRequired,
    contrastRatio: Math.round(contrastRatio * 100) / 100,
    aa: contrastRatio >= aaRequired,
    aaa: contrastRatio >= aaaRequired,
    isLargeText: isLarge,
    requiredRatio: { aa: aaRequired, aaa: aaaRequired }
  };
}

/**
 * Validate multiple color combinations
 */
export function validateColorCombinations(combinations, options = {}) {
  const {
    fontSize = 14,
    fontWeight = 400,
    level = 'AA' // 'AA' or 'AAA'
  } = options;

  const results = {};
  let allValid = true;
  let totalCombinations = 0;
  let validCombinations = 0;

  combinations.forEach((combo, index) => {
    const { foreground, background, label } = combo;
    const key = label || `combination_${index + 1}`;

    const validation = level === 'AAA' ?
      validateWCAG_AAA(foreground, background, fontSize, fontWeight) :
      validateWCAG_AA(foreground, background, fontSize, fontWeight);

    const contrast = getContrastValidation(foreground, background, fontSize, fontWeight);

    results[key] = {
      valid: validation,
      contrast: contrast.contrastRatio,
      required: level === 'AAA' ? contrast.requiredRatio.aaa : contrast.requiredRatio.aa,
      colors: { foreground, background },
      fontSize,
      fontWeight
    };

    totalCombinations++;
    if (validation) validCombinations++;
    else allValid = false;
  });

  return {
    results,
    allValid,
    summary: {
      total: totalCombinations,
      valid: validCombinations,
      invalid: totalCombinations - validCombinations,
      level,
      complianceRate: totalCombinations > 0 ? Math.round((validCombinations / totalCombinations) * 100) : 0
    }
  };
}

/**
 * Suggest color improvements for WCAG compliance
 */
export function suggestColorImprovements(foregroundColor, backgroundColor, fontSize = 14, fontWeight = 400) {
  const current = getContrastValidation(foregroundColor, backgroundColor, fontSize, fontWeight);

  if (current.aa) {
    return {
      needed: false,
      current: current,
      suggestions: []
    };
  }

  const suggestions = [];
  const fgRgb = parseColor(foregroundColor);
  const bgRgb = parseColor(backgroundColor);

  if (!fgRgb || !bgRgb) {
    return {
      needed: true,
      current: current,
      suggestions: [{ type: 'error', message: 'Invalid color format' }]
    };
  }

  const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine if we need darker or lighter text
  const needsDarkerText = bgLuminance > 0.5;

  if (needsDarkerText) {
    // Light background - suggest darker text
    const darkerHsl = { ...fgHsl, l: Math.max(0, fgHsl.l - 30) };
    const darkerRgb = hslToRgb(darkerHsl.h, darkerHsl.s / 100, darkerHsl.l / 100);
    const darkerColor = `rgb(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b})`;

    suggestions.push({
      type: 'darken_text',
      original: foregroundColor,
      suggested: darkerColor,
      improvement: getContrastValidation(darkerColor, backgroundColor, fontSize, fontWeight).contrastRatio - current.contrastRatio
    });
  } else {
    // Dark background - suggest lighter text
    const lighterHsl = { ...fgHsl, l: Math.min(100, fgHsl.l + 30) };
    const lighterRgb = hslToRgb(lighterHsl.h, lighterHsl.s / 100, lighterHsl.l / 100);
    const lighterColor = `rgb(${lighterRgb.r}, ${lighterRgb.g}, ${lighterRgb.b})`;

    suggestions.push({
      type: 'lighten_text',
      original: foregroundColor,
      suggested: lighterColor,
      improvement: getContrastValidation(lighterColor, backgroundColor, fontSize, fontWeight).contrastRatio - current.contrastRatio
    });
  }

  // Suggest increasing font size for large text benefits
  if (!current.isLargeText && fontSize < 14) {
    const largeTextValidation = getContrastValidation(foregroundColor, backgroundColor, 14, fontWeight);
    if (largeTextValidation.aa) {
      suggestions.push({
        type: 'increase_font_size',
        original: fontSize,
        suggested: 14,
        improvement: largeTextValidation.contrastRatio - current.contrastRatio,
        note: 'Increasing font size to 14px would make this large text, reducing contrast requirements'
      });
    }
  }

  return {
    needed: true,
    current: current,
    suggestions: suggestions.sort((a, b) => b.improvement - a.improvement)
  };
}

/**
 * Generate WCAG compliance report
 */
export function generateWCAGComplianceReport(elements, options = {}) {
  const {
    level = 'AA',
    fontSize = 14,
    fontWeight = 400,
    includeSuggestions = true
  } = options;

  const report = {
    timestamp: new Date().toISOString(),
    level,
    criteria: WCAG_CONTRAST_RATIOS[level.toUpperCase()],
    results: {},
    summary: {
      totalElements: 0,
      compliant: 0,
      nonCompliant: 0,
      complianceRate: 0
    },
    suggestions: []
  };

  elements.forEach((element, index) => {
    const key = `element_${index + 1}`;

    // Extract colors from element (this would need to be implemented based on how colors are stored)
    const colors = extractColorsFromElement(element);

    if (colors.foreground && colors.background) {
      const validation = getContrastValidation(colors.foreground, colors.background, fontSize, fontWeight);

      report.results[key] = {
        element: element.tagName?.toLowerCase() || 'unknown',
        colors,
        validation,
        compliant: level === 'AAA' ? validation.aaa : validation.aa
      };

      if (includeSuggestions && !report.results[key].compliant) {
        const suggestions = suggestColorImprovements(colors.foreground, colors.background, fontSize, fontWeight);
        report.results[key].suggestions = suggestions.suggestions;
        report.suggestions.push(...suggestions.suggestions.map(s => ({ ...s, element: key })));
      }
    }
  });

  // Calculate summary
  const results = Object.values(report.results);
  report.summary.totalElements = results.length;
  report.summary.compliant = results.filter(r => r.compliant).length;
  report.summary.nonCompliant = results.length - report.summary.compliant;
  report.summary.complianceRate = results.length > 0 ?
    Math.round((report.summary.compliant / results.length) * 100) : 0;

  return report;
}

/**
 * Extract colors from DOM element (helper function)
 */
function extractColorsFromElement(element) {
  if (!element || typeof element !== 'object') {
    return { foreground: null, background: null };
  }

  const computedStyle = window.getComputedStyle?.(element) || {};
  const foreground = computedStyle.color;
  const background = computedStyle.backgroundColor;

  return {
    foreground: foreground && foreground !== 'rgba(0, 0, 0, 0)' ? foreground : null,
    background: background && background !== 'rgba(0, 0, 0, 0)' ? background : null
  };
}

/**
 * Check WCAG compliance for entire page
 */
export function auditPageWCAGCompliance(options = {}) {
  if (typeof document === 'undefined') {
    return { error: 'Document not available' };
  }

  const {
    level = 'AA',
    fontSize = 14,
    fontWeight = 400,
    selectors = ['*']
  } = options;

  const elements = [];

  selectors.forEach(selector => {
    try {
      const foundElements = document.querySelectorAll(selector);
      foundElements.forEach(element => {
        elements.push(element);
      });
    } catch (e) {
      console.warn(`Invalid selector: ${selector}`);
    }
  });

  return generateWCAGComplianceReport(elements, { level, fontSize, fontWeight, includeSuggestions: true });
}

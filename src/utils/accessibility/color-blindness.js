/**
 * Owl Retro - Color Blindness Accessibility Module
 * 8 tip color blindness simülasyonu ve validation fonksiyonları
 */

import { parseColor, rgbToHsl, hslToRgb, getContrastRatio } from '../color-utils.js';

/**
 * Color Blindness Simulation Types
 */
export const COLOR_BLINDNESS_TYPES = {
  NORMAL: 'normal',
  PROTANOPIA: 'protanopia',           // Red blindness
  DEUTERANOPIA: 'deuteranopia',       // Green blindness
  TRITANOPIA: 'tritanopia',           // Blue blindness
  PROTANOMALY: 'protanomaly',         // Reduced red sensitivity
  DEUTERANOMALY: 'deuteranomaly',     // Reduced green sensitivity
  TRITANOMALY: 'tritanomaly',         // Reduced blue sensitivity
  ACHROMATOPSIA: 'achromatopsia',     // Complete color blindness
  ACHROMATOMALY: 'achromatomaly'      // Reduced color sensitivity
};

/**
 * Color blindness transformation matrices (LMS color space)
 * Based on research by Machado et al. and Brettel et al.
 */
const COLOR_BLINDNESS_MATRICES = {
  // Normal vision
  normal: [
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0]
  ],

  // Protanopia (Red blindness)
  protanopia: [
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0]
  ],

  // Deuteranopia (Green blindness)
  deuteranopia: [
    [1.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 1.0]
  ],

  // Tritanopia (Blue blindness)
  tritanopia: [
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0]
  ],

  // Protanomaly (Reduced red sensitivity)
  protanomaly: [
    [0.8, 0.2, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 1.0]
  ],

  // Deuteranomaly (Reduced green sensitivity)
  deuteranomaly: [
    [1.0, 0.0, 0.0],
    [0.2, 0.8, 0.0],
    [0.0, 0.0, 1.0]
  ],

  // Tritanomaly (Reduced blue sensitivity)
  tritanomaly: [
    [1.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.2, 0.8]
  ],

  // Achromatopsia (Complete color blindness)
  achromatopsia: [
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0]
  ],

  // Achromatomaly (Reduced color sensitivity)
  achromatomaly: [
    [0.5, 0.5, 0.0],
    [0.0, 0.5, 0.5],
    [0.5, 0.0, 0.5]
  ]
};

/**
 * Convert RGB to LMS color space
 */
function rgbToLms(r, g, b) {
  // Normalize to 0-1 range
  r /= 255;
  g /= 255;
  b /= 255;

  // RGB to LMS transformation matrix (Hunt-Pointer-Estevez)
  const l = r * 0.31399022 + g * 0.15537241 + b * 0.01775239;
  const m = r * 0.63951294 + g * 0.75789446 + b * 0.10944209;
  const s = r * 0.04649755 + g * 0.08670142 + b * 0.87256922;

  return { l, m, s };
}

/**
 * Convert LMS to RGB color space
 */
function lmsToRgb(l, m, s) {
  // LMS to RGB transformation matrix
  const r = l *  5.47221206 + m * -4.6419601  + s *  0.16963708;
  const g = l * -1.1252419  + m *  2.29317094 + s * -0.1678952;
  const b = l *  0.02980165 + m * -0.19318073 + s *  1.16364789;

  // Denormalize and clamp
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val * 255)));

  return {
    r: clamp(r),
    g: clamp(g),
    b: clamp(b)
  };
}

/**
 * Apply color blindness transformation matrix
 */
function applyColorBlindnessMatrix(l, m, s, matrix) {
  const newL = l * matrix[0][0] + m * matrix[0][1] + s * matrix[0][2];
  const newM = l * matrix[1][0] + m * matrix[1][1] + s * matrix[1][2];
  const newS = l * matrix[2][0] + m * matrix[2][1] + s * matrix[2][2];

  return { l: newL, m: newM, s: newS };
}

/**
 * Simulate color blindness for a given color
 */
export function simulateColorBlindness(color, type = COLOR_BLINDNESS_TYPES.NORMAL) {
  const rgb = parseColor(color);
  if (!rgb) return color;

  if (type === COLOR_BLINDNESS_TYPES.NORMAL) {
    return color;
  }

  const matrix = COLOR_BLINDNESS_MATRICES[type];
  if (!matrix) return color;

  // Convert to LMS color space
  const lms = rgbToLms(rgb.r, rgb.g, rgb.b);

  // Apply color blindness transformation
  const transformedLms = applyColorBlindnessMatrix(lms.l, lms.m, lms.s, matrix);

  // Special handling for achromatopsia (convert to grayscale)
  if (type === COLOR_BLINDNESS_TYPES.ACHROMATOPSIA) {
    // Import getLuminance from color-utils
    const { getLuminance } = require('../color-utils.js');
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    const grayValue = Math.round(luminance * 255);
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  }

  // Convert back to RGB
  const resultRgb = lmsToRgb(transformedLms.l, transformedLms.m, transformedLms.s);

  return `rgba(${resultRgb.r}, ${resultRgb.g}, ${resultRgb.b}, ${rgb.a})`;
}

/**
 * Get all color blindness simulations for a color
 */
export function getAllColorBlindnessSimulations(color) {
  const simulations = {};

  Object.values(COLOR_BLINDNESS_TYPES).forEach(type => {
    simulations[type] = simulateColorBlindness(color, type);
  });

  return simulations;
}

/**
 * Check if a color pair maintains sufficient contrast for color blind users
 */
export function checkColorBlindnessContrast(foregroundColor, backgroundColor, type = COLOR_BLINDNESS_TYPES.DEUTERANOPIA) {
  const fgSimulated = simulateColorBlindness(foregroundColor, type);
  const bgSimulated = simulateColorBlindness(backgroundColor, type);

  const contrastRatio = getContrastRatio(
    parseColor(fgSimulated),
    parseColor(bgSimulated)
  );

  return {
    originalContrast: getContrastRatio(parseColor(foregroundColor), parseColor(backgroundColor)),
    simulatedContrast: contrastRatio,
    type: type,
    aa: contrastRatio >= 4.5,
    aaa: contrastRatio >= 7.0
  };
}

/**
 * Validate color accessibility for all color blindness types
 */
export function validateColorAccessibility(foregroundColor, backgroundColor) {
  const results = {};
  let allPass = true;
  let worstCase = { type: null, contrast: Infinity, aa: true, aaa: true };

  // Check all color blindness types
  Object.values(COLOR_BLINDNESS_TYPES).forEach(type => {
    if (type === COLOR_BLINDNESS_TYPES.NORMAL) return;

    const result = checkColorBlindnessContrast(foregroundColor, backgroundColor, type);
    results[type] = result;

    if (!result.aa) allPass = false;

    if (result.simulatedContrast < worstCase.contrast) {
      worstCase = {
        type: type,
        contrast: result.simulatedContrast,
        aa: result.aa,
        aaa: result.aaa
      };
    }
  });

  return {
    results,
    allPass,
    worstCase,
    summary: {
      totalTypes: Object.keys(COLOR_BLINDNESS_TYPES).length - 1, // Exclude normal
      passingTypes: Object.values(results).filter(r => r.aa).length,
      failingTypes: Object.values(results).filter(r => !r.aa).length
    }
  };
}

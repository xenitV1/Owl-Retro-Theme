/**
 * Owl Retro - Color Utilities
 * Renk dönüşüm, eşleme ve manipülasyon fonksiyonları
 */

import { RETRO_PALETTE, COLOR_STRATEGY } from './constants.js';

/**
 * Parse any color format to RGB
 */
export function parseColor(color) {
  if (!color || color === 'transparent' || color === 'inherit') {
    return null;
  }

  // Hex format
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // RGB/RGBA format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    };
  }

  // HSL format
  const hslMatch = color.match(/hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)/);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1]),
      parseFloat(hslMatch[2]) / 100,
      parseFloat(hslMatch[3]) / 100,
      hslMatch[4] ? parseFloat(hslMatch[4]) : 1
    );
  }

  return null;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1
  } : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h, s, l, a = 1) {
  h = h / 360;
  
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a
  };
}

/**
 * Calculate relative luminance (WCAG)
 */
export function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Map color to retro palette
 */
export function mapToRetroPalette(originalColor, mode = 'light', intensity = 0.8) {
  const rgb = parseColor(originalColor);
  if (!rgb) return originalColor;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const palette = Object.values(RETRO_PALETTE);
  
  // Find closest palette color by HSL distance
  let closestColor = null;
  let minDistance = Infinity;

  palette.forEach(paletteColor => {
    const paletteRgb = parseColor(paletteColor);
    const paletteHsl = rgbToHsl(paletteRgb.r, paletteRgb.g, paletteRgb.b);
    
    // Calculate HSL distance with hue weight
    const hDiff = Math.min(Math.abs(hsl.h - paletteHsl.h), 360 - Math.abs(hsl.h - paletteHsl.h));
    const sDiff = Math.abs(hsl.s - paletteHsl.s);
    const lDiff = Math.abs(hsl.l - paletteHsl.l);
    
    const distance = (hDiff * 2) + sDiff + (lDiff * 0.5);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
  });

  // Adjust for mode and intensity
  const finalRgb = parseColor(closestColor);
  const adjustedHsl = rgbToHsl(finalRgb.r, finalRgb.g, finalRgb.b);

  if (mode === 'dark') {
    // Darken for dark mode
    adjustedHsl.l = Math.max(20, adjustedHsl.l - 20);
    adjustedHsl.s = Math.min(100, adjustedHsl.s * 1.2);
  } else {
    // Lighten for light mode
    adjustedHsl.l = Math.min(80, adjustedHsl.l + 10);
  }

  // Apply intensity
  adjustedHsl.s = Math.round(adjustedHsl.s * intensity);

  const result = hslToRgb(adjustedHsl.h, adjustedHsl.s / 100, adjustedHsl.l / 100, rgb.a);
  return `rgba(${result.r}, ${result.g}, ${result.b}, ${result.a})`;
}

/**
 * Adjust color for better contrast
 */
export function ensureContrast(foregroundColor, backgroundColor, targetRatio = COLOR_STRATEGY.CONTRAST_MIN) {
  const fg = parseColor(foregroundColor);
  const bg = parseColor(backgroundColor);
  
  if (!fg || !bg) return foregroundColor;

  let currentRatio = getContrastRatio(fg, bg);
  if (currentRatio >= targetRatio) return foregroundColor;

  // Adjust lightness to meet contrast requirement
  const fgHsl = rgbToHsl(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  if (bgLuminance > 0.5) {
    // Dark text on light background
    while (currentRatio < targetRatio && fgHsl.l > 0) {
      fgHsl.l -= 5;
      const newRgb = hslToRgb(fgHsl.h, fgHsl.s / 100, fgHsl.l / 100);
      currentRatio = getContrastRatio(newRgb, bg);
    }
  } else {
    // Light text on dark background
    while (currentRatio < targetRatio && fgHsl.l < 100) {
      fgHsl.l += 5;
      const newRgb = hslToRgb(fgHsl.h, fgHsl.s / 100, fgHsl.l / 100);
      currentRatio = getContrastRatio(newRgb, bg);
    }
  }

  const finalRgb = hslToRgb(fgHsl.h, fgHsl.s / 100, fgHsl.l / 100, fg.a);
  return `rgba(${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b}, ${finalRgb.a})`;
}

// Note: WCAG validation functions have been moved to src/utils/accessibility/wcag-validation.js
// Import them from there: import { validateWCAG_AA, validateWCAG_AAA, getContrastValidation } from '../accessibility/wcag-validation.js';

// Note: Color blindness functions have been moved to src/utils/accessibility/color-blindness.js
// Import them from there: import { simulateColorBlindness, checkColorBlindnessContrast } from '../accessibility/color-blindness.js';

// Note: High contrast functions have been moved to src/utils/accessibility/high-contrast.js
// Import them from there: import { getHighContrastColor, optimizeForHighContrast } from '../accessibility/high-contrast.js';

// Note: Reduced motion functions have been moved to src/utils/accessibility/reduced-motion.js
// Import them from there: import { getMotionPreference, generateMotionSafeCSS } from '../accessibility/reduced-motion.js';

/**
 * Check if color should be preserved
 */
export function shouldPreserveColor(color) {
  if (!color || color === 'transparent' || color === 'inherit' || color === 'initial') {
    return true;
  }

  // Preserve gradients
  if (color.includes('gradient')) {
    return true;
  }

  // Preserve images
  if (color.includes('url(')) {
    return true;
  }

  return false;
}
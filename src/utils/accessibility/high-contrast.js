/**
 * Owl Retro - High Contrast Accessibility Module
 * Yüksek kontrast modu optimizasyonu ve yönetimi
 */

import { parseColor, getLuminance, rgbToHsl, hslToRgb, getContrastRatio } from '../color-utils.js';

/**
 * High Contrast Mode Configuration
 */
export const HIGH_CONTRAST_MODES = {
  STANDARD: 'standard',     // Pure black and white
  INVERTED: 'inverted',     // Inverted colors with high contrast
  ADAPTIVE: 'adaptive',     // Smart contrast based on original color
  SYSTEM: 'system'          // Follow system high contrast settings
};

/**
 * High contrast color mapping
 */
const HIGH_CONTRAST_PALETTE = {
  // Light backgrounds
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#000000',
    textSecondary: '#333333',
    border: '#000000',
    accent: '#000000'
  },
  // Dark backgrounds
  dark: {
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#ffffff',
    accent: '#ffffff'
  }
};

/**
 * Detect if system prefers high contrast mode
 */
export function prefersHighContrast() {
  if (typeof window === 'undefined') return false;

  // Check for Windows High Contrast mode
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  // Check for forced colors (Windows High Contrast)
  const isForcedColors = window.matchMedia('(forced-colors: active)').matches;

  // Check for reduced transparency (often indicates accessibility mode)
  const isReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;

  return isHighContrast || isForcedColors || isReducedTransparency;
}

/**
 * Get high contrast version of a color
 */
export function getHighContrastColor(color, mode = HIGH_CONTRAST_MODES.STANDARD, theme = 'light') {
  const rgb = parseColor(color);
  if (!rgb) return color;

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  switch (mode) {
    case HIGH_CONTRAST_MODES.STANDARD:
      // Convert to pure black or white based on luminance
      return luminance > 0.5 ? '#000000' : '#ffffff';

    case HIGH_CONTRAST_MODES.INVERTED:
      // Invert colors and ensure high contrast
      const inverted = {
        r: 255 - rgb.r,
        g: 255 - rgb.g,
        b: 255 - rgb.b
      };
      const invertedLuminance = getLuminance(inverted.r, inverted.g, inverted.b);
      return invertedLuminance > 0.5 ? '#000000' : '#ffffff';

    case HIGH_CONTRAST_MODES.ADAPTIVE:
      // Smart mapping based on original color purpose
      if (luminance < 0.3) {
        // Dark color -> use palette text color
        return HIGH_CONTRAST_PALETTE[theme].text;
      } else if (luminance > 0.7) {
        // Light color -> use palette background
        return HIGH_CONTRAST_PALETTE[theme].background;
      } else {
        // Medium color -> use accent
        return HIGH_CONTRAST_PALETTE[theme].accent;
      }

    case HIGH_CONTRAST_MODES.SYSTEM:
      // Use system preference
      return prefersHighContrast() ?
        getHighContrastColor(color, HIGH_CONTRAST_MODES.STANDARD, theme) :
        color;

    default:
      return color;
  }
}

/**
 * Apply high contrast to color pair (foreground/background)
 */
export function applyHighContrastToPair(foregroundColor, backgroundColor, mode = HIGH_CONTRAST_MODES.STANDARD) {
  const fgRgb = parseColor(foregroundColor);
  const bgRgb = parseColor(backgroundColor);

  if (!fgRgb || !bgRgb) {
    return { foreground: foregroundColor, background: backgroundColor };
  }

  // Determine theme based on background luminance
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const theme = bgLuminance > 0.5 ? 'light' : 'dark';

  const highContrastFg = getHighContrastColor(foregroundColor, mode, theme);
  const highContrastBg = getHighContrastColor(backgroundColor, mode, theme);

  // Ensure minimum contrast
  const contrast = getContrastRatio(parseColor(highContrastFg), parseColor(highContrastBg));
  if (contrast < 21) { // Maximum possible contrast
    // Swap colors if needed to ensure high contrast
    return {
      foreground: highContrastBg,
      background: highContrastFg
    };
  }

  return {
    foreground: highContrastFg,
    background: highContrastBg
  };
}

/**
 * Generate high contrast color palette
 */
export function generateHighContrastPalette(baseColors, mode = HIGH_CONTRAST_MODES.STANDARD, theme = 'light') {
  const palette = {};

  Object.entries(baseColors).forEach(([key, color]) => {
    palette[key] = getHighContrastColor(color, mode, theme);
  });

  return palette;
}

/**
 * Check if high contrast mode should be applied
 */
export function shouldApplyHighContrast(userPreference = null, forceSystemCheck = true) {
  // User preference takes precedence
  if (userPreference !== null) {
    return userPreference;
  }

  // Check system preferences
  if (forceSystemCheck && prefersHighContrast()) {
    return true;
  }

  return false;
}

/**
 * Optimize colors for high contrast accessibility
 */
export function optimizeForHighContrast(color, options = {}) {
  const {
    mode = HIGH_CONTRAST_MODES.ADAPTIVE,
    theme = 'light',
    force = false,
    context = null // 'text', 'background', 'border', etc.
  } = options;

  // Don't apply if high contrast is not needed
  if (!force && !shouldApplyHighContrast()) {
    return color;
  }

  let optimizedColor = color;

  if (context) {
    // Context-aware optimization
    switch (context) {
      case 'text':
        optimizedColor = getHighContrastColor(color, HIGH_CONTRAST_MODES.STANDARD, theme);
        break;
      case 'background':
        optimizedColor = theme === 'light' ? '#ffffff' : '#000000';
        break;
      case 'border':
        optimizedColor = HIGH_CONTRAST_PALETTE[theme].border;
        break;
      case 'accent':
        optimizedColor = HIGH_CONTRAST_PALETTE[theme].accent;
        break;
      default:
        optimizedColor = getHighContrastColor(color, mode, theme);
    }
  } else {
    optimizedColor = getHighContrastColor(color, mode, theme);
  }

  return optimizedColor;
}

/**
 * Get high contrast theme configuration
 */
export function getHighContrastTheme(theme = 'light') {
  return HIGH_CONTRAST_PALETTE[theme] || HIGH_CONTRAST_PALETTE.light;
}

/**
 * Validate high contrast implementation
 */
export function validateHighContrastImplementation(originalColors, highContrastColors, requiredContrast = 4.5) {
  const results = {};
  let allValid = true;

  Object.entries(originalColors).forEach(([key, original]) => {
    const highContrast = highContrastColors[key];

    if (!original || !highContrast) {
      results[key] = { valid: false, reason: 'Missing color data' };
      allValid = false;
      return;
    }

    // For text/background pairs, check contrast
    if (key.includes('text') || key.includes('Text')) {
      const backgroundKey = key.replace(/text|Text/, 'background').replace(/Text/, 'Background');
      const background = originalColors[backgroundKey] || highContrastColors[backgroundKey];

      if (background) {
        const contrast = getContrastRatio(
          parseColor(highContrast),
          parseColor(background)
        );

        const valid = contrast >= requiredContrast;
        results[key] = {
          valid,
          contrast: Math.round(contrast * 100) / 100,
          required: requiredContrast,
          improvement: contrast > getContrastRatio(parseColor(original), parseColor(originalColors[backgroundKey] || background))
        };

        if (!valid) allValid = false;
      } else {
        results[key] = { valid: true, reason: 'No background to compare' };
      }
    } else {
      results[key] = { valid: true, reason: 'Non-text element' };
    }
  });

  return {
    results,
    allValid,
    summary: {
      totalColors: Object.keys(results).length,
      validColors: Object.values(results).filter(r => r.valid).length,
      invalidColors: Object.values(results).filter(r => !r.valid).length
    }
  };
}

/**
 * Owl Retro - Theme Injector
 * Tema stillerini DOM'a uygular
 */

import { CSS_CLASSES, DATA_ATTRIBUTES, FONT_CONFIG, DEBUG, PERFORMANCE_CONFIG } from '../utils/constants.js';

// Store applied styles for reversal
const appliedStyles = new WeakMap();
let styleElement = null;
let currentThemeClass = null;

/**
 * Inject CSS file as style element
 */
export function injectStylesheet(cssText, id = 'owl-retro-styles') {
  // Remove existing if any
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create new style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = cssText;
  
  // Insert at the end of head for highest priority
  if (document.head) {
    document.head.appendChild(style);
  } else {
    // Fallback for early injection
    document.documentElement.appendChild(style);
  }
  
  return style;
}

/**
 * Apply theme class to HTML element
 */
export function applyThemeClass(mode) {
  const html = document.documentElement;
  
  // Remove existing theme classes
  html.classList.remove(CSS_CLASSES.THEME_LIGHT, CSS_CLASSES.THEME_DARK);
  
  // Add new theme class
  const themeClass = mode === 'dark' ? CSS_CLASSES.THEME_DARK : CSS_CLASSES.THEME_LIGHT;
  html.classList.add(CSS_CLASSES.ROOT_THEME, themeClass);
  currentThemeClass = themeClass;
  
  // Mark as processed
  html.setAttribute(DATA_ATTRIBUTES.THEME_APPLIED, mode);
}

/**
 * Remove theme classes
 */
export function removeThemeClass() {
  const html = document.documentElement;
  html.classList.remove(
    CSS_CLASSES.ROOT_THEME,
    CSS_CLASSES.THEME_LIGHT,
    CSS_CLASSES.THEME_DARK
  );
  html.removeAttribute(DATA_ATTRIBUTES.THEME_APPLIED);
  currentThemeClass = null;
}

/**
 * Apply monospace font
 */
export function applyMonospaceFont(enable = true) {
  const html = document.documentElement;
  
  if (enable) {
    html.classList.add(CSS_CLASSES.MONOSPACE);
  } else {
    html.classList.remove(CSS_CLASSES.MONOSPACE);
  }
}

/**
 * Apply patch plan to elements
 */
export async function applyPatchPlans(plans) {
  const startTime = performance.now();
  let applied = 0;
  
  for (const plan of plans) {
    if (!plan.element || !plan.styles) continue;
    
    // Store original styles
    if (!appliedStyles.has(plan.element)) {
      const originalStyles = {};
      for (const prop in plan.styles) {
        originalStyles[prop] = plan.element.style[prop] || '';
      }
      appliedStyles.set(plan.element, originalStyles);
    }
    
    // Apply new styles with high priority
    for (const [prop, value] of Object.entries(plan.styles)) {
      plan.element.style.setProperty(prop, value, 'important');
    }
    
    // Mark as processed
    plan.element.setAttribute(DATA_ATTRIBUTES.THEME_APPLIED, 'true');
    applied++;
    
    // Yield control periodically
    if (applied % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Check time budget
    if (performance.now() - startTime > PERFORMANCE_CONFIG.MAX_APPLY_TIME_MS) {
      if (DEBUG.LOG_PERFORMANCE) {
        console.log('Apply time budget exceeded, pausing');
      }
      // Schedule remaining work
      setTimeout(() => {
        applyPatchPlans(plans.slice(applied));
      }, 0);
      break;
    }
  }
  
  if (DEBUG.LOG_PERFORMANCE) {
    const elapsed = performance.now() - startTime;
    console.log(`Applied ${applied} patches in ${elapsed.toFixed(2)}ms`);
  }
  
  return applied;
}

/**
 * Revert all applied styles
 */
export function revertAllStyles() {
  const elements = document.querySelectorAll(`[${DATA_ATTRIBUTES.THEME_APPLIED}]`);
  
  elements.forEach(element => {
    // Restore original styles
    const original = appliedStyles.get(element);
    if (original) {
      for (const [prop, value] of Object.entries(original)) {
        if (value) {
          element.style.setProperty(prop, value);
        } else {
          element.style.removeProperty(prop);
        }
      }
      appliedStyles.delete(element);
    }
    
    // Remove marker attribute
    element.removeAttribute(DATA_ATTRIBUTES.THEME_APPLIED);
  });
  
  // Remove theme classes
  removeThemeClass();
  
  // Remove monospace font
  applyMonospaceFont(false);
}

/**
 * Create and inject dynamic style rules
 */
export function injectDynamicStyles(rules) {
  const id = 'owl-retro-dynamic';
  let style = document.getElementById(id);
  
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  
  style.textContent = rules;
  return style;
}

/**
 * Generate CSS rules from patch plans
 */
export function generateCSSFromPlans(plans) {
  const rules = new Map();
  
  plans.forEach(plan => {
    if (!plan.element || !plan.styles) return;
    
    // Try to create a selector for the element
    const selector = createSelectorForElement(plan.element);
    if (!selector) return;
    
    // Aggregate styles by selector
    if (!rules.has(selector)) {
      rules.set(selector, {});
    }
    
    Object.assign(rules.get(selector), plan.styles);
  });
  
  // Convert to CSS text
  let cssText = '';
  rules.forEach((styles, selector) => {
    const declarations = Object.entries(styles)
      .map(([prop, value]) => `${prop}: ${value} !important;`)
      .join('\n    ');
    
    cssText += `
  ${selector} {
    ${declarations}
  }`;
  });
  
  return cssText;
}

/**
 * Create a unique selector for an element
 */
function createSelectorForElement(element) {
  // Try ID first
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }
  
  // Try unique class combination
  if (element.classList.length > 0) {
    const classes = Array.from(element.classList)
      .filter(c => !c.startsWith('owl-'))
      .slice(0, 3)
      .map(c => `.${CSS.escape(c)}`)
      .join('');
    
    if (classes) {
      return `${element.tagName.toLowerCase()}${classes}`;
    }
  }
  
  // Use data attribute selector as fallback
  const uid = Math.random().toString(36).substr(2, 9);
  element.setAttribute('data-owl-uid', uid);
  return `[data-owl-uid="${uid}"]`;
}

/**
 * Check if theme is currently applied
 */
export function isThemeApplied() {
  return document.documentElement.classList.contains(CSS_CLASSES.ROOT_THEME);
}

/**
 * Get current theme mode
 */
export function getCurrentTheme() {
  if (document.documentElement.classList.contains(CSS_CLASSES.THEME_DARK)) {
    return 'dark';
  }
  if (document.documentElement.classList.contains(CSS_CLASSES.THEME_LIGHT)) {
    return 'light';
  }
  return null;
}
/**
 * Owl Retro - Reduced Motion Accessibility Module
 * Hareket azaltma desteği ve animasyon yönetimi
 */

/**
 * Reduced Motion Support
 */
export const MOTION_PREFERENCES = {
  FULL: 'full',           // Full animations allowed
  REDUCED: 'reduced',     // Reduced motion preferred
  NONE: 'none'           // No animations
};

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get current motion preference
 */
export function getMotionPreference(userPreference = null) {
  // User preference takes precedence
  if (userPreference) {
    return userPreference;
  }

  // Check system preference
  if (prefersReducedMotion()) {
    return MOTION_PREFERENCES.REDUCED;
  }

  return MOTION_PREFERENCES.FULL;
}

/**
 * Generate motion-safe CSS properties
 */
export function generateMotionSafeCSS(originalCSS, motionPreference = null) {
  const preference = motionPreference || getMotionPreference();

  if (preference === MOTION_PREFERENCES.FULL) {
    return originalCSS;
  }

  const motionSafeCSS = { ...originalCSS };

  // Remove or modify animation properties for reduced motion
  if (preference === MOTION_PREFERENCES.REDUCED || preference === MOTION_PREFERENCES.NONE) {
    // Remove transition properties
    delete motionSafeCSS.transition;
    delete motionSafeCSS.transitionDelay;
    delete motionSafeCSS.transitionDuration;
    delete motionSafeCSS.transitionProperty;
    delete motionSafeCSS.transitionTimingFunction;

    // Remove animation properties
    delete motionSafeCSS.animation;
    delete motionSafeCSS.animationDelay;
    delete motionSafeCSS.animationDuration;
    delete motionSafeCSS.animationFillMode;
    delete motionSafeCSS.animationIterationCount;
    delete motionSafeCSS.animationName;
    delete motionSafeCSS.animationPlayState;
    delete motionSafeCSS.animationTimingFunction;

    // Remove transform properties that might cause motion
    delete motionSafeCSS.transform;
    delete motionSafeCSS.transformOrigin;

    // Add reduced motion alternatives
    if (preference === MOTION_PREFERENCES.REDUCED) {
      // Keep opacity transitions but slow them down
      if (originalCSS.opacity !== undefined) {
        motionSafeCSS.transition = 'opacity 0.3s ease';
      }
    }
  }

  return motionSafeCSS;
}

/**
 * Apply reduced motion to CSS class
 */
export function applyReducedMotionToClass(className, motionPreference = null) {
  const preference = motionPreference || getMotionPreference();

  if (preference === MOTION_PREFERENCES.FULL) {
    return className;
  }

  // Add reduced motion class
  const motionClass = preference === MOTION_PREFERENCES.REDUCED ?
    'reduced-motion' : 'no-motion';

  return `${className} ${motionClass}`.trim();
}

/**
 * Generate CSS for motion preferences
 */
export function generateMotionPreferenceCSS() {
  return `
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    .reduced-motion,
    .reduced-motion *,
    .reduced-motion *::before,
    .reduced-motion *::after {
      animation-duration: 0.3s !important;
      animation-timing-function: ease !important;
      transition-duration: 0.2s !important;
      transition-timing-function: ease !important;
    }

    .no-motion,
    .no-motion *,
    .no-motion *::before,
    .no-motion *::after {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  `;
}

/**
 * Check if animation should be disabled
 */
export function shouldDisableAnimation(userPreference = null, animationType = null) {
  const preference = userPreference || getMotionPreference();

  if (preference === MOTION_PREFERENCES.NONE) {
    return true;
  }

  if (preference === MOTION_PREFERENCES.REDUCED) {
    // Disable certain types of animations even in reduced mode
    const disabledTypes = ['spin', 'bounce', 'shake', 'flash', 'pulse'];
    return animationType && disabledTypes.includes(animationType);
  }

  return false;
}

/**
 * Get motion-safe animation duration
 */
export function getMotionSafeDuration(originalDuration, userPreference = null) {
  const preference = userPreference || getMotionPreference();

  if (preference === MOTION_PREFERENCES.NONE) {
    return '0s';
  }

  if (preference === MOTION_PREFERENCES.REDUCED) {
    // Increase duration for reduced motion
    const duration = parseFloat(originalDuration);
    const unit = originalDuration.replace(/[0-9.]/g, '');
    return `${Math.max(duration * 1.5, 0.2)}${unit}`;
  }

  return originalDuration;
}

/**
 * Apply motion accessibility to element
 */
export function applyMotionAccessibility(element, options = {}) {
  if (!element || typeof element !== 'object') return;

  const {
    disableAnimations = false,
    reduceMotion = null,
    animationType = null
  } = options;

  const preference = reduceMotion || getMotionPreference();

  if (disableAnimations || shouldDisableAnimation(preference, animationType)) {
    // Disable animations on this element
    element.style.setProperty('animation', 'none', 'important');
    element.style.setProperty('transition', 'none', 'important');
  } else if (preference === MOTION_PREFERENCES.REDUCED) {
    // Apply reduced motion styles
    element.classList.add('reduced-motion');
  }
}

/**
 * Create accessibility-aware animation
 */
export function createAccessibleAnimation(keyframes, options = {}) {
  const {
    duration = '0.3s',
    timing = 'ease',
    userPreference = null,
    disabledTypes = []
  } = options;

  const preference = userPreference || getMotionPreference();

  // Check if animation should be disabled
  if (preference === MOTION_PREFERENCES.NONE) {
    return {
      animation: 'none',
      keyframes: null
    };
  }

  // Check if this animation type is disabled in reduced mode
  if (preference === MOTION_PREFERENCES.REDUCED && disabledTypes.includes(options.type)) {
    return {
      animation: 'none',
      keyframes: null
    };
  }

  const safeDuration = getMotionSafeDuration(duration, preference);
  const safeTiming = preference === MOTION_PREFERENCES.REDUCED ? 'ease' : timing;

  return {
    animation: `${safeDuration} ${safeTiming}`,
    keyframes: keyframes,
    preference: preference
  };
}

/**
 * Monitor motion preference changes
 */
export function monitorMotionPreference(callback) {
  if (typeof window === 'undefined') return null;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handleChange = (event) => {
    callback(event.matches ? MOTION_PREFERENCES.REDUCED : MOTION_PREFERENCES.FULL);
  };

  // Add listener (modern browsers)
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }

  // Return cleanup function
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.removeListener(handleChange);
    }
  };
}

/**
 * Validate motion accessibility implementation
 */
export function validateMotionAccessibility(elements, options = {}) {
  const {
    checkAnimations = true,
    checkTransitions = true,
    checkTransforms = true,
    userPreference = null
  } = options;

  const preference = userPreference || getMotionPreference();
  const results = {};
  let allAccessible = true;

  elements.forEach((element, index) => {
    if (!element || !element.style) {
      results[index] = { valid: false, reason: 'Invalid element' };
      allAccessible = false;
      return;
    }

    const computedStyle = window.getComputedStyle(element);
    let valid = true;
    const issues = [];

    // Check animations
    if (checkAnimations && computedStyle.animationName !== 'none') {
      if (preference === MOTION_PREFERENCES.NONE) {
        valid = false;
        issues.push('Animation present when motion disabled');
      } else if (preference === MOTION_PREFERENCES.REDUCED) {
        const duration = parseFloat(computedStyle.animationDuration);
        if (duration < 0.2) {
          issues.push('Animation too fast for reduced motion');
        }
      }
    }

    // Check transitions
    if (checkTransitions && computedStyle.transitionProperty !== 'none') {
      if (preference === MOTION_PREFERENCES.NONE) {
        valid = false;
        issues.push('Transition present when motion disabled');
      } else if (preference === MOTION_PREFERENCES.REDUCED) {
        const duration = parseFloat(computedStyle.transitionDuration);
        if (duration < 0.2) {
          issues.push('Transition too fast for reduced motion');
        }
      }
    }

    // Check transforms
    if (checkTransforms && computedStyle.transform !== 'none') {
      if (preference === MOTION_PREFERENCES.NONE) {
        valid = false;
        issues.push('Transform present when motion disabled');
      }
    }

    results[index] = {
      valid,
      issues,
      preference,
      element: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ')[0] : '')
    };

    if (!valid) allAccessible = false;
  });

  return {
    results,
    allAccessible,
    summary: {
      totalElements: elements.length,
      accessibleElements: Object.values(results).filter(r => r.valid).length,
      inaccessibleElements: Object.values(results).filter(r => !r.valid).length,
      preference
    }
  };
}

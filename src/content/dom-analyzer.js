/**
 * Owl Retro - DOM Analyzer
 * DOM'u tarayıp renk değişiklik planı oluşturur
 */

import { PERFORMANCE_CONFIG, CSS_CLASSES, DATA_ATTRIBUTES, DEBUG } from '../utils/constants.js';
import { mapToRetroPalette, shouldPreserveColor } from '../utils/color-utils.js';

// Skip these element types
const SKIP_ELEMENTS = new Set([
  'SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 
  'BR', 'HR', 'WBR', 'AREA', 'SOURCE', 'TRACK'
]);

const SKIP_SELECTORS = [
  'svg', 'canvas', 'video', 'img', 'iframe',
  'embed', 'object', 'picture', '[contenteditable]',
  '.owl-skip', `[${DATA_ATTRIBUTES.THEME_APPLIED}]`
].join(',');

/**
 * Check if element is visible
 */
function isVisible(element) {
  if (!element.offsetParent) return false;
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

/**
 * Create a patch plan for an element
 */
function createPatchPlan(element, mode, intensity) {
  const computed = window.getComputedStyle(element);
  const plan = {
    element,
    styles: {}
  };

  // Check color properties
  const colorProps = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color'
  ];

  colorProps.forEach(prop => {
    const value = computed[prop];
    if (value && !shouldPreserveColor(value)) {
      const mappedColor = mapToRetroPalette(value, mode, intensity);
      if (mappedColor !== value) {
        plan.styles[prop] = mappedColor;
      }
    }
  });

  // Check background image for gradients
  const bgImage = computed['background-image'];
  if (bgImage && bgImage.includes('gradient')) {
    // For now, skip gradients to preserve layouts
    // Future: Parse and map gradient colors
  }

  return Object.keys(plan.styles).length > 0 ? plan : null;
}

/**
 * Analyze DOM and create patch plans
 */
export async function analyzeDOMChunk(rootElement, mode, intensity, options = {}) {
  const {
    maxElements = PERFORMANCE_CONFIG.CHUNK_SIZE,
    skipProcessed = true,
    visibleOnly = true
  } = options;

  const startTime = performance.now();
  const patchPlans = [];
  const processedElements = new WeakSet();

  // Create tree walker
  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        // Skip certain element types
        if (SKIP_ELEMENTS.has(node.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip if matches skip selectors
        if (node.matches && node.matches(SKIP_SELECTORS)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Skip if already processed
        if (skipProcessed && processedElements.has(node)) {
          return NodeFilter.FILTER_SKIP;
        }
        
        // Skip if not visible
        if (visibleOnly && !isVisible(node)) {
          return NodeFilter.FILTER_SKIP;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let element;
  let count = 0;

  while ((element = walker.nextNode()) && count < maxElements) {
    // Check time budget
    if (performance.now() - startTime > PERFORMANCE_CONFIG.MAX_SCAN_TIME_MS) {
      if (DEBUG.LOG_PERFORMANCE) {
        console.log('DOM scan time budget exceeded, stopping');
      }
      break;
    }

    processedElements.add(element);
    
    const plan = createPatchPlan(element, mode, intensity);
    if (plan) {
      patchPlans.push(plan);
    }
    
    count++;
  }

  if (DEBUG.LOG_PERFORMANCE) {
    const elapsed = performance.now() - startTime;
    console.log(`Analyzed ${count} elements in ${elapsed.toFixed(2)}ms`);
  }

  return {
    plans: patchPlans,
    elementsProcessed: count,
    hasMore: walker.nextNode() !== null
  };
}

/**
 * Analyze full DOM with time slicing
 */
export async function analyzeFullDOM(mode, intensity) {
  const chunks = [];
  let hasMore = true;
  let totalProcessed = 0;
  
  const startTime = performance.now();

  while (hasMore) {
    // Use requestIdleCallback if available
    if (window.requestIdleCallback) {
      await new Promise(resolve => {
        window.requestIdleCallback(() => resolve(), {
          timeout: PERFORMANCE_CONFIG.IDLE_CALLBACK_TIMEOUT
        });
      });
    } else {
      // Fallback to setTimeout
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const result = await analyzeDOMChunk(document.body, mode, intensity, {
      skipProcessed: true,
      visibleOnly: true
    });

    chunks.push(...result.plans);
    totalProcessed += result.elementsProcessed;
    hasMore = result.hasMore;

    // Check total time budget
    if (performance.now() - startTime > PERFORMANCE_CONFIG.MAX_SCAN_TIME_MS * 3) {
      if (DEBUG.LOG_PERFORMANCE) {
        console.log('Total scan time exceeded, stopping');
      }
      break;
    }
  }

  if (DEBUG.LOG_PERFORMANCE) {
    const elapsed = performance.now() - startTime;
    console.log(`Full DOM analysis: ${totalProcessed} elements in ${elapsed.toFixed(2)}ms`);
  }

  return chunks;
}

/**
 * Analyze specific elements (for mutations)
 */
export function analyzeElements(elements, mode, intensity) {
  const plans = [];
  
  elements.forEach(element => {
    if (element.nodeType !== Node.ELEMENT_NODE) return;
    if (SKIP_ELEMENTS.has(element.tagName)) return;
    if (element.matches && element.matches(SKIP_SELECTORS)) return;
    
    const plan = createPatchPlan(element, mode, intensity);
    if (plan) {
      plans.push(plan);
    }
    
    // Also check children
    const children = element.querySelectorAll('*');
    children.forEach(child => {
      if (SKIP_ELEMENTS.has(child.tagName)) return;
      if (child.matches && child.matches(SKIP_SELECTORS)) return;
      
      const childPlan = createPatchPlan(child, mode, intensity);
      if (childPlan) {
        plans.push(childPlan);
      }
    });
  });
  
  return plans;
}
/**
 * Owl Retro - Mutation Handler
 * DOM değişikliklerini ve SPA navigasyonunu yönetir
 */

import { PERFORMANCE_CONFIG, DEBUG } from '../utils/constants.js';
import { analyzeElements } from './dom-analyzer.js';
import { applyPatchPlans } from './theme-injector.js';

let observer = null;
let pendingElements = new Set();
let scheduled = false;

function scheduleFlush(mode, intensity) {
  if (scheduled) return;
  scheduled = true;

  requestAnimationFrame(async () => {
    if (pendingElements.size === 0) {
      scheduled = false;
      return;
    }

    const elements = Array.from(pendingElements).slice(0, PERFORMANCE_CONFIG.MUTATION_BATCH_SIZE);
    pendingElements.clear();
    scheduled = false;

    const plans = analyzeElements(elements, mode, intensity);
    await applyPatchPlans(plans);
  });
}

export function startMutationObserver(mode, intensity) {
  if (observer) return;

  observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            pendingElements.add(node);
          }
        });
      }
      if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
        pendingElements.add(mutation.target);
      }
    });

    scheduleFlush(mode, intensity);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  if (DEBUG.LOG_MUTATIONS) {
    console.log('MutationObserver started');
  }
}

export function stopMutationObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// SPA navigation handling
let originalPushState = null;
let originalReplaceState = null;

export function hookHistoryNavigation(onNavigate) {
  if (originalPushState || originalReplaceState) return;

  originalPushState = history.pushState;
  originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const ret = originalPushState.apply(this, args);
    window.dispatchEvent(new Event('owl-history-changed'));
    return ret;
  };

  history.replaceState = function (...args) {
    const ret = originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event('owl-history-changed'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('owl-history-changed'));
  });

  window.addEventListener('owl-history-changed', () => {
    onNavigate();
  });
}

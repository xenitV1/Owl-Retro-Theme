/**
 * 🦉 Owl Retro Theme - Major Platforms Site Optimizations (2024-2025)
 *
 * Major web platformları için optimize edilmiş tema uygulama stratejileri.
 * YouTube, Twitter/X, Facebook, LinkedIn, GitHub, Reddit, Instagram için
 * Shadow DOM, React/Angular components ve iframe handling.
 */

import { detectFramework } from './spa-detector.js';
import { applyRetroTheme } from './color-utils.js';
import { createMutationObserver } from './mutation-handler.js';
import {
  optimizeShopify,
  optimizeWooCommerce,
  optimizeMagento,
  optimizeCustomEcommerce,
  optimizeWordPress,
  optimizeDrupal,
  optimizeJoomla,
  optimizeHeadlessCMS
} from './site-specific-ecommerce-cms.js';

// ========== MAJOR PLATFORMS ========== //

/**
 * YouTube Platform Optimization (2024-2025)
 * Shadow DOM ve iframe handling ile video player ve UI elementleri
 */
export function optimizeYouTube() {
  const selectors = {
    videoContainer: '#movie_player',
    controls: '.ytp-chrome-bottom',
    sidebar: '#secondary',
    comments: '#comments',
    playerShadow: 'ytd-player[context="WEB_PLAYER_CONTEXT_CONFIG_ID_KEVLAR_WATCH"]'
  };

  // Shadow DOM traversal için advanced selector
  const shadowObserver = createMutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Shadow root detection
          if (node.shadowRoot) {
            applyRetroTheme(node.shadowRoot);
          }
          // Player specific styling
          if (node.matches && node.matches(selectors.playerShadow)) {
            optimizeYouTubePlayer(node);
          }
        }
      });
    });
  });

  // YouTube player optimization
  function optimizeYouTubePlayer(playerElement) {
    const player = playerElement.querySelector('#movie_player');
    if (player) {
      // Custom CSS injection for player controls
      const style = document.createElement('style');
      style.textContent = `
        .ytp-chrome-bottom { background: var(--retro-dark-bg) !important; }
        .ytp-progress-bar { background: var(--retro-accent) !important; }
        .ytp-scrubber-button { background: var(--retro-primary) !important; }
      `;
      player.shadowRoot.appendChild(style);
    }
  }

  // Initialize observers
  shadowObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  return { selectors, shadowObserver };
}

/**
 * Twitter/X Platform Optimization (2024-2025)
 * React components ve dynamic content handling
 */
export function optimizeTwitter() {
  const selectors = {
    timeline: '[data-testid="primaryColumn"]',
    sidebar: '[data-testid="sidebarColumn"]',
    tweet: '[data-testid="Tweet-User-Text"]',
    profile: '[data-testid="User-Name"]',
    searchBox: '[data-testid="SearchBox_Search_Input"]'
  };

  // React component detection ve styling
  function applyTwitterStyling() {
    // Dynamic class detection for React components
    const reactRoots = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
    reactRoots.forEach(root => applyRetroTheme(root));

    // Specific Twitter components
    Object.values(selectors).forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.setProperty('--twitter-bg', 'var(--retro-dark-bg)');
        el.style.setProperty('--twitter-text', 'var(--retro-light-text)');
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyTwitterStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-testid']
  });

  return { selectors, observer };
}

/**
 * Facebook Platform Optimization (2024-2025)
 * React components ve complex UI handling
 */
export function optimizeFacebook() {
  const selectors = {
    feed: '[data-pagelet="FeedUnit"]',
    sidebar: '[data-pagelet="LeftRail"]',
    chat: '[data-pagelet="ChatTab"]',
    story: '[data-pagelet="StoriesTray"]',
    header: '[data-pagelet="ProfileComposer"]'
  };

  // Facebook specific React component handling
  function applyFacebookStyling() {
    // Facebook's complex nested structure
    const reactComponents = document.querySelectorAll('[data-visualcompletion]');
    reactComponents.forEach(component => {
      if (component.dataset.visualcompletion === 'loading-state') {
        return; // Skip loading states
      }
      applyRetroTheme(component);
    });

    // Specific Facebook UI elements
    Object.values(selectors).forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.backgroundColor = 'var(--retro-dark-bg)';
        el.style.color = 'var(--retro-light-text)';
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyFacebookStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-pagelet', 'data-visualcompletion']
  });

  return { selectors, observer };
}

/**
 * LinkedIn Platform Optimization (2024-2025)
 * Angular components ve professional UI handling
 */
export function optimizeLinkedIn() {
  const selectors = {
    feed: '[data-control-name="feed"]',
    sidebar: '[data-control-name="sidebar"]',
    profile: '[data-control-name="profile"]',
    messaging: '[data-control-name="messaging"]',
    search: '[data-control-name="search"]'
  };

  // Angular component detection
  function applyLinkedInStyling() {
    // Angular directives ve components
    const angularElements = document.querySelectorAll('[ng-version], [data-control-name]');
    angularElements.forEach(element => applyRetroTheme(element));

    // LinkedIn specific styling
    Object.values(selectors).forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.setProperty('--linkedin-blue', 'var(--retro-accent)');
        el.style.setProperty('--linkedin-bg', 'var(--retro-dark-bg)');
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyLinkedInStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-control-name', 'ng-version']
  });

  return { selectors, observer };
}

/**
 * GitHub Platform Optimization (2024-2025)
 * Vanilla JS + custom elements handling
 */
export function optimizeGitHub() {
  const selectors = {
    repo: '.repository-content',
    sidebar: '.Layout-sidebar',
    header: '.AppHeader',
    code: '.highlight',
    issues: '.js-issue-row',
    pr: '.js-pull-request-row'
  };

  // GitHub's custom elements ve vanilla JS
  function applyGitHubStyling() {
    // GitHub's web components
    const customElements = document.querySelectorAll('github-repo-card, github-user-card, github-issue-item');
    customElements.forEach(element => applyRetroTheme(element));

    // Code highlighting
    const codeBlocks = document.querySelectorAll('.highlight');
    codeBlocks.forEach(block => {
      block.style.backgroundColor = 'var(--retro-code-bg)';
      block.style.color = 'var(--retro-code-text)';
    });

    // Repository specific styling
    Object.values(selectors).forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.backgroundColor = 'var(--retro-dark-bg)';
        el.style.color = 'var(--retro-light-text)';
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyGitHubStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-hydro-click']
  });

  return { selectors, observer };
}

/**
 * Reddit Platform Optimization (2024-2025)
 * React components ve community-driven content
 */
export function optimizeReddit() {
  const selectors = {
    post: '[data-testid="post-container"]',
    sidebar: '[data-testid="sidebar"]',
    header: '[data-testid="header"]',
    comment: '[data-testid="comment"]',
    subreddit: '[data-testid="subreddit-link"]'
  };

  // Reddit's React component structure
  function applyRedditStyling() {
    // Reddit's specific data attributes
    const redditElements = document.querySelectorAll('[data-testid], [data-click-id]');
    redditElements.forEach(element => applyRetroTheme(element));

    // Subreddit specific colors
    const subredditElements = document.querySelectorAll('[data-click-id="subreddit"]');
    subredditElements.forEach(el => {
      el.style.setProperty('--reddit-orange', 'var(--retro-accent)');
    });

    // Post containers
    Object.values(selectors).forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.backgroundColor = 'var(--retro-dark-bg)';
        el.style.borderColor = 'var(--retro-border)';
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyRedditStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-testid', 'data-click-id']
  });

  return { selectors, observer };
}

/**
 * Instagram Platform Optimization (2024-2025)
 * React components ve media-heavy content
 */
export function optimizeInstagram() {
  const selectors = {
    feed: '[data-testid="user-feed"]',
    story: '[data-testid="story-ring"]',
    modal: '[role="dialog"]',
    sidebar: '[data-testid="sidebar"]',
    header: '[data-testid="header"]'
  };

  // Instagram's media-focused React components
  function applyInstagramStyling() {
    // Instagram's specific structure
    const instagramElements = document.querySelectorAll('[data-testid], [role="dialog"]');
    instagramElements.forEach(element => {
      // Skip video/audio elements
      if (!element.querySelector('video, audio')) {
        applyRetroTheme(element);
      }
    });

    // Media container specific handling
    const mediaContainers = document.querySelectorAll('[data-visualcompletion="media-vc"]');
    mediaContainers.forEach(container => {
      // Preserve media appearance while styling containers
      container.style.backgroundColor = 'var(--retro-dark-bg)';
    });

    // Story rings and highlights
    const storyRings = document.querySelectorAll(selectors.story);
    storyRings.forEach(ring => {
      ring.style.borderColor = 'var(--retro-accent)';
    });
  }

  const observer = createMutationObserver(() => {
    applyInstagramStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-testid', 'data-visualcompletion']
  });

  return { selectors, observer };
}

// ========== MAIN OPTIMIZATION ENGINE ========== //

/**
 * Site-Specific Optimization Engine (2024-2025)
 * Otomatik platform detection ve optimization uygulama
 */
export class SiteSpecificOptimizer {
  constructor() {
    this.activeOptimizations = new Map();
    this.observers = new Set();
  }

  /**
   * Otomatik platform detection ve optimization başlatma
   */
  async initialize() {
    const hostname = window.location.hostname.toLowerCase();
    const framework = await detectFramework();

    // Platform-specific optimizations
    if (hostname.includes('youtube.com')) {
      this.applyOptimization('youtube', optimizeYouTube);
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      this.applyOptimization('twitter', optimizeTwitter);
    } else if (hostname.includes('facebook.com')) {
      this.applyOptimization('facebook', optimizeFacebook);
    } else if (hostname.includes('linkedin.com')) {
      this.applyOptimization('linkedin', optimizeLinkedIn);
    } else if (hostname.includes('github.com')) {
      this.applyOptimization('github', optimizeGitHub);
    } else if (hostname.includes('reddit.com')) {
      this.applyOptimization('reddit', optimizeReddit);
    } else if (hostname.includes('instagram.com')) {
      this.applyOptimization('instagram', optimizeInstagram);
    }

    // E-commerce platform detection
    else if (this.detectShopify()) {
      this.applyOptimization('shopify', () => optimizeShopify());
    } else if (this.detectWooCommerce()) {
      this.applyOptimization('woocommerce', () => optimizeWooCommerce());
    } else if (this.detectMagento()) {
      this.applyOptimization('magento', () => optimizeMagento());
    } else if (this.detectEcommerce()) {
      this.applyOptimization('custom-ecommerce', () => optimizeCustomEcommerce());
    }

    // CMS platform detection
    else if (this.detectWordPress()) {
      this.applyOptimization('wordpress', () => optimizeWordPress());
    } else if (this.detectDrupal()) {
      this.applyOptimization('drupal', () => optimizeDrupal());
    } else if (this.detectJoomla()) {
      this.applyOptimization('joomla', () => optimizeJoomla());
    } else if (this.detectHeadlessCMS()) {
      this.applyOptimization('headless-cms', () => optimizeHeadlessCMS());
    }
  }

  /**
   * Optimization uygulama helper
   */
  applyOptimization(platform, optimizerFunction) {
    try {
      const result = optimizerFunction();
      this.activeOptimizations.set(platform, result);
      if (result.observer) {
        this.observers.add(result.observer);
      }
      console.log(`🦉 Owl Retro: ${platform} optimization applied`);
    } catch (error) {
      console.warn(`🦉 Owl Retro: Failed to apply ${platform} optimization:`, error);
    }
  }

  /**
   * Platform detection helpers
   */
  detectShopify() {
    return !!(document.querySelector('[data-shopify], .shopify-section') ||
              window.Shopify || document.body.classList.contains('shopify'));
  }

  detectWooCommerce() {
    return !!(document.querySelector('.woocommerce') || window.woocommerce_params);
  }

  detectMagento() {
    return !!(document.querySelector('[data-bind]') || window.Magento);
  }

  detectEcommerce() {
    return !!(document.querySelector('[data-product], .product') &&
              document.querySelector('[data-cart], .cart'));
  }

  detectWordPress() {
    return !!(document.querySelector('#wpadminbar') || window.wp || document.body.classList.contains('wp-site'));
  }

  detectDrupal() {
    return !!(document.querySelector('[data-drupal-selector]') || window.Drupal);
  }

  detectJoomla() {
    return !!(document.querySelector('[data-component]') || window.Joomla);
  }

  detectHeadlessCMS() {
    return !!(document.querySelector('[data-content-id], [data-collection-id]') &&
              document.querySelector('[data-api-endpoint]'));
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.activeOptimizations.clear();
  }
}

// Export singleton instance
export const siteOptimizer = new SiteSpecificOptimizer();

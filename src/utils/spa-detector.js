/**
 * Owl Retro Theme - SPA Detection Module
 * Tek dosya, tek modül kuralına uygun SPA tespiti ve desteği (2024-2025)
 * Modüler SPA routing desteği - React, Vue.js, Angular, Generic SPA
 */

(function() {
  'use strict';

  // SPA Detection Module - 2024-2025 Modern SPA Detection
  class SPADetector {
    constructor() {
      this.detectedFrameworks = new Set();
      this.routingHistory = [];
      this.isInitialized = false;
      this.currentFramework = null;
      this.routingObserver = null;
      this.frameworkConfigs = {
        react: {
          detection: this.detectReact.bind(this),
          router: this.setupReactRouter.bind(this),
          version: null
        },
        vue: {
          detection: this.detectVue.bind(this),
          router: this.setupVueRouter.bind(this),
          version: null
        },
        angular: {
          detection: this.detectAngular.bind(this),
          router: this.setupAngularRouter.bind(this),
          version: null
        },
        generic: {
          detection: this.detectGenericSPA.bind(this),
          router: this.setupGenericRouter.bind(this),
          version: null
        }
      };
    }

    /**
     * Initialize SPA detection and monitoring
     */
    async initialize() {
      if (this.isInitialized) return;

      console.log('Owl Retro: Initializing SPA detection module...');

      try {
        // Detect frameworks on page load
        await this.detectFrameworks();

        // Setup routing monitoring
        this.setupRoutingMonitoring();

        // Setup framework-specific integrations
        await this.setupFrameworkIntegrations();

        this.isInitialized = true;
        console.log('Owl Retro: SPA detection initialized', {
          frameworks: Array.from(this.detectedFrameworks),
          current: this.currentFramework
        });

      } catch (error) {
        console.error('Owl Retro: SPA detection initialization failed:', error);
      }
    }

    /**
     * Detect various SPA frameworks (2024-2025 versions)
     */
    async detectFrameworks() {
      const detectionPromises = Object.entries(this.frameworkConfigs).map(
        async ([framework, config]) => {
          try {
            const detected = await config.detection();
            if (detected) {
              this.detectedFrameworks.add(framework);
              return framework;
            }
          } catch (error) {
            console.debug(`Owl Retro: ${framework} detection failed:`, error);
          }
          return null;
        }
      );

      const results = await Promise.all(detectionPromises);
      const detected = results.filter(Boolean);

      // Set primary framework (first detected)
      if (detected.length > 0) {
        this.currentFramework = detected[0];
      }
    }

    /**
     * React Detection - Modern React 18+ support
     */
    async detectReact() {
      // Check for React DevTools global hook (most reliable)
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        this.frameworkConfigs.react.version = this.getReactVersion();
        return true;
      }

      // Check for React DOM
      if (window.React && window.ReactDOM) {
        this.frameworkConfigs.react.version = this.getReactVersion();
        return true;
      }

      // Check for React root containers (React 18+)
      const reactRoots = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
      if (reactRoots.length > 0) {
        return true;
      }

      // Check for React Fiber nodes
      const fiberNodes = document.querySelectorAll('*');
      for (const node of fiberNodes) {
        if (node._reactInternalInstance || node._reactInternals) {
          return true;
        }
      }

      return false;
    }

    /**
     * Vue.js Detection - Vue 3+ support with Composition API
     */
    async detectVue() {
      // Check for Vue DevTools
      if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
        this.frameworkConfigs.vue.version = this.getVueVersion();
        return true;
      }

      // Check for Vue global object
      if (window.Vue) {
        this.frameworkConfigs.vue.version = this.getVueVersion();
        return true;
      }

      // Check for Vue instances on page
      const vueElements = document.querySelectorAll('[data-v-]');
      if (vueElements.length > 0) {
        return true;
      }

      // Check for Vue components
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.__vue__ || el.__vue_app__) {
          return true;
        }
      }

      return false;
    }

    /**
     * Angular Detection - Modern Angular support
     */
    async detectAngular() {
      // Check for Angular DevTools
      if (window.ng) {
        this.frameworkConfigs.angular.version = this.getAngularVersion();
        return true;
      }

      // Check for Angular injector
      if (window.getAllAngularTestabilities || window.ngGetInjector) {
        return true;
      }

      // Check for Angular components
      const angularElements = document.querySelectorAll('[ng-app], [ng-controller], [ng-model]');
      if (angularElements.length > 0) {
        return true;
      }

      // Check for Angular Ivy (modern Angular)
      const ivyElements = document.querySelectorAll('[ng-i]');
      if (ivyElements.length > 0) {
        return true;
      }

      return false;
    }

    /**
     * Generic SPA Detection - History API based
     */
    async detectGenericSPA() {
      // Check for History API usage (most SPAs use this)
      if (window.history && window.history.pushState) {
        // Look for common SPA patterns
        const spaIndicators = [
          // History API interception
          window.history.pushState.toString().includes('native') === false,
          // Hash routing
          window.location.hash && window.location.hash.length > 1,
          // No full page reloads (check if we're in an SPA)
          this.hasSPAPatterns()
        ];

        return spaIndicators.some(indicator => indicator);
      }

      return false;
    }

    /**
     * Check for SPA patterns in the current page
     */
    hasSPAPatterns() {
      // Check for common SPA frameworks/libraries
      const spaLibraries = [
        'react', 'vue', 'angular', 'svelte', 'ember',
        'backbone', 'marionette', 'mithril', 'riot'
      ];

      const scripts = document.querySelectorAll('script[src]');
      for (const script of scripts) {
        const src = script.src.toLowerCase();
        if (spaLibraries.some(lib => src.includes(lib))) {
          return true;
        }
      }

      return false;
    }

    /**
     * Setup routing monitoring for all frameworks
     */
    setupRoutingMonitoring() {
      // Monitor History API changes
      this.setupHistoryMonitoring();

      // Monitor Hash changes
      this.setupHashMonitoring();

      // Monitor PopState events
      this.setupPopStateMonitoring();
    }

    /**
     * Setup History API monitoring
     */
    setupHistoryMonitoring() {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.onRouteChange('pushState', args[2]);
      };

      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        this.onRouteChange('replaceState', args[2]);
      };
    }

    /**
     * Setup Hash change monitoring
     */
    setupHashMonitoring() {
      window.addEventListener('hashchange', (event) => {
        this.onRouteChange('hashchange', event.newURL);
      });
    }

    /**
     * Setup PopState event monitoring
     */
    setupPopStateMonitoring() {
      window.addEventListener('popstate', (event) => {
        this.onRouteChange('popstate', window.location.href);
      });
    }

    /**
     * Handle route changes
     */
    onRouteChange(type, url) {
      const routeInfo = {
        type,
        url,
        timestamp: Date.now(),
        framework: this.currentFramework
      };

      this.routingHistory.push(routeInfo);

      // Limit history size
      if (this.routingHistory.length > 100) {
        this.routingHistory = this.routingHistory.slice(-50);
      }

      console.log('Owl Retro: Route changed', routeInfo);

      // Trigger theme re-application for new route
      if (window.OwlRetroContentScript) {
        window.OwlRetroContentScript.handleRouteChange(routeInfo);
      }
    }

    /**
     * Setup framework-specific integrations
     */
    async setupFrameworkIntegrations() {
      if (!this.currentFramework) return;

      const config = this.frameworkConfigs[this.currentFramework];
      if (config && config.router) {
        try {
          await config.router();
          console.log(`Owl Retro: ${this.currentFramework} router integration setup`);
        } catch (error) {
          console.error(`Owl Retro: ${this.currentFramework} router setup failed:`, error);
        }
      }
    }

    /**
     * Setup React Router integration (React Router v6+)
     */
    async setupReactRouter() {
      // React Router v6+ uses a different approach
      // Monitor for router context changes
      this.setupReactRouterMonitoring();
    }

    /**
     * Setup Vue Router integration (Vue Router 4+)
     */
    async setupVueRouter() {
      // Vue Router 4+ integration
      this.setupVueRouterMonitoring();
    }

    /**
     * Setup Angular Router integration
     */
    async setupAngularRouter() {
      // Angular Router integration
      this.setupAngularRouterMonitoring();
    }

    /**
     * Setup Generic SPA router monitoring
     */
    async setupGenericRouter() {
      // Generic router monitoring is already setup in routing monitoring
      console.log('Owl Retro: Generic SPA router monitoring active');
    }

    /**
     * React Router monitoring implementation
     */
    setupReactRouterMonitoring() {
      // React Router v6+ uses useLocation hook internally
      // We monitor for location changes through mutation observer
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if this is a route change
            const addedElements = Array.from(mutation.addedNodes);
            if (addedElements.some(node =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node.hasAttribute('data-react-router') || node.classList?.contains('react-router'))
            )) {
              this.onRouteChange('react-router', window.location.href);
              break;
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.routingObserver = observer;
    }

    /**
     * Vue Router monitoring implementation
     */
    setupVueRouterMonitoring() {
      // Vue Router 4+ monitoring
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedElements = Array.from(mutation.addedNodes);
            if (addedElements.some(node =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node.hasAttribute('data-vue-router') || node.__vue_app__)
            )) {
              this.onRouteChange('vue-router', window.location.href);
              break;
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.routingObserver = observer;
    }

    /**
     * Angular Router monitoring implementation
     */
    setupAngularRouterMonitoring() {
      // Angular Router monitoring
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedElements = Array.from(mutation.addedNodes);
            if (addedElements.some(node =>
              node.nodeType === Node.ELEMENT_NODE &&
              node.hasAttribute('ng-view') || node.hasAttribute('router-outlet')
            )) {
              this.onRouteChange('angular-router', window.location.href);
              break;
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      this.routingObserver = observer;
    }

    /**
     * Get React version
     */
    getReactVersion() {
      try {
        if (window.React && window.React.version) {
          return window.React.version;
        }
        return 'unknown';
      } catch (error) {
        return 'unknown';
      }
    }

    /**
     * Get Vue version
     */
    getVueVersion() {
      try {
        if (window.Vue) {
          return window.Vue.version;
        }
        return 'unknown';
      } catch (error) {
        return 'unknown';
      }
    }

    /**
     * Get Angular version
     */
    getAngularVersion() {
      try {
        if (window.ng && window.ng.version) {
          return window.ng.version;
        }
        return 'unknown';
      } catch (error) {
        return 'unknown';
      }
    }

    /**
     * Get current SPA information
     */
    getSPAInfo() {
      return {
        detectedFrameworks: Array.from(this.detectedFrameworks),
        currentFramework: this.currentFramework,
        routingHistory: this.routingHistory.slice(-10), // Last 10 routes
        isInitialized: this.isInitialized
      };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
      if (this.routingObserver) {
        this.routingObserver.disconnect();
        this.routingObserver = null;
      }

      // Restore original history methods
      if (window.history && window.history._owlRetroPushState) {
        window.history.pushState = window.history._owlRetroPushState;
      }
      if (window.history && window.history._owlRetroReplaceState) {
        window.history.replaceState = window.history._owlRetroReplaceState;
      }

      this.isInitialized = false;
      console.log('Owl Retro: SPA detector cleaned up');
    }
  }

  // Export for global access
  window.OwlRetroSPADetector = new SPADetector();

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.OwlRetroSPADetector.initialize();
    });
  } else {
    window.OwlRetroSPADetector.initialize();
  }

})();

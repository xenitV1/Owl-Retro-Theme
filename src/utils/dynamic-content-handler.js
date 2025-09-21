/**
 * Owl Retro Theme - Dynamic Content Handler Module
 * Gelişmiş dinamik içerik yönetimi (2024-2025)
 * Shadow DOM, Web Components, Lazy Loading, AJAX/Fetch monitoring
 */

(function() {
  'use strict';

  // Dynamic Content Handler Module - 2024-2025 Advanced Content Management
  class DynamicContentHandler {
    constructor() {
      this.isInitialized = false;
      this.observers = new Map();
      this.intersectionObserver = null;
      this.lazyElements = new WeakMap();
      this.ajaxMonitors = new Map();
      this.webSocketConnections = new Set();
      this.customElementRegistry = new Map();
      this.shadowRoots = new WeakSet();
      this.slottedContent = new WeakMap();
    }

    /**
     * Initialize dynamic content handling
     */
    async initialize() {
      if (this.isInitialized) return;

      console.log('Owl Retro: Initializing Dynamic Content Handler...');

      try {
        // Initialize all content handlers
        await Promise.all([
          this.initializeAdvancedMutationObserver(),
          this.initializeIntersectionObserver(),
          this.initializeAjaxMonitoring(),
          this.initializeWebSocketMonitoring(),
          this.initializeCustomElementSupport(),
          this.initializeLazyLoading()
        ]);

        this.isInitialized = true;
        console.log('Owl Retro: Dynamic Content Handler initialized');

      } catch (error) {
        console.error('Owl Retro: Dynamic Content Handler initialization failed:', error);
      }
    }

    /**
     * Advanced Mutation Observer with Shadow DOM support (2024-2025)
     */
    async initializeAdvancedMutationObserver() {
      // Main document observer
      const documentObserver = new MutationObserver((mutations) => {
        this.handleMutations(mutations, document);
      });

      documentObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'data-*'],
        characterData: true
      });

      this.observers.set('document', documentObserver);

      // Shadow DOM observer factory
      this.createShadowDOMObserver = (shadowRoot) => {
        if (this.shadowRoots.has(shadowRoot)) return;

        const shadowObserver = new MutationObserver((mutations) => {
          this.handleShadowMutations(mutations, shadowRoot);
        });

        shadowObserver.observe(shadowRoot, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class', 'data-*'],
          characterData: true
        });

        this.shadowRoots.add(shadowRoot);
        this.observers.set(shadowRoot, shadowObserver);
      };

      // Auto-attach to existing shadow roots
      this.attachToExistingShadowRoots();

      console.log('Owl Retro: Advanced Mutation Observer initialized');
    }

    /**
     * Handle mutations in main document
     */
    handleMutations(mutations, root) {
      const elementsToProcess = new Set();

      for (const mutation of mutations) {
        // Handle added nodes
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              elementsToProcess.add(node);
              this.handleElementAdded(node);
            }
          });
        }

        // Handle attribute changes
        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          elementsToProcess.add(mutation.target);
        }

        // Handle character data changes
        if (mutation.type === 'characterData' && mutation.target.parentNode) {
          elementsToProcess.add(mutation.target.parentNode);
        }
      }

      // Batch process elements
      if (elementsToProcess.size > 0) {
        this.batchProcessElements(Array.from(elementsToProcess));
      }
    }

    /**
     * Handle mutations in shadow DOM
     */
    handleShadowMutations(mutations, shadowRoot) {
      const elementsToProcess = new Set();

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              elementsToProcess.add(node);
              this.handleShadowElementAdded(node, shadowRoot);
            }
          });
        }

        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          elementsToProcess.add(mutation.target);
        }
      }

      if (elementsToProcess.size > 0) {
        this.batchProcessShadowElements(Array.from(elementsToProcess), shadowRoot);
      }
    }

    /**
     * Handle element added to main document
     */
    handleElementAdded(element) {
      // Check for shadow DOM
      if (element.shadowRoot) {
        this.createShadowDOMObserver(element.shadowRoot);
      }

      // Check for custom elements
      if (element.tagName && element.tagName.includes('-')) {
        this.handleCustomElement(element);
      }

      // Check for lazy loading candidates
      this.checkLazyLoadingCandidate(element);
    }

    /**
     * Handle element added to shadow DOM
     */
    handleShadowElementAdded(element, shadowRoot) {
      // Handle slotted content
      if (element.hasAttribute('slot') || element.slot) {
        this.handleSlottedContent(element, shadowRoot);
      }

      // Check for lazy loading in shadow DOM
      this.checkLazyLoadingCandidate(element);
    }

    /**
     * Attach observers to existing shadow roots
     */
    attachToExistingShadowRoots() {
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        if (element.shadowRoot) {
          this.createShadowDOMObserver(element.shadowRoot);
        }
      }
    }

    /**
     * Custom Element lifecycle monitoring (2024-2025)
     */
    handleCustomElement(element) {
      if (this.customElementRegistry.has(element.tagName)) return;

      this.customElementRegistry.set(element.tagName, {
        element,
        lifecycle: {
          connected: false,
          disconnected: false,
          adopted: false,
          attributeChanged: false
        }
      });

      // Monitor lifecycle callbacks
      this.monitorCustomElementLifecycle(element);
    }

    /**
     * Monitor Custom Element lifecycle
     */
    monitorCustomElementLifecycle(element) {
      // Override lifecycle methods if possible
      const originalConnectedCallback = element.connectedCallback;
      const originalDisconnectedCallback = element.disconnectedCallback;
      const originalAdoptedCallback = element.adoptedCallback;
      const originalAttributeChangedCallback = element.attributeChangedCallback;

      if (originalConnectedCallback) {
        element.connectedCallback = function() {
          originalConnectedCallback.call(this);
          // Trigger theme re-application for custom element
          if (window.OwlRetroContentScript) {
            setTimeout(() => window.OwlRetroContentScript.applyTheme(), 0);
          }
        };
      }

      if (originalDisconnectedCallback) {
        element.disconnectedCallback = function() {
          originalDisconnectedCallback.call(this);
        };
      }
    }

    /**
     * Handle slotted content in Shadow DOM
     */
    handleSlottedContent(element, shadowRoot) {
      if (!this.slottedContent.has(shadowRoot)) {
        this.slottedContent.set(shadowRoot, new Set());
      }

      this.slottedContent.get(shadowRoot).add(element);

      // Monitor slot changes
      this.monitorSlotChanges(shadowRoot);
    }

    /**
     * Monitor slot assignment changes
     */
    monitorSlotChanges(shadowRoot) {
      const slots = shadowRoot.querySelectorAll('slot');
      for (const slot of slots) {
        if (!slot._owlSlotObserver) {
          const slotObserver = new MutationObserver(() => {
            // Slot content changed, re-apply theme
            if (window.OwlRetroContentScript) {
              setTimeout(() => window.OwlRetroContentScript.applyTheme(), 0);
            }
          });

          slotObserver.observe(slot, {
            childList: true,
            subtree: true,
            attributes: true
          });

          slot._owlSlotObserver = slotObserver;
        }
      }
    }

    /**
     * Intersection Observer for lazy loading (2024-2025)
     */
    async initializeIntersectionObserver() {
      if (!('IntersectionObserver' in window) || typeof window.IntersectionObserver !== 'function') {
        console.debug('Owl Retro: IntersectionObserver not available, skipping lazy loading');
        return;
      }

      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.handleElementVisible(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1
        }
      );

      console.log('Owl Retro: Intersection Observer initialized');
    }

    /**
     * Check if element is a lazy loading candidate
     */
    checkLazyLoadingCandidate(element) {
      // Image lazy loading
      if (element.tagName === 'IMG' && element.hasAttribute('loading')) {
        this.setupImageLazyLoading(element);
      }

      // Infinite scroll detection
      if (this.isInfiniteScrollContainer(element)) {
        this.setupInfiniteScrollDetection(element);
      }

      // Virtual scrolling detection
      if (this.isVirtualScrollContainer(element)) {
        this.setupVirtualScrollDetection(element);
      }

      // Observe for intersection
      if (this.intersectionObserver && this.shouldObserveElement(element)) {
        this.intersectionObserver.observe(element);
      }
    }

    /**
     * Setup image lazy loading
     */
    setupImageLazyLoading(img) {
      if (img.hasAttribute('data-src') && !img.src) {
        this.lazyElements.set(img, {
          type: 'image',
          originalSrc: img.getAttribute('data-src'),
          loaded: false
        });
      }
    }

    /**
     * Handle element becoming visible
     */
    handleElementVisible(element) {
      const lazyData = this.lazyElements.get(element);

      if (lazyData && !lazyData.loaded) {
        switch (lazyData.type) {
          case 'image':
            if (element.tagName === 'IMG' && lazyData.originalSrc) {
              element.src = lazyData.originalSrc;
              element.removeAttribute('data-src');
              lazyData.loaded = true;
            }
            break;
        }
      }

      // Re-apply theme to newly visible content
      if (window.OwlRetroContentScript) {
        setTimeout(() => window.OwlRetroContentScript.applyTheme(), 0);
      }
    }

    /**
     * Detect infinite scroll containers
     */
    isInfiniteScrollContainer(element) {
      const styles = window.getComputedStyle(element);
      return styles.overflowY === 'auto' || styles.overflowY === 'scroll';
    }

    /**
     * Detect virtual scroll containers
     */
    isVirtualScrollContainer(element) {
      return element.hasAttribute('data-virtual-scroll') ||
             element.classList.contains('virtual-scroll') ||
             element.querySelector('[data-virtual-item]');
    }

    /**
     * Setup infinite scroll detection
     */
    setupInfiniteScrollDetection(container) {
      const scrollHandler = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          // Near bottom, potential infinite scroll trigger
          this.handleInfiniteScrollTrigger(container);
        }
      };

      container.addEventListener('scroll', scrollHandler, { passive: true });
      container._owlInfiniteScrollHandler = scrollHandler;
    }

    /**
     * Setup virtual scroll detection
     */
    setupVirtualScrollDetection(container) {
      // Monitor virtual scroll container changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Virtual items added, re-apply theme
            if (window.OwlRetroContentScript) {
              setTimeout(() => window.OwlRetroContentScript.applyTheme(), 0);
            }
          }
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: false
      });

      container._owlVirtualScrollObserver = observer;
    }

    /**
     * Handle infinite scroll trigger
     */
    handleInfiniteScrollTrigger(container) {
      // Re-apply theme to newly loaded content
      if (window.OwlRetroContentScript) {
        setTimeout(() => window.OwlRetroContentScript.applyTheme(), 100);
      }
    }

    /**
     * Determine if element should be observed for intersection
     */
    shouldObserveElement(element) {
      return element.tagName === 'IMG' ||
             element.hasAttribute('data-lazy') ||
             element.classList.contains('lazy');
    }

    /**
     * AJAX/Fetch monitoring (2024-2025)
     */
    async initializeAjaxMonitoring() {
      // XMLHttpRequest monitoring
      this.monitorXMLHttpRequest();

      // Fetch API monitoring
      this.monitorFetchAPI();

      console.log('Owl Retro: AJAX monitoring initialized');
    }

    /**
     * Monitor XMLHttpRequest
     */
    monitorXMLHttpRequest() {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._owlMethod = method;
        this._owlUrl = url;
        return originalOpen.apply(this, [method, url, ...args]);
      };

      XMLHttpRequest.prototype.send = function(body) {
        this.addEventListener('load', () => {
          this.handleAjaxResponse({
            type: 'xhr',
            method: this._owlMethod,
            url: this._owlUrl,
            status: this.status,
            response: this.response
          });
        });

        this.addEventListener('error', () => {
          console.debug('Owl Retro: XHR error for', this._owlUrl);
        });

        return originalSend.apply(this, [body]);
      };
    }

    /**
     * Monitor Fetch API
     */
    monitorFetchAPI() {
      if (!window.fetch || typeof window.fetch !== 'function') {
        console.debug('Owl Retro: Fetch API not available, skipping fetch monitoring');
        return;
      }

      try {
        const originalFetch = window.fetch;

        window.fetch = async function(...args) {
          const [resource, options = {}] = args;
          const method = options.method || 'GET';
          const url = typeof resource === 'string' ? resource : resource.url;

          try {
            const response = await originalFetch.apply(this, args);

            // Clone response for monitoring
            const clonedResponse = response.clone();

            // Handle response asynchronously
            setTimeout(async () => {
              try {
                const responseData = await clonedResponse.text();
                if (window.OwlRetroDynamicContent) {
                  window.OwlRetroDynamicContent.handleAjaxResponse({
                    type: 'fetch',
                    method,
                    url,
                    status: clonedResponse.status,
                    response: responseData
                  });
                }
              } catch (error) {
                console.debug('Owl Retro: Fetch response monitoring failed:', error);
              }
            }, 0);

            return response;
          } catch (error) {
            console.debug('Owl Retro: Fetch error for', url, error);
            throw error;
          }
        };

        console.log('Owl Retro: Fetch API monitoring initialized');
      } catch (error) {
        console.debug('Owl Retro: Failed to setup fetch monitoring:', error);
      }
    }

    /**
     * Handle AJAX response
     */
    handleAjaxResponse(ajaxData) {
      // Monitor for content updates that might need theme re-application
      const contentType = ajaxData.response?.headers?.get('content-type') ||
                         ajaxData.response?.substring(0, 100);

      if (contentType && (
        contentType.includes('text/html') ||
        contentType.includes('application/json')
      )) {
        // Content update detected, re-apply theme
        if (window.OwlRetroContentScript) {
          setTimeout(() => window.OwlRetroContentScript.applyTheme(), 100);
        }
      }
    }

    /**
     * WebSocket monitoring (2024-2025)
     */
    async initializeWebSocketMonitoring() {
      if (!window.WebSocket || typeof window.WebSocket !== 'function') {
        console.debug('Owl Retro: WebSocket API not available, skipping WebSocket monitoring');
        return;
      }

      try {
        const originalWebSocket = window.WebSocket;

        window.WebSocket = function(...args) {
          const ws = new originalWebSocket(...args);
          if (window.OwlRetroDynamicContent) {
            window.OwlRetroDynamicContent.trackWebSocketConnection(ws);
          }
          return ws;
        };

        console.log('Owl Retro: WebSocket monitoring initialized');
      } catch (error) {
        console.debug('Owl Retro: Failed to setup WebSocket monitoring:', error);
      }
    }

    /**
     * Track WebSocket connection
     */
    trackWebSocketConnection(ws) {
      this.webSocketConnections.add(ws);

      ws.addEventListener('message', (event) => {
        this.handleWebSocketMessage(ws, event.data);
      });

      ws.addEventListener('close', () => {
        this.webSocketConnections.delete(ws);
      });
    }

    /**
     * Handle WebSocket message
     */
    handleWebSocketMessage(ws, data) {
      try {
        // Try to parse JSON data
        const parsedData = JSON.parse(data);

        // Check if this might be content update
        if (parsedData && typeof parsedData === 'object') {
          if (window.OwlRetroContentScript) {
            setTimeout(() => window.OwlRetroContentScript.applyTheme(), 50);
          }
        }
      } catch (error) {
        // Not JSON, could be other data format
        console.debug('Owl Retro: WebSocket message (non-JSON):', data.substring(0, 100));
      }
    }

    /**
     * Custom Element support initialization
     */
    async initializeCustomElementSupport() {
      // Monitor for custom element definitions
      this.monitorCustomElementDefinitions();

      console.log('Owl Retro: Custom Element support initialized');
    }

    /**
     * Monitor custom element definitions
     */
    monitorCustomElementDefinitions() {
      // Check if Custom Elements API is available (2024-2025 browser compatibility)
      if (!window.customElements || typeof window.customElements.define !== 'function') {
        console.debug('Owl Retro: Custom Elements API not available, skipping custom element monitoring');
        return;
      }

      try {
        const originalDefine = window.customElements.define;

        window.customElements.define = function(name, constructor, options) {
          // Track custom element definition
          if (window.OwlRetroDynamicContent) {
            window.OwlRetroDynamicContent.trackCustomElementDefinition(name, constructor);
          }

          return originalDefine.call(this, name, constructor, options);
        };

        console.log('Owl Retro: Custom element definitions monitoring initialized');
      } catch (error) {
        console.debug('Owl Retro: Failed to setup custom element monitoring:', error);
      }
    }

    /**
     * Track custom element definition
     */
    trackCustomElementDefinition(name, constructor) {
      this.customElementRegistry.set(name, {
        constructor,
        defined: true,
        instances: new Set()
      });
    }

    /**
     * Initialize lazy loading
     */
    async initializeLazyLoading() {
      // Setup lazy loading for existing elements
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => this.setupImageLazyLoading(img));

      console.log('Owl Retro: Lazy loading initialized');
    }

    /**
     * Batch process elements
     */
    batchProcessElements(elements) {
      // Debounce processing to avoid excessive work
      if (this._batchTimeout) {
        clearTimeout(this._batchTimeout);
      }

      this._batchTimeout = setTimeout(() => {
        elements.forEach(element => {
          if (window.OwlRetroContentScript) {
            // Re-apply theme to new elements
            window.OwlRetroContentScript.applyTheme();
          }
        });
      }, 50);
    }

    /**
     * Batch process shadow DOM elements
     */
    batchProcessShadowElements(elements, shadowRoot) {
      // Similar to main document processing but for shadow DOM
      if (this._shadowBatchTimeout) {
        clearTimeout(this._shadowBatchTimeout);
      }

      this._shadowBatchTimeout = setTimeout(() => {
        elements.forEach(element => {
          // Handle shadow DOM specific processing
          if (element.hasAttribute('slot')) {
            this.handleSlottedContent(element, shadowRoot);
          }
        });

        // Re-apply theme
        if (window.OwlRetroContentScript) {
          window.OwlRetroContentScript.applyTheme();
        }
      }, 50);
    }

    /**
     * Get dynamic content statistics
     */
    getStatistics() {
      return {
        observers: this.observers.size,
        lazyElements: this.lazyElements.size,
        ajaxMonitors: this.ajaxMonitors.size,
        webSocketConnections: this.webSocketConnections.size,
        customElements: this.customElementRegistry.size,
        shadowRoots: this.shadowRoots.size,
        slottedContent: Array.from(this.slottedContent.values()).reduce((sum, set) => sum + set.size, 0)
      };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
      // Disconnect all observers
      for (const [key, observer] of this.observers) {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      }
      this.observers.clear();

      // Disconnect intersection observer
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }

      // Clear lazy elements
      this.lazyElements = new WeakMap();

      // Clear other collections
      this.ajaxMonitors.clear();
      this.webSocketConnections.clear();
      this.customElementRegistry.clear();
      this.slottedContent = new WeakMap();

      // Clear timeouts
      if (this._batchTimeout) {
        clearTimeout(this._batchTimeout);
      }
      if (this._shadowBatchTimeout) {
        clearTimeout(this._shadowBatchTimeout);
      }

      this.isInitialized = false;
      console.log('Owl Retro: Dynamic Content Handler cleaned up');
    }
  }

  // Export for global access
  window.OwlRetroDynamicContent = new DynamicContentHandler();

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.OwlRetroDynamicContent.initialize();
    });
  } else {
    window.OwlRetroDynamicContent.initialize();
  }

})();

/**
 * 🦉 Owl Retro Theme - E-commerce & CMS Site Optimizations (2024-2025)
 *
 * E-commerce platformları ve CMS sistemleri için optimize edilmiş tema uygulama stratejileri.
 * Shopify, WooCommerce, Magento, WordPress, Drupal, Joomla, Headless CMS için
 * özel handling mekanizmaları.
 */

import { applyRetroTheme } from './color-utils.js';
import { createMutationObserver } from './mutation-handler.js';

// ========== E-COMMERCE PLATFORMS ========== //

/**
 * Shopify Platform Optimization (2024-2025)
 * Liquid templating ve dynamic product displays
 */
export function optimizeShopify() {
  const selectors = {
    product: '[data-product-id]',
    collection: '[data-collection-id]',
    cart: '[data-cart]',
    header: '[data-section-type="header"]',
    footer: '[data-section-type="footer"]'
  };

  function applyShopifyStyling() {
    // Shopify's data attributes
    const shopifyElements = document.querySelectorAll('[data-section-type], [data-product-id]');
    shopifyElements.forEach(element => applyRetroTheme(element));

    // Product cards specific styling
    const productCards = document.querySelectorAll('[data-product-id]');
    productCards.forEach(card => {
      card.style.border = '1px solid var(--retro-border)';
      card.style.backgroundColor = 'var(--retro-card-bg)';
    });

    // Price elements
    const prices = document.querySelectorAll('.price, [data-price]');
    prices.forEach(price => {
      price.style.color = 'var(--retro-accent)';
    });
  }

  const observer = createMutationObserver(() => {
    applyShopifyStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-section-type', 'data-product-id']
  });

  return { selectors, observer };
}

/**
 * WooCommerce Platform Optimization (2024-2025)
 * WordPress e-commerce integration
 */
export function optimizeWooCommerce() {
  const selectors = {
    product: '.woocommerce-product',
    shop: '.woocommerce-shop',
    cart: '.woocommerce-cart',
    checkout: '.woocommerce-checkout',
    account: '.woocommerce-account'
  };

  function applyWooCommerceStyling() {
    // WooCommerce specific classes
    const wooElements = document.querySelectorAll('.woocommerce *, [class*="woocommerce"]');
    wooElements.forEach(element => applyRetroTheme(element));

    // Product galleries
    const galleries = document.querySelectorAll('.woocommerce-product-gallery');
    galleries.forEach(gallery => {
      gallery.style.border = '1px solid var(--retro-border)';
    });

    // Buttons
    const buttons = document.querySelectorAll('.woocommerce button, .add_to_cart_button');
    buttons.forEach(button => {
      button.style.backgroundColor = 'var(--retro-primary)';
      button.style.color = 'var(--retro-light-text)';
    });
  }

  const observer = createMutationObserver(() => {
    applyWooCommerceStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  return { selectors, observer };
}

/**
 * Magento Platform Optimization (2024-2025)
 * Enterprise e-commerce platform
 */
export function optimizeMagento() {
  const selectors = {
    product: '[data-product-id]',
    category: '[data-category-id]',
    cart: '[data-cart]',
    header: '[data-header]',
    footer: '[data-footer]'
  };

  function applyMagentoStyling() {
    // Magento's Knockout.js data binding
    const magentoElements = document.querySelectorAll('[data-bind], [data-product-id]');
    magentoElements.forEach(element => applyRetroTheme(element));

    // Category products
    const categoryProducts = document.querySelectorAll('[data-category-id]');
    categoryProducts.forEach(product => {
      product.style.backgroundColor = 'var(--retro-card-bg)';
      product.style.border = '1px solid var(--retro-border)';
    });

    // Mini cart
    const miniCart = document.querySelector('[data-cart]');
    if (miniCart) {
      miniCart.style.backgroundColor = 'var(--retro-dark-bg)';
      miniCart.style.borderColor = 'var(--retro-border)';
    }
  }

  const observer = createMutationObserver(() => {
    applyMagentoStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-bind', 'data-product-id']
  });

  return { selectors, observer };
}

/**
 * Custom E-commerce Platform Optimization (2024-2025)
 * Generic e-commerce pattern detection
 */
export function optimizeCustomEcommerce() {
  const selectors = {
    product: '[data-product], .product, [class*="product"]',
    cart: '[data-cart], .cart, [class*="cart"]',
    checkout: '[data-checkout], .checkout, [class*="checkout"]',
    price: '[data-price], .price, [class*="price"]',
    button: 'button[class*="add"], [data-add-cart]'
  };

  function applyCustomEcommerceStyling() {
    // Generic e-commerce patterns
    Object.values(selectors).forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Smart styling based on element type
        if (element.matches('[data-price], .price, [class*="price"]')) {
          element.style.color = 'var(--retro-accent)';
        } else if (element.matches('button, [data-add-cart]')) {
          element.style.backgroundColor = 'var(--retro-primary)';
          element.style.color = 'var(--retro-light-text)';
        } else {
          applyRetroTheme(element);
        }
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyCustomEcommerceStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-product', 'data-cart']
  });

  return { selectors, observer };
}

// ========== CMS PLATFORMS ========== //

/**
 * WordPress Platform Optimization (2024-2025)
 * PHP-based CMS with various themes/plugins
 */
export function optimizeWordPress() {
  const selectors = {
    post: '.post, .entry',
    page: '.page',
    sidebar: '.sidebar, .widget-area',
    header: '.site-header',
    footer: '.site-footer',
    menu: '.nav-menu, .menu'
  };

  function applyWordPressStyling() {
    // WordPress specific classes
    const wpElements = document.querySelectorAll('[class*="wp-"], [id*="wp-"]');
    wpElements.forEach(element => applyRetroTheme(element));

    // Gutenberg blocks
    const gutenbergBlocks = document.querySelectorAll('[data-block]');
    gutenbergBlocks.forEach(block => {
      block.style.border = '1px solid var(--retro-border)';
      block.style.backgroundColor = 'var(--retro-card-bg)';
    });

    // Navigation menus
    const menus = document.querySelectorAll('.nav-menu li a');
    menus.forEach(link => {
      link.style.color = 'var(--retro-light-text)';
      link.addEventListener('mouseenter', () => {
        link.style.color = 'var(--retro-accent)';
      });
      link.addEventListener('mouseleave', () => {
        link.style.color = 'var(--retro-light-text)';
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyWordPressStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-block']
  });

  return { selectors, observer };
}

/**
 * Drupal Platform Optimization (2024-2025)
 * Modular CMS with complex theming
 */
export function optimizeDrupal() {
  const selectors = {
    block: '[data-block-plugin-id]',
    region: '[data-region]',
    node: '[data-node-id]',
    view: '[data-view-id]',
    form: '[data-drupal-selector]'
  };

  function applyDrupalStyling() {
    // Drupal's data attributes
    const drupalElements = document.querySelectorAll('[data-block-plugin-id], [data-node-id]');
    drupalElements.forEach(element => applyRetroTheme(element));

    // Views containers
    const views = document.querySelectorAll('[data-view-id]');
    views.forEach(view => {
      view.style.backgroundColor = 'var(--retro-card-bg)';
      view.style.border = '1px solid var(--retro-border)';
    });

    // Form elements
    const forms = document.querySelectorAll('[data-drupal-selector]');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.style.backgroundColor = 'var(--retro-input-bg)';
        input.style.borderColor = 'var(--retro-border)';
        input.style.color = 'var(--retro-light-text)';
      });
    });
  }

  const observer = createMutationObserver(() => {
    applyDrupalStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-plugin-id', 'data-node-id']
  });

  return { selectors, observer };
}

/**
 * Joomla Platform Optimization (2024-2025)
 * PHP-based CMS with component architecture
 */
export function optimizeJoomla() {
  const selectors = {
    component: '[data-component]',
    module: '[data-module-id]',
    article: '[data-article-id]',
    menu: '[data-menu-id]',
    position: '[data-position]'
  };

  function applyJoomlaStyling() {
    // Joomla's data attributes
    const joomlaElements = document.querySelectorAll('[data-component], [data-module-id]');
    joomlaElements.forEach(element => applyRetroTheme(element));

    // Module positions
    const modules = document.querySelectorAll('[data-module-id]');
    modules.forEach(module => {
      module.style.backgroundColor = 'var(--retro-card-bg)';
      module.style.border = '1px solid var(--retro-border)';
    });

    // Articles
    const articles = document.querySelectorAll('[data-article-id]');
    articles.forEach(article => {
      article.style.lineHeight = '1.6';
      article.style.color = 'var(--retro-light-text)';
    });
  }

  const observer = createMutationObserver(() => {
    applyJoomlaStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-component', 'data-module-id']
  });

  return { selectors, observer };
}

/**
 * Headless CMS Platform Optimization (2024-2025)
 * API-driven content management systems
 */
export function optimizeHeadlessCMS() {
  const selectors = {
    content: '[data-content-id]',
    collection: '[data-collection-id]',
    field: '[data-field]',
    api: '[data-api-endpoint]',
    dynamic: '[data-dynamic-content]'
  };

  function applyHeadlessStyling() {
    // Generic headless CMS patterns
    const cmsElements = document.querySelectorAll('[data-content-id], [data-collection-id]');
    cmsElements.forEach(element => applyRetroTheme(element));

    // Dynamic content containers
    const dynamicContent = document.querySelectorAll('[data-dynamic-content]');
    dynamicContent.forEach(container => {
      container.style.backgroundColor = 'var(--retro-card-bg)';
      container.style.border = '1px solid var(--retro-border)';
    });

    // API-driven fields
    const fields = document.querySelectorAll('[data-field]');
    fields.forEach(field => {
      field.style.color = 'var(--retro-light-text)';
      field.style.backgroundColor = 'var(--retro-input-bg)';
    });
  }

  const observer = createMutationObserver(() => {
    applyHeadlessStyling();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-content-id', 'data-dynamic-content']
  });

  return { selectors, observer };
}

// Export all functions
export {
  optimizeShopify,
  optimizeWooCommerce,
  optimizeMagento,
  optimizeCustomEcommerce,
  optimizeWordPress,
  optimizeDrupal,
  optimizeJoomla,
  optimizeHeadlessCMS
};

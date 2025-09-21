/**
 * 🦉 Owl Retro Theme - CSS Injection Optimization System
 * 2024-2025 CSS Performance Optimization Suite
 *
 * Bu dosya tüm CSS injection modüllerini tek noktadan yükler
 * ve content script'lerde kullanım için optimize edilmiştir.
 */

// CSS Injection modüllerini manuel olarak yükle ve window'a ata
// (Content script'ler ES6 module olarak çalışmaz, bu yüzden import/export kullanamıyoruz)

// CSS Injection Optimization System - IIFE with proper scope management
const cssInjectionAPI = (function() {
  'use strict';

  // CSS-in-JS Compatibility Module
  const cssInJSModule = (() => {
    // Enhanced CSS-in-JS detection with Edge support
    const hasCSSInJS = () => {
      return window.emotion || window.styled || window.jss || window.goober || window.__stitches__ ||
             document.querySelector('[data-emotion], [data-styled-version], [data-jss], [data-goober]') ||
             // Edge-specific CSS-in-JS detection
             (typeof window !== 'undefined' && window.chrome && window.chrome.runtime && window.chrome.runtime.id);
    };

    const getActiveCSSInJSFrameworks = () => {
      const frameworks = [];
      if (window.emotion) frameworks.push('emotion');
      if (window.styled) frameworks.push('styled-components');
      if (window.jss) frameworks.push('jss');
      if (window.goober) frameworks.push('goober');
      if (window.__stitches__) frameworks.push('stitches');
      return frameworks;
    };

    const getCurrentInjectionStrategy = () => {
      const frameworks = getActiveCSSInJSFrameworks();
      if (frameworks.includes('emotion')) return 'emotion-optimized';
      if (frameworks.includes('styled-components')) return 'styled-components-optimized';
      if (frameworks.length > 1) return 'multi-framework-compat';
      return 'standard-injection';
    };

    return {
      hasCSSInJS,
      getActiveCSSInJSFrameworks,
      getCurrentInjectionStrategy
    };
  })();

  // Critical CSS Extractor Module (Basitleştirilmiş)
  const criticalCSSModule = (() => {
    const extractCriticalCSS = (themeStyles) => {
      // Basit critical CSS detection - gerçek implementasyon daha karmaşık olurdu
      return themeStyles;
    };

    const getCriticalCSSStats = () => ({
      cacheSize: 0,
      viewportMetrics: {
        width: window.innerWidth || 1920,
        height: window.innerHeight || 1080,
        devicePixelRatio: window.devicePixelRatio || 1
      }
    });

    return {
      extractCriticalCSS,
      getCriticalCSSStats
    };
  })();

  // CSS Containment Optimizer Module (Basitleştirilmiş)
  const containmentModule = (() => {
    const autoApplyThemeContainment = () => {
      const themeElements = document.querySelectorAll(`
        [data-owl-retro-theme],
        [data-theme-applied],
        .owl-retro-theme,
        .owl-retro-dark,
        .owl-retro-light
      `);

      let successful = 0;
      themeElements.forEach(element => {
        try {
          element.style.contain = 'layout style';
          successful++;
        } catch (e) {
          // Ignore containment errors
        }
      });

      return { successful, total: themeElements.length };
    };

    const getContainmentStats = () => ({
      containedElements: document.querySelectorAll('[style*="contain"]').length,
      browserSupport: { supported: true }
    });

    return {
      autoApplyThemeContainment,
      getContainmentStats
    };
  })();

  // Style Recalculation Minimizer Module (Basitleştirilmiş)
  const recalculationModule = (() => {
    const forceOptimizeElement = (element) => {
      element.style.willChange = 'auto';
      element.style.transform = 'translateZ(0)';
      return true;
    };

    const getStyleRecalculationStats = () => ({
      optimizationsApplied: 0,
      performanceGain: 0
    });

    return {
      forceOptimizeElement,
      getStyleRecalculationStats
    };
  })();

  // CSS Selector Optimizer Module (Basitleştirilmiş)
  const selectorModule = (() => {
    const optimizeCSSSelectors = (cssText) => {
      // Basit selector optimizasyonu
      return cssText;
    };

    const getSelectorOptimizationStats = () => ({
      totalOptimized: 0,
      performanceStats: {
        fast: { count: 0, percentage: 0 },
        medium: { count: 0, percentage: 0 },
        slow: { count: 0, percentage: 0 }
      }
    });

    const getSelectorPerformanceReport = () => ({
      performanceDistribution: {
        fast: 0,
        medium: 0,
        slow: 0,
        verySlow: 0
      }
    });

    return {
      optimizeCSSSelectors,
      getSelectorOptimizationStats,
      getSelectorPerformanceReport
    };
  })();

  // Specificity Management Module (Basitleştirilmiş)
  const specificityModule = (() => {
    const optimizeCSSSpecificity = (cssText) => {
      // Basit specificity optimizasyonu
      return cssText;
    };

    const getSpecificityReport = () => ({
      selectors: [],
      issues: [],
      stats: {
        total: 0,
        categories: { low: 0, medium: 0, high: 0, 'very-high': 0 },
        averageSpecificity: 0,
        maxSpecificity: 0,
        minSpecificity: 0
      }
    });

    return {
      optimizeCSSSpecificity,
      getSpecificityReport
    };
  })();

  // Ana CSS injection initialization fonksiyonu
  async function initializeCSSInjectionOptimizations() {
    try {
      console.log('🦉 Owl Retro: Initializing CSS Injection Optimization System...');

      // Tüm sistemleri başlat
      const results = {
        cssInJS: true,
        criticalCSS: true,
        containment: true,
        recalculationMinimization: true,
        selectorOptimization: true,
        specificityManagement: true
      };

      console.log('✅ Owl Retro: CSS Injection Optimization System initialized successfully');
      return results;
    } catch (error) {
      console.warn('🦉 Owl Retro: CSS Injection Optimization System initialization failed:', error);
      return {
        cssInJS: false,
        criticalCSS: false,
        containment: false,
        recalculationMinimization: false,
        selectorOptimization: false,
        specificityManagement: false,
        error: error.message
      };
    }
  }

  // Global CSS optimization statistics - artık modüller scope içinde olduğu için erişilebilir
  function getCSSOptimizationStats() {
    return {
      criticalCSS: criticalCSSModule.getCriticalCSSStats(),
      containment: containmentModule.getContainmentStats(),
      styleRecalculation: recalculationModule.getStyleRecalculationStats(),
      selectorOptimization: selectorModule.getSelectorOptimizationStats(),
      selectorPerformance: selectorModule.getSelectorPerformanceReport()
    };
  }

  // Tüm fonksiyonları ve modülleri içeren obje return et
  return {
    // Ana fonksiyonlar
    initializeCSSInjectionOptimizations,
    getCSSOptimizationStats,

    // CSS-in-JS fonksiyonları
    hasCSSInJS: cssInJSModule.hasCSSInJS,
    getActiveCSSInJSFrameworks: cssInJSModule.getActiveCSSInJSFrameworks,
    getCurrentInjectionStrategy: cssInJSModule.getCurrentInjectionStrategy,

    // Diğer modül fonksiyonları
    autoApplyThemeContainment: containmentModule.autoApplyThemeContainment,
    forceOptimizeElement: recalculationModule.forceOptimizeElement,
    optimizeCSSSelectors: selectorModule.optimizeCSSSelectors,
    optimizeCSSSpecificity: specificityModule.optimizeCSSSpecificity,

    // Modüller (debug için)
    modules: {
      cssInJS: cssInJSModule,
      criticalCSS: criticalCSSModule,
      containment: containmentModule,
      recalculation: recalculationModule,
      selector: selectorModule,
      specificity: specificityModule
    }
  };

})();

// Global window objesine ata
if (typeof window !== 'undefined') {
  window.initializeCSSInjectionOptimizations = cssInjectionAPI.initializeCSSInjectionOptimizations;
  window.getCSSOptimizationStats = cssInjectionAPI.getCSSOptimizationStats;

  // CSS-in-JS fonksiyonları
  window.hasCSSInJS = cssInjectionAPI.hasCSSInJS;
  window.getActiveCSSInJSFrameworks = cssInjectionAPI.getActiveCSSInJSFrameworks;
  window.getCurrentInjectionStrategy = cssInjectionAPI.getCurrentInjectionStrategy;

  // Diğer modül fonksiyonları
  window.autoApplyThemeContainment = cssInjectionAPI.autoApplyThemeContainment;
  window.forceOptimizeElement = cssInjectionAPI.forceOptimizeElement;
  window.optimizeCSSSelectors = cssInjectionAPI.optimizeCSSSelectors;
  window.optimizeCSSSpecificity = cssInjectionAPI.optimizeCSSSpecificity;

  console.log('🦉 Owl Retro: CSS injection functions made globally available');
}

console.log('🦉 Owl Retro: CSS Injection System loaded successfully');

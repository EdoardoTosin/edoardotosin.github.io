/**
 * Preload CSS Handler
 * Converts preloaded stylesheets to regular stylesheets without inline event handlers
 */
(function() {
  'use strict';
  
  // Handle preloaded stylesheets
  function initPreloadedStyles() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
    
    preloadLinks.forEach(function(link) {
      // Wait for the stylesheet to load
      link.addEventListener('load', function() {
        // Convert preload to stylesheet
        this.rel = 'stylesheet';
      }, { once: true });
      
      // Fallback: convert after a short delay if load event doesn't fire
      setTimeout(function() {
        if (link.rel === 'preload') {
          link.rel = 'stylesheet';
        }
      }, 1000);
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloadedStyles);
  } else {
    initPreloadedStyles();
  }
})();

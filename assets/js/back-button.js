/**
 * Back Button Handler
 * Handles navigation back button without inline event handlers
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    // Handle back links
    const backLinks = document.querySelectorAll('[data-action="history-back"]');
    
    backLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.history.back();
      });
    });
  });
})();

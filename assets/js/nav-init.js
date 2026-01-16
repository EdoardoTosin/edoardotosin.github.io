/**
 * Navigation Component
 * Handles dark mode toggle and icon updates
 */
(function() {
  'use strict';
  
  // Initialize icon toggle on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Call iconToggle if it exists (from modeswitcher.js)
    if (typeof iconToggle === 'function') {
      iconToggle();
    }
    
    // Add event listeners to dark mode toggles
    const darkModeToggles = document.querySelectorAll('.navbar-dark-mode__mobile, .navbar-end.is-hidden-mobile');
    
    darkModeToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        // Only trigger if clicking on the toggle itself or its children
        if (typeof modeSwitcher === 'function') {
          modeSwitcher();
        }
      });
    });
  });
})();

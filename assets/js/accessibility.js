// accessibility.js - High contrast and reduced motion user toggles.
(function () {
  'use strict';

  var CONTRAST_KEY = 'jekyll-contrast';
  var MOTION_KEY = 'jekyll-motion';
  var html = document.documentElement;

  function getStored(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setStored(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }

  function removeStored(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  // --- High contrast ---

  function applyContrast(on) {
    if (on) {
      html.setAttribute('data-contrast', 'on');
    } else {
      html.removeAttribute('data-contrast');
    }
    updateContrastButtons(on);
    document.dispatchEvent(new CustomEvent('contrast-changed', { detail: on }));
  }

  function updateContrastButtons(on) {
    document.querySelectorAll('.contrast-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Disable high contrast' : 'Enable high contrast');
    });
  }

  function toggleContrast() {
    var on = html.getAttribute('data-contrast') === 'on';
    var next = !on;
    if (next) {
      setStored(CONTRAST_KEY, 'on');
    } else {
      removeStored(CONTRAST_KEY);
    }
    applyContrast(next);
  }

  // --- Reduced motion ---

  function applyMotion(reduce) {
    if (reduce) {
      html.setAttribute('data-motion', 'reduce');
    } else {
      html.removeAttribute('data-motion');
    }
    updateMotionButtons(reduce);
    document.dispatchEvent(new CustomEvent('motion-changed', { detail: reduce }));
  }

  function updateMotionButtons(reduce) {
    document.querySelectorAll('.motion-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(reduce));
      btn.setAttribute('aria-label', reduce ? 'Disable reduced motion' : 'Enable reduced motion');
    });
  }

  function toggleMotion() {
    var reduce = html.getAttribute('data-motion') === 'reduce';
    var next = !reduce;
    if (next) {
      setStored(MOTION_KEY, 'reduce');
    } else {
      removeStored(MOTION_KEY);
    }
    applyMotion(next);
  }

  // --- Init ---

  document.addEventListener('DOMContentLoaded', function () {
    var contrastOn = html.getAttribute('data-contrast') === 'on';
    var motionReduce = html.getAttribute('data-motion') === 'reduce';

    updateContrastButtons(contrastOn);
    updateMotionButtons(motionReduce);

    document.querySelectorAll('.contrast-toggle').forEach(function (btn) {
      if (btn.dataset.a11yBound) return;
      btn.dataset.a11yBound = '1';
      btn.addEventListener('click', toggleContrast);
    });

    document.querySelectorAll('.motion-toggle').forEach(function (btn) {
      if (btn.dataset.a11yBound) return;
      btn.dataset.a11yBound = '1';
      btn.addEventListener('click', toggleMotion);
    });
  });

  // Expose for command palette
  window.a11y = { toggleContrast: toggleContrast, toggleMotion: toggleMotion };
})();

// footnote-preview.js - Tooltip preview for footnote references in post content.
(function () {
  'use strict';

  var TOOLTIP_ID = 'fn-tooltip';
  var HIDE_DELAY = 200;
  var tooltip = null;
  var hideTimer = null;
  var activeAnchor = null;

  function prefersReduced() {
    return (
      document.documentElement.dataset.motion === 'reduce' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
  }

  // --- Tooltip ---

  function getOrCreateTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;
    tooltip.setAttribute('role', 'tooltip');
    var inner = document.createElement('div');
    inner.className = 'fn-tooltip__inner';
    tooltip.appendChild(inner);
    tooltip.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
    });
    tooltip.addEventListener('mouseleave', function () {
      hideTooltip();
    });
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function getFootnoteContent(href) {
    var id = href.replace(/^#/, '');
    var li = document.getElementById(id);
    if (!li) return null;
    var clone = li.cloneNode(true);
    var backLink = clone.querySelector('a[href^="#fnref"]');
    if (backLink) {
      var parent = backLink.parentNode;
      parent.removeChild(backLink);
      if (parent.textContent.trim() === '' && parent.parentNode) parent.parentNode.removeChild(parent);
    }
    return clone.innerHTML.trim();
  }

  function positionTooltip(tip, anchor) {
    tip.style.setProperty('visibility', 'hidden');
    var rect = anchor.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();
    var scrollY = window.scrollY || window.pageYOffset;
    var scrollX = window.scrollX || window.pageXOffset;
    var vw = document.documentElement.clientWidth;
    var gap = 8;

    var top = rect.top + scrollY - tipRect.height - gap;
    var left = rect.left + scrollX + rect.width / 2 - tipRect.width / 2;

    if (top < scrollY + gap) {
      top = rect.bottom + scrollY + gap;
      tip.classList.add('fn-tooltip--below');
    } else {
      tip.classList.remove('fn-tooltip--below');
    }

    left = Math.max(gap, Math.min(left, scrollX + vw - tipRect.width - gap));

    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
    tip.style.removeProperty('visibility');
  }

  function showTooltip(anchor, content) {
    clearTimeout(hideTimer);
    var tip = getOrCreateTooltip();
    tip.classList.remove('fn-tooltip--animated');
    tip.querySelector('.fn-tooltip__inner').innerHTML = content;
    tip.classList.add('is-visible');
    anchor.setAttribute('aria-describedby', TOOLTIP_ID);
    activeAnchor = anchor;
    positionTooltip(tip, anchor);
    if (!prefersReduced()) tip.classList.add('fn-tooltip--animated');
  }

  function hideTooltip() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (!tooltip) return;
      tooltip.classList.remove('is-visible', 'fn-tooltip--animated');
      if (activeAnchor) {
        activeAnchor.removeAttribute('aria-describedby');
        activeAnchor = null;
      }
    }, HIDE_DELAY);
  }

  function hideTooltipImmediate() {
    clearTimeout(hideTimer);
    if (!tooltip) return;
    tooltip.classList.remove('is-visible', 'fn-tooltip--animated');
    if (activeAnchor) {
      activeAnchor.removeAttribute('aria-describedby');
      activeAnchor = null;
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && tooltip && tooltip.classList.contains('is-visible')) {
      hideTooltipImmediate();
    }
  }

  // --- Init ---

  function init() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    var refs = content.querySelectorAll('a[href^="#fn:"]');
    if (!refs.length) return;

    refs.forEach(function (ref) {
      var href = ref.getAttribute('href');

      ref.addEventListener('mouseenter', function () {
        var html = getFootnoteContent(href);
        if (html) showTooltip(ref, html);
      });

      ref.addEventListener('mouseleave', function () {
        hideTooltip();
      });

      ref.addEventListener('focus', function () {
        var html = getFootnoteContent(href);
        if (html) showTooltip(ref, html);
      });

      ref.addEventListener('blur', function () {
        hideTooltip();
      });

      ref.addEventListener('click', function () {
        hideTooltipImmediate();
      });
    });

    document.addEventListener('keydown', onKeyDown);

    var fnDiv = document.querySelector('.footnotes');
    if (fnDiv) {
      fnDiv.setAttribute('aria-label', 'Footnotes');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

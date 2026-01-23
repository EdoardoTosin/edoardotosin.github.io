/**
 * Tools Page - Unified JavaScript Module
 * Single source of truth for filtering, sorting, and interactions
 * 
 * This file handles:
 * - Script filtering and search
 * - Sorting (A-Z / Z-A)
 * - Dropdown toggle for Python scripts
 * - Copy command to clipboard
 * - Download script files
 * - GitHub redirect on card click
 */

(function() {
  'use strict';

  // Prevent duplicate initialization
  if (window.ToolsPageInitialized) {
    return;
  }
  window.ToolsPageInitialized = true;

  // ============================================
  // State
  // ============================================
  var currentSort = 'asc';
  var allScripts = [];
  var debounceTimeout = null;

  // ============================================
  // Initialization
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    initializeScripts();
    setupEventListeners();
  });

  function initializeScripts() {
    var scriptCards = document.querySelectorAll('.script-card');
    allScripts = Array.from(scriptCards).map(function(card) {
      return {
        element: card,
        name: card.dataset.name || '',
        type: card.dataset.type || '',
        section: card.closest('.script-type-section')
      };
    });
  }

  // ============================================
  // Event Listeners Setup
  // ============================================
  function setupEventListeners() {
    var searchInput = document.getElementById('script-search');
    var typeFilter = document.getElementById('type-filter');
    var sortToggle = document.getElementById('sort-toggle');

    // Search and filter
    if (searchInput) {
      searchInput.addEventListener('input', filterAndSortScripts);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', filterAndSortScripts);
    }

    // Sort toggle
    if (sortToggle) {
      sortToggle.addEventListener('click', toggleSort);
    }

    // Unified click handler using event delegation
    document.addEventListener('click', handleDocumentClick);

    // Keyboard support for script cards
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var scriptCard = e.target.closest('.script-card');
        if (scriptCard && !e.target.closest('.script-actions')) {
          redirectToGitHub(scriptCard);
        }
      }
    });
  }

  // ============================================
  // Unified Click Handler
  // ============================================
  function handleDocumentClick(e) {
    var target = e.target;

    // Handle data-action elements first
    var actionElement = target.closest('[data-action]');
    if (actionElement) {
      var action = actionElement.dataset.action;

      switch (action) {
        case 'toggle-dropdown':
          e.preventDefault();
          e.stopPropagation();
          toggleDropdown(actionElement);
          return;

        case 'copy-command':
          e.preventDefault();
          e.stopPropagation();
          copyCommand(
            actionElement.dataset.url,
            actionElement.dataset.prefix,
            actionElement.dataset.postfix
          );
          return;

        case 'download':
          e.preventDefault();
          e.stopPropagation();
          downloadScript(
            actionElement.dataset.url,
            actionElement.dataset.filename
          );
          return;
      }
    }

    // Handle script card clicks (redirect to GitHub)
    var scriptCard = target.closest('.script-card');
    if (scriptCard && !target.closest('.script-actions')) {
      redirectToGitHub(scriptCard);
      return;
    }

    // Close dropdowns when clicking outside
    if (!target.closest('.python-dropdown')) {
      closeAllDropdowns();
    }
  }

  // ============================================
  // Filtering and Sorting
  // ============================================
  function filterAndSortScripts() {
    var searchInput = document.getElementById('script-search');
    var typeFilter = document.getElementById('type-filter');
    var scriptCount = document.getElementById('script-count');

    if (!searchInput || !typeFilter) return;

    var searchTerm = searchInput.value.toLowerCase();
    var typeFilterValue = typeFilter.value;

    // Check if there's an active search or filter
    var hasActiveSearch = searchTerm.length > 0;
    var hasActiveFilter = typeFilterValue !== 'all';
    var isFiltering = hasActiveSearch || hasActiveFilter;

    // Show/hide script count based on filtering state
    if (scriptCount) {
      if (isFiltering) {
        scriptCount.classList.add('show');
      } else {
        scriptCount.classList.remove('show');
      }
    }

    // Filter scripts
    var filteredScripts = allScripts.filter(function(script) {
      var matchesSearch = script.name.toLowerCase().includes(searchTerm);
      var matchesType = typeFilterValue === 'all' || script.type === typeFilterValue;
      return matchesSearch && matchesType;
    });

    // Sort scripts
    filteredScripts.sort(function(a, b) {
      var nameA = a.name.toLowerCase();
      var nameB = b.name.toLowerCase();
      if (currentSort === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    displayFilteredScripts(filteredScripts);

    // Update results count when filtering
    if (isFiltering) {
      updateResultsCount(filteredScripts.length);
    }
  }

  function displayFilteredScripts(filteredScripts) {
    var container = document.getElementById('scripts-container');
    var noResults = document.getElementById('no-results');
    var sections = document.querySelectorAll('.script-type-section');

    if (!container || !noResults) return;

    // Hide all sections and scripts
    sections.forEach(function(section) {
      section.classList.add('hide');
    });
    allScripts.forEach(function(script) {
      script.element.classList.add('hide');
    });

    if (filteredScripts.length === 0) {
      noResults.classList.remove('hide');
      return;
    }

    noResults.classList.add('hide');

    // Group filtered scripts by type
    var scriptsByType = {};
    filteredScripts.forEach(function(script) {
      if (!scriptsByType[script.type]) {
        scriptsByType[script.type] = [];
      }
      scriptsByType[script.type].push(script);
    });

    // Show sections in the original order
    var orderedTypes = ['linux', 'windows', 'python'];
    orderedTypes.forEach(function(type) {
      if (scriptsByType[type]) {
        var section = document.querySelector('.script-type-section[data-type="' + type + '"]');
        if (section) {
          section.classList.remove('hide');

          var grid = section.querySelector('.related-wrapper');
          if (grid) {
            // Clear and re-populate in sorted order
            while (grid.firstChild) {
              grid.removeChild(grid.firstChild);
            }

            scriptsByType[type].forEach(function(script) {
              script.element.classList.remove('hide');
              grid.appendChild(script.element);
            });
          }
        }
      }
    });
  }

  // ============================================
  // Sort Toggle
  // ============================================
  function toggleSort() {
    // Toggle sort direction
    currentSort = currentSort === 'asc' ? 'desc' : 'asc';

    var sortButton = document.getElementById('sort-toggle');
    if (sortButton) {
      updateSortButtonDisplay(sortButton);
    }

    filterAndSortScripts();
  }

  function updateSortButtonDisplay(sortButton) {
    var iconImg = sortButton.querySelector('.svg-icon');
    var iconName = currentSort === 'asc' ? 'arrow-up-16' : 'arrow-down-16';
    var labelText = currentSort === 'asc' ? 'A-Z' : 'Z-A';

    // Update icon src if it exists
    if (iconImg) {
      var currentSrc = iconImg.getAttribute('src') || '';
      var newSrc = currentSrc.replace(/arrow-(up|down)-16\.svg/, iconName + '.svg');
      iconImg.setAttribute('src', newSrc);
    }

    // Clear all content and rebuild in correct order: icon first, then text
    // Store reference to icon before clearing
    var iconClone = iconImg ? iconImg.cloneNode(true) : null;

    // Clear button content
    while (sortButton.firstChild) {
      sortButton.removeChild(sortButton.firstChild);
    }

    // Add icon first (before text)
    if (iconClone) {
      sortButton.appendChild(iconClone);
    }

    // Add space and label text after icon
    sortButton.appendChild(document.createTextNode(' ' + labelText));
  }

  function updateResultsCount(count) {
    var resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      resultsCount.textContent = count !== null && count !== undefined ? count : allScripts.length;
    }
  }

  // ============================================
  // Dropdown Management
  // ============================================
  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content.show').forEach(function(content) {
      content.classList.remove('show');
      var parentDropdown = content.closest('.python-dropdown');
      if (parentDropdown) {
        parentDropdown.classList.remove('active');
      }
    });
  }

  function toggleDropdown(button) {
    var dropdownContent = button.nextElementSibling;
    var dropdown = button.closest('.python-dropdown');

    if (!dropdownContent) return;

    var isCurrentlyOpen = dropdownContent.classList.contains('show');

    // Close all dropdowns first
    closeAllDropdowns();

    // If it was closed, open it; if it was open, it stays closed
    if (!isCurrentlyOpen) {
      dropdownContent.classList.add('show');
      if (dropdown) {
        dropdown.classList.add('active');
      }
    }
  }

  // ============================================
  // Copy Command
  // ============================================
  function copyCommand(url, prefix, postfix) {
    var command = prefix + " '" + url + "' | " + postfix;

    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }

    // Close any open dropdowns
    closeAllDropdowns();

    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(command).then(function() {
        showNotification('Command copied to clipboard', false);
      }).catch(function() {
        fallbackCopyToClipboard(command);
      });
    } else {
      fallbackCopyToClipboard(command);
    }
  }

  function fallbackCopyToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      if (successful) {
        showNotification('Command copied to clipboard', false);
      } else {
        showNotification('Failed to copy command', true);
      }
    } catch (err) {
      showNotification('Failed to copy command', true);
    }

    document.body.removeChild(textArea);
  }

  // ============================================
  // Notifications
  // ============================================
  function showNotification(message, isError) {
    var notification = document.getElementById('copy-notification');
    if (!notification) return;

    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    notification.textContent = message;
    notification.style.display = 'block';
    notification.classList.add('show');

    if (isError) {
      notification.style.background = 'var(--copy-notification-bg-error)';
    } else {
      notification.style.background = '';
    }

    debounceTimeout = setTimeout(function() {
      notification.style.display = 'none';
      notification.classList.remove('show');
      notification.style.background = '';
    }, isError ? 3000 : 2000);
  }

  // ============================================
  // Download Script
  // ============================================
  function downloadScript(url, filename) {
    showNotification('Downloading script...', false);

    // Construct GitHub raw URL
    var githubBaseUrl = 'https://raw.githubusercontent.com/EdoardoTosin/tools/refs/heads/main/script/';
    var githubRawUrl = githubBaseUrl + filename;

    fetch(githubRawUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to fetch script: ' + response.status);
        }
        return response.blob();
      })
      .then(function(blob) {
        var downloadUrl = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        showNotification('Script downloaded successfully!', false);
      })
      .catch(function(error) {
        console.error('Download failed:', error);
        showNotification('Download failed. Please try again.', true);
      });
  }

  // ============================================
  // Redirect to GitHub
  // ============================================
  function redirectToGitHub(cardElement) {
    var scriptName = cardElement.dataset.name;
    if (!scriptName) return;

    var githubBaseUrl = 'https://github.com/EdoardoTosin/tools/blob/main/script/';
    var githubUrl = githubBaseUrl + scriptName;

    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  }

  // ============================================
  // Expose functions globally for any external use
  // ============================================
  window.ToolsPage = {
    copyCommand: copyCommand,
    downloadScript: downloadScript,
    toggleDropdown: toggleDropdown,
    redirectToGitHub: redirectToGitHub,
    filterAndSortScripts: filterAndSortScripts
  };

})();

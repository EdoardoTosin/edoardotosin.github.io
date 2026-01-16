/**
 * Tools Page Event Handlers
 * Handles script card interactions, command copying, and downloads
 */

// Redirect to GitHub when clicking script card
function redirectToGitHub(element) {
  const url = element.dataset.scriptUrl;
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Copy command to clipboard
function copyCommand(url, prefix, postfix) {
  const command = prefix + " '" + url + "' | " + postfix;
  
  navigator.clipboard.writeText(command).then(function() {
    showCopyNotification();
  }).catch(function(err) {
    console.error('Failed to copy command:', err);
    // Fallback for older browsers
    fallbackCopyToClipboard(command);
  });
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyNotification();
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textArea);
}

// Show copy notification
function showCopyNotification() {
  const notification = document.getElementById('copy-notification');
  if (notification) {
    notification.classList.add('show');
    
    setTimeout(function() {
      notification.classList.remove('show');
    }, 2000);
  }
}

// Download script file
function downloadScript(url, filename) {
  fetch(url)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Download failed');
      }
      return response.blob();
    })
    .then(function(blob) {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    })
    .catch(function(err) {
      console.error('Download error:', err);
      alert('Failed to download script. Please try again.');
    });
}

// Toggle dropdown for Python scripts
function toggleDropdown(button) {
  const dropdown = button.nextElementSibling;
  const allDropdowns = document.querySelectorAll('.dropdown-content');
  
  // Close all other dropdowns
  allDropdowns.forEach(function(dd) {
    if (dd !== dropdown) {
      dd.classList.remove('is-active');
    }
  });
  
  // Toggle current dropdown
  dropdown.classList.toggle('is-active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.python-dropdown')) {
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    allDropdowns.forEach(function(dropdown) {
      dropdown.classList.remove('is-active');
    });
  }
});

// Initialize Tools page functionality
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  const searchInput = document.getElementById('script-search');
  const typeFilter = document.getElementById('type-filter');
  const sortToggle = document.getElementById('sort-toggle');
  const scriptsContainer = document.getElementById('scripts-container');
  const noResults = document.getElementById('no-results');
  const resultsCount = document.getElementById('results-count');
  
  let sortAscending = true;
  
  // Event delegation for all interactive elements
  document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    
    switch(action) {
      case 'copy-command':
        e.stopPropagation();
        copyCommand(target.dataset.url, target.dataset.prefix, target.dataset.postfix);
        break;
      case 'download':
        e.stopPropagation();
        downloadScript(target.dataset.url, target.dataset.filename);
        break;
      case 'toggle-dropdown':
        e.stopPropagation();
        toggleDropdown(target);
        break;
    }
  });
  
  // Handle script card clicks (redirect to GitHub)
  document.addEventListener('click', function(e) {
    const scriptCard = e.target.closest('.script-card');
    if (!scriptCard) return;
    
    // Don't redirect if clicking on buttons or inside script-actions
    if (e.target.closest('.script-actions')) return;
    
    redirectToGitHub(scriptCard);
  });
  
  // Handle Enter key on script cards
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    
    const scriptCard = e.target.closest('.script-card');
    if (scriptCard) {
      redirectToGitHub(scriptCard);
    }
  });
  
  // Search and filter functionality
  function filterScripts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedType = typeFilter ? typeFilter.value : 'all';
    
    const allCards = document.querySelectorAll('.script-card');
    const allSections = document.querySelectorAll('.script-type-section');
    let visibleCount = 0;
    
    allSections.forEach(function(section) {
      let sectionHasVisible = false;
      const sectionType = section.dataset.type;
      
      // Hide section if type doesn't match filter
      if (selectedType !== 'all' && sectionType !== selectedType) {
        section.style.display = 'none';
        return;
      }
      
      const cards = section.querySelectorAll('.script-card');
      cards.forEach(function(card) {
        const name = card.dataset.name || '';
        const type = card.dataset.type || '';
        
        const matchesSearch = name.includes(searchTerm);
        const matchesType = selectedType === 'all' || type === selectedType;
        
        if (matchesSearch && matchesType) {
          card.style.display = '';
          sectionHasVisible = true;
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      
      section.style.display = sectionHasVisible ? '' : 'none';
    });
    
    // Update results count
    if (resultsCount) {
      resultsCount.textContent = visibleCount;
    }
    
    // Show/hide no results message
    if (noResults && scriptsContainer) {
      if (visibleCount === 0) {
        scriptsContainer.style.display = 'none';
        noResults.classList.remove('hide');
      } else {
        scriptsContainer.style.display = '';
        noResults.classList.add('hide');
      }
    }
  }
  
  // Sort scripts
  function sortScripts() {
    sortAscending = !sortAscending;
    
    const sections = document.querySelectorAll('.script-type-section');
    sections.forEach(function(section) {
      const wrapper = section.querySelector('.related-wrapper');
      if (!wrapper) return;
      
      const cards = Array.from(wrapper.querySelectorAll('.script-card'));
      
      cards.sort(function(a, b) {
        const nameA = (a.dataset.name || '').toLowerCase();
        const nameB = (b.dataset.name || '').toLowerCase();
        
        if (sortAscending) {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
      
      // Re-append cards in sorted order
      cards.forEach(function(card) {
        wrapper.appendChild(card);
      });
    });
    
    // Update button text
    if (sortToggle) {
      const icon = sortToggle.querySelector('svg');
      const text = sortAscending ? ' A-Z' : ' Z-A';
      
      if (icon) {
        sortToggle.innerHTML = '';
        sortToggle.appendChild(icon.cloneNode(true));
        sortToggle.appendChild(document.createTextNode(text));
      }
    }
  }
  
  // Add event listeners
  if (searchInput) {
    searchInput.addEventListener('input', filterScripts);
  }
  
  if (typeFilter) {
    typeFilter.addEventListener('change', filterScripts);
  }
  
  if (sortToggle) {
    sortToggle.addEventListener('click', sortScripts);
  }
});

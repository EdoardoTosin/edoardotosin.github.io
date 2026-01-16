/**
 * 404 Page Random Suggestion
 * Loads search data and displays random page suggestions
 */
(function() {
  'use strict';
  
  var searchData = null;

  function loadSearchData() {
    const siteUrl = document.querySelector('meta[property="og:url"]')?.content?.split('/').slice(0, 3).join('/') || '';
    
    fetch(siteUrl + '/SearchData.json')
      .then(function(response) { return response.json(); })
      .then(function(data) {
        searchData = data;
        getRandomPage();
      })
      .catch(function() {
        document.getElementById('loading').innerHTML = '<p class="subtitle">Sorry, unable to load suggestions.</p>';
      });
  }

  function getRandomPage() {
    if (!searchData) return;

    var keys = Object.keys(searchData);
    if (keys.length === 0) return;

    var randomPage = searchData[keys[Math.floor(Math.random() * keys.length)]];

    document.getElementById('random-title').textContent = randomPage.title || 'Untitled';
    document.getElementById('random-description').textContent =
      randomPage.description ||
      (randomPage.content ? randomPage.content.substring(0, 150) + '...' : 'No description available');
    document.getElementById('random-link').href = randomPage.url || '#';

    document.getElementById('loading').style.display = 'none';
    document.getElementById('suggestion').style.display = 'block';
  }

  document.addEventListener('DOMContentLoaded', function() {
    loadSearchData();
    
    const randomButton = document.getElementById('random-button');
    if (randomButton) {
      randomButton.addEventListener('click', function() {
        getRandomPage();
        this.blur();
      });
    }
  });
})();

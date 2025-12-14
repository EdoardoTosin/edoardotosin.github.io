/********************************************************************************************
 *
 * MIT License
 *
 * Copyright (c) 2020 Raghuveer S
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * File: Search.js
 * Author: Raghuveer S
 *
 * Preface: I take loads of inspiration from just-the-docs to implement this.
 * This can be easily ported to suit your needs. There is very little project specific stuff
 * in this.
 *
 * How to customize this for your own project:
 * --------------------------------------------
 * 1. Fuse takes json fields for indexing, so create a json file with all the fields
 *      you want searched by Fuse. For eg. In my case, it is title, content, url for my
 *      blog posts.
 *      Note: In this project, the json gets automatically generated. (SEE: search-data.json)
 * 2. Change the field names below accordingly. (SEE: this.field)
 * 3. Create a HTML Page with an input box(with id='search-input') and a div beneath it
 *     with id='search-results'. Also, don't forget to embed this script using the script
 *     tag.
 * 4. You are good to go. If you need additional customization you can change the boost
 *      values, layout, colors etc by tinkering with the correponding parts of the code.
 *********************************************************************************************/

(function (sj) {
  "use strict";

  sj.addEvent = function (el, type, handler) {
    if (el.attachEvent) el.attachEvent("on" + type, handler);
    else el.addEventListener(type, handler);
  };
  sj.removeEvent = function (el, type, handler) {
    if (el.detachEvent) el.detachEvent("on" + type, handler);
    else el.removeEventListener(type, handler);
  };
  sj.onReady = function (ready) {
    // in case the document is already rendered
    if (document.readyState != "loading") ready();
    // modern browsers
    else if (document.addEventListener)
      document.addEventListener("DOMContentLoaded", ready);
    // IE <= 8
    else
      document.attachEvent("onreadystatechange", function () {
        if (document.readyState == "complete") ready();
      });
  };

  function sanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  function normalizeQuery(query) {
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  async function getSearchData(dataUrl, searchInput) {
    let response = await fetch(dataUrl);
    let rawData = await response.text();
    let allData = JSON.parse(rawData);

    let filterType = null;
    if (searchInput) {
      if (searchInput.classList.contains("search-posts")) {
        filterType = "post";
      } else if (searchInput.classList.contains("search-notes")) {
        filterType = "note";
      }
    }

    const filteredData = {};
    let i = 0;
    for (const key in allData) {
      const item = allData[key];
      if (filterType && item.type !== filterType) continue;
      filteredData[i++] = item;
    }

    return JSON.stringify(filteredData);
  }

  function searchInit() {
    var searchInput = document.getElementById("search-input");
    var dataUrl = "SearchData.json";

    getSearchData(dataUrl, searchInput)
      .then(function (responseText) {
        var docs = JSON.parse(responseText);

        const docsArray = Object.entries(docs).map(([id, doc]) => ({ ...doc, id }));

        var index = new Fuse(docsArray, {
          keys: [
            { name: "title", weight: 0.6 },
            { name: "tags", weight: 0.2 },
            { name: "keywords", weight: 0.15 },
            { name: "description", weight: 0.08 },
            { name: "content", weight: 0.03 },
            { name: "url", weight: 0.002 },
          ],
          includeMatches: true,
          includeScore: true,
          threshold: 0.35,
          distance: 150,
          minMatchCharLength: 2,
          ignoreLocation: true,
          useExtendedSearch: false,
          findAllMatches: true,
          ignoreFieldNorm: false,
          fieldNormWeight: 1.5,
        });

        searchLoaded(index, docsArray);

      })
      .catch(function (err) {
        console.warn("Error processing the search-data for Fuse.js", err);
      });
  }

  function searchLoaded(index, docs) {
    var index = index;
    var docs = docs;
    var searchInput = document.getElementById("search-input");
    var searchResults = document.getElementById("search-results");
    var currentInput;
    var currentSearchIndex = 0;
    var debounceTimer = null;

    function showSearch() {
      document.documentElement.classList.add("search-active");
    }

    if (!searchInput || !searchResults) {
      return;
    }

    function hideSearch() {
      document.documentElement.classList.remove("search-active");
    }

    function update() {
      currentSearchIndex++;

      var input = searchInput.value;
      
      if (input.length > 500) {
        input = input.substring(0, 500);
      }

      if (input === "") {
        hideSearch();
      } else {
        showSearch();
        window.scroll(0, -1);
        setTimeout(function () {
          window.scroll(0, 0);
        }, 0);
      }

      if (input === currentInput) {
        return;
      }

      currentInput = input;
      searchResults.innerHTML = "";
      if (input === "") {
        return;
      }

      var normalizedInput = normalizeQuery(input);
      var results = index.search(normalizedInput);

      results.sort(function(a, b) {
        return (a.score || 1) - (b.score || 1);
      });

      if (results.length == 0) {
        var noResultsDiv = document.createElement("div");
        noResultsDiv.classList.add("search-no-result");
        noResultsDiv.innerText = "No results found";
        searchResults.appendChild(noResultsDiv);
      } else {
        var resultsList = document.createElement("ul");
        resultsList.classList.add("search-results-list");
        searchResults.appendChild(resultsList);

        addResults(resultsList, results, 0, 15, 80, currentSearchIndex);
      }

      function addResults(
        resultsList,
        results,
        start,
        batchSize,
        batchMillis,
        searchIndex
      ) {
        if (searchIndex != currentSearchIndex) {
          return;
        }
        for (var i = start; i < start + batchSize; i++) {
          if (i == results.length) {
            return;
          }
          addResult(resultsList, results[i]);
        }
        setTimeout(function () {
          addResults(
            resultsList,
            results,
            start + batchSize,
            batchSize,
            batchMillis,
            searchIndex
          );
        }, batchMillis);
      }

      function addResult(resultsList, result) {
        var doc = result.item;

        result.matchData = { metadata: {} };
        for (const match of result.matches || []) {
          const key = match.key;
          const val = match.value;
          const positions = match.indices.map(([start, end]) => [start, end - start]);
          if (!result.matchData.metadata[val]) {
            result.matchData.metadata[val] = {};
          }
          result.matchData.metadata[val][key] = { position: positions };
        }

        var resultsListItem = document.createElement("li");
        resultsListItem.classList.add("search-results-list-item");
        resultsList.appendChild(resultsListItem);

        var resultLink = document.createElement("a");
        resultLink.classList.add("search-result");
        resultLink.setAttribute("href", doc.url);
        resultsListItem.appendChild(resultLink);

        var resultTitle = document.createElement("div");
        resultTitle.classList.add("search-result-title");
        resultLink.appendChild(resultTitle);

        var resultDoc = document.createElement("div");
        resultDoc.classList.add("search-result-doc");
        resultDoc.innerHTML =
          "<svg class='svg-doc' width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z'  stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><path d='M13 2V9H20'  stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>";

        resultTitle.appendChild(resultDoc);

        var resultDocTitle = document.createElement("div");
        resultDocTitle.classList.add("search-result-doc-title");
        resultDocTitle.innerHTML = sanitizeHTML(doc.doc);
        resultDoc.appendChild(resultDocTitle);
        var resultDocOrSection = resultDocTitle;

        if (doc.doc != doc.title) {
          resultDoc.classList.add("search-result-doc-parent");
          var resultSection = document.createElement("div");
          resultSection.classList.add("search-result-section");
          resultSection.innerHTML = sanitizeHTML(doc.title);
          resultTitle.appendChild(resultSection);
          resultDocOrSection = resultSection;
        }

        var metadata = result.matchData.metadata;
        var titlePositions = [];
        var contentPositions = [];
        for (var j in metadata) {
          var meta = metadata[j];
          if (meta.title) {
            var positions = meta.title.position;
            for (var k in positions) {
              titlePositions.push(positions[k]);
            }
          }

          if (meta.content) {
            var positions = meta.content.position;
            for (var k in positions) {
              var position = positions[k];
              var previewStart = position[0];
              var previewEnd = position[0] + position[1];
              var ellipsesBefore = true;
              var ellipsesAfter = true;
              for (var k = 0; k < 3; k++) {
                var nextSpace = doc.content.lastIndexOf(" ", previewStart - 2);
                var nextDot = doc.content.lastIndexOf(". ", previewStart - 2);
                if (nextDot >= 0 && nextDot > nextSpace) {
                  previewStart = nextDot + 1;
                  ellipsesBefore = false;
                  break;
                }
                if (nextSpace < 0) {
                  previewStart = 0;
                  ellipsesBefore = false;
                  break;
                }
                previewStart = nextSpace + 1;
              }

              for (var k = 0; k < 3; k++) {
                var nextSpace = doc.content.indexOf(" ", previewEnd + 1);
                var nextDot = doc.content.indexOf(". ", previewEnd + 1);
                if (nextDot >= 0 && nextDot < nextSpace) {
                  previewEnd = nextDot;
                  ellipsesAfter = false;
                  break;
                }
                if (nextSpace < 0) {
                  previewEnd = doc.content.length;
                  ellipsesAfter = false;
                  break;
                }
                previewEnd = nextSpace;
              }

              contentPositions.push({
                highlight: position,
                previewStart: previewStart,
                previewEnd: previewEnd,
                ellipsesBefore: ellipsesBefore,
                ellipsesAfter: ellipsesAfter,
              });
            }
          }
        }
        if (titlePositions.length > 0) {
          titlePositions.sort(function (p1, p2) {
            return p1[0] - p2[0];
          });
          resultDocOrSection.innerHTML = "";
          addHighlightedText(
            resultDocOrSection,
            doc.title,
            0,
            doc.title.length,
            titlePositions
          );
        }

        if (contentPositions.length > 0) {
          contentPositions.sort(function (p1, p2) {
            return p1.highlight[0] - p2.highlight[0];
          });
          var contentPosition = contentPositions[0];
          var previewPosition = {
            highlight: [contentPosition.highlight],
            previewStart: contentPosition.previewStart,
            previewEnd: contentPosition.previewEnd,
            ellipsesBefore: contentPosition.ellipsesBefore,
            ellipsesAfter: contentPosition.ellipsesAfter,
          };
          var previewPositions = [previewPosition];
          for (var j = 1; j < contentPositions.length; j++) {
            contentPosition = contentPositions[j];
            if (previewPosition.previewEnd < contentPosition.previewStart) {
              previewPosition = {
                highlight: [contentPosition.highlight],
                previewStart: contentPosition.previewStart,
                previewEnd: contentPosition.previewEnd,
                ellipsesBefore: contentPosition.ellipsesBefore,
                ellipsesAfter: contentPosition.ellipsesAfter,
              };
              previewPositions.push(previewPosition);
            } else {
              previewPosition.highlight.push(contentPosition.highlight);
              previewPosition.previewEnd = contentPosition.previewEnd;
              previewPosition.ellipsesAfter = contentPosition.ellipsesAfter;
            }
          }

          var resultPreviews = document.createElement("div");
          resultPreviews.classList.add("search-result-previews");
          resultLink.appendChild(resultPreviews);

          var content = doc.content;

          for (var j = 0; j < Math.min(previewPositions.length, 2); j++) {
            var position = previewPositions[j];
            var resultPreview = document.createElement("div");
            resultPreview.classList.add("search-result-preview");
            resultPreviews.appendChild(resultPreview);

            if (position.ellipsesBefore) {
              resultPreview.appendChild(document.createTextNode("... "));
            }
            addHighlightedText(
              resultPreview,
              content,
              position.previewStart,
              position.previewEnd,
              position.highlight
            );
            if (position.ellipsesAfter) {
              resultPreview.appendChild(document.createTextNode(" ..."));
            }
          }
        }
      }

      function addHighlightedText(parent, text, start, end, positions) {
        var index = start;
        for (var i in positions) {
          var position = positions[i];
          var span = document.createElement("span");
          span.textContent = text.substring(index, position[0]);
          parent.appendChild(span);
          index = position[0] + position[1];
          var highlight = document.createElement("span");
          highlight.classList.add("search-result-highlight");
          highlight.textContent = text.substring(position[0], index);
          parent.appendChild(highlight);
        }
        var span = document.createElement("span");
        span.textContent = text.substring(index, end);
        parent.appendChild(span);
      }
    }

    sj.addEvent(searchInput, "focus", function () {
      setTimeout(update, 0);
    });

    sj.addEvent(searchInput, "keyup", function (e) {
      switch (e.keyCode) {
        case 27: // When esc key is pressed, hide the results and clear the field
          let searchInput = document.getElementById("search-input");
          searchInput.value = "";
          searchInput.blur();
          hideSearch();
          break;
        case 38: // arrow up
        case 40: // arrow down
        case 13: // enter
          e.preventDefault();
          return;
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        update();
      }, 150);
    });

    sj.addEvent(searchInput, "keydown", function (e) {
      switch (e.keyCode) {
        case 38: // arrow up
          e.preventDefault();
          var active = document.querySelector(".search-result.active");
          if (active) {
            active.classList.remove("active");
            if (active.parentElement.previousSibling) {
              var previous =
                active.parentElement.previousSibling.querySelector(
                  ".search-result"
                );
              previous.classList.add("active");
              previous.scrollIntoView(false);
            }
          }
          return;
        case 40: // arrow down
          e.preventDefault();
          var active = document.querySelector(".search-result.active");
          if (active) {
            if (active.parentElement.nextSibling) {
              var next =
                active.parentElement.nextSibling.querySelector(
                  ".search-result"
                );
              active.classList.remove("active");
              next.classList.add("active");
              next.scrollIntoView(false);
            }
          } else {
            var next = document.querySelector(".search-result");
            if (next) {
              next.classList.add("active");
            }
          }
          return;
        case 13: // enter
          e.preventDefault();
          var active = document.querySelector(".search-result.active");
          if (active) {
            active.click();
          } else {
            var first = document.querySelector(".search-result");
            if (first) {
              first.click();
            }
          }
          return;
      }
    });

    sj.addEvent(document, "click", function (e) {
      if (e.target != searchInput) {
        hideSearch();
      }
    });
  }

  function searchInitListener() {
    document.onkeyup = function (e) {
      var evt = window.event || e;
      let searchInput = document.getElementById("search-input");
      let key = evt.keyCode || evt.which;
      if (e.shiftKey && key == 83) {
        searchInput.focus();
      }
    };
  }

  sj.onReady(function () {
    searchInitListener();
    searchInit();
  });
})((window.sj = window.sj || {}));

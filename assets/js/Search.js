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
    if (document.readyState !== "loading") ready();
    else if (document.addEventListener)
      document.addEventListener("DOMContentLoaded", ready);
    else
      document.attachEvent("onreadystatechange", function () {
        if (document.readyState === "complete") ready();
      });
  };

  function sanitizeText(str) {
    if (typeof str !== "string") return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  function normalizeQuery(query) {
    if (typeof query !== "string") return "";
    return query
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s-]/g, "")
      .trim();
  }

  function tokenize(text) {
    if (typeof text !== "string") return [];
    return normalizeQuery(text).split(/\s+/).filter(Boolean);
  }

  function validateSearchInput(input) {
    if (typeof input !== "string") return "";
    const sanitized = input.substring(0, 500);
    if (!/[a-z0-9]/i.test(sanitized)) return "";
    return sanitized;
  }

  async function fetchSearchData(dataUrl, filterType) {
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch search data`);
      }

      const rawData = await response.text();
      const allData = JSON.parse(rawData);

      const docsArray = [];
      for (const key in allData) {
        if (!allData.hasOwnProperty(key)) continue;

        const item = allData[key];
        if (!item || typeof item !== "object") continue;
        if (filterType && item.type !== filterType) continue;

        docsArray.push({
          id: String(key),
          doc: String(item.doc || ""),
          title: String(item.title || ""),
          type: String(item.type || ""),
          content: String(item.content || ""),
          url: String(item.url || ""),
          short_url: String(item.short_url || ""),
          tags: String(item.tags || ""),
          keywords: String(item.keywords || ""),
          description: String(item.description || ""),
          categories: String(item.categories || "")
        });
      }

      return docsArray;
    } catch (err) {
      console.error("Error loading search data:", err);
      throw err;
    }
  }

  function createFuseIndex(docs) {
    return new Fuse(docs, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "keywords", weight: 0.25 },
        { name: "tags", weight: 0.15 },
        { name: "description", weight: 0.05 },
        { name: "categories", weight: 0.03 },
        { name: "content", weight: 0.02 }
      ],
      includeMatches: true,
      includeScore: true,
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 2,
      ignoreLocation: true,
      useExtendedSearch: false,
      findAllMatches: true,
      ignoreFieldNorm: false,
      fieldNormWeight: 1.5
    });
  }

  function performMultiStrategySearch(fuseIndex, docs, normalizedQuery) {
    const queryTokens = tokenize(normalizedQuery);
    const results = new Map();

    // Strategy 1: Exact matches
    docs.forEach((doc) => {
      const titleNorm = normalizeQuery(doc.title);
      const keywordsNorm = normalizeQuery(doc.keywords);

      if (titleNorm === normalizedQuery) {
        results.set(doc.id, {
          item: doc,
          score: 0.001,
          matches: [{ key: "title", value: doc.title, indices: [[0, doc.title.length - 1]] }],
          strategyBoost: 1000
        });
        return;
      }

      const keywordTokens = tokenize(doc.keywords);
      if (keywordTokens.includes(normalizedQuery)) {
        if (!results.has(doc.id) || results.get(doc.id).score > 0.005) {
          results.set(doc.id, {
            item: doc,
            score: 0.005,
            matches: [{ key: "keywords", value: doc.keywords }],
            strategyBoost: 500
          });
        }
      }

      if (queryTokens.length > 1) {
        const titleTokens = tokenize(doc.title);
        const allWordsInTitle = queryTokens.every(qt =>
          titleTokens.some(tt => tt.includes(qt))
        );

        if (allWordsInTitle && !results.has(doc.id)) {
          results.set(doc.id, {
            item: doc,
            score: 0.01,
            matches: [{ key: "title", value: doc.title }],
            strategyBoost: 300
          });
        }
      }
    });

    // Strategy 2: Prefix matches
    docs.forEach((doc) => {
      if (results.has(doc.id)) return;

      const titleNorm = normalizeQuery(doc.title);

      if (titleNorm.startsWith(normalizedQuery)) {
        results.set(doc.id, {
          item: doc,
          score: 0.02,
          matches: [{ key: "title", value: doc.title, indices: [[0, normalizedQuery.length - 1]] }],
          strategyBoost: 200
        });
        return;
      }

      const keywordTokens = tokenize(doc.keywords);
      const prefixMatch = keywordTokens.some(kw => kw.startsWith(normalizedQuery));

      if (prefixMatch) {
        results.set(doc.id, {
          item: doc,
          score: 0.03,
          matches: [{ key: "keywords", value: doc.keywords }],
          strategyBoost: 150
        });
      }
    });

    // Strategy 3: Fuzzy search
    const fuseResults = fuseIndex.search(normalizedQuery);

    fuseResults.forEach((result) => {
      const docId = result.item.id;

      if (!results.has(docId)) {
        results.set(docId, {
          item: result.item,
          score: result.score || 0.5,
          matches: result.matches || [],
          strategyBoost: 0
        });
      }
    });

    return Array.from(results.values());
  }

  function calculateEnhancedScore(result, normalizedQuery) {
    const queryTokens = tokenize(normalizedQuery);
    const doc = result.item;

    let score = result.score;
    const strategyBoost = result.strategyBoost || 0;

    score = Math.max(0.0001, score - (strategyBoost * 0.001));

    const titleTokens = tokenize(doc.title);
    const titleLengthFactor = Math.min(1.0, titleTokens.length / 10);
    score *= (0.7 + (0.3 * titleLengthFactor));

    const titleNorm = normalizeQuery(doc.title);
    const matchedTerms = queryTokens.filter(qt => titleNorm.includes(qt));
    const coverageRatio = matchedTerms.length / queryTokens.length;
    score *= (2.0 - coverageRatio);

    const hasMatches = result.matches && result.matches.length > 0;
    if (hasMatches) {
      const hasTitleMatch = result.matches.some(m => m.key === "title");
      const hasKeywordMatch = result.matches.some(m => m.key === "keywords");

      if (hasTitleMatch) {
        score *= 0.7;
      } else if (hasKeywordMatch) {
        score *= 0.85;
      }
    }

    return score;
  }

  function rankResults(results, normalizedQuery) {
    results.forEach(result => {
      result.enhancedScore = calculateEnhancedScore(result, normalizedQuery);
    });

    results.sort((a, b) => a.enhancedScore - b.enhancedScore);

    return results;
  }

  function initializeSearch() {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    if (!searchInput || !searchResults) return;

    let filterType = null;
    if (searchInput.classList.contains("search-posts")) {
      filterType = "post";
    } else if (searchInput.classList.contains("search-notes")) {
      filterType = "note";
    }

    fetchSearchData("SearchData.json", filterType)
      .then((docs) => {
        const fuseIndex = createFuseIndex(docs);
        setupSearchUI(searchInput, searchResults, fuseIndex, docs);
      })
      .catch((err) => {
        console.error("Failed to initialize search:", err);
        searchResults.textContent = "Search unavailable";
      });
  }

  function setupSearchUI(searchInput, searchResults, fuseIndex, docs) {
    let currentInput = "";
    let currentSearchIndex = 0;
    let debounceTimer = null;

    function showSearch() {
      document.documentElement.classList.add("search-active");
    }

    function hideSearch() {
      document.documentElement.classList.remove("search-active");
    }

    function performSearch() {
      currentSearchIndex++;

      let input = validateSearchInput(searchInput.value);

      if (input === "") {
        hideSearch();
        searchResults.innerHTML = "";
        currentInput = "";
        return;
      }

      showSearch();
      window.scrollTo(0, 0);

      if (input === currentInput) return;
      currentInput = input;

      searchResults.innerHTML = "";

      const normalizedInput = normalizeQuery(input);

      let results = performMultiStrategySearch(fuseIndex, docs, normalizedInput);

      results = rankResults(results, normalizedInput);

      if (results.length === 0) {
        const noResultsDiv = document.createElement("div");
        noResultsDiv.classList.add("search-no-result");
        noResultsDiv.textContent = "No results found";
        searchResults.appendChild(noResultsDiv);
      } else {
        const resultsList = document.createElement("ul");
        resultsList.classList.add("search-results-list");
        searchResults.appendChild(resultsList);

        renderResults(resultsList, results, 0, 15, 80, currentSearchIndex);
      }
    }

    function renderResults(
      resultsList,
      results,
      start,
      batchSize,
      batchMillis,
      searchIndex
    ) {
      if (searchIndex !== currentSearchIndex) return;

      const end = Math.min(start + batchSize, results.length);
      for (let i = start; i < end; i++) {
        renderResult(resultsList, results[i]);
      }

      if (end < results.length) {
        setTimeout(() => {
          renderResults(
            resultsList,
            results,
            end,
            batchSize,
            batchMillis,
            searchIndex
          );
        }, batchMillis);
      }
    }

    function renderResult(resultsList, result) {
      const doc = result.item;

      const titlePositions = [];
      const contentPositions = [];

      if (result.matches) {
        for (const match of result.matches) {
          const key = match.key;
          const value = match.value || "";
          const indices = match.indices || [];

          if (key === "title") {
            for (const [start, end] of indices) {
              titlePositions.push([start, end - start + 1]);
            }
          } else if (key === "content") {
            for (const [start, end] of indices) {
              const matchStart = start;
              const matchEnd = end;
              const matchLength = matchEnd - matchStart + 1;

              let previewStart = matchStart;
              let previewEnd = matchEnd;
              let ellipsesBefore = true;
              let ellipsesAfter = true;

              for (let k = 0; k < 3; k++) {
                const lastSpace = value.lastIndexOf(" ", previewStart - 2);
                const lastDot = value.lastIndexOf(". ", previewStart - 2);
                if (lastDot >= 0 && lastDot > lastSpace) {
                  previewStart = lastDot + 2;
                  ellipsesBefore = false;
                  break;
                }
                if (lastSpace < 0) {
                  previewStart = 0;
                  ellipsesBefore = false;
                  break;
                }
                previewStart = lastSpace + 1;
              }

              for (let k = 0; k < 3; k++) {
                const nextSpace = value.indexOf(" ", previewEnd + 1);
                const nextDot = value.indexOf(". ", previewEnd + 1);
                if (nextDot >= 0 && nextDot < nextSpace) {
                  previewEnd = nextDot;
                  ellipsesAfter = false;
                  break;
                }
                if (nextSpace < 0) {
                  previewEnd = value.length - 1;
                  ellipsesAfter = false;
                  break;
                }
                previewEnd = nextSpace;
              }

              contentPositions.push({
                highlight: [matchStart, matchLength],
                previewStart: previewStart,
                previewEnd: previewEnd,
                ellipsesBefore: ellipsesBefore,
                ellipsesAfter: ellipsesAfter
              });
            }
          }
        }
      }

      const listItem = document.createElement("li");
      listItem.classList.add("search-results-list-item");
      resultsList.appendChild(listItem);

      const resultLink = document.createElement("a");
      resultLink.classList.add("search-result");
      resultLink.setAttribute("href", sanitizeText(doc.url));
      listItem.appendChild(resultLink);

      const resultTitle = document.createElement("div");
      resultTitle.classList.add("search-result-title");
      resultLink.appendChild(resultTitle);

      const resultDoc = document.createElement("div");
      resultDoc.classList.add("search-result-doc");
      resultDoc.innerHTML =
        "<svg width='16' height='16' viewBox='0 0 16 16' class='svg-doc' fill='currentColor'><path d='M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z'/></svg>";
      resultTitle.appendChild(resultDoc);

      const resultDocTitle = document.createElement("div");
      resultDocTitle.classList.add("search-result-doc-title");
      resultDoc.appendChild(resultDocTitle);

      let targetElement = resultDocTitle;

      if (doc.doc !== doc.title) {
        resultDoc.classList.add("search-result-doc-parent");
        resultDocTitle.textContent = sanitizeText(doc.doc);

        const resultSection = document.createElement("div");
        resultSection.classList.add("search-result-section");
        resultTitle.appendChild(resultSection);
        targetElement = resultSection;
      }

      if (titlePositions.length > 0) {
        titlePositions.sort((a, b) => a[0] - b[0]);
        renderHighlightedText(targetElement, doc.title, 0, doc.title.length, titlePositions);
      } else {
        targetElement.textContent = sanitizeText(doc.title);
      }

      if (contentPositions.length > 0) {
        contentPositions.sort((a, b) => a.highlight[0] - b.highlight[0]);

        const mergedPositions = [];
        let currentPos = contentPositions[0];
        mergedPositions.push({
          highlight: [currentPos.highlight],
          previewStart: currentPos.previewStart,
          previewEnd: currentPos.previewEnd,
          ellipsesBefore: currentPos.ellipsesBefore,
          ellipsesAfter: currentPos.ellipsesAfter
        });

        for (let j = 1; j < contentPositions.length; j++) {
          const pos = contentPositions[j];
          const lastMerged = mergedPositions[mergedPositions.length - 1];

          if (lastMerged.previewEnd < pos.previewStart) {
            mergedPositions.push({
              highlight: [pos.highlight],
              previewStart: pos.previewStart,
              previewEnd: pos.previewEnd,
              ellipsesBefore: pos.ellipsesBefore,
              ellipsesAfter: pos.ellipsesAfter
            });
          } else {
            lastMerged.highlight.push(pos.highlight);
            lastMerged.previewEnd = pos.previewEnd;
            lastMerged.ellipsesAfter = pos.ellipsesAfter;
          }
        }

        const resultPreviews = document.createElement("div");
        resultPreviews.classList.add("search-result-previews");
        resultLink.appendChild(resultPreviews);

        const content = doc.content;
        const maxPreviews = Math.min(mergedPositions.length, 2);

        for (let j = 0; j < maxPreviews; j++) {
          const position = mergedPositions[j];
          const resultPreview = document.createElement("div");
          resultPreview.classList.add("search-result-preview");
          resultPreviews.appendChild(resultPreview);

          if (position.ellipsesBefore) {
            resultPreview.appendChild(document.createTextNode("... "));
          }

          renderHighlightedText(
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

    function renderHighlightedText(parent, text, start, end, positions) {
      let index = start;

      for (const position of positions) {
        const [matchStart, matchLength] = position;

        if (index < matchStart) {
          const span = document.createElement("span");
          span.textContent = text.substring(index, matchStart);
          parent.appendChild(span);
        }

        const highlight = document.createElement("span");
        highlight.classList.add("search-result-highlight");
        highlight.textContent = text.substring(matchStart, matchStart + matchLength);
        parent.appendChild(highlight);

        index = matchStart + matchLength;
      }

      if (index < end) {
        const span = document.createElement("span");
        span.textContent = text.substring(index, end);
        parent.appendChild(span);
      }
    }

    sj.addEvent(searchInput, "focus", function () {
      setTimeout(performSearch, 0);
    });

    sj.addEvent(searchInput, "keyup", function (e) {
      if (e.keyCode === 27) {
        searchInput.value = "";
        searchInput.blur();
        hideSearch();
        return;
      }

      if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13) {
        e.preventDefault();
        return;
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 150);
    });

    sj.addEvent(searchInput, "keydown", function (e) {
      if (e.keyCode === 38) {
        e.preventDefault();
        const active = document.querySelector(".search-result.active");
        if (active) {
          active.classList.remove("active");
          const prevItem = active.parentElement.previousSibling;
          if (prevItem) {
            const prevLink = prevItem.querySelector(".search-result");
            if (prevLink) {
              prevLink.classList.add("active");
              prevLink.scrollIntoView({ block: "nearest" });
            }
          }
        }
      } else if (e.keyCode === 40) {
        e.preventDefault();
        const active = document.querySelector(".search-result.active");
        if (active) {
          const nextItem = active.parentElement.nextSibling;
          if (nextItem) {
            const nextLink = nextItem.querySelector(".search-result");
            if (nextLink) {
              active.classList.remove("active");
              nextLink.classList.add("active");
              nextLink.scrollIntoView({ block: "nearest" });
            }
          }
        } else {
          const firstResult = document.querySelector(".search-result");
          if (firstResult) {
            firstResult.classList.add("active");
          }
        }
      } else if (e.keyCode === 13) {
        e.preventDefault();
        const active = document.querySelector(".search-result.active");
        if (active) {
          active.click();
        } else {
          const firstResult = document.querySelector(".search-result");
          if (firstResult) {
            firstResult.click();
          }
        }
      }
    });

    sj.addEvent(document, "click", function (e) {
      if (e.target !== searchInput) {
        hideSearch();
      }
    });
  }

  function setupSearchShortcut() {
    document.addEventListener("keyup", function (e) {
      const searchInput = document.getElementById("search-input");
      if (!searchInput) return;

      if (e.shiftKey && (e.keyCode === 83 || e.key === "S")) {
        searchInput.focus();
      }
    });
  }

  sj.onReady(function () {
    setupSearchShortcut();
    initializeSearch();
  });
})((window.sj = window.sj || {}));

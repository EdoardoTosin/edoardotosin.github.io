// search.js - BM25 search overlay. Self-contained; runs on DOMContentLoaded.
(function () {
  'use strict';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return (root || document).querySelectorAll(sel);
  }
  function escHtml(str) {
    return String(str).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlightTerms(text, terms) {
    if (!terms || !terms.length) return escHtml(text);
    var html = escHtml(text);
    var seen = {};
    terms.forEach(function (term) {
      if (!term || seen[term]) return;
      seen[term] = true;
      var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      html = html.replace(re, '<mark>$1</mark>');
    });
    return html;
  }

  function initSearch() {
    var overlay = qs('#search-overlay');
    var closeBtn = qs('#search-close');
    var input = qs('#search-input');
    var results = qs('#search-results');
    var toggleBtns = qsa('[data-search-toggle]');
    if (!overlay) return;

    var cache = null;
    var idx = null;
    var debounce;
    var lastFocused = null;
    var focusedIdx = -1;

    var STOP = {
      a: 1,
      an: 1,
      and: 1,
      are: 1,
      as: 1,
      at: 1,
      be: 1,
      been: 1,
      but: 1,
      by: 1,
      do: 1,
      for: 1,
      from: 1,
      had: 1,
      has: 1,
      have: 1,
      he: 1,
      her: 1,
      him: 1,
      his: 1,
      how: 1,
      i: 1,
      if: 1,
      in: 1,
      is: 1,
      it: 1,
      its: 1,
      me: 1,
      my: 1,
      no: 1,
      not: 1,
      of: 1,
      on: 1,
      or: 1,
      our: 1,
      out: 1,
      she: 1,
      so: 1,
      than: 1,
      that: 1,
      the: 1,
      their: 1,
      them: 1,
      then: 1,
      there: 1,
      they: 1,
      this: 1,
      to: 1,
      up: 1,
      us: 1,
      was: 1,
      we: 1,
      were: 1,
      what: 1,
      when: 1,
      which: 1,
      who: 1,
      will: 1,
      with: 1,
      you: 1,
      your: 1,
    };

    var K1 = 1.5,
      B = 0.75;
    var FW = { title: 6, headings: 4, topic: 3, tags: 2.5, kws: 2, desc: 1.5, body: 1 };

    var HIST_KEY = 'jekyll-search-hist',
      HIST_MAX = 6;
    function getHistory() {
      try {
        return JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
      } catch (e) {
        return [];
      }
    }
    function pushHistory(q) {
      q = q.trim();
      if (q.length < 3) return;
      var s = stem(q.toLowerCase());
      var h = getHistory().filter(function (x) {
        return stem(x.toLowerCase()) !== s;
      });
      h.unshift(q);
      try {
        localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(0, HIST_MAX)));
      } catch (e) {}
    }
    function removeHistory(q) {
      try {
        localStorage.setItem(
          HIST_KEY,
          JSON.stringify(
            getHistory().filter(function (x) {
              return x !== q;
            }),
          ),
        );
      } catch (e) {}
    }

    var stemRules = [
      [/ations?$/, 'ate'],
      [/nesses?$/, ''],
      [/ments?$/, ''],
      [/ities?$/, 'y'],
      [/ings?$/, ''],
      [/iers?$/, 'y'],
      [/ers?$/, ''],
      [/ies$/, 'y'],
      [/ied$/, 'y'],
      [/ed$/, ''],
      [/ly$/, ''],
      [/([^s])s$/, '$1'],
    ];
    function stem(w) {
      if (w.length < 4) return w;
      for (var i = 0; i < stemRules.length; i++) {
        var r = w.replace(stemRules[i][0], stemRules[i][1]);
        if (r !== w && r.length >= 3) return r;
      }
      return w;
    }

    function tokenize(text, doStem) {
      if (!text) return [];
      var out = [];
      text
        .toLowerCase()
        .split(/[^\w]+/)
        .forEach(function (w) {
          if (w.length < 2 || STOP[w]) return;
          out.push(doStem ? stem(w) : w);
        });
      return out;
    }

    // Index builder
    function buildIndex(docs) {
      var inv = {},
        dl = {},
        N = docs.length;
      docs.forEach(function (doc, i) {
        var fields = {
          title: doc.title || '',
          headings: doc.headings || '',
          topic: doc.topic || '',
          tags: Array.isArray(doc.tags) ? doc.tags.join(' ') : doc.tags || '',
          kws: Array.isArray(doc.keywords) ? doc.keywords.join(' ') : '',
          desc: doc.description || '',
          body: doc.content || '',
        };
        dl[i] = {};
        Object.keys(fields).forEach(function (f) {
          var toks = tokenize(fields[f], true);
          dl[i][f] = toks.length;
          var freq = {};
          toks.forEach(function (t) {
            freq[t] = (freq[t] || 0) + 1;
          });
          Object.keys(freq).forEach(function (t) {
            if (!inv[t]) inv[t] = {};
            if (!inv[t][i]) inv[t][i] = {};
            inv[t][i][f] = freq[t];
          });
        });
      });
      var avgdl = {};
      Object.keys(FW).forEach(function (f) {
        var sum = 0;
        for (var i = 0; i < N; i++) sum += (dl[i] && dl[i][f]) || 0;
        avgdl[f] = sum / N || 1;
      });
      var idf = {};
      Object.keys(inv).forEach(function (t) {
        var df = Object.keys(inv[t]).length;
        idf[t] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      });
      return { inv: inv, idf: idf, avgdl: avgdl, dl: dl, N: N, vocab: Object.keys(inv).sort() };
    }

    function bm25(token, docIdx) {
      var entry = idx.inv[token];
      if (!entry || !entry[docIdx]) return 0;
      var termIdf = idx.idf[token] || 0;
      var docDl = idx.dl[docIdx];
      var score = 0;
      Object.keys(FW).forEach(function (f) {
        var tf = entry[docIdx][f] || 0;
        if (!tf) return;
        var avgdl = idx.avgdl[f] || 1;
        var docLen = (docDl && docDl[f]) || 0;
        var tfN = (tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * docLen) / avgdl));
        score += termIdf * tfN * FW[f];
      });
      return score;
    }

    // Prefix search (binary search on sorted vocab)
    function prefixDocMatch(pfx, docIdx) {
      var v = idx.vocab,
        lo = 0,
        hi = v.length - 1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (v[mid] < pfx) lo = mid + 1;
        else hi = mid - 1;
      }
      for (var i = lo; i < v.length && v[i].indexOf(pfx) === 0; i++) if (idx.inv[v[i]][docIdx]) return true;
      return false;
    }
    function prefixBm25(pfx, docIdx) {
      var v = idx.vocab,
        lo = 0,
        hi = v.length - 1,
        best = 0;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (v[mid] < pfx) lo = mid + 1;
        else hi = mid - 1;
      }
      for (var i = lo; i < v.length && v[i].indexOf(pfx) === 0; i++) {
        var s = bm25(v[i], docIdx);
        if (s > best) best = s;
      }
      return best;
    }

    // Query parser
    function parseQuery(raw) {
      var q = raw.trim();
      var p = {
        phrases: [],
        excludePhrases: [],
        excludes: [],
        fields: {},
        orGroups: null,
        terms: [],
        filters: {
          after: null,
          before: null,
          isType: null,
          isFeatured: null,
          hasImage: null,
          wordsMin: null,
          wordsMax: null,
          timeMin: null,
          timeMax: null,
          inTitle: [],
          inUrl: [],
        },
        raw: raw,
      };

      q = q.replace(/\bAND\b/g, ' ');

      q = q.replace(/-(\"[^\"]+\")/g, function (_, ph) {
        var t = ph.slice(1, -1).trim().toLowerCase();
        if (t) p.excludePhrases.push(t);
        return ' ';
      });
      q = q.replace(/\"([^\"]+)\"/g, function (_, ph) {
        var t = ph.trim().toLowerCase();
        if (t) p.phrases.push(t);
        return ' ';
      });

      q = q.replace(/(\w+):(\S+)/g, function (_, field, val) {
        field = field.toLowerCase();
        val = val.toLowerCase();
        switch (field) {
          case 'before':
            p.filters.before = parseFilterDate(val, false);
            break;
          case 'after':
            p.filters.after = parseFilterDate(val, true);
            break;
          case 'is':
            if (val === 'featured') p.filters.isFeatured = true;
            else p.filters.isType = val;
            break;
          case 'has':
            if (val === 'image') p.filters.hasImage = true;
            break;
          case 'words':
            parseNumericFilter(val, 'wordsMin', 'wordsMax', p.filters);
            break;
          case 'time':
            parseNumericFilter(val, 'timeMin', 'timeMax', p.filters);
            break;
          case 'intitle':
            tokenize(val, true).forEach(function (t) {
              p.filters.inTitle.push(t);
            });
            break;
          case 'inurl':
            tokenize(val, false).forEach(function (t) {
              p.filters.inUrl.push(t);
            });
            break;
          case 'site':
            p.fields['topic'] = val;
            break;
          default:
            p.fields[field] = val;
            break;
        }
        return ' ';
      });

      q = q.replace(/-(\S+)/g, function (_, word) {
        var t = stem(word.toLowerCase());
        if (t) p.excludes.push(t);
        return ' ';
      });

      q = q.replace(/\(([^)]+)\)/g, function (_, inner) {
        var parts = inner.split(/\bOR\b/i);
        if (parts.length > 1) {
          var group = [];
          parts.forEach(function (pt) {
            tokenize(pt, true).forEach(function (t) {
              group.push(t);
            });
          });
          if (group.length) {
            if (!p.orGroups) p.orGroups = [];
            p.orGroups.push(group);
          }
          return ' __ORGROUP__ ';
        }
        return inner;
      });

      var parts = q.split(/\bOR\b/i);
      if (parts.length > 1) {
        var topOr = parts
          .map(function (pt) {
            return tokenize(pt.replace('__ORGROUP__', ''), true);
          })
          .filter(function (g) {
            return g.length;
          });
        if (topOr.length > 1) {
          p.orGroups = (p.orGroups || []).concat(topOr);
        } else {
          p.terms = tokenize(q.replace('__ORGROUP__', ''), true);
        }
      } else {
        p.terms = tokenize(q.replace('__ORGROUP__', ''), true);
      }

      return p;
    }

    function parseFilterDate(val, startOfPeriod) {
      var parts = val.split('-');
      var y = parseInt(parts[0], 10);
      if (isNaN(y)) return null;
      var m = parts[1] ? parseInt(parts[1], 10) - 1 : startOfPeriod ? 0 : 11;
      var d = parts[2] ? parseInt(parts[2], 10) : startOfPeriod ? 1 : new Date(y, m + 1, 0).getDate();
      return new Date(y, m, d, startOfPeriod ? 0 : 23, startOfPeriod ? 0 : 59);
    }

    function parseNumericFilter(val, minKey, maxKey, filters) {
      var m;
      if ((m = val.match(/^>(\d+)$/))) {
        filters[minKey] = parseInt(m[1], 10) + 1;
      } else if ((m = val.match(/^<(\d+)$/))) {
        filters[maxKey] = parseInt(m[1], 10) - 1;
      } else if ((m = val.match(/^>=(\d+)$/))) {
        filters[minKey] = parseInt(m[1], 10);
      } else if ((m = val.match(/^<=(\d+)$/))) {
        filters[maxKey] = parseInt(m[1], 10);
      } else if ((m = val.match(/^(\d+)-(\d+)$/))) {
        filters[minKey] = parseInt(m[1], 10);
        filters[maxKey] = parseInt(m[2], 10);
      } else if ((m = val.match(/^(\d+)$/))) {
        filters[minKey] = filters[maxKey] = parseInt(m[1], 10);
      }
    }

    function unstemmedTokens(raw) {
      var extra = [];
      var q = raw
        .replace(/-(\"[^\"]+\")/g, ' ')
        .replace(/\"([^\"]*)\"/g, function (_, p) {
          tokenize(p, false).forEach(function (t) {
            extra.push(t);
          });
          return ' ';
        })
        .replace(/\w+:\S+/g, '')
        .replace(/-\S+/g, '');
      return tokenize(q, false).concat(extra);
    }

    // Score one document
    function scoreDoc(parsed, doc, docIdx) {
      var title = (doc.title || '').toLowerCase();
      var topic = (doc.topic || '').toLowerCase();
      var url = (doc.url || doc.slug || '').toLowerCase();
      var desc = (doc.description || '').toLowerCase();
      var tags = (Array.isArray(doc.tags) ? doc.tags.join(' ') : doc.tags || '').toLowerCase();
      var author = (doc.author || '').toLowerCase();
      var type = (doc.type || 'post').toLowerCase();
      var allText = [title, topic, tags, desc, doc.content || ''].join(' ').toLowerCase();

      var filters = parsed.filters;

      // Hard filters
      for (var e = 0; e < parsed.excludes.length; e++) {
        if (idx.inv[parsed.excludes[e]] && idx.inv[parsed.excludes[e]][docIdx]) return null;
      }

      for (var ep = 0; ep < parsed.excludePhrases.length; ep++) {
        if (allText.indexOf(parsed.excludePhrases[ep]) !== -1) return null;
      }

      for (var ph = 0; ph < parsed.phrases.length; ph++) {
        if (allText.indexOf(parsed.phrases[ph]) === -1) return null;
      }

      var rawTagsArr = (Array.isArray(doc.tags) ? doc.tags : String(doc.tags || '').split(/\s+/))
        .map(function (t) {
          return String(t).toLowerCase();
        })
        .filter(Boolean);

      for (var f in parsed.fields) {
        if (!Object.prototype.hasOwnProperty.call(parsed.fields, f)) continue;
        var fval = parsed.fields[f];
        if (f === 'topic' || f === 'site') {
          if (topic !== fval) return null;
        } else if (f === 'tag' || f === 'tags') {
          if (
            !rawTagsArr.some(function (t) {
              return t === fval;
            })
          )
            return null;
        } else if (f === 'author') {
          if (author.indexOf(fval) === -1) return null;
        } else if (f === 'type') {
          if (type.indexOf(fval) === -1) return null;
        }
      }

      for (var it = 0; it < filters.inTitle.length; it++) {
        var tt = filters.inTitle[it];
        if (title.indexOf(tt) === -1 && !prefixDocMatch(tt, docIdx)) return null;
      }

      for (var iu = 0; iu < filters.inUrl.length; iu++) {
        if (url.indexOf(filters.inUrl[iu]) === -1) return null;
      }

      if (doc.date_iso) {
        var postDate = new Date(doc.date_iso);
        if (filters.after && postDate < filters.after) return null;
        if (filters.before && postDate > filters.before) return null;
      }

      if (filters.isFeatured !== null && filters.isFeatured !== undefined) {
        if (!!doc.featured !== filters.isFeatured) return null;
      }
      if (filters.isType !== null && filters.isType !== undefined) {
        if (type !== filters.isType) return null;
      }
      if (filters.hasImage) {
        var img = doc.image || '';
        if (!img || img.indexOf('social-preview') !== -1) return null;
      }

      if (filters.wordsMin !== null && filters.wordsMin !== undefined && (doc.word_count || 0) < filters.wordsMin)
        return null;
      if (filters.wordsMax !== null && filters.wordsMax !== undefined && (doc.word_count || 0) > filters.wordsMax)
        return null;
      if (filters.timeMin !== null && filters.timeMin !== undefined && (doc.reading_time || 0) < filters.timeMin)
        return null;
      if (filters.timeMax !== null && filters.timeMax !== undefined && (doc.reading_time || 0) > filters.timeMax)
        return null;

      // Scoring
      var score = 0;

      if (parsed.orGroups && parsed.orGroups.length) {
        var matched = false;
        parsed.orGroups.forEach(function (group) {
          var groupHit = group.some(function (t) {
            return (idx.inv[t] && idx.inv[t][docIdx]) || prefixDocMatch(t, docIdx);
          });
          if (groupHit) {
            matched = true;
            group.forEach(function (t) {
              score += bm25(t, docIdx) || prefixBm25(t, docIdx) * 0.8;
            });
          }
        });
        parsed.terms.forEach(function (t) {
          score += bm25(t, docIdx) || prefixBm25(t, docIdx) * 0.8;
        });
        if (!matched && !parsed.terms.length) return null;
      } else {
        for (var ti = 0; ti < parsed.terms.length; ti++) {
          var t = parsed.terms[ti];
          var inI = !!(idx.inv[t] && idx.inv[t][docIdx]);
          var inP = !inI && prefixDocMatch(t, docIdx);
          var inTx = !inI && !inP && allText.indexOf(t) !== -1;
          if (!inI && !inP && !inTx) return null;
          score += inI ? bm25(t, docIdx) : inP ? prefixBm25(t, docIdx) * 0.8 : 0.1;
        }
      }

      // Bonus signals
      parsed.phrases.forEach(function (ph) {
        if (title.indexOf(ph) !== -1) score += 12;
        else if (desc.indexOf(ph) !== -1) score += 4;
        else score += 1;
      });

      var allInTitle =
        parsed.terms.length > 0 &&
        parsed.terms.every(function (t) {
          return title.indexOf(t) !== -1 || prefixDocMatch(t, docIdx);
        });
      if (allInTitle) score += 8;

      if (title === parsed.terms.join(' ') || title === parsed.raw.trim().toLowerCase()) score += 20;

      if (parsed.terms.length > 1) {
        var joined = parsed.terms.join(' ');
        if (allText.indexOf(joined) !== -1) score += 2;
      }

      if (filters.inTitle.length) score += 5;

      if (doc.featured) score += 0.5;

      if (doc.date_iso) {
        var ageDays = (Date.now() - new Date(doc.date_iso).getTime()) / 86400000;
        if (ageDays < 180) score += 1.2 * (1 - ageDays / 180);
      }

      return score;
    }

    // Snippet
    function makeSnippet(doc, rawTerms) {
      var body = doc.content || doc.excerpt || doc.description || '';
      var fallback = doc.excerpt || doc.description || '';
      if (!rawTerms.length || !body) {
        return fallback ? escHtml(fallback.slice(0, 150) + (fallback.length > 150 ? '\u2026' : '')) : '';
      }
      var lower = body.toLowerCase();
      var positions = [];
      rawTerms.forEach(function (tok) {
        var pos = 0,
          found;
        while ((found = lower.indexOf(tok, pos)) !== -1) {
          positions.push(found);
          pos = found + 1;
        }
      });
      if (!positions.length) {
        return fallback ? escHtml(fallback.slice(0, 150) + (fallback.length > 150 ? '\u2026' : '')) : '';
      }
      positions.sort(function (a, b) {
        return a - b;
      });
      var WIN = 220,
        bestStart = Math.max(0, positions[0] - 40),
        bestCount = 0;
      positions.forEach(function (pos) {
        var ws = Math.max(0, pos - 40),
          we = ws + WIN,
          cnt = 0;
        for (var pi = 0; pi < positions.length; pi++) {
          if (positions[pi] >= ws && positions[pi] <= we) cnt++;
        }
        if (cnt > bestCount) {
          bestCount = cnt;
          bestStart = ws;
        }
      });
      var start = bestStart,
        end = Math.min(body.length, start + WIN);
      var snip = (start > 0 ? '\u2026' : '') + body.slice(start, end).trim() + (end < body.length ? '\u2026' : '');
      return highlightTerms(snip, rawTerms);
    }

    function safeUrl(url) {
      var s = String(url || '');
      return /^https?:\/\/|^\//.test(s) ? s : '';
    }

    function renderHits(hits, q, rawTerms) {
      return hits
        .map(function (p) {
          var typeBadge = '';
          if (p.type && p.type !== 'post') {
            typeBadge =
              '<span class="search-result__badge search-result__badge--' +
              escHtml(p.type) +
              '">' +
              escHtml(p.type) +
              '</span>';
          }
          var star = p.featured ? '<span class="search-result__featured" aria-label="Featured">\u2B50</span>' : '';
          var sub = q
            ? makeSnippet(p, rawTerms)
            : p.description
              ? escHtml(p.description.slice(0, 120) + (p.description.length > 120 ? '\u2026' : ''))
              : escHtml(p.date || '');
          return (
            '<a href="' +
            escHtml(safeUrl(p.url)) +
            '" class="search-overlay__result-item" role="option">' +
            '<img src="' +
            escHtml(p.image) +
            '" alt="" loading="eager" class="loaded" width="72" height="48">' +
            '<div>' +
            '<h4>' +
            star +
            highlightTerms(p.title, rawTerms) +
            typeBadge +
            '</h4>' +
            '<span>' +
            sub +
            '</span>' +
            '</div>' +
            '</a>'
          );
        })
        .join('');
    }

    // History / homepage
    var SVG_CLOCK =
      '<svg class="search-history__icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    var SVG_X =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    function showHomepage() {
      if (!cache) {
        results.innerHTML = '';
        return;
      }
      var html = '',
        hist = getHistory();
      if (hist.length) {
        html +=
          '<div class="search-overlay__section-header">' +
          '<span class="search-overlay__section-label">Recent searches</span>' +
          '<button class="search-overlay__clear-btn" data-clear-hist type="button" aria-label="Clear search history">Clear all</button>' +
          '</div><div class="search-overlay__history">';
        hist.forEach(function (q) {
          html +=
            '<button class="search-history__item" data-hist="' +
            escHtml(q) +
            '" type="button" aria-label="Search ' +
            escHtml(q) +
            '">' +
            SVG_CLOCK +
            '<span class="search-history__text">' +
            escHtml(q) +
            '</span>' +
            '<span class="search-history__rm" data-rm="' +
            escHtml(q) +
            '" role="button" tabindex="0" aria-label="Remove ' +
            escHtml(q) +
            ' from history">' +
            SVG_X +
            '</span>' +
            '</button>';
        });
        html += '</div>';
      }
      if (cache.length) {
        html += '<div class="search-overlay__section-label">Recent posts</div>' + renderHits(cache.slice(0, 5), '', []);
      }
      results.innerHTML = html;
      var clearBtn = results.querySelector('[data-clear-hist]');
      if (clearBtn)
        clearBtn.addEventListener('click', function () {
          try {
            localStorage.removeItem(HIST_KEY);
          } catch (e) {}
          showHomepage();
        });
      results.querySelectorAll('.search-history__item').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var rmEl = e.target.closest('[data-rm]');
          if (rmEl) {
            e.stopPropagation();
            removeHistory(rmEl.dataset.rm);
            showHomepage();
            return;
          }
          var q = btn.dataset.hist;
          if (input) {
            input.value = q;
            runSearch(q);
          }
        });
        btn.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          var rmEl = e.target.closest('[data-rm]');
          if (rmEl) {
            e.preventDefault();
            e.stopPropagation();
            removeHistory(rmEl.dataset.rm);
            showHomepage();
          }
        });
      });
    }

    // Focus trap
    function getFocusable() {
      return Array.prototype.slice
        .call(overlay.querySelectorAll('input,button,a,[tabindex]:not([tabindex="-1"])'))
        .filter(function (el) {
          return !el.disabled;
        });
    }
    function trapFocus(e) {
      if (e.key !== 'Tab' || !overlay.classList.contains('is-open')) return;
      var f = getFocusable();
      if (!f.length) return;
      if (e.shiftKey) {
        if (document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        }
      } else {
        if (document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    }

    // Arrow-key navigation
    function getLinks() {
      return Array.prototype.slice.call(results.querySelectorAll('a.search-overlay__result-item'));
    }
    function navResults(e) {
      if (!overlay.classList.contains('is-open')) return;
      var links = getLinks();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIdx = Math.min(focusedIdx + 1, links.length - 1);
        if (links[focusedIdx]) links[focusedIdx].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIdx--;
        if (focusedIdx < 0) {
          focusedIdx = -1;
          if (input) input.focus();
        } else if (links[focusedIdx]) links[focusedIdx].focus();
      }
    }
    if (input) {
      input.addEventListener('keydown', function (e) {
        var links = getLinks();
        if ((e.key === 'ArrowDown' || e.key === 'Tab') && !e.shiftKey && links.length) {
          e.preventDefault();
          focusedIdx = 0;
          links[0].focus();
        } else if (e.key === 'Enter' && links.length) {
          e.preventDefault();
          links[0].click();
        }
      });
    }

    // Reset mobile viewport zoom
    function resetViewportZoom() {
      var vp = document.querySelector('meta[name="viewport"]');
      if (!vp) return;
      var orig = vp.getAttribute('content') || '';
      if (!orig) return;
      vp.setAttribute('content', orig + ', maximum-scale=1');
      setTimeout(function () {
        vp.setAttribute('content', orig);
      }, 60);
    }

    // Open / close
    function openSearch() {
      lastFocused = document.activeElement;
      focusedIdx = -1;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        if (input) input.focus();
      }, 60);
      loadData();
      toggleBtns.forEach(function (b) {
        b.setAttribute('aria-expanded', 'true');
      });
      document.addEventListener('keydown', trapFocus);
      document.addEventListener('keydown', navResults);
    }
    function closeSearch() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (input) input.value = '';
      if (results) results.innerHTML = '';
      focusedIdx = -1;
      toggleBtns.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', navResults);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      resetViewportZoom();
    }

    toggleBtns.forEach(function (b) {
      b.addEventListener('click', openSearch);
    });
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });

    results.addEventListener('click', function (e) {
      var link = e.target.closest('a.search-overlay__result-item');
      if (link && input && input.value.trim()) pushHistory(input.value.trim());
    });
    results.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var link = e.target.closest('a.search-overlay__result-item');
      if (link && input && input.value.trim()) pushHistory(input.value.trim());
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeSearch();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        overlay.classList.contains('is-open') ? closeSearch() : openSearch();
      }
    });

    // Data loading
    function loadData() {
      if (cache !== null) {
        if (input && !input.value.trim()) showHomepage();
        return;
      }
      cache = [];
      fetch('/search.json')
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (d) {
          cache = d;
          idx = buildIndex(d);
          if (overlay.classList.contains('is-open') && input && !input.value.trim()) showHomepage();
        })
        .catch(function () {
          cache = [];
        });
    }

    // Input handler
    if (input && results) {
      input.addEventListener('input', function () {
        focusedIdx = -1;
        clearTimeout(debounce);
        var q = input.value.trim();
        debounce = setTimeout(function () {
          q ? runSearch(q) : showHomepage();
        }, 150);
      });
    }

    // Run search
    function runSearch(rawQ) {
      if (!cache || !cache.length || !idx) {
        results.innerHTML = '';
        return;
      }

      var parsed = parseQuery(rawQ);
      var rawTerms = unstemmedTokens(rawQ);
      var filters = parsed.filters;

      var hasQuery =
        parsed.terms.length ||
        parsed.phrases.length ||
        parsed.orGroups ||
        Object.keys(parsed.fields).length ||
        parsed.excludes.length ||
        parsed.excludePhrases.length ||
        filters.after ||
        filters.before ||
        filters.isFeatured !== null ||
        filters.isType ||
        filters.hasImage ||
        filters.inTitle.length ||
        filters.inUrl.length ||
        filters.wordsMin !== null ||
        filters.wordsMax !== null ||
        filters.timeMin !== null ||
        filters.timeMax !== null;
      if (!hasQuery) {
        showHomepage();
        return;
      }

      var scored = [];
      cache.forEach(function (doc, i) {
        var score = scoreDoc(parsed, doc, i);
        if (score !== null) scored.push({ item: doc, score: score });
      });
      scored.sort(function (a, b) {
        return b.score - a.score;
      });
      var hits = scored.slice(0, 10).map(function (s) {
        return s.item;
      });

      if (!hits.length && parsed.terms.length > 1 && !parsed.phrases.length && !parsed.orGroups) {
        var relaxed = {
          phrases: [],
          excludePhrases: parsed.excludePhrases,
          excludes: parsed.excludes,
          fields: parsed.fields,
          orGroups: [parsed.terms],
          terms: [],
          filters: parsed.filters,
          raw: parsed.raw,
        };
        var relScored = [];
        cache.forEach(function (doc, i) {
          var s = scoreDoc(relaxed, doc, i);
          if (s !== null) relScored.push({ item: doc, score: s });
        });
        relScored.sort(function (a, b) {
          return b.score - a.score;
        });
        var relHits = relScored.slice(0, 8).map(function (s) {
          return s.item;
        });
        if (relHits.length) {
          results.innerHTML =
            '<div class="search-overlay__section-label search-overlay__section-label--muted">No exact matches - showing related results</div>' +
            renderHits(relHits, rawQ, rawTerms);
          return;
        }
      }

      if (!hits.length) {
        var isFilterOnly = !parsed.terms.length && !parsed.phrases.length && !parsed.orGroups;
        results.innerHTML =
          '<div class="search-overlay__empty">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>' +
          '<p>No results for <strong>' +
          escHtml(rawQ) +
          '</strong></p>' +
          '<p class="search-overlay__empty-hint">' +
          (isFilterOnly ? 'No posts match these filters.' : 'Try fewer words, check spelling, or remove operators.') +
          '</p></div>';
        return;
      }

      var label = escHtml(String(scored.length)) + ' result' + (scored.length === 1 ? '' : 's');
      results.innerHTML =
        '<div class="search-overlay__section-label">' + label + '</div>' + renderHits(hits, rawQ, rawTerms);
    }
  }

  document.addEventListener('DOMContentLoaded', initSearch);
})();

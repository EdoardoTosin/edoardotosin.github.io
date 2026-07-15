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
    let html = escHtml(text);
    const seen = {};
    terms.forEach(function (term) {
      if (!term || seen[term]) return;
      seen[term] = true;
      const re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      html = html.replace(re, '<mark>$1</mark>');
    });
    return html;
  }

  // Pure utility functions

  const STOP = {
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

  const stemRules = [
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
    for (let i = 0; i < stemRules.length; i++) {
      const r = w.replace(stemRules[i][0], stemRules[i][1]);
      if (r !== w && r.length >= 3) return r;
    }
    return w;
  }

  function tokenize(text, doStem) {
    if (!text) return [];
    const out = [];
    text
      .toLowerCase()
      .split(/[^\w]+/)
      .forEach(function (w) {
        if (w.length < 2 || STOP[w]) return;
        out.push(doStem ? stem(w) : w);
      });
    return out;
  }

  function parseFilterDate(val, startOfPeriod) {
    const parts = val.split('-');
    const y = parseInt(parts[0], 10);
    if (isNaN(y)) return null;
    const m = parts[1] ? parseInt(parts[1], 10) - 1 : startOfPeriod ? 0 : 11;
    const d = parts[2] ? parseInt(parts[2], 10) : startOfPeriod ? 1 : new Date(y, m + 1, 0).getDate();
    return new Date(
      y,
      m,
      d,
      startOfPeriod ? 0 : 23,
      startOfPeriod ? 0 : 59,
      startOfPeriod ? 0 : 59,
      startOfPeriod ? 0 : 999,
    );
  }

  function parseNumericFilter(val, minKey, maxKey, filters) {
    let m;
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

  // Query tokenizer
  function tokenizeQuery(str) {
    const s = String(str || '');
    const n = s.length;
    const tokens = [];
    let i = 0;
    function isSpace(c) {
      return c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v';
    }
    while (i < n) {
      const c = s[i];
      if (isSpace(c)) {
        i++;
      } else if (c === '(') {
        tokens.push({ t: '(' });
        i++;
      } else if (c === ')') {
        tokens.push({ t: ')' });
        i++;
      } else if (c === '|' && s[i + 1] === '|') {
        tokens.push({ t: 'or' });
        i += 2;
      } else if (c === '&' && s[i + 1] === '&') {
        tokens.push({ t: 'and' });
        i += 2;
      } else if (c === '-' && i + 1 < n && !isSpace(s[i + 1]) && s[i + 1] !== ')') {
        tokens.push({ t: 'not' });
        i++;
      } else if (c === '"' || c === "'") {
        const end = s.indexOf(c, i + 1);
        const val = end === -1 ? s.slice(i + 1) : s.slice(i + 1, end);
        tokens.push({ t: 'phrase', value: val.trim().toLowerCase() });
        i = end === -1 ? n : end + 1;
      } else {
        let j = i;
        while (j < n && !isSpace(s[j]) && s[j] !== '(' && s[j] !== ')') j++;
        const word = s.slice(i, j);
        i = j;
        const upper = word.toUpperCase();
        const colon = word.indexOf(':');
        if (upper === 'OR') tokens.push({ t: 'or' });
        else if (upper === 'AND') tokens.push({ t: 'and' });
        else if (upper === 'NOT') tokens.push({ t: 'not' });
        else if (colon > 0 && colon < word.length - 1)
          tokens.push({ t: 'field', field: word.slice(0, colon).toLowerCase(), value: word.slice(colon + 1) });
        else tokens.push({ t: 'term', value: word });
      }
    }
    return tokens;
  }

  function termAtom(value) {
    const stems = tokenize(value, true);
    const raws = tokenize(value, false);
    if (!stems.length) return null;
    if (stems.length === 1) return { op: 'term', term: stems[0], raw: raws[0] };
    return {
      op: 'and',
      nodes: stems.map(function (t, k) {
        return { op: 'term', term: t, raw: raws[k] };
      }),
    };
  }

  function fieldAtom(field, rawValue) {
    const value = String(rawValue || '').toLowerCase();
    switch (field) {
      case 'topic':
      case 'site':
        return { op: 'field', kind: 'topic', value: value };
      case 'tag':
      case 'tags':
        return { op: 'field', kind: 'tag', value: value };
      case 'author':
        return { op: 'field', kind: 'author', value: value };
      case 'type':
        return { op: 'field', kind: 'type', value: value };
      case 'intitle':
        return { op: 'field', kind: 'intitle', value: value };
      case 'inurl':
        return { op: 'field', kind: 'inurl', value: value };
      case 'after': {
        const d = parseFilterDate(value, true);
        return d ? { op: 'field', kind: 'after', date: d } : termAtom(value);
      }
      case 'before': {
        const d = parseFilterDate(value, false);
        return d ? { op: 'field', kind: 'before', date: d } : termAtom(value);
      }
      case 'is':
        return value === 'featured' ? { op: 'field', kind: 'featured' } : { op: 'field', kind: 'istype', value: value };
      case 'has':
        return value === 'image' ? { op: 'field', kind: 'hasimage' } : termAtom(value);
      case 'words':
      case 'time': {
        const f = {};
        parseNumericFilter(value, 'min', 'max', f);
        if (f.min == null && f.max == null) return termAtom(value);
        return { op: 'field', kind: 'num', metric: field, min: f.min, max: f.max };
      }
      default:
        return termAtom(value);
    }
  }

  // Boolean query parser (precedence: OR < AND < NOT)
  function parseQuery(str) {
    const tokens = tokenizeQuery(str);
    let pos = 0;
    function peek() {
      return tokens[pos];
    }
    function chain(op, a, b) {
      const nodes = a.op === op ? a.nodes.slice() : [a];
      nodes.push(b);
      return { op: op, nodes: nodes };
    }
    function parseOr() {
      let left = parseAnd();
      while (left && peek() && peek().t === 'or') {
        pos++;
        const right = parseAnd();
        if (right) left = chain('or', left, right);
      }
      return left;
    }
    function parseAnd() {
      let left = parseNot();
      while (left && peek() && peek().t !== 'or' && peek().t !== ')') {
        if (peek().t === 'and') pos++;
        const before = pos;
        const right = parseNot();
        if (right) left = chain('and', left, right);
        else if (pos === before) break;
      }
      return left;
    }
    function parseNot() {
      if (peek() && peek().t === 'not') {
        pos++;
        const node = parseNot();
        return node ? { op: 'not', node: node } : null;
      }
      return parseAtom();
    }
    function parseAtom() {
      const tk = peek();
      if (!tk || tk.t === ')') return null;
      if (tk.t === '(') {
        pos++;
        const inner = parseOr();
        if (peek() && peek().t === ')') pos++;
        return inner;
      }
      if (tk.t === 'and' || tk.t === 'or' || tk.t === 'not') {
        pos++;
        return parseAtom();
      }
      pos++;
      if (tk.t === 'phrase') return tk.value ? { op: 'phrase', value: tk.value } : null;
      if (tk.t === 'field') return fieldAtom(tk.field, tk.value);
      return termAtom(tk.value);
    }
    return parseOr() || null;
  }

  function collectPositives(node, neg, acc) {
    if (!node) return;
    if (node.op === 'and' || node.op === 'or') {
      node.nodes.forEach(function (nd) {
        collectPositives(nd, neg, acc);
      });
    } else if (node.op === 'not') {
      collectPositives(node.node, !neg, acc);
    } else if (node.op === 'term' && !neg) {
      acc.terms.push(node.term);
      if (node.raw) acc.rawTerms.push(node.raw);
    } else if (node.op === 'phrase' && !neg) {
      acc.phrases.push(node.value);
      tokenize(node.value, false).forEach(function (w) {
        acc.rawTerms.push(w);
      });
    }
  }

  function numInRange(v, min, max) {
    v = v || 0;
    if (min != null && v < min) return false;
    if (max != null && v > max) return false;
    return true;
  }

  function evaluate(node, doc, termMatch) {
    if (!node) return true;
    switch (node.op) {
      case 'and':
        return node.nodes.every(function (nd) {
          return evaluate(nd, doc, termMatch);
        });
      case 'or':
        return node.nodes.some(function (nd) {
          return evaluate(nd, doc, termMatch);
        });
      case 'not':
        return !evaluate(node.node, doc, termMatch);
      case 'term':
        return termMatch(node.term);
      case 'phrase':
        return doc.text.indexOf(node.value) !== -1;
      case 'field':
        return evalField(node, doc);
      default:
        return true;
    }
  }

  function evalField(node, doc) {
    switch (node.kind) {
      case 'topic':
        return fieldMatch('topic', node.value, doc);
      case 'tag':
        return fieldMatch('tag', node.value, doc);
      case 'author':
        return fieldMatch('author', node.value, doc);
      case 'type':
        return fieldMatch('type', node.value, doc);
      case 'intitle':
        return (
          doc.title.indexOf(node.value) !== -1 ||
          doc.titleTokens.some(function (t) {
            return t.indexOf(node.value) === 0;
          })
        );
      case 'inurl':
        return doc.url.indexOf(node.value) !== -1;
      case 'after':
        return !!doc.date && doc.date >= node.date;
      case 'before':
        return !!doc.date && doc.date <= node.date;
      case 'featured':
        return !!doc.featured;
      case 'istype':
        return doc.type === node.value;
      case 'hasimage':
        return !!doc.image && doc.image.indexOf('social-preview') === -1;
      case 'num':
        return numInRange(node.metric === 'words' ? doc.wordCount : doc.readingTime, node.min, node.max);
      default:
        return true;
    }
  }

  function fieldMatch(field, value, doc) {
    switch (field) {
      case 'topic':
      case 'site':
        return doc.topic.indexOf(value) === 0;
      case 'tag':
      case 'tags':
        return doc.tags.some(function (t) {
          return t.indexOf(value) === 0;
        });
      case 'author':
        return doc.author.indexOf(value) !== -1;
      case 'type':
        return doc.type.indexOf(value) !== -1;
      default:
        return true;
    }
  }

  function initSearch() {
    const overlay = qs('#search-overlay');
    const closeBtn = qs('#search-close');
    const input = qs('#search-input');
    const results = qs('#search-results');
    const toggleBtns = qsa('[data-search-toggle]');
    if (!overlay) return;

    let cache = null;
    let idx = null;
    let debounce;
    let lastFocused = null;
    let focusedIdx = -1;

    const K1 = 1.5,
      B = 0.75;
    const FW = { title: 6, headings: 4, topic: 3, tags: 2.5, kws: 2, desc: 1.5, body: 1 };

    const HIST_KEY = 'jekyll-search-hist',
      HIST_MAX = 6;
    function getHistory() {
      try {
        const raw = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
        if (!Array.isArray(raw)) return [];
        return raw
          .filter(function (q) {
            return typeof q === 'string' && q.length > 0 && q.length <= 200;
          })
          .slice(0, HIST_MAX);
      } catch (e) {
        return [];
      }
    }
    function pushHistory(q) {
      q = String(q).trim();
      if (q.length < 3 || q.length > 200) return;
      const s = stem(q.toLowerCase());
      const h = getHistory().filter(function (x) {
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

    // Index builder
    function buildIndex(docs) {
      const inv = {},
        dl = {},
        N = docs.length;
      docs.forEach(function (doc, i) {
        const fields = {
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
          const toks = tokenize(fields[f], true);
          dl[i][f] = toks.length;
          const freq = {};
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
      const avgdl = {};
      Object.keys(FW).forEach(function (f) {
        let sum = 0;
        for (let i = 0; i < N; i++) sum += (dl[i] && dl[i][f]) || 0;
        avgdl[f] = sum / N || 1;
      });
      const idf = {};
      Object.keys(inv).forEach(function (t) {
        const df = Object.keys(inv[t]).length;
        idf[t] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      });
      return { inv: inv, idf: idf, avgdl: avgdl, dl: dl, N: N, vocab: Object.keys(inv).sort() };
    }

    function bm25(token, docIdx) {
      const entry = idx.inv[token];
      if (!entry || !entry[docIdx]) return 0;
      const termIdf = idx.idf[token] || 0;
      const docDl = idx.dl[docIdx];
      let score = 0;
      Object.keys(FW).forEach(function (f) {
        const tf = entry[docIdx][f] || 0;
        if (!tf) return;
        const avgdl = idx.avgdl[f] || 1;
        const docLen = (docDl && docDl[f]) || 0;
        const tfN = (tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * docLen) / avgdl));
        score += termIdf * tfN * FW[f];
      });
      return score;
    }

    // Prefix search (binary search on sorted vocab)
    function prefixDocMatch(pfx, docIdx) {
      const v = idx.vocab;
      let lo = 0,
        hi = v.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (v[mid] < pfx) lo = mid + 1;
        else hi = mid - 1;
      }
      for (let i = lo; i < v.length && v[i].indexOf(pfx) === 0; i++) if (idx.inv[v[i]][docIdx]) return true;
      return false;
    }
    function prefixBm25(pfx, docIdx) {
      const v = idx.vocab;
      let lo = 0,
        hi = v.length - 1,
        best = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (v[mid] < pfx) lo = mid + 1;
        else hi = mid - 1;
      }
      for (let i = lo; i < v.length && v[i].indexOf(pfx) === 0; i++) {
        const s = bm25(v[i], docIdx);
        if (s > best) best = s;
      }
      return best;
    }

    // Score one document
    function scoreDoc(ast, positives, rawLower, doc, docIdx) {
      const title = (doc.title || '').toLowerCase();
      const topic = (doc.topic || '').toLowerCase();
      const url = (doc.url || doc.slug || '').toLowerCase();
      const desc = (doc.description || '').toLowerCase();
      const tagsArr = (Array.isArray(doc.tags) ? doc.tags : String(doc.tags || '').split(/\s+/))
        .map(function (t) {
          return String(t).toLowerCase();
        })
        .filter(Boolean);
      const type = (doc.type || 'post').toLowerCase();
      const allText = [title, topic, tagsArr.join(' '), desc, doc.content || ''].join(' ').toLowerCase();

      const docView = {
        topic: topic,
        tags: tagsArr,
        author: (doc.author || '').toLowerCase(),
        type: type,
        title: title,
        titleTokens: tokenize(doc.title || '', false),
        url: url,
        text: allText,
        date: doc.date_iso ? new Date(doc.date_iso) : null,
        featured: !!doc.featured,
        image: doc.image || '',
        wordCount: doc.word_count || 0,
        readingTime: doc.reading_time || 0,
      };

      function termMatch(t) {
        return (idx.inv[t] && idx.inv[t][docIdx]) || prefixDocMatch(t, docIdx) || allText.indexOf(t) !== -1;
      }

      if (!evaluate(ast, docView, termMatch)) return null;

      let score = 0;
      const terms = positives.terms;
      terms.forEach(function (t) {
        if (idx.inv[t] && idx.inv[t][docIdx]) score += bm25(t, docIdx);
        else if (prefixDocMatch(t, docIdx)) score += prefixBm25(t, docIdx) * 0.8;
        else if (allText.indexOf(t) !== -1) score += 0.1;
      });

      positives.phrases.forEach(function (ph) {
        if (title.indexOf(ph) !== -1) score += 12;
        else if (desc.indexOf(ph) !== -1) score += 4;
        else score += 1;
      });

      const allInTitle =
        terms.length > 0 &&
        terms.every(function (t) {
          return title.indexOf(t) !== -1 || prefixDocMatch(t, docIdx);
        });
      if (allInTitle) score += 8;

      if (title === terms.join(' ') || title === rawLower) score += 20;

      if (terms.length > 1 && allText.indexOf(terms.join(' ')) !== -1) score += 2;

      if (doc.featured) score += 0.5;

      if (doc.date_iso) {
        const ageDays = (Date.now() - new Date(doc.date_iso).getTime()) / 86400000;
        if (ageDays < 180) score += 1.2 * (1 - ageDays / 180);
      }

      return score;
    }

    // Snippet
    function makeSnippet(doc, rawTerms) {
      const body = doc.content || doc.excerpt || doc.description || '';
      const fallback = doc.excerpt || doc.description || '';
      if (!rawTerms.length || !body) {
        return fallback ? escHtml(fallback.slice(0, 150) + (fallback.length > 150 ? '…' : '')) : '';
      }
      const lower = body.toLowerCase();
      const positions = [];
      rawTerms.forEach(function (tok) {
        let pos = 0;
        let found;
        while ((found = lower.indexOf(tok, pos)) !== -1) {
          positions.push(found);
          pos = found + 1;
        }
      });
      if (!positions.length) {
        return fallback ? escHtml(fallback.slice(0, 150) + (fallback.length > 150 ? '…' : '')) : '';
      }
      positions.sort(function (a, b) {
        return a - b;
      });
      const WIN = 220;
      let bestStart = Math.max(0, positions[0] - 40),
        bestCount = 0;
      positions.forEach(function (pos) {
        const ws = Math.max(0, pos - 40),
          we = ws + WIN;
        let cnt = 0;
        for (let pi = 0; pi < positions.length; pi++) {
          if (positions[pi] >= ws && positions[pi] <= we) cnt++;
        }
        if (cnt > bestCount) {
          bestCount = cnt;
          bestStart = ws;
        }
      });
      const start = bestStart,
        end = Math.min(body.length, start + WIN);
      const snip = (start > 0 ? '…' : '') + body.slice(start, end).trim() + (end < body.length ? '…' : '');
      return highlightTerms(snip, rawTerms);
    }

    function safeUrl(url) {
      const s = String(url || '');
      return /^https?:\/\/|^\//.test(s) ? s : '';
    }

    function renderHits(hits, q, rawTerms) {
      return hits
        .map(function (p) {
          let typeBadge = '';
          if (p.type && p.type !== 'post') {
            typeBadge =
              '<span class="search-overlay__result-badge search-overlay__result-badge--' +
              escHtml(p.type) +
              '">' +
              escHtml(p.type) +
              '</span>';
          }
          const star = p.featured
            ? '<span class="search-overlay__result-featured" aria-label="Featured">⭐</span>'
            : '';
          const sub = q
            ? makeSnippet(p, rawTerms)
            : p.description
              ? escHtml(p.description.slice(0, 120) + (p.description.length > 120 ? '…' : ''))
              : escHtml(p.date || '');
          return (
            '<a href="' +
            escHtml(safeUrl(p.url)) +
            '" class="search-overlay__result-item" role="option">' +
            '<img src="' +
            escHtml(p.image) +
            '" alt="" loading="eager" width="72" height="48">' +
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
    const SVG_CLOCK =
      '<svg class="search-overlay__history-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const SVG_X =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    const rawBase = (overlay.dataset.baseUrl || '').replace(/\/$/, '');
    const NAV_BASE = rawBase === '' || /^https?:\/\//i.test(rawBase) ? rawBase : '';
    const NAV_PAGES = [
      {
        label: 'Home',
        url: NAV_BASE + '/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
      },
      {
        label: 'Blog',
        url: NAV_BASE + '/blog/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
      },
      {
        label: 'Topics',
        url: NAV_BASE + '/topics/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>',
      },
      {
        label: 'Projects',
        url: NAV_BASE + '/projects/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>',
      },
      {
        label: 'About',
        url: NAV_BASE + '/about/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      },
      {
        label: 'Archive',
        url: NAV_BASE + '/archive/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
      },
      {
        label: 'Now',
        url: NAV_BASE + '/now/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
      },
      {
        label: 'Gallery',
        url: NAV_BASE + '/gallery/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
      },
      {
        label: 'Contact',
        url: NAV_BASE + '/contact/',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>',
      },
    ];
    const NAV_ACTIONS = [
      {
        label: 'Toggle theme',
        id: 'toggle-theme',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
      },
      {
        label: 'Toggle high contrast',
        id: 'toggle-contrast',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/></svg>',
      },
      {
        label: 'Toggle reduced motion',
        id: 'toggle-motion',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
      },
    ];

    function actionState(id) {
      const html = document.documentElement;
      const mm = window.matchMedia;
      if (id === 'toggle-theme') {
        const dark = html.getAttribute('data-theme') === 'dark';
        return { on: dark, label: dark ? 'Dark' : 'Light' };
      }
      if (id === 'toggle-contrast') {
        const on = html.getAttribute('data-contrast') === 'on' || !!(mm && mm('(prefers-contrast: more)').matches);
        return { on: on, label: on ? 'On' : 'Off' };
      }
      if (id === 'toggle-motion') {
        const on =
          html.getAttribute('data-motion') === 'reduce' || !!(mm && mm('(prefers-reduced-motion: reduce)').matches);
        return { on: on, label: on ? 'On' : 'Off' };
      }
      return { on: false, label: '' };
    }
    function updateActionState(btn) {
      const st = actionState(btn.dataset.action);
      btn.setAttribute('aria-pressed', String(st.on));
      const badge = btn.querySelector('[data-action-state]');
      if (badge) {
        badge.textContent = st.label;
        badge.classList.toggle('is-on', st.on);
      }
    }
    function renderActions(list) {
      return (
        '<div class="search-overlay__section-label">Settings</div><div class="search-overlay__action-row">' +
        list
          .map(function (a) {
            const st = actionState(a.id);
            return (
              '<button class="search-overlay__action-item" type="button" data-action="' +
              escHtml(a.id) +
              '" aria-pressed="' +
              String(st.on) +
              '"><span aria-hidden="true">' +
              a.svg +
              '</span>' +
              escHtml(a.label) +
              '<span class="search-overlay__action-state' +
              (st.on ? ' is-on' : '') +
              '" data-action-state aria-hidden="true">' +
              escHtml(st.label) +
              '</span></button>'
            );
          })
          .join('') +
        '</div>'
      );
    }

    function showHomepage() {
      overlay.classList.remove('search-overlay--query');
      if (!cache) {
        results.innerHTML = '';
        return;
      }
      let html = '';

      const hist = getHistory();
      if (hist.length) {
        html +=
          '<div class="search-overlay__section-header">' +
          '<span class="search-overlay__section-label">Recent searches</span>' +
          '<button class="search-overlay__clear-btn" data-clear-hist type="button" aria-label="Clear search history">Clear all</button>' +
          '</div><div class="search-overlay__history">';
        hist.forEach(function (q) {
          html +=
            '<button class="search-overlay__history-item" data-hist="' +
            escHtml(q) +
            '" type="button" aria-label="Search ' +
            escHtml(q) +
            '">' +
            SVG_CLOCK +
            '<span class="search-overlay__history-text">' +
            escHtml(q) +
            '</span>' +
            '<span class="search-overlay__history-remove" data-rm="' +
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
      html += renderActions(NAV_ACTIONS);
      if (cache.length) {
        html += '<div class="search-overlay__section-label">Recent posts</div>' + renderHits(cache.slice(0, 5), '', []);
      }
      results.innerHTML = html;

      const clearBtn = results.querySelector('[data-clear-hist]');
      if (clearBtn)
        clearBtn.addEventListener('click', function () {
          try {
            localStorage.removeItem(HIST_KEY);
          } catch (e) {}
          showHomepage();
        });
      results.querySelectorAll('.search-overlay__history-item').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          const rmEl = e.target.closest('[data-rm]');
          if (rmEl) {
            e.stopPropagation();
            removeHistory(rmEl.dataset.rm);
            showHomepage();
            return;
          }
          const q = btn.dataset.hist;
          if (input) {
            input.value = q;
            runSearch(q);
          }
        });
        btn.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          const rmEl = e.target.closest('[data-rm]');
          if (rmEl) {
            e.preventDefault();
            e.stopPropagation();
            removeHistory(rmEl.dataset.rm);
            showHomepage();
          }
        });
      });
    }

    // Arrow-key navigation
    function getLinks() {
      return Array.prototype.slice.call(
        results.querySelectorAll(
          'a.search-overlay__result-item, a.search-overlay__nav-item, button.search-overlay__action-item',
        ),
      );
    }
    function navResults(e) {
      if (!overlay.open) return;
      const links = getLinks();
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
        const links = getLinks();
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
      const vp = document.querySelector('meta[name="viewport"]');
      if (!vp) return;
      const orig = vp.getAttribute('content') || '';
      if (!orig) return;
      vp.setAttribute('content', orig + ', maximum-scale=1');
      setTimeout(function () {
        vp.setAttribute('content', orig);
      }, 60);
    }

    // Open / close
    function openSearch() {
      if (overlay.open) return;
      lastFocused = document.activeElement;
      focusedIdx = -1;
      overlay.showModal();
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        if (input) input.focus();
      }, 60);
      loadData();
      toggleBtns.forEach(function (b) {
        b.setAttribute('aria-expanded', 'true');
      });
      document.addEventListener('keydown', navResults);
    }
    function closeSearch() {
      overlay.close();
      document.body.style.overflow = '';
      if (input) input.value = '';
      if (results) results.innerHTML = '';
      overlay.classList.remove('search-overlay--query');
      focusedIdx = -1;
      toggleBtns.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
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
    // Handle native Escape key on <dialog> before it auto-closes
    overlay.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeSearch();
    });

    document.addEventListener('keydown', function (e) {
      var mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'k') {
        e.preventDefault();
        if (overlay.open) closeSearch();
        else openSearch();
      }
    });

    results.addEventListener('click', function (e) {
      const actionBtn = e.target.closest('.search-overlay__action-item');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === 'toggle-theme') {
          const t = document.querySelector('.theme-toggle');
          if (t) t.click();
        } else if (action === 'toggle-contrast') {
          if (window.a11y) window.a11y.toggleContrast();
        } else if (action === 'toggle-motion') {
          if (window.a11y) window.a11y.toggleMotion();
        }
        updateActionState(actionBtn);
        return;
      }
      const link = e.target.closest('a.search-overlay__result-item');
      if (link && input && input.value.trim()) pushHistory(input.value.trim());
    });
    results.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const link = e.target.closest('a.search-overlay__result-item');
      if (link && input && input.value.trim()) pushHistory(input.value.trim());
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
          if (overlay.open && input) {
            var cur = input.value.trim();
            if (cur) runSearch(cur);
            else showHomepage();
          }
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
        const q = input.value.trim();
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

      const ast = parseQuery(rawQ);
      if (!ast) {
        showHomepage();
        return;
      }
      const positives = { terms: [], rawTerms: [], phrases: [] };
      collectPositives(ast, false, positives);
      const rawTerms = positives.rawTerms;
      const rawLower = rawQ.trim().toLowerCase();

      overlay.classList.add('search-overlay--query');

      const scored = [];
      cache.forEach(function (doc, i) {
        const score = scoreDoc(ast, positives, rawLower, doc, i);
        if (score !== null) scored.push({ item: doc, score: score });
      });
      scored.sort(function (a, b) {
        return b.score - a.score;
      });
      const hits = scored.slice(0, 10).map(function (s) {
        return s.item;
      });

      // Relaxed retry: multi-term AND with no hits → OR of the terms
      const simpleTerms =
        ast.op === 'and' &&
        ast.nodes.every(function (nd) {
          return nd.op === 'term';
        })
          ? ast.nodes
          : null;
      if (!hits.length && simpleTerms && simpleTerms.length > 1) {
        const relaxedAst = { op: 'or', nodes: simpleTerms };
        const relScored = [];
        cache.forEach(function (doc, i) {
          const s = scoreDoc(relaxedAst, positives, rawLower, doc, i);
          if (s !== null) relScored.push({ item: doc, score: s });
        });
        relScored.sort(function (a, b) {
          return b.score - a.score;
        });
        const relHits = relScored.slice(0, 8).map(function (s) {
          return s.item;
        });
        if (relHits.length) {
          results.innerHTML =
            '<div class="search-overlay__section-label search-overlay__section-label--muted">No exact matches - showing related results</div>' +
            renderHits(relHits, rawQ, rawTerms);
          return;
        }
      }

      const lq = rawQ.toLowerCase().trim();
      const matchedPages = NAV_PAGES.filter(function (p) {
        return p.label.toLowerCase().includes(lq);
      });
      const matchedActions = NAV_ACTIONS.filter(function (a) {
        return a.label.toLowerCase().includes(lq) || a.id.replace(/-/g, ' ').includes(lq);
      });
      let quickHtml = '';
      if (matchedPages.length) {
        quickHtml += '<div class="search-overlay__section-label">Navigate</div><div class="search-overlay__nav-grid">';
        matchedPages.forEach(function (p) {
          quickHtml +=
            '<a href="' +
            escHtml(p.url) +
            '" class="search-overlay__nav-item">' +
            '<span aria-hidden="true">' +
            p.svg +
            '</span>' +
            escHtml(p.label) +
            '</a>';
        });
        quickHtml += '</div>';
      }
      if (matchedActions.length) {
        quickHtml += renderActions(matchedActions);
      }

      if (!hits.length) {
        if (quickHtml) {
          results.innerHTML = quickHtml;
          return;
        }
        const isFilterOnly = !positives.terms.length && !positives.phrases.length;
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

      const label = escHtml(String(scored.length)) + ' result' + (scored.length === 1 ? '' : 's');
      results.innerHTML =
        quickHtml + '<div class="search-overlay__section-label">' + label + '</div>' + renderHits(hits, rawQ, rawTerms);
    }

    window.openSearch = openSearch;
  }

  function initFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (!params.has('q')) return;
      var q = (params.get('q') || '').trim();
      var input = qs('#search-input');
      if (!input) return;
      if (q) input.value = q;
      if (typeof window.openSearch === 'function') window.openSearch();
      if (q) input.dispatchEvent(new Event('input'));
    } catch (e) {}
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      initSearch();
      initFromUrl();
    });
  }
  if (typeof module !== 'undefined') {
    module.exports = { stem, tokenize, parseQuery, parseFilterDate, parseNumericFilter, fieldMatch, evaluate };
  }
})();

// webmentions.js - Fetch and render webmentions from webmention.io. Self-contained IIFE.
(function () {
  'use strict';

  const section = document.getElementById('webmentions');
  if (!section) return;

  // Canonical URL of this page (strip hash and query for matching)
  const pageUrl = (window.location.origin + window.location.pathname).replace(/\/$/, '');
  // webmention.io only aggregates multiple targets with the target[] array syntax
  const apiUrl =
    'https://webmention.io/api/mentions.jf2' +
    '?target[]=' +
    encodeURIComponent(pageUrl + '/') +
    '&target[]=' +
    encodeURIComponent(pageUrl) +
    '&sort-by=published&sort-dir=up&per-page=100';

  const likesEl = document.getElementById('webmentions-likes');
  const avatarsEl = document.getElementById('webmentions-avatars');
  const labelEl = document.getElementById('webmentions-likes-label');
  const repliesEl = document.getElementById('webmentions-replies');
  if (!likesEl || !avatarsEl || !labelEl || !repliesEl) return;

  function escHtml(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function safeUrl(url, httpsOnly) {
    if (typeof url !== 'string' || !url) return '';
    try {
      const u = new URL(url);
      return u.protocol === 'https:' || (!httpsOnly && u.protocol === 'http:') ? u.href : '';
    } catch (e) {
      return '';
    }
  }

  function contentText(content) {
    if (!content || typeof content !== 'object') return '';
    if (typeof content.text === 'string' && content.text) return content.text;
    if (typeof content.html !== 'string') return '';
    const doc = new DOMParser().parseFromString(content.html.slice(0, 5000), 'text/html');
    return doc.body ? doc.body.textContent || '' : '';
  }

  function formatDate(iso) {
    if (typeof iso !== 'string' || !iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return iso.slice(0, 10);
    }
  }

  function renderLikes(mentions) {
    const likes = mentions.filter(function (m) {
      return m['wm-property'] === 'like-of' || m['wm-property'] === 'bookmark-of' || m['wm-property'] === 'repost-of';
    });
    if (!likes.length) return false;

    const count = likes.length;
    labelEl.textContent = count + (count === 1 ? ' like / repost' : ' likes / reposts');

    const avatarsHtml = likes
      .map(function (m) {
        const author = m.author && typeof m.author === 'object' ? m.author : {};
        const rawName = String(author.name || 'Anonymous').slice(0, 100);
        const name = escHtml(rawName);
        const url = escHtml(safeUrl(author.url) || safeUrl(m.url) || '#');
        const photo = safeUrl(author.photo, true);
        if (photo) {
          return (
            '<a href="' +
            url +
            '" target="_blank" rel="noopener noreferrer nofollow ugc" title="' +
            name +
            '">' +
            '<img src="' +
            escHtml(photo) +
            '" alt="' +
            name +
            '" width="36" height="36" loading="lazy" referrerpolicy="no-referrer">' +
            '</a>'
          );
        }
        const initials = rawName.charAt(0).toUpperCase();
        return (
          '<a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer nofollow ugc" title="' +
          name +
          '" class="webmentions__avatar-fallback" aria-label="' +
          name +
          '">' +
          escHtml(initials) +
          '</a>'
        );
      })
      .join('');

    avatarsEl.innerHTML = avatarsHtml;
    avatarsEl.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        if (img.parentNode) img.parentNode.remove();
      });
    });
    likesEl.removeAttribute('hidden');
    return true;
  }

  function renderReplies(mentions) {
    const replies = mentions.filter(function (m) {
      const prop = m['wm-property'];
      return prop === 'in-reply-to' || prop === 'mention-of';
    });

    if (!replies.length) {
      repliesEl.innerHTML = '';
      return false;
    }

    const html = replies
      .map(function (m) {
        const author = m.author && typeof m.author === 'object' ? m.author : {};
        const rawName = String(author.name || 'Anonymous').slice(0, 100);
        const name = escHtml(rawName);
        const url = escHtml(safeUrl(m.url) || '#');
        const authorUrl = safeUrl(author.url) ? escHtml(safeUrl(author.url)) : url;
        const published = typeof m.published === 'string' ? m.published : '';
        const date = formatDate(published || m['wm-received']);
        const content = escHtml(contentText(m.content).slice(0, 500));
        const photo = safeUrl(author.photo, true);
        const avatarHtml = photo
          ? '<img src="' +
            escHtml(photo) +
            '" alt="' +
            name +
            '" width="40" height="40" loading="lazy" referrerpolicy="no-referrer">'
          : '<span class="webmentions__reply-avatar-fallback" aria-hidden="true">' +
            escHtml(rawName.charAt(0).toUpperCase()) +
            '</span>';

        return (
          '<article class="webmentions__reply">' +
          '<header class="webmentions__reply-header">' +
          '<a href="' +
          authorUrl +
          '" target="_blank" rel="noopener noreferrer nofollow ugc" class="webmentions__reply-avatar" aria-label="' +
          name +
          '">' +
          avatarHtml +
          '</a>' +
          '<div class="webmentions__reply-meta">' +
          '<a href="' +
          authorUrl +
          '" target="_blank" rel="noopener noreferrer nofollow ugc" class="webmentions__reply-name">' +
          name +
          '</a>' +
          (date
            ? '<time class="webmentions__reply-date" datetime="' + escHtml(published) + '">' + escHtml(date) + '</time>'
            : '') +
          '</div>' +
          '<a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer nofollow ugc" class="webmentions__reply-source" aria-label="View source">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          '</a>' +
          '</header>' +
          (content ? '<p class="webmentions__reply-content">' + content + '</p>' : '') +
          '</article>'
        );
      })
      .join('');

    repliesEl.innerHTML = html;
    repliesEl.querySelectorAll('.webmentions__reply-avatar img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.display = 'none';
      });
    });
    return true;
  }

  function render(data) {
    const mentions = data && Array.isArray(data.children) ? data.children : [];
    const valid = mentions.filter(function (m) {
      return m && typeof m === 'object';
    });
    const hasLikes = renderLikes(valid);
    const hasReplies = renderReplies(valid);
    if (hasLikes || hasReplies) section.removeAttribute('hidden');
  }

  fetch(apiUrl, { credentials: 'omit', referrerPolicy: 'no-referrer' })
    .then(function (r) {
      return r.ok ? r.json() : { children: [] };
    })
    .then(function (data) {
      render(data);
    })
    .catch(function () {
      repliesEl.innerHTML = '';
    });
})();

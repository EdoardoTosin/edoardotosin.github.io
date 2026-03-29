// webmentions.js - Fetch and render webmentions from webmention.io. Self-contained IIFE.
(function () {
  'use strict';

  var section = document.getElementById('webmentions');
  if (!section) return;

  // Canonical URL of this page (strip hash and query for matching)
  var pageUrl = (window.location.origin + window.location.pathname).replace(/\/$/, '');
  var apiUrl =
    'https://webmention.io/api/mentions.jf2' +
    '?target=' +
    encodeURIComponent(pageUrl + '/') +
    '&target=' +
    encodeURIComponent(pageUrl) +
    '&sort-by=published&sort-dir=up&per-page=100';

  var likesEl = document.getElementById('wm-likes');
  var avatarsEl = document.getElementById('wm-avatars');
  var labelEl = document.getElementById('wm-likes-label');
  var repliesEl = document.getElementById('wm-replies');

  function escHtml(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return iso.slice(0, 10);
    }
  }

  function renderLikes(mentions) {
    var likes = mentions.filter(function (m) {
      return m['wm-property'] === 'like-of' || m['wm-property'] === 'bookmark-of' || m['wm-property'] === 'repost-of';
    });
    if (!likes.length) return;

    var count = likes.length;
    labelEl.textContent = count + (count === 1 ? ' like / repost' : ' likes / reposts');

    var avatarsHtml = likes
      .map(function (m) {
        var author = m.author || {};
        var name = escHtml(author.name || 'Anonymous');
        var url = escHtml(author.url || m.url || '#');
        var photo = author.photo;
        if (photo) {
          return (
            '<a href="' +
            url +
            '" target="_blank" rel="noopener noreferrer" title="' +
            name +
            '">' +
            '<img src="' +
            escHtml(photo) +
            '" alt="' +
            name +
            '" width="36" height="36" loading="lazy" onerror="this.parentNode.remove()">' +
            '</a>'
          );
        }
        var initials = (author.name || 'A').charAt(0).toUpperCase();
        return (
          '<a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" title="' +
          name +
          '" class="wm-avatar-fallback" aria-label="' +
          name +
          '">' +
          escHtml(initials) +
          '</a>'
        );
      })
      .join('');

    avatarsEl.innerHTML = avatarsHtml;
    likesEl.removeAttribute('hidden');
  }

  function renderReplies(mentions) {
    var replies = mentions.filter(function (m) {
      var prop = m['wm-property'];
      return prop === 'in-reply-to' || prop === 'mention-of';
    });

    if (!replies.length) {
      repliesEl.innerHTML = '';
      return;
    }

    var html = replies
      .map(function (m) {
        var author = m.author || {};
        var name = escHtml(author.name || 'Anonymous');
        var url = escHtml(m.url || '#');
        var date = formatDate(m.published || m['wm-received']);
        var content = m.content ? escHtml((m.content.text || m.content.html || '').slice(0, 500)) : '';
        var photo = author.photo;
        var avatarHtml = photo
          ? '<img src="' +
            escHtml(photo) +
            '" alt="' +
            name +
            '" width="40" height="40" loading="lazy" onerror="this.style.display=\'none\'">'
          : '<span class="wm-reply__avatar-fallback" aria-hidden="true">' +
            escHtml((author.name || 'A').charAt(0).toUpperCase()) +
            '</span>';

        return (
          '<article class="wm-reply" role="comment">' +
          '<header class="wm-reply__header">' +
          '<a href="' +
          escHtml(author.url || url) +
          '" target="_blank" rel="noopener noreferrer" class="wm-reply__avatar" aria-label="' +
          name +
          '">' +
          avatarHtml +
          '</a>' +
          '<div class="wm-reply__meta">' +
          '<a href="' +
          escHtml(author.url || url) +
          '" target="_blank" rel="noopener noreferrer" class="wm-reply__name">' +
          name +
          '</a>' +
          (date
            ? '<time class="wm-reply__date" datetime="' + escHtml(m.published || '') + '">' + escHtml(date) + '</time>'
            : '') +
          '</div>' +
          '<a href="' +
          url +
          '" target="_blank" rel="noopener noreferrer" class="wm-reply__source" aria-label="View source">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          '</a>' +
          '</header>' +
          (content ? '<p class="wm-reply__content">' + content + '</p>' : '') +
          '</article>'
        );
      })
      .join('');

    repliesEl.innerHTML = html;
  }

  function render(data) {
    var mentions = data && data.children ? data.children : [];
    renderLikes(mentions);
    renderReplies(mentions);
  }

  fetch(apiUrl)
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

/* ═══════════════════════════════════════════════════════
   SMY Content Loader — applique content.json au DOM
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HTML_KEYS = [
    'hero-desc', 'hours', 'addr-full', 'siret-text',
    'rge-desc', 'certif1-desc', 'certif2-desc', 'certif3-desc', 'certif4-desc',
    'zone-ext-text'
  ];

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function applyField(key, value) {
    if (value === undefined || value === null) return;

    /* Gallery array — handled before string conversion */
    if (key === 'gallery' && Array.isArray(value)) {
      buildGallery(value);
      return;
    }

    var v = String(value);
    var num = function () { var m = key.match(/\d+/); return m ? parseInt(m[0]) : 1; };

    switch (true) {

      case key === 'phone':
        document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
          var clean = v.replace(/[\s.\-]/g, '');
          a.href = 'tel:+33' + (clean.startsWith('0') ? clean.slice(1) : clean);
          if (!a.querySelector('i, img, span')) a.textContent = v;
        });
        break;

      case key === 'email':
        document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
          a.href = 'mailto:' + v;
          if (!a.querySelector('i, img, span')) a.textContent = v;
        });
        break;

      case key === 'typed-words': {
        var words = v.split('|').map(function (w) { return w.trim(); }).filter(Boolean);
        if (words.length && window.SMY_setTypedWords) window.SMY_setTypedWords(words);
        break;
      }

      case /^stat\d-val$/.test(key): {
        var items = document.querySelectorAll('.stat-item');
        var item = items[num() - 1];
        if (item) {
          var count = item.querySelector('.count');
          if (count) { count.dataset.target = v; count.textContent = v; }
        }
        break;
      }

      case /^stat\d-lbl$/.test(key): {
        var items = document.querySelectorAll('.stat-item');
        var item = items[num() - 1];
        if (item) {
          var lbl = item.querySelector('.stat-lbl');
          if (lbl) lbl.textContent = v;
        }
        break;
      }

      case /^svc\d-title$/.test(key): {
        var cards = document.querySelectorAll('.svc-card');
        var card = cards[num() - 1];
        if (card) { var h3 = card.querySelector('h3'); if (h3) h3.textContent = v; }
        break;
      }

      case /^svc\d-desc$/.test(key): {
        var cards = document.querySelectorAll('.svc-card');
        var card = cards[num() - 1];
        if (card) { var p = card.querySelector('p'); if (p) p.textContent = v; }
        break;
      }

      case key === 'about-photo': {
        var el = document.querySelector('.about-photo');
        if (el) el.src = v;
        break;
      }

      case key === 'zone-primary-towns': {
        var el = document.querySelector('[data-content="zone-primary-towns"]');
        if (el) {
          el.innerHTML = v.split('|').map(function (t) {
            return '<span>' + escHtml(t.trim()) + '</span>';
          }).join('');
        }
        break;
      }

      /* Generic fallback — any element with matching data-content attribute */
      default: {
        var els = document.querySelectorAll('[data-content="' + key + '"]');
        if (els.length) {
          var isHtml = HTML_KEYS.indexOf(key) !== -1;
          els.forEach(function (el) {
            if (isHtml) el.innerHTML = v;
            else el.textContent = v;
          });
        }
        break;
      }
    }
  }

  function buildGallery(photos) {
    var grid = document.getElementById('galleryGrid');
    if (!grid || !photos.length) return;
    grid.innerHTML = '';
    photos.forEach(function (photo, idx) {
      var item = document.createElement('div');
      item.className = 'gal-item' + (idx === 1 ? ' large' : '');
      item.dataset.cat = photo.cat || 'other';

      var img = document.createElement('img');
      img.src = photo.src || '';
      img.alt = photo.title || '';

      var overlay = document.createElement('div');
      overlay.className = 'gal-overlay';

      var info = document.createElement('div');
      info.className = 'gal-info';
      info.innerHTML = '<h4>' + escHtml(photo.title || '') + '</h4><p>' + escHtml(photo.loc || '') + '</p>';

      var btn = document.createElement('button');
      btn.className = 'gal-zoom';
      btn.dataset.title = photo.title || '';
      btn.dataset.loc = photo.loc || '';
      btn.dataset.img = photo.src || '';
      btn.innerHTML = '<i class="fas fa-expand-alt"></i>';

      overlay.appendChild(info);
      overlay.appendChild(btn);
      item.appendChild(img);
      item.appendChild(overlay);
      grid.appendChild(item);
    });

    window.dispatchEvent(new CustomEvent('smy:gallery-ready'));
  }

  function loadContent() {
    fetch('content.json?_=' + Date.now())
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        Object.keys(data).forEach(function (k) { applyField(k, data[k]); });
      })
      .catch(function () {});
  }

  window.SMY = { applyField: applyField };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();

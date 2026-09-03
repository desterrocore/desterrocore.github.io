/* ---------------------------------------------------------------------------
   desterrocore — behaviour
   Vanilla JS, no dependencies, no build step.

   Everything here is progressive enhancement. With JavaScript disabled the
   page is complete and readable in pt-BR, which is the default language and
   lives directly in the HTML.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     CONTACT
     Fill these in when the professional e-mail and the LinkedIn profile exist
     (see TODO.md). Leave a value empty and its block simply is not rendered.

     The e-mail is assembled at runtime from its parts so the literal address
     never sits in the HTML source for naive scrapers to harvest.
     ------------------------------------------------------------------------- */
  var CONTACT = {
    emailUser: '',            // e.g. 'lennon'
    emailDomain: '',          // e.g. 'desterrocore.dev'
    linkedin: ''              // e.g. 'https://www.linkedin.com/in/…'
  };

  var DEFAULT_LANG = 'pt';
  var LANGS = { pt: 'pt-BR', en: 'en-US' };
  var STORAGE_KEY = 'desterrocore:lang';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =========================================================================
     1. i18n
     -------------------------------------------------------------------------
     pt-BR is authored inline in index.html. On load we snapshot it from the
     DOM, which becomes the pt dictionary — so the two languages can never
     drift out of key coverage. en-US comes from assets/js/i18n.js. Any key
     missing from the en table falls back to the Portuguese, never to blank.
     ========================================================================= */

  var EN = (window.DESTERROCORE_I18N && window.DESTERROCORE_I18N.en) || {};
  var current = DEFAULT_LANG;
  var PT = Object.create(null);          // captured from the DOM below
  var nodes = [];                        // [{el, key, mode}]
  var attrNodes = [];                    // [{el, attr, key}]

  function captureBaseline() {
    var i, el, list;

    list = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      var key = el.getAttribute('data-i18n');
      var mode = el.hasAttribute('data-i18n-html') ? 'html' : 'text';
      PT[key] = mode === 'html' ? el.innerHTML : el.textContent;
      nodes.push({ el: el, key: key, mode: mode });
    }

    list = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      var pairs = el.getAttribute('data-i18n-attr').split(',');
      for (var p = 0; p < pairs.length; p++) {
        var bits = pairs[p].split(':');
        if (bits.length !== 2) continue;
        var attr = bits[0].trim();
        var akey = bits[1].trim();
        if (!(akey in PT)) PT[akey] = el.getAttribute(attr) || '';
        attrNodes.push({ el: el, attr: attr, key: akey });
      }
    }
  }

  var YEAR = String(new Date().getFullYear());

  function resolve(key, lang) {
    var dict = lang === 'en' ? EN : PT;
    var value = dict[key];
    if (value === undefined || value === null || value === '') value = PT[key];
    if (value === undefined || value === null) return '';
    return String(value).replace(/\{year\}/g, YEAR);
  }

  function applyLang(lang) {
    var i, n;

    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      var value = resolve(n.key, lang);
      if (n.mode === 'html') n.el.innerHTML = value;
      else n.el.textContent = value;
    }

    for (i = 0; i < attrNodes.length; i++) {
      n = attrNodes[i];
      n.el.setAttribute(n.attr, resolve(n.key, lang));
    }

    root.setAttribute('lang', LANGS[lang] || LANGS[DEFAULT_LANG]);
    root.setAttribute('data-lang', lang);

    var buttons = document.querySelectorAll('[data-lang-btn]');
    for (i = 0; i < buttons.length; i++) {
      var active = buttons[i].getAttribute('data-lang-btn') === lang;
      buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
      buttons[i].classList.toggle('is-active', active);
    }

    /* Keep the URL shareable: ?lang=en survives a copy-paste, pt-BR is bare.
       The canonical link follows it, so each language version canonicalises to
       itself and the hreflang pair in the head stays valid. */
    try {
      var url = new URL(window.location.href);
      if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
      else url.searchParams.set('lang', lang);
      url.hash = url.hash === '#en' || url.hash === '#pt' ? '' : url.hash;
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);

      var canonical = document.querySelector('[data-canonical]');
      if (canonical && window.location.protocol.indexOf('http') === 0) {
        /* Derived, not hard-coded: correct on the custom domain, on the
           github.io fallback, and on a local preview. */
        canonical.setAttribute('href',
          window.location.origin + url.pathname + (lang === DEFAULT_LANG ? '' : '?lang=' + lang));
      }
    } catch (e) { /* older browsers: the URL simply stays as it is */ }

    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  /* Announced only after a deliberate switch — not on first paint, which would
     make every visit start with a screen-reader interruption. */
  function announceLang(lang) {
    var region = document.querySelector('[data-lang-status]');
    if (!region) return;
    region.setAttribute('lang', LANGS[lang]);
    region.textContent = lang === 'en'
      ? 'Language changed to English.'
      : 'Idioma alterado para português.';
  }

  function initialLang() {
    var q, stored;
    try {
      q = new URL(window.location.href).searchParams.get('lang');
    } catch (e) { q = null; }
    if (!q) {
      var h = (window.location.hash || '').replace('#', '').toLowerCase();
      if (h === 'en' || h === 'pt') q = h;
    }
    if (q) {
      q = q.toLowerCase().slice(0, 2);
      if (q === 'en' || q === 'pt') return q;
    }
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'pt') return stored;
    } catch (e) {}
    return DEFAULT_LANG;   /* pt-BR always wins by default, never navigator.language */
  }

  function initI18n() {
    captureBaseline();

    current = initialLang();
    applyLang(current);

    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-lang-btn]') : null;
      if (!btn) return;
      ev.preventDefault();
      var next = btn.getAttribute('data-lang-btn');
      if (next === current) return;
      current = next;
      applyLang(current);
      announceLang(current);
    });

    /* Alt+L cycles the language for keyboard users. */
    document.addEventListener('keydown', function (ev) {
      if (!ev.altKey || ev.ctrlKey || ev.metaKey) return;
      /* Match the physical key: Option+L on macOS produces "¬", not "l". */
      if (ev.code !== 'KeyL' && (ev.key || '').toLowerCase() !== 'l') return;
      ev.preventDefault();
      current = current === 'pt' ? 'en' : 'pt';
      applyLang(current);
      announceLang(current);
    });
  }

  /* =========================================================================
     2. Contact blocks
     ========================================================================= */

  function initContact() {
    var emailBlock = document.querySelector('[data-contact="email"]');
    var linkedinBlock = document.querySelector('[data-contact="linkedin"]');

    if (emailBlock && CONTACT.emailUser && CONTACT.emailDomain) {
      var address = CONTACT.emailUser + '@' + CONTACT.emailDomain;
      var link = emailBlock.querySelector('[data-contact-link]');
      if (link) {
        link.setAttribute('href', 'mailto:' + address);
        var slot = link.querySelector('[data-contact-value]') || link;
        slot.textContent = address;
      }
      var copy = emailBlock.querySelector('[data-copy]');
      if (copy && navigator.clipboard) {
        copy.hidden = false;
        var label = copy.querySelector('.channel__copytext');
        var say = function (which) {
          if (label) label.textContent = copy.getAttribute('data-' + which) || '';
        };
        var rest = function () {
          copy.classList.remove('is-copied', 'is-failed');
          /* The resting label is a normal translated node, so it resolves the
             same way every other string on the page does. */
          if (label) label.textContent = resolve('x.ui.copy', current);
        };
        copy.addEventListener('click', function () {
          navigator.clipboard.writeText(address).then(function () {
            copy.classList.add('is-copied');
            say('done');
            var region = document.querySelector('[data-lang-status]');
            if (region) region.textContent = copy.getAttribute('data-done') || '';
            window.setTimeout(rest, 1600);
          }, function () {
            /* Denied, or the document lost focus. Select the address so it can
               still be copied by hand rather than failing silently. */
            copy.classList.add('is-failed');
            say('failed');
            window.setTimeout(rest, 2200);
            try {
              var sel = window.getSelection();
              sel.removeAllRanges();
              var range = document.createRange();
              range.selectNodeContents(link);
              sel.addRange(range);
            } catch (e) {}
          });
        });
      }
      emailBlock.hidden = false;
    }

    if (linkedinBlock && CONTACT.linkedin) {
      var li = linkedinBlock.querySelector('[data-contact-link]');
      if (li) {
        li.setAttribute('href', CONTACT.linkedin);
        var liSlot = li.querySelector('[data-contact-value]');
        /* Derive the visible handle from the URL so the two cannot disagree. */
        if (liSlot) {
          var handle = CONTACT.linkedin.replace(/\/+$/, '').split('/').pop();
          liSlot.textContent = handle ? 'in/' + handle : CONTACT.linkedin;
        }
      }
      linkedinBlock.hidden = false;
    }
  }

  /* =========================================================================
     3. Navigation — mobile drawer + scroll spy
     ========================================================================= */

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    var header = document.querySelector('[data-header]');

    if (toggle && nav) {
      var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };

      var close = function (returnFocus) {
        if (!isOpen()) return;
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        root.classList.remove('nav-open');
        if (returnFocus) toggle.focus();
      };

      toggle.addEventListener('click', function () {
        if (isOpen()) { close(true); return; }
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        root.classList.add('nav-open');
        var first = nav.querySelector('a');
        if (first) first.focus();
      });

      nav.addEventListener('click', function (ev) {
        if (ev.target.closest('a')) close(false);
      });

      /* Tab out of the panel and it closes, rather than leaving an open drawer
         over content the focus ring has moved behind. */
      document.addEventListener('focusin', function (ev) {
        if (!isOpen()) return;
        if (nav.contains(ev.target) || toggle.contains(ev.target)) return;
        close(false);
      });
      document.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Escape') return;
        close(true);
      });
    }

    /* Condense the header once the hero is behind us. */
    if (header) {
      var sentinel = document.querySelector('[data-header-sentinel]');
      if (sentinel && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          header.classList.toggle('is-stuck', !entries[0].isIntersecting);
        }, { rootMargin: '-4px 0px 0px 0px' }).observe(sentinel);
      }
    }

    /* Scroll spy. */
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    var visible = Object.create(null);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      var best = null;
      sections.forEach(function (s) {
        if (visible[s.id]) best = s.id;   /* document order: the deepest wins */
      });
      links.forEach(function (a) {
        var on = best && a.getAttribute('href') === '#' + best;
        a.classList.toggle('is-current', !!on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* =========================================================================
     4. Reveal on scroll — a log-line style entrance, off under reduced motion
     ========================================================================= */

  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    function revealAll() {
      root.classList.remove('reveal-enabled');
      items.forEach(function (el) { el.classList.add('is-revealed'); });
    }

    /* Nothing is hidden until this function decides to hide it, so a failure
       anywhere before this point can never leave the page blank. */
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    root.classList.add('reveal-enabled');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    /* Anything already at or above the fold is marked revealed in the same
       frame it is hidden, so the first screen never blinks and never waits on
       the observer — including when the visitor lands on a deep link. */
    var fold = window.innerHeight || document.documentElement.clientHeight;
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) el.classList.add('is-revealed');
      else io.observe(el);
    });

    /* Honour a preference change made after load. */
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function (e) { if (e.matches) revealAll(); });
    }
  }

  /* =========================================================================
     5. Counters
     ========================================================================= */

  function initCounters() {
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count-to]'));
    if (!counters.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
      return;
    }

    function padded(value, width) {
      var s = String(value);
      return s.length < width ? new Array(width - s.length + 1).join('0') + s : s;
    }

    function run(el) {
      var raw = el.getAttribute('data-count-to');
      var target = parseInt(raw, 10) || 0;
      var pad = raw.length;
      var start = null;
      var duration = 900;
      function frame(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / duration);
        el.textContent = padded(Math.round(target * (1 - Math.pow(1 - t, 3))), pad);
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.6 });

    /* Only zero a counter that is genuinely off screen — the authored value is
       already correct, and replacing it with 0 for a counter nobody will
       scroll to would leave a wrong number on the page for good. */
    var fold = window.innerHeight || document.documentElement.clientHeight;
    counters.forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) { run(el); return; }
      el.textContent = padded(0, el.getAttribute('data-count-to').length);
      io.observe(el);
    });
  }

  /* =========================================================================
     6. Boot
     ========================================================================= */

  function stampYear() {
    var slots = document.querySelectorAll('[data-year]');
    for (var i = 0; i < slots.length; i++) slots[i].textContent = YEAR;
  }

  function boot() {
    stampYear();
    initI18n();
    initContact();
    initNav();
    initReveal();
    initCounters();
    root.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

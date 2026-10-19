(function () {
  var d = document, html = d.documentElement, page = d.body.getAttribute('data-page') || '';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var spyCompute = null, gridFix = null;

  /* Tema: HTML je unapred u tamnoj temi; data-ls čuva svetle stilove */
  function setTheme(dark) {
    html.classList.toggle('om-dark', dark);
    d.querySelectorAll('[data-ls]').forEach(function (el) {
      if (dark) { if (el.hasAttribute('data-ds')) el.setAttribute('style', el.getAttribute('data-ds')); }
      else { if (!el.hasAttribute('data-ds')) el.setAttribute('data-ds', el.getAttribute('style') || ''); el.setAttribute('style', el.getAttribute('data-ls')); }
    });
    if (gridFix) gridFix();
    if (spyCompute) spyCompute(true);
  }
  if (!html.classList.contains('om-dark')) setTheme(false);
  d.querySelectorAll('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var dark = !html.classList.contains('om-dark');
      try { localStorage.setItem('ff-theme', dark ? 'dark' : 'light'); } catch (e) {}
      setTheme(dark);
    });
  });

  /* Mobilni meni */
  var menu = d.getElementById('mobilni-meni'), navBtn = d.querySelector('[data-act="toggleNav"]');
  function setNav(open) { if (!menu) return; menu.hidden = !open; if (navBtn) navBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  if (navBtn) navBtn.addEventListener('click', function () { setNav(menu.hidden); });
  d.querySelectorAll('[data-act="closeNav"]').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  d.querySelectorAll('[data-act="goTop"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); setNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  /* Skrol na #sekciju pri učitavanju */
  (function () {
    var go = function () {
      var id = (location.hash || '').slice(1); if (!id) return;
      var el = d.getElementById(decodeURIComponent(id)); if (!el) return;
      var top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: top > 0 ? top : 0, behavior: 'auto' });
    };
    setTimeout(go, 60); setTimeout(go, 400);
    window.addEventListener('hashchange', function () { setTimeout(go, 30); });
  })();

  /* Poslednja kartica u mreži popunjava red */
  (function () {
    var sels = page === 'home' ? '[data-zasto],[data-online-info],[data-edu-info]' : '[data-zasto],[data-ponuda],[data-online-info],[data-edu-info]';
    if (page === 'prostor' || page === 'privatnost') return;
    gridFix = function () {
      d.querySelectorAll(sels).forEach(function (g) {
        var kids = Array.prototype.slice.call(g.children); if (!kids.length) return;
        kids.forEach(function (k) { k.style.gridColumn = ''; });
        var cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
        if (cols < 2) return;
        var rest = kids.length % cols; if (rest === 0) return;
        kids[kids.length - 1].style.gridColumn = 'span ' + (cols - rest + 1);
      });
    };
    gridFix(); window.addEventListener('resize', gridFix); setTimeout(gridFix, 400);
  })();

  /* Aktivna stavka menija pri skrolu */
  (function () {
    var home = page === 'home';
    var links = Array.prototype.slice.call(d.querySelectorAll(home ? '[data-nav-desktop] a[data-spy]' : '[data-idx] a[data-spy]'));
    if (!links.length) return;
    var targets = links.map(function (a) { return { a: a, el: d.getElementById(a.getAttribute('href').slice(1)) }; }).filter(function (t) { return t.el; });
    var cur = null, ticking = false;
    spyCompute = function (force) {
      ticking = false;
      var y = window.scrollY + (home ? 150 : 170), c = null;
      targets.forEach(function (t) { if (t.el.getBoundingClientRect().top + window.scrollY <= y) c = t.a; });
      if (window.innerHeight + window.scrollY >= d.documentElement.scrollHeight - 4) c = links[links.length - 1];
      if (c === cur && !force) return; cur = c;
      links.forEach(function (a) {
        var on = a === c;
        if (home) { a.style.fontWeight = on ? '700' : '500'; a.style.borderBottomColor = on ? '#FFC400' : 'transparent'; return; }
        a.style.color = on ? (html.classList.contains('om-dark') ? '#FAF8F0' : '#17160F') : '';
        a.style.borderBottomColor = on ? '#FFC400' : 'transparent';
        if (on) {
          var bar = a.parentElement;
          if (bar && bar.scrollWidth > bar.clientWidth + 4) {
            var tl = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
            bar.scrollTo({ left: tl > 0 ? tl : 0, behavior: 'smooth' });
          }
        }
      });
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { spyCompute(); }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    spyCompute();
  })();

  /* Lepljiva traka sa sadržajem (Edukacija, Online) */
  (function () {
    var hdr = d.querySelector('#dc-root header'), bar = d.querySelector('nav[aria-label="Sadržaj"]');
    if (!hdr || !bar) return;
    var apply = function () {
      var hh = Math.round(hdr.getBoundingClientRect().height); if (!(hh > 0)) return;
      bar.style.setProperty('top', hh + 'px', 'important');
      d.querySelectorAll('#dc-root main section[id]').forEach(function (s) { s.style.scrollMarginTop = (hh + Math.round(bar.getBoundingClientRect().height) + 12) + 'px'; });
    };
    apply(); window.addEventListener('resize', apply); setTimeout(apply, 400);
  })();

  if (page === 'home') {
    /* Visina zaglavlja za hero */
    var fit = function () {
      var r = html.style, hd = d.querySelector('#dc-root header'), bj = d.querySelector('[data-brojke-sec]');
      if (hd) r.setProperty('--ff-hdr', hd.offsetHeight + 'px'); if (bj) r.setProperty('--ff-brj', bj.offsetHeight + 'px');
    };
    fit(); window.addEventListener('resize', fit);

    /* Brojke: animacija samo ako traka nije već vidljiva */
    (function () {
      var wrap = d.querySelector('[data-brojke]'); if (!wrap || reduce || !('IntersectionObserver' in window)) return;
      if (wrap.getBoundingClientRect().top < window.innerHeight) return;
      var stats = Array.prototype.slice.call(wrap.querySelectorAll('[data-stat]'));
      stats.forEach(function (el) { el.style.transformOrigin = 'left center'; el.style.opacity = '0'; el.style.transform = 'scale(.5)'; el.style.transition = 'transform .7s cubic-bezier(.34,1.56,.64,1), opacity .5s ease'; });
      var run = function (el, i) {
        setTimeout(function () {
          el.style.opacity = '1'; el.style.transform = 'none';
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (isFinite(target)) {
            var suf = el.getAttribute('data-suffix') || '', t0 = performance.now();
            var tick = function (t) { var p = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); };
            requestAnimationFrame(tick);
          }
        }, i * 150);
      };
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); stats.forEach(run); } }); }, { threshold: 0.35 });
      io.observe(wrap);
    })();

    /* Kontakt forma */
    (function () {
      var form = d.querySelector('form[data-act="submitForm"]'); if (!form) return;
      var EMAIL = 'fitfabrika.rs@gmail.com';
      var $ = function (s) { return form.querySelector(s); };
      var fName = $('#f-ime'), fEmail = $('#f-email'), fTel = $('#f-tel'), fTopic = $('select'), fMsg = $('textarea'), fOk = $('#f-saglasnost');
      var eEmail = $('#f-email-err'), eTel = $('#f-tel-err'), btn = $('button[type="submit"]'), sent = $('[data-ff-sent]'), sendErr = $('[data-ff-senderr]');
      var touched = { email: false, tel: false }, sending = false;
      var phoneError = function (v) {
        var raw = (v || '').trim();
        if (!raw) return 'Unesite broj telefona.';
        if (/[^0-9\s]/.test(raw)) return 'Dozvoljene su samo cifre (bez slova i znakova).';
        var dg = raw.replace(/\D/g, '');
        if (dg[0] === '0') return 'Bez vodeće nule — npr. 63 785 0515.';
        if (dg.length < 8) return 'Broj je prekratak — 8 do 9 cifara posle +381.';
        if (dg.length > 9) return 'Broj je predugačak — 8 do 9 cifara posle +381.';
        return '';
      };
      var emailOk = function () { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.value.trim()); };
      var show = function (el, msg) { if (!el) return; el.textContent = msg; el.hidden = !msg; };
      var update = function () {
        show(eTel, touched.tel ? phoneError(fTel.value) : '');
        show(eEmail, touched.email && !emailOk() ? (fEmail.value.trim() ? 'Neispravan email.' : 'Unesite email.') : '');
        var valid = !!fName.value.trim() && !phoneError(fTel.value) && emailOk() && fOk.checked;
        btn.disabled = !valid || sending;
        btn.style.cursor = valid && !sending ? 'pointer' : 'not-allowed';
        btn.style.opacity = valid && !sending ? '' : '0.45';
        btn.textContent = sending ? 'Šaljem…' : 'Pošalji upit';
      };
      fEmail.addEventListener('input', function () { touched.email = true; update(); });
      fTel.addEventListener('input', function () { touched.tel = true; update(); });
      [fName, fOk].forEach(function (el) { el.addEventListener('input', update); el.addEventListener('change', update); });
      var syncTopic = function () { form.classList.toggle('online-on', fTopic.value === 'Online treninzi'); };
      fTopic.addEventListener('change', syncTopic); syncTopic();
      form.addEventListener('submit', function (e) {
        e.preventDefault(); if (sending) return;
        if (!fName.value.trim() || phoneError(fTel.value) || !emailOk()) { touched.email = touched.tel = true; update(); return; }
        var payload = { _subject: 'Novi upit sa sajta — ' + fTopic.value, _template: 'table', _captcha: 'false', Ime: fName.value, Telefon: '+381 ' + fTel.value, Email: fEmail.value.trim() || '(nije ostavljen)', Tema: fTopic.value, Poruka: (fMsg && fMsg.value) || '(bez poruke)' };
        sending = true; if (sent) sent.hidden = true; show(sendErr, ''); update();
        fetch('https://formsubmit.co/ajax/' + EMAIL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            sending = false;
            if (data && (data.success === true || data.success === 'true')) {
              form.reset(); touched.email = touched.tel = false; syncTopic(); if (sent) sent.hidden = false;
            } else show(sendErr, 'Slanje nije uspelo. Pozovite nas ili pokušajte ponovo.');
            update();
          })
          .catch(function () { sending = false; show(sendErr, 'Slanje nije uspelo. Proverite internet i pokušajte ponovo.'); update(); });
      });
      update();
    })();
  }


  if (page === 'prostor') {
    /* Lightbox galerije */
    d.querySelectorAll('#teretana [data-cat], #parter [data-cat]').forEach(function (cat) {
      var cells = Array.prototype.slice.call(cat.querySelectorAll(':scope > [data-lb]')); if (!cells.length) return;
      var wrap = d.createElement('div'); wrap.setAttribute('data-car', ''); if (cells.length < 2) wrap.setAttribute('data-one', '');
      cat.parentNode.insertBefore(wrap, cat);
      var stage = d.createElement('div'); stage.setAttribute('data-stage', '');
      stage.innerHTML = '<img data-bg alt="" aria-hidden="true"><img alt="" decoding="async"><button type="button" data-stage-btn="prev" aria-label="Prethodna slika">←</button><button type="button" data-stage-btn="next" aria-label="Sledeća slika">→</button><span data-stage-num></span>';
      wrap.appendChild(stage); wrap.appendChild(cat);
      var bg = stage.querySelector('[data-bg]'), big = stage.querySelector('img:not([data-bg])'), num = stage.querySelector('[data-stage-num]'), cur = 0;
      cells.forEach(function (c) { var im = c.querySelector('img'); if (im) im.setAttribute('sizes', '140px'); });
      var show = function (i) {
        cur = (i + cells.length) % cells.length;
        var im = cells[cur].querySelector('img'); if (!im) return;
        if (im.getAttribute('srcset')) big.setAttribute('srcset', im.getAttribute('srcset')); else big.removeAttribute('srcset');
        big.setAttribute('sizes', '(max-width: 1140px) 100vw, 1100px');
        big.src = im.getAttribute('src'); big.alt = im.getAttribute('alt') || '';
        bg.src = im.currentSrc || im.getAttribute('src');
        cells.forEach(function (c, k) { if (k === cur) c.setAttribute('data-active', ''); else c.removeAttribute('data-active'); });
        num.textContent = (cur + 1) + ' / ' + cells.length;
        var t = cells[cur]; cat.scrollLeft = t.offsetLeft - cat.offsetLeft - (cat.clientWidth - t.offsetWidth) / 2;
      };
      cat.addEventListener('click', function (e) { var c = e.target.closest('[data-lb]'); if (!c) return; e.stopPropagation(); e.preventDefault(); show(cells.indexOf(c)); }, true);
      stage.addEventListener('click', function (e) {
        var bt = e.target.closest('[data-stage-btn]');
        if (bt) { e.stopPropagation(); show(cur + (bt.getAttribute('data-stage-btn') === 'next' ? 1 : -1)); return; }
        wrap.__open && wrap.__open(cur);
      });
      wrap.__cells = cells; show(0);
    });
    var lb = d.getElementById('ff-lb'); if (!lb) return;
    var lbImg = lb.querySelector('[data-lb-img]'), counter = lb.querySelector('[data-lb-counter]');
    var list = [], idx = -1;
    var render = function () {
      if (idx < 0) { lb.hidden = true; return; }
      var it = list[idx]; lbImg.src = it.src; lbImg.alt = it.alt;
      lb.querySelectorAll('[data-lb-many]').forEach(function (el) { el.hidden = list.length < 2; });
      if (counter) counter.textContent = (idx + 1) + ' / ' + list.length;
      lb.hidden = false;
    };
    var step = function (n) { if (!list.length) return; idx = (idx + n + list.length) % list.length; render(); };
    d.addEventListener('click', function (e) {
      if (!lb.hidden) return;
      var cell = e.target.closest && e.target.closest('[data-lb]'); if (!cell) return;
      var scope = cell.closest('[data-cat]') || d; var cells = Array.prototype.slice.call(scope.querySelectorAll('[data-lb]'));
      list = []; var at = 0;
      cells.forEach(function (c) { var im = c.querySelector('img'); if (!im) return; if (c === cell) at = list.length; list.push({ src: im.getAttribute('src'), alt: im.getAttribute('alt') || '' }); });
      if (!list.length) return;
      e.preventDefault(); idx = at; render();
    });
    d.querySelectorAll('[data-car]').forEach(function (w) {
      w.__open = function (i) {
        list = w.__cells.map(function (c) { var im = c.querySelector('img'); return { src: im.getAttribute('src'), alt: im.getAttribute('alt') || '' }; });
        idx = i; render();
      };
    });
    lb.addEventListener('click', function (e) {
      var act = e.target.closest('[data-lb-act]'); var a = act && act.getAttribute('data-lb-act');
      if (a === 'prev') { e.stopPropagation(); step(-1); } else if (a === 'next') { e.stopPropagation(); step(1); } else { idx = -1; render(); }
    });
    d.addEventListener('keydown', function (e) {
      if (idx < 0) return;
      if (e.key === 'Escape') { idx = -1; render(); } else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
    });
  }
})();

/* Utisci na telefonu: prevlačenje u krug + tačkice */
(function () {
  var mq = window.matchMedia('(max-width: 768px)');
  document.querySelectorAll('[data-marq]').forEach(function (box) {
    var sets = box.querySelectorAll('[data-marq-set]'); if (sets.length < 3) return;
    var n = sets[0].querySelectorAll('[data-marq-card]').length; if (!n) return;
    var cards = box.querySelectorAll('[data-marq-card]');
    function pos(g) { return cards[g].offsetLeft - cards[0].offsetLeft; }
    function setW() { return pos(n); }
    function cur() { var x = box.scrollLeft, best = 0, bd = 1e9; for (var g = 0; g < cards.length; g++) { var d = Math.abs(pos(g) - x); if (d < bd) { bd = d; best = g; } } return best; }
    var dots = document.createElement('div'); dots.setAttribute('data-marq-dots', '');
    var btns = [];
    for (var i = 0; i < n; i++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Utisak ' + (i + 1));
      b.style.cssText = 'width:8px;height:8px;padding:0;border:0;border-radius:4px;background:#5A574C;cursor:pointer;transition:background .2s,width .2s;';
      b.addEventListener('click', function () { stop(); go(n + i); });
      dots.appendChild(b); btns.push(b);
    })(i);
    box.parentNode.insertBefore(dots, box.nextSibling);
    function paint() { var k = cur() % n; btns.forEach(function (b, i) { b.style.background = i === k ? '#FFC400' : '#5A574C'; b.style.width = i === k ? '22px' : '8px'; }); }
    function go(g) { box.scrollTo({ left: pos(g), behavior: 'smooth' }); }
    function jump(x) { box.style.scrollSnapType = 'none'; box.scrollLeft = x; box.offsetWidth; box.style.scrollSnapType = ''; }
    var touching = false, settle = null;
    function normalize() {
      if (touching || !mq.matches) return;
      var g = cur();
      if (g < n) jump(box.scrollLeft + setW());
      else if (g >= 2 * n) jump(box.scrollLeft - setW());
    }
    function init() { if (mq.matches) jump(pos(n + (cur() % n))); paint(); }
    var timer = null;
    function start() { if (timer || !mq.matches) return; timer = setInterval(function () { if (!touching) go(cur() + 1); }, 5000); }
    function stop() { clearInterval(timer); timer = null; }
    box.addEventListener('scroll', function () { paint(); clearTimeout(settle); settle = setTimeout(normalize, 140); }, { passive: true });
    box.addEventListener('touchstart', function () { touching = true; stop(); }, { passive: true });
    box.addEventListener('touchend', function () { touching = false; clearTimeout(settle); settle = setTimeout(normalize, 400); }, { passive: true });
    box.addEventListener('touchcancel', function () { touching = false; }, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', function () { init(); mq.matches ? start() : stop(); });
    window.addEventListener('load', init);
    init(); start();
  });
})();

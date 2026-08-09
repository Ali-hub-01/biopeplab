/* ============ BIOPEPLAB ============ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- header shadow on scroll ---- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- category CTA -> preselect form ---- */
  var categorySelect = document.getElementById('category');
  document.querySelectorAll('.card-cta[data-cat]').forEach(function (cta) {
    cta.addEventListener('click', function () {
      var val = cta.getAttribute('data-cat');
      if (categorySelect) {
        var opt = Array.prototype.slice.call(categorySelect.options).find(function (o) { return o.value === val; });
        if (opt) categorySelect.value = val;
      }
    });
  });

  /* ---- form -> WhatsApp ---- */
  var form = document.getElementById('leadForm');
  var success = document.getElementById('formSuccess');
  var WA = '77773350803';

  function markInvalid(el, bad) {
    if (el) el.classList.toggle('invalid', bad);
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var category = form.category.value;
      var comment = form.comment.value.trim();

      var ok = true;
      if (!name) { markInvalid(form.name, true); ok = false; } else markInvalid(form.name, false);
      if (!phone || phone.replace(/\D/g, '').length < 10) { markInvalid(form.phone, true); ok = false; } else markInvalid(form.phone, false);
      if (!category) { markInvalid(form.category, true); ok = false; } else markInvalid(form.category, false);
      if (!ok) return;

      var lines = [
        'Заявка с сайта BIOPEPLAB',
        'Имя: ' + name,
        'Телефон: ' + phone,
        'Категория: ' + category
      ];
      if (comment) lines.push('Комментарий: ' + comment);

      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');

      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      form.reset();
    });

    ['name', 'phone', 'category'].forEach(function (n) {
      var el = form[n];
      if (el) el.addEventListener('input', function () { markInvalid(el, false); });
    });
  }

  /* ---- hero molecular canvas ---- */
  var canvas = document.querySelector('.hero-canvas');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var W, H, dpr, nodes, raf;
    var COUNT, MAXD;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      COUNT = Math.max(14, Math.min(46, Math.round(W * H / 26000)));
      MAXD = Math.min(160, Math.max(110, W / 8));
      init();
    }
    function init() {
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.8 + 1.2
        });
      }
    }
    function step() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAXD) {
            var a = (1 - d / MAXD) * 0.5;
            ctx.strokeStyle = 'rgba(15,157,143,' + a.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var p = nodes[k];
        ctx.fillStyle = 'rgba(15,157,143,0.55)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    var hero = document.querySelector('.hero');
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        visible = ents[0].isIntersecting;
        if (visible && !raf) { raf = requestAnimationFrame(step); }
        else if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
      }, { threshold: 0 }).observe(hero);
    }

    window.addEventListener('resize', function () {
      clearTimeout(canvas._t);
      canvas._t = setTimeout(resize, 180);
    });
    resize();
    raf = requestAnimationFrame(step);
  }
})();

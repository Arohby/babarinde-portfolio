/* ===== Cinematic scroll engine for the Home view ===== */
(function () {
  var home = document.querySelector('[data-view="home"]');
  if (!home) return;
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (rm) { home.classList.add('h-static'); return; }

  var $ = function (s, r) { return [].slice.call((r || home).querySelectorAll(s)); };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };      // 0..1 between a and b
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var vw = innerWidth, vh = innerHeight;

  /* ---------- generic "fly toward the camera" item ---------- */
  function setupFly(els, seed, o) {
    var r = rng(seed);
    return els.map(function (el, i) {
      var side = i % 2 ? 1 : -1;
      return {
        el: el,
        start: els.length > 1 ? i * (1 - o.w) / (els.length - 1) : 0,
        fx: side * (o.minX + r() * (o.maxX - o.minX)),   // fraction of stage width
        fy: (r() - .5) * o.spreadY,                      // fraction of stage height
        rz: (r() - .5) * o.rz, rx: (r() - .5) * o.rx, ry: -side * (4 + r() * o.ry),
        spin: o.spin ? (r() > .5 ? 1 : -1) * (120 + r() * 240) : 0
      };
    });
  }
  function runFly(items, p, o) {
    var W = vw, H = vh;
    items.forEach(function (it) {
      var t = (p - it.start) / o.w;
      if (t <= 0 || t >= 1) { if (it.on) { it.el.style.opacity = 0; it.on = false; } return; }
      it.on = true;
      var z = lerp(o.z0, o.z1, t);
      var op = clamp(t / .12) * clamp((1 - t) / o.fade);
      var rz = it.rz + it.spin * t;
      it.el.style.opacity = op.toFixed(3);
      it.el.style.zIndex = Math.round(1000 + z);
      it.el.style.transform = 'translate3d(' + (it.fx * W).toFixed(1) + 'px,' + (it.fy * H).toFixed(1) + 'px,' + z.toFixed(0) + 'px) rotateX(' + (it.rx + (o.spin ? it.spin * t * .4 : 0)).toFixed(1) + 'deg) rotateY(' + (it.ry + (o.spin ? it.spin * t * .5 : 0)).toFixed(1) + 'deg) rotateZ(' + rz.toFixed(1) + 'deg)';
    });
  }

  /* ---------- per-section update functions ---------- */
  var U = {};

  // HERO
  (function () {
    var blob = $('.h-blob')[0], name = $('.h-bigname')[0], pic = $('.h-portrait')[0], hello = $('.h-hello')[0], role = $('.h-role')[0], cue = $('.h-cue')[0], stks = $('.h-stk');
    U.hero = function (p) {
      name.style.transform = 'translateY(' + (-p * 14).toFixed(2) + 'vh) scale(' + (1 + p * .25).toFixed(3) + ')';
      name.style.opacity = clamp(1 - p * 1.25).toFixed(3);
      pic.style.transform = 'translateX(-50%) translateY(' + (p * 10).toFixed(2) + 'vh) scale(' + (1 + p * .4).toFixed(3) + ')';
      pic.style.opacity = clamp(1 - seg(p, .45, .92)).toFixed(3);
      blob.style.transform = 'translateY(' + (p * 10).toFixed(2) + 'vh) scale(' + (1 + p * .4).toFixed(3) + ')';
      blob.style.opacity = pic.style.opacity;
      var f = clamp(1 - p * 3).toFixed(3);
      hello.style.opacity = f; role.style.opacity = f; cue.style.opacity = f;
      hello.style.transform = 'translateY(' + (p * 60).toFixed(1) + 'px)';
      role.style.transform = 'translateY(' + (p * 60).toFixed(1) + 'px)';
      stks.forEach(function (s, i) { s.style.opacity = clamp(1 - seg(p, .1 + i * .04, .5)).toFixed(3); s.style.transform = 'translateY(' + (-p * (120 + i * 60)).toFixed(0) + 'px)'; });
    };
  })();

  // ABOUT: scrubbed word reveal
  (function () {
    var words = $('.h-statement span'), btn = $('.h-about .h-btn')[0], n = words.length;
    U.about = function (p) {
      var q = seg(p, .12, .8);
      words.forEach(function (w, i) {
                w.style.opacity = (.16 + .84 * clamp((q * (n + 3) - i) / 3)).toFixed(3);
      });
      var b = seg(p, .78, .95);
      btn.style.opacity = b.toFixed(3);
      btn.style.transform = 'translateY(' + ((1 - b) * 24).toFixed(1) + 'px)';
    };
  })();

  // HELP: 3D cards rise & flatten
  (function () {
    var title = $('.h-helptitle')[0], cards = $('.h-card');
    U.help = function (p) {
      var a = easeOut(seg(p, 0, .22));
      title.style.opacity = a.toFixed(3);
      title.style.transform = 'translateY(' + ((1 - a) * 80).toFixed(1) + 'px) scale(' + lerp(.88, 1, a).toFixed(3) + ') rotateX(' + ((1 - a) * 40).toFixed(1) + 'deg)';
      cards.forEach(function (c, i) {
        var t = easeOut(seg(p, .08 + i * .09, .52 + i * .09));
        var dir = i % 2 ? 1 : -1;
        c.style.opacity = clamp(t * 3).toFixed(3);
        c.style.transform = 'translate3d(' + (dir * (1 - t) * 6).toFixed(1) + 'vw,' + ((1 - t) * 90).toFixed(1) + 'vh,' + (-(1 - t) * 500).toFixed(0) + 'px) rotateX(' + ((1 - t) * 65).toFixed(1) + 'deg) rotateY(' + (dir * (1 - t) * 25).toFixed(1) + 'deg) rotateZ(' + (dir * (1 - t) * 14).toFixed(1) + 'deg)';
      });
    };
  })();

  // ARCHIVE
  var archO = { w: .32, z0: -2800, z1: 700, fade: .22, minX: .16, maxX: .44, spreadY: .6, rz: 16, rx: 10, ry: 20, spin: false };
  (function () {
    var items, title = $('.h-bgtitle')[0], cta = $('.h-archcta')[0];
    function build() { items = setupFly($('.h-fly,.h-folder'), 7, archO); }
    build();
    U.arch = function (p) {
      var a = seg(p, 0, .08), z = seg(p, .9, 1);
      title.style.opacity = (.22 * a * (1 - z)).toFixed(3);
      title.style.transform = 'scale(' + lerp(.85, 1.25, p).toFixed(3) + ')';
      runFly(items, p, archO);
      var c = seg(p, .88, .98);
      cta.style.opacity = c.toFixed(3);
      cta.style.pointerEvents = c > .5 ? 'auto' : 'none';
    };
  })();

  // TOOLS
  var toolO = { w: .5, z0: -1800, z1: 520, fade: .2, minX: .06, maxX: .36, spreadY: .7, rz: 60, rx: 40, ry: 40, spin: true };
  (function () {
    var items = setupFly($('.h-tool'), 21, toolO), title = $('.h-tooltitle')[0];
    U.tools = function (p) {
      var a = easeOut(seg(p, 0, .16)), o = 1 - seg(p, .6, .8);
      title.style.opacity = (a * o).toFixed(3);
      title.style.transform = 'perspective(900px) rotateX(' + ((1 - a) * 55 + seg(p, .6, .8) * -40).toFixed(1) + 'deg) translateY(' + ((1 - a) * 12).toFixed(1) + 'vh) scale(' + (lerp(.85, 1, a) + seg(p, .6, .85) * .4).toFixed(3) + ')';
      runFly(items, p, toolO);
    };
  })();

  // BEYOND THE VISUALS
  (function () {
    var title = $('.h-beyondt')[0], pills = $('.h-pills')[0], col = $('.h-collage')[0], rows = $('.h-row'),
        ctext = $('.h-collagetxt')[0], brands = $('.h-brands')[0];
    U.beyond = function (p) {
      var a = clamp(p / .4), tw = title.offsetWidth;
      var x = lerp(vw * .62, -tw + vw * .42, easeIO(a));
      title.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
      title.style.opacity = (clamp(a / .08) * (1 - seg(a, .94, 1))).toFixed(3);
      var pa = seg(a, .12, .3) * (1 - seg(a, .8, 1));
      pills.style.opacity = pa.toFixed(3);
      pills.style.transform = 'translateY(' + ((1 - seg(a, .12, .3)) * 30).toFixed(1) + 'px)';

      var b = seg(p, .36, 1), e = easeOut(seg(p, .36, .7));
      col.style.opacity = clamp(b * 5).toFixed(3);
      col.style.transform = 'translateY(' + ((1 - e) * 80).toFixed(1) + 'vh) rotateX(' + lerp(48, 20, e).toFixed(1) + 'deg) rotateZ(' + lerp(-12, -5, b).toFixed(2) + 'deg)';
      rows.forEach(function (r, i) {
        var shift = (r.scrollWidth - vw) * .55;
        var dir = i % 2 ? 1 : -1;
        r.style.transform = 'translateX(' + (dir > 0 ? (-shift + shift * b) : (-shift * b)).toFixed(1) + 'px)';
      });
      var t = seg(p, .62, .78);
      ctext.style.opacity = t.toFixed(3);
      ctext.style.transform = 'scale(' + lerp(.9, 1, t).toFixed(3) + ')';
      brands.style.opacity = (seg(p, .7, .85) * .9).toFixed(3);
    };
  })();

  // CTA
  (function () {
    var t = $('.h-ctat')[0], pr = $('.h-ctap')[0], bt = $('.h-ctab')[0];
    U.cta = function (p) {
      var a = easeOut(seg(p, 0, .5));
      t.style.opacity = clamp(a * 2).toFixed(3);
      t.style.transform = 'translateY(' + ((1 - a) * 14).toFixed(1) + 'vh) rotateX(' + ((1 - a) * 45).toFixed(1) + 'deg) scale(' + lerp(.8, 1, a).toFixed(3) + ')';
      var b = easeOut(seg(p, .25, .6)), c = easeOut(seg(p, .4, .75));
      pr.style.opacity = b.toFixed(3); pr.style.transform = 'translateY(' + ((1 - b) * 30).toFixed(1) + 'px)';
      bt.style.opacity = c.toFixed(3); bt.style.transform = 'translateY(' + ((1 - c) * 30).toFixed(1) + 'px)';
    };
  })();

  /* ---------- scroll loop with inertia ---------- */
  var pins = $('.h-pin').map(function (el) { return { el: el, k: el.dataset.h, p: -1 }; });
  var raf = 0;
  function frame() {
    raf = 0;
    if (home.hidden) return;
    var busy = false;
    pins.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      var total = r.height - vh;
      var target = total > 0 ? clamp(-r.top / total) : 0;
      var near = r.bottom > -vh * .2 && r.top < vh * 1.2;
      if (!near) { o.p = target; return; }
      if (o.p < 0) o.p = target;
      o.p += (target - o.p) * .16;
      if (Math.abs(target - o.p) > .0003) busy = true; else o.p = target;
      U[o.k](o.p);
      o.drawn = true;
    });
    if (busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function relayout() { vw = innerWidth; vh = innerHeight; kick(); }
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('routechange', function () { setTimeout(kick, 30); });
  addEventListener('load', kick);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
  kick();
})();

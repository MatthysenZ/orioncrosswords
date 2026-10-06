/* Orion Word Game, homepage motion. No libraries. Safe to remove: the page still works as a still image. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var css = hero.style;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 0. One watcher answers "is this on screen, or nearly?" for the parts below, so nothing keeps working out of sight. */
  var watched = [];
  var near = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { watched.forEach(function (w) { if (w.el === e.target) w.fn(e.isIntersecting); }); });
  }, { rootMargin: '25% 0px' }) : null;
  function watch(el, fn) { if (near) { watched.push({ el: el, fn: fn }); near.observe(el); } }

  /* 1. Tell the stylesheet the hero's exact size, so the art inside the glass lines up with the art behind it. */
  function measure() {
    var r = hero.getBoundingClientRect();
    css.setProperty('--hw', r.width + 'px');
    css.setProperty('--hh', r.height + 'px');
  }
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(function () { measure(); onScroll(); }).observe(hero);
  else window.addEventListener('resize', function () { measure(); onScroll(); });

  /* 2. Scroll: the art sinks, the glass and the lockup rise, a soft copy of the art fades in (the blur).
        --sy is the exact scroll progress (0 at the top, 1 once the hero has gone). Everything that must stay locked to the
        page or to the screen reads it: the pinned glass and lockup, the art's parallax.
        --ss is the same progress, smoothed. A mouse wheel scrolls in steps, so on a computer --ss eases towards --sy over
        about a tenth of a second and the growth, the exit and the soft copy glide instead of jumping with each notch.
        (Smoothing --sy itself would make the pinned glass slide with the page and float back: rubbery.) On touch screens
        --ss is simply --sy, and the easing only runs while the hero is on screen.
     3. Sections that drift against the scroll ([data-parallax]: the Journey I band and the bottom glass badge):
        --vp runs from 1 (a screen below the middle of the screen) through 0 (centred) to -1 (a screen above); --vpa is
        its size. Everything is read first and written after, once per frame, and only values that changed are written. */
  var EASE = 80;                                   /* ms, how long --ss takes to catch up (time constant); 0 = no easing */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var drifters = reduce ? [] : [].slice.call(document.querySelectorAll('[data-parallax]'));
  var driftShown = [], syShown = '', ssShown = '';
  var heroOn = true, ss = -1, lastT = 0, settling = false, queued = false, moved = true;
  function frame(now) {
    queued = false;
    /* read */
    var h = hero.offsetHeight || 1, vh = window.innerHeight || 1;
    var sy = Math.min(1, Math.max(0, (window.pageYOffset || 0) / h));
    var spots = moved ? drifters.map(function (el) { var r = el.getBoundingClientRect(); return (r.top + r.height / 2 - vh / 2) / vh; }) : null;
    moved = false;
    /* ease */
    if (ss < 0 || !EASE || !heroOn || !fine.matches) ss = sy;
    else {
      var dt = settling ? Math.min(50, Math.max(1, now - lastT)) : 16.7;
      ss += (sy - ss) * (1 - Math.exp(-dt / EASE));
      if (Math.abs(sy - ss) < 0.0005) ss = sy;
    }
    lastT = now;
    /* write */
    var t = sy.toFixed(4);
    if (t !== syShown) { syShown = t; css.setProperty('--sy', t); }
    t = ss.toFixed(4);
    if (t !== ssShown) { ssShown = t; css.setProperty('--ss', t); }
    if (spots) spots.forEach(function (v, i) {
      v = Math.max(-1, Math.min(1, v));
      var s = v.toFixed(3);
      if (s === driftShown[i]) return;
      driftShown[i] = s;
      drifters[i].style.setProperty('--vp', s);
      drifters[i].style.setProperty('--vpa', Math.abs(v).toFixed(3));
    });
    settling = ss !== sy;
    if (settling) queue();
  }
  function queue() { if (!reduce && !queued) { queued = true; requestAnimationFrame(frame); } }
  function onScroll() { moved = true; queue(); }

  if (!reduce) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    /* the hero out of sight: no easing, the tagline's light paused, the animated grid and the glass not drawn (.away) */
    watch(hero, function (on) { heroOn = on; hero.classList.toggle('away', !on); if (on) onScroll(); });
  }

  /* 3b. The seams between sections: each section's content rises softly into place the first time it comes into view.
         Content already on screen when the page opens is left alone. Elements arriving together come in a beat apart. */
  var risers = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (risers.length && !reduce && 'IntersectionObserver' in window) {
    var vh0 = window.innerHeight || 0;
    risers.forEach(function (el) { if (el.getBoundingClientRect().top < vh0) el.classList.add('in'); });
    document.documentElement.classList.add('reveal');
    var rise = new IntersectionObserver(function (en) {
      var k = 0;
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (k++ * 90) + 'ms';
        e.target.classList.add('in');
        rise.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    risers.forEach(function (el) { if (!el.classList.contains('in')) rise.observe(el); });
  }

  /* 4. Backgrounds that change on a timer: the hero (with the glass following) and the closing section.
        data-rotate lists the sets, data-rotate-every the seconds between changes (0 = off).
        A change only happens while its section is on screen (or nearly), so nothing is downloaded for a part nobody sees. */
  var saveData = navigator.connection && navigator.connection.saveData;
  function sources(name) {
    if (name === 'keyart') return { src: 'assets/keyart-1920.jpg', srcset: 'assets/keyart-960.webp 960w, assets/keyart-1600.webp 1600w, assets/keyart-2560.webp 2560w' };
    return { src: 'assets/' + name + '-1632.webp', srcset: 'assets/' + name + '-1080.webp 1080w, assets/' + name + '-1632.webp 1632w' };
  }
  function ready(img) { return (img.decode ? img.decode() : Promise.resolve()).catch(function () {}); }
  function rotator(el) {
    var names = (el.getAttribute('data-rotate') || '').split(',').map(function (n) { return n.trim(); }).filter(Boolean);
    if (names.length < 2 || reduce || saveData) return;
    var slots = [el.querySelector('.slide--a'), el.querySelector('.slide--b')];
    var sets = [el.querySelector('.lens__set--a'), el.querySelector('.lens__set--b')];
    var cur = 0, front = 0, timer = null, busy = false, seen = true;
    function step() {
      if (busy || document.hidden || !seen) return;
      busy = true;
      var next = (cur + 1) % names.length, back = 1 - front, name = names[next], s = sources(name), waits = [];
      slots[back].sizes = slots[front].sizes || '100vw'; slots[back].srcset = s.srcset; slots[back].src = s.src; waits.push(ready(slots[back]));
      if (sets[0] && sets[1]) {
        var imgs = sets[back].querySelectorAll('img');
        ['r', 'g', 'b'].forEach(function (ch, i) { imgs[i].src = 'assets/' + name + '-' + ch + '.webp'; waits.push(ready(imgs[i])); });
      }
      Promise.all(waits).then(function () {
        slots[back].classList.add('on'); slots[front].classList.remove('on');
        if (sets[0] && sets[1]) { sets[back].classList.add('on'); sets[front].classList.remove('on'); }
        front = back; cur = next; busy = false;
      });
    }
    function schedule() {
      clearInterval(timer);
      var every = parseFloat(el.getAttribute('data-rotate-every')) || 0;
      if (every > 0) timer = setInterval(step, every * 1000);
    }
    schedule();
    el.addEventListener('orion:tune', schedule);
    watch(el, function (on) { seen = on; el.classList.toggle('away', !on); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-rotate]'), rotator);

  /* 5. The trailer only loads and plays while it is on screen. With reduced motion it stays still (the poster);
        tapping the phone still opens it full screen. */
  var video = document.querySelector('.phone video'), cinema = document.querySelector('.cinema');
  if (video && !reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && (!cinema || cinema.hidden)) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    }, { threshold: 0.35 }).observe(video);
  }

  /* 5a. Tap the phone: the trailer opens full screen, with sound. The rest of the page is made inert meanwhile, so the
         keyboard stays in the player; closing hands the focus back to the phone. */
  var phone = document.querySelector('.phone');
  if (phone && cinema) {
    var big = cinema.querySelector('video'), closeBtn = cinema.querySelector('.cinema__close');
    var behind = [hero, document.querySelector('main'), document.querySelector('.foot')].filter(Boolean);
    var open = function () {
      cinema.hidden = false;
      behind.forEach(function (el) { el.inert = true; });
      if (video) video.pause();
      big.muted = false; big.currentTime = 0;
      var p = big.play(); if (p && p.catch) p.catch(function () {});
      if (big.webkitEnterFullscreen && /iP(hone|od)/.test(navigator.userAgent)) { try { big.webkitEnterFullscreen(); } catch (e) {} }
      else { closeBtn.focus(); if (cinema.requestFullscreen) cinema.requestFullscreen().catch(function () {}); }
    };
    var shut = function () {
      if (cinema.hidden) return;
      big.pause();
      cinema.hidden = true;
      behind.forEach(function (el) { el.inert = false; });
      if (video && !reduce) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      var back = function () { phone.focus({ preventScroll: true }); };   /* only possible once full screen has ended */
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().then(back, back);
      else back();
    };
    phone.addEventListener('click', open);
    closeBtn.addEventListener('click', shut);
    big.addEventListener('ended', shut);
    big.addEventListener('webkitendfullscreen', shut);
    document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && !cinema.hidden) shut(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cinema.hidden) shut(); });
  }

  /* 5b. The glow behind the phone: the playing trailer painted small onto a canvas that CSS blurs large.
         With reduced motion the poster is painted once instead, so the glow is there but still. */
  var glow = document.querySelector('.phone__glow');
  if (video && glow && glow.getContext) {
    var gctx = glow.getContext('2d'), painting = false;
    var paint = function () {
      if (video.paused || video.ended) { painting = false; return; }
      try { gctx.drawImage(video, 0, 0, glow.width, glow.height); } catch (e) {}
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(paint);
      else setTimeout(function () { requestAnimationFrame(paint); }, 66);
    };
    video.addEventListener('play', function () { if (!painting) { painting = true; paint(); } });
    if (reduce && video.poster) {
      var still = new Image();
      still.onload = function () { try { gctx.drawImage(still, 0, 0, glow.width, glow.height); } catch (e) {} };
      still.src = video.poster;
    }
  }

  /* 5c. The Dreams strip: loops without end, and can be dragged with a mouse.
         The pictures are doubled. The strip opens on the second set, with the first picture where the design puts it, so
         there are pictures on both sides from the start. Whenever the view strays near either end it jumps by exactly one
         set: the same pictures in the same places, so the jump cannot be seen. Free scrolling, no snapping. */
  var strip = document.querySelector('.strip');
  if (strip && strip.children.length > 1) {
    var items = [].slice.call(strip.children), n = items.length, setW = 0, startX = 0, room = 0;
    items.forEach(function (it) { var c = it.cloneNode(true); c.setAttribute('aria-hidden', 'true'); strip.appendChild(c); });
    var dragX = 0, dragStart = 0, pos = 0, vel = 0, lastX = 0, lastMove = 0, dragging = false, inertia = 0;
    /* move the view by whole sets, carrying the drag and the glide along */
    var shift = function (d) { strip.scrollLeft += d; dragStart += d; pos += d; };
    var keep = function () {
      if (room <= 0) return;
      var x = strip.scrollLeft;
      if (x < startX + room) shift(setW);
      else if (x > startX + setW + room) shift(-setW);
    };
    var measureStrip = function () {
      var at = setW ? strip.scrollLeft / setW : 1;          /* where the view is, in sets: it opens at 1, the second set */
      startX = items[0].offsetLeft;                         /* the strip is position:relative, so this is its left padding */
      setW = strip.children[n].offsetLeft - startX;         /* one set: from the first picture to the first copy */
      var gap = items[1].offsetLeft - startX - items[0].offsetWidth;
      room = (setW - strip.clientWidth - gap) / 2;          /* how far the view may stray from the middle before a jump could show */
      strip.scrollLeft = Math.round(at * setW);
      keep();
    };
    measureStrip();
    if ('ResizeObserver' in window) new ResizeObserver(measureStrip).observe(strip); else window.addEventListener('resize', measureStrip);
    strip.addEventListener('scroll', keep, { passive: true });

    var stopGlide = function () {
      if (!inertia) return;
      cancelAnimationFrame(inertia); inertia = 0;
      if (!dragging) strip.classList.remove('dragging');
    };
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });   /* no ghost picture under the mouse */
    strip.addEventListener('wheel', stopGlide, { passive: true });
    strip.addEventListener('touchstart', stopGlide, { passive: true });
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide(); dragging = true; dragX = e.clientX; dragStart = strip.scrollLeft; vel = 0; lastX = e.clientX; lastMove = performance.now();
      strip.classList.add('dragging'); strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      strip.scrollLeft = dragStart - (e.clientX - dragX);
      keep();
      var t = performance.now(), dt = t - lastMove;
      if (dt > 0) vel = vel * 0.4 + ((e.clientX - lastX) / dt) * 0.6;   /* px per ms, lightly smoothed */
      lastX = e.clientX; lastMove = t;
    });
    /* letting go: the strip glides on and slows down (the same feel at 60 and 120 frames a second).
       Holding still before letting go means no glide. */
    var release = function () {
      if (!dragging) return;
      dragging = false;
      var v = performance.now() - lastMove > 90 ? 0 : -vel, prev = 0;
      pos = strip.scrollLeft;
      var glide = function (now) {
        var dt = prev ? Math.min(48, Math.max(0, now - prev)) : 16.7; prev = now;
        pos += v * dt; strip.scrollLeft = pos; keep();
        v *= Math.pow(0.92, dt / 16.7);
        if (Math.abs(v) < 0.06) { inertia = 0; strip.classList.remove('dragging'); return; }
        inertia = requestAnimationFrame(glide);
      };
      if (Math.abs(v) < 0.06) { strip.classList.remove('dragging'); return; }
      inertia = requestAnimationFrame(glide);
    };
    strip.addEventListener('pointerup', release);
    strip.addEventListener('pointercancel', release);
  }

  /* 6. Design tool: add ?tune to the address to get sliders for the glass. Not loaded for normal visitors. */
  if (/[?&]tune\b/.test(location.search)) {
    var s = document.createElement('script');
    s.src = 'js/tune.js';
    document.head.appendChild(s);
  }
})();

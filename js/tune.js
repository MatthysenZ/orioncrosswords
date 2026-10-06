/* Orion homepage, glass tuner. Loaded only when the address ends in ?tune. For the Director, not for visitors.
   Move the sliders, press "Copy settings", and paste the result back to whoever maintains css/home.css. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  if (!hero || document.getElementById('orion-tune')) return;
  var KEY = 'orion-tune-v2';
  /* [variable, label, min, max, step, unit, target selector]. A plain string starts a new group. */
  var ITEMS = [
    'Top glass',
    ['--d-scale', 'Glass size', 0.5, 1.8, 0.01, '', '.hero'],
    ['--cyk', 'Glass drop (how far it comes down)', -0.45, 0.35, 0.005, '', '.hero'],
    ['--lock-scale', 'Logo size', 0.4, 1.4, 0.01, '', '.hero'],
    ['--frost', 'Frost (blur in the glass)', 0, 24, 0.5, 'px', '.hero'],
    ['--mag', 'Magnification', 1, 1.45, 0.005, '', '.hero'],
    ['--disp', 'Dispersion (colour split)', 0, 0.07, 0.001, '', '.hero'],
    ['--tint-top', 'Tint, upper', 0, 1, 0.01, '', '.hero'],
    ['--tint-bot', 'Tint, at the rim', 0, 1, 0.01, '', '.hero'],
    ['--rim', 'Rim light', 0, 1, 0.01, '', '.hero'],
    ['--rim-w', 'Rim thickness', 0.5, 6, 0.1, 'px', '.hero'],
    ['--glow', 'Bottom glow', 0, 0.9, 0.01, '', '.hero'],
    ['--ghost', 'Logo under the glass', 0, 1, 0.01, '', '.hero'],
    ['--ghost-drop', 'Under-logo drop', -0.06, 0.14, 0.002, '', '.hero'],
    ['--ghost-blur', 'Under-logo blur', 0, 12, 0.25, 'px', '.hero'],
    ['--top-shade', 'Fade to dark at the very top', 0, 1, 0.01, '', '.hero'],
    'Grid and motion',
    ['--grid', 'Block grid: strength', 0, 1, 0.01, '', '.hero'],
    ['--grid-fade', 'Block grid: faded out by (from the top)', 30, 100, 1, '%', '.hero'],
    ['--move', 'Scroll parallax amount', 0, 3, 0.05, '', '.hero'],
    ['data:rotate-every', 'Background change, seconds (0 = off)', 0, 40, 1, '', '.hero'],
    'Bottom glass',
    ['--gb-scale', 'Size', 0.6, 1.4, 0.01, '', '.gbadge'],
    ['--gb-inner', 'Inner disc, % of outer', 40, 80, 0.5, '', '.gbadge'],
    ['--gb-rim', 'Rim line', 0, 1, 0.01, '', '.gbadge'],
    ['--gb-reflect', 'Reflections top and bottom', 0, 1, 0.01, '', '.gbadge'],
    ['--gb-frost', 'Frost (inner disc)', 0, 12, 0.5, 'px', '.gbadge'],
    ['--gb-tint', 'Tint (inner disc)', 0, 1, 0.01, '', '.gbadge'],
    ['--gb-fill', 'Outer disc fill', 0, 0.3, 0.005, '', '.gbadge'],
    ['--gb-orion-w', 'ORION width, %', 40, 100, 0.5, '', '.gbadge'],
    ['--gb-orion-y', 'ORION position, % from top', 30, 60, 0.25, '', '.gbadge'],
    ['--gb-wg-w', 'WORD GAME width, %', 20, 70, 0.5, '', '.gbadge'],
    ['--gb-wg-y', 'WORD GAME position, % from top', 45, 75, 0.25, '', '.gbadge']
  ].filter(function (it) { return typeof it === 'string' || document.querySelector(it[6]); });
  function target(it) { return document.querySelector(it[6]); }
  function isData(it) { return it[0].indexOf('data:') === 0; }
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  var defaults = {}, cs = getComputedStyle(hero);
  ITEMS.forEach(function (it) { if (typeof it === 'string') return; var el = target(it); defaults[it[0]] = isData(it) ? parseFloat(el.getAttribute('data-' + it[0].slice(5))) : parseFloat(getComputedStyle(el).getPropertyValue(it[0])); });

  var box = document.createElement('div');
  box.id = 'orion-tune';
  box.style.cssText = 'position:fixed;z-index:99999;top:12px;right:12px;width:290px;max-height:calc(100vh - 24px);overflow:auto;' +
    'background:rgba(14,14,20,.92);color:#eee;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:12px 14px;' +
    'font:12px/1.35 -apple-system,Helvetica,Arial,sans-serif;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)';
  var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
    '<b style="letter-spacing:.14em;text-transform:uppercase;font-size:11px">Glass tuner</b>' +
    '<button data-act="fold" style="all:unset;cursor:pointer;padding:2px 8px;border:1px solid #555;border-radius:8px">hide</button></div><div data-body>';
  ITEMS.forEach(function (it, i) {
    if (typeof it === 'string') { html += '<div style="margin:14px 0 2px;color:#c9b8ff;letter-spacing:.14em;text-transform:uppercase;font-size:10px">' + it + '</div>'; return; }
    html += '<label style="display:block;margin:7px 0 0">' + it[1] + ' <output data-o="' + i + '" style="float:right;color:#c9b8ff"></output>' +
      '<input data-i="' + i + '" type="range" min="' + it[2] + '" max="' + it[3] + '" step="' + it[4] + '" style="width:100%;margin:2px 0 0"></label>';
  });
  html += '<div style="display:flex;gap:8px;margin:12px 0 8px">' +
    '<button data-act="copy" style="all:unset;cursor:pointer;flex:1;text-align:center;padding:7px 0;border-radius:9px;background:#c9b8ff;color:#111;font-weight:600">Copy settings</button>' +
    '<button data-act="reset" style="all:unset;cursor:pointer;padding:7px 12px;border-radius:9px;border:1px solid #555">Reset</button></div>' +
    '<textarea data-out readonly rows="6" style="width:100%;box-sizing:border-box;background:#0b0b10;color:#bbb;border:1px solid #333;border-radius:8px;font:11px/1.4 ui-monospace,Menlo,monospace;padding:6px"></textarea>' +
    '<p style="margin:6px 0 0;color:#888">Saved in this browser only. Settings are for a ' + window.innerWidth + ' wide window; phones use their own glass size and drop.</p></div>';
  box.innerHTML = html;
  document.body.appendChild(box);

  var out = box.querySelector('[data-out]');
  function value(i) { var it = ITEMS[i]; return box.querySelector('[data-i="' + i + '"]').value + it[5]; }
  function apply() {
    var lines = {};
    ITEMS.forEach(function (it, i) {
      if (typeof it === 'string') return;
      var v = value(i), el = target(it);
      if (isData(it)) el.setAttribute('data-' + it[0].slice(5), v); else el.style.setProperty(it[0], v);
      box.querySelector('[data-o="' + i + '"]').textContent = v;
      saved[it[0]] = parseFloat(v);
      if (!isData(it)) { lines[it[6]] = lines[it[6]] || []; lines[it[6]].push(it[0] + ':' + v); }
    });
    out.value = Object.keys(lines).map(function (sel) { return sel + '{' + lines[sel].join(';') + '}'; }).join('\n') + '\nbackground change: ' + hero.getAttribute('data-rotate-every') + 's';
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    hero.dispatchEvent(new Event('orion:tune'));
  }
  function load(src) {
    ITEMS.forEach(function (it, i) {
      if (typeof it === 'string') return;
      var v = src[it[0]];
      box.querySelector('[data-i="' + i + '"]').value = (typeof v === 'number' && !isNaN(v)) ? v : defaults[it[0]];
    });
    apply();
  }
  box.addEventListener('input', function (e) { if (e.target.matches('input[type=range]')) apply(); });
  box.addEventListener('click', function (e) {
    var act = e.target.getAttribute('data-act');
    if (act === 'reset') { saved = {}; try { localStorage.removeItem(KEY); } catch (er) {} ITEMS.forEach(function (it) { if (typeof it !== 'string' && !isData(it)) target(it).style.removeProperty(it[0]); }); load(defaults); }
    if (act === 'fold') { var b = box.querySelector('[data-body]'); var hid = b.style.display === 'none'; b.style.display = hid ? '' : 'none'; e.target.textContent = hid ? 'hide' : 'show'; }
    if (act === 'copy') {
      out.select();
      var done = function () { e.target.textContent = 'Copied'; setTimeout(function () { e.target.textContent = 'Copy settings'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, function () { document.execCommand('copy'); done(); });
      else { document.execCommand('copy'); done(); }
    }
  });
  load(saved);
})();

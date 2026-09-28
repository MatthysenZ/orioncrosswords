/*
 * App Store banner for browsers that do not render Apple's native one.
 *
 * <meta name="apple-itunes-app"> is Safari-only. Chrome, Firefox and Edge on
 * iOS ignore it, as does every in-app webview (Instagram, Facebook, Threads),
 * so those visitors currently get no route to the App Store at all. This fills
 * that gap and stays out of the way everywhere the native banner already works.
 */
(function () {
  'use strict';

  var APP_ID = '6807606521';
  var STORE_URL = 'https://apps.apple.com/app/id' + APP_ID;
  var TITLE = 'Orion: A Word Puzzle Game';
  var SUBTITLE = 'On the App Store';
  var ICON_SRC = '/appicon.png';
  var DISMISS_KEY = 'orion.appbanner.dismissed';
  var DISMISS_DAYS = 14;

  var ua = navigator.userAgent;

  // The app ships for iPhone and iPad only, so an Android or desktop visitor
  // has nothing to install — showing them a store link is a dead end.
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return;

  // Added to the Home Screen: the user already has us, and a banner over a
  // standalone app looks broken.
  if (navigator.standalone === true) return;

  var isAltBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|Brave/.test(ua);
  // These report "Safari" in the UA but are WKWebViews, which never draw the
  // native banner.
  var isInAppWebview = /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|Snapchat|Pinterest|LinkedInApp|MicroMessenger|GSA\//.test(ua);
  if (!isAltBrowser && !isInAppWebview) return; // Safari: the native banner covers it

  // Dismissal has to survive a reload or the banner becomes an argument. A
  // blocked or full localStorage just means we show it again next visit.
  try {
    var until = parseInt(localStorage.getItem(DISMISS_KEY), 10);
    if (until && Date.now() < until) return;
  } catch (e) {}

  var css = '\
.ob-banner{position:fixed;top:0;left:0;right:0;z-index:2147483647;\
display:flex;align-items:center;gap:12px;\
padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));\
padding-top:calc(10px + env(safe-area-inset-top,0px));\
background:#1c1c1e;border-bottom:1px solid #38383a;\
font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;\
transform:translateY(-100%);transition:transform .24s ease-out}\
.ob-banner.ob-in{transform:translateY(0)}\
.ob-close{flex:0 0 auto;width:26px;height:26px;padding:0;margin:0;\
background:none;border:0;color:#8e8e93;font-size:20px;line-height:1;\
cursor:pointer;-webkit-appearance:none}\
.ob-hit{flex:1 1 auto;display:flex;align-items:center;gap:12px;\
min-width:0;text-decoration:none;color:inherit}\
.ob-icon{flex:0 0 auto;width:46px;height:46px;border-radius:10px;\
object-fit:contain}\
.ob-text{flex:1 1 auto;min-width:0}\
.ob-title{color:#fff;font-size:14px;font-weight:600;line-height:1.25;\
white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.ob-sub{color:#8e8e93;font-size:12px;line-height:1.3;margin-top:2px;\
white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.ob-cta{flex:0 0 auto;color:#0a84ff;font-size:14px;font-weight:600;\
text-transform:uppercase;letter-spacing:.02em;padding:6px 4px}\
@media (prefers-reduced-motion:reduce){.ob-banner{transition:none}}';

  var style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  var banner = document.createElement('aside');
  banner.className = 'ob-banner';
  banner.setAttribute('role', 'complementary');
  banner.setAttribute('aria-label', 'Get Orion on the App Store');

  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'ob-close';
  close.setAttribute('aria-label', 'Dismiss App Store banner');
  close.innerHTML = '&times;';

  var hit = document.createElement('a');
  hit.className = 'ob-hit';
  hit.href = STORE_URL;
  hit.rel = 'noopener';

  // The icon is optional: if /appicon.png is not deployed the banner simply
  // renders without it rather than showing a broken image.
  var icon = document.createElement('img');
  icon.className = 'ob-icon';
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  icon.onerror = function () { if (icon.parentNode) icon.parentNode.removeChild(icon); };
  icon.src = ICON_SRC;

  var text = document.createElement('div');
  text.className = 'ob-text';
  var t = document.createElement('div');
  t.className = 'ob-title';
  t.textContent = TITLE;
  var s = document.createElement('div');
  s.className = 'ob-sub';
  s.textContent = SUBTITLE;
  text.appendChild(t);
  text.appendChild(s);

  var cta = document.createElement('span');
  cta.className = 'ob-cta';
  cta.textContent = 'View';

  hit.appendChild(icon);
  hit.appendChild(text);
  hit.appendChild(cta);
  banner.appendChild(close);
  banner.appendChild(hit);
  document.body.appendChild(banner);

  // Offset the page by the banner's real height rather than a guess, so the
  // notch inset and any text scaling are accounted for. Matches how the native
  // banner pushes content down instead of covering it.
  var basePad = parseFloat(getComputedStyle(document.body).paddingTop) || 0;

  function applyOffset() {
    document.body.style.paddingTop = (basePad + banner.getBoundingClientRect().height) + 'px';
  }

  applyOffset();
  requestAnimationFrame(function () { banner.classList.add('ob-in'); });
  window.addEventListener('resize', applyOffset);

  close.addEventListener('click', function () {
    window.removeEventListener('resize', applyOffset);
    banner.classList.remove('ob-in');
    document.body.style.paddingTop = basePad ? basePad + 'px' : '';
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 864e5));
    } catch (e) {}
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 260);
  });
})();

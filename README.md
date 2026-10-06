# Orion Word Game — website

The homepage of orionwordgame.com. Plain HTML, CSS and a little JavaScript: no framework, no build step,
nothing loaded from other websites, no cookies.

## Deploy
The site is static. Any static host serves it as is: the root `index.html`, `css/`, `js/` and `assets/`.
`vercel.json` adds long caching for `assets/` and clean URLs; delete it if the host is not Vercel.

- `/help`, `/privacy` and `/tos` are the existing standalone pages, kept in this repository alongside the homepage.
  They have their own styling and load `/smart-banner.js`; the homepage uses Safari's native banner instead.
- `/.well-known/apple-app-site-association`, `/app/*` and `app-ads.txt` serve universal links and AdMob verification.
  `vercel.json` must keep serving the association file as `application/json`.
- Apple's install banner carries our campaign token (`ct=smartbanner`); every App Store button uses `ct=website-home`.
- Tap the phone: the trailer opens full screen with sound (`assets/trailer-30s-sound.mp4`, 17 MB, loaded only then).

## Editing
- Words: `index.html`, in plain view.
- The two glass effects, the block grid and the motion: named variables at the top of the `.hero` and `.gbadge`
  blocks in `css/home.css`. Open the page with `?tune` at the end of the address for sliders; "Copy settings" prints
  the lines to paste back.
- Pictures are built from the originals with a script in the campaign folder (`tools/build-homepage-assets.py`);
  do not hand-edit `assets/`.

Made by Dream Prism.

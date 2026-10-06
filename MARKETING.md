# Campaign tracking

Every route to the App Store carries an App Analytics campaign token, so
downloads can be traced back to where they came from. App Store Connect →
App Analytics → Acquisition → Campaigns reports against these tokens.

## The link format

```
https://apps.apple.com/app/apple-store/id6807606521?pt=121878938&ct=<token>&mt=8
```

- `pt` — our provider token. The same value on every link.
- `ct` — the campaign. Max 40 characters; lowercase and hyphenated by
  convention, because tokens differing only in case report as two campaigns.
- `mt=8` — media type, software.

No country code in the path: `/nl/` would pin desktop visitors to the Dutch
storefront. Without one, each visitor gets their own.

`utm_*` parameters do nothing here — the App Store ignores them.

## Social links

Social profiles link to `orionwordgame.com/go/<channel>`, which redirects to
the store link above. The indirection buys two things: the redirect is counted
on our side, where Apple only reports downloads and never clicks, and a
destination can be repointed in one commit instead of editing seven bios.

| Put in the bio | Reports as |
|---|---|
| `orionwordgame.com/go/tiktok` | `tiktok-bio` |
| `orionwordgame.com/go/instagram` | `instagram-bio` |
| `orionwordgame.com/go/youtube` | `youtube-bio` |
| `orionwordgame.com/go/x` | `x-bio` |
| `orionwordgame.com/go/threads` | `threads-bio` |
| `orionwordgame.com/go/bsky` | `bsky-bio` |
| `orionwordgame.com/go/facebook` | `facebook-bio` |
| `orionwordgame.com/go/reddit` | `reddit-bio` |
| `orionwordgame.com/go/press` | `press-kit` |
| `orionwordgame.com/download` | `website-download` |

Routes live in `vercel.json` under `redirects`, as 307s: a permanent redirect
is cached by the browser and could not be repointed afterwards.

## Tokens already in the site

| Token | Where it comes from |
|---|---|
| `website-home` | App Store buttons on the homepage |
| `smartbanner` | Safari's native banner on the homepage |
| `webbanner` | `smart-banner.js` default, for any page not naming its own |
| `support-pages` | `/help`, `/privacy`, `/tos` — banner and native banner |
| `applink` | `/app/*` universal-link landing pages |

A page sets its own token with `data-ct` on the script tag:

```html
<script src="/smart-banner.js" data-ct="support-pages" defer></script>
```

Safari's native banner needs it separately, in the meta tag, because the two
banners are independent:

```html
<meta name="apple-itunes-app" content="app-id=6807606521, affiliate-data=pt=121878938&amp;ct=support-pages">
```

## Adding a channel

1. Add a redirect to `vercel.json`.
2. Add the row to the table above.
3. Use the `/go/` link in the profile, never the raw App Store URL — a raw
   link in a bio cannot be repointed later.

## Reading the numbers

A campaign appears only once it reaches **5 first-time downloads** in the range
being viewed. Below that it is hidden, not zero. This is why channels share
coarse tokens: three pages splitting nine downloads can report nothing at all,
where one token covering them reports all nine.

Worth watching the ratio rather than the totals — our redirect count against
Apple's downloads is the click-to-install conversion, and a channel sending
many clicks that do not install is a different problem from one sending none.

# CSI GRIET — Website

## Quick Setup

### Option A — Python (Zero dependencies, works everywhere)
```bash
python3 server.py
# Open http://localhost:8080
```

### Option B — Node.js `serve` package
```bash
npx serve .
# serve.json handles SPA fallback automatically
```

### Option C — Netlify
- Drag the folder into https://app.netlify.com
- `netlify.toml` and `_redirects` handle the SPA routing

### Option D — Vercel
```bash
npx vercel
# vercel.json handles routing
```

### Option E — Apache
- Upload files to server
- `.htaccess` handles mod_rewrite for SPA routing

---

## Why there are no 404s on refresh

This is a Single Page App (SPA). All routing happens in the browser via `router.js`.
When you visit `/team` directly, the server must serve `index.html` for that path —
every config file above does this automatically.

**If you see 404 on refresh**, your server doesn't support SPA fallback. Use one of the options above.

---

## File structure

```
index.html          ← Entry point (single HTML file)
server.py           ← Python dev server with SPA fallback
serve.json          ← Config for `npx serve`
vercel.json         ← Config for Vercel
netlify.toml        ← Config for Netlify
_redirects          ← Netlify redirects (fallback)
.htaccess           ← Apache mod_rewrite

assets/
  css/              ← Stylesheets (all loaded synchronously)
  js/
    config.js       ← Supabase credentials
    utils.js        ← Shared helpers
    router.js       ← SPA navigation
    pages/          ← Per-page JS modules
    ui/             ← UI component modules

partials/           ← HTML fragments loaded by router.js
  nav.html
  footer.html
  home.html
  about.html
  events.html
  team.html
  alumni.html
  certificates.html
  ...

pages/errors/       ← Custom error pages (for static hosts)
```

---

## Config

Edit `assets/js/config.js` to update:
- Supabase URL and anon key
- Site URL

---

## CSS Architecture

All CSS files load **synchronously** (no `media="print"` tricks).
This means the site always renders correctly, even on slow connections.

Files load in order:
1. `tokens.css` — CSS custom properties (design tokens)
2. `layout.css` — Container and section helpers
3. `nav.css` — Navigation
4. `hero.css` — Hero section
5. `sections.css` — Content sections
6. `pages.css` — Page-specific styles
7. `components.css` — UI components
8. `footer.css` — Footer (uses hardcoded colors for reliability)
9. `responsive.css` — Media queries

**Safe to edit any CSS file** — changes will not break the site as long as you keep valid CSS syntax.

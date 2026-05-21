---
name: save-as-standalone-html
description: "Bundle design into a single self-contained HTML file that works offline. Trigger: 'single file', 'standalone', 'offline', 'self-contained HTML'."
---

# save-as-standalone-html

### Principles

A standalone HTML must:

1. Work **offline** (no fetches to CDNs, no external assets)
2. Work via **`file://` double-click** in any OS
3. Fit in a **single `.html`** — no sibling assets folder

### What to inline

| Resource | How |
|---|---|
| CSS | Inline in `<style>` in `<head>` |
| JS | Inline in `<script>` |
| Fonts | `@font-face` with base64 data URI |
| Images | `data:image/png;base64,...` |
| SVG | Inline as `<svg>` or `data:image/svg+xml;utf8,...` |
| JSON | `<script type="application/json" id="data">{...}</script>` |
| Video | If small, base64; if large, link out (breaks offline) |

### Inlining fonts

Download the `.woff2` file, base64-encode it:

```bash
# macOS / Linux
base64 -i font.woff2 -o font.b64

# or one-liner
base64 -w 0 font.woff2 > font.b64
```

Inline in CSS:

```css
@font-face {
  font-family: 'Custom';
  src: url(data:font/woff2;base64,d09GMgABAAAAAAA...) format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

**Cost:** each font adds 30-150KB. For standalone, prefer 1 family if
possible, or accept the weight as a tradeoff.

### Inlining images

```bash
# Encode
base64 -w 0 photo.png > photo.b64

# Or with imagemagick to compress first
cwebp -q 80 photo.png -o photo.webp
base64 -w 0 photo.webp > photo.b64
```

Use:

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAA..." alt="...">
```

```css
.hero { background-image: url(data:image/png;base64,...); }
```

**For large images (>200KB):**
- Compress aggressively (WebP at q=70-80 is usually fine)
- Convert geometric illustrations to inline SVG (much smaller)
- Resize to actual display dimensions, not source
- If still huge, accept that standalone may not be the right format

### Inlining libraries

```html
<!-- Instead of: -->
<script src="https://unpkg.com/react@18.3.1/..."></script>

<!-- Download and paste the contents: -->
<script>
  /* contents of react.development.js */
</script>
```

For React + ReactDOM + Babel, expect ~500KB inlined. Acceptable for
standalone, but consider whether you actually need React — many designs
work fine with vanilla JS + web components.

### Pre-render splash

For standalone with heavy inline content, show a placeholder while the
rest loads:

```html
<body>
  <template id="__bundler_thumbnail">
    <!-- Simple iconographic SVG, 30% padding on each side -->
    <svg viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#f6f3ec"/>
      <text x="50" y="60" text-anchor="middle" font-size="32"
            font-family="serif" fill="#1a1814">¶</text>
    </svg>
  </template>
  <!-- actual content -->
</body>
```

### Pre-export checklist

Before calling it standalone:

- [ ] No `<link rel="stylesheet" href="...">` pointing to a file
- [ ] No `<script src="...">` pointing to a CDN
- [ ] No `<img src="...">` referencing a local file
- [ ] No `url("./assets/...")` in CSS
- [ ] Google Fonts `<link>` tags removed (inline or replace with system)
- [ ] Test by opening via `file://` (double-click)
- [ ] Test with network disabled

### Build script (optional)

For repeatable bundling, a small Node script:

```js
// bundle.js
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('source.html', 'utf-8');

// Inline CSS files
let bundled = html.replace(
  /<link[^>]+href="([^"]+\.css)"[^>]*>/g,
  (_, href) => `<style>${fs.readFileSync(href, 'utf-8')}</style>`
);

// Inline JS files (skip external URLs)
bundled = bundled.replace(
  /<script[^>]+src="(?!https?:)([^"]+)"[^>]*><\/script>/g,
  (_, src) => `<script>${fs.readFileSync(src, 'utf-8')}</script>`
);

// Inline images (PNG/JPG/SVG)
bundled = bundled.replace(
  /src="(?!data:|https?:)([^"]+\.(png|jpg|jpeg|svg|webp))"/g,
  (_, file, ext) => {
    const data = fs.readFileSync(file).toString('base64');
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
    return `src="data:${mime};base64,${data}"`;
  }
);

fs.writeFileSync('standalone.html', bundled);
console.log('Standalone written.');
```

### Anti-patterns

- Leaving Google Fonts via `<link>` — breaks offline
- Inlining things that aren't used (entire design system CSS when only
  3 tokens are needed)
- 5MB+ standalone files — consider if PDF or hosted HTML would be better
- Forgetting to test offline before declaring done

# Style defaults

Apply these when no brand or design system constrains the choice.
`CLAUDE.md` references this file from the Plan phase — load it
when picking type, palette, spacing, layout, or imagery from scratch.

If the project already has tokens (in `design-system/`, a `tokens.css`,
or a sibling codebase's Tailwind config), **lift those exact values
instead of these defaults**. The Gather phase exists to find them.

---

## Type

- **Google Fonts** only (or system fonts if going minimal)
- Maximum **3 families** per design
- **Avoid overused stacks:** Inter, Roboto, Arial, Fraunces, system-ui
- Pairings worth considering:
  - Instrument Serif + Geist
  - IBM Plex Serif + IBM Plex Sans + IBM Plex Mono
  - Söhne alternatives (Inter Tight, Manrope) — use sparingly
  - Bricolage Grotesque (display) + Geist (body)
  - GT America alternatives (Geist, General Sans)
- Body text: 16–18px; reading text: 18–20px
- Display sizes: use `clamp()` for fluid scaling

---

## Color

- Use **OKLCH** for any custom colors:
  `oklch(0.62 0.14 38)` (lightness, chroma, hue)
- Tinted neutrals only — no pure `#fff` or `#000`:
  - Warm: `#f6f3ec` ground, `#1a1814` ink
  - Cool: `#f0f4f7` ground, `#0d1418` ink
  - Paper: `#fafaf7` ground, `#181613` ink
- Accent palette: share lightness and chroma, vary only hue
- Maximum **2 background colors** in a single design (one primary,
  one secondary for rhythm)
- **Locked tokens — no mid-render improvisation.** Once the palette
  is picked, every colour in the page references a token by name
  (`var(--color-accent)`, `color: var(--color-ink)`). Inline OKLCH,
  hex, or `rgb()` values in component styles are forbidden. If a
  value is needed that doesn't exist as a token, **lift it into
  `:root` first** as a named variable, then reference it. Same rule
  for `font-family` — every declaration goes through a token.

---

## Spacing

- Scale of **4 or 8**: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- Use `gap` with flex/grid — not margins between siblings
- Use CSS custom properties: `--space-1: 4px; --space-2: 8px; ...`

---

## Layout

- `display: flex` or `display: grid` with `gap:` for any row/group of
  siblings (buttons, chips, nav items, cards, toolbars)
- Reserve inline flow only for runs of text with occasional `<a>`,
  `<strong>`, `<em>` inside a sentence
- `text-wrap: pretty` on headings
- CSS Grid for complex layouts; Flexbox for one-dimensional rows

---

## Imagery

- **Never hand-draw illustrations as SVG.** Use labeled placeholders
- Placeholder pattern: a subtly textured `<div>` with a monospace caption
  describing what should go there
- Use real photos when the user provides them
- For decorative shapes, simple geometric SVG (circles, rectangles,
  gradients) is fine

---

## Scale

- Slides (1920×1080): **24px minimum** text, ideally 32px+
- Print documents: **12pt minimum** body text
- Mobile touch targets: **44×44px minimum**
- Desktop touch targets: **32×32px minimum**

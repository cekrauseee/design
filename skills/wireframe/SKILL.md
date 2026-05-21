---
name: wireframe
description: "Explore layout ideas with low-fidelity wireframes and storyboards. Trigger: 'wireframe', 'lo-fi', 'explore layouts', 'IA sketch', 'storyboard'."
---

# wireframe

## Visual identity — "sketch on warm paper"

Wireframes use a **hybrid fidelity** approach: sketchy layout chrome
and annotations paired with clean component interiors. The feel is a
designer's notebook — hand-lettered titles, dashed borders, paper
texture — with enough precision in the components that stakeholders can
read them as the real product.

### Fonts

Load from Google Fonts:

```
Caveat:wght@500;600;700   — titles, annotations, numbers, labels
Patrick Hand              — secondary handwritten (taglines, notes)
JetBrains Mono:wght@500;600 — technical labels, mono captions
```

Caveat is the primary wireframe voice. Use it for:
- Page titles (64px, weight 700)
- Section headers (48px, weight 700)
- Screen markers (38px)
- Annotation notes (18–22px, weight 500)
- Direction numbers, stamps, callout text

Patrick Hand is secondary — use for taglines or when you need a second
handwritten register that contrasts with Caveat.

JetBrains Mono for technical labels: screen names in `UPPERCASE`,
timestamps, keyboard shortcuts.

Body text (descriptions, paragraphs) stays in the project's body font
(Inter or system sans-serif) at small sizes (13–14px). The contrast
between handwritten chrome and clean body text is the signature look.

### Palette — warm paper

```css
--paper:      #efeae1;    /* page background */
--paper-2:    #e6e0d4;    /* secondary background */
--ink:        #1d1a17;    /* primary text */
--ink-2:      #3c3830;    /* secondary text */
--muted:      #7a7268;    /* tertiary / captions */
--line:       #2a2724;    /* borders, outlines */
--line-soft:  #c5bdb0;    /* subtle dividers */
--fill:       #faf7f0;    /* card / window surfaces */
--fill-2:     #e8e2d8;    /* secondary surfaces */
--fill-3:     #d8d0c2;    /* placeholder bars */
--accent:     #b04820;    /* warm red — arrows, notes, highlights */
--accent-soft:#d99b7a;    /* lighter accent */
--hilite:     #f3df8a;    /* yellow highlight */
```

No blues, no grays-that-look-like-real-UI. The warm paper tone makes
it impossible to mistake a wireframe for a finished screen.

### Chrome conventions

| Element | Style |
|---|---|
| Window frame | `1.75px solid var(--line)`, `border-radius: 12px`, `box-shadow: 3px 4px 0 var(--line)` |
| Titlebar | 32px height, three hollow dots (traffic lights), mono title centered |
| Tabs | `1.5px solid` borders, active = ink bg / paper text |
| Cards | `1.5px solid var(--line-soft)`, `border-radius: 10px` |
| Buttons | 30px height, `1.5px solid`, `border-radius: 6px` |
| Inputs | 30px height, `1.5px solid var(--line-soft)`, `border-radius: 6px` |
| Toggles | 32×20px, `1.5px solid`, pill shape |
| Keyboard chips | min-width 22px, `1.25px solid`, mono font |
| Placeholder (image) | `1.5px dashed var(--line-soft)`, diagonal stripe bg pattern, mono label centered |
| Text placeholder bars | solid rounded rectangles in `--fill-3`, 6–10px height |

### Annotation system

Annotations use Caveat in `var(--accent)`:

- **Inline notes** (`.note`): 18px, accent color, short one-liners
- **Note cards**: accent left-border, Caveat number + body text — for
  numbered callouts alongside a wireframe
- **Hand-drawn arrows**: SVG `<path>` with `stroke: var(--accent);
  stroke-width: 1.6; fill: none` plus arrowhead polygon
- **Stamps**: pill-shaped border + Caveat text, slight rotation
  (`transform: rotate(-2deg)`) — for version/status labels
- **Future peeks**: dashed accent border blocks with Caveat text,
  hidden by default, togglable via tweaks

### Starter

Use the wireframe starter at `~/starters/wireframe-kit.css`
and `~/starters/wireframe-kit.jsx`. They provide:

- All CSS tokens and primitives described above
- React components: `WFWindow`, `WFBtn`, `WFInput`, `Kbd`, `KbdGroup`,
  `Toggle`, `Bar`, `Chip`, `Pill`, `NoteCard`, `HandArrow`,
  `VariantCap`, `ScreenBlock`, `HistRow`
- Copy into project's `folders/wf/` directory

## Structure

1. Place wireframes in a full-page scrollable layout with direction
   tabs at the top. For simpler explorations, use `<design-canvas>`
   (`starters/design-canvas.jsx`) for side-by-side comparison.

2. Each direction is a **complete** variation — all screens, not a
   fragment. Show the full product surface (home, settings, key flows,
   overlay/pill states).

3. Aim for **3 directions** with **4-8 screens each**. Each direction
   explores a fundamentally different approach, not the same idea in
   different shades.

4. Use a **direction intro card** for each: Caveat title, tagline,
   keep/rethink lists, design principles. This frames the hypothesis
   before the wireframes.

## Layout pattern

```
Page header (Caveat 64px title + subtitle + stamp)
├── Direction tabs (3 tabs with number, name, blurb)
├── Direction intro card (grid: description | principles)
├── Screen blocks (repeated)
│   ├── Screen title (Caveat marker + name + mono label)
│   ├── Screen description (13px muted)
│   └── Wireframe layout (grid: window + notes sidebar)
│       ├── WFWindow (titlebar + tabs + body)
│       └── Notes column (numbered note-cards)
└── Summary table (comparison across directions)
```

## Dimensions to vary

When exploring, vary across **multiple real axes**:

- **Hierarchy:** what's at the top? hero or nav?
- **Density:** how much above the fold?
- **Navigation pattern:** tabs, sidebar, hub, stepper, mega-menu,
  ⌘K palette, menubar
- **CTA placement:** inline, sticky, modal, floating, dock
- **Layout:** split, stacked, grid, full-bleed, sidebar, canvas
- **Surface model:** single window, multi-window, menubar + window,
  resizable modes
- **Reading order:** F-pattern, Z-pattern, centered column
- **Information chunking:** progressive disclosure vs. all-visible

Not 3 versions of the same idea with different nav positions.

## Annotation guidelines

Every wireframe needs:

- **Section title** with Caveat marker number + descriptive name
- **Mono label** for the screen type (e.g., `MAIN WINDOW`, `OVERLAY`,
  `SETTINGS`)
- **Note cards** alongside the wireframe explaining design decisions,
  motion notes, interaction patterns
- **Future peek blocks** (hidden by default) for features that this
  layout could support later

## Tweaks panel

Always include a tweaks panel with at minimum:

- Toggle: Show/hide annotations
- Radio: Density (compact / normal / spacious)
- Toggle: Show future-feature peeks
- Radio: Jump to direction (if using direction tabs)

## Anti-patterns

- Polishing a single wireframe — resist; make more variations
- Using real brand colors — wireframes are about structure, not style
- Skipping the handwritten style — clean sans-serif wireframes look
  like bad hi-fi, not good lo-fi
- Missing annotations — wireframes without notes are just ugly mockups
- Tiny text — titles should be 32px+, body 13px minimum
- Using real images — always use labeled dashed placeholders
- Single-screen variations — each direction should show the full
  product surface

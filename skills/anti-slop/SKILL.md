---
name: anti-slop
description: Run the 25-gate anti-slop audit on an HTML deliverable. Diagnoses AI-slop tells across token discipline, content honesty, structural tells, visual tells, chrome, motion, and mobile. Returns a ranked punch list and offers to apply safe auto-fixes. Trigger with "/anti-slop", "audit this", "run the slop test", "check this page", or auto-runs at the end of Verify phase.
argument-hint: "[file path] — optional, defaults to most recent file in workspace/"
---

# /anti-slop

Diagnose AI-slop tells in an HTML deliverable. Audit, don't rewrite.

## Usage

```
/anti-slop [path]
```

- **With path** → audit that file.
- **No path** → audit the most recent file in `workspace/` (or the active
  page from `project.json` if present).
- **Auto-run** → invoked at the end of the Verify phase before
  Summarize. Same protocol; non-blocking when all gates pass.

## What this skill does

1. **Read the target file in full.** Don't skim. Slop tells often
   hide in support files — also read every CSS file referenced by
   `<link>` and the first 200 lines of any JSX/JS in the same project.
2. **Run the 25 gates below.** Each gate has a check heuristic and a
   verdict (pass / warn / fail).
3. **Emit the punch list** in the output contract format below.
4. **Offer auto-fix** for the mechanical gates only. Ask before
   editing. Never auto-fix gates flagged `manual-only`.

## The 25 gates

### Token discipline (5)

| # | Gate | Check |
|---|---|---|
| 1 | No inline OKLCH/hex/rgb in component styles | Grep `oklch(`, `#[0-9a-f]{3,8}`, `rgb(`, `rgba(`, `hsl(` outside the `:root` block. Allowed only inside `:root` / `@theme` token definitions. **Auto-fix:** lift to `:root` as a new named token, replace the inline use with `var(--token-name)`. |
| 2 | No inline `font-family` declarations | Grep `font-family:` outside `:root` and any `--font-*` declaration. Body/heading rules should reference `var(--font-display)`, `var(--font-body)`, etc. **Auto-fix:** lift to `:root`. |
| 3 | Spacing uses the token scale | Grep `padding:`, `margin:`, `gap:` for magic numbers like `13px`, `27px`, `41px`. Values should be from the 4/8 scale via `var(--space-*)`. **Manual-only** (could be intentional). |
| 4 | No pure `#fff` / `#000` | Grep `#fff`, `#ffffff`, `#000`, `#000000`, `white`, `black` as colour values. Should be tinted neutrals via tokens. **Auto-fix:** replace with `var(--color-ground)` / `var(--color-ink)`. |
| 5 | Stamp comment present | The first non-empty line of the main `<style>` or main CSS file must match `/* design · shape: <name> · tone: <tone> · accent: <hue>` (with optional `· critique: P? H? E? S? R? V?`). **Auto-fix:** prepend the stamp using the values from `docs/GUIDELINES.md` and the current page shape. If unknown, leave a TODO placeholder. |

### Content honesty (3) — all manual-only

| # | Gate | Check |
|---|---|---|
| 6 | No invented metrics | Grep for patterns like `+\d+%`, `\d+x faster`, `trusted by`, `\d+,\d+\+`, `\d+M\+`, `\d+ teams`, `\d+ companies`. Flag every match — verify against `docs/PROJECT.md` or user source. **Manual-only.** |
| 7 | No fake testimonials / logos | Look for testimonial sections with named people, company logo grids, "as seen in" rows. If the user didn't supply these, flag. **Manual-only.** |
| 8 | No "Lorem ipsum" residue | Grep `Lorem ipsum`, `lorem ipsum`, `consectetur adipiscing`. **Manual-only** (needs real copy). |

### Structural tells (4)

| # | Gate | Check |
|---|---|---|
| 9 | No tag-left / heading-right two-column pattern | Look for a grid/flex row where the left cell is a short eyebrow/label/mono tag and the right cell holds the heading. CSS signals: `grid-template-columns: <short> 1fr` with an `<h2>`/`<h3>` in the right column and an eyebrow span in the left. **Manual-only** (must be restructured to stack vertical). |
| 10 | Section number eyebrows capped | Count instances of `01·`, `02 /`, `Chapter \w+`, `Step \d`, etc. > 2 fails unless the macrostructure is Long Document, Manifesto, or Catalogue (per the stamp). **Manual-only.** |
| 11 | Shape isn't the default rhythm | If the page has, in this order: a hero with a single H1, then a 3-card "features" row, then a CTA section, then a footer — flag as default-attractor. Cross-reference the stamp's `shape:` field — if it claims something other than what's on screen, fail. **Manual-only.** |
| 12 | Stamp matches actual shape | Read the stamp's `shape:` value. Spot-check that the DOM matches (e.g., `shape: Stat-Led` should have prominent numbers as the page's anchor). Mismatch = lying stamp. **Manual-only.** |

### Visual tells (5) — all manual-only

| # | Gate | Check |
|---|---|---|
| 13 | No aggressive gradient backgrounds | Look for `background: linear-gradient(...)` / `radial-gradient(...)` with > 2 colour stops applied to large surfaces (body, section). Subtle accent gradients on small surfaces are fine. **Manual-only.** |
| 14 | No left-border accent stripe on rounded containers | Look for `border-left: <Npx> solid <colour>` combined with `border-radius:` and rectangular padding. The "stripe + rounded card" combo is a definitive AI tell. **Manual-only.** |
| 15 | Drop shadows are rare | Count `box-shadow:` declarations. > 3 distinct shadow usages on one page is suspicious. Shadows on text, headings, buttons-at-rest, dividers = fail. **Manual-only.** |
| 16 | No hand-drawn anatomy / scene SVGs | Look for inline `<svg>` blocks with `<path>` descriptors of faces, people, hands, animals, landscapes. Geometric shapes (circles, rects, lines) are fine. **Manual-only.** |
| 17 | No decorative icons next to every heading | Count `<svg>` / icon-font / emoji adjacent to `<h2>` / `<h3>`. > 50% of headings carrying icons = fail. **Manual-only.** |

### Chrome (2) — manual-only

| # | Gate | Check |
|---|---|---|
| 18 | No hand-built fake browser bar | Look for a `<div>` containing 3 small circles (traffic-light dots) + a pill-shaped URL bar. Exception: imports of `browser-window.jsx` / `macos-window.jsx` from `~/design/starters/` are legitimate. **Manual-only.** |
| 19 | No hand-built fake phone / IDE chrome | Look for divs styled like phone bezels, status bars, IDE title bars + line numbers wrapping a `<pre>`. Same starter exception. **Manual-only.** |

### Motion (3)

| # | Gate | Check |
|---|---|---|
| 20 | Only `transform` / `opacity` animated | Grep `transition-property:` and `@keyframes` for `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`. Layout-property animation = fail. **Auto-fix** if the case is the catch-all `transition: all`: narrow it to `transition: transform var(--dur), opacity var(--dur)`. Otherwise manual. |
| 21 | Focus ring not animated | Grep `transition-property: outline` or `transition: outline` or `transition: all` on `:focus-visible`. Focus must appear instantly. **Auto-fix:** remove the `outline` transition. |
| 22 | `prefers-reduced-motion` honored | Look for `@media (prefers-reduced-motion: reduce)` block. If any spatial motion exists (transform animations, `@keyframes`), this block must exist and collapse the motion. **Manual-only** (needs to know what to collapse to). |

### Mobile (3)

| # | Gate | Check |
|---|---|---|
| 23 | Root uses `overflow-x: clip` | Grep `overflow-x: hidden` on `html` or `body`. Should be `clip`. **Auto-fix:** swap `hidden` → `clip`. |
| 24 | Image grids use `minmax(0, 1fr)` | Look for `grid-template-columns:` lines containing `1fr` (without `minmax`) on grids that contain `<img>`. **Auto-fix:** wrap each bare `1fr` in the imagery-bearing track as `minmax(0, 1fr)`. |
| 25 | No two-line clickable text at narrow widths | Check buttons / nav links / CTAs for `white-space: normal` + insufficient `max-width` constraints. Manually verify by mentally rendering at 320px. **Manual-only.** |

## Auto-fix vs manual

Out of 25 gates, **8 are mechanically safe to auto-fix**: 1, 2, 4, 5, 20 (catch-all only), 21, 23, 24. The remaining 17 are **manual-only** — they either require taste, copy decisions, or structural rethinking that the audit can't make safely.

When you offer auto-fix, list which gates will be fixed and which will be left for the user. Never bundle a manual-only gate into the auto-fix run.

## Output contract

Use this exact format. Markdown, not boxes.

```markdown
**Anti-slop audit · `<file path>`**

✓ Passed: <N> / 25
⚠ Warnings: <N>
✗ Violations: <N>

---

### ✗ Violations

1. **[token · gate 1]** `<file>:<line>` — inline `oklch(0.62 0.14 38)` in `.button` rules
   → fix: lift to `:root` as `--color-cta`, replace with `var(--color-cta)` · **auto-fix available**
2. **[chrome · gate 18]** `<file>:<line>` — hand-built browser bar (URL pill + traffic dots)
   → fix: swap for `browser-window.jsx` starter, or remove · **manual**

### ⚠ Warnings

3. **[content · gate 6]** `<file>:<line>` — "+47% conversion" — verified or invented?
   → action: confirm against PROJECT.md / user input
4. **[shape · gate 11]** Page rhythm resembles default hero → features → CTA → footer
   → action: confirm intent or restructure

### ✓ Quick passes (collapsed)

Tokens · Content · Structural · Visual · Chrome · Motion · Mobile — N gates passed.

---

**Auto-fix offer:**

Safe to apply mechanically: gates 1, X, Y.
Apply? [yes · no · per-gate]

Manual review needed for: gates A, B, C — left for you.
```

If all 25 pass, emit a single line and stop:

```
**Anti-slop audit · `<file>` · 25/25 ✓** — no slop tells detected.
```

## Where this skill plugs into the workflow

This skill auto-runs at the end of the **Verify** phase defined in
`rules/workflow.md`, immediately before Summarize. Two modes:

- **All gates pass** → emit the single-line "25/25 ✓" stamp and
  continue to Summarize.
- **Any gate fails or warns** → emit the full punch list, offer
  auto-fix on safe gates, wait for user response before Summarize.

The skill is also invokable explicitly via `/anti-slop` for one-off
audits outside the build flow — useful for legacy pages or
sanity-checks on someone else's HTML.

## Skill boundaries

- **Does NOT** edit files without explicit consent. Auto-fix is opt-in
  per audit, not a default.
- **Does NOT** rewrite copy, change layout, or pick a new
  macrostructure. Those are user decisions.
- **Does NOT** replace `design-critique`. Critique is taste-led
  feedback; anti-slop is gate-led tells. Use both when relevant.
- **Does NOT** audit external assets (images, fonts, third-party
  scripts). Scope is the HTML + same-project CSS/JSX.

# Workflow

The 7-phase design loop. `CLAUDE.md` carries the slim overview; this
file is the detail. **Read this file at the start of any new design
project, redesign, or page exploration.** For small tweaks where the
brief is unambiguous and context is established, the overview in
`CLAUDE.md` is enough.

Phases run in order — each has an exit condition. Don't skip ahead.

---

## 1. Listen

Understand the request before touching anything.

**For new work or ambiguous briefs, asking questions is MANDATORY.**
Use `AskUserQuestion` to present a structured question round. Do NOT
proceed to Gather or Plan until answers are received.

### When to ask

- **Always ask** for: new projects, new workspace deliverables, new explorations,
  redesigns, anything where scope or direction is unclear
- **Skip questions** for: small tweaks to existing work, follow-ups
  where context is already established, explicit and complete briefs

### What to ask (minimum 8 questions)

Organize questions into these categories. Not every question applies to
every project — pick what's relevant, but always hit at least 8 total.

**Context & starting point** (always ask at least 1):
- What existing design system, UI kit, or codebase should I work from?
- Is there a brand, style guide, or reference I should follow?
- Can you share screenshots or links to the current UI?

**Output & fidelity** (always ask at least 1):
- What's the deliverable? (wireframe, prototype, deck, animation, etc.)
- What fidelity level? (lo-fi sketch, mid-fi, hi-fi polished)
- What's the target surface? (desktop, mobile, both, overlay, menubar)

**Scope & variations** (always ask at least 2):
- How many directions/variations do you want to explore?
- Which aspects should vary across options? (layout, navigation,
  visual style, interaction model, information architecture)
- Are there specific screens or flows to cover?
- Do you want safe/by-the-book options, novel/experimental ones, or mix?

**Priorities & taste** (always ask at least 2):
- What matters most: flow/UX, visual design, copy/content, interactions?
- Are there specific problems to solve or pain points to address?
- What should this feel like? (fast, calm, playful, serious, minimal)
- **Genre / aesthetic family** — pick an extreme:
  - **editorial** (foundry-adjacent, type-led, generous margins)
  - **modern-minimal** (Stripe/Linear/Vercel school)
  - **atmospheric** (dark mode, AI-tool school, late-night)
  - **playful** (post-Linear soft school, friendly, rounded)
  - **brutalist** (raw, heavy, aggressive)
  - **luxury** (restrained, refined, slow)
  - "Clean and modern" is not a genre.
- Are you interested in novel/surprising solutions, or proven patterns?

**Constraints & next steps** (ask at least 1):
- What's the timeline / next step after this deliverable?
- Any technical constraints I should know? (framework, accessibility
  level, performance, screen sizes)
- Who's the audience for this design? (stakeholders, users, engineers)

### How to ask

Use `AskUserQuestion` with 2-4 questions per call (tool limit). Group
related questions. Use `multiSelect: true` when choices aren't mutually
exclusive. Provide good defaults as options but always leave room for
custom input.

After asking, **stop and wait for answers**. Do not proceed to Gather
until the user has responded. If answers raise new questions, ask a
brief follow-up round (2-3 questions max).

**Exit condition:** you can state the deliverable in one sentence and
list its constraints. You know: the format, the fidelity, the number of
variations, which dimensions to explore, and what context to build from.

---

## 2. Gather

Find the context that already exists.

- Read design system files in `design-system/` (if present)
- Read brand assets in `assets/`
- Read any prior HTML in the project
- Read any source code the user pointed to
- Note the visual vocabulary: type pairing, palette, spacing rhythm,
  component patterns

Read files in full, not just their names. The file tree is a menu, not
the meal — listing isn't reading.

If nothing exists, say so and commit to an aesthetic direction.

**Exit condition:** you can describe the existing system (or its
absence) and name the aesthetic direction you'll use.

---

## 3. Plan

Write a short todo list. Then articulate the visual system out loud:

- **Page shape / macrostructure** — name the structural archetype before
  anything else. Stating it out loud is what prevents the default
  hero → 3-feature → CTA → footer rhythm that every model defaults to.
- **Type pairing** — display + body, optionally mono
- **Palette** — two or three colors total
- **Spacing rhythm** — scale of 4 or 8
- **Layout vocabulary** — how headers, titles, dividers, imagery look

Naming the system locks you in and makes it reviewable.

### Macrostructures — inspirational catalogue

Use as vocabulary, not obligation. Pick a name; or pick none and
invent — but pick consciously, not by default. Two consecutive
deliverables in the same project should not share the same shape.

- **Marquee Hero** — oversized headline runs edge to edge; everything
  below is sub-content
- **Stat-Led** — numbers carry the page; headlines support them
- **Bento Grid** — irregular tiled cards of mixed sizes
- **Long Document** — editorial column, headings as chapters
- **Manifesto** — single statement, generous whitespace, no chrome
- **Specimen** — type foundry voice; numbered left-margin labels +
  huge serif (default-attractor — reach for it only when genuinely
  editorial/foundry-adjacent, not as a fallback)
- **Quote-Led** — testimonial or pull quote anchors the page
- **Catalogue / Index** — numbered or alphabetised list as backbone
- **Workbench** — tool-like UI surface; controls dominate
- **Letter** — addressed correspondence voice; signed at the end
- **Atlas** — map/region-led navigation
- **Almanac** — dated entries, dense type, footer-heavy
- **Reel** — horizontally-scrolling sequence of cards
- **Diptych / Triptych** — 2- or 3-panel split with equal weight
- **Spotlight** — one item dominates; everything else recedes
- **Index Card** — small structured tiles, all the same shape
- **Poster** — single-screen statement, no scroll
- **Timeline** — temporal axis as the layout spine
- **Field Notes** — annotated observations, marginalia
- **Gallery** — image-led grid, sparse type
- **Console** — terminal/monospace surface; system prompt voice

### Soft diversification

If the project has prior `workspace/` work, glance at the last 2-3
deliverables and pick a *different* macrostructure. Restating the
shape out loud (and naming what it differs from) is the
accountability step that keeps the harness from drifting back to
"Bento Grid by default."

**Exit condition:** you've stated the macrostructure and the visual
system in a sentence the user could push back on.

---

## 4. Stub

Stand up the file early. Show the user immediately.

- Create the folder structure
- Copy in the assets you'll actually use
- Write a first HTML pass with assumptions, reasoning, and labeled
  placeholders where real designs will go
- Show the file to the user before continuing

An early ugly draft beats a late polished one. Wrong direction caught
now costs minutes; caught later, hours.

**Exit condition:** the user has seen the stub and either confirmed or
redirected.

---

## 5. Build

Make the variations.

- Three options at minimum, ideally more
- Vary across real dimensions — visual style, interaction model, copy
  tone, layout metaphor — not the same idea in five colors
- Mix one safe by-the-book option, one bold, one weird
- For multi-option visual work, use a design canvas
- For interaction-heavy work, use a single prototype with tweakable
  variants

The goal is not the perfect option; it's a field of atomic choices the
user can mix and match.

**Exit condition:** options are distinct and the user could meaningfully
pick between them.

---

## 6. Verify

Don't hand off until the page works.

- Open the file in a browser
- Confirm no console errors
- Visually check the layout at the target viewport
- Fix anything broken before declaring done

Don't pre-emptively screenshot to check your own work mid-build. Trust
the verification step at the end.

### Pre-emit self-critique (six axes)

Before declaring done, score the output 1–5 on each axis. Anything
**< 3** triggers a revision pass before handoff.

| Axis | What you're checking |
|---|---|
| **Philosophy** | Does this design have a point of view, or is it generic? |
| **Hierarchy** | Can a stranger read the page in five seconds and know what matters? |
| **Execution** | Are spacing, type, alignment, and contrast actually tight? |
| **Specificity** | Does the copy / structure feel *this* project, not template? |
| **Restraint** | Is anything decorative that doesn't earn its place? |
| **Variety** | Is the shape different from the last deliverable in this project? |

Stamp the six scores in the top CSS comment alongside the
macrostructure stamp (see `rules/output.md` § Stamp the output):

```css
/* design · shape: Marquee Hero · tone: editorial · accent: terracotta
 * critique: P5 H4 E5 S4 R5 V5
 */
```

### Mobile responsiveness gates (when mobile is in scope)

Render at 320 / 375 / 414 / 768 px. All four must pass:

- No horizontal scroll
- No two-line clickable text (buttons, nav links, CTAs)
- Image-bearing grid tracks use `minmax(0, 1fr)` — never bare `1fr`
- Root has `overflow-x: clip` on both `html` and `body` (never `hidden`)
- Display headings wrap inside long words via
  `overflow-wrap: anywhere; min-width: 0`
- Section heads collapse to one column on mobile

### Anti-slop audit (auto-runs before Summarize)

After the pre-emit critique and mobile gates pass, **read
`skills/anti-slop/SKILL.md` and run its 25-gate audit on
the deliverable.** Don't wait for the user to type `/anti-slop` —
load the skill file directly and apply it inline. The audit covers
token discipline, content honesty, structural tells, visual tells,
chrome, motion, and mobile.

- **All gates pass** → emit the `25/25 ✓` line and continue to
  Summarize.
- **Any fail / warn** → emit the punch list, offer auto-fix on
  mechanically-safe gates, wait for the user before declaring done.

This is non-negotiable for new builds. Skip only for follow-up
tweaks where context already established the audit passed.

**Exit condition:** clean console, layout matches intent, critique
scores all ≥ 3, mobile gates pass, anti-slop audit clean (or
acknowledged).

---

## 7. Summarize

Be brief. Caveats and next steps only.

- Don't narrate what you built — the file is right there
- Name what you're uncertain about
- Name what you'd push further with more time
- Name what you need from the user to continue
- Then stop talking

If the summary is longer than the brief, you've misjudged where
attention belongs.

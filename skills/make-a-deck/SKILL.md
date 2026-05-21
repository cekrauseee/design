---
name: make-a-deck
description: "Create slide decks in HTML. Trigger: 'make a deck', 'slides', 'presentation', 'pitch', 'slideshow'."
---

# make-a-deck

### Setup

1. Use the `deck-stage.js` starter from `starters/`. Load with a normal
   script tag — it's a vanilla web component:

   ```html
   <script src="starters/deck-stage.js"></script>
   ```

2. Each slide is a `<section>` child of `<deck-stage>`:

   ```html
   <deck-stage>
     <section data-screen-label="01 Title">...</section>
     <section data-screen-label="02 Agenda">...</section>
     <section data-screen-label="03 Problem">...</section>
   </deck-stage>
   ```

3. Default canvas: **1920x1080** (16:9). For portrait, use 1080x1920
   and configure the stage accordingly.

4. Write slide content as **static HTML**, not generated from a JS
   array via map/loop. Static markup lets the user inline-edit headings
   without round-tripping through chat.

### Visual system

Before building, commit out loud to:

- **Type pairing** — display family + body family (optionally a mono)
- **Palette** — maximum 2 background colors for rhythm
- **Header treatment** — section dividers vs. continuous numbering
- **Title treatment** — left-aligned, centered, hanging indent, etc.
- **Image treatment** — full-bleed, framed, gridded
- **Footer** — slide number only, or nothing at all

State the system in one sentence: *"Instrument Serif + Geist, warm
neutrals, full-bleed image slides alternating with type-only slides."*

### Content rules

- **Minimum text size: 24px.** Ideally 32px+ for body, 64px+ for titles.
- **No filler.** No "About Us" slide unless the deck needs one.
- **No data slop.** Numbers should be real and meaningful, not chosen
  for visual effect.
- **No decorative icons.** Icons must do work (clarify a flow, mark a
  category) or they don't belong.
- **Intentional variety:** alternate full-bleed, type-only, image+text,
  divider slides. Twenty slides with the same layout is a fail state.
- **If a slide feels empty:** the answer is composition, not invention.
  Use scale, white space, or a striking image. Don't add bullet points.

### Slide labels

Tag every slide with `data-screen-label`. 1-indexed, padded:

```html
<section data-screen-label="01 Title">...</section>
<section data-screen-label="02 Agenda">...</section>
<section data-screen-label="13 Closing">...</section>
```

This is what lets the user say "fix slide 5" and have you know which
one without counting.

### Speaker notes (only if asked)

```html
<script type="application/json" id="speaker-notes">
[
  "Welcome. Today we're going to walk through three things.",
  "First, the problem...",
  "",
  "And here's where things get interesting...",
  ""
]
</script>
```

- Positional array. Index N = slide N's note.
- Empty string for slides without notes.
- When you add/remove/reorder slides, update this array in the same
  edit.

### Layout primitives

A small library of layouts to mix:

- **Title slide** — large display type, no chrome
- **Section divider** — color-shifted background, single word or phrase
- **Text + image** — split 50/50 or 60/40
- **Full-bleed image** — image fills, type overlaid with backdrop
- **Stat slide** — one huge number with a sentence below
- **Quote slide** — pulled quote in display italic, attribution in mono
- **Three columns** — for triadic comparisons (problem / solution / outcome)
- **Closing** — mirror the title slide; provide an end mark

Don't reinvent these on every deck. Define them once in CSS classes,
reuse.

### Anti-patterns

- Generic title slide that exists only to start the deck
- "Thank you / Questions?" closing without substance
- Bullet point lists longer than 3 items
- Footer with logo + page number + confidential on every slide
- Drop shadows on cards
- Aggressive gradient backgrounds
- Emoji as visual interest

### Example skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My Deck</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --serif: "Instrument Serif", serif;
      --sans: "Geist", sans-serif;
      --ground: #f6f3ec;
      --ink: #1a1814;
      --accent: oklch(0.62 0.14 38);
    }
    deck-stage { background: var(--ground); color: var(--ink); }
    section { padding: 96px; font-family: var(--sans); }
    h1 { font-family: var(--serif); font-size: 120px; line-height: 0.95; }
  </style>
</head>
<body>
  <deck-stage>
    <section data-screen-label="01 Title">
      <h1>The Talk Title</h1>
    </section>
    <section data-screen-label="02 Agenda">
      <h2>What we'll cover</h2>
    </section>
  </deck-stage>
  <script src="starters/deck-stage.js"></script>
</body>
</html>
```

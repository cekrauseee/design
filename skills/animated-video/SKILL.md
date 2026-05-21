---
name: animated-video
description: "Create timeline-based motion design and animated videos in HTML. Trigger: 'animation', 'motion design', 'explainer video', 'intro animation', 'cinematic'."
---

# animated-video

### Setup

Use the `animations.jsx` starter:

```html
<script type="text/babel" src="starters/animations.jsx"></script>
```

It provides:

- `<Stage>` — auto-scaling container with scrubber, play/pause, and
  persistent playback position
- `<Sprite start={t1} end={t2}>` — appears within a time range
- `useTime()` — current time in seconds
- `useSprite()` — normalized progress 0->1 inside a Sprite
- `Easing` — `easeIn`, `easeOut`, `easeInOut`, `cubic`, `elastic`, etc.
- `interpolate(t, [0, 1], [from, to])` — value mapping with optional easing
- Entry/exit helpers — `fadeIn`, `slideUp`, `scaleIn`

### Composition

A typical scene structure:

```jsx
<Stage duration={12}>
  <Sprite start={0} end={3}>
    {/* Scene 1: Logo entrance */}
    <LogoReveal />
  </Sprite>

  <Sprite start={2.5} end={6}>
    {/* Scene 2: Title with overlap from scene 1 */}
    <TitleScene />
  </Sprite>

  <Sprite start={5.5} end={12}>
    {/* Scene 3: Final cards */}
    <CardsReveal />
  </Sprite>
</Stage>
```

**Overlap scenes by ~0.5s** for natural crossfades. Hard cuts work for
specific effects but rarely as defaults.

### Motion principles

- **Movement serves hierarchy.** What enters first is most important.
  Stagger entries to lead the eye through the composition.
- **Easing is everything.** Linear motion feels robotic.
  - Entrances -> `easeOut` (start fast, settle)
  - Exits -> `easeIn` (start slow, accelerate away)
  - Bidirectional -> `easeInOut`
- **Durations:**
  - UI micro-animations: 150-300ms
  - Scene transitions: 600-1200ms
  - Full scenes: 3-8 seconds
- **Stagger:** for groups of elements, offset by 60-120ms between each.
- **Persistent position:** Stage saves time to localStorage. Refresh
  resumes where you stopped — critical for iterating on a specific
  moment.

### Inside a Sprite

```jsx
function LogoReveal() {
  const t = useSprite();  // 0 -> 1 over the sprite's range
  const scale = interpolate(t, [0, 0.6], [0.8, 1], Easing.easeOut);
  const opacity = interpolate(t, [0, 0.3], [0, 1]);

  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      <Logo />
    </div>
  );
}
```

### When NOT to use Stage

For UI micro-animations — hover, click feedback, state transitions —
use CSS transitions or React state. Stage is for timed cinematic
content.

Don't hand-roll `setTimeout` chains or `requestAnimationFrame` loops.
Almost always the timeline primitive is enough. The exceptions:

- Generative / procedural animation (particle systems, physics)
- Real-time interaction (drag-to-reorder with momentum)
- Audio-synced timing (needs more precision than Stage offers)

For those, use Popmotion or a similar library:

```html
<script src="https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js"></script>
```

### Anti-patterns

- Animation for animation's sake — every movement should communicate
- Bounce/elastic on professional content (unless explicitly part of brand)
- Everything entering simultaneously
- Linear motion on UI elements
- 5-second logo splashes
- No way to skip / scrub

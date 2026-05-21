# Starters

Self-contained scaffolds for common design tasks. Each file is
independent — drop it in, load it, use it. No build step. No install.

These are the **same scaffolds** used by the design harness referenced
in `CLAUDE.md` and `skills.md`. Byte-for-byte canonical versions.

---

## Inventory

| File | Type | What it does |
|---|---|---|
| `deck-stage.js` | Web component | Slide deck shell — scaling, keyboard nav, thumbnail rail, speaker notes, print-to-PDF |
| `animations.jsx` | React + Babel | Timeline animation engine — Stage, Sprite, easing, scrubber |
| `design-canvas.jsx` | React + Babel | Pan/zoom canvas for presenting design options side-by-side |
| `tweaks-panel.jsx` | React + Babel | In-design tweak panel — form controls + persistence protocol |
| `ios-frame.jsx` | React + Babel | iPhone bezel — status bar, home indicator, keyboard |
| `android-frame.jsx` | React + Babel | Android bezel — status bar, nav bar, keyboard |
| `macos-window.jsx` | React + Babel | macOS window chrome — traffic lights, titlebar |
| `browser-window.jsx` | React + Babel | Browser window chrome — tabs, URL bar, controls |
| `image-slot.js` | Web component | Drag-and-drop image placeholder — author-controlled shape, persistent |
| `wireframe-kit.css` | CSS | Wireframe tokens + primitives — warm paper palette, Caveat handwritten annotations, sketchy chrome |
| `wireframe-kit.jsx` | React + Babel | Wireframe React components — WFWindow, WFBtn, WFInput, Kbd, Toggle, Bar, Placeholder, NoteCard, HandArrow, ScreenBlock |

---

## Loading

### Vanilla (`.js` files)

Load with a normal `<script src>` tag:

```html
<script src="starters/deck-stage.js"></script>
<script src="starters/image-slot.js"></script>
```

Order doesn't matter between them. Load before the markup that uses
them, or use `defer`.

### React (`.jsx` files)

Load React, ReactDOM, and Babel first — **in this order**, with pinned
versions and integrity hashes:

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"
  integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L"
  crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
  integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm"
  crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
  integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y"
  crossorigin="anonymous"></script>
```

Then load the starters with `type="text/babel"`:

```html
<script type="text/babel" src="starters/animations.jsx"></script>
<script type="text/babel" src="starters/tweaks-panel.jsx"></script>
<script type="text/babel" src="starters/ios-frame.jsx"></script>

<!-- Finally, your app -->
<script type="text/babel" src="app.jsx"></script>
```

**Do not use `type="module"`** — it breaks Babel interop.

---

## Cross-file scope

Each `<script type="text/babel">` block gets its own scope when
transpiled. Components defined in one file are **not visible** in
another by default.

To share components between files, export them to `window` at the end
of the defining file:

```jsx
// At the end of components.jsx
Object.assign(window, {
  Card,
  Button,
  Modal,
  Section,
});
```

Then in `app.jsx`, you can reference them directly:

```jsx
function App() {
  return (
    <Section>
      <Card>
        <Button>Click me</Button>
      </Card>
    </Section>
  );
}
```

The starters in this folder follow this convention — components like
`<Stage>`, `<TweaksPanel>`, `<IOSFrame>` are exported to `window` and
available globally after the starter loads.

---

## Style object naming

Critical convention: **name style objects uniquely per component.**

```jsx
// ❌ Bad — collisions across files break silently
const styles = {
  root: { padding: 16 },
  title: { fontSize: 24 },
};

// ✅ Good — unique per component
const cardStyles = {
  root: { padding: 16 },
  title: { fontSize: 24 },
};
```

In inline-Babel React, all top-level `const`s share global scope. Two
files with `const styles = {}` will overwrite each other and one of
them will silently get the wrong styles.

The starters follow this — you'll see `stageStyles`, `tweaksPanelStyles`,
`iosFrameStyles`, etc.

---

## Component reference

### `deck-stage.js`

```html
<script src="starters/deck-stage.js"></script>

<deck-stage>
  <section data-screen-label="01 Title">
    <h1>Hello</h1>
  </section>
  <section data-screen-label="02 Content">
    <p>Body</p>
  </section>
</deck-stage>
```

**Features:**
- Auto-scales to viewport (default canvas 1920×1080)
- Keyboard navigation (←/→, space, page up/down)
- Slide counter overlay
- Thumbnail rail (click to jump, drag to reorder, right-click for menu)
- Speaker notes via `#speaker-notes` script tag
- Print-to-PDF (one page per slide)
- Posts `{slideIndexChanged: N}` to parent window

**Programmatic nav:**
```js
document.querySelector('deck-stage').goTo(0); // 0-indexed
```

**Speaker notes (optional):**
```html
<script type="application/json" id="speaker-notes">
["Slide 0 notes", "Slide 1 notes", "", "Slide 3 notes"]
</script>
```

See [`skills.md → make-a-deck`](../skills.md#make-a-deck) for full
usage.

---

### `animations.jsx`

```jsx
<Stage duration={10}>
  <Sprite start={0} end={3}>
    <SceneOne />
  </Sprite>
  <Sprite start={2.5} end={7}>
    <SceneTwo />
  </Sprite>
</Stage>
```

**API:**
- `<Stage duration={seconds}>` — root container with scrubber, play/pause
- `<Sprite start={t1} end={t2}>` — appears within time range
- `useTime()` — current time in seconds (live, re-renders each frame)
- `useSprite()` — normalized progress 0→1 within current Sprite
- `Easing.easeIn / easeOut / easeInOut / cubic / elastic`
- `interpolate(t, [0, 1], [from, to], easing?)`
- Entry helpers: `fadeIn`, `slideUp`, `scaleIn`

**Stage features:**
- Auto-scales to viewport
- Scrubber + play/pause UI
- Persists playback position to localStorage
- Keyboard: space to play/pause, ← → to scrub

See [`skills.md → animated-video`](../skills.md#animated-video).

---

### `design-canvas.jsx`

```jsx
<DesignCanvas>
  <DCSection id="hero" title="Hero treatments">
    <DCArtboard id="a" label="A — Centered" width={1200} height={800}>
      <YourDesignA />
    </DCArtboard>
    <DCArtboard id="b" label="B — Split" width={1200} height={800}>
      <YourDesignB />
    </DCArtboard>
  </DCSection>
  <DCSection id="cta" title="CTA placements">
    {/* ... */}
  </DCSection>
</DesignCanvas>
```

**Features:**
- Pan (drag empty space) + zoom (scroll wheel, pinch)
- Drag-reorder artboards within a section
- Delete artboards
- Inline-rename labels and section titles (click to edit)
- Focus mode — click an artboard to open fullscreen overlay (`←` / `→`
  to navigate, `Esc` to close)

**Important:** artboards are **static design frames**, not scroll
containers. Don't put `height: 100%; overflow: auto` inside an artboard
— size the artboard to fit its content.

See [`skills.md → wireframe`](../skills.md#wireframe) for the most
common use case.

---

### `tweaks-panel.jsx`

```jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#D97757",
  "fontSize": 16,
  "dark": false
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <div style={{ background: tweaks.dark ? '#000' : '#fff' }}>
        Content
      </div>

      <TweaksPanel>
        <TweakSection title="Theme">
          <TweakToggle label="Dark mode"
                       value={tweaks.dark}
                       onChange={v => setTweak('dark', v)} />
          <TweakColor label="Accent"
                      options={['#D97757', '#2A6FDB', '#1F8A5B']}
                      value={tweaks.primaryColor}
                      onChange={c => setTweak('primaryColor', c)} />
          <TweakSlider label="Font size"
                       min={12} max={24} step={1}
                       value={tweaks.fontSize}
                       onChange={n => setTweak('fontSize', n)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
```

**Controls:**
- `<TweakSlider min max step>` — numeric range
- `<TweakToggle>` — boolean
- `<TweakRadio options={[]}>` — 2–3 segmented options
- `<TweakSelect options={[]}>` — dropdown for many options
- `<TweakText>` — short string
- `<TweakNumber>` — discrete number
- `<TweakColor options={[]}>` — curated color swatches
- `<TweakButton onClick>` — action

**Persistence:** edits update the `EDITMODE-BEGIN/END` block in the
source file via the host protocol, so changes survive reload.

**Panel behavior:**
- Floating, bottom-right
- Draggable
- Has close button (posts `__edit_mode_dismissed` to parent)
- Hidden when tweak mode is off
- Responds to `__activate_edit_mode` / `__deactivate_edit_mode` messages

See [`skills.md → make-tweakable`](../skills.md#make-tweakable).

---

### `ios-frame.jsx` / `android-frame.jsx`

```jsx
<IOSFrame>
  <YourAppContent />
</IOSFrame>
```

**Features:**
- Status bar (time, battery, signal)
- Notch / dynamic island (iOS) or status indicators (Android)
- Home indicator (iOS) or nav buttons (Android)
- Optional keyboard overlay
- Realistic device dimensions

**Common props:**
- `theme="light" | "dark"`
- `showKeyboard={true | false}`
- `time="9:41"` (default)
- `width={number}` — override default device width

Use these whenever a design needs to look like it's on a real phone.
Don't hand-draw bezels.

---

### `macos-window.jsx` / `browser-window.jsx`

```jsx
<MacOSWindow title="Finder">
  <YourAppContent />
</MacOSWindow>

<BrowserWindow url="example.com" tabs={['Home', 'Docs', 'About']}>
  <YourPageContent />
</BrowserWindow>
```

**Features:**
- Traffic lights (red/yellow/green) on macOS
- Browser controls (back/forward/refresh) and URL bar on browser
- Optional tabs
- Themed (light/dark)

For desktop UI mockups. Don't hand-draw window chrome.

---

### `image-slot.js`

```html
<script src="starters/image-slot.js"></script>

<image-slot
  id="hero"
  shape="rounded"
  placeholder="Drop a hero photo here"
  style="width: 800px; height: 400px;">
</image-slot>
```

**Features:**
- Drag-and-drop image placeholder
- Persists dropped image to localStorage (keyed by `id`)
- Author-controlled shape: `rect | rounded | circle | pill`
- Or custom mask via CSS `mask` clip-path
- Survives reload

**Common attributes:**
- `id` — required for persistence
- `shape="rounded"` — preset shape
- `radius="16"` — corner radius if shape is `rounded`
- `placeholder="..."` — empty-state text
- `mask="..."` — custom CSS mask path

Use whenever a layout needs the user's own image (photo, logo,
screenshot) that they'll provide later. Place the slot, set its
dimensions with CSS, give it a meaningful `id`.

---

## When NOT to use a starter

Starters are a floor, not a ceiling. If a specific need doesn't fit
what they offer, write code directly — don't force the starter.

Examples:

- **Micro-animations (hover, click feedback):** use CSS transitions or
  React state. `animations.jsx` is for cinematic content.
- **A single design with no variations:** use static HTML. You don't
  need `design-canvas.jsx`.
- **A static wireframe with no tweaks:** don't load `tweaks-panel.jsx`.
- **A custom device shape (foldable, tablet, watch):** write it from
  scratch — frame starters are for the common cases.

---

## Adding new starters

When you find yourself writing the same scaffold in two different
projects, promote it to a starter. Good candidates:

- A header / footer pattern you reuse
- A common animation primitive (typewriter, count-up, reveal)
- A chart wrapper around your favorite library
- A keyboard-shortcut handler
- A specific device or hardware mockup
- A loading-state component
- An empty-state component

Each new starter should be:

- **Self-contained** — one file, no build step, no install
- **Documented at the top** — usage example in a comment block
- **Sized for the common case** — sensible defaults, overridable via
  props/attrs
- **Exported to `window`** if it's a React component meant to be used
  across files

Update this README's inventory table when you add one.

---

## Convention summary

The non-negotiable bits:

1. **Pinned React/Babel versions with integrity hashes.** Never
   unpinned, never via different CDNs.
2. **Named style objects per component.** `const fooStyles = {}`, not
   `const styles = {}`.
3. **`Object.assign(window, {...})` for cross-file sharing.** Each
   Babel script gets its own scope.
4. **No `type="module"`.** Breaks Babel interop.
5. **Load order:** React → ReactDOM → Babel → starters → app.
6. **Vanilla `.js` files load with `<script src>`, JSX `.jsx` files
   with `<script type="text/babel" src>`.** The extension determines
   the loader — never mix.

Follow these and the starters compose cleanly with each other and with
your own code.

---

*Last updated: 2026 · 05 · 18*

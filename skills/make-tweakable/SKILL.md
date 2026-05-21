---
name: make-tweakable
description: "Add in-design tweak controls for variant exploration. Trigger: 'tweakable', 'variants', 'knobs', 'parameters', 'A/B comparison'."
---

# make-tweakable

### Setup

1. Use the `tweaks-panel.jsx` starter:

   ```html
   <script type="text/babel" src="starters/tweaks-panel.jsx"></script>
   ```

2. Mount `<TweaksPanel>` once at the top of the app. It handles the
   full protocol — toggle from outside, close button, drag, persistence.

3. Use the `useTweaks(defaults)` hook to read/write tweak state:

   ```jsx
   const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
   // setTweak('fontSize', 18)
   // setTweak({ fontSize: 18, dark: true })
   ```

### Defaults with marker comments

**Critical:** wrap defaults in marker comments so the host can rewrite
them on disk when the user changes a value:

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#D97757",
  "fontSize": 16,
  "dark": false,
  "layout": "stacked"
}/*EDITMODE-END*/;
```

Rules:

- The block between markers **must be valid JSON** — double-quoted keys,
  double-quoted strings, no trailing commas, no comments.
- **Exactly one** such block in the root HTML file, inside an inline
  `<script>`.
- Don't add anything inside the markers that isn't pure JSON.

### Available controls

From the starter:

| Control | Use for |
|---|---|
| `<TweakSlider>` | Numeric range (font size, spacing, opacity) |
| `<TweakToggle>` | Boolean (dark mode, feature flag, condensed) |
| `<TweakRadio>` | 2-3 options with short labels (layout: stacked/split) |
| `<TweakSelect>` | Many options, or long labels (font family) |
| `<TweakText>` | Short string (heading copy) |
| `<TweakNumber>` | Discrete number input |
| `<TweakColor options={[...]}>` | **Always curated swatches.** Never a free picker. |
| `<TweakButton>` | An action (reset, randomize) |

`TweakRadio` auto-falls-back to `TweakSelect` if labels won't fit. Just
use whichever makes sense for the option count and label length.

### Color tweaks — curated only

Don't expose a free color picker. Always provide 3-5 swatches:

```jsx
<TweakColor
  options={['#D97757', '#2A6FDB', '#1F8A5B', '#A23560']}
  value={tweaks.accent}
  onChange={c => setTweak('accent', c)}
/>
```

For full palette swaps (each option is multiple colors):

```jsx
<TweakColor
  options={[
    ['#D97757', '#29261b', '#f6f4ef'],  // warm
    ['#2A6FDB', '#0d1b2a', '#e0e1dd'],  // cool
    ['#1F8A5B', '#0a1612', '#f0f4f1'],  // forest
  ]}
  value={tweaks.palette}
  onChange={p => setTweak('palette', p)}
/>
```

The stored value is the whole array. Read as `tweaks.palette[0]`, etc.

### Panel UI

- Floating, **bottom-right** of the viewport.
- Maximum **320px wide**, draggable.
- Title is **"Tweaks"** (matches the external toggle).
- **Hidden completely when tweak mode is off** — the design should look
  final.
- Group related controls in `<TweakSection title="Colors">`.

### Adding tweaks proactively

Even when not explicitly asked, add **2-3 tweaks by default**:

- Light/dark theme
- Density (compact / comfortable / spacious)
- Type pairing (2-3 curated options)
- Accent color (3-4 swatches)

This surfaces possibilities without overwhelming.

### Anti-patterns

- Free color picker (always curate)
- Slider with continuous values where steps would do (font sizes
  should be 14/16/18/20, not 14.7)
- Panel that covers the content
- More than 10 controls visible at once — group into sections
- Tweaks that don't actually change anything visible
- Forgetting the marker comments — edits won't persist

---
name: interactive-prototype
description: "Build working interactive prototypes with real interactions. Trigger: 'prototype', 'clickable demo', 'interactive demo', 'working flow', 'mockup with interactions'."
---

# interactive-prototype

### Structure

1. **No title screen.** Center the prototype in the viewport, or
   responsive with reasonable margins. The user opens the file -> sees
   the prototype.

2. **Device frames for mobile:** use `ios-frame.jsx` or
   `android-frame.jsx` from `starters/`. Don't hand-draw bezels.

3. **Window chrome for desktop:** use `macos-window.jsx` or
   `browser-window.jsx`.

4. **For variations within a single prototype:** add a tweaks panel.
   See [`make-tweakable`](#make-tweakable). Don't fork into multiple
   HTML files — comparison is the point of exploration.

### State persistence

Any state that should survive refresh goes in `localStorage`. Read on
init, write on change.

```jsx
function useFlowState(key, initial) {
  const [value, setValue] = React.useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

const [step, setStep] = useFlowState('onboarding.step', 0);
```

Required for:
- Current step in multi-step flows
- Form values
- Theme selection
- Media playback position
- Toggle states

Iterative design = many refreshes. Refresh should never lose context.

### React with inline Babel

If using React:

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

Critical conventions:

- **Pinned versions with integrity hashes.** Never use unpinned (`react@18`).
- **Named style objects per component.** `const cardStyles = {}`, never
  `const styles = {}`. Collisions across files break things silently.
- **Cross-file sharing via window.** Each `<script type="text/babel">`
  has its own scope. Export shared components:
  ```js
  // At the end of components.jsx
  Object.assign(window, { Card, Button, Modal });
  ```
- **No `type="module"`.** Breaks Babel interop.

### Interactions

- **Hover, focus, active states** all visible. Don't ship buttons that
  look the same in every state.
- **Touch targets:** 44x44px minimum on mobile.
- **Transitions:** 150-300ms with easing (`cubic-bezier(0.4, 0, 0.2, 1)`
  is a safe default). Never linear for UI motion.
- **Feedback:** every interaction has visible response. Loading state,
  success state, empty state, error state — all designed, not afterthoughts.
- **Modals/dropdowns** close on outside click and Escape.
- **Keyboard navigation** works for primary flows.

### Realistic content

- Don't use Lorem ipsum. Write plausible copy even if rough.
- Don't use stock avatars with weird stock-photo smiles. Use initials
  or abstract shapes.
- Don't fake numbers in dashboards. Either use realistic ranges or
  label them as samples.

### Anti-patterns

- Mockup screens with no interactive state
- "Click anywhere to continue" — implement the real clicks
- Modals that don't close
- Buttons that don't do anything
- Lorem ipsum and stock photos
- Decorative shadows on every card
- Pure black text on pure white background

### Example skeleton

```html
<!doctype html>
<html>
<head>
  <title>Prototype</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
           background: #f0f0f0; font-family: -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"
    integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L"
    crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
    integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm"
    crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
    integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y"
    crossorigin="anonymous"></script>

  <script type="text/babel" src="starters/ios-frame.jsx"></script>
  <script type="text/babel" src="app.jsx"></script>
</body>
</html>
```

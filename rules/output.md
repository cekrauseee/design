# Output conventions

How the harness writes HTML, where files go, how to stamp them, and
the JSX/React patterns to use. `CLAUDE.md` references this file from
the Build phase — load it when writing the actual deliverable.

---

## File naming

- Descriptive names with spaces are fine: `Landing Page.html`,
  `Onboarding Flow.html`
- For major revisions, copy and version: `Design.html` →
  `Design v2.html` — preserve the old version
- Support files (CSS, JS) live alongside or in subfolders

---

## Stamp the output

The first non-empty line of the page's main `<style>` block (or main
CSS file) MUST be a comment of the form:

```css
/* design · shape: <macrostructure> · tone: <tone> · accent: <hue>
 * critique: P? H? E? S? R? V?
 */
```

This is the durable record of what you picked. The next deliverable
in this project reads it and chooses a *different* shape. The
critique line gets filled in during Verify (see
`rules/workflow.md` § 6).

---

## Canonical HTML

Write HTML that the editor can direct-edit:

- Close every non-void element explicitly: `<p>...</p>`, not `<p>`
  with implied close
- Double-quote every attribute value
- Don't self-close non-void elements: `<div></div>`, never `<div/>`
- Use `<br />` for void elements (canonical XHTML form is fine)

---

## File organization

- Keep files under ~1000 lines
- Split JSX into separate component files, imported via
  `<script type="text/babel">`
- Put tokens in CSS custom properties on `:root`
- Copy assets you use into the project — don't reference external paths

---

## Cross-file scope (JSX/React)

Each `<script type="text/babel">` gets its own scope when transpiled.
To share components between files, export them to `window` at the end:

```js
// At the end of components.jsx:
Object.assign(window, {
  Terminal, Line, Spacer,
  Gray, Blue, Green, Bold,
});
```

This makes them globally available to other scripts.

---

## Style object names

**Always** name style objects uniquely per component:

```js
// ✅ Good
const cardStyles = { ... };
const buttonStyles = { ... };

// ❌ Bad — collisions across files break silently
const styles = { ... };
```

---

## React versions (when using inline Babel)

Pin versions with integrity hashes:

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

Don't use `type="module"` on script imports — it breaks Babel interop.

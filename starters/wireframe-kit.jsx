/* eslint-disable */
/* Wireframe Kit — Starter React components
   Sketchy chrome + clean component interiors.
   Requires: wireframe-kit.css loaded first.

   Exports to window:
   WFWindow, WFBtn, WFInput, Kbd, KbdGroup, Toggle, Bar, Chip,
   NoteCard, HandArrow, VariantCap, ScreenBlock, Placeholder
*/
const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Window chrome + nav
function WFWindow({ title, tabs, active, children, dark, width, height, style }) {
  return (
    <div
      className={"wf-window " + (dark ? "dark" : "")}
      style={{ width: width || "100%", ...style }}
    >
      <div className="wf-titlebar">
        <span className="tl-dots"><span /><span /><span /></span>
        <span className="tl-title">{title || "App"}</span>
        <span style={{ width: 30 }} />
      </div>
      {tabs && (
        <div className="wf-nav">
          {tabs.map((t, i) => (
            <div key={i} className="tab" data-active={i === active ? "true" : "false"}>{t}</div>
          ))}
        </div>
      )}
      <div className="wf-body" style={{ minHeight: height }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Buttons / inputs / kbd / toggle
const WFBtn = ({ children, primary, ghost, sm, icon, style }) => (
  <span
    className={"wf-btn" + (primary ? " primary" : "") + (ghost ? " ghost" : "") + (sm ? " sm" : "") + (icon ? " icon" : "")}
    style={style}
  >
    {children}
  </span>
);

const WFInput = ({ placeholder, value, w = 180, icon, solid }) => (
  <span className={"wf-input" + (solid ? " solid" : "")} style={{ width: w }}>
    {icon && <span style={{ marginRight: 6, opacity: 0.55 }}>{icon}</span>}
    {value || placeholder}
  </span>
);

const Kbd = ({ children }) => <span className="wf-kbd">{children}</span>;
const KbdGroup = ({ keys }) => (
  <span style={{ display: "inline-flex", gap: 4 }}>
    {keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}
  </span>
);

const Toggle = ({ on }) => <span className={"wf-toggle" + (on ? " on" : "")} />;

const Bar = ({ w = 60, kind, style }) => (
  <span className={"bar " + (kind || "")} style={{ width: w, ...style }} />
);

const Chip = ({ children, variant }) => (
  <span className={"chip" + (variant ? " " + variant : "")}>{children}</span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder (image / waveform / chart area)
const Placeholder = ({ label, w, h = 120, style }) => (
  <div className="placeholder" style={{ width: w || "100%", height: h, ...style }}>
    {label || "[placeholder]"}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Annotations / hand-drawn arrow
function NoteCard({ n, children }) {
  return (
    <div className="note-card">
      <span className="num">{n}</span>
      <div className="body">{children}</div>
    </div>
  );
}

function HandArrow({ d, style }) {
  return (
    <svg className="arrow-svg" style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style }}>
      <path d={d} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant header (used inside a grid of options)
function VariantCap({ n, name, tag }) {
  return (
    <div className="variant-cap">
      <span className="v-num">{n}</span>
      <span className="v-name">{name}</span>
      {tag && <span className="v-tag">{tag}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen block + title helper
function ScreenBlock({ marker, name, label, desc, children }) {
  return (
    <section className="screen-block">
      <div className="screen-title">
        <span className="marker">{marker}</span>
        <span className="name">{name}</span>
        {label && <span className="label">{label}</span>}
      </div>
      {desc && <p className="screen-desc">{desc}</p>}
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export to global scope
Object.assign(window, {
  WFWindow, WFBtn, WFInput, Kbd, KbdGroup, Toggle, Bar, Chip,
  Placeholder, NoteCard, HandArrow, VariantCap, ScreenBlock,
});

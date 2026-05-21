import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// DESIGN_ROOT is the user's design studio (contains projects/). Defaults to CWD
// so `node server/index.mjs` works both from a checkout and from the installed
// plugin (where CWD = the user's working dir, not the plugin cache).
const ROOT = path.resolve(process.env.DESIGN_ROOT || process.cwd());
const PROJECTS = path.join(ROOT, "projects");
const LOG_FILE = path.join(ROOT, ".design-server.log");
const PORT = parseInt(process.env.PORT || "3333", 10);

const hmrClient = fs.readFileSync(path.join(__dirname, "hmr-client.js"), "utf-8");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
};

function mime(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function walkWorkspace(dir, prefix) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch (_) { return []; }
  const result = [];
  for (const name of entries.sort()) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = path.join(dir, name);
    const rel = prefix + "/" + name;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      result.push({ name, path: rel, type: "dir", children: walkWorkspace(full, rel) });
    } else {
      result.push({ name, path: rel, type: "file" });
    }
  }
  return result;
}

// Tree exposes only project/workspace/ contents. The workspace folder itself
// is flattened away in the UI: a project node's children are the workspace
// entries, while their `path` still carries the `workspace/` segment so URLs
// resolve to real files on disk.
function buildTree() {
  let projects;
  try { projects = fs.readdirSync(PROJECTS); } catch (_) { return []; }
  const result = [];
  for (const name of projects.sort()) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const projPath = path.join(PROJECTS, name);
    let projStat;
    try { projStat = fs.statSync(projPath); } catch (_) { continue; }
    if (!projStat.isDirectory()) continue;
    const workspacePath = path.join(projPath, "workspace");
    if (!fs.existsSync(workspacePath)) continue;
    const children = walkWorkspace(workspacePath, name + "/workspace");
    result.push({ name, path: name, type: "dir", children });
  }
  return result;
}

function landing(res) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(LANDING_HTML);
}

const LANDING_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>design</title>
<style>
* { box-sizing: border-box; margin: 0; }
:root {
  --bg: #f6f3ec; --surface: #faf7f0; --surface-2: #ede7db;
  --ink: #1a1814; --ink-2: #3c3830; --ink-3: #7a7268; --ink-4: #a39a8e;
  --line: rgba(26,24,21,0.08); --line-m: rgba(26,24,21,0.14);
  --accent: #b2562b; --accent-soft: rgba(178,86,43,0.10);
  /* iframe-bg matches the shell so the stage does not draw a white frame
     around designs that do not paint to their viewport edges. */
  --iframe-bg: var(--bg);
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, monospace;
  --sidebar-w: 280px;
}
[data-theme="dark"] {
  --bg: #14110d; --surface: #1c1814; --surface-2: #2a241e;
  --ink: #f3eee6; --ink-2: #d5cdbe; --ink-3: #8a8278; --ink-4: #5c554b;
  --line: rgba(243,238,230,0.06); --line-m: rgba(243,238,230,0.10);
  --accent: #d97a4a; --accent-soft: rgba(217,122,74,0.14);
  /* iframe-bg inherits :root's var(--bg) so it tracks the shell. */
}
html, body { height: 100%; }
body { font-family: var(--sans); background: var(--bg); color: var(--ink); display: flex;
  transition: background 0.2s, color 0.2s; }

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-w); min-width: var(--sidebar-w); height: 100vh;
  background: var(--surface); border-right: 1px solid var(--line);
  display: flex; flex-direction: column; overflow: hidden;
}
.sidebar-head {
  padding: 20px 16px 16px; border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.sidebar-head h1 { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
.sidebar-head p { font-size: 11px; color: var(--ink-4); margin-top: 4px; font-family: var(--mono); }
.tree-wrap {
  flex: 1; overflow-y: auto; padding: 8px 0;
  scrollbar-width: thin; scrollbar-color: var(--line-m) transparent;
}

/* ── Tree ── */
.tree { list-style: none; padding: 0; }
.tree .tree { padding-left: 16px; }
.tree-item {
  display: flex; align-items: center; gap: 6px;
  padding: 3px 16px; cursor: pointer; font-size: 13px;
  color: var(--ink-2); border-radius: 0;
  transition: background 0.1s;
  user-select: none; white-space: nowrap;
  text-overflow: ellipsis; overflow: hidden;
}
.tree-item:hover { background: var(--surface-2); }
.tree-item[data-active="true"] {
  background: var(--accent-soft); color: var(--accent); font-weight: 500;
}
.tree-item .icon {
  width: 14px; height: 14px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; color: var(--ink-4);
}
.tree-item .icon svg { width: 12px; height: 12px; }
.tree-item[data-type="dir"] .icon { color: var(--ink-3); }
.tree-dir-children { overflow: hidden; }
.tree-dir-children[data-collapsed="true"] { display: none; }

/* ── Preview ── */
.preview {
  flex: 1; height: 100vh; display: flex; flex-direction: column;
  background: var(--bg);
}
.preview-bar {
  height: 40px; min-height: 40px;
  display: flex; align-items: center; gap: 8px;
  padding: 0 16px;
  background: var(--surface); border-bottom: 1px solid var(--line);
  font-size: 12px; font-family: var(--mono); color: var(--ink-3);
}
.preview-bar .path { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-bar button {
  background: none; border: 1px solid var(--line-m); border-radius: 4px;
  padding: 4px 10px; font-size: 11px; font-family: var(--sans);
  color: var(--ink-3); cursor: pointer; transition: all 0.15s;
}
.preview-bar button:hover { background: var(--surface-2); color: var(--ink); }
.preview-bar button[data-pending="true"] {
  color: var(--accent); border-color: var(--accent);
  background: var(--accent-soft);
}
.preview-bar button[data-pending="true"]:hover { background: var(--accent-soft); color: var(--accent); }
.preview-bar button[data-pending="true"]::before {
  content: ""; display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--accent); margin-right: 6px;
  vertical-align: middle;
  animation: pending-pulse 1.6s ease-in-out infinite;
}
.preview-bar[data-has-file="false"] .zoom-controls,
.preview-bar[data-has-file="false"] #btn-open,
.preview-bar[data-has-file="false"] #btn-reload { display: none; }
@keyframes pending-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.tree-item[data-new="true"] { color: var(--accent); }
.tree-item[data-new="true"]::after {
  content: ""; display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--accent); margin-left: 6px;
  flex-shrink: 0; align-self: center;
  animation: pending-pulse 1.6s ease-in-out infinite;
}
.preview-stage {
  flex: 1; position: relative; overflow: hidden; background: var(--iframe-bg);
  display: flex;
}
.preview iframe {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  border: none; background: var(--iframe-bg);
  transform-origin: 0 0;
}
/* Double-buffer: two stacked iframes. The hidden one (data-buffer="back")
   loads the next URL; on its 'load' event the two swap so the user never
   sees a white flash. */
.preview iframe[data-buffer="back"] {
  visibility: hidden; pointer-events: none;
}
.zoom-controls {
  display: inline-flex; align-items: center; gap: 0;
  border: 1px solid var(--line-m); border-radius: 4px; overflow: hidden;
}
.zoom-controls button {
  border: none; border-radius: 0; padding: 4px 8px;
  min-width: 24px; line-height: 1;
}
.zoom-controls .zoom-level {
  padding: 0 8px; font-family: var(--mono); font-size: 11px;
  color: var(--ink-3); cursor: pointer; user-select: none;
  border-left: 1px solid var(--line-m); border-right: 1px solid var(--line-m);
  min-width: 44px; text-align: center; line-height: 26px;
}
.zoom-controls .zoom-level:hover { background: var(--surface-2); color: var(--ink); }
.preview-empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--ink-4); font-size: 14px;
}
/* ── Theme toggle ── */
.theme-toggle {
  width: 28px; height: 28px; padding: 0; border: 1px solid var(--line-m);
  border-radius: 6px; background: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--ink-3); transition: all 0.15s;
}
.theme-toggle:hover { background: var(--surface-2); color: var(--ink); }
.theme-toggle svg { width: 14px; height: 14px; }
</style>
</head>
<body>

<div class="sidebar">
  <div class="sidebar-head" style="display:flex;align-items:flex-start;justify-content:space-between">
    <div><h1>design</h1><p>workspace</p></div>
    <button class="theme-toggle" id="theme-toggle" title="Toggle theme"></button>
  </div>
  <div class="tree-wrap">
    <ul class="tree" id="tree"></ul>
  </div>
</div>

<div class="preview">
  <div class="preview-bar" id="preview-bar" data-has-file="false">
    <span class="path" id="current-path">Select a file</span>
    <div class="zoom-controls" title="Zoom (⌘− / ⌘+ / ⌘0)">
      <button id="btn-zoom-out" aria-label="Zoom out">−</button>
      <span class="zoom-level" id="zoom-level" title="Click to reset">100%</span>
      <button id="btn-zoom-in" aria-label="Zoom in">+</button>
    </div>
    <button id="btn-open" title="Open in new tab">Open &nearr;</button>
    <button id="btn-reload" title="Reload preview">Reload</button>
  </div>
  <div class="preview-stage">
    <div class="preview-empty" id="empty-state">
      <span>Select a file to preview</span>
    </div>
    <iframe id="preview-a" data-buffer="front" style="display:none"></iframe>
    <iframe id="preview-b" data-buffer="back"  style="display:none"></iframe>
  </div>
</div>

<script>
const treeEl = document.getElementById("tree");
// Double-buffered iframes: 'front' is shown, 'back' loads next URL hidden,
// then they swap on the back's 'load' event so the user never sees a flash.
let frontEl = document.getElementById("preview-a");
let backEl  = document.getElementById("preview-b");
const emptyEl = document.getElementById("empty-state");
const pathEl = document.getElementById("current-path");
const previewBarEl = document.getElementById("preview-bar");
const btnOpen = document.getElementById("btn-open");
const btnReload = document.getElementById("btn-reload");
const btnZoomIn = document.getElementById("btn-zoom-in");
const btnZoomOut = document.getElementById("btn-zoom-out");
const zoomLevelEl = document.getElementById("zoom-level");

let activeItem = null;
let currentUrl = null;
let currentPath = null;
var newFiles = new Set();

// ── Persistence ──
function loadExpandedSet() {
  try {
    var v = JSON.parse(localStorage.getItem("dp-expanded-dirs") || "[]");
    return new Set(Array.isArray(v) ? v : []);
  } catch (_) { return new Set(); }
}
function saveExpandedSet() { localStorage.setItem("dp-expanded-dirs", JSON.stringify(Array.from(expandedDirs))); }
function saveActivePath(p) {
  if (p) localStorage.setItem("dp-active-path", p);
  else localStorage.removeItem("dp-active-path");
}
function getSavedActivePath() { return localStorage.getItem("dp-active-path"); }
var expandedDirs = loadExpandedSet();

var ZOOM_MIN = 10, ZOOM_MAX = 200, ZOOM_STEP = 10;
var zoom = parseInt(localStorage.getItem("dp-zoom") || "100", 10);
if (isNaN(zoom) || zoom < ZOOM_MIN || zoom > ZOOM_MAX) zoom = 100;

function applyZoom() {
  var s = zoom / 100;
  var inv = (100 / s) + "%";
  // Apply to both buffers so the zoom level persists across swaps.
  [frontEl, backEl].forEach(function (el) {
    el.style.transform = "scale(" + s + ")";
    el.style.width = inv;
    el.style.height = inv;
  });
  zoomLevelEl.textContent = zoom + "%";
  localStorage.setItem("dp-zoom", String(zoom));
}

function setZoom(z) {
  zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z / ZOOM_STEP) * ZOOM_STEP));
  applyZoom();
}

applyZoom();

const ICON_FILE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 2h5l4 4v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M9 2v4h4"/></svg>';
const ICON_DIR_OPEN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H8L6.5 3.5 6 3H3a1 1 0 0 0-1 1z"/></svg>';
const ICON_DIR_CLOSED = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 4a1 1 0 0 1 1-1h3l1.5 1.5.5.5H13a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" opacity="0.25"/><path d="M2 4a1 1 0 0 1 1-1h3l1.5 1.5.5.5H13a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

var TEXT_EXT = /\\.(jsx?|tsx?|mjs|css|md|json|txt|csv|ya?ml|toml|sh|py|rb|rs|go|html?|svg|xml)$/i;
var IMG_EXT = /\\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?)$/i;

function fileUrl(nodePath) {
  var name = nodePath.split("/").pop();
  if (/\\.(html?|svg)$/i.test(name)) return "/projects/" + nodePath;
  if (IMG_EXT.test(name)) return "/__img__/" + nodePath;
  if (TEXT_EXT.test(name)) return "/__raw__/projects/" + nodePath;
  return null;
}

function renderTree(nodes, parent) {
  for (const node of nodes) {
    const li = document.createElement("li");

    if (node.type === "dir") {
      const item = document.createElement("div");
      item.className = "tree-item";
      item.dataset.type = "dir";
      item.dataset.path = node.path;
      var isExpanded = expandedDirs.has(node.path);
      item.innerHTML = '<span class="icon">' + (isExpanded ? ICON_DIR_OPEN : ICON_DIR_CLOSED) + '</span>' + node.name;

      const children = document.createElement("ul");
      children.className = "tree tree-dir-children";
      children.dataset.collapsed = isExpanded ? "false" : "true";

      item.addEventListener("click", function () {
        const collapsed = children.dataset.collapsed === "true";
        children.dataset.collapsed = collapsed ? "false" : "true";
        item.querySelector(".icon").innerHTML = collapsed ? ICON_DIR_OPEN : ICON_DIR_CLOSED;
        if (collapsed) expandedDirs.add(node.path);
        else expandedDirs.delete(node.path);
        saveExpandedSet();
      });

      li.appendChild(item);
      li.appendChild(children);
      renderTree(node.children, children);
    } else {
      const item = document.createElement("div");
      item.className = "tree-item";
      item.dataset.type = "file";
      item.dataset.path = node.path;
      if (newFiles.has(node.path)) item.dataset.new = "true";
      item.innerHTML = '<span class="icon">' + ICON_FILE + '</span>' + node.name;

      var url = fileUrl(node.path);
      if (url) {
        item.style.cursor = "pointer";
        item.addEventListener("click", (function (u) {
          return function () { loadPreview(u, item); };
        })(url));
      } else {
        item.style.color = "var(--ink-4)";
        item.style.cursor = "default";
      }

      li.appendChild(item);
    }

    parent.appendChild(li);
  }
}

function clearPending() {
  btnReload.dataset.pending = "false";
  btnReload.title = "Reload preview";
}

function markPending() {
  if (!currentUrl) return;
  btnReload.dataset.pending = "true";
  btnReload.title = "Changes detected — click to reload";
}

// Load 'url' into the hidden back buffer; when it fires 'load', swap the
// roles of the two iframes so the user transitions atomically (no white
// flash). Works for both a brand-new file pick and a same-URL reload.
function swapBuffers() {
  frontEl.dataset.buffer = "back";
  backEl.dataset.buffer  = "front";
  const tmp = frontEl;
  frontEl = backEl;
  backEl  = tmp;
}

function loadInBackBuffer(url, onReady) {
  backEl.style.display = "block";
  const handler = function () {
    backEl.removeEventListener("load", handler);
    swapBuffers();
    if (typeof onReady === "function") onReady();
  };
  backEl.addEventListener("load", handler);
  backEl.src = url;
}

function loadPreview(url, item) {
  if (activeItem) activeItem.dataset.active = "false";
  if (item) {
    item.dataset.active = "true";
    activeItem = item;
    currentPath = item.dataset.path || null;
    saveActivePath(currentPath);
  }
  if (item && item.dataset.path && newFiles.has(item.dataset.path)) {
    newFiles.delete(item.dataset.path);
    item.dataset.new = "false";
  }
  currentUrl = url;
  pathEl.textContent = url;
  emptyEl.style.display = "none";
  previewBarEl.dataset.hasFile = "true";
  loadInBackBuffer(url);
  clearPending();
}

btnOpen.addEventListener("click", function () {
  if (currentUrl) window.open(currentUrl, "_blank");
});
btnReload.addEventListener("click", function () {
  if (currentUrl) loadInBackBuffer(currentUrl);
  clearPending();
});

btnZoomIn.addEventListener("click", function () { setZoom(zoom + ZOOM_STEP); });
btnZoomOut.addEventListener("click", function () { setZoom(zoom - ZOOM_STEP); });
zoomLevelEl.addEventListener("click", function () { setZoom(100); });

window.addEventListener("keydown", function (e) {
  if (!(e.metaKey || e.ctrlKey)) return;
  // Support both "=" (unshifted "+") and the numpad "+".
  if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(zoom + ZOOM_STEP); }
  else if (e.key === "-" || e.key === "_") { e.preventDefault(); setZoom(zoom - ZOOM_STEP); }
  else if (e.key === "0") { e.preventDefault(); setZoom(100); }
});

// Expand all ancestor dirs of a tree element (and persist them).
function expandAncestors(el) {
  var node = el.parentElement;
  while (node && node !== treeEl) {
    if (node.classList && node.classList.contains("tree-dir-children")) {
      node.dataset.collapsed = "false";
      var dir = node.previousElementSibling;
      if (dir && dir.dataset && dir.dataset.path) {
        expandedDirs.add(dir.dataset.path);
        var icon = dir.querySelector(".icon");
        if (icon) icon.innerHTML = ICON_DIR_OPEN;
      }
    }
    node = node.parentElement;
  }
  saveExpandedSet();
}

// Fetch tree + restore prior session (active file + expanded dirs).
fetch("/__tree__")
  .then(function (r) { return r.json(); })
  .then(function (tree) {
    renderTree(tree, treeEl);
    var saved = getSavedActivePath();
    if (saved) {
      var found = treeEl.querySelector('[data-path="' + saved + '"][data-type="file"]');
      if (found) {
        expandAncestors(found);
        found.click(); // triggers loadPreview
      } else {
        saveActivePath(null); // stale; drop it
      }
    }
  });

// Live reload for tree (rebuild on FS events; preserve expanded + active state).
var ws = new WebSocket("ws://" + location.host);
ws.onmessage = function (e) {
  var msg;
  try { msg = JSON.parse(e.data); } catch (_) { return; }
  if (msg.type !== "reload") return;

  var rel = null;
  if (typeof msg.file === "string" && msg.file.indexOf("projects/") === 0) {
    rel = msg.file.slice("projects/".length);
    if (msg.event === "add") newFiles.add(rel);
  }

  // Per-file pending: only mark when the changed file is the one on screen.
  if (rel && currentPath && rel === currentPath &&
      (msg.event === "change" || msg.event === "add")) {
    markPending();
  }

  fetch("/__tree__").then(function (r) { return r.json(); }).then(function (tree) {
    treeEl.innerHTML = "";
    renderTree(tree, treeEl);
    if (currentPath) {
      var found = treeEl.querySelector('[data-path="' + currentPath + '"]');
      if (found) {
        found.dataset.active = "true";
        activeItem = found;
        expandAncestors(found);
      }
    }
  });
};

// ── Theme ──
(function () {
  var SUN = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>';
  var MOON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5 5.5 5.5 0 1 0 13.5 9.2z"/></svg>';
  var AUTO = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/><path d="M8 2.5v11" /><path d="M8 2.5A5.5 5.5 0 0 1 8 13.5" fill="currentColor" opacity="0.25"/></svg>';

  var btn = document.getElementById("theme-toggle");
  var modes = ["system", "light", "dark"];
  var icons = { light: SUN, dark: MOON, system: AUTO };

  function systemDark() { return window.matchMedia("(prefers-color-scheme: dark)").matches; }

  function apply(mode) {
    var dark = mode === "dark" || (mode === "system" && systemDark());
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    btn.innerHTML = icons[mode];
    btn.title = mode === "system" ? "Theme: system" : "Theme: " + mode;
  }

  var saved = localStorage.getItem("dp-theme") || "system";
  if (modes.indexOf(saved) === -1) saved = "system";
  apply(saved);

  btn.addEventListener("click", function () {
    var i = (modes.indexOf(saved) + 1) % modes.length;
    saved = modes[i];
    localStorage.setItem("dp-theme", saved);
    apply(saved);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (saved === "system") apply("system");
  });
})();
</script>
</body>
</html>`;


function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ct = mime(filePath);
    if (ct.startsWith("text/html")) {
      let html = data.toString("utf-8");
      const tag = `<script>\n${hmrClient}\n</script>`;
      // Inject at the START of <head> so the console wrapper runs before
      // any other script (notably @babel/standalone, which logs an
      // in-browser warning during its own init).
      if (/<head\b[^>]*>/i.test(html)) {
        html = html.replace(/<head\b[^>]*>/i, m => m + "\n" + tag);
      } else if (html.includes("</body>")) {
        html = html.replace("</body>", tag + "\n</body>");
      } else {
        html += "\n" + tag;
      }
      res.writeHead(200, { "Content-Type": ct });
      res.end(html);
    } else {
      res.writeHead(200, { "Content-Type": ct });
      res.end(data);
    }
  });
}

function dirListing(dirPath, urlPath, res) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath).filter((e) => !e.startsWith("."));
  } catch (_) {
    res.writeHead(404); res.end("Not found"); return;
  }

  const items = entries
    .map((e) => {
      const stat = fs.statSync(path.join(dirPath, e));
      const slash = stat.isDirectory() ? "/" : "";
      return `<li><a href="${urlPath}${e}${slash}">${e}${slash}</a></li>`;
    })
    .join("\n");

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html><html><head><title>${urlPath}</title>
<style>body{font-family:monospace;padding:32px}a{color:#b2562b}</style>
</head><body><h2>${urlPath}</h2><ul>${items}</ul></body></html>`);
}

// --- Server ---

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  // Console log proxy
  if (pathname === "/__log__" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      fs.appendFileSync(LOG_FILE, body + "\n");
      res.writeHead(204);
      res.end();
    });
    return;
  }

  // File tree API
  if (pathname === "/__tree__") {
    const tree = buildTree();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(tree));
    return;
  }

  // Raw text viewer
  if (pathname.startsWith("/__raw__/")) {
    const rel = pathname.slice("/__raw__/".length);
    const filePath = path.join(ROOT, rel);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end("Forbidden"); return; }
    fs.readFile(filePath, "utf-8", (err, content) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      const esc = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const name = path.basename(filePath);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${name}</title>
<style>
*{box-sizing:border-box;margin:0}
body{background:#1c1814;color:#d5cdbe;font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:13px;line-height:1.6}
.bar{position:sticky;top:0;padding:8px 20px;background:#14110d;border-bottom:1px solid rgba(243,238,230,0.06);font-size:12px;color:#8a8278;display:flex;justify-content:space-between}
pre{padding:16px 20px;white-space:pre-wrap;word-wrap:break-word;tab-size:2;counter-reset:line}
.ln{display:inline-block;width:40px;text-align:right;margin-right:16px;color:#5c554b;user-select:none}
</style></head><body>
<div class="bar"><span>${name}</span><span>${content.split("\\n").length} lines</span></div>
<pre>${esc.split("\\n").map(function(l,i){return '<span class="ln">'+(i+1)+'</span>'+l;}).join("\\n")}</pre>
</body></html>`);
    });
    return;
  }

  // Image viewer
  if (pathname.startsWith("/__img__/")) {
    const rel = pathname.slice("/__img__/".length);
    const name = path.basename(rel);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${name}</title>
<style>
*{margin:0}body{background:#1c1814;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:12px}
img{max-width:95vw;max-height:90vh;object-fit:contain;border-radius:4px;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
p{font-family:ui-monospace,monospace;font-size:12px;color:#8a8278}
</style></head><body>
<img src="/projects/${rel}" alt="${name}" />
<p>${name}</p>
</body></html>`);
    return;
  }

  // HMR client direct request
  if (pathname === "/__hmr__") {
    res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
    res.end(hmrClient);
    return;
  }

  // Landing page
  if (pathname === "/") {
    landing(res);
    return;
  }

  // Resolve file
  const safePath = pathname.replace(/\.\./g, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      // Sidecar state files (e.g. .design-canvas.state.json) are expected to
      // be absent before the user makes their first change. Return an empty
      // JSON doc so the browser doesn't log a 404 in the network panel.
      if (/\.state\.json$/i.test(pathname)) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end("{}");
        return;
      }
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    if (stat.isDirectory()) {
      const index = path.join(filePath, "index.html");
      if (fs.existsSync(index)) {
        serveFile(index, res);
      } else {
        dirListing(filePath, pathname.endsWith("/") ? pathname : pathname + "/", res);
      }
    } else {
      serveFile(filePath, res);
    }
  });
});

// --- WebSocket ---

const wss = new WebSocketServer({ server });

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// --- File watcher ---

const watcher = chokidar.watch(PROJECTS, {
  ignoreInitial: true,
  ignored: [/(^|[/\\])\../, /node_modules/, /\.DS_Store/],
  awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
});

watcher.on("all", (event, filePath) => {
  const rel = path.relative(ROOT, filePath);
  console.log(`[hmr] ${event}: ${rel}`);
  broadcast({ type: "reload", event, file: rel });
});

// --- Start ---

fs.writeFileSync(LOG_FILE, "");

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} in use. Run: lsof -ti:${PORT} | xargs kill -9\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\n  design`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  Serving ${PROJECTS} with hot reload`);
  console.log(`  Browser console log: ${LOG_FILE}\n`);
});

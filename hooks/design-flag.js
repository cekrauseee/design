#!/usr/bin/env node
// design — per-session activation state, persisted under ~/.claude/.design-active

const fs = require('fs');
const path = require('path');
const os = require('os');

const FLAG = path.join(
  process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'),
  '.design-active'
);
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const defaultStudio = process.env.DESIGN_STUDIO
  || path.join(process.cwd(), 'design');

function read() {
  try {
    if (!fs.existsSync(FLAG)) return {};
    const st = fs.lstatSync(FLAG);
    if (st.isSymbolicLink() || st.size > 65536) return {};
    const data = JSON.parse(fs.readFileSync(FLAG, 'utf-8'));
    return (data && typeof data.sessions === 'object') ? data.sessions : {};
  } catch (_) {
    return {};
  }
}

function write(sessions) {
  if (!sessions || Object.keys(sessions).length === 0) {
    try { fs.unlinkSync(FLAG); } catch (_) {}
    return;
  }
  fs.mkdirSync(path.dirname(FLAG), { recursive: true });
  fs.writeFileSync(FLAG, JSON.stringify({ sessions }));
}

function pruneStaleSessions() {
  const sessions = read();
  const cutoff = Date.now() - TTL_MS;
  let changed = false;
  for (const sid of Object.keys(sessions)) {
    const ts = Date.parse(sessions[sid]?.activatedAt || '');
    if (!ts || ts < cutoff) { delete sessions[sid]; changed = true; }
  }
  if (changed) write(sessions);
}

function writeSession(sid, info) {
  if (typeof sid !== 'string' || !sid) return;
  const sessions = read();
  sessions[sid] = { ...info };
  write(sessions);
}

function removeSession(sid) {
  if (typeof sid !== 'string' || !sid) return;
  const sessions = read();
  if (!(sid in sessions)) return;
  delete sessions[sid];
  write(sessions);
}

function getSession(sid) {
  return (typeof sid === 'string' && sid) ? (read()[sid] || null) : null;
}

module.exports = { defaultStudio, pruneStaleSessions, writeSession, removeSession, getSession };

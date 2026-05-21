#!/usr/bin/env node
// design — UserPromptSubmit hook
//   /design <name>       → activate, scaffold projects/<name>/{workspace,folders,docs}, start server
//   /design off|stop|... → deactivate
//   anything else        → echo "DESIGN MODE ACTIVE" while session is on

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { defaultStudio, writeSession, removeSession, getSession } = require('./design-flag');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const SERVER_DIR = path.join(PLUGIN_ROOT, 'server');
const SERVER_ENTRY = path.join(SERVER_DIR, 'index.mjs');
const PORT = parseInt(process.env.DESIGN_PORT || '3333', 10);
const PID_FILE = path.join(
  process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'),
  `.design-server-${PORT}.pid`
);

function isServerUp() {
  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
    if (!pid) return false;
    process.kill(pid, 0);
    return true;
  } catch (_) { return false; }
}

function scaffold(studio, project) {
  for (const sub of ['workspace', 'folders', 'docs']) {
    fs.mkdirSync(path.join(studio, 'projects', project, sub), { recursive: true });
  }
}

// Hook timeout ~5s, so anything heavy (npm install, server boot) runs detached.
function startServer(studio) {
  if (isServerUp()) return 'already-running';
  if (!fs.existsSync(SERVER_ENTRY)) return 'no-entry';

  fs.mkdirSync(studio, { recursive: true });
  const out = fs.openSync(path.join(studio, '.design-server.out'), 'a');

  if (!fs.existsSync(path.join(SERVER_DIR, 'node_modules'))) {
    spawn('npm', ['install', '--silent'], {
      cwd: SERVER_DIR, detached: true, stdio: ['ignore', out, out],
    }).unref();
    return 'installing-deps';
  }

  const child = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: studio,
    env: { ...process.env, DESIGN_ROOT: studio, PORT: String(PORT) },
    detached: true,
    stdio: ['ignore', out, out],
  });
  child.unref();
  fs.mkdirSync(path.dirname(PID_FILE), { recursive: true });
  fs.writeFileSync(PID_FILE, String(child.pid));
  return 'started';
}

let input = '';
process.stdin.on('data', c => { input += c; });
process.stdin.on('end', () => {
  try {
    const { session_id: sid, prompt = '' } = JSON.parse(input);
    if (typeof sid !== 'string' || !sid) return;
    const trimmed = prompt.trim();
    const lower = trimmed.toLowerCase();

    if (/^\/design\s+(off|stop|exit|close)\s*$/i.test(trimmed) ||
        /\b(stop|exit|close|sair do|fechar) design\b/.test(lower)) {
      removeSession(sid);
      return;
    }

    if (/^\/design(?:\s|$)/i.test(trimmed) && !lower.startsWith('/design-implement')) {
      const project = (trimmed.split(/\s+/)[1] || 'default').replace(/[^a-zA-Z0-9_-]/g, '') || 'default';
      const studio = defaultStudio;
      scaffold(studio, project);
      const status = startServer(studio);
      writeSession(sid, { project, studio, port: PORT, activatedAt: new Date().toISOString() });

      const url = `http://localhost:${PORT}`;
      const note = status === 'started'         ? `Preview server up → ${url}`
                 : status === 'already-running' ? `Preview server already running → ${url}`
                 : status === 'installing-deps' ? `Installing server deps in background — re-run /design ${project} when it finishes`
                 :                                `Preview server NOT started (${status}). Manual: cd ${SERVER_DIR} && DESIGN_ROOT=${studio} node index.mjs`;
      process.stdout.write(
        `DESIGN MODE ACTIVATED (${project}). Studio: ${studio}. ` +
        `Scaffold: projects/${project}/{workspace,folders,docs}. ${note}. ` +
        `Auto-invoke design sub-skills. Exit: 'stop design'.`
      );
      return;
    }

    const info = getSession(sid);
    if (info) {
      const tag = info.project ? ` (${info.project})` : '';
      process.stdout.write(
        `DESIGN MODE ACTIVE${tag}. Auto-invoke design sub-skills. ` +
        `Studio: ${info.studio || defaultStudio}. Exit: 'stop design'.`
      );
    }
  } catch (_) {}
});

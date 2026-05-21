#!/usr/bin/env node
// design — statusline badge (per-session)
// Reads session_id from Claude Code statusline stdin JSON and renders a badge
// only if the session has design mode active.

const { getSession } = require('./design-flag');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const sid = data.session_id;
    if (!sid || typeof sid !== 'string') return;
    const info = getSession(sid);
    if (!info) return;
    const project = (info.project || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const label = !project || project === 'default' ? '[DESIGN]' : `[DESIGN:${project}]`;
    process.stdout.write(` \x1b[38;5;135m${label}\x1b[0m`);
  } catch (_) {}
});

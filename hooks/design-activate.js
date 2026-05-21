#!/usr/bin/env node
// design — SessionStart hook
// Session-scoped flag: prune entries past TTL on every session start.

const { pruneStaleSessions } = require('./design-flag');

try { pruneStaleSessions(); } catch (_) {}

# design

HTML-first design plugin for coding agents. 15 specialized skills,
anti-slop discipline, hooks, a local preview server with hot reload,
and reusable starters.

Two install paths:

- **`npx skills`** — installs the 15 skills into any supported agent
  (Claude Code, Codex, Cursor, Cline, OpenCode, and ~50 others).
  Works everywhere. No hooks, no preview server.
- **Claude Code plugin marketplace** — installs the full plugin
  including hooks and the auto-starting preview server. Claude Code
  only.

## Install — `npx skills` (any agent)

```bash
# All 15 skills, into every detected agent
npx skills add cekrauseee/design

# Pick specific skills
npx skills add cekrauseee/design --skill anti-slop --skill make-a-deck

# Target a specific agent
npx skills add cekrauseee/design -a claude-code
npx skills add cekrauseee/design -a cursor
npx skills add cekrauseee/design -a codex

# Install globally instead of per-project
npx skills add cekrauseee/design -g

# List skills without installing
npx skills add cekrauseee/design --list
```

Default install location is `./.claude/skills/` (project) or
`~/.claude/skills/` (with `-g`). Each agent has its own canonical
path — `npx skills` symlinks into all of them.

## Install — Claude Code plugin (full experience)

In any project, inside Claude Code:

```
/plugin marketplace add cekrauseee/design
/plugin install design@cekrauseee-design
```

Then activate in any directory:

```
/design my-site
```

This:

1. Scaffolds `./design/projects/my-site/{workspace,folders,docs}/`
2. Starts the preview server on `http://localhost:3333` (detached,
   idempotent — won't double-spawn)
3. Activates design mode so the model auto-invokes the right skill
   for the request

Re-run `/design <name>` to switch projects. Stop with `stop design`
or `/design off`. Browser console output lands in
`./design/.design-server.log`.

> On first install, the hook runs `npm install` for the preview
> server in the background. If the activation message says
> "Installing server deps", re-run `/design <name>` once it finishes
> (~30s).

## How `/design <name>` works

The `UserPromptSubmit` hook (`hooks/design-mode-tracker.js`) reads
the prompt, and on `/design <name>`:

1. Creates `${cwd}/design/projects/<name>/{workspace,folders,docs}/`
2. Spawns `node ${plugin}/server/index.mjs` detached, pointed at the
   studio via `DESIGN_ROOT=${cwd}/design`. PID stored in
   `~/.claude/.design-server-${PORT}.pid`.
3. Writes a session flag so every subsequent prompt gets a
   `DESIGN MODE ACTIVE` reminder (used in place of a statusline —
   no manual config needed)

The preview server only exposes `workspace/` in its sidebar.
Component code, tokens, uploads, and screenshots live in `folders/`.
Specs and handoff docs live in `docs/`.

## Layout

```
design/
├── .claude-plugin/   plugin.json + marketplace.json
├── AGENTS.md         canonical agent instructions (read first)
├── CLAUDE.md         pointer to AGENTS.md
├── hooks/            SessionStart + UserPromptSubmit + statusline
├── rules/            workflow.md, style.md, output.md
├── skills/           15 SKILL.md (Agent Skills spec)
├── starters/         reusable scaffolds (device frames, etc.)
└── server/           preview server (Node + chokidar + ws)
```

## Configuration

| Env var         | Default          | Purpose                                              |
| --------------- | ---------------- | ---------------------------------------------------- |
| `DESIGN_STUDIO` | `${cwd}/design`  | Where projects live. Set for a global shared studio. |
| `DESIGN_PORT`   | `3333`           | Preview server port.                                 |

## Manual server start (non-Claude-Code agents)

When installing via `npx skills`, the preview server isn't auto-run.
To start it yourself:

```bash
git clone https://github.com/cekrauseee/design
cd design/server
npm install
DESIGN_ROOT=$HOME/path/to/your/design-studio node index.mjs
```

## Update / remove

```bash
# Update everything installed via skills.sh
npx skills update

# Update a single skill
npx skills update anti-slop

# List installed
npx skills list

# Remove a skill
npx skills remove anti-slop

# Remove every skill from this repo (selects all 15 interactively)
npx skills remove
```

Inside Claude Code (plugin route):

```
/plugin update design
/plugin uninstall design
```

## License

MIT — see [LICENSE](./LICENSE).

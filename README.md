# design

HTML-first design ecosystem for coding agents. 15 specialized skills,
anti-slop discipline, hooks, a local preview server with hot reload,
and reusable starters.

Two install paths:

- **Skills only** (`npx skills`) — installs the 15 skills into any
  supported coding agent (~50 of them). Universal. No hooks, no
  preview server.
- **Full plugin** — adds the hooks that auto-scaffold a project and
  spawn the preview server when you type `/design <name>`. Works on
  agents that support the [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
  format (Claude Code today; spec-compatible agents as the ecosystem
  grows).

## Install — skills only

```bash
# All 15 skills, into every detected agent
npx skills add cekrauseee/design

# Pick specific skills
npx skills add cekrauseee/design --skill anti-slop --skill make-a-deck

# Target a specific agent
npx skills add cekrauseee/design -a cursor
npx skills add cekrauseee/design -a codex
npx skills add cekrauseee/design -a opencode

# Install globally instead of per-project
npx skills add cekrauseee/design -g

# List skills without installing
npx skills add cekrauseee/design --list
```

Each agent has its own canonical path; `npx skills` symlinks into
all of them. List of supported agents and paths:
https://www.skills.sh/docs.

## Install — full plugin (hooks + preview server)

In a project, with a hook-aware agent:

```
/plugin marketplace add cekrauseee/design
/plugin install design@cekrauseee-design
```

Then in any directory:

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
├── .claude-plugin/   plugin manifest + marketplace entry
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

## Manual server start

When installing via `npx skills` (or on any agent without hook
support), the preview server isn't auto-run. Start it yourself:

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

Full plugin route (hook-aware agents):

```
/plugin update design
/plugin uninstall design
```

## License

MIT — see [LICENSE](./LICENSE).

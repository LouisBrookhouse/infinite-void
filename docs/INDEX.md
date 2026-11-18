# Documentation index

| Doc | What's in it | Changes when |
|---|---|---|
| [../AGENTS.md](../AGENTS.md) | Standing rules for the daily update agent | Owner-reviewed PRs only |
| [STATUS.md](STATUS.md) | Current version, what's live, open problems, next actions | Every PR |
| [DESIGN.md](DESIGN.md) | Pillars, progression-gate ladder, content registry contracts, boss tiers, meta threats, balance philosophy and guardrails | When a contract or rule changes |
| [ROADMAP.md](ROADMAP.md) | Ordered backlog of small daily updates. Tick items as they ship | Every daily update |
| [OPERATIONS.md](OPERATIONS.md) | CI, deploy, auto-merge, session-note expiry, rollback | When workflows change |
| [sessions/README.md](sessions/README.md) | Session-note rules (7-day expiry) and [template](sessions/TEMPLATE.md) | Rarely |

## Code map
- `index.html`: markup plus script load order (core, then content, then engine).
- `css/style.css`: UI styling.
- `src/core.js`: the `IV` namespace, number formatting and progression gates (`IV.gateOpen`).
- `src/content/*.js`: data registries (changelog, sectors, skins, icons, upgrades and Dark Matter, guns, enemies, bosses, features, missions).
- `src/game.js`: the engine (state and saves, stats, spawning, AI, combat, rendering, store UI). The test handle is `window.__IV`.
- `tests/`: `run.js` (Playwright suites: smoke, save, migration, gating, balance, death, mega, mines, aim, latescale), `unit.js`, `server.js`, `guardrails.json`, `fixtures/`.
- `scripts/`: `validate-docs.js` (docs, changelog, session notes, PR policy) and `expire-sessions.js`.
- `.github/workflows/`: `ci.yml` (test, then deploy), `automerge.yml`, `expire-sessions.yml`.

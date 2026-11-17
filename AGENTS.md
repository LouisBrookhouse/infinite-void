# AGENTS.md: standing instructions for the daily update agent

You maintain **INFINITE VOID**, a zero-build static browser game hosted on GitHub Pages. The owner's vision: the game grows **forever, one small update per day**, with new maps and sectors, art (ship skins, sector art), enemies, guns, upgrades, bosses, mechanics, meta progression and missions, **plus a rebalance pass every day**. New things unlock behind progression gates so the early game stays clean and features unfold as players push further.

## Start of every session
1. Read [docs/INDEX.md](docs/INDEX.md), [docs/STATUS.md](docs/STATUS.md), [docs/DESIGN.md](docs/DESIGN.md) and the next unticked items in [docs/ROADMAP.md](docs/ROADMAP.md).
2. Read any unexpired notes in `docs/sessions/`, but trust code, tests, git history and the live site over notes when they disagree.
3. Run `npm ci && npm test` on a fresh branch from `main` to confirm a green baseline. If `main` is red, your whole job today is a fix-only PR (a patch version bump with a `fixed` changelog line), not new content.

## The daily update: exactly this, nothing more
1. **Pick ONE item**: the first unticked roadmap item whose prerequisites exist. Keep it small, roughly 20 to 150 lines of real change. If it's bigger, split it on the roadmap and ship the first slice.
2. **Gate it.** Every new content entry needs an `unlock` gate (see DESIGN.md, "Progression gates"). Nothing new may be open on a fresh save. The gating test enforces this. Prefer gates that land just beyond where content currently runs out.
3. **Implement it data-first.** Add or extend an entry in `src/content/*.js`. Touch `src/game.js` only for a genuinely new mechanic, and then through a small hook (for example `feat('id')`, an `A` API function, or a content callback). Keep the 64-bit-style pixel look: hand-authored pixel rows, the existing palette, no image files unless they're tiny.
4. **Rebalance.** Run `npm run sim` (the deterministic balance sim, verbose) before and after your change. Make at most a few small, explained numeric tweaks so the game stays inside the guardrail bands in `tests/guardrails.json` and pushes toward the design targets in DESIGN.md. Record the before and after numbers in your session note.
5. **Changelog.** Prepend ONE entry to `src/content/changelog.js` (bump the minor version, e.g. 1.3.0 to 1.4.0, use today's UTC date, and write `added` and `balance` lines in short player-facing language, plus a `gate` string saying where it unlocks). Set `package.json` `version` to match.
6. **Docs.** Tick the roadmap item (add the version and date), update `docs/STATUS.md` (version, what's live, any open problems), and update DESIGN.md if you changed a contract or a gate rule.
7. **Session note.** Create `docs/sessions/YYYY-MM-DD-<slug>.md` from `docs/sessions/TEMPLATE.md` with real content. Move anything still unresolved into STATUS.md or ROADMAP.md, then set `durable_promoted: true`.
8. **Validate locally**: `npm test` must pass (validator + unit + browser suites).
9. **Open a PR** from a branch named `daily/YYYY-MM-DD-<slug>` into `main`, labelled **`daily-update`**, with the title `Daily: <version> <short title>`. The body covers what was added, the gate, the balance before and after, and the tests run. CI runs the tests, and the auto-merge workflow squash-merges and deploys when they pass. Don't merge it yourself.

## Hard rules
- **Never push to `main` directly**, and never force-push or rewrite history.
- **Never weaken tests or guardrails to get green.** Daily-update PRs may not modify `.github/`, `scripts/`, `tests/` (adding new files under `tests/fixtures/` is allowed), `package.json`, `package-lock.json` or this file. CI rejects them. If a guardrail is truly wrong, open a separate PR *without* the `daily-update` label, explain why with sim evidence, and leave it for the owner.
- **Never break saves.** The localStorage key `voidbreaker_save_v1` and the save shape are forever-compatible: add fields with defaults in `fresh()` and let `migrate()` fill them. Never rename or remove upgrade, gun or Dark Matter ids that may exist in saves.
- **Exactly one feature per day.** No drive-by refactors bundled with content.
- Zero console errors. The game must still run from `file://` (classic scripts, no ES modules, no fetch of local files).
- No secrets, tokens or personal data in the repo, notes or PRs. No new third-party runtime dependencies or network calls from the game.
- If you're blocked, open no PR. Write the blocker into STATUS.md through a small docs-only PR without the `daily-update` label, or just stop and report.

## Useful commands
| Command | What it does |
|---|---|
| `npm run serve` | Local server at `/infinite-void/`, same as Pages |
| `npm test` | Everything CI runs |
| `npm run sim` | Verbose deterministic balance sim. Report goes to `artifacts/balance-report.json` |
| `node tests/run.js --only gating` | Run a single browser suite |
| `node scripts/validate-docs.js --base origin/main` | Check the PR policy locally (add `DAILY_UPDATE=true`) |
| `node scripts/expire-sessions.js` | Dry-run session-note expiry |

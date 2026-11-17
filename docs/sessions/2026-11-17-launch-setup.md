---
created: 2026-11-17T10:54:46Z
intent: Bootstrap INFINITE VOID as a data-driven static site with CI, Pages deploy, daily auto-merge and agent docs
durable_promoted: true
updated: 2026-11-17T10:58:57Z
---
# Launch setup (v1.0.0)

## Intent
Turn the single-file VOID BREAKER prototype into INFINITE VOID, a GitHub Pages site that a daily agent can extend with one small gated update plus a rebalance per day, auto-merged and deployed when tests pass. The owner approved auto-merge-if-tests-pass.

## Scope
In: restructure into registries, gates, patch notes, rename, CI, deploy, auto-merge, session-note expiry, docs. Out: new gameplay content (that starts with roadmap R01), a branch protection change, scheduling the daily agent (lives outside the repo).

## Changes
- Split the game into `index.html`, `css/style.css`, `src/core.js` (gates, fmt), `src/content/*.js` (registries with `unlock` gates) and `src/game.js` (engine). Classic scripts, so it still runs from `file://`.
- Guns, bosses and custom enemies are now self-contained content entries with hooks (`fire`, `setup/update/draw`, `update`) that receive the engine API `A`.
- Renamed to INFINITE VOID. The localStorage key stays `voidbreaker_save_v1`. Exports use `IV2:`, and `VB2:` codes still import.
- Added the version button, patch notes modal, sector arrival toast and `seenVersion` save field. Dark Matter upgrades are gated to `warps:1`.
- Tests: Playwright suites (smoke, save, migration, gating, balance), unit tests, docs/policy validator. Guardrail bands are in `tests/guardrails.json`.
- Workflows: `ci.yml` (test then deploy), `automerge.yml`, `expire-sessions.yml`.

## Validation
- Local (box, Chrome): `npm test`: validator ok, 8 unit tests, browser suites smoke, save, migration, gating and balance all passed.
- Balance baseline (seed 1337, 8 taps/s): min5 wave 19, onScreen 11.8, TTK 0.90s. min15 wave 34 / 18.2 / 1.65s. min30 wave 45 / 16.1 / 3.36s. Warp +13 DM. Idle best wave 10 at 15 min.
- CI run 44069366381 (push to main, commit 8e65d81): test and deploy both green, and the deploy live-check saw v1.0.0. CI Chromium's balance numbers differ slightly from local Chrome (min15 wave 32 vs 34) but sit inside the bands. Treat CI as the reference.
- Live check 2026-11-17: https://louisbrookhouse.github.io/infinite-void/ returned 200 with zero console errors, and gameplay rendered (screenshot kept on the box, not in the repo).
- Follow-up commit 0784abb: `package.json` no longer carries the game version, because daily PRs can't touch `package.json`.
- v1.0.1 (this PR, label `daily-update`): a one-line fix (reset no longer flags the patch notes unread). It exercised the pipeline end to end. CI on PR #1 passed, `automerge.yml` squash-merged it as github-actions (commit 0931ddd) and dispatched CI on `main`, and that run's test and deploy were green, with the live site serving v1.0.1 by 11:01 UTC. One gap: a GITHUB_TOKEN merge doesn't trigger delete-branch-on-merge, so `automerge.yml` now deletes `daily/*` branches explicitly. That was a bootstrap commit to main.

## Open items
- Branch protection on `main` not configured (recorded in STATUS.md).

## Next steps
Daily agent: start roadmap R01 (Mine Layer).

## Links
[STATUS](../STATUS.md), [DESIGN](../DESIGN.md), [ROADMAP](../ROADMAP.md), [OPERATIONS](../OPERATIONS.md)

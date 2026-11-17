---
created: 2026-11-17T10:54:46Z
intent: Bootstrap INFINITE VOID as a data-driven static site with CI, Pages deploy, daily auto-merge and agent docs
durable_promoted: true
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
- CI and live-site results are recorded in STATUS.md after the first deploy.

## Open items
- Branch protection on `main` not configured (recorded in STATUS.md).

## Next steps
Daily agent: start roadmap R01 (Mine Layer).

## Links
[STATUS](../STATUS.md), [DESIGN](../DESIGN.md), [ROADMAP](../ROADMAP.md), [OPERATIONS](../OPERATIONS.md)

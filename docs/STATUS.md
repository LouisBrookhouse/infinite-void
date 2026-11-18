# Status

_Last updated: 2026-11-18 (v1.2.0 Mine Layer on this branch, v1.1.4 on main)_

## Version state
- **Implemented:** 1.2.0 on `daily/2026-11-18-mine-layer`. Mine Layers at wave 24 drop slow proximity mines. A shot or a touch bursts a mine into eight shots.
- **Tested:** `npm test` on this branch. See [sessions/2026-11-18-mine-layer.md](sessions/2026-11-18-mine-layer.md).
- **Merged:** 1.1.4 is on `main` (PR #6). 1.2.0 is not merged. This session does not open the PR.
- **Live:** 1.1.4. 1.2.0 is not live until that PR merges and the deploy job finishes.

## Live
- **Version on main:** 1.1.4. This branch prepends 1.2.0 in `src/content/changelog.js`.
- **URL:** https://louisbrookhouse.github.io/infinite-void/ (deployed by `.github/workflows/ci.yml` on push to `main`).
- **Live-verified 2026-11-17:** v1.0.0 returned HTTP 200 with zero console errors in headless Chrome, and gameplay rendered (CI run 44069366381: test and deploy green, deploy live-check passed). v1.1.0 is not on the live site yet.
- **Content on main:** 7 guns, 10 enemy types, 6 bosses, 11 ship upgrades, 6 Dark Matter upgrades, 5 sectors, 2 skins, 1 feature flag (secondary slot), 0 missions. This branch adds Mine Layer and Mine (12 enemy types). The six bosses are five standard bosses and one mega boss.

## Automation
- CI (`test` job): docs/session-note/policy validator, unit tests, Playwright suites (smoke, save, migration, gating, balance guardrails).
- Deploy: the `deploy` job in `ci.yml` runs after `test` on `main` (push or dispatch) through GitHub Pages Actions.
- Auto-merge: `automerge.yml` squash-merges open same-repo PRs labelled `daily-update` once CI succeeds on the PR head, then dispatches CI on `main` to deploy.
- Session-note expiry: `expire-sessions.yml` runs daily (03:23 UTC) and deletes notes older than 7 days after promotion.
- See [OPERATIONS.md](OPERATIONS.md) for details and rollback.

## Known gaps and decisions
- **No branch protection on `main`.** The owner approved auto-merge-if-tests-pass, and the auto-merge workflow merges only after CI succeeds on the exact head SHA and re-checks protected paths. Direct pushes to `main` are prevented only by AGENTS.md rules, not by GitHub. Adding a protection rule that requires the `test` check is a recommended follow-up, and it would require the expiry workflow to switch to PRs.
- **Daily agent schedule** lives outside this repo (the owner's assistant launches a cloud coding agent each day with AGENTS.md as its brief).
- Old VOID BREAKER saves live in the browser where they were played (`file://` storage is separate from the website). Players move them with EXPORT/IMPORT, and the `VB2:` codes still import.
- Engine is still one file (`src/game.js`, about 930 lines). Split it only when a feature needs it, and never as a daily item.
- The missions registry is reserved but unimplemented (roadmap R11).
- Sector art still has five pictures, so sector 10 reuses THE DEEP. The HUD still says SECTOR 10.
- The balance sim stalls around wave 45 (wave 44 before Mine Layers), so it never fights THE MAW. Phase HP is set against `eHP(wave)` and a 90s clock. See DESIGN.md. Mine HP is 0.26× the wave baseline. The 30 minute sim still has 0 deaths.
- The game has no final boss and no end state. Boss tiers are `standard`, `elite`, `mega`, and `meta`, and the list stays open. Waves continue past 95 and sectors continue past 10. Future days can add bosses of any tier, including more mega bosses and meta threats.
- **Meta threats are not implemented.** The play rect, the outside layer, and the spawn roll are a design contract in DESIGN.md. R04 Black Hole and R35 Rect Breaker are the first two roadmap items. They are wild-card days (about one in ten, never two in a row), not the next normal update. A normal day skips a `[meta threat]` item. 1.2.0 is not a meta threat.
- A hull breach on any wave, including a mega boss, is an emergency Warp Jump. It pays the same Dark Matter as the button (`dmGain()`, which is 0 before wave 20) and never the Maw bounty. A zero payout does not increment `S.warps`. The Maw phase timer still restarts the current phase. A boss that escapes outside a mega boss still drops one wave.
- Clearing THE MAW grants Eidolon once and a Dark Matter plus credit bounty once per run (`S.megaPaid`), then the run continues. It does not warp.
- `?mega=1` is a dev jump to wave 91. `?final=1` is the same jump. Either sets `noSave`. `?kit=1` with either also sets `G.debugMul`. Real runs leave `debugMul` at 1.

## Next actions
1. Daily agent: roadmap **R02 Option Pods** (wave 26). R01 Mine Layer shipped in 1.2.0. R04 Black Hole is a meta threat and is not next.
2. Owner (optional): decide on branch protection (see above).

# Status

_Last updated: 2026-11-17 (v1.1.2 wall of flesh on this branch, v1.1.1 live)_

## Version state
- **Implemented:** 1.1.2 on `daily/2026-11-17-maw-wof`. THE MAW is a wall of flesh with four Hungry tentacles, and guns aim at those parts while the core is armored. The phase HP budget is unchanged.
- **Tested:** `npm test` on this branch. Headless Chromium at `?final=1&kit=1` cleared all 5 phases with zero taps in about 180 seconds, no console errors, 61 fps. See [sessions/2026-11-17-maw-wof.md](sessions/2026-11-17-maw-wof.md).
- **Merged:** 1.1.1 is on `main` (PR #3). 1.1.2 is not merged. This session does not open the PR.
- **Live:** 1.1.1. 1.1.2 is not live until that PR merges and the deploy job finishes.

## Live
- **Version on main:** 1.1.1. This branch prepends 1.1.2 in `src/content/changelog.js`.
- **URL:** https://louisbrookhouse.github.io/infinite-void/ (deployed by `.github/workflows/ci.yml` on push to `main`).
- **Live-verified 2026-11-17:** v1.0.0 returned HTTP 200 with zero console errors in headless Chrome, and gameplay rendered (CI run 44069366381: test and deploy green, deploy live-check passed). v1.1.0 is not on the live site yet.
- **Content on main:** 7 guns, 10 enemy types, 6 bosses, 11 ship upgrades, 6 Dark Matter upgrades, 5 sectors, 2 skins, 1 feature flag (secondary slot), 0 missions. 1.1.2 changes no counts.

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
- The balance sim stalls around wave 44, so it never fights THE MAW. Phase HP is set against `eHP(wave)` and a 90s clock. See DESIGN.md.
- Death or the phase timer during waves 91-95 restarts the current phase. It does not drop a wave and it does not reset earlier phases.
- `?final=1` is a dev jump to wave 91. It sets `noSave`. `?kit=1` with it also sets `G.debugMul`. Real runs leave `debugMul` at 1.

## Next actions
1. Daily agent: roadmap **R01 Mine Layer**. The owner pulled R33 THE MAW ahead of R01 on 2026-11-17. R01 stays next.
2. Owner (optional): decide on branch protection (see above).

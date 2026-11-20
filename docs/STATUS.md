# Status

_Last updated: 2026-11-20 (v1.4.2 same-hand sprites on `daily/2026-11-20-art-unify`, v1.4.1 on main at `5d0001a`)_

## Version state
- **Implemented:** 1.4.2 on `daily/2026-11-20-art-unify`. Mine Layers, mines, Option Pods, spore shots, Big Core shields, Xeno plates, and THE MAW (wall, tentacles, eyes, mouth) are repainted with the master palette, the upper-left light, and the same rim as the v1.0 ships. Hitboxes, part sizes, and attacks are unchanged. The shared helper is `src/content/art.js`. The rule for later art is DESIGN.md, "Art style guide".
- **Not in 1.4.2:** the pre-1.2.3 Big Core and Xeno layout. Louis asked for the classic stacked shields and invulnerable plates back, and for the wave-125 health cap to stay. `tests/run.js` latescale asserts the 1.2.3 gap (`covered === 0`), the covering plate (`covered >= 1`), and regrow (`hp === max`, `down === 0` after 0.1s). `tests/` was not edited. Shield and plate numbers stay at 1.2.3. The cap stays the balance tool.
- **Tested:** `npm test` on this branch. See [sessions/2026-11-20-art-unify.md](sessions/2026-11-20-art-unify.md).
- **Merged:** 1.4.1 is on `main` (PR #14, `5d0001a`). This session does not open a PR.
- **Live:** 1.4.1 until a merge and the deploy job finish.

## Live
- **Version on main:** 1.4.1. This branch prepends 1.4.2 in `src/content/changelog.js`.
- **URL:** https://louisbrookhouse.github.io/infinite-void/ (deployed by `.github/workflows/ci.yml` on push to `main`).
- **Live-verified 2026-11-17:** v1.0.0 returned HTTP 200 with zero console errors in headless Chrome, and gameplay rendered (CI run 44069366381: test and deploy green, deploy live-check passed). Later versions follow the same deploy job.
- **Content on main:** 7 guns, 12 enemy types, 6 bosses, 12 ship upgrades, 6 Dark Matter upgrades, 5 sectors, 2 skins, 1 feature flag (secondary slot), 0 missions. This branch repaints sprites that already exist. It does not add a gun, enemy, boss, or upgrade.

## Automation
- CI (`test` job): docs/session-note/policy validator, unit tests, Playwright suites (smoke, save, migration, gating, balance guardrails, death, mega, mines, aim, latescale).
- Deploy: the `deploy` job in `ci.yml` runs after `test` on `main` (push or dispatch) through GitHub Pages Actions.
- Auto-merge: `automerge.yml` squash-merges open same-repo PRs labelled `daily-update` once CI succeeds on the PR head, then dispatches CI on `main` to deploy.
- Session-note expiry: `expire-sessions.yml` runs daily (03:23 UTC) and deletes notes older than 7 days after promotion.
- See [OPERATIONS.md](OPERATIONS.md) for details and rollback.

## Known gaps and decisions
- **Classic Big Core and Xeno mechanics stay at 1.2.3.** The request on 2026-11-20 was to restore the layout from `3cde506` (parent of `69152cb`, PR #11; the cited `955521f` is not in this repo) and to keep the health cap. The latescale assertions named above depend on the offset shields, the gap, the covering plate, and the regrow. Editing them is not allowed on this branch. A later change to that layout needs its own PR that is allowed to touch `tests/`, with the kill times against the 35s escape still inside the suite.
- **Do not undo the wave-125 health cap.** `HP_CAP_WAVE` is 125, `HP_BEND_WAVE` is 100, `HP_LATE_MULT` is 3.5, `DMG_LATE` is 1.12. They live next to `eHP` and `eDmg` in `src/game.js`. Health is classic through wave 100, then a log ramp to 3.5× that value at wave 125, then flat for every enemy, mine, and boss. Further threat is damage: ×1.12 per wave after 125, and ×1.2 per sector past sector 12. A pure clamp of the old 19% curve still leaves bosses up for minutes, and putting 19% onto damage deletes a developed save on the next Big Core. The contract is in DESIGN.md, "Late health cap".
- **No branch protection on `main`.** The owner approved auto-merge-if-tests-pass, and the auto-merge workflow merges only after CI succeeds on the exact head SHA and re-checks protected paths. Direct pushes to `main` are prevented only by AGENTS.md rules, not by GitHub. Adding a protection rule that requires the `test` check is a recommended follow-up, and it would require the expiry workflow to switch to PRs.
- **Daily agent schedule** lives outside this repo (the owner's assistant launches a cloud coding agent each day with AGENTS.md as its brief).
- Old VOID BREAKER saves live in the browser where they were played (`file://` storage is separate from the website). Players move them with EXPORT/IMPORT, and the `VB2:` codes still import.
- Engine is still one file (`src/game.js`, about 1020 lines). Split it only when a feature needs it, and never as a daily item.
- The missions registry is reserved but unimplemented (roadmap R11).
- Sector art still has five pictures, so sector 10 reuses THE DEEP. The HUD still says SECTOR 10.
- The balance sim stalls around wave 44, so it never fights THE MAW or the health cap. Phase HP is set against `eHP(wave)` and a 90s clock. See DESIGN.md. Mine HP is 0.16× the wave baseline. A field is every 3rd non-boss wave from 24, with a second line from wave 36, a cap of 24, and a 13.5s life. The 30 minute sim has 0 deaths and a warp pays +13 Dark Matter. On 2026-11-20, before the regen tweak (and with the clouds, which do not move the sim): min5 wave 21 / onScreen 11.133 / TTK 1.197s, min15 wave 34 / 17.9 / 1.462s, min30 wave 44 / 14.533 / 2.939s, idle best 8, post-warp best 60. After a passive heal of 0.4% max hull per second: the same active line, idle best 10. Option Pods are bought around wave 30. The v1.0.0 idle baseline was also wave 10.
- The game has no final boss and no end state. Boss tiers are `standard`, `elite`, `mega`, and `meta`, and the list stays open. Waves continue past 95 and sectors continue past 10. Future days can add bosses of any tier, including more mega bosses and meta threats.
- **Meta threats are not implemented.** The play rect, the outside layer, and the spawn roll are a design contract in DESIGN.md. R04 Black Hole and R35 Rect Breaker are the first two roadmap items. They are wild-card days (about one in ten, never two in a row), not the next normal update. A normal day skips a `[meta threat]` item. 1.4.2 is not a meta threat. The previous shipped update (1.4.1) was not one either.
- **`tests/run.js` latescale checks `VERSION >= 1.2.3`.** Read on 2026-11-20. A changelog bump does not need a test edit. This branch does not touch `tests/`.
- A hull breach on any wave, including a mega boss, is an emergency Warp Jump. It pays the same Dark Matter as the button (`dmGain()`, which is 0 before wave 20) and never the Maw bounty. A zero payout does not increment `S.warps`. The Maw phase timer still restarts the current phase. A boss that escapes outside a mega boss still drops one wave.
- Clearing THE MAW grants Eidolon once and a Dark Matter plus credit bounty once per run (`S.megaPaid`), then the run continues. It does not warp.
- `?mega=1` is a dev jump to wave 91. `?final=1` is the same jump. Either sets `noSave`. `?kit=1` with either also sets `G.debugMul`. Real runs leave `debugMul` at 1.

## Next actions
1. Daily agent: roadmap **R0X** Splitter (wave 27). R04 Black Hole is a meta threat and is not next. New art on that item follows DESIGN.md, "Art style guide".
2. Owner: this branch does not open a PR. `daily/2026-11-20-art-unify` is 1.4.2.
3. Owner (optional): decide on branch protection (see above).

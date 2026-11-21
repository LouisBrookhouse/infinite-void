# Status

_Last updated: 2026-11-21 (v1.5.0 Splitter on `daily/2026-11-21-splitter`, v1.4.2 on main at `1fe8ea5`)_

## Version state
- **Implemented:** 1.5.0 on `daily/2026-11-21-splitter`. Splitter is a 13×7 pyramid in the spawn pool from the current wave 27. Killing it prints SPLIT and releases 3 aimed darts. The darts steer while they are above the ship, then fly straight off the screen. Weight 1.15, pyramid hp 1.25, dart hp 0.32. No new save fields. 1.4.2's paint, the classic Big Core and Xeno layout, and the wave-125 health cap are unchanged.
- **Tested:** `npm test` on this branch. See [sessions/2026-11-21-splitter.md](sessions/2026-11-21-splitter.md).
- **Merged:** 1.4.2 is on `main` (PR #15, `1fe8ea5`). This session does not open a PR.
- **Live:** 1.4.2 until a merge and the deploy job finish.

## Live
- **Version on main:** 1.4.2. This branch prepends 1.5.0 in `src/content/changelog.js`.
- **URL:** https://louisbrookhouse.github.io/infinite-void/ (deployed by `.github/workflows/ci.yml` on push to `main`).
- **Live-verified 2026-11-17:** v1.0.0 returned HTTP 200 with zero console errors in headless Chrome, and gameplay rendered (CI run 44069366381: test and deploy green, deploy live-check passed). Later versions follow the same deploy job.
- **Content on main:** 7 guns, 12 enemy types, 6 bosses, 12 ship upgrades, 6 Dark Matter upgrades, 5 sectors, 2 skins, 1 feature flag (secondary slot), 0 missions. This branch adds `splitter` and `dart` (14 enemy types). It does not add a gun, boss, or upgrade.

## Automation
- CI (`test` job): docs/session-note/policy validator, unit tests, Playwright suites (smoke, save, migration, gating, balance guardrails, death, mega, mines, aim, latescale).
- Deploy: the `deploy` job in `ci.yml` runs after `test` on `main` (push or dispatch) through GitHub Pages Actions.
- Auto-merge: `automerge.yml` squash-merges open same-repo PRs labelled `daily-update` once CI succeeds on the PR head, then dispatches CI on `main` to deploy.
- Session-note expiry: `expire-sessions.yml` runs daily (03:23 UTC) and deletes notes older than 7 days after promotion.
- See [OPERATIONS.md](OPERATIONS.md) for details and rollback.

## Known gaps and decisions
- **Classic Big Core and Xeno mechanics are the live ones.** Restored from `3cde506` (parent of `69152cb`, PR #11). The health cap stays. `tests/run.js` latescale no longer asserts the 1.2.3 gap, covering plate, or regrow. It asserts that Louis's save, played idle, kills Big Core and Xeno Biomech in under 30s (a 5s margin on the 35s escape) around waves 120-125. Xeno's `hp` multiplier is 8.5, down from 10. Measured 2026-11-20: live Big Core wave 120 in 10.23s, live Xeno wave 125 in 20.8s, isolated wave 125 in 10.13s and 20.03s. A seeded active run kills wave-25 Xeno in 3.75s, down from 4.25s at multiplier 10. This branch is not a `daily-update` PR. The owner merges it by hand.
- **Do not undo the wave-125 health cap.** `HP_CAP_WAVE` is 125, `HP_BEND_WAVE` is 100, `HP_LATE_MULT` is 3.5, `DMG_LATE` is 1.12. They live next to `eHP` and `eDmg` in `src/game.js`. Health is classic through wave 100, then a log ramp to 3.5× that value at wave 125, then flat for every enemy, mine, and boss. Further threat is damage: ×1.12 per wave after 125, and ×1.2 per sector past sector 12. A pure clamp of the old 19% curve still leaves bosses up for minutes, and putting 19% onto damage deletes a developed save on the next Big Core. The contract is in DESIGN.md, "Late health cap".
- **No branch protection on `main`.** The owner approved auto-merge-if-tests-pass, and the auto-merge workflow merges only after CI succeeds on the exact head SHA and re-checks protected paths. Direct pushes to `main` are prevented only by AGENTS.md rules, not by GitHub. Adding a protection rule that requires the `test` check is a recommended follow-up, and it would require the expiry workflow to switch to PRs.
- **Daily agent schedule** lives outside this repo (the owner's assistant launches a cloud coding agent each day with AGENTS.md as its brief).
- Old VOID BREAKER saves live in the browser where they were played (`file://` storage is separate from the website). Players move them with EXPORT/IMPORT, and the `VB2:` codes still import.
- Engine is still one file (`src/game.js`, about 1020 lines). Split it only when a feature needs it, and never as a daily item.
- The missions registry is reserved but unimplemented (roadmap R11).
- Sector art still has five pictures, so sector 10 reuses THE DEEP. The HUD still says SECTOR 10.
- The balance sim stalls around wave 44, so it never fights THE MAW or the health cap. Phase HP is set against `eHP(wave)` and a 90s clock. See DESIGN.md. Mine HP is 0.16× the wave baseline. A field is every 3rd non-boss wave from 24, with a second line from wave 36, a cap of 24, and a 13.5s life. The 30 minute sim has 0 deaths and a warp pays +13 Dark Matter. On 2026-11-21, before Splitter: min5 wave 20 / onScreen 11.133 / TTK 1.052s, min15 wave 34 / 18.867 / 1.735s, min30 wave 44 / 13.9 / 2.829s, idle best 10, warp +13 Dark Matter. After (weight 1.15, pyramid hp 1.25, dart hp 0.32, darts dive and leave): min5 wave 20 / 11.133 / 1.052s, min15 wave 34 / 19.633 / 1.618s, min30 wave 44 / 13.633 / 2.843s, idle best 10, warp +13. A first pass that let the darts orbit, at weight 1.4, put min30 on-screen at 11.667, under the floor of 12. Option Pods are bought around wave 30. The v1.0.0 idle baseline was also wave 10.
- The game has no final boss and no end state. Boss tiers are `standard`, `elite`, `mega`, and `meta`, and the list stays open. Waves continue past 95 and sectors continue past 10. Future days can add bosses of any tier, including more mega bosses and meta threats.
- **Meta threats are not implemented.** The play rect, the outside layer, and the spawn roll are a design contract in DESIGN.md. R04 Black Hole and R35 Rect Breaker are the first two roadmap items. They are wild-card days (about one in ten, never two in a row), not the next normal update. A normal day skips a `[meta threat]` item. 1.5.0 is not a meta threat. The previous shipped update (1.4.2) was not one either.
- **Do not set `threat` on an enemy whose unlock wave is 27.** Wave 27 is a mine-field wave. `startWave` toasts `threat` for that unlock wave even when the enemy has not spawned, and the mines suite then expects the toast to still say MINE LAYERS. Splitter toasts from its `init` the first time one actually spawns (`A.toast`). See DESIGN.md, "Splitter".
- **`tests/run.js` latescale checks `VERSION >= 1.2.3`.** Read on 2026-11-20. A changelog bump does not need a test edit. This branch does edit the layout assertions in that suite, and nothing else under `tests/`.
- A hull breach on any wave, including a mega boss, is an emergency Warp Jump. It pays the same Dark Matter as the button (`dmGain()`, which is 0 before wave 20) and never the Maw bounty. A zero payout does not increment `S.warps`. The Maw phase timer still restarts the current phase. A boss that escapes outside a mega boss still drops one wave.
- Clearing THE MAW grants Eidolon once and a Dark Matter plus credit bounty once per run (`S.megaPaid`), then the run continues. It does not warp.
- `?mega=1` is a dev jump to wave 91. `?final=1` is the same jump. Either sets `noSave`. `?kit=1` with either also sets `G.debugMul`. Real runs leave `debugMul` at 1.

## Next actions
1. Daily agent: roadmap **R05** Afterburner (wave 28, credits). R04 Black Hole is a meta threat and is not next. New art follows DESIGN.md, "Art style guide".
2. Owner: this branch does not open a PR. `daily/2026-11-21-splitter` is 1.5.0.
3. Owner (optional): decide on branch protection (see above).

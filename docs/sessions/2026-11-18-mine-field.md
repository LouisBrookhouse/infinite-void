---
created: 2026-11-18T10:02:18Z
intent: Rework the wave-24 Mine Layer into a sweeping mine line after the 1.2.0 dropper was too easy to miss.
durable_promoted: true
---
# Mine Layer rework

## Intent
Louis played 1.2.0 to wave 44 and did not notice a Mine Layer. The miner was a small extra shooter (about 4.8% of picks at wave 44) and the mines read as orange crosses. 1.2.1 makes the layer sweep a real line of mines, chain-detonate when one is shot, and show up every few waves from wave 24. This is a patch on R01, not a new roadmap item.

## Scope
In scope: `miner` and `mine` in `src/content/enemies.js`, the scheduled pass, `pickTarget`, and `draw` hook in `src/game.js`, changelog 1.2.1, DESIGN, STATUS, ROADMAP, the `mines` suite in `tests/run.js`, this note.
Out of scope: new enemy types, guardrail edits, opening a PR, R02 Option Pods.

## Changes
- Weight 0 for both. A pass runs when the wave is at least 24, not a boss, and `wave % 3 === 0`. Wave 24 banners MINE LAYERS and toasts NEW THREAT: MINE LAYERS. Later passes banner MINE FIELD.
- The layer is a 25×11 dark barge with an orange rack, fixed palette (no sector X/Y). It enters from the side at 64px/s and drops 12 stationary mines, centers x 8 to 162, step 14, y 64. From wave 36 it lays a second line at y 118 and then leaves with no bounty.
- Mines are 15×13 spiked circles, hp 0.16, `counts: false`. A shot or a touch detonates: 4 diagonal pellets at 32px/s, `bossFire` damage mult 0.1. Neighbours within 16px and at least 0.25s old fuse at 0.11s. Touch damage is 0.45×`eDmg`. Life is 13.5s, then a flash despawn with no reward and no chain. Cap 24.
- Guns aim at the mine nearest the ship once 6 mines are up. An enemy below y = H-75 still wins. Fewer than 6 mines leaves the guns on the lowest real enemy.

## Validation
- `node tests/run.js --only mines`: passed. Line of 8–12 on one y, second line at wave 36 under the cap, chain of 4, expire with no bullets and no credits, mine kills do not advance the wave, a quota kill still does, touch hurts, targeting prefers the field then a close enemy.
- `npm run sim` (seed 1337), 1.2.0 shipped → 1.2.1: min5 wave 21 / onScreen 10.8 / TTK 1.099s unchanged. min15 wave 33 / 16.133 / 1.685s → wave 33 / 17.867 / 1.832s. min30 wave 45 / 13.8 / 3.708s → wave 45 / 14.833 / 3.852s. Warp +13 Dark Matter both times. Idle best 7 both times. 0 deaths both times. Post-warp best 58 → 57.
- A 17px hull on the same schedule had min15 at wave 35. The 25px barge brought it back to wave 33. No further number tweak.
- Headless frames at wave 33: `/opt/cursor/artifacts/mine-line-forming.png`, `mine-line-full.png`, `mine-chain.png`.

## Open items
None in the game. The `tests/run.js` edit fails a `daily-update` protected-path check. That is recorded in STATUS.md. Open the PR without the label.

## Next steps
R02 Option Pods (wave 26). R04 Black Hole stays a meta-threat wild card.

## Links
- [DESIGN.md](../DESIGN.md) Mine Layer
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R01
- Previous note: [2026-11-18-mine-layer.md](2026-11-18-mine-layer.md)

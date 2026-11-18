---
created: 2026-11-18T09:29:52Z
intent: Ship R01 Mine Layer at wave 24, plus a small rebalance from the sim.
durable_promoted: true
---
# Mine Layer

## Intent
Roadmap R01. A gated enemy that drifts across the top and drops slow proximity mines. A mine bursts into 8 shots when shot or touched. Early waves stay unchanged.

## Scope
In scope: `miner` and `mine` in `src/content/enemies.js`, `onDeath` plus `A.kill` in `src/game.js`, changelog 1.2.0, DESIGN, STATUS, ROADMAP, this note.
Out of scope: option pods, sector art, meta threats, new tests, and opening the pull request.

## Changes
- `miner` (`ai:'custom'`, unlock wave 24, weight 1.2, hp 1.7, spd 34) enters to y=18 and drifts. Every 2.8s it drops a `mine` if fewer than 3 are alive.
- `mine` (weight 0, `counts: false`, hp 0.26, spd 18, dmg 0.55) falls, flashes inside 28px, and leaves the bottom without bursting. Touch deals `dmg`×`eDmg` and detonates. `onDeath` fires 8 bullets at 44px/s with `bossFire` damage mult 0.2 (each pellet 0.28×`eDmg`).
- `killEnemy` calls `onDeath` once. `A.kill` is the content hook. No new save fields.

## Validation
- Baseline `npm test` on this branch before the edit: passed. Balance: min5 wave 21 onScreen 10.8 TTK 1.099s, min15 wave 34 onScreen 15.633 TTK 1.817s, min30 wave 44 onScreen 21.367 TTK 3.619s, warp +13 DM, idle best 7. 0 deaths.
- First Mine Layer pass (mine hp 0.38): min5 unchanged, min15 wave 32 onScreen 12.967 TTK 1.667s, min30 wave 44 onScreen 19.8 TTK 3.179s, warp +12 DM, idle best 7. 0 deaths. Minute 15 lost two waves and the screen thinned, so mine hp went to 0.26.
- After that tune, `npm run sim`: min5 wave 21 onScreen 10.8 TTK 1.099s, min15 wave 33 onScreen 16.133 TTK 1.685s, min30 wave 45 onScreen 13.8 TTK 3.708s, warp +13 DM, idle best 7. 0 deaths. Post-warp best 58. Minutes 1-7 match the baseline.
- Headless Chromium, paused, muted: wave 1 and wave 23 never pick `miner` or `mine`. Wave 24 picks `miner` and never `mine`. A layer drops a mine by 1.4s and stays at or under 3 mines. A player bullet kills a mine into 8 bullets at speed 44 on 45-degree steps. A touch at wave 24 costs 9.15 hull (contact plus one pellet) and does not warp. A mine past the bottom adds no bullets. A second `A.kill` does not pay again. Wave 1 for 15s shows only scouts. Console errors: none. The canvas shows the layer, round mines, and an eight-way burst.
- `npm test` after the docs: passed. Docs validator, 8 unit tests, smoke, save, migration, gating, balance, death, mega. Balance matches the tuned sim above. Console errors: none.

## Open items
None. The stall moving from wave 44 to wave 45, the mine hp of 0.26, and R02 as the next item are in STATUS, DESIGN, and ROADMAP.

## Next steps
The next daily update is R02 Option Pods (wave 26). R04 Black Hole is a meta threat. Skip it on a normal day.

## Links
- Branch `daily/2026-11-18-mine-layer`
- [DESIGN.md](../DESIGN.md) Mine Layer
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R01

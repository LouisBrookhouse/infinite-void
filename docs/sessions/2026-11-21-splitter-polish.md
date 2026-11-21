---
created: 2026-11-21T10:06:20Z
intent: Polish the v1.5.0 Splitter so separating facets cannot be shot, and repaint the pyramid in flat bands.
durable_promoted: true
---
# Splitter polish

## Intent
Patch 1.5.1 on the Splitter already on main. Facets stay untargetable and unhittable for the 0.34s separation. The pyramid loses its Bayer checker and the centre face takes the sector colour. Not a new enemy. Not a meta threat. This branch does not open a PR.

## Scope
In scope: `targetable`, `findHit`, and `dmgEnemy` in `src/game.js`; `ivPyBand` in `src/content/enemies.js`; changelog 1.5.1; DESIGN, STATUS, ROADMAP, this note.
Out of scope: new guns, enemies, bosses, upgrades, numeric rebalance, guardrail edits, protected paths, and a pull request.

## Changes
- While `shard > 0`, a dart is not a target. `targetable` is false, `findHit` misses, and `dmgEnemy` returns. Auto-aim, homing missiles, drones, taps, and a smart bomb ignore the facet, and player bullets pass through. When `shard` hits 0 the arrowhead is a normal target. Boss-first targeting is unchanged: a boss still wins, and only an enemy on the hull pulls aim off it.
- `ivPyPaint` no longer calls `IV.art.tone` or `IV.art.litUL`. `ivPyBand` paints flat rows. Left face is sector highlight, sector hull, then dark metal. Centre face is the same sector highlight and hull, then steel and dark metal. Right face is dark metal, navy, and near-black. Black rim, orange seams, white speck on the upper left, yellow core, yellow nose.
- No hp, reward, speed, weight, or ram changes.

## Validation
- Baseline `npm run sim` on 1.5.0 before the edit: min5 wave 20 / onScreen 11.133 / TTK 1.052s, min15 wave 34 / 19.4 / 1.569s, min30 wave 44 / 18.633 / 2.688s, warp +13, idle best 10, 0 deaths.
- `npm run sim` after, no knobs moved: min5 wave 20 / 11.133 / 1.052s, min15 wave 35 / 17.067 / 1.748s, min30 wave 44 / 17.933 / 2.703s, warp +13, idle best 10, 0 deaths. Minutes 1-8 match. Minute-30 density stays above 12. Post-warp best at 10 minutes is wave 60.
- Headless Chromium, `?mute=1`, paused, `__IV`. Five splitters killed at wave 27 with homing, pulse, four drones, and Option Pods (damage 80). 15 darts, all `shard` 0.34. Over 9 frames (0.30s) none lost hp, `minShard` was 0.04, `pickTarget` stayed on a fighter, and no homing missile locked a shard. A laser on a facet stayed in `G.pb` and left hp unchanged. With `shard` set to 0, `pickTarget` returned the dart and the same shot killed it. A boss still won over the fighter and over a facet parked on the hull. A fighter on the hull still pulled aim off the boss. Console errors: none.
- Pixel dump at wave 27, centre rows are one colour each (sector highlight, sector hull, steel, dark metal). No checker. Same bands at wave 31 in the solar colours. Screenshot next to the scout, fighter, kamikaze, and cruiser.
- `CHROME_PATH=/opt/google/chrome/chrome npm test`: validate-docs ok (17 changelog entries, 17 session notes), unit 8 passed, browser suites smoke, save, migration, gating, balance, death, mega, mines, aim, latescale all passed. Balance line matches the sim above. Latescale: wave 132 in 833.5s, 0 new deaths, live Big Core wave 120 in 8.4s, live Xeno wave 125 in 23.43s, both under 30s. Console errors: none.
- `node scripts/validate-docs.js --base origin/main`: policy ok. Not a daily-update. No protected paths.

## Open items
None that are still only in this note. The facet rule and the flat-band paint are in DESIGN.md and STATUS.md.

## Next steps
R05 Afterburner (wave 28, credits). R04 Black Hole stays a meta-threat wild card.

## Links
- Branch `fix/2026-11-21-splitter-polish`. No pull request.
- [DESIGN.md](../DESIGN.md) Splitter, Targeting
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R0X

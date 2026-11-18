---
created: 2026-11-18T15:47:00Z
intent: Cap enemy health at wave 125, move later threat into damage, and make Big Core and Xeno Biomech killable before they escape.
durable_promoted: true
---
# Late scaling

## Intent
Louis, on 1.2.2: runs stall around wave 120 because health keeps climbing and two bosses block every shot. v1.2.3 caps health, scales damage after that, and opens a line on Big Core and Xeno Biomech. Idle play with his save has to kill both before the 35s escape timer at wave 125. Not a roadmap day. Not a daily-update PR.

## Scope
In scope: `eHP` / `eDmg` in `src/game.js`, Big Core and Xeno Biomech in `src/content/bosses.js`, the aim point for a covered weak column, changelog 1.2.3, DESIGN, STATUS, `tests/fixtures/louis-iv2.txt`, the `latescale` suite.
Out of scope: Maw targeting, boss-first priority, guardrail edits, new content, a pull request.

## Changes
- `HP_CAP_WAVE` is 125. `HP_BEND_WAVE` is 100. `HP_LATE_MULT` is 3.5. `DMG_LATE` is 1.12. Health matches `hpRaw` through wave 100 (`eHP(100)` is 3,110,358,065). It then ramps to 10,886,253,227 at wave 125 (3.5× wave 100) and stays there. The old curve at wave 125 was 415,937,580,214, about 134× wave 100. Clamping that number still left a boss up for minutes.
- Through wave 125, damage is still `1.11^(wave-1)` (`eDmg(125)` is 416,917). After 125 it grows ×1.12 per wave, and ×1.2 for each new sector. Wave 130 is 1.762× wave 125. Wave 140 is about 6.57×, same health. A full ×1.19 per wave, the old health rate, killed this save on the next Big Core. 1.12 is the tuned rate.
- Mines, scouts, guards, and every boss read `eHP` and `eDmg`, so the cap and the damage step cover them. A mine and Big Core have the same max HP at wave 125 and wave 140. A boss bolt and a mine touch are both higher at 140, by the same ratio as `eDmg`.
- Big Core: three shields, columns at -20, 0, and 20, each 8px wide and 8% of boss HP (was three stacked 14px walls at 10%). The weak point is 16px wide, so the sides of that column are open. A shot that misses a living wall hits the core. A broken wall returns in 11s. The ship aims through the gap.
- Xeno Biomech: five plates, no longer invulnerable. The center plate is fixed over the core, 14px wide, 3.2×`eHP`, and returns in 14s. Side plates sit at ±14 and ±24 with a small sway and stay off the core column. While the center plate is up, the ship sits on it. When it cracks, shots reach the weak point at 2.5×.
- Boss-first targeting and the Maw move-under path are unchanged. The new aim code runs only after those.

## Validation
- Louis's IV2 save (`tests/fixtures/louis-iv2.txt`) imports through `parseImport` and `importText` with no throw. Warps 42, best 120, wave 29, run upgrades 0, Dark Matter over 12 / salv 11 / nano 8 / quantum 8 / warp 5 / idle 4, all seven guns owned, laser plus ring, skin eidolon, 62 deaths.
- Seed 1337, that save, a buyer that spends the credits the run earns. Reached wave 132 in 902s of game time. Deaths stayed 62. Live bosses from wave 100 all died. Big Core at wave 120 died in 10.93s. Xeno Biomech at wave 125 died in 9.37s. Escape timer is 35s.
- Same kit, bosses placed alone at wave 125 with hull and shield full: Big Core 7.2s, Xeno Biomech 6.3s, both kills, 0 deaths. The ship aims through Big Core's gap and onto Xeno's center plate. A broken wall and a broken plate both return to full HP.
- `node tests/run.js --only balance`: min5 wave 20 / 11.133 / 1.052s → wave 21 / 11.133 / 1.197s. min15 wave 33 / 19.967 / 1.731s → wave 33 / 18.867 / 1.532s. min30 wave 44 / 23 / 3.55s → wave 44 / 14.067 / 3.569s. Warp +13 Dark Matter both times. Idle best 8 both times. 0 deaths both times. Guardrails hold. No guardrail edit. The min30 on-screen average dropped because wave 20 and wave 25 end sooner. It is still above 12.
- Headless screenshots of both bosses at wave 125: `artifacts/latescale-core.png`, `artifacts/latescale-bio.png`. Version badge reads v1.2.3.

## Open items
None. The cap, the bend, and the damage rate are in DESIGN.md and STATUS.md so a later day does not put 19% health growth back.

## Next steps
R02 Option Pods (wave 26). R04 Black Hole stays a meta-threat wild card. The owner merges `v1.2.3-late-scaling` by hand, without the `daily-update` label, because `tests/run.js` changed.

## Links
- [DESIGN.md](../DESIGN.md) Late health cap
- [STATUS.md](../STATUS.md)
- tests/fixtures/louis-iv2.txt

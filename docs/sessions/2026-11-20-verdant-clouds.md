---
created: 2026-11-20T09:20:00Z
intent: Ship R03 Verdant Belt nebula clouds at sector 3, and restore idle reach with a little passive hull heal.
durable_promoted: true
---
# Verdant Belt clouds

## Intent
Roadmap R03. A pixel nebula scrolls behind the stars while the Verdant Belt picture is up, gated so a fresh save in the Outer Rim never sees it. One daily update. Not a meta threat.

## Scope
In scope: `clouds` on `verdant-belt`, the draw and scroll in `src/game.js`, passive hull regen, changelog 1.4.0, DESIGN, STATUS, ROADMAP, this note.
Out of scope: new guns, enemies, bosses, upgrades, meta threats, guardrail edits, R04 Black Hole, opening a PR.

## Changes
- Sector `verdant-belt` sets `clouds:{a,b,h}` to `#0d2a1c`, `#2e8b57`, `#6bff8a`. Six hand-authored clouds, 2px blocks, scroll at about 0.8 to 2.9 px/s (far stars are 5). Drawn after the planet and before the stars.
- `buildClouds` runs when the sector index changes. It opens only if that picture has `clouds` and `gateOpen` passes for the current wave (`sec*10+1`). Outer Rim, Nebula Drift, Solar Forge, and The Deep stay clear. Sector 8 cycles back to Verdant Belt and the nebula returns. A best wave of 80 on wave 1 still has no clouds.
- Placement uses a private seed. It does not call `Math.random`, so the balance sim does not move until the regen tweak.
- Hull regen is `maxHull * (0.004 + 0.003 * Nano Repair level)`. The 0.004 is new. One knob. Health, damage, spawn spacing, and the late cap are unchanged.

## Validation
- `npm test` on `main` at `0750b53` before the change: validate-docs ok, unit 8 passed, browser suites smoke, save, migration, gating, balance, death, mega, mines, aim, latescale all passed.
- `npm run sim` before (1.3.0, and again after clouds alone, same line): min5 wave 21 / 11.133 / 1.197s, min15 wave 34 / 17.9 / 1.462s, min30 wave 44 / 14.533 / 2.939s, warp +13 Dark Matter, idle best 8, post-warp best 60, 0 deaths.
- `npm run sim` after (0.4% hull per second): the same active line, idle best 10, 0 deaths. Guardrails hold.
- Headless Chrome, zero console errors. Wave 1 and wave 20: `G.clouds` empty. Wave 21 and wave 25: 6 clouds, each slower than the far stars over 2s. Wave 31: empty. Wave 71 (sector 8, Verdant picture): 6 clouds. Best wave 80 at wave 1: empty.
- `npm test` after the docs: validate-docs ok, unit 8 passed, browser suites all passed. `node scripts/expire-sessions.js`: 0 notes to delete (2026-11-17 notes are inside 7 days).

## Open items
None in the game. Lasting notes are in STATUS, DESIGN, and ROADMAP.

## Next steps
R0X Splitter at wave 27. R04 Black Hole stays a meta-threat wild card.

## Links
- [DESIGN.md](../DESIGN.md) Verdant Belt clouds
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R03

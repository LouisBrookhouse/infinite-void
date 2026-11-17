---
created: 2026-11-17T12:40:00Z
intent: Redraw THE MAW tentacles as thick tapering limbs on the owner's screen-filling silhouette, without changing the fight.
durable_promoted: true
---
# Maw tentacle redraw

> As of v1.1.4, THE MAW is a mega boss and clearing it continues the run. This note is the record of the day it shipped. See DESIGN.md.

## Intent
R33a. Replace the thin wire tentacles with thick organic curves that match the owner's size sketch. HP, phases, gates, attacks and early-wave balance stay as shipped in 1.1.0.

## Scope
In scope: tentacle drawing and posing in `src/content/bosses.js`, one hit-flash field in `src/game.js`, changelog 1.1.1, DESIGN, STATUS, ROADMAP, this note.
Out of scope: new content, HP numbers, phase order, tests, guardrails, and opening the pull request.

## Changes
- Tentacles are filled tapering tubes on a fixed-length chain. Joints are angle-limited and damped, so a limb cannot fold back on itself.
- The body fills the top of the 180x240 playfield: a mantle, a vertical slit eye, two outer limbs that frame the side edges, two mid curves, and two central curves. Phase 4 uses all six. Earlier phases use the same curves with the existing limb counts.
- A hit tints the struck segment. A severed limb leaves a stump; the broken length falls under gravity as one shape, with an ichor burst.
- `applyHit` records which segment was hit (`flashSi`). Limb HP, armor, attack timers and the core rules are untouched.

## Validation
- Headless Chromium at `?final=1&kit=1&mute=1`: phases 1 through 5 completed, the eye opened in phase 3, the kill granted Eidolon once and warped back to wave 1. 61 fps on phase 1. Console errors: none.
- Screenshots: `/opt/cursor/artifacts/maw-phase-1.png`, `maw-phase-4.png`, `maw-sever.png`.
- `npm test`: passed. Docs, 8 unit tests, smoke, save, migration, gating and balance. Balance is unchanged: min5 wave 19 (11.8 on screen, TTK 0.853s), min15 wave 32 (17, 1.588s), min30 wave 44 (14.733, 3.338s), warp +13 DM, idle best wave 10.

## Open items
None. 1.1.1 is not merged and is not live. The orchestrator opens the pull request.

## Next steps
The next daily update is still R01 Mine Layer, the first unticked roadmap item.

## Links
- Branch `daily/2026-11-17-maw-tentacles`
- [DESIGN.md](../DESIGN.md) final-boss section
- [STATUS.md](../STATUS.md)

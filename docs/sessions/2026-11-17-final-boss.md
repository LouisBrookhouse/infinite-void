---
created: 2026-11-17T11:47:27Z
intent: Historical record of shipping THE MAW. As of v1.1.4 it is a mega boss and clearing it continues the run.
durable_promoted: true
---
# THE MAW

> As of v1.1.4, THE MAW is a mega boss and clearing it continues the run. This note is the record of the day it shipped. See DESIGN.md.

## Intent
Owner request, pulled ahead of roadmap R01. A giant multi-part boss at sector 10 wave 1 (wave 91) that lasts five waves, breaks tentacle by tentacle, awards a ship skin once, and auto warp-jumps. Fresh saves must not see it. R01 stays the next unticked item.

## Scope
In scope: bosses registry entry `maw`, skin `eidolon`, a SAVE/STATS equip list, engine hooks for limbs, phases, the finale and the debug query, changelog 1.1.0, DESIGN, STATUS, ROADMAP.
Out of scope: R01 Mine Layer, R13's extra skins, new sector art, guardrail or test edits, merging the PR.

## Changes
- `src/content/bosses.js`: THE MAW, `unlock:{wave:90, sector:10}`, `final:true`, `phaseLock:true`. Five phase limb sets. Segments pooled on the boss. Core armored until the phase exposes it. Phase 3 eye uses `holdKill` so breaking it advances the phase. Phase 5 core death is the kill.
- `src/game.js`: `isFinalWave` (91-95), `nextPhase`, `finishFinal`, limb hits, enemy-bullet pool, 90s phase clock, HUD `FINAL BOSS - PHASE n/5`. Death and timeout call `startWave` on the same wave. Warp bounty is `max(15, floor(dmGain()*0.5))` on top of the normal gain. `S.skin`, `S.skins`, `S.finalKills` added in `fresh()` and filled by `migrate()`. `?final=1` sets wave 91 and `noSave`. `?kit=1` with it sets `G.debugMul`. `?mute=1` mutes.
- `src/content/skins.js`: Eidolon, gate `{sector:10}`. Owned only after the kill.
- `index.html`, `css/style.css`: SAVE/STATS skin buttons. A skin shows if it is the starter, owned, or its gate is open. Only an owned skin equips.
- `src/content/changelog.js`: 1.1.0, 2026-11-17. Early-wave numbers were not changed.
- Docs: DESIGN final-boss contract, STATUS version split, ROADMAP R33 ticked. R01 left open.

## Validation
- `npm test` (validate-docs, 8 unit tests, Playwright smoke, save, migration, gating, balance): all passed. Balance line: min5 wave 19 onScreen 11.8 TTK 0.853s, min15 wave 32 onScreen 17 TTK 1.588s, min30 wave 44 onScreen 14.733 TTK 3.338s, warp +13 DM, idle best 10.
- `npm run sim` (verbose, seed 1337, 8 taps/s) after the change printed the same bands. Before the content change, on this machine, the same command was min5 wave 19 / 11.8 / 0.853s, min15 wave 32 / 17 / 1.588s, min30 wave 44 / 14.733 / 3.338s, warp +13 DM, idle best 10. No early-wave numbers were changed. The sim stalls near wave 44, so it never reaches the Maw.
- Headless Chromium `?final=1&kit=1&mute=1`, boot paused, driven with `__IV.step`: phase 1 has four tentacles; severing them flings segments and shakes; waves then read 92, 93 (eye opens, laser on), 94 (six tentacles), 95 (core exposed). A hull breach on wave 95 respawns phase 5. Setting the phase timer to 0 shows PHASE LOST and respawns phase 5. Killing the phase 5 core sets `finalKills` to 1 and `skins.eidolon` to 1. After the victory, warp lands on wave 1 with warps 4, banner WARP + MAW BOUNTY, and Dark Matter 40 to 131 (the kit's 40 plus normal gain plus the bounty). The SAVE/STATS button equips eidolon. Console errors: none. A one-second requestAnimationFrame sample while unpaused on phase 1 counted 61 frames.
- A fresh page with no query: wave 1, skin vanguard, eidolon not owned, neither eidolon nor maw is a starter, boss rotation for waves 5, 10, 15, 20, 25, 30 is dread, galaga, ufo, core, bio, dread.

## Open items
None that are not already in STATUS.md or ROADMAP.md. Live stays 1.0.1 until auto-merge deploys. The balance sim does not reach wave 91.

## Next steps
Roadmap R01 Mine Layer. Do not retune THE MAW unless a player report or a sim that actually reaches sector 10 says the clock or the HP is wrong.

## Links
Branch `daily/2026-11-17-final-boss`, commit `77c0cb1`, pushed to origin. DESIGN.md section "Final boss: THE MAW".
The PR tool returned GitHub "must be a collaborator" and did not open the pull request. Compare URL: https://github.com/LouisBrookhouse/infinite-void/compare/main...daily/2026-11-17-final-boss?expand=1
Intended title: `Daily: 1.1.0 THE MAW`. Intended label: `daily-update`.

---
created: 2026-11-19T09:26:22Z
intent: Ship R02 Option Pods at wave 26, copying the primary at 40% damage with no added homing.
durable_promoted: true
---
# Option Pods

## Intent
Roadmap R02. Two trailing orbs mirror the primary gun at 40% damage, gated so a fresh save never has them. In THE MAW they copy straight shots and do not add homing. One daily update. Not a meta threat.

## Scope
In scope: the `pods` ship upgrade, the `shootGun` copy, the store icon, changelog 1.3.0, DESIGN, STATUS, ROADMAP, the pinned version string in `tests/run.js`, this note.
Out of scope: new guns, enemies, bosses, meta threats, guardrail edits, R03 sector art, opening a PR.

## Changes
- Upgrade `pods`, max 1, base cost ¢1,500, unlock `{wave:26}` (best wave). Level 0 on a fresh save and after migrate. Warp Jump clears it with the other ship upgrades.
- `shootGun` copies each primary bullet from two trail orbs at the same vx/vy and 40% damage. Pierce bullets get a new `hits` set. Homing is copied only when the primary bullet already has it. Secondary shots are not copied.
- Estimated DPS in the stats tab and `playerST` includes the 80% primary add (two orbs at 40%) once the upgrade is owned.
- A ¢36,000 price was not bought until the wave-44 stall, so the orbs never showed up in sector 3. ¢1,500 is bought around wave 30 by the greedy sim. No other balance knob moved.

## Validation
- `npm run sim` before (1.2.3): min5 wave 21 / 11.133 / 1.197s, min15 wave 33 / 18.867 / 1.532s, min30 wave 44 / 14.067 / 3.569s, warp +13 Dark Matter, idle best 8, 0 deaths.
- `npm run sim` after (¢1,500): min5 wave 21 / 11.133 / 1.197s, min15 wave 34 / 17.9 / 1.462s, min30 wave 44 / 14.533 / 2.939s, warp +13 Dark Matter, idle best 8, 0 deaths. Minutes 1-12 match. Post-warp best at 10 minutes is wave 60 (was 58). Guardrails hold.
- Headless check, zero console errors. Fresh save: Option Pods locked, "UNLOCKS AT WAVE 26", level 0. Buying at best wave 26 makes one pulse into three bolts, vx 0, copies at 0.4 damage, not homing. The homing secondary stays two missiles. In THE MAW the three pulse bolts stay vx 0 with homing 0, and the two missiles stay homing. A hull breach clears the upgrade.
- `npm test`: validate-docs ok, unit 8 passed, browser suites smoke, save, migration, gating, balance, death, mega, mines, aim, latescale all passed. Balance line matches the after sim above.
- `node scripts/expire-sessions.js`: 0 notes to delete.
- `tests/run.js` changes one expected version string, `1.2.3` to `1.3.0`. A PR labelled `daily-update` fails the protected-path check. Merge without that label.

## Open items
None in the game. The version pin in `latescale` has to move again on the next version bump. That is in STATUS.md.

## Next steps
R03 Verdant Belt sector art. R04 Black Hole stays a meta-threat wild card.

## Links
- [DESIGN.md](../DESIGN.md) Option Pods
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R02

---
created: 2026-11-18T12:09:11Z
intent: Keep the ship on a boss, and make THE MAW fire straight up like every other fight.
durable_promoted: true
---
# Boss targeting

## Intent
Louis: with a boss on screen the ship still chased the closest smaller enemy, and in THE MAW primary shots auto-tracked the tentacles instead of the ship sitting underneath and firing straight. 1.2.2 is one targeting model. Boss first. Primary guns are not turned toward a part.

## Scope
In scope: `pickTarget` and the shot spawn in `src/game.js`, changelog 1.2.2, DESIGN targeting rules, STATUS, ROADMAP, the `aim` suite in `tests/run.js`, this note.
Out of scope: new content, tentacle HP, homing-missile or drone rules, guardrail edits, opening a PR.

## Changes
- While a boss is on screen it is the auto-aim and auto-move target, at any tier. A mine field does not override it. The only exception is an enemy overlapping the hull (about 10 by 12px).
- The Maw redirect that turned primary bullets toward a part is gone. The ship moves under the current point and fires its normal pattern. That point is a live tentacle segment (lower health, then nearer), then a living eye, then the mouth.
- Homing missiles still curve. Drones still pick a live enemy and shoot at its aim point. Neither gained a Maw-only rule.
- Tentacle positions were left as they are. Tips already hang inside the lane, and straight shots from underneath clear all five phases.

## Validation
- `node tests/run.js --only aim`: passed. A boss outranks a closer invader and a mine field, the ship slides toward the boss, an enemy on the hull wins, pulse bolts leave the ship with vx 0, homing missiles stay homing, and the idle kit clears the Maw.
- Headless `?mega=1&kit=1&mute=1`, zero taps, seeds 1337, 7 and 42: each cleared all 5 phases in 160s, 0 deaths, `finalKills` 1, wave 96. 1.1.2 cleared in 180s, 182s and 184s. 160s is inside 1.5× of that 3 minute fight. No tentacle move was required.
- `npm run sim`, 1.2.1 on main to 1.2.2: min5 wave 21 / 10.8 / 1.099s → wave 20 / 11.133 / 1.052s. min15 wave 33 / 17.867 / 1.832s → wave 33 / 19.967 / 1.731s. min30 wave 45 / 14.833 / 3.852s → wave 44 / 23 / 3.55s. Warp +13 Dark Matter both times. Idle best 7 → 8. 0 deaths both times. Minutes 1-2 match. No number tweak. Guardrails passed.
- Screenshots: `/opt/cursor/artifacts/boss-under-target.png` (Mothership, minions around, ship underneath), `/opt/cursor/artifacts/maw-under-tentacle.png` (phase 1, ship under a tentacle, pulse going straight up).

## Open items
None in the game. `tests/run.js` is protected. A `daily-update` label fails that check. Recorded in STATUS.md. Open the PR without the label.

## Next steps
R02 Option Pods (wave 26). R04 Black Hole stays a meta-threat wild card.

## Links
- [DESIGN.md](../DESIGN.md) Targeting
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R33b

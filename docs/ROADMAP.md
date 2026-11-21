# Roadmap: the daily update backlog

How to use it: each day the agent takes the **first unticked item** (skipping only items whose prerequisites haven't shipped), ships it as ONE small gated update plus a rebalance, and ticks it here as `- [x] ... (v1.N.0, YYYY-MM-DD)`. The agent may add new items at the bottom or split big ones, and must keep each item small enough for a single day. The order runs from gates the player reaches early to gates they reach late, with meta systems once players start warping. An owner request can pull a later item forward. On 2026-11-17 the owner pulled THE MAW (R33) ahead of R01. R01 shipped in 1.2.0 and was reworked into a mine line in 1.2.1. 1.2.2 keeps the ship on the boss. R02 shipped in 1.3.0. R03 shipped in 1.4.0 and the flat clouds were redrawn as a dithered haze in 1.4.1. 1.4.2 repaints the Mine Layer, the mines, Option Pods, Big Core shields, Xeno plates, and THE MAW, and puts Big Core and Xeno back on the pre-1.2.3 shield and plate behaviour. The health cap stays. R0X shipped in 1.5.0. 1.5.1 stops shots from catching the facets before they fly, and repaints the pyramid in flat bands. The next unticked item is R04, which is a meta threat, so a normal day skips it and takes R05. R30 Void Leviathan is a different boss. An item tagged `[meta threat]` is a wild card: on a normal day, skip it and take the next unticked item that is not one. About one day in ten, never two days in a row. See DESIGN.md, "Meta threats".

The game does not end. There is no final boss and no end state. Bosses have tiers (standard, elite, mega, meta, and room for more). Future days can add bosses of any tier, including more mega bosses and meta threats, and sectors past 10. See DESIGN.md.

Tags: **[enemy] [gun] [boss] [upgrade] [sector] [art] [mechanic] [meta] [mission] [qol] [new ship types] [meta threats]**

## Sector 3-4 (waves 21-40): where content currently thins out
- [x] **R01 [enemy] Mine Layer** (wave 24). A layer sweeps the lane and lays a line of mines. Shooting one chain-detonates the row. Uses `ai:'custom'`. First shipped as a drifting dropper in 1.2.0, reworked into the line in 1.2.1. (v1.2.0, 2026-11-18; rework v1.2.1, 2026-11-18)
- [x] **R02 [gun] Option Pods** (wave 26). Gradius "options": 2 trailing orbs that mirror your primary's shots at 40% damage. A new gun-like upgrade that hooks into `shootGun`. (v1.3.0, 2026-11-19)
- [x] **R03 [art] Sector art: Verdant Belt nebula clouds** (sector 3). A dithered haze in the sector greens, same Bayer shading as the planets, scrolling behind them. The v1.4.0 flat clouds were redrawn in v1.4.1. (v1.4.0, 2026-11-20; art v1.4.1, 2026-11-20)
- [ ] **R04 [meta threat] Black Hole** (rare event, gate wave 100). a meta threat is a rare event that occurs outside the the gameplay rectangle, the first one will be a black hole, that appears to the left or right of the screen, that sucks all enemies of a wave towards it slowly, then disappears. the enemies will be drawn towards it and disappear once they fully leave the game area. Not the R29 gun. Wild card, not a normal day. See DESIGN.md.
- [x] **R0X [enemy] Splitter** (wave 27). A pyramid ship that splits into 3 arrowhead darts. The facets fly apart, then become the darts. One joins each non-boss wave from 27. The pieces cannot be shot until they are darts, and the pyramid is flat sector bands. (v1.5.0, 2026-11-21; polish v1.5.1, 2026-11-21)
- [ ] **R05 [upgrade] Afterburner** (wave 28, credits). Raises the ship's tracking speed and dodge, so it moves faster toward targets and away from bullets.
- [ ] **R06 [boss] Twin Serpent** (wave 30, appended to the rotation). Two segmented worms weaving in sine waves, each head a weak point. Inspired by Life Force.
- [ ] **R07 [mechanic] Power-up capsule bar** (wave 32). Gradius-style: capsules fill a bar, and tapping the bar spends it on the highlighted buff (speed, missile, shield).
- [ ] **R08 [enemy] Turret Carrier** (wave 33). A slow heavy that deploys 2 stationary turrets which aim at the player.
- [ ] **R09 [gun] Ricochet Disc** (wave 35). Bouncing discs that rebound off the screen edges up to 3 times.
- [ ] **R10 [art] Sector art: Solar Forge heat-shimmer stars and a sun flare** (sector 4).

## Sector 5-6 (waves 41-60) and first warps
- [ ] **R11 [mission] Mission system v1** (warps 1). Three rotating missions ("kill 200 divers", "beat a boss with no hull damage", "reach wave 30") that reward Dark Matter. Defines the `missions.js` contract and the UI tab.
- [ ] **R12 [mission] Mission pack: boss hunter** (bosses 10). Boss-specific missions.
- [ ] **R13 [art] Ship skin selector plus 2 skins** (warps 1). A skin picker in SAVE/STATS. Adds "Viper" (bosses 5) and "Ikaruga White" (warps 2). Cosmetic only, saved in `S.skin`.
- [ ] **R14 [enemy] Polarity Drone** (wave 42). Ikaruga-inspired: alternates white and black shields, and only takes damage in its vulnerable phase.
- [ ] **R15 [boss] Hive Queen** (wave 45, appended). Spawns larva waves and has 3 egg-sac weak points that each disable one attack when destroyed.
- [ ] **R16 [upgrade] Dark Matter: Salvage Magnet** (warps 2). Capsule drop chance +, auto-collect radius.
- [ ] **R17 [sector] Sector 6: Ion Storm** (sector 6). Lightning flashes briefly reveal cloakers, plus new sector bias weights.
- [ ] **R18 [enemy] Bullet Weaver** (wave 48). Touhou-lite: fires slow spiral rosettes, low HP, high reward.
- [ ] **R19 [gun] Plasma Lance** (wave 50). Charge-and-release piercing beam that widens with charge time (R-Type wave cannon cousin).
- [ ] **R20 [mechanic] Elite enemies** (wave 52). 5% of enemies spawn Elite: gold outline, x4 HP, x6 reward, one random trait (fast, armored or splitting).

## Deeper meta (multiple warps)
- [ ] **R21 [meta] Warp Milestones** (warps 3). Permanent perks at 3, 5 and 10 warps (start with a free secondary gun, +1 drone, Auto-buy upgrades toggle).
- [ ] **R22 [qol] Auto-buyer for ship upgrades** (warps 3, toggled in the SHIP tab). Buys the cheapest affordable upgrade every few seconds.
- [ ] **R23 [sector] Sector 7: Graveyard Fleet** (sector 7). Derelict hulks drift down as cover that blocks both sides' bullets.
- [ ] **R24 [boss] Fortress Core v2** (wave 55, appended). A rotating ring of 8 shield walls around the core (Gradius Big Core Mk-III homage).
- [ ] **R25 [art] Sector art: The Deep: bioluminescent particles and a dark vignette** (sector 5).
- [ ] **R26 [enemy] Phase Shifter** (wave 58). Teleports in short hops, leaving a decoy afterimage.
- [ ] **R27 [meta] Research lab** (dmTotal 50). Spend Dark Matter on timed research (real-time hours) for small permanent boosts.
- [ ] **R28 [mission] Daily challenge seed** (warps 2). A fixed-seed daily wave modifier ("double invaders", "snipers only") with a DM reward.
- [ ] **R29 [gun] Black Hole Bomb** (wave 60). A slow orb that pulls enemies in, then implodes. Long cooldown, secondary-friendly.
- [ ] **R30 [boss] Void Leviathan** (wave 65, appended). A screen-wide multi-segment boss that scrolls through, and each segment is a mini-phase.
- [ ] **R31 [mechanic] Endless "Rift" mode** (warps 5). An optional side mode with escalating waves and a leaderboard-free personal best.
- [ ] **R32 [qol] Statistics page v2**: per-gun kills, boss times and run history (warps 1).
- [ ] **R33 [ship] new ship upgrade page, with modular parts, the player can find blue prints / ship parts when killing bosses.
- [ ] **R34 [art] new ship skins that can be unlocked via challenges

## Meta threats (rare wild cards)
Skip these on a normal day. About one daily update in ten, and never two days in a row. Still one small gated update on the day that ships one. See DESIGN.md, "Meta threats". R04 above is the Black Hole and stays where the owner wrote it.

- [ ] **R35 [meta threat] [boss] Rect Breaker** (wave 150, warps 2). Placeholder name. A `meta`-tier boss that arrives from outside the play rect. It spawns at the top and shrinks the rect as it appears. From outside the rect it smashes an arm down onto the rect and sends shockwaves. Beams from its mouth come through the rect. The ship shoots the arms where they hit the rect and linger. The last damage phase is its head falling into the rect. Eldritch, not the in-rect pixel style. Not during a mega boss unless a later design says so.


## Shipped
- [x] **F04 [boss] Mega bosses, no ending** (v1.1.4, 2026-11-17). Boss tiers. THE MAW is tier 3. Clearing it continues the run and pays a once-per-run bounty. Waves continue past 95.
- [x] **F03 [mechanic] Death is an emergency warp** (v1.1.3, 2026-11-17). A hull breach runs a Warp Jump and pays the same Dark Matter. No wave retreat. Dying to THE MAW does not restart the phase or pay the bounty.
- [x] **R33b [boss] Maw, wall of flesh** (v1.1.2, 2026-11-17). Four Hungry tentacles, two eyes, a mouth. The ship sits under the live part and fires straight (v1.2.2). Same HP budget and gates as R33.
- [x] **R33a [art] Maw tentacles** redraw. Thick tapering limbs on the screen-filling silhouette. Same HP, phases and gates as R33. (v1.1.1, 2026-11-17)
- [x] **R33 [boss] THE MAW** (sector 10, waves 91-95). Owner request, shipped ahead of R01. Tier-3 mega boss, five phases, Eidolon skin. Clearing it continues the run (v1.1.4). Not R30. (v1.1.0, 2026-11-17)
- [x] **F01 Fix: reset no longer marks patch notes unread** (first pipeline check of auto-merge) (v1.0.1, 2026-11-17)
- [x] **R00 Launch as INFINITE VOID**: data-driven registries, gates, patch notes, CI guardrails, auto-deploy (v1.0.0, 2026-11-17)

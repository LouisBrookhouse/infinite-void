# Roadmap: the daily update backlog

How to use it: each day the agent takes the **first unticked item** (skipping only items whose prerequisites haven't shipped), ships it as ONE small gated update plus a rebalance, and ticks it here as `- [x] ... (v1.N.0, YYYY-MM-DD)`. The agent may add new items at the bottom or split big ones, and must keep each item small enough for a single day. The order runs from gates the player reaches early to gates they reach late, with meta systems once players start warping. An owner request can pull a later item forward. On 2026-11-17 the owner pulled THE MAW (R33) ahead of R01. R01 stays the next unticked item. R30 Void Leviathan is a different boss.

Tags: **[enemy] [gun] [boss] [upgrade] [sector] [art] [mechanic] [meta] [mission] [qol]**

## Sector 3-4 (waves 21-40): where content currently thins out
- [ ] **R01 [enemy] Mine Layer** (wave 24). Drifts across the top dropping slow proximity mines that explode into an 8-way burst when shot or touched. Inspired by Defender/Gradius. Uses `ai:'custom'`.
- [ ] **R02 [gun] Option Pods** (wave 26). Gradius "options": 2 trailing orbs that mirror your primary's shots at 40% damage. A new gun-like upgrade that hooks into `shootGun`.
- [ ] **R03 [art] Sector art: Verdant Belt nebula clouds** (sector 3). Procedural pixel cloud layer parallaxing behind the stars, colour-keyed per sector.
- [ ] **R04 [enemy] Splitter** (wave 27). A pyramid ship that splits into 3 small fast darts on death (Asteroids-style split, but aimed).
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

## Shipped
- [x] **R33a [art] Maw tentacles** redraw. Thick tapering limbs on the screen-filling silhouette. Same HP, phases and gates as R33. (v1.1.1, 2026-11-17)
- [x] **R33 [boss] THE MAW** (sector 10, waves 91-95). Owner request, shipped ahead of R01. Five-phase tentacle boss, Eidolon skin, auto Warp Jump with a Dark Matter bounty. Not R30. (v1.1.0, 2026-11-17)
- [x] **F01 Fix: reset no longer marks patch notes unread** (first pipeline check of auto-merge) (v1.0.1, 2026-11-17)
- [x] **R00 Launch as INFINITE VOID**: data-driven registries, gates, patch notes, CI guardrails, auto-deploy (v1.0.0, 2026-11-17)

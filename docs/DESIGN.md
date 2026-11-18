# Design

## Pillars
1. **Chunky retro pixels.** A 180x240 canvas scaled with nearest-neighbour. Sprites are hand-authored pixel rows (left half, auto-mirrored) in a small sci-fi palette. No smoothing, no image assets beyond tiny ones.
2. **The screen is never empty.** Swarms stay dense and enemies take real hits to kill. Upgrades should *keep pace with* the curve, never trivialise it.
3. **Idle-friendly, tap-rewarding.** The ship auto-fires and plays itself, and tapping (especially weak points) is meaningfully stronger.
4. **Prestige is the release valve.** Progress stalls in a run, and Warp Jump (from wave 20) converts it into permanent Dark Matter power.
5. **Infinite but gated.** New content arrives daily, always behind a progression gate, so a new player sees a small clean game that unfolds.
6. **Classic shmup DNA.** Galaga, Space Invaders, Gradius, R-Type, Contra, Asteroids, Defender, Ikaruga and Touhou are the reference pool for new ideas.
7. **Saves are sacred.** Old saves always load.

## Progression gates
Every content entry has an `unlock` object. Its keys are ANDed (see `src/core.js`).

| Key | Meaning | Checked against |
|---|---|---|
| `wave: n` | wave >= n | **best wave ever** for store/meta items (upgrades, guns, Dark Matter, features, skins). **Current wave** for spawn content (enemies, bosses) |
| `sector: n` | sector >= n (sector n = waves 10(n-1)+1 to 10n) | same as `wave` |
| `warps: n` | completed Warp Jumps >= n | lifetime |
| `bosses: n` | bosses destroyed >= n | lifetime |
| `dmTotal: n` | Dark Matter ever earned >= n | lifetime |

`{wave:1}` is the starter gate. Only the starter set listed in `tests/run.js` (`STARTER`) may use it. **All new content must be gated beyond a fresh save.**

### Gate ladder (where things unlock today)
| Gate | Unlocks |
|---|---|
| wave 1 | Pulse Blaster, Pulse Core, Hull Plating, Target Laser, Scouts, Outer Rim sector |
| wave 2-10 | Rapid Cycler (2), Dual Fighter and Fighters (3), Divers (4), Targeting AI (4), Nano Repair and Invader grid and first boss Dreadnought (5), Spread Gun and Spread Array (6), Kamikazes (7), Escort Drones (8), Homing Missiles and Cruisers (9), Deflector and Boss Galaga (10) |
| sector 2 (wave 11-20) | Nebula Drift. Secondary gun slot and Shielded Guards (12), Laser (13), Rocks (14), Mothership (15), Snipers (16), Ring Laser (17), Big Core (20) |
| wave 20 | **Warp Jump** available (run-based: clear wave 20 this run) |
| sector 3+ | Verdant Belt (21), Wave Cannon (21), Cloakers (22), Mine Layers (24), Xeno Biomech (25), Solar Forge (31), The Deep (41) |
| warps 1 | Dark Matter upgrades (Overcharge, Quantum Salvage, Nanohull, Chrono Core, Warp Drive, Auto-Foundry) |
| sector 10 (wave 91) | THE MAW, a mega boss on waves 91-95. The run continues at wave 96. Eidolon appears in SAVE/STATS once best wave reaches sector 10, and can be equipped only after the kill |
| future | Missions, more skins (R13), sector modifiers, meta threats (wave 100 and deeper), and the rest of the [roadmap](ROADMAP.md). Use warps/bosses/dmTotal gates for meta systems so they appear after the first prestige |

Guideline: new **combat content** goes where the current content runs out (waves 25-60, sectors 3-6). New **meta systems** gate on `warps` so the first run stays simple. A capstone the owner asks for can sit past the stall (THE MAW at sector 10). It still needs a gate a fresh save cannot open.

### Mine Layer
From the current wave 24, every 3rd wave that is not a boss sets `G.minePass`. The banner reads MINE LAYERS on wave 24 and MINE FIELD after that, and wave 24 toasts `NEW THREAT: MINE LAYERS`. One `miner` spawns. `miner` and `mine` both have weight 0 and `counts: false`. A mine kill pays a small reward and does not advance the wave, so a field cannot soft-lock the clear.

The layer enters from one side and flies a fixed height, dropping 12 stationary mines on a 14px spacing (centers from x 8 to 162). The sprites overlap into a barrier. From wave 36 the same layer makes a second pass at y 118, the other way. It leaves without a bounty. At most 24 mines are alive. A mine lasts 13.5s, then flashes and despawns with no burst, no reward, and no chain.

Mine HP is 0.16× the wave baseline. A shot or a touch detonates it. `onDeath` fires 4 diagonal pellets (`bossFire` at 32px/s, damage mult 0.1, each pellet 0.14×`eDmg`). A touch also deals `dmg`×`eDmg` (0.45). A detonation fuses any other mine within 16px that is at least 0.25s old, so the line can finish forming and a hit then walks the row. Once 6 or more mines are up, and no boss is on screen, the guns aim at the mine nearest the ship. An enemy below y = H-75 still wins, and fewer than 6 mines leaves the guns on the lowest real enemy. A boss outranks the field. See Targeting.

Sprites use fixed palette letters, not sector X/Y. The layer is a 25×11 barge with an orange rack. A mine is a 15×13 spiked circle with a blinking core and a proximity ring inside 40px.

### Targeting
One model for every fight. The ship moves horizontally toward the aim x. Primary guns fire their normal patterns from the ship. They are not turned toward a part.

1. An enemy overlapping the hull (within about 10 by 12px) is the target. That is the only time something on top of the ship wins.
2. A boss on screen wins, at any tier, over minions and over a mine field. The aim point is the body, or the current damageable part: a live tentacle segment (lower health, then nearer), then a living eye, then the mouth. On Big Core and Xeno Biomech the aim x is a gap that still crosses the weak point. If a plate covers that column, the ship sits on the front plate until it breaks. Primary guns still fire straight.
3. With no boss, an enemy below y = H-75 wins, then a mine field of 6 or more (the mine nearest the ship), then the lowest other enemy.

Homing missiles curve toward the nearest target on their own. Drones pick a live enemy and fire toward its aim point. Neither has a boss-only rule or a Maw-only rule.

## Content registry contracts
Each file in `src/content/` documents its fields in a header comment. Summary:

- **changelog.js**: newest first, `{version, date, title, added[], balance[], fixed[]?, gate?}`. The top entry is the game version (the only place it lives).
- **sectors.js**: `{id, name, unlock:{sector:n}, scheme:{X,Y}, bg, planet:[3], bias:{enemyId:mult}}`. Position must equal its sector number. The list cycles after the last entry.
- **skins.js**: `{id, name, unlock, half:[rows]}`. `S.skin` is the equipped id. `S.skins[id] = 1` means owned. SAVE/STATS lists a skin when it is the starter, owned, or its gate is open, and only an owned skin can be equipped. A boss award sets the owned flag once; the registry `unlock` is what keeps it off a fresh save.
- **icons.js**: `id -> [rows]`. `ship` and `drone` are special icons.
- **upgrades.js**: credit upgrades `{id, name, desc, icon, base, g, max?, req?, unlock, show(stats, level)}`, with effects in `calcStats()`. Dark Matter `{id, icon, name, desc, base, g, max?, unlock, show(level)}`.
- **guns.js**: `{id, name, desc, icon, R, rm, cost, unlock, proj(m), fire(A,g), sfx(A), draw?, charge?, sfxGap?}`. The engine derives per-shot damage from `R/rm/proj`, so total DPS is comparable across guns.
- **enemies.js**: `{id, name, threat?, unlock, weight, late?, squad?, big?, hp, rew, dmg, spd, fire, shots, ai, shield?, sprite, init?, update?, onDeath?, draw?}`. Built-in `ai`: roam, dive, march, kami, rock, sniper, cloak. Use `custom` plus `update(e,dt,A)` for new behaviours. `onDeath(e,A)` runs once from `killEnemy`. `draw?(e,A,ctx)` paints over the sprite. Weight `0` is never picked by the spawner.
- **bosses.js**: `{id, name, tier, unlock (wave multiple of 5), hp, body, escorts, palette?, half, setup(e,A), update(e,dt,A), draw?(e,A,ctx), phaseLock?, fromWave?, phases?}`. `tier` is `standard`, `elite`, `mega`, or `meta` (the list stays open). A missing tier counts as `standard`. The every-5 rotation cycles through **standard** bosses whose gate is open at the current wave, in list order. Elite, mega, and meta bosses are not in that rotation. **Append new standard bosses at the end** so existing waves keep their bosses. Parts may be `{kind:'limb'}` or `{kind:'core'}` as well as weak, wall and block. `phaseLock` skips the automatic 50% enrage. A mega boss sets `fromWave` and `phases` for the waves it occupies. A `meta` boss is a meta threat: see "Meta threats". The registry has no `meta` entry yet.
- **features.js**: mechanic flags `{id, name, desc, unlock, announce?}`, checked in the engine with `feat(id)`.
- **missions.js**: reserved, and the contract gets fixed by the roadmap item that implements it.

The **`A` API** (content hooks) gives `W, H, TAU, rnd, clamp, pick, fmt, G, S, ctx, eDmg, eHP, aimAt, bossFire, mkEnemy, spawnInvaderGroup, damagePlayer, addText, addPart, banner, sparks, explode, SFX, wallsAlive, tone, noise, nextPhase, kill`. `nextPhase(e)` advances a mega boss one wave and rebuilds it. `kill(e)` runs `killEnemy` once. Extend the API rather than reaching into engine internals.

**Save compatibility:** the key is `voidbreaker_save_v1` (legacy name, never change it). New persistent state goes in `fresh()` with a default, and `migrate()` copies known fields and fills the rest. New upgrade, gun and Dark Matter ids get level 0 automatically. `S.skin`, `S.skins` and `S.finalKills` are persistent. `S.finalKills` is the lifetime count of mega-boss clears. The key name stays so old saves load. `S.megaPaid` is 1 after this run has taken a mega-boss bounty. Warp Jump, including a hull breach, clears `megaPaid` and does not clear `finalKills` or owned skins. Reset All does, because it loads `fresh()`.

## No ending
The game is endless. There is no final boss and no end state. Waves continue past 95, sectors continue past 10 (sector art cycles after the five pictures that exist), and a later day can add bosses of any tier, including more mega bosses and meta threats. Do not treat THE MAW, or the latest set-piece, as the last content.

## Boss tiers
Every boss has a `tier` field. The number is the tier; the string is what the registry stores.

| Tier | `tier` | What it is | Who is live |
|---|---|---|---|
| 1 | `standard` | The every-5-waves rotation. Append new ones at the end of that list. | Dreadnought, Boss Galaga, Mothership, Big Core, Xeno Biomech |
| 2 | `elite` | A sector or set-piece boss. Not part of the standard rotation. Spawn it from its own gate when that day ships. | None yet |
| 3 | `mega` | A multi-phase, multi-wave encounter, gated by sector or warp. `fromWave` and `phases` mark the waves it occupies. | THE MAW, waves 91-95 |
| 4 | `meta` | A meta threat that is a boss. It lives outside the play rect and is damageable only where it intrudes. Not in the rotation. | None yet. Rect Breaker is the first planned one (R35) |

A missing `tier` counts as `standard`, so an old entry still rotates. Elite, mega, and meta bosses are left out of `bossFor`. The list stays open: a later tier can sit above `meta` without an end state. The same boss id is never renamed. Nothing with `tier:'meta'` is in the registry yet.

## Mega boss: THE MAW
Sector 10 wave 1 is wave 91 (`sector = floor((wave-1)/10)+1`). `isMegaWave` is true while a mega boss's `fromWave` span covers the wave. THE MAW (`id: 'maw'`, `tier:'mega'`, `fromWave:91`, `phases:5`) occupies waves 91-95 instead of a normal wave or the rotating boss. The registry gate is `{wave:90, sector:10}`: wave 90 is a multiple of 5, and sector 10 stays closed until wave 91, so the boss is out of the rotation and off a fresh save. Wave 96 is an ordinary wave. Wave 100 is a standard boss again.

One boss persists across the five waves. The HUD reads `MEGA BOSS - PHASE n/5` with `n = wave - fromWave + 1`. A phase ends when its break condition calls `nextPhase` (or, on phase 5, when the core dies). The wave counter advances then. No regular spawns run during the encounter.

Each phase has a 90 second clock. A hull breach does not restart the phase. It is an emergency Warp Jump, same as any other wave, with no Maw bounty and no Eidolon. A timeout still restarts **that phase** at full health: the wave number does not drop, and earlier phases stay cleared. Outside a mega boss, a boss that escapes still drops one wave. A hull breach never does.

The core is armored while the current phase still has living tentacles (`bodyMult` 0, shots print ARMORED). The ship uses the same targeting as every other fight: it sits under the current part and primary guns fire straight up. That part is a live tentacle segment (lower health, then nearer), then a living eye, then the mouth. Phase 3 has no tentacles, so the two eyes are the targets, and the mouth stays armored until both eyes burst. That calls `nextPhase` and does not end the fight. Phase 5 leaves the mouth at 42% damage taken while any tentacle lives, then at full damage, and the aim point becomes the mouth once the tentacles are gone. Killing that mouth clears the encounter. Homing missiles and drones keep their normal behaviour. Tentacle tips hang inside the lane, so a straight shot from underneath can reach every segment.

| Phase | Wave | What breaks | Pattern |
|---|---|---|---|
| 1 | 91 | 4 Hungry tentacles, 5.5×eHP each (22×eHP) | Tip fans, one slam at a time. Core armored |
| 2 | 92 | 4 armoured Hungry, 6×eHP at 0.75 damage taken | Spore shots, scout minions, slams |
| 3 | 93 | 2 eyes, 11.5×eHP each (23×eHP) | Each open eye sweeps a laser. Both eyes burst to reach phase 4 |
| 4 | 94 | 4 fast Hungry, 6.4×eHP each (25.6×eHP) | Faster tip fans, fighter minions, slams. The wall sits lower |
| 5 | 95 | 4 Hungry, 4.4×eHP each, then the mouth at 16×eHP | Spinning bullet ring, tip bolts. Mouth death clears the encounter |

The body is a wall of flesh across the full width of the top of the playfield: ribbed meat, veins, teeth, two bloodshot eyes and a central mouth. Four thick Hungry tethers hang from the wall and end in snapping mouths. They are jointed segments on a fixed-length chain, pooled on the boss, and each segment's hitbox covers that segment. A severed tether leaves a stump; the broken length tumbles away in one piece. Idle contact damage is the tip only; a slam hits along the arm. Enemy bullets during the fight are pooled and capped. The hit-point totals above are the same budget as 1.1.1.

On the clear: `S.finalKills` increments, Eidolon is granted once (`S.skins.eidolon`), and a short `MAW FALLS` beat plays. The run then continues at the next wave (wave 96 when auto-advance is on). It does not Warp Jump. The bounty, once per run, is `max(15, floor(dmGain() × 0.5))` Dark Matter added straight to `S.dm` and `S.dmTotal`, plus `floor(eRew(wave) × 20)` credits. `S.megaPaid` remembers the payout. A second clear in the same run, including farm mode repeating wave 95, pays nothing more. Warp Jump and a hull breach set `megaPaid` back to 0, so the next run can earn it once. The bounty is never larger than that formula, and a death still pays only `dmGain()`. The skin is not granted twice. Reset All locks it again. Later runs can fight the Maw again. A voluntary warp after the clear pays normal `dmGain()` only, with no second bounty.

`?mega=1` jumps to the mega boss's `fromWave` (wave 91) and sets `noSave`, so that tab cannot write the save. `?final=1` is the same jump, kept as an alias. `?kit=1` (only together with `?mega=1` or `?final=1`) loads a strong kit and sets `G.debugMul` from `eHP * 24/25` over primary DPS, high enough for that idle kit to finish each Maw phase inside the 90 second clock. Real runs and the balance sim leave `debugMul` at 1. `?mute=1` mutes that session. Sector 10 still uses the cycling sector art (THE DEEP), because only five sector pictures exist.

## Meta threats
A meta threat is defined by how it meets the play area: the rect in the middle of the screen where the game happens. That rect is the game world. A meta threat lives outside it. It arrives from outside the screen boundaries, then acts on the rect. It is not another sprite inside the world.

It can shrink the rect, warp it, crack it, shake it, tilt it, pull on it, or pierce it. It becomes damageable only where it intrudes into the rect. Parts that stay outside the rect are not targets.

The art is eldritch and fifth-dimensional, and it should not match the pixel sprites inside the rect. Impossible geometry, colour inversion, chromatic aberration, and a scale that does not fit in the rect are the tools. A player should read it as not of this game. Inside the rect, the chunky nearest-neighbour look stays.

Meta-tier bosses are meta threats. `tier:'meta'` sits above `mega`. The tier list stays open above that.

### Examples
**Black Hole** (roadmap R04, Louis's text). A rare event outside the gameplay rectangle. It appears to the left or right of the screen, sucks the enemies of that wave toward it slowly, then disappears. Enemies are drawn toward it and disappear once they fully leave the game area. This is not the R29 Black Hole Bomb gun.

**Rect Breaker** (roadmap R35, placeholder name). A meta-tier boss. It spawns at the top of the game area and shrinks the rect as it appears. From outside the rect it smashes an arm down, hits the rect, and sends shockwaves. It fires beams from its mouth and those beams come through the game rect. The ship beats it by shooting the arms where they hit the rect and linger. The last damage phase is when its head falls into the game rect.

### When they show up in a run
Not implemented. The suggested roll, once a day ships it:

Roll once at the start of a wave, not every frame.

- If a meta threat is already active, the chance is 0.
- If this wave is a mega boss and the chosen threat is not marked to overlap one, the chance is 0. None are marked that way yet.
- Otherwise `p = 0.004` through wave 100. Past wave 100, `p = min(0.02, 0.004 + 0.0002 * (wave - 100))`. That is 0.4% at wave 100, 0.6% at wave 110, 1.4% at wave 150, and a 2% cap from wave 180.

One meta threat at a time. When the roll hits, pick among threats whose gate is open. Suggested weights: Black Hole 8, Rect Breaker 1. A fresh save cannot open either gate.

Suggested gates: Black Hole `{wave:100}` (current wave, so it cannot appear before wave 100 of a run). Rect Breaker `{wave:150, warps:2}`. Both stay closed on a fresh save.

### Shipping cadence
Meta-threat updates are wild-card days. They add something that is outside the box, literally. They stay rare: about one daily update in ten, and never two meta-threat days in a row. The day is still exactly one small gated update. If the piece is bigger than a day, split it. The first Rect Breaker slice is the play rect as a moving rectangle, with a test that it returns to its rest size, before the creature exists.

On a normal day, if the first unticked roadmap item is tagged `[meta threat]`, skip it and take the next unticked item that is not. A wild-card day is allowed when the previous shipped update was not a meta threat and fewer than about one in ten shipped updates are. The owner can pull one forward.

### For the day that builds it
The play rect is implicit today: the 180×240 canvas is the world. A meta threat needs room outside that rect.

Two ways to draw it, both fine if the game still runs from `file://` with no new libraries and no network:

- Grow one canvas to the viewport and draw the play rect inset, so a limb can cross the edge in one coordinate space.
- Keep the 180×240 play canvas and put an overlay canvas or DOM layer around it. Crossing the edge then needs a shared coordinate space.

The rect becomes a value `{x, y, w, h}` that can animate. Gameplay follows it: spawns, collision, bullets, the ship, and the in-rect HUD. The store layout follows the column it already uses. An enemy that leaves the rect has left the world. The Black Hole removes it only once it has fully left.

Shots and taps hit a meta threat only on the part that intersects the rect.

When the event ends, animate the rect back to its rest inset. A test must assert that `x`, `y`, `w`, and `h` match that rest rect afterward.

Mobile already stacks the store under the playfield below 820px (`fit()`). A shrunk or shifted rect must not cover the store, push the hull bar off the rect, or break that stack. The wave and hull readouts stay inside the rect.

Inside the rect, sprites stay hand-authored pixels. The outside layer is the exception to that look.
A hull breach runs the Warp Jump reset immediately: credits, ship upgrades and gun levels clear, unlocked guns stay, and the next run starts at wave `1 + 5 * Warp Drive`. The banner reads `HULL BREACH - EMERGENCY WARP`, and a toast shows the Dark Matter earned.

The payout is `dmGain()` at that moment, the same number the Warp Jump button would pay, with no Maw bounty added. `dmGain()` is 0 until `maxWave` is at least 20, so an early death pays nothing. A zero payout still resets the run, but it does not increment `S.warps`, so it cannot open warp-gated upgrades. Once `dmGain()` is above 0, the death increments `S.warps` and banks that Dark Matter, then sets `maxWave` back to 0, so a second death cannot farm more than one voluntary warp at the same peak.

Base hull is 32, up from 20 (`calcStats`). A full reset on every death was ending the balance sim on the first boss. The extra hull lets that run clear the early bosses without a wipe. Enemy health and damage are unchanged.

## Balance philosophy
- Through wave 100, enemy HP grows ~19%/wave (x1.2 per sector, plus an early polynomial ramp). After wave 100, health follows the late cap below and does not go back to 19% a wave. Rewards grow ~16%/wave. Costs grow faster than rewards, so each run naturally stalls.
- Kills per wave and max alive enemies rise with the wave (`needOf`, `maxAliveOf`, capped at 150 and 110).
- Player damage scaling is deliberately gentle (`wMult`, tap damage at 0.6+0.12/level, Spread Array as projectiles plus 50%).
- A run should stall somewhere around waves 40-50 for an active player. That stall is the prompt to Warp Jump. After a warp the player should blast through early waves and pass their old best within ~10 minutes.
- **Daily rebalance:** small, targeted numeric changes with sim evidence, at most ~3 knobs per day, each named in the changelog `balance` lines.

### Late health cap (`HP_CAP_WAVE`)
`HP_CAP_WAVE` is **125**. It lives next to `eHP` / `eDmg` in `src/game.js`. Do not remove it, and do not put 19% health growth back after wave 100. A pure clamp of the old curve at wave 125 freezes health at about 134× the wave-100 value (`hpRaw(125) / hpRaw(100)`). A developed save kills roughly 7×`eHP` in under 10 seconds at wave 100, so that freeze still leaves a boss up for many minutes and it escapes.

Health uses the classic curve through wave 100 (`HP_BEND_WAVE`), including THE MAW. `eHP(100)` must stay equal to `hpRaw(100)`. From wave 100 to wave 125 health multiplies by `HP_LATE_MULT` (**3.5**), on a smooth log ramp. `eHP(125) = eHP(100) × 3.5`. At wave 126 and every wave after, `eHP` stays on that wave-125 value. Mines, guards, minions, standard bosses, elite bosses, and mega-boss parts all read `eHP`, so the cap covers them.

Shot, ram, and mine-touch damage still use `eDmg`. Through wave 125 that is `1.11^(wave-1)`, same as before. After wave 125, damage grows by `DMG_LATE` (**1.12**) per wave, and by `HPK.sec` (**1.2**) for each sector past `sectorOf(125)`. That is the old per-sector health step, with a per-wave rate between the old 11% hit growth and the old 19% health growth. A full 19% per wave deleted the reference save on the next Big Core. Wave 140 damage is `1.12^15 × 1.2` (about 6.6×) wave-125 damage, at the same health.

Big Core's three shields are offset, with a gap over the weak point, 8% of boss health each, and they return 11s after they break. Xeno Biomech's center plate has 3.2×`eHP`, covers the weak point, and returns 14s after it cracks. Side plates stay off that column. Auto-aim uses the gap, or the plate that blocks it.

### Guardrails (CI enforced, `tests/guardrails.json`)
A deterministic seeded sim (greedy buyer, 8 taps/s) must satisfy:

| In-game minute | Wave band | Avg enemies on screen | Focus time-to-kill |
|---|---|---|---|
| 5 | 12-28 | >= 8 | 0.4-6 s |
| 15 | 24-44 | >= 11 | 0.8-10 s |
| 30 | 34-58 | >= 12 | 1.2-15 s |

Also: no more than +6 waves in any single minute after minute 3 (no skipping to infinity), Warp Jump available by minute 30 (no stall before prestige), post-warp best >= 80% of pre-warp best within 10 minutes, and an idle player (no taps) reaches wave 6 within 15 minutes. Baseline numbers are recorded in `tests/guardrails.json`.

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
| sector 3+ | Verdant Belt (21), Wave Cannon (21), Cloakers (22), Xeno Biomech (25), Solar Forge (31), The Deep (41) |
| warps 1 | Dark Matter upgrades (Overcharge, Quantum Salvage, Nanohull, Chrono Core, Warp Drive, Auto-Foundry) |
| sector 10 (wave 91) | THE MAW, waves 91-95. Eidolon appears in SAVE/STATS once best wave reaches sector 10, and can be equipped only after the kill |
| future | Missions, more skins (R13), sector modifiers and the rest of the [roadmap](ROADMAP.md). Use warps/bosses/dmTotal gates for meta systems so they appear after the first prestige |

Guideline: new **combat content** goes where the current content runs out (waves 25-60, sectors 3-6). New **meta systems** gate on `warps` so the first run stays simple. A capstone the owner asks for can sit past the stall (THE MAW at sector 10). It still needs a gate a fresh save cannot open.

## Content registry contracts
Each file in `src/content/` documents its fields in a header comment. Summary:

- **changelog.js**: newest first, `{version, date, title, added[], balance[], fixed[]?, gate?}`. The top entry is the game version (the only place it lives).
- **sectors.js**: `{id, name, unlock:{sector:n}, scheme:{X,Y}, bg, planet:[3], bias:{enemyId:mult}}`. Position must equal its sector number. The list cycles after the last entry.
- **skins.js**: `{id, name, unlock, half:[rows]}`. `S.skin` is the equipped id. `S.skins[id] = 1` means owned. SAVE/STATS lists a skin when it is the starter, owned, or its gate is open, and only an owned skin can be equipped. A boss award sets the owned flag once; the registry `unlock` is what keeps it off a fresh save.
- **icons.js**: `id -> [rows]`. `ship` and `drone` are special icons.
- **upgrades.js**: credit upgrades `{id, name, desc, icon, base, g, max?, req?, unlock, show(stats, level)}`, with effects in `calcStats()`. Dark Matter `{id, icon, name, desc, base, g, max?, unlock, show(level)}`.
- **guns.js**: `{id, name, desc, icon, R, rm, cost, unlock, proj(m), fire(A,g), sfx(A), draw?, charge?, sfxGap?}`. The engine derives per-shot damage from `R/rm/proj`, so total DPS is comparable across guns.
- **enemies.js**: `{id, name, threat?, unlock, weight, late?, squad?, big?, hp, rew, dmg, spd, fire, shots, ai, shield?, sprite, init?, update?}`. Built-in `ai`: roam, dive, march, kami, rock, sniper, cloak. Use `custom` plus `update(e,dt,A)` for new behaviours.
- **bosses.js**: `{id, name, unlock (wave multiple of 5), hp, body, escorts, palette?, half, setup(e,A), update(e,dt,A), draw?(e,A,ctx), final?, phaseLock?}`. The rotation cycles through bosses whose gate is open at the current wave, in list order, skipping `final:true`. **Append new bosses at the end** so existing waves keep their bosses. Parts may be `{kind:'limb'}` or `{kind:'core'}` as well as weak, wall and block. `phaseLock` skips the automatic 50% enrage.
- **features.js**: mechanic flags `{id, name, desc, unlock, announce?}`, checked in the engine with `feat(id)`.
- **missions.js**: reserved, and the contract gets fixed by the roadmap item that implements it.

The **`A` API** (content hooks) gives `W, H, TAU, rnd, clamp, pick, fmt, G, S, ctx, eDmg, eHP, aimAt, bossFire, mkEnemy, spawnInvaderGroup, damagePlayer, addText, addPart, banner, sparks, explode, SFX, wallsAlive, tone, noise, nextPhase`. `nextPhase(e)` advances a `final` boss one wave and rebuilds it. Extend the API rather than reaching into engine internals.

**Save compatibility:** the key is `voidbreaker_save_v1` (legacy name, never change it). New persistent state goes in `fresh()` with a default, and `migrate()` copies known fields and fills the rest. New upgrade, gun and Dark Matter ids get level 0 automatically. `S.skin`, `S.skins` and `S.finalKills` are persistent. Warp Jump does not clear them. Reset All does, because it loads `fresh()`.

## Final boss: THE MAW
Sector 10 wave 1 is wave 91 (`sector = floor((wave-1)/10)+1`). `isFinalWave` is waves 91-95. Those waves spawn THE MAW (`id: 'maw'`, `final:true`) instead of a normal wave or the rotating boss. The registry gate is `{wave:90, sector:10}`: wave 90 is a multiple of 5, and sector 10 stays closed until wave 91, so the boss is out of the rotation and off a fresh save.

One boss persists across the five waves. The HUD reads `FINAL BOSS - PHASE n/5` with `n = wave-90`. A phase ends when its break condition calls `nextPhase` (or, on phase 5, when the core dies). The wave counter advances then. No regular spawns run during the encounter.

Each phase has a 90 second clock. A hull breach or a timeout restarts **that phase** at full health: the wave number does not drop, and earlier phases stay cleared. The usual lose rule (drop one wave) applies only outside waves 91-95.

The core is armored while the current phase still has living tentacles (`bodyMult` 0, shots print ARMORED). Phase 3 opens the eye after both tentacles sever; emptying the eye calls `nextPhase` and does not end the fight (`holdKill`). Phase 5 leaves the core exposed at 42% damage taken while any tentacle lives, then at full damage. Killing that core is the only kill.

| Phase | Wave | What breaks | Pattern |
|---|---|---|---|
| 1 | 91 | 4 outer tentacles, 5.5×eHP each (22×eHP) | Tip fans, one slam at a time. Core armored |
| 2 | 92 | 4 armoured regrowth tentacles, 6×eHP at 0.75 damage taken | Spore shots, scout minions, slams |
| 3 | 93 | 2 long tentacles, 6.5×eHP each, then the eye at 10×eHP | After the eye opens, a sweeping laser. Eye break goes to phase 4 |
| 4 | 94 | 6 fast tentacles, about 4.2-4.4×eHP | Faster tip fans, fighter minions, slams |
| 5 | 95 | 4 tentacles, 4.2 or 4.6×eHP, then the core at 16×eHP | Spinning bullet ring, tip bolts. Core death ends the fight |

Tentacles are jointed segments, pooled on the boss. Each has its own HP bar. They are drawn as thick tapering curves on one screen-filling silhouette: a mantle across the top of the playfield, outer limbs framing the side edges, and the other limbs hanging in the gaps. Phase 4 uses all six of those curves. Fewer phases use a subset, with the same hit points as before. A severed tentacle leaves a stump and the broken length tumbles away in one piece. Idle contact damage is the tip only; a slam hits along the arm. Enemy bullets during the fight are pooled and capped.

On the kill: `S.finalKills` increments, Eidolon is granted once (`S.skins.eidolon`), a short victory plays, then the existing Warp Jump runs. The bounty is `max(15, floor(normal Dark Matter × 0.5))` added to the normal gain. Later runs can fight the Maw again. The skin is not granted twice. Reset All locks it again.

`?final=1` jumps to wave 91 and sets `noSave`, so that tab cannot write the save. `?kit=1` (only together with `final=1`) loads a strong kit and sets `G.debugMul` so shots can dent wave-91 HP. Real runs and the balance sim leave `debugMul` at 1. `?mute=1` mutes that session. Sector 10 still uses the cycling sector art (THE DEEP), because only five sector pictures exist.

## Balance philosophy
- Enemy HP grows ~19%/wave (x1.2 per sector, plus an early polynomial ramp). Rewards grow ~16%/wave. Costs grow faster than rewards, so each run naturally stalls.
- Kills per wave and max alive enemies rise with the wave (`needOf`, `maxAliveOf`, capped at 150 and 110).
- Player damage scaling is deliberately gentle (`wMult`, tap damage at 0.6+0.12/level, Spread Array as projectiles plus 50%).
- A run should stall somewhere around waves 40-50 for an active player. That stall is the prompt to Warp Jump. After a warp the player should blast through early waves and pass their old best within ~10 minutes.
- **Daily rebalance:** small, targeted numeric changes with sim evidence, at most ~3 knobs per day, each named in the changelog `balance` lines.

### Guardrails (CI enforced, `tests/guardrails.json`)
A deterministic seeded sim (greedy buyer, 8 taps/s) must satisfy:

| In-game minute | Wave band | Avg enemies on screen | Focus time-to-kill |
|---|---|---|---|
| 5 | 12-28 | >= 8 | 0.4-6 s |
| 15 | 24-44 | >= 11 | 0.8-10 s |
| 30 | 34-58 | >= 12 | 1.2-15 s |

Also: no more than +6 waves in any single minute after minute 3 (no skipping to infinity), Warp Jump available by minute 30 (no stall before prestige), post-warp best >= 80% of pre-warp best within 10 minutes, and an idle player (no taps) reaches wave 6 within 15 minutes. Baseline numbers are recorded in `tests/guardrails.json`.

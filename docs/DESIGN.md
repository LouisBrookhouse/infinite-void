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
| future | Missions, skins, sector modifiers and the rest of the [roadmap](ROADMAP.md). Use warps/bosses/dmTotal gates for meta systems so they appear after the first prestige |

Guideline: new **combat content** goes where the current content runs out (waves 25-60, sectors 3-6). New **meta systems** gate on `warps` so the first run stays simple.

## Content registry contracts
Each file in `src/content/` documents its fields in a header comment. Summary:

- **changelog.js**: newest first, `{version, date, title, added[], balance[], fixed[]?, gate?}`. The top entry is the game version (the only place it lives).
- **sectors.js**: `{id, name, unlock:{sector:n}, scheme:{X,Y}, bg, planet:[3], bias:{enemyId:mult}}`. Position must equal its sector number. The list cycles after the last entry.
- **skins.js**: `{id, name, unlock, half:[rows]}`. Only the first is used until the skin selector ships.
- **icons.js**: `id -> [rows]`. `ship` and `drone` are special icons.
- **upgrades.js**: credit upgrades `{id, name, desc, icon, base, g, max?, req?, unlock, show(stats, level)}`, with effects in `calcStats()`. Dark Matter `{id, icon, name, desc, base, g, max?, unlock, show(level)}`.
- **guns.js**: `{id, name, desc, icon, R, rm, cost, unlock, proj(m), fire(A,g), sfx(A), draw?, charge?, sfxGap?}`. The engine derives per-shot damage from `R/rm/proj`, so total DPS is comparable across guns.
- **enemies.js**: `{id, name, threat?, unlock, weight, late?, squad?, big?, hp, rew, dmg, spd, fire, shots, ai, shield?, sprite, init?, update?}`. Built-in `ai`: roam, dive, march, kami, rock, sniper, cloak. Use `custom` plus `update(e,dt,A)` for new behaviours.
- **bosses.js**: `{id, name, unlock (wave multiple of 5), hp, body, escorts, palette?, half, setup(e,A), update(e,dt,A), draw?(e,A,ctx)}`. The rotation cycles through bosses whose gate is open at the current wave, in list order. **Append new bosses at the end** so existing waves keep their bosses.
- **features.js**: mechanic flags `{id, name, desc, unlock, announce?}`, checked in the engine with `feat(id)`.
- **missions.js**: reserved, and the contract gets fixed by the roadmap item that implements it.

The **`A` API** (content hooks) gives `W, H, TAU, rnd, clamp, pick, fmt, G, S, ctx, eDmg, eHP, aimAt, bossFire, mkEnemy, spawnInvaderGroup, damagePlayer, addText, addPart, banner, sparks, explode, SFX, wallsAlive, tone, noise`. Extend it rather than reaching into engine internals.

**Save compatibility:** the key is `voidbreaker_save_v1` (legacy name, never change it). New persistent state goes in `fresh()` with a default, and `migrate()` copies known fields and fills the rest. New upgrade, gun and Dark Matter ids get level 0 automatically.

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

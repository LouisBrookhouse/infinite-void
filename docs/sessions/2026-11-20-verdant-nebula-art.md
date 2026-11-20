---
created: 2026-11-20T10:00:00Z
intent: Redraw the Verdant Belt nebula so it uses the same Bayer dither as the planets, without touching the v1.4.0 hull regen.
durable_promoted: true
---
# Verdant haze

## Intent
Louis rejected the v1.4.0 clouds: flat green blobs, not the dithered planets. Same gate (Verdant Belt picture, sector 3 / wave 21, back at sector 8). Patch 1.4.1. Not a new roadmap item and not a meta threat.

## Scope
In scope: nebula paint and scroll in `src/game.js`, the `clouds` comment, changelog 1.4.1, DESIGN, STATUS, ROADMAP, this note.
Out of scope: hull regen and every other balance number, new guns, enemies, bosses, upgrades, meta threats, protected paths (`tests/`, `scripts/`, `.github/`, `package.json`, `AGENTS.md`), opening a PR.

## Changes
- `makePlanet` and the nebula share `BAYER` / `bayer()`. Planet pixels are unchanged: same matrix, same `*2.2 + bayer - 0.5`, same alpha 0.55.
- `verdant-belt` still sets `clouds:{a,b,h}` to `#0d2a1c`, `#2e8b57`, `#6bff8a`. The engine mixes four tones from those three and paints two 180×240 sheets once per sector change. Ordered dither thresholds a warped lobe field (plus a bent arm and a ridge). Edges are missing pixels. The lit face points upper-left, like the planets. A few dim `#7383bb` / `#ffffff` stars sit in the near sheet.
- Draw order is background, nebula, planet, stars, then gameplay. Scroll is 0.32 and 0.78 px/s (far stars are 5, the planet is 1.2). The sheets tile in y. Paint uses a private hash and does not call `Math.random`.
- Gate is unchanged. `buildClouds` still requires `clouds` and `gateOpen` on wave `sec*10+1`. Outer Rim, Nebula Drift, Solar Forge and The Deep stay empty. Sector 8 brings the haze back. `s.regen` is still `maxHull * (0.004 + 0.003 * Nano Repair)`.

## Validation
- Headless Chrome, zero console errors. Wave 1 and wave 20: `G.clouds` null. Wave 21: 2 sheets, 180×240, speeds 0.32 and 0.78. Wave 31: null. Wave 71 (sector 8): 2 sheets. Near sheet has 5606 covered pixels of 43200. A 2 second wave 21 still shows enemies and the ship in front of the haze.
- Screenshots: `/opt/cursor/artifacts/nebula-wave21.png`, `nebula-closeup.png`, `compare-sector1.png`. The haze is Bayer-stepped green with a soft edge and an upper-left lit face. Sector 1 is the same starfield and a dithered planet, with no haze. The v1.4.0 layer was six flat blobs drawn over the planet. This one sits behind the planet.
- `npm test` (validate-docs, unit 8, browser suites smoke, save, migration, gating, balance, death, mega, mines, aim, latescale): all passed. Balance suite: min5 wave 21 / 11.133 / 1.197s, min15 wave 34 / 17.9 / 1.462s, min30 wave 44 / 14.533 / 2.939s, warp +13 Dark Matter, idle best 10. Same line as v1.4.0. Regen was not edited.

## Open items
None in the game. Lasting notes are in STATUS, DESIGN, and ROADMAP.

## Next steps
R0X Splitter at wave 27. R04 Black Hole stays a meta-threat wild card. Owner opens the PR if this haze should replace the v1.4.0 blobs.

## Links
- [DESIGN.md](../DESIGN.md) Verdant Belt clouds
- [STATUS.md](../STATUS.md)
- [ROADMAP.md](../ROADMAP.md) R03

---
created: 2026-11-17T19:03:37Z
intent: Specify meta threats in the docs. No game code and no version bump.
durable_promoted: true
---
# Meta threats

## Intent
Louis asked for a new update type, meta threats: things that arrive from outside the play rect and act on it, with an eldritch feel. Docs only.

## Scope
In scope: DESIGN.md, AGENTS.md, ROADMAP.md, INDEX.md, STATUS.md, this note.
Out of scope: game code, changelog, a version bump, and opening a pull request.

## Changes
- DESIGN.md "Meta threats" defines the play rect as the game world, the outside-the-rect behaviour, the eldritch art exception, tier `meta` above `mega`, the Black Hole and Rect Breaker examples, the wild-card cadence, the spawn roll, the gates, and the rendering notes.
- Suggested spawn roll, not built: once per wave, `p = 0.004` through wave 100, then `min(0.02, 0.004 + 0.0002 * (wave - 100))`. One at a time. Never during a mega boss unless that threat is marked to overlap. Weights: Black Hole 8, Rect Breaker 1. Gates: Black Hole `{wave:100}`, Rect Breaker `{wave:150, warps:2}`.
- Cadence: about one daily update in ten, never two meta-threat days in a row, still one small gated update. A normal day skips a `[meta threat]` item.
- ROADMAP: Louis's `[meta threats]` tag and his Black Hole sentence stay, including the doubled "the". R04 is retagged `[meta threat] Black Hole`. The pyramid ship on R0X is tagged `[enemy]` again, because the meta-threat tag had landed on the wrong line. R33 and R34 are unchanged. R35 Rect Breaker is the new meta boss.
- No version bump. The docs validator does not require a changelog entry when no game file changes.

## Validation
- `npm test` passed: docs validator (9 docs, 7 changelog entries, 7 session notes), 8 unit tests, and the browser suites (smoke, save, migration, gating, balance, death, mega). No game file changed, so the balance numbers are the 1.1.4 numbers.

## Open items
None. Meta threats are not implemented. The contract lives in DESIGN.md and the roadmap items.

## Next steps
The next daily update is still R01 Mine Layer. Do not ship R04 or R35 on a normal day.

## Links
- Branch `docs/2026-11-17-meta-threats`
- [DESIGN.md](../DESIGN.md) Meta threats
- [ROADMAP.md](../ROADMAP.md) R04 and R35
- [STATUS.md](../STATUS.md)

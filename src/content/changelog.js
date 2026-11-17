/* PATCH NOTES. Newest entry FIRST. The top entry's `version` is the game version.
 * Daily agent: prepend exactly one entry per daily update (bump the minor version,
 * e.g. 1.4.0 -> 1.5.0; use a patch bump for fix-only changes). Keep text short and player-facing.
 * Fields: version (semver), date (YYYY-MM-DD, UTC), title, added[], balance[], fixed[] (optional), gate (text, optional). */
IV.content.changelog.push(
 {version:'1.1.3',date:'2026-11-17',title:'EMERGENCY WARP',
  added:[
   'A hull breach is now an emergency Warp Jump. You keep the Dark Matter a normal warp would have paid.',
  ],
  balance:[
   'Dying before wave 20 pays no Dark Matter and does not count as a Warp Jump. It still resets the run.',
   'Base hull is 32, up from 20, so the first bosses do not end a run by themselves.',
  ],
  fixed:[
   'Death no longer sends you back one wave, and dying to THE MAW no longer restarts the phase.',
  ],
  gate:'Every wave. Dark Matter still starts at wave 20.'},
 {version:'1.1.2',date:'2026-11-17',title:'WALL OF FLESH',
  added:[],
  balance:[
   'The Maw still has the same health across five phases. Early waves are unchanged.',
  ],
  fixed:[
   'Guns, missiles and drones aim at THE MAW\'s tentacles and eyes instead of the armored core.',
   'THE MAW is a wall of flesh: two bloodshot eyes, a central mouth, and four Hungry tentacles.',
  ],
  gate:'Sector 10 (wave 91).'},
 {version:'1.1.1',date:'2026-11-17',title:'MAW TENTACLES',
  added:[],
  balance:[
   'No stat changes. The Maw fight is the same length and the same health.',
  ],
  fixed:[
   'THE MAW now has thick tapering tentacles on a screen-filling body, instead of thin wires.',
  ],
  gate:'Sector 10 (wave 91).'},
 {version:'1.1.0',date:'2026-11-17',title:'THE MAW',
  added:[
   'THE MAW, a five-phase final boss, waits at Sector 10 wave 1. Break its tentacles, then the eye.',
   'Clearing the Maw awards the Eidolon ship skin and Warp Jumps you, with bonus Dark Matter.',
  ],
  balance:[
   'Each Maw phase is about two normal bosses of health with a 90 second clock. Early waves are unchanged.',
  ],
  gate:'Sector 10 (wave 91). Eidolon is awarded once, on the kill.'},
 {version:'1.0.1',date:'2026-11-17',title:'FIRST AUTOMATIC UPDATE',
  added:[],
  balance:[],
  fixed:[
   'Resetting all progress no longer flags the patch notes as unread.',
  ]},
 {version:'1.0.0',date:'2026-11-17',title:'INFINITE VOID LAUNCHES',
  added:[
   'VOID BREAKER is now INFINITE VOID, live on the web. Your old save code still imports.',
   'Patch notes panel (tap the version number). A new update lands every day.',
   'Every gun, enemy, boss, upgrade and sector is now gated behind progression, so new content unfolds as you push further.',
   'Sector names: each new sector announces itself when you arrive.',
  ],
  balance:[
   'Baseline balance locked in with automated guardrails: swarms stay dense and enemies keep taking real hits to kill.',
   'Dark Matter upgrades now appear after your first Warp Jump.',
  ],
  fixed:[
   'DRONE AI CORE description now matches its real effect (+25% drone damage per level).',
  ]}
);

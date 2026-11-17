/* PATCH NOTES. Newest entry FIRST. The top entry's `version` is the game version.
 * Daily agent: prepend exactly one entry per daily update (bump the minor version,
 * e.g. 1.4.0 -> 1.5.0; use a patch bump for fix-only changes). Keep text short and player-facing.
 * Fields: version (semver), date (YYYY-MM-DD, UTC), title, added[], balance[], fixed[] (optional), gate (text, optional). */
IV.content.changelog.push(
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

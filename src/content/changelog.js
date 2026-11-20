/* PATCH NOTES. Newest entry FIRST. The top entry's `version` is the game version.
 * Daily agent: prepend exactly one entry per daily update (bump the minor version,
 * e.g. 1.4.0 -> 1.5.0; use a patch bump for fix-only changes). Keep text short and player-facing.
 * Fields: version (semver), date (YYYY-MM-DD, UTC), title, added[], balance[], fixed[] (optional), gate (text, optional). */
IV.content.changelog.push(
 {version:'1.4.0',date:'2026-11-20',title:'VERDANT BELT',
  added:[
   'Verdant Belt grows a green nebula. Clouds drift behind the stars.',
  ],
  balance:[
   'The ship heals a little even before Nano Repair. An idle run reaches wave 10 again. A 30 minute run still stalls at wave 44, and a warp still pays +13 Dark Matter.',
  ],
  gate:'Sector 3 (wave 21). Outer Rim and Nebula Drift stay clear. The nebula comes back whenever that picture does.'},
 {version:'1.3.0',date:'2026-11-19',title:'OPTION PODS',
  added:[
   'Option Pods: two orbs trail the ship and copy your primary shots at 40% damage.',
  ],
  balance:[
   'They cost ¢1,500 and show up at wave 26. A 30 minute run still stalls at wave 44, and a warp still pays +13 Dark Matter.',
  ],
  gate:'Wave 26, in the ship tab. A fresh save does not have them.'},
 {version:'1.2.3',date:'2026-11-18',title:'LATE SCALING',
  added:[
   'Big Core shields and the Xeno Biomech plates crack when you shoot them, then grow back. The ship lines up with the opening.',
  ],
  balance:[
   'Enemy health climbs slowly from wave 100 and stops after wave 125. Past that, shots and rams hit harder instead.',
  ],
  gate:'Health stops climbing after wave 125. Big Core is wave 20. Xeno Biomech is wave 25.'},
 {version:'1.2.2',date:'2026-11-18',title:'BOSS TARGETING',
  added:[
   'The ship lines up under a boss and keeps shooting it, even when smaller enemies are closer.',
  ],
  balance:[
   'Boss waves go a little faster because the shots stay on the boss. A warp still pays the same Dark Matter.',
  ],
  fixed:[
   'Smaller enemies no longer pull the ship off a boss.',
   'Against THE MAW the ship sits under the tentacle, eye, or mouth and fires straight up.',
  ],
  gate:'Every boss fight, including THE MAW.'},
 {version:'1.2.1',date:'2026-11-18',title:'MINE LAYER REWORK',
  added:[
   'Mine Layers sweep the lane and lay a line of mines. Shoot one and the neighbours chain-detonate.',
   'Mines sit still, blink, and fade after a short while so a field does not last the whole wave.',
  ],
  balance:[
   'A mine field shows up every few waves from wave 24. Mines break easily, and the guns cut a gap through the line.',
  ],
  fixed:[
   'Mine Layers were easy to miss, and the mines looked like small shots.',
  ],
  gate:'Wave 24. A mine field every 3 waves after that. Boss waves skip it.'},
 {version:'1.2.0',date:'2026-11-18',title:'MINE LAYER',
  added:[
   'Mine Layers drift across the top from wave 24 and drop slow proximity mines.',
   'Shoot a mine, or let one touch you, and it bursts into eight shots.',
  ],
  balance:[
   'Mines are fragile, so clearing a drop does not stall the wave. The burst is the part that hurts.',
  ],
  gate:'Wave 24. Only Mine Layers drop mines.'},
 {version:'1.1.4',date:'2026-11-17',title:'MEGA BOSS',
  added:[
   'THE MAW is a mega boss. After phase 5 the run continues into the next wave.',
   'Clearing it still grants the Eidolon skin once, plus a Dark Matter and credit bounty once per run.',
  ],
  balance:[
   'The Maw bounty is paid directly. It is not a Warp Jump, and a later warp pays the normal amount only.',
  ],
  fixed:[
   'Clearing THE MAW no longer warps you out of the run.',
  ],
  gate:'Sector 10 (wave 91). The bounty is once per run. Waves continue past 95.'},
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

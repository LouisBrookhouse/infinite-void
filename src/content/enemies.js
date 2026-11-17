/* ENEMIES. Contract: {id, name, threat (toast name when first met, optional), unlock (gate vs CURRENT wave),
 *   weight (spawn weight, 0 = never picked randomly), late?:{wave,weight} (weight override after a wave),
 *   squad (can spawn in formation squads), hp/rew/dmg (multipliers of wave baseline), spd, fire (rate mult), shots,
 *   ai: roam|dive|march|kami|rock|sniper|cloak (built-in behaviours in src/game.js) OR 'custom' with update(e,dt,A),
 *   init?(e,A), shield? (fraction of HP as shield), sprite: {half:[rows]} | {full:[rows], full2:[rows]} | {proc:'rock'}}.
 * Sprite letters X/Y take the sector colour scheme. Ids are saved nowhere, but keep them stable. */
IV.content.enemies.push(
 {id:'scout',name:'SCOUT',unlock:{wave:1},weight:3,late:{wave:16,weight:0.8},squad:true,hp:0.7,rew:0.8,spd:55,fire:0.7,dmg:0.8,shots:1,ai:'roam',
  sprite:{half:["X....","XX...",".XXdd","..Xdy","..XdY","...XX","....X"]}},
 {id:'fighter',name:'FIGHTER',unlock:{wave:3},weight:3,squad:true,hp:1.2,rew:1.3,spd:42,fire:1,dmg:1,shots:1,ai:'roam',
  sprite:{half:["X.....","XX..X.","XXX.XX","XXXXdd",".XXdYy","..XdYY","...Xdd","....XX",".....Y"]}},
 {id:'diver',name:'DIVER',threat:'DIVE BOMBERS',unlock:{wave:4},weight:3,squad:true,hp:0.9,rew:1.1,spd:70,fire:0.5,dmg:1,shots:1,ai:'dive',
  sprite:{half:["X.....","XX...y","XXX.yy",".XXbyw","..Xbyy","...byy","..X.yy",".X...y"]}},
 {id:'invader',name:'INVADER',threat:'INVADER GRID',unlock:{wave:5},weight:2,hp:0.8,rew:0.9,spd:0,fire:0.3,dmg:0.8,shots:1,ai:'march',
  sprite:{full:["..X.....X..","...X...X...","..XXXXXXX..",".XX.XXX.XX.","XXXXXXXXXXX","X.XXXXXXX.X","X.X.....X.X","...XX.XX..."],
          full2:["..X.....X..","X..X...X..X","X.XXXXXXX.X","XXX.XXX.XXX","XXXXXXXXXXX",".XXXXXXXXX.","..X.....X..",".X.......X."]}},
 {id:'kami',name:'KAMIKAZE',threat:'KAMIKAZES',unlock:{wave:7},weight:2,squad:true,hp:0.6,rew:1,spd:40,fire:0,dmg:3,shots:0,ai:'kami',
  sprite:{half:["X...d","XX.dX",".XXdY","..XXw","...XY","....X"]}},
 {id:'cruiser',name:'CRUISER',threat:'CRUISERS',unlock:{wave:9},weight:2,hp:2.6,rew:2.8,spd:24,fire:0.8,dmg:0.9,shots:3,ai:'roam',big:true,
  sprite:{half:["..dd...",".dXXd..","dXXXXdd","dXddXXX","dXdYXdd","dXdYXdy",".dXXXdY","..dXXXd","...dXdd","....ddX"]}},
 {id:'guard',name:'GUARD',threat:'SHIELDED GUARDS',unlock:{wave:12},weight:2,hp:1.6,rew:2.4,spd:28,fire:0.8,dmg:1,shots:2,ai:'roam',shield:0.9,big:true,
  sprite:{half:["XX....","XddX..","XdXXdd","XdXYYd",".XdYYw","..Xddd","...XX.","....X."]}},
 {id:'rock',name:'ROCK',threat:'SPLITTING ROCKS',unlock:{wave:14},weight:2,hp:1.8,rew:0.8,spd:0,fire:0,dmg:0,shots:0,ai:'rock',
  sprite:{proc:'rock'}},
 {id:'sniper',name:'SNIPER',threat:'SNIPERS',unlock:{wave:16},weight:1.5,hp:1.3,rew:1.8,spd:35,fire:0,dmg:2.2,shots:0,ai:'sniper',
  sprite:{half:["..dd..","ddXXdd","dXXXXX","dXYYXX",".dXXYw","..ddXg",".....g",".....g"]}},
 {id:'cloaker',name:'CLOAKER',threat:'CLOAKERS',unlock:{wave:22},weight:1.5,squad:true,hp:1.3,rew:1.8,spd:50,fire:0.8,dmg:1.1,shots:1,ai:'cloak',
  sprite:{half:["X.....","XX....",".XX..d","..XXdY","..XdYY","...XdY","....Xw",".....X"]}}
);

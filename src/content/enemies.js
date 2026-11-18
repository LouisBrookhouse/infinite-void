/* ENEMIES. Contract: {id, name, threat (toast name when first met, optional), unlock (gate vs CURRENT wave),
 *   weight (spawn weight, 0 = never picked randomly), late?:{wave,weight} (weight override after a wave),
 *   squad (can spawn in formation squads), hp/rew/dmg (multipliers of wave baseline), spd, fire (rate mult), shots,
 *   ai: roam|dive|march|kami|rock|sniper|cloak (built-in behaviours in src/game.js) OR 'custom' with update(e,dt,A),
 *   init?(e,A), onDeath?(e,A) (once from killEnemy), shield? (fraction of HP as shield),
 *   sprite: {half:[rows]} | {full:[rows], full2:[rows]} | {proc:'rock'}}.
 * Weight 0 is never picked by the spawner. A.kill(e) detonates from update. Sprite letters X/Y take the sector colour scheme.
 * Ids are saved nowhere, but keep them stable. */
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
  sprite:{half:["X.....","XX....",".XX..d","..XXdY","..XdYY","...XdY","....Xw",".....X"]}},
 {id:'miner',name:'MINE LAYER',threat:'MINE LAYERS',unlock:{wave:24},weight:1.2,hp:1.7,rew:2,spd:34,fire:0,dmg:0.6,shots:0,ai:'custom',
  sprite:{half:["....X","...XX","..XXX",".XXXo","XXXXY",".XXoo","..X.."]},
  update(e,dt,A){
   const W=A.W;
   if(e.state!=='drift'){e.y+=46*dt;if(e.y<18)return;e.y=18;e.state='drift';e.vx=e.x<W/2?e.T.spd:-e.T.spd;e.drop=0.8;return;}
   e.x+=e.vx*dt;
   if(e.x<14){e.x=14;e.vx=Math.abs(e.T.spd);}else if(e.x>W-14){e.x=W-14;e.vx=-Math.abs(e.T.spd);}
   e.y=18+Math.sin(A.G.t*1.5+e.phase)*3;
   e.drop-=dt;if(e.drop>0)return;e.drop=2.8;
   let n=0;for(const o of A.G.enemies)if(o.type==='mine'&&!o.dead)n++;
   if(n>=3)return;
   A.mkEnemy('mine',{counts:false,x:A.clamp(e.x+A.rnd(-10,10),12,W-12),y:e.y+8});
  }},
 {id:'mine',name:'MINE',unlock:{wave:24},weight:0,hp:0.26,rew:0.35,spd:18,fire:0,dmg:0.55,shots:0,ai:'custom',
  sprite:{half:["..o",".oy","oyw",".oy","..o"]},
  init(e){e.vy=11;e.counts=false;},
  update(e,dt,A){
   const P=A.G.p;
   e.vy=Math.min(e.vy+7*dt,e.T.spd);
   e.x+=Math.sin(A.G.t*0.9+e.phase)*8*dt;
   e.x=A.clamp(e.x,8,A.W-8);e.y+=e.vy*dt;
   if(e.y>A.H+12){e.dead=true;return;}
   const dx=e.x-P.x,dy=e.y-P.y;
   if(dx*dx+dy*dy<28*28)e.flash=0.08;
   if(A.G.dead||A.G.dying||Math.abs(dx)>=10||Math.abs(dy)>=11)return;
   A.damagePlayer(A.eDmg(A.S.wave)*e.T.dmg);
   if(!e.dead)A.kill(e);
  },
  onDeath(e,A){for(let i=0;i<8;i++){const a=i*A.TAU/8;A.bossFire(e,a,44,'orb',0.2,Math.cos(a)*6,Math.sin(a)*6);}}
 }
);

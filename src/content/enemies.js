/* ENEMIES. Contract: {id, name, threat (toast name when first met, optional), unlock (gate vs CURRENT wave),
 *   weight (spawn weight, 0 = never picked randomly), late?:{wave,weight} (weight override after a wave),
 *   squad (can spawn in formation squads), hp/rew/dmg (multipliers of wave baseline), spd, fire (rate mult), shots,
 *   ai: roam|dive|march|kami|rock|sniper|cloak (built-in behaviours in src/game.js) OR 'custom' with update(e,dt,A),
 *   init?(e,A), onDeath?(e,A) (once from killEnemy), draw?(e,A,ctx), shield? (fraction of HP as shield),
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
 {id:'miner',name:'MINE LAYER',threat:'MINE LAYERS',unlock:{wave:24},weight:0,hp:2.4,rew:2.4,spd:64,fire:0,dmg:0.4,shots:0,ai:'custom',big:true,
  sprite:{half:["..........ggg","........ggwgg","......ggggggg","....ggggggggg","..dgggggggggg","dggggoooooggg","dggggooyooggg","dggggoooooggr","ddddddddddddd","ddddddddddddd",".dddddddddddd"]},
  init(e,A){
   e.counts=false;e.noBob=true;e.row=0;e.si=0;
   e.dir=(Math.floor(A.S.wave/3)%2)?-1:1;
   e.lineY=64;
   e.x=e.dir>0?-36:A.W+36;e.y=e.lineY-22;
  },
  update(e,dt,A){
   const n=12,x0=8,step=14;
   e.x+=e.dir*e.T.spd*dt;e.y=e.lineY-22;
   while(e.si<n){
    const sx=e.dir>0?x0+e.si*step:x0+(n-1-e.si)*step;
    if(e.dir>0?e.x<sx:e.x>sx)break;
    e.si++;
    let alive=0;for(const o of A.G.enemies)if(o.type==='mine'&&!o.dead)alive++;
    if(alive>=24)continue;
    const m=A.mkEnemy('mine',{counts:false,x:sx,y:e.lineY});
    m.counts=false;m.noBob=true;m.life=13.5;
   }
   const off=e.dir>0?e.x>A.W+40:e.x<-40;
   if(!off)return;
   if(e.row===0&&A.S.wave>=36){e.row=1;e.dir=-e.dir;e.si=0;e.lineY=118;e.x=e.dir>0?-36:A.W+36;return;}
   e.dead=true;
  },
  draw(e,A,ctx){
   const on=(A.G.t*6|0)%2,y=Math.round(e.y-1);
   ctx.fillStyle=on?'#ff4d5e':'#3b4252';
   ctx.fillRect(Math.round(e.x-e.w/2+2),y,2,2);
   ctx.fillRect(Math.round(e.x+e.w/2-4),y,2,2);
  }},
 {id:'mine',name:'MINE',unlock:{wave:24},weight:0,hp:0.16,rew:0.15,spd:0,fire:0,dmg:0.45,shots:0,ai:'custom',
  sprite:{half:["........",".......n","......nn",".....ngg","....nddg","..nndddd","....nddd",".....ndd","......nn",".......n","........","........","........"]},
  init(e){e.counts=false;e.noBob=true;e.life=e.life||13.5;e.fuse=0;e.near=0;},
  update(e,dt,A){
   if(e.fuse>0){e.fuse-=dt;e.flash=0.1;if(e.fuse<=0&&!e.dead)A.kill(e);return;}
   e.life-=dt;
   if(e.life<=0){e.silent=1;A.explode(e.x,e.y,1.4,'#ff9f1c');A.SFX.boom();e.dead=true;return;}
   const P=A.G.p,dx=e.x-P.x,dy=e.y-P.y;
   e.near=dx*dx+dy*dy<40*40;
   if(A.G.dead||A.G.dying||Math.abs(dx)>=12||Math.abs(dy)>=12)return;
   A.damagePlayer(A.eDmg(A.S.wave)*e.T.dmg);
   if(!e.dead)A.kill(e);
  },
  onDeath(e,A){
   if(e.silent)return;
   for(let i=0;i<4;i++){const a=i*A.TAU/4+A.TAU/8;A.bossFire(e,a,32,'orb',0.1,Math.cos(a)*8,Math.sin(a)*8);}
   for(const o of A.G.enemies){
    if(o===e||o.dead||o.type!=='mine'||o.fuse>0||o.silent)continue;
    if(A.G.t-(o.born||0)<0.25)continue;
    if(Math.hypot(o.x-e.x,o.y-e.y)<=16)o.fuse=0.11;
   }
  },
  draw(e,A,ctx){
   const x=Math.round(e.x),y=Math.round(e.y),on=(A.G.t*7|0)%2;
   ctx.fillStyle=on?'#ff4d5e':'#0b0f1e';ctx.fillRect(x,y,1,1);
   if(on){ctx.fillStyle='#ff9f1c';ctx.fillRect(x-1,y,1,1);ctx.fillRect(x+1,y,1,1);ctx.fillRect(x,y-1,1,1);ctx.fillRect(x,y+1,1,1);}
   if(e.life<2.4&&on){ctx.fillStyle='#ffffff';ctx.fillRect(x-1,Math.round(e.y-e.h/2),3,1);}
   if(!e.near)return;
   const r=11+Math.sin(A.G.t*8)*1.2;ctx.fillStyle=on?'#ff4d5e':'#ff9f1c';
   for(let i=0;i<18;i++){const a=i/18*A.TAU;ctx.fillRect(Math.round(e.x+Math.cos(a)*r),Math.round(e.y+Math.sin(a)*r),1,1);}
  }}
);

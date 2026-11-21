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
  }},
 {id:'splitter',name:'SPLITTER',unlock:{wave:27},weight:0.35,hp:1.5,rew:1.45,spd:28,fire:0.35,dmg:0.65,shots:1,ai:'roam',
  sprite:{full:Array(14).fill('...............')},
  init(e,A){e.noBob=true;if(A.G.splitNote)return;A.G.splitNote=1;A.toast('NEW THREAT: SPLITTERS');},
  onDeath(e,A){
   if(e.silent)return;
   A.addText('SPLIT',e.x,e.y-10,'#ff9f1c',true);
   A.sparks(e.x,e.y,'#ffe066',8);
   for(let s=0;s<3;s++){
    const d=A.mkEnemy('dart',{counts:false,x:e.x,y:e.y});
    d.ax=e.x;d.ay=e.y;d.seg=s;d.shard=0.34;
   }
  },
  draw(e,A,ctx){ivPyPaint(ctx,e.x,e.y,A.S.wave,A.G.t,e.flash>0);}},
 {id:'dart',name:'DART',unlock:{wave:27},weight:0,hp:0.32,rew:0.18,spd:0,fire:0,dmg:0.22,shots:0,ai:'custom',
  sprite:{full:Array(9).fill('.........')},
  init(e){e.counts=false;e.noBob=true;e.ang=1.57;e.sp=72;e.life=0;e.shard=0;e.seg=1;},
  update(e,dt,A){
   e.life+=dt;
   if(e.shard>0){
    e.shard-=dt;
    ivShardPlace(e);
    if(e.shard<=0){e.shard=0;const f=ivPyRows.fly[e.seg];e.ang=Math.atan2(f[1],f[0]||0.001);e.sp=84;}
    return;
   }
   const P=A.G.p;
   if(e.y<P.y-8){
    const want=Math.atan2(P.y-e.y,P.x-e.x);
    let da=((want-e.ang+Math.PI*3)%A.TAU)-Math.PI;
    e.ang+=A.clamp(da,-3.6*dt,3.6*dt);
   }
   e.sp=Math.min(156,(e.sp||72)+90*dt);
   const c=Math.cos(e.ang),s=Math.sin(e.ang);
   e.x+=c*e.sp*dt;e.y+=s*e.sp*dt;
   if(!A.G.dead&&!A.G.dying&&Math.abs(e.x-P.x)<6&&Math.abs(e.y-P.y)<7){
    A.damagePlayer(A.eDmg(A.S.wave)*e.T.dmg);
    if(!e.dead&&!A.G.dying)A.kill(e);
    return;
   }
   if(e.life>3.2||e.y>A.H+16||e.y<-30||e.x<-20||e.x>A.W+20){e.silent=1;e.dead=true;}
  },
  draw(e,A,ctx){
   if(e.shard>0){ivShardPaint(ctx,e,A.S.wave,A.G.t,e.flash>0);return;}
   ivDartPaint(ctx,e.x,e.y,e.ang||1.57,e.flash>0);
  }}
);
function ivPyRows(){
 if(ivPyRows.r)return ivPyRows.r;
 const raw=[
  '0000|11111|2222','0000|11111|2222','.000|11111|222.','.000|11111|222.',
  '..00|11111|22..','..00|11111|22..','...0|11111|2...','...0|11111|2...',
  '....0|111|2....','....0|111|2....','.....0|1|2.....','......111......',
  '......111......','.......1.......'
 ];
 const rows=raw.map(s=>[...s].map(ch=>ch==='.'?-1:ch==='|'?3:+ch));
 const cent=[[0,0,0],[0,0,0],[0,0,0]];
 rows.forEach((row,j)=>row.forEach((v,i)=>{if(v>=0&&v<3){cent[v][0]+=i;cent[v][1]+=j;cent[v][2]++;}}));
 ivPyRows.r=rows;ivPyRows.c=cent.map(c=>[c[0]/c[2],c[1]/c[2]]);
 ivPyRows.w=15;ivPyRows.h=rows.length;
 ivPyRows.fly=[[-16,12],[0,17],[16,12]];ivPyRows.shard=0.34;
 return rows;
}
function ivPyOwn(rows,i,j,seg){
 const v=rows[j][i];
 if(seg==null)return v>=0;
 if(v===seg)return true;
 if(v!==3)return false;
 return [[1,0],[-1,0],[0,1],[0,-1]].some(d=>{const q=rows[j+d[1]];return q&&q[i+d[0]]===seg;});
}
function ivPyEdge(rows,i,j){
 const H=rows.length,W=rows[0].length;
 if(i===0||j===0||i===W-1||j===H-1)return true;
 return [[1,0],[-1,0],[0,1],[0,-1]].some(d=>{const q=rows[j+d[1]];return !q||q[i+d[0]]<0;});
}
function ivPyPaint(ctx,cx,cy,wave,t,flash,seg,crack){
 const rows=ivPyRows(),W=ivPyRows.w,H=ivPyRows.h;
 const x0=Math.round(cx-(W-1)/2),y0=Math.round(cy-(H-1)/2);
 const secs=IV.content.sectors,sc=secs[Math.floor(((wave||1)-1)/10)%secs.length].scheme;
 const ramps=[
  ['#3b4252',sc.X,sc.Y,'#ffffff'],
  ['#1b2b5a','#3b4252','#8a94a6','#ffffff'],
  ['#0b0f1e','#1b2b5a','#3b4252','#8a94a6']
 ];
 const N=[[-0.9,-0.8],[0.05,-0.35],[0.85,0.15]];
 const seam=(t*8|0)%2?'#ffe066':'#ff9f1c';
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){
  if(!ivPyOwn(rows,i,j,seg))continue;
  const v=rows[j][i];let col='#ffffff';
  if(!flash){
   if(v===3)col=crack?'#ffffff':seam;
   else if(j===H-1&&i===7)col='#ffe066';
   else if(ivPyEdge(rows,i,j))col='#0b0f1e';
   else{
    let light=[0.48,0.52,0.62][v]+(IV.art.litUL(N[v][0],N[v][1])-0.55)*0.22-(i/W)*0.1-(j/H)*0.14;
    if(v===0)light=light<0.42?0.42:light>0.62?0.62:light;
    if(v===1)light=light<0.4?0.4:light>0.62?0.62:light;
    if(v===2)light=light<0.48?0.48:light>0.62?0.62:light;
    col=IV.art.tone(ramps[v],light,i,j);
    if(v===0&&i===1&&j===1)col='#ffffff';
    if(v===1&&i===7&&j===5)col='#ffffff';
    if(v===1&&i===7&&(j===4||j===6))col='#ffe066';
   }
  }
  ctx.fillStyle=col;ctx.fillRect(x0+i,y0+j,1,1);
 }
}
function ivShardPlace(e){
 ivPyRows();
 const k=1-Math.max(e.shard,0)/ivPyRows.shard,f=ivPyRows.fly[e.seg],c=ivPyRows.c[e.seg];
 e.x=e.ax+f[0]*k-(ivPyRows.w-1)/2+c[0];
 e.y=e.ay+f[1]*k-(ivPyRows.h-1)/2+c[1];
}
function ivShardPaint(ctx,e,wave,t,flash){
 ivPyRows();
 const k=1-Math.max(e.shard,0)/ivPyRows.shard,f=ivPyRows.fly[e.seg];
 ivPyPaint(ctx,e.ax+f[0]*k,e.ay+f[1]*k,wave,t,flash,e.seg,k<0.42);
}
function ivDartPaint(ctx,x,y,ang,flash){
 const c=Math.cos(ang),s=Math.sin(ang);
 const dark=[[3,1],[3,-1],[2,2],[2,-2],[1,2],[1,-2],[0,1],[0,-1],[-1,1],[-1,-1],[-2,0]];
 const lit=[[4,0,'#ffffff'],[3,0,'#ffe066'],[2,0,'#ffe066'],[2,1,'#ff9f1c'],[2,-1,'#ff9f1c'],[1,0,'#ff9f1c'],[1,1,'#ff9f1c'],[1,-1,'#ff9f1c'],[0,0,'#ff9f1c'],[-1,0,'#ffe066']];
 for(const p of dark){ctx.fillStyle=flash?'#ffffff':(Math.abs(p[1])>1?'#1b2b5a':'#0b0f1e');ctx.fillRect(Math.round(x+c*p[0]-s*p[1]),Math.round(y+s*p[0]+c*p[1]),1,1);}
 for(const p of lit){ctx.fillStyle=flash?'#ffffff':p[2];ctx.fillRect(Math.round(x+c*p[0]-s*p[1]),Math.round(y+s*p[0]+c*p[1]),1,1);}
 if(flash)return;
 ctx.fillStyle='#ffe066';ctx.fillRect(Math.round(x-c*3),Math.round(y-s*3),1,1);
 ctx.fillStyle='#ff9f1c';ctx.fillRect(Math.round(x-c*5),Math.round(y-s*5),1,1);ctx.fillRect(Math.round(x-c*7),Math.round(y-s*7),1,1);
}

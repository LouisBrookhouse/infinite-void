/* BOSSES. A boss wave happens every 5th wave; the boss is picked by rotating through the bosses whose gate is
 * open at the CURRENT wave, in list order (boss #k of the rotation = (wave/5 - 1) mod available).
 * Contract: {id, name, unlock (gate, use wave multiples of 5), hp (x wave HP baseline), body (damage mult on hull,
 *   weak points do more), escorts (bool: engine sends scouts/fighters), palette ('scheme' | {letter:'X'|'Y'|'#hex'}),
 *   half:[rows] (left half sprite, drawn at 2x), setup(e,A) adds parts/initial state,
 *   update(e,dt,A) moves (set e.tx/e.ty) and attacks (timers e.a1/e.a2 count down automatically; e.phase 1|2,
 *   phase 2 starts at 50% HP), draw?(e,A,ctx) extra effects}.
 * Parts: {kind:'weak', ox, oy, w, h, mult, eye?:{oy,c}} | {kind:'wall', ..., hp, maxHp} | {kind:'block', ...}
 *   | {kind:'limb', li, si, ox, oy, w, h} | {kind:'core', ox, oy, w, h}.
 * final:true bosses are left out of the 5-wave rotation. THE MAW runs sector 10 waves 91-95.
 * A (engine API): W,H,TAU,rnd,G,S,eDmg,aimAt,bossFire(e,ang,speed,kind,dmgMult,ox,oy),mkEnemy,spawnInvaderGroup,
 *   damagePlayer,addText,banner,SFX,wallsAlive. Bullet kinds: orb|bolt|zig|laser|big|snipe. */
IV.content.bosses.push(
 {id:'dread',name:'DREADNOUGHT',unlock:{wave:5},hp:14,body:1,escorts:true,palette:'scheme',
  half:["dd...........","dXd........gw","dXXd......gXX",".dXXd....gXXX",".dXXXdddgXXdd","..dXXXXXXXdYY","..dXXddXXdYYy","...dXdwdXXdYY","...dXdddXXXdd","....dXXXXXXXX",".....dXXdXXdX","......dXd.dXr",".......d...dr","............r"],
  setup(e,A){const hh=e.h/2;e.parts.push({kind:'weak',ox:0,oy:hh-6,w:8,h:12,mult:2,eye:{oy:hh-6,c:'#ff4d5e'}});},
  update(e,dt,A){const G=A.G,p2=e.phase===2;
   e.tx=A.W/2+Math.sin(G.t*0.7)*50;e.ty=42+Math.sin(G.t*1.3)*8;
   if(e.a1<=0){e.a1=p2?1.6:1.3;const a=A.aimAt(e.x,e.y);for(let i=0;i<5;i++)A.bossFire(e,a+(i-2)*0.22,72);}
   if(p2&&e.a2<=0){e.a2=0.11;e.ang+=0.47;A.bossFire(e,e.ang,52,'orb',0.8,0,0);A.bossFire(e,e.ang+Math.PI,52,'orb',0.8,0,0);}}},
 {id:'galaga',name:'BOSS GALAGA',unlock:{wave:10},hp:13,body:1,escorts:false,
  half:["e......y","ee....yy","eel..lyy",".eellyry","..elllyy","...llbbw","..lllbbb",".lllebbb","lllee.bb","ll.e..lb","l..e..l.","...e...l"],
  setup(e,A){const hh=e.h/2;e.parts.push({kind:'weak',ox:0,oy:hh-7,w:8,h:14,mult:2,eye:{oy:hh-9,c:'#ffe066'}});},
  update(e,dt,A){const G=A.G,P=G.p,S=A.S,p2=e.phase===2;
   if(e.beam>0){e.beam-=dt;e.tx=e.x;const bw=Math.min(30,(2.6-e.beam)*30);e.beamW=bw;
    if(Math.abs(P.x-e.x)<bw/2&&!G.dead){const eff=G.s.drones-G.captured;
     if(eff>0){if(!e.caught){e.caught=true;G.captured++;A.addText('DRONE CAPTURED!',e.x,e.y+30,'#ff4d5e',true);A.SFX.hurt();}}
     else{e.beamDmg=(e.beamDmg||0)+A.eDmg(S.wave)*1.2*dt;if(e.beamDmg>A.eDmg(S.wave)*0.6){A.damagePlayer(e.beamDmg);e.beamDmg=0;}}}
    if(e.beam<=0){e.beam=0;e.beamCD=p2?6:8;}}
   else{e.tx=A.W/2+Math.sin(G.t*0.8)*50;e.ty=40;e.beamCD-=dt;
    if(e.beamCD<=0&&e.y>30){e.beam=2.6;e.caught=false;e.beamW=0;A.SFX.beam();A.addText('TRACTOR BEAM',e.x,e.y+24,'#7fe7ff',true);}
    if(e.a1<=0){e.a1=p2?1.2:1.6;const a=A.aimAt(e.x,e.y);for(let i=0;i<3;i++)A.bossFire(e,a+(i-1)*0.25,74);}}
   if(p2&&e.a2<=0){e.a2=3.5;if(G.enemies.length<6)for(let i=0;i<2;i++)A.mkEnemy('diver',{counts:false,rew:0.3,x:e.x+(i?18:-18),y:e.y});}},
  draw(e,A,ctx){if(!(e.beam>0))return;const G=A.G,H=A.H,bw=e.beamW||0,top=e.y+e.h/2;
   for(let y=top;y<H;y+=2){const k=(y-top)/(H-top),w=Math.round(4+bw*k);ctx.globalAlpha=((y+(G.t*40|0))%6<3)?0.45:0.2;ctx.fillStyle=(y%4<2)?'#7fe7ff':'#2a6fdb';ctx.fillRect(Math.round(e.x-w/2),y,w,1);}
   ctx.globalAlpha=1;}},
 {id:'ufo',name:'MOTHERSHIP',unlock:{wave:15},hp:15,body:0.6,escorts:false,palette:{r:'X'},
  half:["...........ddddd","........dddrrrrr","......ddrrrrrrrr","....ddrrwrrwrrwr","..ddrrrrrrrrrrrr","ddrrrrrrrrrrrrrr",".dddyddyddyddydd","...ddddddddddddd",".........ddccccc","..........dddddd"],
  setup(e,A){const hh=e.h/2;e.ty=34;e.parts.push({kind:'weak',ox:0,oy:hh-4,w:12,h:8,mult:2.5,eye:{oy:hh-3,c:'#7fe7ff'}});},
  update(e,dt,A){const G=A.G,W=A.W,p2=e.phase===2;
   e.ty=34;e.tx=e.x+e.dirx*60;if(e.x>W-e.w/2-2)e.dirx=-1;if(e.x<e.w/2+2)e.dirx=1;
   if(e.a1<=0){e.a1=p2?0.3:0.45;A.bossFire(e,Math.PI/2,48,'zig',0.9,A.rnd(-e.w/2+6,e.w/2-6),e.h/2-2);}
   if(p2&&e.a2<=0){e.a2=2.4;const a=A.aimAt(e.x,e.y);A.bossFire(e,a,90,'bolt',1,-8);A.bossFire(e,a,90,'bolt',1,8);if(G.marches.length<1)A.spawnInvaderGroup(8,false);}}},
 {id:'core',name:'BIG CORE',unlock:{wave:20},hp:12,body:0.15,escorts:true,
  half:["............gg","........gggggd","....gggggddddd","..ggddddddgggb","gggddddddgbbbc","gdddddddgbbccw","gggddddddgbbbc","..ggddddddgggb","....gggggddddd","........gggggd","............gg"],
  setup(e,A){const hh=e.h/2,hp=e.maxHp;e.ty=36;
   for(const k of [4,10,16])e.parts.push({kind:'wall',ox:0,oy:hh+k,w:14,h:4,hp:hp*0.1,maxHp:hp*0.1,flash:0});
   e.parts.push({kind:'weak',ox:0,oy:3,w:10,h:hh*2-6,mult:1.5,guard:true,core:true});},
  update(e,dt,A){const G=A.G,p2=e.phase===2;
   e.tx=A.W/2+Math.sin(G.t*0.45)*38;e.ty=36+Math.sin(G.t*0.9)*5;
   const open=!A.wallsAlive(e);if(open&&e.phase===1){e.phase=2;A.banner('CORE EXPOSED','#7fe7ff',1.5);A.SFX.alarm();}
   if(e.a1<=0){e.a1=p2?1.0:1.7;for(const ox of [-22,-12,12,22])A.bossFire(e,Math.PI/2,120,'laser',1,ox,e.h/2);}
   if(p2&&e.a2<=0){e.a2=1.4;for(const ox of [-22,22])A.bossFire(e,A.aimAt(e.x+ox,e.y),110,'laser',1,ox,e.h/2);}}},
 {id:'bio',name:'XENO BIOMECH',unlock:{wave:25},hp:10,body:0.6,escorts:true,
  half:["..p.........",".ppp......vv","pp.pp...vvpp","p...ppvvppee","....pppppeel","...ppeppeell","..ppeepppell","..peep.ppeyy","..pep..ppyoy","...p...pppyy",".......ppppe","........pp.p"],
  setup(e,A){const hh=e.h/2;e.ty=36;e.tail=[];for(let i=0;i<5;i++){const p={kind:'block',ox:0,oy:0,w:6,h:6,seg:i};e.tail.push(p);e.parts.push(p);}
   e.parts.push({kind:'weak',ox:0,oy:hh-6,w:10,h:12,mult:2.5,eye:{oy:2,c:'#ffe066'}});},
  update(e,dt,A){const G=A.G,p2=e.phase===2;
   e.tx=A.W/2+Math.sin(G.t*0.5)*28;e.ty=36+Math.sin(G.t*0.8)*4;
   const spd=p2?2.6:1.6,hh=e.h/2;
   for(const p of e.tail){const i=p.seg;p.oy=hh+2+i*5;p.ox=Math.sin(G.t*spd+i*0.5)*(3+i*2.6);}
   if(e.a1<=0){e.a1=p2?1.1:1.5;A.bossFire(e,A.aimAt(e.x,e.y),48,'big',2,0,hh-4);}
   if(p2&&e.a2<=0){e.a2=2.2;const o=Math.random()*A.TAU;for(let i=0;i<12;i++)A.bossFire(e,o+i*A.TAU/12,46,'orb',0.8,0,0);}}}
);
/* THE MAW: sector 10 waves 91-95. One phase per wave. Core ignores damage while limbs live (phase 5 is armored instead). */
(function(){
 const FLESH=['#10281c','#242a38','#241433','#301018','#301808'];
 const FLESH2=['#1f6b40','#4a556c','#5a3088','#7a2238','#7a4010'];
 function limb(base,amp,freq,curl,seed,n,len,bx,by,hp,col,arm){
  return {base,amp,freq,curl,seed,n,len,bx,by,hp,col,arm};
 }
 const P1=[
  limb(2.35,0.45,1.15,0.22,0.2,12,14,-18,4,5.5,'#6bff8a',1),
  limb(1.95,0.35,1.35,0.28,1.1,12,14,-7,10,5.5,'#2e8b57',1),
  limb(1.2,0.35,1.25,0.28,2.2,12,14,7,10,5.5,'#2e8b57',1),
  limb(0.8,0.45,1.1,0.22,3.4,12,14,18,4,5.5,'#6bff8a',1)];
 const P2=[
  limb(2.4,0.55,1.7,0.26,0.5,12,14,-18,2,6,'#9aa58a',0.75),
  limb(1.9,0.4,1.9,0.3,1.4,12,14,-7,10,6,'#6d7a72',0.75),
  limb(1.25,0.4,1.8,0.3,2.6,12,14,7,10,6,'#6d7a72',0.75),
  limb(0.75,0.55,1.65,0.26,3.7,12,14,18,2,6,'#9aa58a',0.75)];
 const P3=[
  limb(2.15,0.6,1.05,0.2,0.4,14,15,-14,6,6.5,'#b14aed',1),
  limb(1.0,0.6,1.15,0.2,2.0,14,15,14,6,6.5,'#b14aed',1)];
 const P4=[
  limb(2.7,0.75,2.15,0.32,0.3,10,13,-22,-2,4.2,'#ff4d5e',1),
  limb(2.2,0.55,2.4,0.36,1.1,11,13,-12,8,4.2,'#ff5ccf',1),
  limb(1.7,0.45,2.2,0.3,2.2,11,14,-4,12,4.4,'#ff4d5e',1),
  limb(1.45,0.45,2.3,0.3,3.1,11,14,4,12,4.4,'#ff4d5e',1),
  limb(0.95,0.55,2.4,0.36,4.2,11,13,12,8,4.2,'#ff5ccf',1),
  limb(0.45,0.75,2.15,0.32,5.1,10,13,22,-2,4.2,'#ff4d5e',1)];
 const P5=[
  limb(2.45,0.9,2.6,0.38,0.6,12,14,-16,2,4.2,'#ff9f1c',1),
  limb(1.85,0.65,2.85,0.42,1.7,12,14,-6,10,4.6,'#ff4d5e',1),
  limb(1.3,0.65,2.75,0.42,2.8,12,14,6,10,4.6,'#ff4d5e',1),
  limb(0.7,0.9,2.55,0.38,3.9,12,14,16,2,4.2,'#ff9f1c',1)];
 const PHASES=[null,P1,P2,P3,P4,P5];
 function live(e){let n=0;const a=e.limbs||[];for(let i=0;i<a.length;i++)if(a[i].hp>0)n++;return n;}
 function tip(L){return L.segs[L.segs.length-1]||{x:L.bx,y:L.by};}
 function syncLimbs(e){let hp=0,max=0;for(const L of e.limbs){max+=L.maxHp;hp+=Math.max(0,L.hp);}e.maxHp=Math.max(1,max);e.hp=Math.max(1,hp);}
 function takeSeg(e){const s=e.segPool.pop()||{x:0,y:0,vx:0,vy:0,ang:0};s.x=s.y=s.vx=s.vy=s.ang=0;return s;}
 function buildLimbs(e,A,defs){
  e.segPool=e.segPool||[];
  if(e.limbs)for(const L of e.limbs)for(const s of L.segs)e.segPool.push(s);
  e.limbs=[];e.parts=[];
  const base=A.eHP(A.S.wave);
  for(let i=0;i<defs.length;i++){const d=defs[i];
   const L={i,hp:base*d.hp,maxHp:base*d.hp,flash:0,flung:0,slam:0,base:d.base,amp:d.amp,freq:d.freq,curl:d.curl,seed:d.seed,bx:d.bx,by:d.by,len:d.len,col:d.col,arm:d.arm,segs:[]};
   for(let s=0;s<d.n;s++){L.segs.push(takeSeg(e));e.parts.push({kind:'limb',li:i,si:s,ox:d.bx,oy:d.by,w:18,h:18,flash:0});}
   e.limbs.push(L);}
  e.parts.push({kind:'core',ox:0,oy:2,w:26,h:22,flash:0});
 }
 function poseLimb(e,L,t,A){
  if(L.hp<=0){if(!L.flung)return;for(const s of L.segs){s.x+=s.vx;s.y+=s.vy;s.vy+=0.18;}return;}
  let ang=L.base+Math.sin(t*L.freq+L.seed)*L.amp,curl=L.curl;
  if(L.slam>0){ang=Math.atan2(A.G.p.y-(e.y+L.by),A.G.p.x-(e.x+L.bx));curl*=0.15;}
  let x=L.bx,y=L.by;
  for(let i=0;i<L.segs.length;i++){ang+=Math.sin(t*L.freq*0.85+L.seed+i*0.62)*curl;x+=Math.cos(ang)*L.len;y+=Math.sin(ang)*L.len;const s=L.segs[i];s.x=x;s.y=y;s.ang=ang;}
 }
 function touchPlayer(e,A){
  if(e.touch>0)return;const P=A.G.p;
  for(const L of e.limbs){if(L.hp<=0)continue;const n=L.segs.length;
   for(let i=0;i<n;i++){if(L.slam<=0&&i<n-3)continue;const s=L.segs[i];
    if(Math.abs(e.x+s.x-P.x)<7&&Math.abs(e.y+s.y-P.y)<8){e.touch=0.45;A.damagePlayer(A.eDmg(A.S.wave)*(L.slam>0?1.8:0.65));return;}}}
 }
 function minions(A){let n=0;for(const o of A.G.enemies)if(!o.dead&&!o.boss)n++;return n;}
 function fan(e,A,ox,oy,aim,spread,n,sp,kind,dmg){for(let i=0;i<n;i++)A.bossFire(e,aim+(i-(n-1)/2)*spread,sp,kind,dmg,ox,oy);}
 function rayHit(e,A){
  const ang=e.laser||1.57,P=A.G.p,px=P.x-e.x,py=P.y-e.y,proj=px*Math.cos(ang)+py*Math.sin(ang);
  if(proj<12||proj>230)return false;
  const lx=e.x+Math.cos(ang)*proj,ly=e.y+Math.sin(ang)*proj;
  return Math.abs(P.x-lx)<8&&Math.abs(P.y-ly)<9;
 }
 function openEye(e,A){
  e.coreOpen=true;e.holdKill=true;e.bodyMult=1;e.breaking=0;
  const hp=A.eHP(A.S.wave)*10;e.hp=hp;e.maxHp=hp;
  e.parts=e.parts.filter(p=>p.kind!=='limb');
  e.onCoreBreak=()=>A.nextPhase(e);e.a1=0.8;e.a2=1.6;
  A.banner('EYE OPEN','#ffe066',1.5);A.SFX.roar();A.G.flash=Math.max(A.G.flash,0.75);A.G.shake=Math.max(A.G.shake,8);
 }
 function attacks(e,dt,A){
  const f=e.form,G=A.G;
  if(f===3&&e.coreOpen){
   if(e.a1<=0){e.a1=1.15;if(G.eb.length<140){A.bossFire(e,e.laser+0.85,68,'spore',0.5,-10,4);A.bossFire(e,e.laser-0.85,68,'spore',0.5,10,4);}}
   if(!G.dead&&rayHit(e,A)&&(e._lh||0)<=0){e._lh=0.18;A.damagePlayer(A.eDmg(A.S.wave)*0.55);G.shake=Math.max(G.shake,2);}
   return;
  }
  if(f===5){
   e.spin=(e.spin||0)+dt*2.4;
   if(e.a1<=0&&G.eb.length<150){const n=live(e)>0?2:6;e.a1=n>2?0.28:0.42;for(let i=0;i<n;i++)A.bossFire(e,e.spin+i*A.TAU/n,62,'orb',0.55,0,6);}
   if(e.a2<=0){e.a2=0.8;for(const L of e.limbs)if(L.hp>0){const s=tip(L),aim=Math.atan2(G.p.y-(e.y+s.y),G.p.x-(e.x+s.x));fan(e,A,s.x,s.y,aim,0.22,3,92,'bolt',0.7);}}
   return;
  }
  if(e.a1<=0){
   e.a1=f===4?0.7:f===2?1.1:1.35;
   for(const L of e.limbs)if(L.hp>0){const s=tip(L),aim=Math.atan2(G.p.y-(e.y+s.y),G.p.x-(e.x+s.x));
    fan(e,A,s.x,s.y,aim,0.18,f===4?4:3,f===4?104:76,f===2?'spore':'orb',0.62);}
  }
  if(e.a2<=0){
   e.a2=f===4?3.4:f===2?3.1:4.1;
   const ls=[];for(const L of e.limbs)if(L.hp>0)ls.push(L);
   if(ls.length)ls[(A.rnd(0,ls.length))|0].slam=0.7;
   if((f===2||f===4)&&minions(A)<(f===4?6:4))A.mkEnemy(f===4?'fighter':'scout',{counts:false,rew:0.15,hpMul:0.4,x:A.clamp(e.x+A.rnd(-48,48),14,A.W-14),y:Math.max(6,e.y+18)});
  }
 }
 function chain(ctx,e,L){
  const col=L.flash>0?'#ffffff':L.slam>0?'#ff9f1c':L.col,segs=L.segs;
  ctx.fillStyle=col;
  for(let i=0;i<segs.length;i++){
   const s=segs[i],x=e.x+s.x,y=e.y+s.y,rad=L.arm<1?3:2;
   ctx.fillRect((x-rad)|0,(y-rad)|0,rad*2+1,rad*2+1);
   if(i){const p=segs[i-1],dx=s.x-p.x,dy=s.y-p.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/2));
    for(let k=1;k<steps;k++)ctx.fillRect((e.x+p.x+dx*k/steps)|0,(e.y+p.y+dy*k/steps)|0,2,2);}
   ctx.fillStyle=L.flash>0?'#fff':'#e8ffe8';ctx.fillRect((x-1)|0,(y-1)|0,2,2);ctx.fillStyle=col;
  }
 }
 function blob(ctx,x,y,r,c1,c2){
  x=x|0;y=y|0;
  for(let j=-r;j<=r;j+=2){const span=Math.round(Math.sqrt(Math.max(0,r*r-j*j))),inner=Math.max(0,r-6),span2=Math.round(Math.sqrt(Math.max(0,inner*inner-j*j)));
   ctx.fillStyle=((j+r)&2)?c1:c2;const w=span-span2;if(w>0){ctx.fillRect(x-span,y+j,w,2);ctx.fillRect(x+span2,y+j,w,2);}}
 }
 IV.content.bosses.push({
  id:'maw',name:'THE MAW',unlock:{wave:90,sector:10},hp:8,body:0,escorts:false,final:true,phaseLock:true,
  half:['...vvvvvvv','..veeeeeev','.veeeeweev','veelllleev','vellwwwlev','veelllleev','.veeeeeeev','..vpppppev','...ppppppv','....pppp..','.....pp...','......p...'],
  setup(e,A){
   const f=e.form=e.form||1;
   e.T={hp:14,rew:18,spd:f>=4?24:15,fire:0,dmg:1.4,shots:0,ai:'boss'};
   e.tx=A.W/2;e.ty=24;e.breaking=0;e.breakT=0;e.touch=0;e.coreOpen=false;e.holdKill=false;e.bodyMult=0;e.onCoreBreak=null;
   e.a1=1.1;e.a2=2.2;
   buildLimbs(e,A,PHASES[f]||P1);
   if(f===5){const hp=A.eHP(A.S.wave)*16;e.hp=hp;e.maxHp=hp;e.coreOpen=true;e.bodyMult=0.42;e.holdKill=false;}
   else syncLimbs(e);
  },
  update(e,dt,A){
   const t=A.G.t,fast=e.form>=4?1.8:1;
   e.tx=A.W/2+Math.sin(t*0.32*fast)*18;e.ty=24+Math.sin(t*0.48)*4;
   if(e.touch>0)e.touch-=dt;
   if(e._lh>0)e._lh-=dt;
   if(e.form===3&&e.coreOpen)e.laser=1.15+Math.sin((e.sweep=(e.sweep||0)+dt*0.9))*1.2;
   for(const L of e.limbs){L.flash=Math.max(0,(L.flash||0)-dt);if(L.slam>0)L.slam-=dt;poseLimb(e,L,t,A);}
   for(const p of e.parts){if(p.kind!=='limb')continue;const L=e.limbs[p.li],s=L&&L.segs[p.si];if(!s)continue;p.ox=s.x;p.oy=s.y;}
   if(!A.G.dead)touchPlayer(e,A);
   if(e.form<5&&!e.coreOpen&&live(e)===0){
    if(!e.breaking){e.breaking=1;e.breakT=0.55;A.G.shake=Math.max(A.G.shake,8);}
    e.breakT-=dt;
    if(e.breakT<=0){e.breaking=0;if(e.form===3)openEye(e,A);else A.nextPhase(e);}
    return;
   }
   e.breaking=0;
   attacks(e,dt,A);
   if(e.form===5)e.bodyMult=live(e)>0?0.42:1;
   else if(!e.coreOpen){e.bodyMult=0;syncLimbs(e);}
  },
  draw(e,A,ctx){
   const f=e.form||1,open=e.coreOpen||f>=5;
   blob(ctx,e.x,e.y-2,f>=5?30:26,FLESH[f-1],FLESH2[f-1]);
   if(f>=4)blob(ctx,e.x,e.y-6,14,'#1a0a10','#4a1020');
   for(const L of e.limbs)chain(ctx,e,L);
   ctx.fillStyle='#0b0f1e';ctx.fillRect((e.x-9)|0,(e.y-(open?8:4))|0,18,open?16:8);
   ctx.fillStyle=f>=5?'#ff4d5e':f===3?'#ffe066':'#6bff8a';
   ctx.fillRect((e.x-7)|0,(e.y-(open?5:2))|0,14,open?11:4);
   if(open){const k=Math.round(Math.sin(A.G.t*(f>=5?6:3))*(f>=5?4:3));ctx.fillStyle='#05060e';ctx.fillRect((e.x-2+k)|0,(e.y-2)|0,5,5);ctx.fillStyle='#fff';ctx.fillRect((e.x-1+k)|0,(e.y-1)|0,2,2);}
   else{ctx.fillStyle='#04140c';ctx.fillRect((e.x-4)|0,(e.y-1)|0,8,2);}
   ctx.fillStyle='#e4d2b0';
   for(let i=-3;i<=3;i++)ctx.fillRect((e.x+i*4)|0,(e.y+8)|0,2,3+(i&1));
   if(f===3&&e.coreOpen&&e.laser!=null){ctx.fillStyle=(A.G.t*16|0)%2?'#fff6c2':'#ff4d5e';
    for(let d=10;d<250;d+=3)ctx.fillRect((e.x+Math.cos(e.laser)*d)|0,(e.y+Math.sin(e.laser)*d)|0,2,2);}
   for(const L of e.limbs)if(L.hp>0){const bx=(e.x+L.bx)|0,by=(e.y+L.by-8)|0;ctx.fillStyle='#000';ctx.fillRect(bx-8,by,16,3);ctx.fillStyle=L.col;ctx.fillRect(bx-7,by+1,Math.round(14*Math.max(0,L.hp)/L.maxHp),1);}
  }
 });
})();

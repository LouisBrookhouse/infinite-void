/* BOSSES. A boss wave happens every 5th wave; the boss is picked by rotating through the bosses whose gate is
 * open at the CURRENT wave, in list order (boss #k of the rotation = (wave/5 - 1) mod available).
 * Contract: {id, name, unlock (gate, use wave multiples of 5), hp (x wave HP baseline), body (damage mult on hull,
 *   weak points do more), escorts (bool: engine sends scouts/fighters), palette ('scheme' | {letter:'X'|'Y'|'#hex'}),
 *   half:[rows] (left half sprite, drawn at 2x), setup(e,A) adds parts/initial state,
 *   update(e,dt,A) moves (set e.tx/e.ty) and attacks (timers e.a1/e.a2 count down automatically; e.phase 1|2,
 *   phase 2 starts at 50% HP), draw?(e,A,ctx) extra effects}.
 * Parts: {kind:'weak', ox, oy, w, h, mult, eye?:{oy,c}} | {kind:'wall', ..., hp, maxHp} | {kind:'block', ...}
 *   | {kind:'limb', li, si, ox, oy, w, h} | {kind:'core', ox, oy, w, h} | {kind:'eye', ox, oy, w, h, hp, maxHp}.
 * tier: 'standard' (every-5 rotation) | 'elite' (sector set-piece, not in the rotation) | 'mega'
 *   (multi-phase encounter, not in the rotation). THE MAW is mega, waves 91-95 (fromWave, phases).
 *   The game does not end. More bosses of any tier can be added, including more mega bosses.
 * A (engine API): W,H,TAU,rnd,G,S,eDmg,aimAt,bossFire(e,ang,speed,kind,dmgMult,ox,oy),mkEnemy,spawnInvaderGroup,
 *   damagePlayer,addText,banner,SFX,wallsAlive. Bullet kinds: orb|bolt|zig|laser|big|snipe. */
IV.content.bosses.push(
 {id:'dread',name:'DREADNOUGHT',tier:'standard',unlock:{wave:5},hp:14,body:1,escorts:true,palette:'scheme',
  half:["dd...........","dXd........gw","dXXd......gXX",".dXXd....gXXX",".dXXXdddgXXdd","..dXXXXXXXdYY","..dXXddXXdYYy","...dXdwdXXdYY","...dXdddXXXdd","....dXXXXXXXX",".....dXXdXXdX","......dXd.dXr",".......d...dr","............r"],
  setup(e,A){const hh=e.h/2;e.parts.push({kind:'weak',ox:0,oy:hh-6,w:8,h:12,mult:2,eye:{oy:hh-6,c:'#ff4d5e'}});},
  update(e,dt,A){const G=A.G,p2=e.phase===2;
   e.tx=A.W/2+Math.sin(G.t*0.7)*50;e.ty=42+Math.sin(G.t*1.3)*8;
   if(e.a1<=0){e.a1=p2?1.6:1.3;const a=A.aimAt(e.x,e.y);for(let i=0;i<5;i++)A.bossFire(e,a+(i-2)*0.22,72);}
   if(p2&&e.a2<=0){e.a2=0.11;e.ang+=0.47;A.bossFire(e,e.ang,52,'orb',0.8,0,0);A.bossFire(e,e.ang+Math.PI,52,'orb',0.8,0,0);}}},
 {id:'galaga',name:'BOSS GALAGA',tier:'standard',unlock:{wave:10},hp:13,body:1,escorts:false,
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
 {id:'ufo',name:'MOTHERSHIP',tier:'standard',unlock:{wave:15},hp:15,body:0.6,escorts:false,palette:{r:'X'},
  half:["...........ddddd","........dddrrrrr","......ddrrrrrrrr","....ddrrwrrwrrwr","..ddrrrrrrrrrrrr","ddrrrrrrrrrrrrrr",".dddyddyddyddydd","...ddddddddddddd",".........ddccccc","..........dddddd"],
  setup(e,A){const hh=e.h/2;e.ty=34;e.parts.push({kind:'weak',ox:0,oy:hh-4,w:12,h:8,mult:2.5,eye:{oy:hh-3,c:'#7fe7ff'}});},
  update(e,dt,A){const G=A.G,W=A.W,p2=e.phase===2;
   e.ty=34;e.tx=e.x+e.dirx*60;if(e.x>W-e.w/2-2)e.dirx=-1;if(e.x<e.w/2+2)e.dirx=1;
   if(e.a1<=0){e.a1=p2?0.3:0.45;A.bossFire(e,Math.PI/2,48,'zig',0.9,A.rnd(-e.w/2+6,e.w/2-6),e.h/2-2);}
   if(p2&&e.a2<=0){e.a2=2.4;const a=A.aimAt(e.x,e.y);A.bossFire(e,a,90,'bolt',1,-8);A.bossFire(e,a,90,'bolt',1,8);if(G.marches.length<1)A.spawnInvaderGroup(8,false);}}},
 {id:'core',name:'BIG CORE',tier:'standard',unlock:{wave:20},hp:12,body:0.15,escorts:true,
  half:["............gg","........gggggd","....gggggddddd","..ggddddddgggb","gggddddddgbbbc","gdddddddgbbccw","gggddddddgbbbc","..ggddddddgggb","....gggggddddd","........gggggd","............gg"],
  setup(e,A){const hh=e.h/2,hp=e.maxHp;e.ty=36;
   for(const k of [4,10,16])e.parts.push({kind:'wall',ox:0,oy:hh+k,w:14,h:4,hp:hp*0.1,maxHp:hp*0.1,flash:0});
   e.parts.push({kind:'weak',ox:0,oy:3,w:10,h:hh*2-6,mult:1.5,guard:true,core:true});},
  update(e,dt,A){const G=A.G,p2=e.phase===2;
   e.tx=A.W/2+Math.sin(G.t*0.45)*38;e.ty=36+Math.sin(G.t*0.9)*5;
   const open=!A.wallsAlive(e);if(open&&e.phase===1){e.phase=2;A.banner('CORE EXPOSED','#7fe7ff',1.5);A.SFX.alarm();}
   if(e.a1<=0){e.a1=p2?1.0:1.7;for(const ox of [-22,-12,12,22])A.bossFire(e,Math.PI/2,120,'laser',1,ox,e.h/2);}
   if(p2&&e.a2<=0){e.a2=1.4;for(const ox of [-22,22])A.bossFire(e,A.aimAt(e.x+ox,e.y),110,'laser',1,ox,e.h/2);}}},
 {id:'bio',name:'XENO BIOMECH',tier:'standard',unlock:{wave:25},hp:8.5,body:0.6,escorts:true,
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
/* THE MAW: a wall of flesh across the top of sector 10, waves 91-95. Four Hungry tethers.
 * HP budget matches 1.1.1: P1 22, P2 24 at 0.75 taken, P3 23 on two eyes, P4 25.6, P5 17.6 then core 16. */
(function(){
 const MEAT=['#0b0f1e','#1b2b5a','#5a2a7a','#6b5a4a'];
 const HURT=['#0b0f1e','#1b2b5a','#5a2a7a','#ff4d5e'];
 const PHASE=[
  {ramp:MEAT,hurt:HURT,flesh:'#5a2a7a',hi:'#b14aed',deep:'#0b0f1e',edge:'#0b0f1e',tooth:'#c9b79c',mouth:'#0b0f1e',gum:'#5a2a7a'},
  {ramp:['#0b0f1e','#1b2b5a','#5a2a7a','#5a2a7a'],hurt:HURT,flesh:'#5a2a7a',hi:'#b14aed',deep:'#0b0f1e',edge:'#0b0f1e',tooth:'#c9b79c',mouth:'#0b0f1e',gum:'#5a2a7a'},
  {ramp:MEAT,hurt:HURT,flesh:'#5a2a7a',hi:'#ff4d5e',deep:'#0b0f1e',edge:'#0b0f1e',tooth:'#c9b79c',mouth:'#0b0f1e',gum:'#5a2a7a'},
  {ramp:['#0b0f1e','#1b2b5a','#5a2a7a','#5a2a7a'],hurt:HURT,flesh:'#5a2a7a',hi:'#ff4d5e',deep:'#0b0f1e',edge:'#0b0f1e',tooth:'#c9b79c',mouth:'#0b0f1e',gum:'#5a2a7a'},
  {ramp:MEAT,hurt:HURT,flesh:'#5a2a7a',hi:'#ff4d5e',deep:'#0b0f1e',edge:'#0b0f1e',tooth:'#c9b79c',mouth:'#1b2b5a',gum:'#5a2a7a'}];
 const LIM=1.15,ROOT=9,TIPR=3.2;
 const HUNG=[
  {z:0,len:11,pts:[[-72,20],[-84,46],[-70,76],[-78,104]]},
  {z:1,len:11,pts:[[-26,22],[-38,50],[-16,80],[-30,108]]},
  {z:1,len:11,pts:[[26,22],[38,50],[16,80],[30,108]]},
  {z:0,len:11,pts:[[72,20],[84,46],[70,76],[78,104]]}];
 function spec(i,hp,arm,freq,amp,seed){return {i,hp,arm,freq,amp,seed};}
 const P1=[spec(0,5.5,1,0.85,4,0.4),spec(1,5.5,1,0.95,5,1.7),spec(2,5.5,1,0.9,5,3.1),spec(3,5.5,1,0.88,4,4.4)];
 const P2=[spec(0,6,0.75,1.15,4,0.5),spec(1,6,0.75,1.25,5,1.8),spec(2,6,0.75,1.2,5,3.0),spec(3,6,0.75,1.1,4,4.6)];
 const P4=[spec(0,6.4,1,2.15,6,0.3),spec(1,6.4,1,2.3,7,1.4),spec(2,6.4,1,2.25,7,2.8),spec(3,6.4,1,2.1,6,4.2)];
 const P5=[spec(0,4.4,1,2.4,5,0.6),spec(1,4.4,1,2.55,6,1.8),spec(2,4.4,1,2.5,6,3.0),spec(3,4.4,1,2.35,5,4.2)];
 function live(e){let n=0;for(const L of e.limbs||[])if(L.hp>0)n++;return n;}
 function eyesLeft(e){let n=0;for(const p of e.parts||[])if(p.kind==='eye'&&p.hp>0)n++;return n;}
 function tip(L){return L.segs[L.segs.length-1]||{x:L.bx,y:L.by};}
 function syncLimbs(e){let hp=0,max=0;for(const L of e.limbs){max+=L.maxHp;hp+=Math.max(0,L.hp);}e.maxHp=Math.max(1,max);e.hp=Math.max(1,hp);}
 function syncEyes(e){let hp=0,max=0;for(const p of e.parts)if(p.kind==='eye'){max+=p.maxHp;hp+=Math.max(0,p.hp);}e.maxHp=Math.max(1,max);e.hp=Math.max(1,hp);}
 function takeSeg(e){const s=e.segPool.pop()||{x:0,y:0,ang:0};s.x=s.y=s.ang=0;return s;}
 function chaikin(pts){
  let p=pts;
  for(let n=0;n<3;n++){const q=[p[0]];
   for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];
    q.push({x:a.x*0.75+b.x*0.25,y:a.y*0.75+b.y*0.25});
    q.push({x:a.x*0.25+b.x*0.75,y:a.y*0.25+b.y*0.75});}
   q.push(p[p.length-1]);p=q;}
  return p;
 }
 function splineAngs(ctrl,n,len){
  const smooth=chaikin(ctrl),samples=[];
  let px=smooth[0].x,py=smooth[0].y,idx=1,carry=0;
  while(samples.length<n&&idx<smooth.length){
   const dx=smooth[idx].x-px,dy=smooth[idx].y-py,d=Math.hypot(dx,dy);
   if(d<1e-4){idx++;continue;}
   const need=len-carry;
   if(d<need){carry+=d;px=smooth[idx].x;py=smooth[idx].y;idx++;continue;}
   px+=dx/d*need;py+=dy/d*need;carry=0;samples.push({x:px,y:py});
  }
  const angs=[];let x0=smooth[0].x,y0=smooth[0].y;
  for(const s of samples){angs.push(Math.atan2(s.y-y0,s.x-x0));x0=s.x;y0=s.y;}
  for(let i=1;i<angs.length;i++){let d=angs[i]-angs[i-1];
   while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
   if(d>LIM)d=LIM;if(d<-LIM)d=-LIM;angs[i]=angs[i-1]+d;}
  while(angs.length<n)angs.push(angs.length?angs[angs.length-1]:1.2);
  return {origin:{x:smooth[0].x,y:smooth[0].y},angs};
 }
 function fk(origin,angs,len){
  const pts=[{x:origin.x,y:origin.y}];let x=origin.x,y=origin.y;
  for(let i=0;i<angs.length;i++){x+=Math.cos(angs[i])*len;y+=Math.sin(angs[i])*len;pts.push({x,y});}
  return pts;
 }
 function prep(slot){
  if(slot.ready)return slot;
  const ctrl=slot.pts.map(p=>({x:p[0],y:p[1]}));
  const smooth=chaikin(ctrl);let plen=0;
  for(let i=1;i<smooth.length;i++)plen+=Math.hypot(smooth[i].x-smooth[i-1].x,smooth[i].y-smooth[i-1].y);
  slot.n=Math.max(6,Math.round(plen/slot.len)-1);
  const pack=splineAngs(ctrl,slot.n,slot.len);
  slot.origin=pack.origin;slot.restJ=fk(pack.origin,pack.angs,slot.len);slot.ready=1;return slot;
 }
 function thick(i,n){const u=n<=1?1:i/(n-1);return ROOT*(1-u)+TIPR*u;}
 function corePart(){return {kind:'core',ox:0,oy:10,w:30,h:16,flash:0};}
 function buildLimbs(e,A,defs){
  e.segPool=e.segPool||[];
  if(e.limbs)for(const L of e.limbs)for(const s of L.segs)e.segPool.push(s);
  e.limbs=[];e.parts=[];
  const base=A.eHP(A.S.wave);
  for(let i=0;i<defs.length;i++){const d=defs[i],slot=prep(HUNG[d.i]);
   const L={i,hp:base*d.hp,maxHp:base*d.hp,flash:0,flashSi:-1,flung:0,slam:0,z:slot.z,
    freq:d.freq,amp:d.amp,seed:d.seed,bx:slot.pts[0][0],by:slot.pts[0][1],n:slot.n,len:slot.len,arm:d.arm,segs:[],angs:null,joints:null,fall:null};
   for(let s=0;s<slot.n;s++){L.segs.push(takeSeg(e));e.parts.push({kind:'limb',li:i,si:s,ox:L.bx,oy:L.by,w:8,h:8,flash:0});}
   e.limbs.push(L);}
  e.parts.push(corePart());
 }
 function buildEyes(e,A){
  e.limbs=[];e.parts=[];
  const base=A.eHP(A.S.wave),hp=base*11.5;
  e.parts.push({kind:'eye',ox:-46,oy:-2,w:18,h:22,hp,maxHp:hp,flash:0,laser:1.3,sweep:0});
  e.parts.push({kind:'eye',ox:46,oy:-2,w:18,h:22,hp,maxHp:hp,flash:0,laser:1.8,sweep:1.4});
  e.parts.push(corePart());
  syncEyes(e);
 }
 function controls(L,t,aim){
  const src=HUNG[L.i].pts,pts=src.map(p=>({x:p[0],y:p[1]}));
  const n=pts.length;
  for(let i=1;i<n;i++){const k=i/(n-1),w=Math.sin(t*L.freq+L.seed+k*1.7)*L.amp*k;
   const dx=pts[i].x-pts[i-1].x,dy=pts[i].y-pts[i-1].y,h=Math.hypot(dx,dy)||1;
   pts[i].x+=(-dy/h)*w;pts[i].y+=(dx/h)*w;}
  if(L.slam>0){const u=Math.min(1,L.slam/0.7)*0.82,tx=aim.x,ty=aim.y;
   for(let i=1;i<n;i++){const k=Math.pow(i/(n-1),1.35)*u;
    pts[i].x+=(pts[0].x+(tx-pts[0].x)*(i/(n-1))-pts[i].x)*k;
    pts[i].y+=(pts[0].y+(ty-pts[0].y)*(i/(n-1))-pts[i].y)*k;}}
  return pts;
 }
 function tickFall(e,L,dt,A,skin){
  if(!L.fall){
   const slot=HUNG[L.i],joints=L.joints||slot.restJ,cut=Math.min(3,joints.length-2);
   let cx=0,cy=0,c=0;const body=[];
   for(let i=cut;i<joints.length;i++){cx+=joints[i].x;cy+=joints[i].y;c++;}
   cx/=c;cy/=c;
   for(let i=cut;i<joints.length;i++)body.push({x:joints[i].x-cx,y:joints[i].y-cy,r:thick(Math.min(L.n-1,i),L.n)});
   L.fall={x:cx,y:cy,vx:(cx<0?-1:1)*22,vy:28,ang:0,va:(cx<0?-1:1)*1.4,life:1.35,pts:body};
   const wx=e.x+cx,wy=e.y+cy;
   A.explode(wx,wy,0.8,skin.hi);
   for(let i=0;i<12;i++){const a=Math.random()*6.283,sp=18+Math.random()*50;A.addPart(wx,wy,Math.cos(a)*sp,Math.sin(a)*sp,0.4+Math.random()*0.45,i%3?skin.flesh:'#ff4d5e',2);}
  }
  const f=L.fall;if(f.life<=0)return;
  f.vy+=340*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.ang+=f.va*dt;f.life-=dt;
 }
 function poseLimb(e,L,dt,A,skin){
  if(L.hp<=0){tickFall(e,L,dt,A,skin);return;}
  const aim={x:A.G.p.x-e.x,y:A.G.p.y-e.y};
  const pack=splineAngs(controls(L,A.G.t,aim),L.n,L.len);
  if(!L.angs)L.angs=pack.angs.slice();
  const k=1-Math.exp(-10*dt);
  for(let i=0;i<L.n;i++){let d=(pack.angs[i]||0)-L.angs[i];
   while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;L.angs[i]+=d*k;}
  const joints=fk(pack.origin,L.angs,L.len);L.joints=joints;
  for(let i=0;i<L.n;i++){const a=joints[i],b=joints[i+1],s=L.segs[i];
   s.x=(a.x+b.x)*0.5;s.y=(a.y+b.y)*0.5;s.ang=L.angs[i];}
 }
 function touchPlayer(e,A){
  if(e.touch>0)return;const P=A.G.p;
  for(const L of e.limbs){if(L.hp<=0)continue;const n=L.segs.length;
   for(let i=0;i<n;i++){if(L.slam<=0&&i<n-3)continue;const s=L.segs[i];
    if(Math.abs(e.x+s.x-P.x)<7&&Math.abs(e.y+s.y-P.y)<8){e.touch=0.45;A.damagePlayer(A.eDmg(A.S.wave)*(L.slam>0?1.8:0.65));return;}}}
 }
 function minions(A){let n=0;for(const o of A.G.enemies)if(!o.dead&&!o.boss)n++;return n;}
 function fan(e,A,ox,oy,aim,spread,n,sp,kind,dmg){for(let i=0;i<n;i++)A.bossFire(e,aim+(i-(n-1)/2)*spread,sp,kind,dmg,ox,oy);}
 function eyeRay(e,A){
  const P=A.G.p;
  for(const p of e.parts){if(p.kind!=='eye'||!(p.hp>0))continue;
   const ang=p.laser,ox=p.ox,oy=p.oy,px=P.x-(e.x+ox),py=P.y-(e.y+oy),proj=px*Math.cos(ang)+py*Math.sin(ang);
   if(proj<10||proj>230)continue;
   const lx=e.x+ox+Math.cos(ang)*proj,ly=e.y+oy+Math.sin(ang)*proj;
   if(Math.abs(P.x-lx)<8&&Math.abs(P.y-ly)<9)return true;}
  return false;
 }
 function attacks(e,dt,A){
  const f=e.form,G=A.G;
  if(f===3){
   for(const p of e.parts)if(p.kind==='eye'&&p.hp>0)p.laser=1.25+Math.sin(G.t*0.9+(p.ox<0?0:2.2))*(p.ox<0?1.05:-1.05);
   if(e.a1<=0){e.a1=1.15;e.spit=0.22;if(G.eb.length<140){A.bossFire(e,1.15,68,'spore',0.5,-8,12);A.bossFire(e,2.0,68,'spore',0.5,8,12);}}
   if(!G.dead&&eyeRay(e,A)&&(e._lh||0)<=0){e._lh=0.18;A.damagePlayer(A.eDmg(A.S.wave)*0.55);G.shake=Math.max(G.shake,2);}
   return;
  }
  if(f===5){
   e.spin=(e.spin||0)+dt*2.4;
   if(e.a1<=0&&G.eb.length<150){const n=live(e)>0?2:6;e.a1=n>2?0.28:0.42;e.spit=0.18;for(let i=0;i<n;i++)A.bossFire(e,e.spin+i*A.TAU/n,62,'orb',0.55,0,10);}
   if(e.a2<=0){e.a2=0.8;for(const L of e.limbs)if(L.hp>0){const s=tip(L),aim=Math.atan2(G.p.y-(e.y+s.y),G.p.x-(e.x+s.x));fan(e,A,s.x,s.y,aim,0.22,3,92,'bolt',0.7);}}
   return;
  }
  if(e.a1<=0){
   e.a1=f===4?0.7:f===2?1.1:1.35;e.spit=0.16;
   for(const L of e.limbs)if(L.hp>0){const s=tip(L),aim=Math.atan2(G.p.y-(e.y+s.y),G.p.x-(e.x+s.x));
    fan(e,A,s.x,s.y,aim,0.18,f===4?4:3,f===4?104:76,f===2?'spore':'orb',0.62);}
  }
  if(e.a2<=0){
   e.a2=f===4?3.4:f===2?3.1:4.1;
   const ls=[];for(const L of e.limbs)if(L.hp>0)ls.push(L);
   if(ls.length)ls[(A.rnd(0,ls.length))|0].slam=0.7;
   if((f===2||f===4)&&minions(A)<(f===4?6:4))A.mkEnemy(f===4?'fighter':'scout',{counts:false,rew:0.15,hpMul:0.4,x:A.clamp(e.x+A.rnd(-20,20),14,A.W-14),y:Math.max(8,e.y+16)});
  }
 }
 function samples(pts,radii){
  const out=[];
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,steps=Math.max(1,Math.ceil(d/2));
   let nx=-dy/d,ny=dx/d;if(ny<0){nx=-nx;ny=-ny;}
   for(let s=0;s<=steps;s++){const u=s/steps;out.push({x:a.x+dx*u,y:a.y+dy*u,r:radii[i-1]+(radii[i]-radii[i-1])*u,nx,ny,i});}}
  return out;
 }
 function tube(ctx,pts,radii,skin,opt){
  const dots=samples(pts,radii),ga=ctx.globalAlpha,al=opt.alpha==null?1:opt.alpha;
  if(al<=0||dots.length<2)return;ctx.globalAlpha=ga*al;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const p of dots){const r=p.r+1;if(p.x-r<x0)x0=p.x-r;if(p.y-r<y0)y0=p.y-r;if(p.x+r>x1)x1=p.x+r;if(p.y+r>y1)y1=p.y+r;}
  x0=x0|0;y0=y0|0;x1=Math.ceil(x1);y1=Math.ceil(y1);
  const ramp=opt.ratio<0.5?skin.hurt:skin.ramp,n=ramp.length;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   let best=1e9,bp=null;
   for(const p of dots){const dx=x+0.5-p.x,dy=y+0.5-p.y,d=dx*dx+dy*dy;if(d<best){best=d;bp=p;}}
   const dist=Math.sqrt(best);if(dist>bp.r)continue;
   const hot=opt.flash>0&&(bp.i===opt.flashSi||bp.i-1===opt.flashSi);
   if(hot){ctx.fillStyle='#ffffff';ctx.fillRect(x,y,1,1);continue;}
   if(dist>bp.r-1){ctx.fillStyle=ramp[0];ctx.fillRect(x,y,1,1);continue;}
   const inv=dist>0.4?1/dist:0,light=IV.art.litUL((x+0.5-bp.x)*inv,(y+0.5-bp.y)*inv);
   const edge=dist>bp.r-2.15;
   let k=1;
   if(edge&&light>0.66)k=n-1;
   else if(light>0.84)k=Math.min(2,n-2);
   if(k<0)k=0;if(k>n-1)k=n-1;
   ctx.fillStyle=ramp[k];ctx.fillRect(x,y,1,1);
  }
  ctx.globalAlpha=ga;
 }
 function drawHungry(ctx,pts,skin,t,arm){
  const b=pts[pts.length-1],a=pts[Math.max(0,pts.length-2)],ang=Math.atan2(b.y-a.y,b.x-a.x);
  const c=Math.cos(ang),s=Math.sin(ang),px=-s,py=c;
  IV.art.disc(ctx,b.x,b.y,7.2,arm<1?skin.hurt:skin.ramp);
  const g=2+((t*8+b.x)|0)%2;
  ctx.fillStyle=skin.mouth;
  for(let k=-2;k<=2;k++)ctx.fillRect((b.x+c*k)|0,(b.y+s*k)|0,2,2);
  ctx.fillStyle=skin.tooth;
  for(const side of [-1,1])for(let k=-2;k<=2;k+=2)ctx.fillRect((b.x+c*k+px*side*g)|0,(b.y+s*k+py*side*g)|0,2,2);
 }
 function radiiFor(n){const r=[];for(let i=0;i<=n;i++)r.push(thick(Math.min(Math.max(0,n-1),i),Math.max(2,n)));return r;}
 function worldJoints(e,joints){const o=[];for(const p of joints)o.push({x:e.x+p.x,y:e.y+p.y});return o;}
 function fillOval(ctx,x,y,rx,ry,col){
  ctx.fillStyle=col;const ry2=ry*ry||1;
  for(let j=-ry;j<=ry;j++){const t=1-(j*j)/ry2;if(t<0)continue;const s=Math.round(rx*Math.sqrt(t));ctx.fillRect((x-s)|0,(y+j)|0,s*2+1,1);}
 }
 function drawWall(ctx,e,skin,t){
  const W=180,top=Math.max(0,(e.y-32)|0),bot=(e.y+20)|0,h=bot-top+1;
  if(h<4)return;
  const ramp=skin.ramp,rgb=ramp.map(IV.art.rgb);
  const c=e._wc||(e._wc=document.createElement('canvas'));
  if(c.width!==W||c.height!==h){c.width=W;c.height=h;}
  const g=c.getContext('2d'),img=g.createImageData(W,h),pix=img.data;
  for(let j=0;j<h;j++){const u=j/(h-1);
   for(let i=0;i<W;i++){
    let light=0.16+(1-i/W)*0.34+(1-u)*0.28;
    if(j<2||j>h-3)light=0.02;
    if(light<0)light=0;if(light>1)light=1;
    const col=rgb[IV.art.toneIndex(ramp.length,light,i,top+j)],p=(j*W+i)*4;
    pix[p]=col[0];pix[p+1]=col[1];pix[p+2]=col[2];pix[p+3]=255;
   }
  }
  g.putImageData(img,0,0);ctx.drawImage(c,0,top);
  for(let x=0;x<W;x++){const wave=(x>>2)&1,yy=bot+wave;
   ctx.fillStyle=skin.gum;ctx.fillRect(x,yy,1,2);ctx.fillStyle=skin.edge;ctx.fillRect(x,yy+2,1,1);}
  const gapL=e.x-20,gapR=e.x+20;
  for(let x=6;x<W-6;x+=8){if(x>gapL&&x<gapR)continue;
   const yy=bot+((x>>2)&1)+2,th=4+(x%3);
   ctx.fillStyle=skin.edge;ctx.fillRect(x-1,yy,4,th+1);ctx.fillStyle=skin.tooth;ctx.fillRect(x,yy,2,th);}
  ctx.fillStyle=skin.flesh;
  for(let i=0;i<5;i++){const x=18+i*34;if(Math.abs(x-e.x)<22)continue;ctx.fillRect(x,bot+6,1,3+(i%3));}
 }
 function drawMouth(ctx,x,y,jaw,skin,form){
  const w=17,h=(5+jaw*16)|0,top=(y-1)|0;
  ctx.fillStyle=skin.edge;ctx.fillRect(x-w-2,top-2,w*2+4,h+7);
  ctx.fillStyle=form>=5?skin.deep:skin.mouth;ctx.fillRect(x-w,top,w*2,h+3);
  if(jaw>0.35){ctx.fillStyle='#ff4d5e';ctx.fillRect(x-5,top+3,10,Math.max(2,h-4));
   if(form>=5){ctx.fillStyle='#ffffff';ctx.fillRect(x-1,top+4,2,2);}}
  ctx.fillStyle=skin.tooth;
  for(let i=-3;i<=3;i++){ctx.fillRect(x+i*5-1,top,2,3+(i&1?1:0));ctx.fillRect(x+i*5,top+h,2,3+(i&1?0:1));}
  ctx.fillStyle=skin.gum;ctx.fillRect(x-w,top+h+3,w*2,2);
 }
 function drawEye(ctx,x,y,open,dead,t,skin){
  const rx=8,ry=dead?4:Math.max(3,(3+open*8)|0);
  fillOval(ctx,x,y,rx+1,ry+1,skin.edge);
  fillOval(ctx,x,y,rx,ry,dead?skin.deep:'#c9b79c');
  if(dead){ctx.fillStyle=skin.edge;ctx.fillRect(x-4,y,9,1);ctx.fillRect(x,y-3,1,7);return;}
  if(open>0.4){
   const ih=Math.max(2,ry>>1);
   ctx.fillStyle='#ff4d5e';ctx.fillRect(x-3,y-ih,7,ih*2+1);
   ctx.fillStyle=skin.edge;ctx.fillRect(x-1,y-ih+1,3,ih*2-1);
   ctx.fillStyle='#ffffff';ctx.fillRect(x-2,y-ih+1,1,1);
  }else{ctx.fillStyle=skin.edge;ctx.fillRect(x-rx+3,y,rx*2-5,1);}
 }
 function advance(e,dt,A){
  if(!e.breaking){e.breaking=1;e.breakT=0.55;A.G.shake=Math.max(A.G.shake,8);}
  e.breakT-=dt;if(e.breakT<=0){e.breaking=0;A.nextPhase(e);}
 }
 IV.content.bosses.push({
  id:'maw',name:'THE MAW',tier:'mega',fromWave:91,phases:5,unlock:{wave:90,sector:10},hp:8,body:0,escorts:false,phaseLock:true,
  half:['....vvkkkk','...vkkkkkk','..vkkkvvkk','.vkkkvvkkk','vkkkvvvkkk','vkkkvkkkkk','vkkkvvvkkk','.vkkkvvkkk','..vkkkkkkk','...vkkkkkk','....vvkkkk','.....vvkk.'],
  setup(e,A){
   const f=e.form=e.form||1;
   e.T={hp:14,rew:18,spd:f>=4?22:14,fire:0,dmg:1.4,shots:0,ai:'boss'};
   e.tx=A.W/2;e.ty=f>=4?52:36;e.breaking=0;e.breakT=0;e.touch=0;e.holdKill=false;e.bodyMult=0;e.onCoreBreak=null;e.spit=0;e.jaw=0.2;
   e.a1=1.1;e.a2=2.2;
   if(f===3)buildEyes(e,A);
   else buildLimbs(e,A,f===2?P2:f===4?P4:f===5?P5:P1);
   if(f===5){const hp=A.eHP(A.S.wave)*16;e.hp=hp;e.maxHp=hp;e.bodyMult=0.42;e.jaw=0.92;}
   else if(f!==3)syncLimbs(e);
  },
  update(e,dt,A){
   const t=A.G.t,f=e.form||1,skin=PHASE[f-1]||PHASE[0];
   const base=f>=4?52:36;
   e.tx=A.W/2+Math.sin(t*0.22)*4;e.ty=base+Math.sin(t*0.55)*(f>=4?6:4);
   e.jaw=f>=5?0.92:(0.2+0.16*Math.sin(t*1.7));
   if(e.spit>0){e.jaw=Math.min(1,e.jaw+0.5);e.spit-=dt;}
   if(e.touch>0)e.touch-=dt;
   if(e._lh>0)e._lh-=dt;
   const core=e.parts&&e.parts.find(p=>p.kind==='core');
   if(core){core.oy=8+e.jaw*6;core.h=12+e.jaw*14;core.w=32;}
   if(f===3){
    syncEyes(e);
    if(eyesLeft(e)===0){advance(e,dt,A);return;}
    e.breaking=0;attacks(e,dt,A);return;
   }
   for(const L of e.limbs){L.flash=Math.max(0,(L.flash||0)-dt);if(L.slam>0)L.slam-=dt;poseLimb(e,L,dt,A,skin);}
   for(const p of e.parts){if(p.kind!=='limb')continue;const L=e.limbs[p.li];if(!L||L.hp<=0||!L.joints)continue;
    const a=L.joints[p.si],b=L.joints[p.si+1];if(!a||!b)continue;
    p.ox=(a.x+b.x)*0.5;p.oy=(a.y+b.y)*0.5;const rr=thick(p.si,L.n);
    p.w=Math.abs(b.x-a.x)+rr*2;p.h=Math.abs(b.y-a.y)+rr*2;
    if(p.si===L.n-1){p.w=Math.max(p.w,16);p.h=Math.max(p.h,16);}}
   if(!A.G.dead)touchPlayer(e,A);
   if(f<5&&live(e)===0){advance(e,dt,A);return;}
   e.breaking=0;attacks(e,dt,A);
   if(f===5)e.bodyMult=live(e)>0?0.42:1;
   else{e.bodyMult=0;syncLimbs(e);}
  },
  draw(e,A,ctx){
   const f=e.form||1,skin=PHASE[f-1]||PHASE[0],t=A.G.t;
   const openEye=f===3?1:f>=5?0.9:f===4?0.72:0.62;
   drawWall(ctx,e,skin,t);
   const order=(e.limbs||[]).slice().sort((a,b)=>a.z-b.z);
   for(const L of order){
    const slot=HUNG[L.i];
    if(L.hp<=0){
     if(slot.restJ){const stump=worldJoints(e,slot.restJ.slice(0,4));
      tube(ctx,stump,radiiFor(3),skin,{flash:0,flashSi:-1,ratio:1,alpha:1});
      IV.art.disc(ctx,stump[stump.length-1].x,stump[stump.length-1].y,thick(2,L.n),skin.hurt);}
     const fall=L.fall;if(fall&&fall.life>0){const c=Math.cos(fall.ang),s=Math.sin(fall.ang),pts=[],radii=[];
      for(const p of fall.pts){pts.push({x:e.x+fall.x+p.x*c-p.y*s,y:e.y+fall.y+p.x*s+p.y*c});radii.push(p.r);}
      const al=Math.max(0,Math.min(1,fall.life/0.4));
      tube(ctx,pts,radii,skin,{flash:0,flashSi:-1,ratio:1,alpha:al});
      if(al>0.35&&pts.length>1)drawHungry(ctx,pts,skin,t,1);}
     continue;
    }
    if(!L.joints)continue;
    IV.art.disc(ctx,e.x+L.bx,e.y+L.by,ROOT+1,skin.ramp);
    const pts=worldJoints(e,L.joints),ratio=L.maxHp?L.hp/L.maxHp:1;
    tube(ctx,pts,radiiFor(L.n),skin,{flash:L.flash,flashSi:L.flashSi|0,ratio,alpha:1});
    drawHungry(ctx,pts,skin,t,L.arm);
    const bx=(e.x+L.bx)|0,by=(e.y+L.by-6)|0;
    ctx.fillStyle='#0b0f1e';ctx.fillRect(bx-6,by,12,2);ctx.fillStyle='#ff4d5e';ctx.fillRect(bx-5,by,Math.round(10*Math.max(0,ratio)),2);
   }
   drawMouth(ctx,e.x|0,(e.y+8)|0,e.jaw||0,skin,f);
   for(const p of e.parts||[])if(p.kind==='eye'){
    drawEye(ctx,(e.x+p.ox)|0,(e.y+p.oy)|0,p.hp>0?openEye:0,!(p.hp>0),t,skin);
    if(p.hp>0){const bx=(e.x+p.ox)|0,by=(e.y+p.oy+12)|0;ctx.fillStyle='#0b0f1e';ctx.fillRect(bx-6,by,12,2);
     ctx.fillStyle='#ff4d5e';ctx.fillRect(bx-5,by,Math.round(10*p.hp/p.maxHp),2);}
    if(f===3&&p.hp>0){ctx.fillStyle=(t*16|0)%2?'#ffffff':'#ff4d5e';
     for(let d=10;d<230;d+=3)ctx.fillRect((e.x+p.ox+Math.cos(p.laser)*d)|0,(e.y+p.oy+Math.sin(p.laser)*d)|0,2,2);}
   }
   if(f!==3){drawEye(ctx,(e.x-46)|0,(e.y-2)|0,openEye,false,t,skin);drawEye(ctx,(e.x+46)|0,(e.y-2)|0,openEye,false,t,skin);}
  }
 });
})();


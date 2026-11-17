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
/* THE MAW: sector 10 waves 91-95. One phase per wave. Core ignores damage while limbs live (phase 5 is armored instead).
 * Tentacles are thick tapered chains on a fixed screen-filling silhouette. HP and phase counts stay on the defs. */
(function(){
 const SKIN=[
  {fill:'#1a4d32',edge:'#06140c',hi:'#c6ffd8',spot:'#0c2818',sock:'#0e3020',lit:'#3d8a58'},
  {fill:'#3a453c',edge:'#101410',hi:'#d5e0d2',spot:'#1a221c',sock:'#242c26',lit:'#6a7a6c'},
  {fill:'#4a2878',edge:'#140818',hi:'#f0d0ff',spot:'#200830',sock:'#2c1848',lit:'#8a60b8'},
  {fill:'#7a2038',edge:'#1a060c',hi:'#ffc0cc',spot:'#2a0810',sock:'#4a1020',lit:'#c05068'},
  {fill:'#8a3810',edge:'#1a0c04',hi:'#ffe0b8',spot:'#2a1006',sock:'#4a200c',lit:'#d07840'}];
 const LIM=1.15,ROOT=8,TIPR=1.7;
 const SLOTS={
  oL:{z:0,tip:'claw',len:12,pts:[[-26,16],[-54,0],[-84,-14],[-98,-18],[-90,16],[-86,58],[-82,100],[-78,150]]},
  oR:{z:0,tip:'claw',len:12,pts:[[26,16],[54,0],[84,-14],[98,-18],[90,16],[86,58],[82,100],[78,150]]},
  mL:{z:1,tip:'hook',len:11,pts:[[-18,18],[-46,44],[-58,82],[-50,112],[-32,142]]},
  mR:{z:1,tip:'bulb',len:11,pts:[[18,18],[46,44],[58,82],[50,112],[32,140]]},
  cL:{z:2,tip:'curl',len:11,pts:[[-12,22],[-20,54],[-10,90],[-22,120],[-14,150]]},
  cR:{z:2,tip:'bulb',len:11,pts:[[14,22],[22,54],[12,90],[22,120],[16,150]]}
 };
 function spec(slot,hp,arm,col,freq,amp,seed){return {slot,hp,arm,col,freq,amp,seed};}
 const P1=[spec('oL',5.5,1,'#6bff8a',0.85,5,0.4),spec('mL',5.5,1,'#2e8b57',0.95,5,1.7),spec('mR',5.5,1,'#2e8b57',0.9,5,3.2),spec('oR',5.5,1,'#6bff8a',0.88,5,4.4)];
 const P2=[spec('oL',6,0.75,'#9aa58a',1.15,5,0.6),spec('mL',6,0.75,'#6d7a72',1.25,5,1.8),spec('mR',6,0.75,'#6d7a72',1.2,5,3.0),spec('oR',6,0.75,'#9aa58a',1.1,5,4.5)];
 const P3=[spec('oL',6.5,1,'#b14aed',0.8,6,0.5),spec('oR',6.5,1,'#b14aed',0.85,6,2.4)];
 const P4=[spec('oL',4.2,1,'#ff4d5e',2.15,7,0.3),spec('mL',4.2,1,'#ff5ccf',2.3,7,1.2),spec('cL',4.4,1,'#ff4d5e',2.2,7,2.1),spec('cR',4.4,1,'#ff4d5e',2.25,7,3.2),spec('mR',4.2,1,'#ff5ccf',2.35,7,4.3),spec('oR',4.2,1,'#ff4d5e',2.1,7,5.2)];
 const P5=[spec('oL',4.2,1,'#ff9f1c',2.4,6,0.7),spec('cL',4.6,1,'#ff4d5e',2.6,6,1.8),spec('cR',4.6,1,'#ff4d5e',2.55,6,2.9),spec('oR',4.2,1,'#ff9f1c',2.35,6,4.0)];
 const PHASES=[null,P1,P2,P3,P4,P5];
 function live(e){let n=0;const a=e.limbs||[];for(let i=0;i<a.length;i++)if(a[i].hp>0)n++;return n;}
 function tip(L){return L.segs[L.segs.length-1]||{x:L.bx,y:L.by};}
 function syncLimbs(e){let hp=0,max=0;for(const L of e.limbs){max+=L.maxHp;hp+=Math.max(0,L.hp);}e.maxHp=Math.max(1,max);e.hp=Math.max(1,hp);}
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
 function buildLimbs(e,A,defs){
  e.segPool=e.segPool||[];
  if(e.limbs)for(const L of e.limbs)for(const s of L.segs)e.segPool.push(s);
  e.limbs=[];e.parts=[];
  const base=A.eHP(A.S.wave);
  for(let i=0;i<defs.length;i++){const d=defs[i],slot=prep(SLOTS[d.slot]);
   const L={i,hp:base*d.hp,maxHp:base*d.hp,flash:0,flashSi:-1,flung:0,slam:0,slot:d.slot,z:slot.z,tip:slot.tip,
    freq:d.freq,amp:d.amp,seed:d.seed,bx:slot.pts[0][0],by:slot.pts[0][1],n:slot.n,len:slot.len,col:d.col,arm:d.arm,segs:[],angs:null,joints:null,fall:null};
   for(let s=0;s<slot.n;s++){L.segs.push(takeSeg(e));const rr=thick(s,slot.n);e.parts.push({kind:'limb',li:i,si:s,ox:L.bx,oy:L.by,w:rr*2,h:rr*2,flash:0});}
   e.limbs.push(L);}
  e.parts.push({kind:'core',ox:0,oy:8,w:12,h:28,flash:0});
 }
 function controls(L,t,aim){
  const src=SLOTS[L.slot].pts,pts=src.map(p=>({x:p[0],y:p[1]}));
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
 function tickFall(e,L,dt,A){
  if(!L.fall){
   const slot=SLOTS[L.slot],joints=L.joints||slot.restJ,cut=Math.min(3,joints.length-2);
   let cx=0,cy=0,c=0;const body=[];
   for(let i=cut;i<joints.length;i++){cx+=joints[i].x;cy+=joints[i].y;c++;}
   cx/=c;cy/=c;
   for(let i=cut;i<joints.length;i++)body.push({x:joints[i].x-cx,y:joints[i].y-cy,r:thick(Math.min(L.n-1,i),L.n)});
   L.fall={x:cx,y:cy,vx:(cx<0?-1:1)*22,vy:28,ang:0,va:(cx<0?-1:1)*1.4,life:1.35,pts:body,cut};
   const skin=SKIN[(e.form||1)-1],wx=e.x+cx,wy=e.y+cy;
   A.explode(wx,wy,0.7,skin.hi);
   for(let i=0;i<10;i++){const a=Math.random()*6.283,sp=16+Math.random()*46;A.addPart(wx,wy,Math.cos(a)*sp,Math.sin(a)*sp,0.35+Math.random()*0.45,i%2?skin.fill:'#d6f06a',2);}
  }
  const f=L.fall;if(f.life<=0)return;
  f.vy+=340*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.ang+=f.va*dt;f.life-=dt;
 }
 function poseLimb(e,L,dt,A){
  if(L.hp<=0){tickFall(e,L,dt,A);return;}
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
 function disc(ctx,x,y,r,col){
  const ix=x|0,iy=y|0;ctx.fillStyle=col;
  if(r<=0.6){ctx.fillRect(ix,iy,1,1);return;}
  const R=Math.ceil(r),r2=r*r;
  for(let j=-R;j<=R;j++){const s=Math.sqrt(Math.max(0,r2-j*j))|0;ctx.fillRect(ix-s,iy+j,(s<<1)+1,1);}
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
  if(al<=0)return;ctx.globalAlpha=ga*al;
  for(const p of dots)disc(ctx,p.x,p.y,p.r+1,skin.edge);
  for(const p of dots){const hot=opt.flash>0&&(p.i===opt.flashSi||p.i-1===opt.flashSi);
   disc(ctx,p.x,p.y,Math.max(1,p.r-0.15),hot?skin.hi:(opt.flash>0?skin.lit:(opt.ratio<0.5?skin.spot:skin.fill)));}
  ctx.fillStyle=skin.hi;
  for(const p of dots){if(p.r<1.6)continue;ctx.fillRect((p.x-p.nx*p.r*0.42-p.ny*0.4)|0,(p.y-p.ny*p.r*0.42+p.nx*0.4)|0,1,1);
   if(p.r>3.2&&p.i%5===0){ctx.fillStyle=skin.spot;ctx.fillRect((p.x+p.nx*p.r*0.4-1)|0,(p.y+p.ny*p.r*0.4)|0,2,2);ctx.fillStyle=skin.hi;}
   if(opt.ratio<0.66&&p.i%4===0){ctx.fillStyle=skin.edge;for(let k=-p.r+1;k<=p.r-1;k+=2)ctx.fillRect((p.x+p.nx*k)|0,(p.y+p.ny*k)|0,1,1);ctx.fillStyle=skin.hi;}}
  ctx.globalAlpha=ga;
 }
 function drawTip(ctx,pts,kind,skin){
  const b=pts[pts.length-1],a=pts[pts.length-2]||b,ang=Math.atan2(b.y-a.y,b.x-a.x);
  if(kind==='claw'){ctx.fillStyle=skin.edge;
   for(const da of [0,-0.7,0.7])for(let k=0;k<=7;k++)ctx.fillRect((b.x+Math.cos(ang+da)*k-1)|0,(b.y+Math.sin(ang+da)*k)|0,3,2);
   ctx.fillStyle='#fff1b0';
   for(const da of [0,-0.7,0.7])for(let k=1;k<=5;k++)ctx.fillRect((b.x+Math.cos(ang+da)*k)|0,(b.y+Math.sin(ang+da)*k)|0,1,1);
  }else{disc(ctx,b.x,b.y,3.2,skin.edge);disc(ctx,b.x,b.y,2.2,skin.hi);disc(ctx,b.x,b.y,1,'#fff1b0');}
 }
 function mantle(ctx,x,y,skin){
  const cx=x|0,cy=(y-2)|0,rx=28,ry=22;
  for(let j=-ry;j<=ry;j++){const yy=cy+j;if(yy<0||yy>240)continue;
   const s=Math.round(rx*Math.sqrt(Math.max(0,1-(j/ry)*(j/ry))));
   ctx.fillStyle=skin.edge;ctx.fillRect(cx-s-1,yy,s*2+3,1);
   ctx.fillStyle=(j>ry-6)?skin.sock:skin.fill;ctx.fillRect(cx-s,yy,s*2+1,1);
   if(j<-4&&s>6){ctx.fillStyle=skin.lit;ctx.fillRect(cx-s+2,yy,2,1);}}
 }
 function eye(ctx,x,y,open,form,t,skin){
  const cx=x|0,cy=(y+8)|0,ry=13,rx=5;
  for(let j=-ry;j<=ry;j++){const s=Math.round(rx*Math.sqrt(Math.max(0,1-(j/ry)*(j/ry))));
   ctx.fillStyle=skin.edge;ctx.fillRect(cx-s-1,cy+j,s*2+3,1);
   ctx.fillStyle=open?(form>=5?'#ff5a4a':'#ffe9a0'):skin.lit;ctx.fillRect(cx-s,cy+j,s*2+1,1);}
  ctx.fillStyle=skin.edge;ctx.fillRect(cx-1,cy-ry+3,2,ry*2-6);
  if(open){const k=Math.round(Math.sin(t*(form>=5?5:2))*1);
   ctx.fillStyle='#fff6c2';ctx.fillRect(cx-1+k,cy-2,2,4);}
 }
 function worldJoints(e,joints){const o=[];for(const p of joints)o.push({x:e.x+p.x,y:e.y+p.y});return o;}
 function radiiFor(n){const r=[];for(let i=0;i<=n;i++)r.push(thick(Math.min(n-1,i),n));return r;}
 IV.content.bosses.push({
  id:'maw',name:'THE MAW',unlock:{wave:90,sector:10},hp:8,body:0,escorts:false,final:true,phaseLock:true,
  half:['...vvvvvvv','..veeeeeev','.veeeeweev','veelllleev','vellwwwlev','veelllleev','.veeeeeeev','..vpppppev','...ppppppv','....pppp..','.....pp...','......p...'],
  setup(e,A){
   const f=e.form=e.form||1;
   e.T={hp:14,rew:18,spd:f>=4?24:15,fire:0,dmg:1.4,shots:0,ai:'boss'};
   e.tx=A.W/2;e.ty=16;e.breaking=0;e.breakT=0;e.touch=0;e.coreOpen=false;e.holdKill=false;e.bodyMult=0;e.onCoreBreak=null;
   e.a1=1.1;e.a2=2.2;
   buildLimbs(e,A,PHASES[f]||P1);
   if(f===5){const hp=A.eHP(A.S.wave)*16;e.hp=hp;e.maxHp=hp;e.coreOpen=true;e.bodyMult=0.42;e.holdKill=false;}
   else syncLimbs(e);
  },
  update(e,dt,A){
   const t=A.G.t,fast=e.form>=4?1.6:1;
   e.tx=A.W/2+Math.sin(t*0.28*fast)*3;e.ty=16+Math.sin(t*0.4)*1.5;
   if(e.touch>0)e.touch-=dt;
   if(e._lh>0)e._lh-=dt;
   if(e.form===3&&e.coreOpen)e.laser=1.15+Math.sin((e.sweep=(e.sweep||0)+dt*0.9))*1.2;
   for(const L of e.limbs){L.flash=Math.max(0,(L.flash||0)-dt);if(L.slam>0)L.slam-=dt;poseLimb(e,L,dt,A);}
   for(const p of e.parts){if(p.kind!=='limb')continue;const L=e.limbs[p.li];if(!L||L.hp<=0)continue;const s=L.segs[p.si];if(!s)continue;p.ox=s.x;p.oy=s.y;const rr=thick(p.si,L.n);p.w=p.h=Math.max(4,rr*2);}
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
   const f=e.form||1,open=e.coreOpen||f>=5,skin=SKIN[f-1]||SKIN[0];
   mantle(ctx,e.x,e.y,skin);
   const order=e.limbs.slice().sort((a,b)=>a.z-b.z);
   for(const L of order){
    const slot=SLOTS[L.slot];
    if(L.hp<=0){
     const stump=worldJoints(e,slot.restJ.slice(0,4));
     tube(ctx,stump,radiiFor(3),skin,{flash:0,flashSi:-1,ratio:1,alpha:1});
     disc(ctx,stump[stump.length-1].x,stump[stump.length-1].y,thick(2,L.n),skin.spot);
     const fall=L.fall;if(fall&&fall.life>0){const c=Math.cos(fall.ang),s=Math.sin(fall.ang),pts=[],radii=[];
      for(const p of fall.pts){pts.push({x:e.x+fall.x+p.x*c-p.y*s,y:e.y+fall.y+p.x*s+p.y*c});radii.push(p.r);}
      const al=Math.max(0,Math.min(1,fall.life/0.4));
      tube(ctx,pts,radii,skin,{flash:0,flashSi:-1,ratio:1,alpha:al});
      if(al>0.35)drawTip(ctx,pts,L.tip,skin);}
     continue;
    }
    if(!L.joints)continue;
    disc(ctx,e.x+L.bx,e.y+L.by,ROOT,skin.sock);
    const pts=worldJoints(e,L.joints),ratio=L.maxHp?L.hp/L.maxHp:1;
    tube(ctx,pts,radiiFor(L.n),skin,{flash:L.flash,flashSi:L.flashSi|0,ratio,alpha:1});
    drawTip(ctx,pts,L.tip,skin);
    const bx=(e.x+L.bx)|0,by=(e.y+L.by+4)|0;
    ctx.fillStyle='#05060c';ctx.fillRect(bx-6,by,12,2);
    ctx.fillStyle=L.col;ctx.fillRect(bx-5,by,Math.round(10*Math.max(0,ratio)),2);
   }
   eye(ctx,e.x,e.y,open,f,A.G.t,skin);
   if(f===3&&e.coreOpen&&e.laser!=null){ctx.fillStyle=(A.G.t*16|0)%2?'#fff6c2':'#ff4d5e';
    const ox=e.x,oy=e.y+8;for(let d=8;d<250;d+=3)ctx.fillRect((ox+Math.cos(e.laser)*d)|0,(oy+Math.sin(e.laser)*d)|0,2,2);}
  }
 });
})();

/* BOSSES. A boss wave happens every 5th wave; the boss is picked by rotating through the bosses whose gate is
 * open at the CURRENT wave, in list order (boss #k of the rotation = (wave/5 - 1) mod available).
 * Contract: {id, name, unlock (gate, use wave multiples of 5), hp (x wave HP baseline), body (damage mult on hull,
 *   weak points do more), escorts (bool: engine sends scouts/fighters), palette ('scheme' | {letter:'X'|'Y'|'#hex'}),
 *   half:[rows] (left half sprite, drawn at 2x), setup(e,A) adds parts/initial state,
 *   update(e,dt,A) moves (set e.tx/e.ty) and attacks (timers e.a1/e.a2 count down automatically; e.phase 1|2,
 *   phase 2 starts at 50% HP), draw?(e,A,ctx) extra effects}.
 * Parts: {kind:'weak', ox, oy, w, h, mult, eye?:{oy,c}} | {kind:'wall', ..., hp, maxHp} | {kind:'block', ...}.
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

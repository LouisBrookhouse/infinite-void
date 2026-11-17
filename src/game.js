/* INFINITE VOID - game engine (classic script, no build step).
 * Depends on src/core.js and src/content/*.js being loaded first (see index.html).
 * Content (guns, enemies, bosses, upgrades, sectors, skins, features, changelog) lives in src/content/.
 * Debug/test handle: window.__IV. */
(()=>{
'use strict';
const C=IV.content;
const VERSION=(C.changelog[0]&&C.changelog[0].version)||'0.0.0';
const W=180,H=240;
const cv=document.getElementById('game'),ctx=cv.getContext('2d');
cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const TAU=Math.PI*2;
const pick=a=>a[(Math.random()*a.length)|0];

/* ---------- number formatting ---------- */
const fmt=IV.fmt;
function fmtTime(s){s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?h+'H '+m+'M':m?m+'M '+x+'S':x+'S';}

/* ---------- pixel font (3x5) ---------- */
const FONT={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001010010','8':'111101111101111','9':'111101111001111',
'A':'010101111101101','B':'110101110101110','C':'011100100100011','D':'110101101101110','E':'111100110100111','F':'111100110100100','G':'011100101101011','H':'101101111101101','I':'111010010010111','J':'001001001101010','K':'101101110101101','L':'100100100100111','M':'101111111101101','N':'110101101101101','O':'010101101101010','P':'110101110100100','Q':'010101101110011','R':'110101110101101','S':'011100010001110','T':'111010010010010','U':'101101101101111','V':'101101101101010','W':'101101111111101','X':'101101010101101','Y':'101101010010010','Z':'111001010100111',
'.':'000000000000010','!':'010010010000010','+':'000010111010000','-':'000000111000000',':':'000010000010000','/':'001001010100100','%':'101001010100101','?':'111001011000010',' ':'000000000000000'};
const FONTB={};for(const k in FONT){const a=[];for(let p=0;p<15;p++)if(FONT[k][p]==='1')a.push(p%3,(p/3)|0);FONTB[k]=a;}
function _txt(str,x,y,col,s){ctx.fillStyle=col;for(let i=0;i<str.length;i++){const g=FONTB[str[i]];if(!g)continue;const ox=x+i*4*s;for(let j=0;j<g.length;j+=2)ctx.fillRect(ox+g[j]*s,y+g[j+1]*s,s,s);}}
function drawText(str,x,y,col,align,s){s=s||1;str=String(str).toUpperCase();const w=str.length*4*s-s;if(align==='center')x-=(w/2)|0;else if(align==='right')x-=w;x=Math.round(x);y=Math.round(y);_txt(str,x+s,y+s,'#000',s);_txt(str,x,y,col,s);}

/* ---------- sprites ---------- */
const PAL={c:'#7fe7ff',w:'#ffffff',b:'#2a6fdb',n:'#1b2b5a',g:'#8a94a6',d:'#3b4252',r:'#ff4d5e',o:'#ff9f1c',y:'#ffe066',p:'#b14aed',m:'#ff5ccf',l:'#6bff8a',e:'#2e8b57',k:'#0b0f1e',v:'#5a2a7a',f:'#c9b79c',h:'#6b5a4a'};
function mirror(half){const L=Math.max(...half.map(r=>r.length));return half.map(r=>{r=r.padStart(L,'.');return r+r.slice(0,-1).split('').reverse().join('');});}
function makeSprite(rows,map){
 const h=rows.length,w=Math.max(...rows.map(r=>r.length));
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 const f=document.createElement('canvas');f.width=w;f.height=h;const fx=f.getContext('2d');fx.fillStyle='#fff';
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[j][i];if(!ch||ch==='.')continue;const col=(map&&map[ch])||PAL[ch];if(!col)continue;x.fillStyle=col;x.fillRect(i,j,1,1);fx.fillRect(i,j,1,1);}
 return {c,f,w,h};
}
const SECTORS=C.sectors;
const SCHEMES=SECTORS.map(s=>s.scheme),BGCOL=SECTORS.map(s=>s.bg),PLANETC=SECTORS.map(s=>s.planet);
const HALF={drone:["..c",".gb","gbw",".gb","..c"]},FULL={};
for(const t of C.enemies){if(t.sprite.half)HALF[t.id]=t.sprite.half;if(t.sprite.full)FULL[t.id]=t.sprite.full;if(t.sprite.full2)FULL[t.id+'_2']=t.sprite.full2;}
HALF.player=C.skins[0].half;
const sprCache={};
function getSpr(name,scheme){const k=name+scheme;return sprCache[k]||(sprCache[k]=makeSprite(FULL[name]||mirror(HALF[name]),SCHEMES[scheme%SCHEMES.length]));}
const SPR_DRONE=makeSprite(mirror(HALF.drone)),SPR_DRONE_BAD=makeSprite(mirror(HALF.drone),{c:'#ff4d5e',b:'#b14aed',w:'#ffe066',g:'#5a2a7a'});
const skinCache={};
function playerSprite(){const sk=C.skins.find(s=>s.id===S.skin)||C.skins[0];let sp=skinCache[sk.id];if(!sp)sp=skinCache[sk.id]=makeSprite(mirror(sk.half));return sp;}
const rockCache={};
function rockSpr(size){const k=size+'_'+((Math.random()*3)|0);if(rockCache[k])return rockCache[k];
 const r=[0,2.6,4.2,6.4][size],n=Math.ceil(r*2)+1,rows=[];const seed=Math.random()*10;
 for(let j=0;j<n;j++){let row='';for(let i=0;i<n;i++){const dx=i-(n-1)/2,dy=j-(n-1)/2,a=Math.atan2(dy,dx);const rr=r*(0.82+0.18*Math.sin(a*3+seed)+0.08*Math.sin(a*7+seed*2));const d=Math.hypot(dx,dy);
  row+=d>rr?'.':d>rr-1.1?'h':(dx+dy<-1?'f':(Math.sin(i*1.7+j*2.3+seed)>0.75?'h':'g'));}rows.push(row);}
 return rockCache[k]=makeSprite(rows,{g:'#9c8670'});}

function makePlanet(sec){
 const c=document.createElement('canvas');c.width=56;c.height=56;const x=c.getContext('2d');const cols=PLANETC[sec%PLANETC.length];
 const B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];const r=20,cx=28,cy=28;
 for(let j=0;j<56;j++)for(let i=0;i<56;i++){const dx=i-cx+.5,dy=j-cy+.5,d=dx*dx+dy*dy;
  if(d<=r*r){const nz=Math.sqrt(r*r-d)/r,l=(-dx/r*0.6-dy/r*0.6+nz*0.55);const band=Math.sin(dy*0.5+dx*0.08)*0.08;
   const v=clamp(l+band,0,1)*2.2+B[(j%4)*4+i%4]/16-0.5;x.fillStyle=cols[clamp(Math.floor(v),0,2)];x.globalAlpha=0.55;x.fillRect(i,j,1,1);}
  else if(Math.abs(dy*2.6+dx*0.9)<3&&d<27*27&&!(dy<0&&d<r*r+30)){x.globalAlpha=0.35;x.fillStyle=cols[1];x.fillRect(i,j,1,1);}}
 return c;
}

/* ---------- icons ---------- */
const ICONS=C.icons;
const DMMAP={y:'#ff5ccf',o:'#b14aed',c:'#ff5ccf',l:'#ff5ccf',g:'#b14aed',r:'#b14aed',b:'#b14aed',n:'#3a0b33',d:'#3a0b33'};
function iconCanvas(key,dm){
 const c=document.createElement('canvas');c.width=12;c.height=12;c.className='icon';const x=c.getContext('2d');let s;
 if(key==='ship'){const sk=C.skins.find(x=>x.id===S.skin)||C.skins[0];s=makeSprite(mirror(sk.half),dm?DMMAP:null);}
 else if(key==='drone')s=makeSprite(mirror(HALF.drone));
 else s=makeSprite(mirror(ICONS[key]||ICONS.dmg),dm?DMMAP:null);
 x.drawImage(s.c,Math.floor((12-s.w)/2),Math.floor((12-s.h)/2));return c;
}

/* ---------- content registries (src/content/*.js) ---------- */
const UPG=C.upgrades,DMU=C.darkMatter,WEAP=C.guns,FEAT=C.features,BOSSES=C.bosses;
const WMAP={},UMAP={},FMAP={},BMAP={},GUN_DRAW={};
WEAP.forEach(w=>{WMAP[w.id]=w;if(w.draw)GUN_DRAW[w.id]=w.draw;});UPG.forEach(u=>UMAP[u.id]=u);FEAT.forEach(f=>FMAP[f.id]=f);BOSSES.forEach(b=>BMAP[b.id]=b);
const wMult=L=>(1+0.08*(L-1))*Math.pow(1.2,Math.floor((L-1)/10));
const wBase=w=>Math.max(100,w.cost);
function wProj(id,m){return WMAP[id].proj(m);}
/* gates: store/meta content checks BEST wave + lifetime stats; spawn content checks the CURRENT wave */
function storeCtx(){return {wave:S.best,warps:S.warps,bosses:S.bossKills,dmTotal:S.dmTotal};}
function waveCtx(w){return {wave:w,warps:S.warps,bosses:S.bossKills,dmTotal:S.dmTotal};}
function open(g){return IV.gateOpen(g,storeCtx());}
function feat(id){return !!FMAP[id]&&open(FMAP[id].unlock);}

/* ---------- state & storage ---------- */
/* KEY kept from the VOID BREAKER era so existing saves keep loading. Never change it. */
const KEY='voidbreaker_save_v1',SAVE_VER=2;
function fresh(){const u={},d={},wl={},skins={};UPG.forEach(x=>u[x.id]=0);DMU.forEach(x=>d[x.id]=0);WEAP.forEach(x=>wl[x.id]=0);C.skins.forEach((x,i)=>skins[x.id]=i?0:1);wl.pulse=1;
 return {v:SAVE_VER,credits:0,wave:1,maxWave:0,best:1,kills:0,waveKills:0,dm:0,dmTotal:0,warps:0,u,d,wl,skins,skin:C.skins[0].id,finalKills:0,pri:'pulse',sec:'',auto:true,muted:false,totalCredits:0,playTime:0,cps:0,bossKills:0,deaths:0,buyMode:1,seenVersion:'',last:Date.now(),created:Date.now()};}
let S=fresh();
function migrate(o){
 if(!o||typeof o!=='object'||Array.isArray(o))throw new Error('not a save');
 if(!('credits' in o)&&!('u' in o))throw new Error('not an INFINITE VOID save');
 const f=fresh();
 for(const k in f){if(!(k in o))continue;const v=o[k];
  if(typeof f[k]==='object'){if(v&&typeof v==='object')for(const j in f[k]){const x=v[j];if(typeof x==='number'&&isFinite(x)&&x>=0)f[k][j]=Math.floor(x);}}
  else if(k==='buyMode'){if(v==='max'||v===10||v===1)f[k]=v;}
  else if(k==='pri'||k==='sec'){if(typeof v==='string'&&(v===''||WMAP[v]))f[k]=v;}
  else if(typeof f[k]===typeof v&&(typeof v!=='number'||isFinite(v)))f[k]=v;}
 // v1 -> v2: weapons didn't exist; pulse is always owned
 if(f.wl.pulse<1)f.wl.pulse=1;
 for(const k of UPG)if(k.max!=null)f.u[k.id]=Math.min(f.u[k.id],k.max);
 for(const k of DMU)if(k.max!=null)f.d[k.id]=Math.min(f.d[k.id],k.max);
 if(!(f.wl[f.pri]>=1))f.pri='pulse';
 if(f.sec&&(!(f.wl[f.sec]>=1)||f.sec===f.pri))f.sec='';
 f.wave=Math.max(1,Math.floor(f.wave));f.credits=Math.max(0,f.credits);f.dm=Math.max(0,f.dm);f.v=SAVE_VER;
 if(!f.skins||typeof f.skins!=='object')f.skins={};
 if(!(f.skins.vanguard>=1))f.skins.vanguard=1;
 if(!(f.skins[f.skin]>=1))f.skin=C.skins[0].id;
 f.finalKills=Math.max(0,Math.floor(f.finalKills)||0);
 return f;
}
let storageOK=true,memStore={};
function lsGet(k){try{const v=localStorage.getItem(k);return v;}catch(e){storageOK=false;return memStore[k]||null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);storageOK=true;return true;}catch(e){storageOK=false;memStore[k]=v;return false;}}
function lsDel(k){try{localStorage.removeItem(k);}catch(e){}delete memStore[k];}
(function probe(){try{localStorage.setItem('iv_probe','1');storageOK=localStorage.getItem('iv_probe')==='1';localStorage.removeItem('iv_probe');}catch(e){storageOK=false;}})();
function load(){
 for(const k of [KEY,KEY+'_bak']){const raw=lsGet(k);if(!raw)continue;try{S=migrate(JSON.parse(raw));return true;}catch(e){}}
 return false;
}
let noSave=false,lastBak=0,saveIndT=null,lastSaveAt=0;
function save(quiet){
 if(noSave)return false;S.last=Date.now();let data;try{data=JSON.stringify(S);}catch(e){return false;}
 const ok=lsSet(KEY,data);
 if(ok&&Date.now()-lastBak>60000){lsSet(KEY+'_bak',data);lastBak=Date.now();}
 lastSaveAt=Date.now();
 const el=document.getElementById('saveInd');
 if(el){if(!ok){el.textContent='⚠ NOT SAVING';el.className='saveind fail';el.title='This browser blocks storage for local files. Use SAVE/STATS > EXPORT to keep progress.';}
  else if(!quiet){el.textContent='✔ SAVED';el.className='saveind show';clearTimeout(saveIndT);saveIndT=setTimeout(()=>{el.className='saveind';},1200);}}
 return ok;
}
function exportCode(){S.last=Date.now();const json=JSON.stringify(S);return 'IV2:'+btoa(unescape(encodeURIComponent(json)));}
function parseImport(txt){
 txt=String(txt||'').trim();if(!txt)throw new Error('empty');
 let json;
 if(txt[0]==='{')json=txt;
 else{const b=txt.replace(/^(VB|IV)\d*:/,'').replace(/\s+/g,'');json=decodeURIComponent(escape(atob(b)));}
 return migrate(JSON.parse(json));
}


/* ---------- derived stats ---------- */
const HPK={base:5,g:1.19,sec:1.2,rg:1.16,p:0.2,pc:15,rb:2};
function calcStats(){
 const u=S.u,d=S.d,dmB=1+0.05*S.dmTotal,s={};
 s.dmg=(1+u.dmg)*Math.pow(1.5,Math.floor(u.dmg/25))*dmB*Math.pow(1.3,d.over);
 s.rate=2*(1+0.1*u.rate)*Math.pow(1.1,d.quantum);
 s.shots=1+u.multi;
 s.maxHull=32*(1+0.3*u.hull)*Math.pow(1.04,u.hull)*Math.pow(1.25,d.nano);
 s.regen=s.maxHull*0.003*u.regen;
 s.shieldMax=s.maxHull*0.08*u.shield;
 s.crit=Math.min(0.6,0.02*u.crit);
 s.credMult=(1+0.25*u.credit)*dmB*Math.pow(1.3,d.salv);
 s.click=s.dmg*(0.6+0.12*u.click);
 s.drones=u.drone;
 s.droneDmg=s.dmg*0.6*(1+0.25*u.droneDmg);
 return s;
}
function statsWith(id,L){const t=S.u[id];S.u[id]=L;const s=calcStats();S.u[id]=t;return s;}
function gunInfo(id,L,sec){const w=WMAP[id],s=G.s,m=S.u.multi;const proj=wProj(id,m);return {shot:s.dmg*wMult(L)*w.R*(1+0.5*m)/(w.rm*proj)*(sec?0.6:1),proj,rate:s.rate*w.rm*(sec?0.5:1)};}
function gunDps(id,L,sec){const g=gunInfo(id,L,sec);return g.shot*g.proj*g.rate;}
const sectorOf=w=>Math.floor((w-1)/10);
const needOf=w=>Math.min(12+Math.floor(w*0.9),150);
const maxAliveOf=w=>Math.min(5+Math.floor(w*0.7),110);
const eHP=w=>HPK.base*Math.pow(HPK.g,w-1)*Math.pow(HPK.sec,sectorOf(w))*(1+HPK.p*Math.min(w-1,HPK.pc));
const eDmg=w=>Math.pow(1.11,w-1);
const eRew=w=>HPK.rb*Math.pow(HPK.rg,w-1)*Math.pow(12/needOf(w),0.5);
const dmGain=()=>S.maxWave>=20?Math.floor(1+Math.pow((S.maxWave-20)/4,1.4)):0;

/* ---------- runtime ---------- */
const G={s:null,enemies:[],pb:[],eb:[],parts:[],texts:[],stars:[],caps:[],banner:null,shake:0,flash:0,warpFx:0,
 p:{x:W/2,y:H-30,hull:20,shield:0,shieldDelay:0,flash:0},wT:{pri:0,sec:0},dead:false,respawnT:0,need:8,toSpawn:0,spawnT:0,isBoss:false,bossAlive:false,boss:null,bossT:35,escortT:3,
 droneA:0,droneT:[],captured:0,marches:[],overT:0,buckets:[],bucketCur:0,bucketT:0,saveT:0,t:0,sector:-1,planet:null,planetX:130,planetY:20,hiddenAt:0,debugMul:1,final:false,finale:null};
for(let i=0;i<70;i++){const l=i%3;G.stars.push({x:Math.random()*W,y:Math.random()*H,l,v:[5,13,30][l],c:['#2a3a7a','#7383bb','#ffffff'][l]});}
function recalc(){G.s=calcStats();}

/* ---------- audio ---------- */
let AC=null,master=null,noiseBuf=null;const lastSnd={};
function ensureAudio(){
 if(AC){if(AC.state==='suspended')AC.resume();return;}
 try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=0.3;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}
}
function canPlay(k,gap){if(!AC||S.muted||AC.state!=='running')return false;const t=AC.currentTime;if(lastSnd[k]&&t-lastSnd[k]<gap)return false;lastSnd[k]=t;return true;}
function tone(f,dur,type,vol,slide,delay){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*slide),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);}
function noise(dur,vol,freq,type){const t=AC.currentTime;const s=AC.createBufferSource();s.buffer=noiseBuf;const fl=AC.createBiquadFilter();fl.type=type||'lowpass';fl.frequency.setValueAtTime(freq,t);fl.frequency.exponentialRampToValueAtTime(80,t+dur);const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(master);s.start(t);s.stop(t+dur+0.05);}
const SFX={
 gun(id){const w=WMAP[id];if(w&&w.sfx&&canPlay('g_'+id,w.sfxGap||0.09))w.sfx(A);},
 charge(dur){if(canPlay('charge',0.3))tone(150,Math.max(0.2,dur),'sine',0.035,6);},
 hit(){if(canPlay('hit',0.05))tone(rnd(180,240),0.04,'square',0.04,0.6);},
 tink(){if(canPlay('tink',0.08))tone(2400,0.03,'square',0.03,0.8);},
 zap(){if(canPlay('zap',0.03))tone(1400,0.06,'sawtooth',0.06,0.3);},
 boom(){if(canPlay('boom',0.06)){noise(0.3,0.25,1500);tone(140,0.25,'triangle',0.15,0.3);}},
 big(){if(canPlay('big',0.3)){noise(0.9,0.5,1000);tone(90,0.8,'sawtooth',0.18,0.25);}},
 coin(){if(canPlay('coin',0.08)){tone(1320,0.05,'square',0.04);tone(1760,0.08,'square',0.04,0,0.05);}},
 hurt(){if(canPlay('hurt',0.12)){noise(0.15,0.2,2500);tone(300,0.15,'sawtooth',0.08,0.4);}},
 buy(){if(canPlay('buy',0.05)){tone(660,0.07,'square',0.06);tone(990,0.1,'square',0.06,0,0.06);}},
 deny(){if(canPlay('deny',0.1))tone(110,0.12,'square',0.06);},
 alarm(){if(canPlay('alarm',1)){for(let i=0;i<3;i++)tone(440,0.15,'square',0.07,1.6,i*0.3);}},
 wave(){if(canPlay('wave',0.5)){tone(523,0.08,'square',0.05);tone(659,0.08,'square',0.05,0,0.08);tone(784,0.14,'square',0.05,0,0.16);}},
 warp(){if(canPlay('warp',1)){tone(80,1.6,'sawtooth',0.15,20);noise(1.5,0.3,4000);}},
 roar(){if(canPlay('roar',0.6)){noise(0.55,0.4,700);tone(55,0.7,'sawtooth',0.16,0.35);tone(110,0.45,'square',0.05,0.5);}},
 shbreak(){if(canPlay('shb',0.1)){tone(1600,0.12,'triangle',0.06,0.3);noise(0.1,0.1,5000,'highpass');}},
 march(f){if(canPlay('march',0.2))tone([98,92,87,82][f%4],0.09,'square',0.06);},
 beam(){if(canPlay('beam',2.4)){tone(300,2.4,'sine',0.05,3);tone(310,2.4,'sine',0.05,3.1);}},
 power(){if(canPlay('power',0.3)){[523,659,784,1047].forEach((f,i)=>tone(f,0.08,'square',0.05,0,i*0.06));}},
 dive(){if(canPlay('dive',0.4))tone(1200,0.35,'sine',0.03,0.3);},
 snipe(){if(canPlay('snipe',0.2))tone(2000,0.15,'sawtooth',0.04,0.1);},
};

/* ---------- effects ---------- */
const PPOOL=[];
function addPart(x,y,vx,vy,life,c,s,ring){if(G.parts.length>=600)return;const p=PPOOL.pop()||{};p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=life;p.max=life;p.c=c;p.s=s||1;p.ring=ring||0;G.parts.push(p);}
function rmAt(a,i){a[i]=a[a.length-1];a.pop();}
const EXC=['#ffffff','#ffe066','#ff9f1c','#ff4d5e'];
function explode(x,y,size,extra){
 for(let i=0;i<size*10;i++){const a=Math.random()*TAU,sp=rnd(10,40+size*15);addPart(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.3,0.6+size*0.2),EXC[(Math.random()*EXC.length)|0],Math.random()<0.3?2:1);}
 if(extra)for(let i=0;i<size*3;i++){const a=Math.random()*TAU,sp=rnd(10,30);addPart(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.6,1.2),extra,1);}
 addPart(x,y,0,0,0.35+size*0.08,'#ffe066',1,2+size*5);
}
function sparks(x,y,c,n){for(let i=0;i<n;i++){const a=rnd(-Math.PI,0),sp=rnd(20,60);addPart(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.1,0.25),c,1);}}
function addText(t,x,y,c,big){if(!big&&G.texts.length>22)return;if(G.texts.length>45)G.texts.shift();G.texts.push({t,x,y,c,life:big?1.0:0.7,max:big?1.0:0.7,big});}
function banner(t,c,dur){G.banner={t:dur||1.6,max:dur||1.6,txt:t,c};}
let toastT=null;
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2500);}

/* ---------- enemy types (definitions in src/content/enemies.js) ---------- */
const ET={};for(const t of C.enemies)ET[t.id]=t;
const BOSS_T={hp:14,rew:15,spd:30,fire:0,dmg:1.4,shots:0,ai:'boss'};
const AIS=['roam','dive','march','kami','rock','sniper','cloak','custom'];
function pickType(w){
 const bias=SECTORS[sectorOf(w)%SECTORS.length].bias||{},ctx=waveCtx(w);let tot=0;const opts=[];
 for(const T of C.enemies){if(!(T.weight>0)||!IV.gateOpen(T.unlock,ctx))continue;let x=T.weight*(bias[T.id]||1);if(T.late&&w>=T.late.wave)x=T.late.weight;
  if(T.ai==='march'&&(G.marches.length>=2||G.toSpawn<6))x=0;if(x>0){opts.push([T.id,x]);tot+=x;}}
 if(!opts.length)return C.enemies[0].id;
 let r=Math.random()*tot;for(const [t,x] of opts){r-=x;if(r<=0)return t;}return opts[opts.length-1][0];
}
function mkEnemy(type,o){
 o=o||{};const sch=sectorOf(S.wave)%SCHEMES.length,T=ET[type];
 const spr=T.sprite.proc==='rock'?rockSpr(o.size||3):getSpr(type,sch);
 const hp=eHP(S.wave)*T.hp*(o.hpMul||1);
 const e={type,T,ai:T.ai,spr,w:spr.w,h:spr.h,x:o.x!=null?o.x:rnd(16,W-16),y:o.y!=null?o.y:-spr.h,tx:rnd(14,W-14),ty:rnd(20,110),
  hp,maxHp:hp,sh:0,maxSh:0,flash:0,fireT:rnd(1.5,3),retarget:rnd(2,4),phase:Math.random()*TAU,counts:o.counts!==false,dead:false,state:'enter',st:0,vx:0,vy:0,cloak:0,rew:o.rew||1};
 e.born=G.t;
 if(T.sprite.full2)e.spr2=getSpr(type+'_2',sch);
 if(T.shield){e.sh=e.maxSh=hp*T.shield;}
 if(T.ai==='rock'){e.size=o.size||3;e.vx=o.vx!=null?o.vx:rnd(-25,25);e.vy=o.vy!=null?o.vy:rnd(12,25);}
 if(T.ai==='dive'){e.tx=rnd(14,W-14);e.ty=rnd(22,60);e.st=rnd(2.5,5);}
 if(T.ai==='sniper'){e.ty=rnd(16,34);e.st=rnd(1,2.5);}
 if(T.ai==='kami'){e.ty=rnd(15,35);e.tx=rnd(14,W-14);}
 if(T.init)T.init(e,A);
 G.enemies.push(e);return e;
}
function spawnInvaderGroup(n,counts){
 const cols=n>=24?8:n>=12?6:n>=8?4:3,rows=Math.ceil(n/cols),k=G.marches.length;
 const m={x:W/2-(cols-1)*7,y:-30-rows*11,ty:22+(k%2)*52,maxTy:22+(k%2)*52+48,dir:k%2?-1:1,n,frame:0,stepT:0,members:[]};G.marches.push(m);
 for(let i=0;i<n;i++){const e=mkEnemy('invader',{counts});e.mg=m;e.gx=(i%cols)*14;e.gy=Math.floor(i/cols)*11;e.x=m.x+e.gx;e.y=m.y+e.gy;m.members.push(e);}
}
function spawnWaveEnemy(){
 const w=S.wave,t=pickType(w),T=ET[t];
 if(T.ai==='march'){const n=Math.max(6,Math.min(G.toSpawn,6+2*Math.floor(w/8),32));spawnInvaderGroup(n,true);G.toSpawn-=n;return;}
 if(T.squad&&w>=6&&Math.random()<0.6){
  const k=Math.max(1,Math.min(G.toSpawn,2+Math.floor(w/8),10)),cx=rnd(30,W-30),ty=rnd(22,70),sp=Math.min(16,(W-24)/k);
  for(let j=0;j<k;j++){const o=j-(k-1)/2,e=mkEnemy(t);e.x=clamp(cx+o*sp,10,W-10);e.y=-e.h-Math.abs(o)*9;e.tx=clamp(W/2+o*sp,10,W-10);e.ty=ty+Math.abs(o)*4;if(T.ai==='dive')e.st=rnd(2,4)+j*0.35;if(T.ai==='kami')e.ty=rnd(15,35);}
  G.toSpawn-=k;return;}
 mkEnemy(t);G.toSpawn--;
}
/* ---------- bosses (definitions in src/content/bosses.js) ---------- */
const bossSprCache={};
function bossSpr(b){const sch=sectorOf(S.wave)%SCHEMES.length,k=b.id+sch;
 if(!bossSprCache[k]){const sc=SCHEMES[sch];let map={};if(b.palette==='scheme')map=sc;else if(b.palette)for(const c in b.palette){const v=b.palette[c];map[c]=v==='X'||v==='Y'?sc[v]:v;}
  bossSprCache[k]=makeSprite(mirror(b.half),map);}return bossSprCache[k];}
function bossFor(w){const ctx=waveCtx(w),av=BOSSES.filter(b=>!b.final&&IV.gateOpen(b.unlock,ctx)),list=av.length?av:BOSSES.filter(b=>!b.final);return list[(Math.floor(w/5)-1)%list.length];}
function isFinalWave(w){return w>=91&&w<=95;}
function spawnBoss(def){
 const spr=bossSpr(def),sc=2,hp=eHP(S.wave)*def.hp;
 const e={type:'boss',boss:true,bid:def.id,def,name:def.name,T:BOSS_T,ai:'boss',spr,sc,w:spr.w*sc,h:spr.h*sc,x:W/2,y:-spr.h*sc,tx:W/2,ty:42,hp,maxHp:hp,sh:0,maxSh:0,flash:0,
  phase:1,a1:2,a2:4,a3:0,ang:0,counts:true,dead:false,bodyMult:def.body,parts:[],beam:0,beamCD:6,dirx:1,cloak:0,rew:1};
 if(def.final)e.form=S.wave-90;
 if(def.setup)def.setup(e,A);
 G.enemies.push(e);G.boss=e;G.bossAlive=true;return e;
}
function wallsAlive(e){return e.parts&&e.parts.some(p=>p.kind==='wall'&&p.hp>0);}
const EBPOOL=[];
function pushEB(x,y,vx,vy,dmg,k){const b=EBPOOL.pop()||{};b.x=x;b.y=y;b.vx=vx;b.vy=vy;b.dmg=dmg;b.k=k||'orb';b.t=0;G.eb.push(b);return b;}
function freeEB(b){EBPOOL.push(b);}
function rmEB(i){const b=G.eb[i],n=G.eb.length-1;if(i!==n)G.eb[i]=G.eb[n];G.eb.pop();freeEB(b);}
function clearEB(){while(G.eb.length)freeEB(G.eb.pop());}
function bossFire(e,ang,sp,kind,dmgM,ox,oy){if(G.final&&G.eb.length>180)return;pushEB(e.x+(ox||0),e.y+(oy!=null?oy:e.h/2-4),Math.cos(ang)*sp,Math.sin(ang)*sp,eDmg(S.wave)*1.4*(dmgM||1),kind||'orb');}
function flingLimb(e,L){
 if(!L||L.flung)return;L.flung=1;
 for(const s of L.segs||[]){s.vx=rnd(-2.2,2.2);s.vy=rnd(-1.4,2.2);}
 let n=0;for(const p of e.parts||[]){if(p.kind==='limb'&&p.li===L.i&&n<4){n++;explode(e.x+p.ox,e.y+p.oy,0.7,'#b14aed');}}
 G.shake=Math.max(G.shake,7);G.flash=Math.max(G.flash,0.2);
 addText('SEVERED',e.x+L.bx,e.y+L.by,'#ff5ccf',true);SFX.boom();
}
function hurtLimb(e,L,dmg,quiet){
 if(!L||L.hp<=0||!(dmg>0))return;
 if(G.debugMul>1)dmg*=G.debugMul;
 const taken=dmg*(L.arm>0?L.arm:1);
 L.hp-=taken;L.flash=0.12;
 if(!quiet)addText(fmt(taken),e.x+(L.bx||0)+rnd(-3,3),e.y+(L.by||0),'#b6ffc8');
 if(L.hp<=0){L.hp=0;flingLimb(e,L);}else if(!quiet)SFX.hit();
}
function nextPhase(e){
 if(!e||!e.def||!e.def.final||e._phasing||(e.form|0)>=5)return;
 e._phasing=true;
 S.maxWave=Math.max(S.maxWave,S.wave);
 const prev=storeCtx(),prevBest=S.best;
 S.wave++;S.best=Math.max(S.best,S.wave);
 if(S.best>prevBest)notifyUnlocks(prev);
 e.form=(e.form|0)+1;e.dead=false;G.bossT=90;G.flash=1;G.shake=11;
 for(const o of G.enemies)if(o!==e)o.dead=true;
 clearEB();SFX.roar();
 banner(['','','HUNGRY REGROW','THE EYES OPEN','WALL LUNGES','MOUTH OPENS'][e.form]||('PHASE '+e.form),'#ff5ccf',1.7);
 toast('FINAL BOSS - PHASE '+e.form+'/5');
 if(e.def.setup)e.def.setup(e,A);
 e._phasing=false;
}
function finishFinal(){
 S.maxWave=Math.max(S.maxWave,S.wave);
 S.finalKills=(S.finalKills|0)+1;
 if(S.skins&&!(S.skins.eidolon>=1)){S.skins.eidolon=1;toast('NEW SHIP SKIN: EIDOLON');}
 const bonus=Math.max(15,Math.floor(dmGain()*0.5));
 G.finale={t:3.1,bonus};
 for(const o of G.enemies)o.dead=true;
 clearEB();
 for(let i=0;i<5;i++)explode(rnd(24,W-24),rnd(16,90),2,'#b14aed');
 G.flash=1;G.shake=14;SFX.roar();
 banner('MAW FALLS','#ffe066',2.4);
}
function aimAt(x,y){return Math.atan2(G.p.y-y,G.p.x-x);}
function updateBoss(e,dt){
 e.a1-=dt;e.a2-=dt;
 if(e.def&&e.def.update)e.def.update(e,dt,A);
 // escorts for bosses that don't bring their own
 if(e.def&&e.def.escorts){G.escortT-=dt;if(G.escortT<=0){G.escortT=5;if(G.enemies.length<4)mkEnemy(Math.random()<0.5?'scout':'fighter',{counts:false,rew:0.3});}}
 // captured drones shoot back
 if(G.captured>0){e.a3-=dt;if(e.a3<=0){e.a3=1.4;for(let i=0;i<G.captured;i++){const cx=e.x+(i%2?1:-1)*(e.w/2+6),cy=e.y-4,a=aimAt(cx,cy);pushEB(cx,cy,Math.cos(a)*80,Math.sin(a)*80,eDmg(S.wave)*0.6,'orb');}}}
}
/* ---------- content API: the object passed as `A` to content hooks (guns, bosses, custom enemies) ---------- */
const A={W,H,TAU,rnd,clamp,pick,fmt,G,get S(){return S},ctx,eDmg,eHP,aimAt,bossFire,mkEnemy,spawnInvaderGroup,damagePlayer,addText,addPart,banner,sparks,explode,SFX,wallsAlive,nextPhase,
 tone:(...a)=>{if(AC)tone(...a);},noise:(...a)=>{if(AC)noise(...a);}};


/* ---------- waves ---------- */
function startWave(){
 for(const e of G.enemies){if(!e.dead)explode(e.x,e.y,1);e.dead=true;}
 G.enemies=[];clearEB();G.marches=[];S.waveKills=0;
 G.final=isFinalWave(S.wave);G.isBoss=G.final||S.wave%5===0;G.boss=null;
 G.need=G.isBoss?1:needOf(S.wave);G.toSpawn=G.need;G.spawnT=G.final?0.35:1;G.bossT=G.final?90:35;G.bossAlive=false;G.escortT=4;
 const sec=sectorOf(S.wave);if(sec!==G.sector){G.sector=sec;G.planet=makePlanet(sec);}
 if(G.final){banner('FINAL BOSS','#ff4d5e',2.2);SFX.alarm();toast('FINAL BOSS - PHASE '+(S.wave-90)+'/5');}
 else if(G.isBoss){banner('WARNING: '+bossFor(S.wave).name,'#ff4d5e',2.2);SFX.alarm();}
 else{banner('WAVE '+S.wave,'#7fe7ff',1.3);const nt=C.enemies.find(t=>t.threat&&t.unlock.wave===S.wave);if(nt)setTimeout(()=>toast('NEW THREAT: '+nt.threat),400);}
}
function notifyUnlocks(prev){
 const now=storeCtx(),was=g=>IV.gateOpen(g,prev),is=g=>IV.gateOpen(g,now);
 for(const u of UPG)if(!was(u.unlock)&&is(u.unlock))toast('NEW UPGRADE: '+u.name);
 for(const w of WEAP)if(!was(w.unlock)&&is(w.unlock))toast('NEW GUN IN ARMORY: '+w.name);
 for(const u of DMU)if(!was(u.unlock)&&is(u.unlock))toast('NEW DARK MATTER TECH: '+u.name);
 for(const f of FEAT)if(f.announce&&!was(f.unlock)&&is(f.unlock))toast(f.announce);
}
function waveClear(){
 S.maxWave=Math.max(S.maxWave,S.wave);
 const prev=storeCtx(),prevBest=S.best;
 if(S.auto){S.wave++;if((S.wave-1)%10===0&&!isFinalWave(S.wave)){const k=sectorOf(S.wave),sc=SECTORS[k%SECTORS.length];setTimeout(()=>toast('SECTOR '+(k+1)+': '+sc.name),900);}}
 S.best=Math.max(S.best,S.wave);
 if(S.best>prevBest){notifyUnlocks(prev);if(prevBest<20&&S.best>=20)toast('WARP JUMP UNLOCKED!');}
 SFX.wave();startWave();
 if(Date.now()-lastSaveAt>3000)save(true);
}
function failWave(msg){G.esc=G.esc||{};G.esc[msg]=(G.esc[msg]||0)+1;if(!isFinalWave(S.wave))S.wave=Math.max(1,S.wave-1);releaseCaptured(false);startWave();G.banner={t:2.2,max:2.2,txt:msg,c:'#ff9f1c'};}
function releaseCaptured(rescued){if(G.captured>0&&rescued)addText('DRONE RESCUED!',G.p.x,G.p.y-20,'#6bff8a',true);G.captured=0;}
function addCredits(n){S.credits+=n;S.totalCredits+=n;G.bucketCur+=n;}

/* ---------- player weapons ---------- */
function aimPoint(e){
 if(!e)return {x:W/2,y:H/2,part:false};
 if(e.boss&&e.bodyMult<1&&e.limbs){let best=null,score=1e9;
  for(const L of e.limbs){if(!(L.hp>0)||!L.segs||!L.segs.length)continue;let nd=1e9,pt=null;
   for(const s of L.segs){const x=e.x+s.x,y=e.y+s.y,d=(x-G.p.x)*(x-G.p.x)+(y-G.p.y)*(y-G.p.y);if(d<nd){nd=d;pt={x,y};}}
   if(!pt)continue;const sc=(L.maxHp?L.hp/L.maxHp:1)*360+Math.sqrt(nd);if(sc<score){score=sc;best=pt;}}
  if(best)return {x:best.x,y:best.y,part:true};}
 if(e.parts){let best=null,nd=1e9;for(const p of e.parts){if(p.kind!=='eye'||!(p.hp>0))continue;const x=e.x+p.ox,y=e.y+p.oy,d=(x-G.p.x)*(x-G.p.x)+(y-G.p.y)*(y-G.p.y);if(d<nd){nd=d;best={x,y};}}
  if(best)return {x:best.x,y:best.y,part:true};}
 return {x:e.x,y:e.y,part:false};
}
function shootGun(id,sec){
 const P=G.p,m=S.u.multi,info=gunInfo(id,S.wl[id]||1,sec),dmg=info.shot,n=info.proj;
 let tgt=null;for(const e of G.enemies)if(targetable(e)&&e.y>0&&(!tgt||e.y>tgt.y))tgt=e;
 const aim=tgt?aimPoint(tgt):null;
 const push=b=>{b.py=b.y;b.dmg=dmg;
  if(aim&&aim.part){const sp=Math.hypot(b.vx,b.vy);if(sp>0){const cur=Math.atan2(b.vy,b.vx),want=Math.atan2(aim.y-b.y,aim.x-b.x),dir=want+(cur+Math.PI/2);b.vx=Math.cos(dir)*sp;b.vy=Math.sin(dir)*sp;}}
  G.pb.push(b);};
 WMAP[id].fire(A,{x:P.x,y:P.y-6,n,m,push,sec:!!sec});
 addPart(P.x,P.y-7,0,0,0.05,'#ffffff',2);SFX.gun(id);
}
function gunInterval(id,sec){return 1/(G.s.rate*WMAP[id].rm*(G.overT>0?2:1)*(sec?0.5:1));}
function targetable(e){return !e.dead&&e.cloak<0.6&&e.y>-2;}

/* ---------- hits ---------- */
function rectHit(b,cx,cy,hw,hh){const m=b.r||0,y0=Math.min(b.y,b.py),y1=Math.max(b.y,b.py);return Math.abs(b.x-cx)<=hw+m&&y1>=cy-hh-m&&y0<=cy+hh+m;}
function findHit(e,b){
 if(e.dead||e.cloak>0.6)return null;
 if(e.parts)for(const p of e.parts){if(p.kind==='wall'&&p.hp<=0)continue;if(p.kind==='limb'){const L=e.limbs&&e.limbs[p.li];if(!L||L.hp<=0)continue;}if(p.kind==='eye'&&!(p.hp>0))continue;if(rectHit(b,e.x+p.ox,e.y+p.oy,p.w/2,p.h/2))return p;}
 if(rectHit(b,e.x,e.y,e.w/2,e.h/2))return 'body';
 return null;
}
function applyHit(e,where,dmg,canCrit,hx,hy){
 let crit=false;if(canCrit&&Math.random()<G.s.crit){dmg*=3;crit=true;}
 if(where&&where.kind==='limb'){const L=e.limbs&&e.limbs[where.li];if(!L||L.hp<=0)return 'miss';L.flashSi=where.si|0;hurtLimb(e,L,dmg,false);return 'hit';}
 if(where&&where.kind==='eye'){if(!(where.hp>0))return 'miss';let hit=dmg;if(G.debugMul>1)hit*=G.debugMul;where.hp-=hit;where.flash=0.12;
  addText(fmt(hit),e.x+where.ox+rnd(-3,3),e.y+where.oy,'#ffb0b0');
  if(where.hp<=0){where.hp=0;explode(e.x+where.ox,e.y+where.oy,1.4,'#ff4d5e');addText('EYE BURST',e.x+where.ox,e.y+where.oy-8,'#ff4d5e',true);G.shake=Math.max(G.shake,6);SFX.boom();}
  else SFX.hit();return 'hit';}
 if(where==='body'||(where&&where.kind==='core')){
  const m=e.bodyMult!=null?e.bodyMult:1;
  if(m<=0){if(G.t-(e.armAt||0)>0.4){e.armAt=G.t;addText('ARMORED',e.x,e.y-10,'#7383bb');SFX.tink();}return 'armor';}
  dmgEnemy(e,dmg*m,crit,m<1?'armor':null);return 'hit';
 }
 let p=where;
 if(p.kind==='block'){sparks(hx,hy,'#b14aed',3);addPart(hx,hy,0,0,0.12,'#ff5ccf',1,3);SFX.tink();return 'block';}
 if(p.kind==='weak'&&p.guard&&wallsAlive(e)){let low=null;for(const q of e.parts)if(q.kind==='wall'&&q.hp>0&&(!low||q.oy<low.oy))low=q;p=low;}
 if(p.kind==='wall'){p.hp-=dmg;if(!(p.flash>-0.07))p.flash=0.06;addText(fmt(dmg),e.x+p.ox+rnd(-4,4),e.y+p.oy,'#9aa4c0');
  if(p.hp<=0){explode(e.x+p.ox,e.y+p.oy,1.5,'#cfd6e6');addText('SHIELD WALL DOWN',e.x,e.y+p.oy+6,'#7fe7ff',true);G.shake=Math.max(G.shake,4);SFX.boom();}else SFX.tink();return 'wall';}
 dmgEnemy(e,dmg*p.mult,crit,'weak');return 'hit';
}
function dmgEnemy(e,dmg,crit,tag){
 if(e.dead)return;if(G.debugMul>1)dmg*=G.debugMul;
 let col=crit?'#ffe066':tag==='weak'?'#ff9f1c':tag==='armor'?'#7383bb':'#ffffff';
 if(e.sh>0){e.sh-=dmg;col='#7fe7ff';if(e.sh<=0){e.sh=0;sparks(e.x,e.y,'#7fe7ff',12);addText('SHIELD DOWN',e.x,e.y-10,'#7fe7ff',true);SFX.shbreak();}}
 else e.hp-=dmg;
 if(e.flash<(e.boss?-0.3:-0.07))e.flash=e.boss?0.04:0.06;
 addText(fmt(dmg)+(crit?'!':''),e.x+rnd(-5,5),e.y-e.h/2-2+(tag==='weak'?e.h/2:0),col,crit||tag==='weak');
 if(e.hp<=0){if(e.holdKill){e.hp=1;e.holdKill=false;if(e.onCoreBreak)e.onCoreBreak();return;}killEnemy(e);return;}
 SFX.hit();
 if(e.boss&&!(e.def&&e.def.phaseLock)&&e.phase===1&&e.hp<e.maxHp*0.5){e.phase=2;banner(e.name+' ENRAGED','#ff4d5e',1.6);G.flash=0.3;SFX.alarm();}
}
function killEnemy(e){
 e.dead=true;const s=G.s;if(G.mk&&!e.boss&&e.counts)G.mk.push(G.t-e.born);
 let rew=eRew(S.wave)*e.T.rew*s.credMult*e.rew;if(!e.counts)rew*=0.3;
 if(e.ai==='rock'&&e.size<3)rew=eRew(S.wave)*0.25*s.credMult;
 addCredits(rew);addText('+'+fmt(rew),e.x,e.y,'#ffe066',true);
 const big=!!e.boss;
 explode(e.x,e.y,big?5:e.T.big?2:1.2,e.ai==='rock'?'#9c8670':SCHEMES[sectorOf(S.wave)%SCHEMES.length].X);
 for(let i=0;i<(big?14:3);i++)addPart(e.x,e.y,rnd(-15,15),rnd(-50,-20),rnd(0.6,1),'#ffe066',1);
 G.shake=Math.max(G.shake,big?8:2.5);if(big){G.flash=0.6;SFX.big();for(let i=0;i<4;i++)explode(e.x+rnd(-e.w/2,e.w/2),e.y+rnd(-e.h/2,e.h/2),2);}else SFX.boom();SFX.coin();
 if(e.ai==='rock'&&e.size>1){for(const d of [-1,1]){const c=mkEnemy(e.type,{size:e.size-1,counts:false,hpMul:e.size===3?0.6:0.3,x:e.x+d*3,y:e.y,vx:d*rnd(25,45),vy:rnd(-15,15)});c.state='drift';}}
 if(big||Math.random()<0.03)dropCap(e.x,e.y,big?2:1);
 if(e.counts){S.kills++;S.waveKills++;}
 if(big){S.bossKills++;G.bossAlive=false;releaseCaptured(true);if(e.def&&e.def.final){finishFinal();return;}waveClear();}
 else if(!G.isBoss&&e.counts&&S.waveKills>=G.need)waveClear();
}
/* power capsules (Gradius-style) */
const CAPS={P:{c:'#ff9f1c',name:'OVERDRIVE'},R:{c:'#6bff8a',name:'REPAIR'},B:{c:'#ff5ccf',name:'SMART BOMB'}};
function dropCap(x,y,n){for(let i=0;i<n;i++)G.caps.push({x:x+i*8-(n-1)*4,y,k:pick(['P','P','R','B']),t:0});}
function collectCap(c){const P=G.p,s=G.s;SFX.power();addText(CAPS[c.k].name+'!',P.x,P.y-16,CAPS[c.k].c,true);
 if(c.k==='P')G.overT=10;
 if(c.k==='R'){P.hull=Math.min(s.maxHull,P.hull+s.maxHull*0.35);P.shield=s.shieldMax;}
 if(c.k==='B'){G.flash=0.8;G.shake=6;SFX.big();for(const b of G.eb)addPart(b.x,b.y,0,0,0.3,'#ff5ccf',1);clearEB();
  for(const e of G.enemies.slice()){if(e.dead)continue;if(e.def&&e.def.final){if(e.limbs)for(const L of e.limbs)hurtLimb(e,L,s.dmg*8,true);if(e.form===5||e.coreOpen)dmgEnemy(e,s.dmg*8,false,null);}else dmgEnemy(e,s.dmg*10*(e.boss?0.5:1),false,null);}G.enemies=G.enemies.filter(e=>!e.dead);}
}

/* ---------- enemy fire & player damage ---------- */
function enemyFire(e){
 const P=G.p,n=e.T.shots;if(!n)return;
 if(e.ai==='march'){pushEB(e.x,e.y+4,0,75,eDmg(S.wave)*e.T.dmg,'bolt');return;}
 const base=Math.atan2(P.y-e.y,P.x-e.x),sp=66,dmg=eDmg(S.wave)*e.T.dmg;
 for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*0.22;pushEB(e.x,e.y+e.h/2-2,Math.cos(a)*sp,Math.sin(a)*sp,dmg,'orb');}
}
function damagePlayer(d){
 const P=G.p;if(G.dead||G.finale||G.dying)return;
 if(P.shield>0){const a=Math.min(P.shield,d);P.shield-=a;d-=a;sparks(P.x,P.y-4,'#7fe7ff',4);}
 P.shieldDelay=3;
 if(d>0){P.hull-=d;P.flash=0.12;G.shake=Math.max(G.shake,2);SFX.hurt();addText('-'+fmt(d),P.x,P.y-10,'#ff4d5e');}
 if(P.hull<=0)die();
}
function die(){
 if(G.dying||G.justWarped)return;
 const P=G.p;G.dying=true;P.hull=0;S.deaths++;
 explode(P.x,P.y,5,'#7fe7ff');G.shake=10;G.flash=0.5;SFX.big();clearEB();G.pb.length=0;
 releaseCaptured(false);G.finale=null;
 doWarp(0,true);
 G.justWarped=true;
}

/* ---------- enemy AI ---------- */
function moveTo(e,dt,spd){const dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy),step=spd*dt;if(d>step){e.x+=dx/d*step;e.y+=dy/d*step;}else{e.x=e.tx;e.y=e.ty;}}
function updateEnemy(e,dt){
 const P=G.p;e.flash-=dt;
 if(e.T.update){e.T.update(e,dt,A);return;}
 switch(e.ai){
 case 'roam':e.retarget-=dt;if(e.retarget<=0){e.tx=rnd(14,W-14);e.ty=rnd(20,115);e.retarget=rnd(2,4);}moveTo(e,dt,e.T.spd);break;
 case 'cloak':{e.retarget-=dt;if(e.retarget<=0){e.tx=rnd(14,W-14);e.ty=rnd(20,110);e.retarget=rnd(2,4);}moveTo(e,dt,e.T.spd);
  e.st+=dt;const c=e.st%6.5;e.cloak=c<2.5?0:c<3?(c-2.5)*2:c<5.5?1:1-(c-5.5);if(e.y<10)e.cloak=0;break;}
 case 'dive':
  if(e.state==='enter'||e.state==='form'){moveTo(e,dt,e.T.spd);if(e.x===e.tx&&e.y===e.ty)e.state='form';
   if(e.state==='form'){e.x+=Math.sin(G.t*2+e.phase)*8*dt;e.tx=e.x;e.st-=dt;if(e.st<=0){e.state='dive';e.vy=-30;e.fired=false;SFX.dive();}}}
  else{e.vy=Math.min(e.vy+140*dt,105);e.vx=clamp((P.x-e.x)*1.4,-70,70)+Math.sin(G.t*5+e.phase)*25;e.x+=e.vx*dt;e.y+=e.vy*dt;
   if(!e.fired&&e.y>70){e.fired=true;enemyFire(e);}
   if(!G.dead&&Math.abs(e.x-P.x)<7&&Math.abs(e.y-P.y)<8){damagePlayer(eDmg(S.wave)*1.5);killEnemy(e);return;}
   if(e.y>H+10){e.y=-10;e.x=rnd(14,W-14);e.state='enter';e.tx=rnd(14,W-14);e.ty=rnd(22,60);e.st=rnd(2.5,5);}}
  return;
 case 'march':return;
 case 'kami':
  if(e.state==='enter'){moveTo(e,dt,60);if(e.x===e.tx&&e.y===e.ty){e.state='lock';e.st=0.7;}}
  else if(e.state==='lock'){e.st-=dt;e.x+=rnd(-0.5,0.5);if(e.st<=0){e.state='go';e.sp=30;e.ang=aimAt(e.x,e.y);}}
  else{e.sp=Math.min(e.sp+150*dt,135);const want=aimAt(e.x,e.y);let da=((want-e.ang+Math.PI*3)%TAU)-Math.PI;if(e.y<P.y-10)e.ang+=clamp(da,-2*dt,2*dt);
   e.x+=Math.cos(e.ang)*e.sp*dt;e.y+=Math.sin(e.ang)*e.sp*dt;if(Math.random()<0.6)addPart(e.x,e.y-3,rnd(-5,5),-10,0.25,'#ff9f1c',1);
   if(!G.dead&&Math.abs(e.x-P.x)<7&&Math.abs(e.y-P.y)<8){damagePlayer(eDmg(S.wave)*e.T.dmg);killEnemy(e);return;}
   if(e.y>H+10||e.x<-15||e.x>W+15){e.y=-10;e.x=rnd(14,W-14);e.state='enter';e.tx=rnd(14,W-14);e.ty=rnd(15,35);}}
  return;
 case 'rock':
  if(e.state==='enter'&&e.y>14)e.state='drift';
  e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.x<e.w/2){e.x=e.w/2;e.vx=Math.abs(e.vx);}if(e.x>W-e.w/2){e.x=W-e.w/2;e.vx=-Math.abs(e.vx);}
  if(e.state==='drift'){if(e.y<14){e.y=14;e.vy=Math.abs(e.vy);}if(e.y>150){e.y=150;e.vy=-Math.abs(e.vy);}}
  return;
 case 'sniper':
  moveTo(e,dt,e.T.spd);e.x+=Math.sin(G.t+e.phase)*4*dt;
  if(e.y>8){e.st-=dt;
   if(e.state!=='aim'&&e.st<=0){e.state='aim';e.st=1.0;e.ang=aimAt(e.x,e.y);}
   else if(e.state==='aim'){if(e.st>0.45)e.ang=aimAt(e.x,e.y);if(e.st<=0){e.state='idle';e.st=rnd(1.8,3);SFX.snipe();
    pushEB(e.x,e.y+4,Math.cos(e.ang)*175,Math.sin(e.ang)*175,eDmg(S.wave)*e.T.dmg,'snipe');}}}
  return;
 }
}
function updateMarch(dt){
 for(let gi=G.marches.length-1;gi>=0;gi--){const m=G.marches[gi];const alive=m.members.filter(e=>!e.dead);m.members=alive;
  if(!alive.length){G.marches.splice(gi,1);continue;}
  if(m.y<m.ty){m.y=Math.min(m.ty,m.y+(m.y<0?40:22)*dt);}
  else{m.stepT-=dt;const killed=m.n-alive.length,interval=Math.max(0.1,0.55-killed*0.45/m.n);
   if(m.stepT<=0){m.stepT=interval;m.frame++;if(gi===0)SFX.march(m.frame);let minx=1e9,maxx=-1e9;for(const e of alive){minx=Math.min(minx,m.x+e.gx);maxx=Math.max(maxx,m.x+e.gx);}
    if((m.dir>0&&maxx+5+4>W-2)||(m.dir<0&&minx-5-4<2)){m.dir*=-1;m.ty=Math.min(m.ty+6,m.maxTy);}else m.x+=m.dir*4;}}
  for(const e of alive){e.x=m.x+e.gx;e.y=m.y+e.gy;e.frame=m.frame;}}
}
/* ---------- update ---------- */
function update(dt){
 if(G.justWarped){G.justWarped=false;G.dying=false;return;}
 if(G.finale){G.finale.t-=dt;if(G.finale.t<=0){const b=G.finale.bonus;G.finale=null;doWarp(b);return;}}
 const s=G.s,P=G.p;G.t+=dt;S.playTime+=dt;
 const warpMul=G.warpFx>0?1+G.warpFx*12:1;
 for(const st of G.stars){st.y+=st.v*dt*warpMul;if(st.y>=H){st.y-=H;st.x=Math.random()*W;}}
 G.planetY+=dt*1.2;if(G.planetY>H+10){G.planetY=-70;G.planetX=rnd(20,W-20);}
 if(G.banner){G.banner.t-=dt;if(G.banner.t<=0)G.banner=null;}
 G.shake=Math.max(0,G.shake-dt*18);G.flash=Math.max(0,G.flash-dt*1.5);G.warpFx=Math.max(0,G.warpFx-dt*0.5);G.overT=Math.max(0,G.overT-dt);
 G.bucketT+=dt;if(G.bucketT>=1){G.bucketT-=1;G.buckets.push(G.bucketCur);G.bucketCur=0;if(G.buckets.length>30)G.buckets.shift();S.cps=Math.max(0,G.buckets.reduce((a,b)=>a+b,0)/G.buckets.length);}
 G.saveT+=dt;if(G.saveT>=10){G.saveT=0;save(true);}
 for(let i=G.parts.length-1;i>=0;i--){const p=G.parts[i];p.life-=dt;if(p.life<=0){PPOOL.push(p);rmAt(G.parts,i);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=0.96;p.vy*=0.96;}
 for(let i=G.texts.length-1;i>=0;i--){const t=G.texts[i];t.life-=dt;t.y-=dt*(t.big?14:20);if(t.life<=0)G.texts.splice(i,1);}
 // movement
 updateMarch(dt);
 for(const e of G.enemies){if(e.dead)continue;if(e.boss){e.flash-=dt;for(const p of e.parts)p.flash=(p.flash||0)-dt;moveTo(e,dt,e.T.spd);if(!G.dead)updateBoss(e,dt);}else updateEnemy(e,dt);}
 G.enemies=G.enemies.filter(e=>!e.dead);
 if(G.justWarped){G.justWarped=false;G.dying=false;return;}
 // capsules
 for(let i=G.caps.length-1;i>=0;i--){const c=G.caps[i];c.t+=dt;c.y+=22*dt;if(c.y>H*0.45){const dx=P.x-c.x,dy=P.y-c.y,d=Math.hypot(dx,dy)||1;c.x+=dx/d*70*dt;c.y+=dy/d*50*dt;}
  if(Math.abs(c.x-P.x)<8&&Math.abs(c.y-P.y)<9){G.caps.splice(i,1);collectCap(c);}else if(c.y>H+8)G.caps.splice(i,1);}
 // player
 if(P.hull<s.maxHull)P.hull=Math.min(s.maxHull,P.hull+s.regen*dt);
 if(P.shieldDelay>0)P.shieldDelay-=dt;else if(P.shield<s.shieldMax)P.shield=Math.min(s.shieldMax,P.shield+s.shieldMax*0.25*dt);
 P.flash-=dt;
 let tgt=null;for(const e of G.enemies)if(targetable(e)&&(!tgt||e.y>tgt.y))tgt=e;
 const tp=tgt?aimPoint(tgt):null;
 const tx=tp?(tp.part?tp.x:tp.x+Math.sin(G.t*1.7)*6):W/2+Math.sin(G.t*0.8)*30;
 P.x=clamp(P.x+clamp(tx-P.x,-45*dt,45*dt),8,W-8);P.y=H-30+Math.sin(G.t*2)*1.5;
 const hasT=G.enemies.some(e=>targetable(e)&&e.y>0);
 for(const slot of ['pri','sec']){const id=S[slot];if(!id||!(S.wl[id]>=1))continue;const iv=gunInterval(id,slot==='sec');
  G.wT[slot]-=dt;if(G.wT[slot]<=0){if(hasT){G.wT[slot]=Math.max(0,G.wT[slot]+iv);shootGun(id,slot==='sec');if(WMAP[id].charge&&iv>0.35)SFX.charge(iv);}else G.wT[slot]=0;}}
 // drones
 G.droneA+=dt*1.6;const nd=Math.max(0,s.drones-G.captured);
 while(G.droneT.length<nd)G.droneT.push(rnd(0,1));
 for(let i=0;i<nd;i++){G.droneT[i]-=dt;
  if(G.droneT[i]<=0&&hasT){G.droneT[i]=0.9;const live=G.enemies.filter(e=>targetable(e)&&e.y>0);const e=pick(live);
   const a=G.droneA+i*TAU/nd,dx0=P.x+Math.cos(a)*17,dy0=P.y+Math.sin(a)*8-2;const pt=aimPoint(e);const ang=Math.atan2(pt.y-dy0,pt.x-dx0);
   G.pb.push({x:dx0,y:dy0,py:dy0,vx:Math.cos(ang)*180,vy:Math.sin(ang)*180,dmg:s.droneDmg,k:'drone'});}}
 // spawning
 if(!G.isBoss&&G.toSpawn>0){G.spawnT-=dt;if(G.spawnT<=0){let alive=0;for(const e of G.enemies)if(e.counts)alive++;if(alive<maxAliveOf(S.wave)){spawnWaveEnemy();G.spawnT=rnd(0.25,0.7)*Math.max(0.2,1-S.wave/70);}}}
 if(G.isBoss&&G.toSpawn>0&&!G.finale){G.spawnT-=dt;if(G.spawnT<=0){spawnBoss(G.final?(BOSSES.find(b=>b.final)||bossFor(S.wave)):bossFor(S.wave));G.toSpawn=0;}}
 if(G.isBoss&&G.bossAlive&&!G.finale){G.bossT-=dt;if(G.bossT<=0){failWave(G.final?'PHASE LOST':G.boss.name+' ESCAPED');return;}}
 // enemy fire (standard shooters)
 for(const e of G.enemies){if(e.boss||!e.T.fire||e.y<4||e.cloak>0.3)continue;if(e.ai==='dive'&&e.state==='dive')continue;e.fireT-=dt;if(e.fireT<=0){e.fireT=rnd(2.6,4.4)/e.T.fire/(1+S.wave/80);enemyFire(e);}}
 // player bullets
 for(let i=G.pb.length-1;i>=0;i--){const b=G.pb[i];b.py=b.y;
  if(b.homing){b.t+=dt;let best=b.tg&&!b.tg.dead&&targetable(b.tg)?b.tg:null;if(!best){let bd=1e9;for(const e of G.enemies){if(!targetable(e))continue;const p=aimPoint(e),d=Math.hypot(p.x-b.x,p.y-b.y);if(d<bd){bd=d;best=e;}}b.tg=best;}
   const sp=Math.min(60+b.t*260,190);let ang=Math.atan2(b.vy,b.vx);if(best&&b.t>0.12){const p=aimPoint(best);const want=Math.atan2(p.y-b.y,p.x-b.x);const da=((want-ang+Math.PI*3)%TAU)-Math.PI;ang+=clamp(da,-7*dt,7*dt);}
   b.vx=Math.cos(ang)*sp;b.vy=Math.sin(ang)*sp;if(Math.random()<0.5)addPart(b.x,b.y,0,0,0.3,'#8a94a6',1);if(b.t>4){rmAt(G.pb,i);continue;}}
  if(b.k==='ring')b.r=Math.min(b.rmax,b.r+22*dt);
  if(b.k==='wave')b.t+=dt;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.y<-14||b.y>H+6||b.x<-10||b.x>W+10){rmAt(G.pb,i);continue;}
  let gone=false;
  for(const e of G.enemies){if(e.dead||(b.hits&&b.hits.has(e)))continue;const where=findHit(e,b);if(!where)continue;
   const res=applyHit(e,where,b.dmg,true,b.x,b.y);sparks(b.x,b.y,b.k==='drone'?'#6bff8a':b.k==='ring'?'#ff5ccf':'#7fe7ff',2);
   if(b.pierce&&res!=='block'){b.hits.add(e);continue;}gone=true;break;}
  if(gone)rmAt(G.pb,i);
 }
 G.enemies=G.enemies.filter(e=>!e.dead);
 // enemy bullets
 for(let i=G.eb.length-1;i>=0;i--){const b=G.eb[i];b.t+=dt;
  if(b.k==='zig')b.vx=Math.sin(b.t*9)*55;
  if(b.k==='spore')b.vx=Math.sin(b.t*4+b.y)*22;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.y>H+6||b.x<-6||b.x>W+6||b.y<-12){rmEB(i);continue;}
  const r=b.k==='big'||b.k==='spore'?2:0;
  if(Math.abs(b.x-P.x)<5+r&&Math.abs(b.y-P.y)<6+r){const dmg=b.dmg;rmEB(i);damagePlayer(dmg);if(G.justWarped)return;}
 }
 while(G.eb.length>500)freeEB(G.eb.pop());
}


/* ---------- render ---------- */
function pcircle(cx,cy,r,c){ctx.fillStyle=c;const n=Math.max(8,Math.floor(r*6));for(let i=0;i<n;i++){const a=i/n*TAU;ctx.fillRect(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),1,1);}}
function bar(x,y,w,h,p,c,bg){ctx.fillStyle='#000';ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=bg||'#1b2b5a';ctx.fillRect(x,y,w,h);ctx.fillStyle=c;ctx.fillRect(x,y,Math.round(w*clamp(p,0,1)),h);}
function drawEnemy(e){
 const bob=e.boss||e.ai==='march'||e.ai==='rock'?0:Math.round(Math.sin(G.t*3+e.phase));
 let img=e.flash>0?e.spr.f:e.spr.c;if(e.spr2&&e.frame%2&&e.flash<=0)img=e.spr2.c;
 if(e.cloak>0){ctx.globalAlpha=e.cloak>0.95?0.1+0.08*Math.sin(G.t*20):1-e.cloak*0.9;}
 const x=Math.round(e.x-e.w/2),y=Math.round(e.y-e.h/2)+bob;
 if(e.ai==='kami'&&e.state==='lock'&&(G.t*16|0)%2)img=e.spr.f;
 ctx.drawImage(img,x,y,e.w,e.h);
 if(e.ai==='dive'&&e.state==='dive'){ctx.fillStyle='#ffe066';ctx.fillRect(Math.round(e.x),y-2,1,2);}
 ctx.globalAlpha=1;
 if(e.sh>0)pcircle(e.x,e.y+bob,Math.max(e.w,e.h)/2+2,(G.t*8|0)%2?'#7fe7ff':'#2a6fdb');
 if(e.ai==='sniper'&&e.state==='aim'&&(G.t*12|0)%2){ctx.fillStyle='#ff4d5e';for(let d=6;d<220;d+=4)ctx.fillRect(Math.round(e.x+Math.cos(e.ang)*d),Math.round(e.y+Math.sin(e.ang)*d),1,1);}
 if(!e.boss&&e.hp<e.maxHp&&e.cloak<0.5){const f=e.hp/e.maxHp,bw=Math.max(10,e.w+2);bar(Math.round(e.x-bw/2),Math.round(e.y+e.h/2)+2+bob,bw,2,f,f>0.6?'#6bff8a':f>0.3?'#ffe066':'#ff4d5e','#3b0b14');}
}
function drawBossExtras(e){
 const pulse=(Math.sin(G.t*8)+1)/2;
 for(const p of e.parts){const px=Math.round(e.x+p.ox),py=Math.round(e.y+p.oy);
  if(p.kind==='wall'&&p.hp>0){const w=p.w,h=p.h;ctx.fillStyle=p.flash>0?'#ffffff':'#3b4252';ctx.fillRect(px-w/2,py-h/2,w,h);ctx.fillStyle=p.flash>0?'#ffffff':'#8a94a6';ctx.fillRect(px-w/2+1,py-h/2,w-2,h-1);
   ctx.fillStyle='#cfd6e6';ctx.fillRect(px-w/2+1,py-h/2,w-2,1);const f=p.hp/p.maxHp;ctx.fillStyle='#7fe7ff';ctx.fillRect(px-w/2+1,py+h/2-1,Math.round((w-2)*f),1);}
  if(p.kind==='block'){ctx.fillStyle='#5a2a7a';ctx.fillRect(px-3,py-3,6,6);ctx.fillStyle='#b14aed';ctx.fillRect(px-2,py-3,4,5);ctx.fillStyle='#ff5ccf';ctx.fillRect(px-1,py-2,2,1);}
  if(p.kind==='weak'&&p.eye){const ey=Math.round(e.y+p.eye.oy);ctx.fillStyle=p.eye.c;ctx.globalAlpha=0.5+0.5*pulse;ctx.fillRect(px-2,ey-2,4,4);ctx.fillStyle='#ffffff';ctx.fillRect(px-1,ey-1,2,2);ctx.globalAlpha=1;}
  if(p.core){const open=!wallsAlive(e);const cy=Math.round(e.y);ctx.fillStyle=open?(pulse>0.5?'#ff4d5e':'#ff9f1c'):(pulse>0.5?'#7fe7ff':'#2a6fdb');ctx.fillRect(px-3,cy-3,6,6);ctx.fillStyle='#ffffff';ctx.fillRect(px-1,cy-1,2,2);}
 }
 if(e.def&&e.def.draw)e.def.draw(e,A,ctx);
 for(let i=0;i<G.captured;i++)ctx.drawImage(SPR_DRONE_BAD.c,Math.round(e.x+(i%2?1:-1)*(e.w/2+6)-2),Math.round(e.y-6-Math.floor(i/2)*7));
}
function drawPB(b){
 const x=Math.round(b.x),y=Math.round(b.y);
 if(GUN_DRAW[b.k]){GUN_DRAW[b.k](A,ctx,b,x,y);return;}
 switch(b.k){
  case 'pulse':ctx.fillStyle='#7fe7ff';ctx.fillRect(x,y,1,3);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,1);break;
  case 'twin':ctx.fillStyle='#ff4d5e';ctx.fillRect(x,y,1,4);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,2);break;
  case 'spread':ctx.fillStyle='#ffe066';ctx.fillRect(x-1,y-1,2,2);ctx.fillStyle='#ffffff';ctx.fillRect(x-1,y-1,1,1);break;
  case 'missile':{ctx.fillStyle='#cfd6e6';ctx.fillRect(x,y,1,1);ctx.fillStyle='#ff4d5e';ctx.fillRect(x-Math.round(b.vx/100),y-Math.round(b.vy/100),1,1);ctx.fillStyle='#8a94a6';ctx.fillRect(x-Math.round(b.vx/60),y-Math.round(b.vy/60),1,1);break;}
  case 'laser':ctx.fillStyle='#2a6fdb';ctx.fillRect(x-1,y,3,12);ctx.fillStyle='#7fe7ff';ctx.fillRect(x,y,1,14);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,4);break;
  case 'ring':pcircle(b.x,b.y,b.r,'#ff5ccf');if(b.r>3)pcircle(b.x,b.y,b.r-1,'#b14aed');break;
  case 'wave':{const r=b.r;for(let j=-r-2;j<=r+2;j++){const w=Math.round((r+1-Math.abs(j)*0.4)+Math.sin(b.t*30+j)*1.2);if(w<=0)continue;ctx.fillStyle=Math.abs(j)<r*0.4?'#ffffff':Math.abs(j)<r*0.8?'#7fe7ff':'#2a6fdb';ctx.fillRect(x-w,y+j,w*2+1,1);}break;}
  default:ctx.fillStyle='#6bff8a';ctx.fillRect(x,y,1,2);
 }
}
function drawEB(b,fl){
 const x=Math.round(b.x),y=Math.round(b.y);
 switch(b.k){
  case 'bolt':ctx.fillStyle='#ffffff';ctx.fillRect(x,y-2,1,4);ctx.fillRect(x+((G.t*12|0)%2?1:-1),y-1,1,1);break;
  case 'laser':ctx.fillStyle='#7fe7ff';ctx.fillRect(x-1,y-6,1,8);ctx.fillStyle='#fff';ctx.fillRect(x,y-6,1,8);break;
  case 'zig':ctx.fillStyle=fl?'#ffe066':'#ff9f1c';ctx.fillRect(x-1,y-1,3,1);ctx.fillRect(x,y,1,1);ctx.fillRect(x-1,y+1,3,1);break;
  case 'big':ctx.fillStyle='#5a2a7a';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle=fl?'#ff5ccf':'#b14aed';ctx.fillRect(x-1,y-2,3,5);ctx.fillRect(x-2,y-1,5,3);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,1);break;
  case 'snipe':ctx.fillStyle='#ff4d5e';ctx.fillRect(x-1,y-1,2,2);ctx.fillStyle='#fff';ctx.fillRect(x,y,1,1);ctx.globalAlpha=0.5;ctx.fillStyle='#ff4d5e';ctx.fillRect(Math.round(x-b.vx/40),Math.round(y-b.vy/40),1,1);ctx.globalAlpha=1;break;
  case 'spore':ctx.fillStyle=fl?'#b6ff9a':'#2e8b57';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#eaffd8';ctx.fillRect(x-1,y-1,2,2);break;
  default:ctx.fillStyle=fl?'#ff4d5e':'#ff9f1c';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#ffe066';ctx.fillRect(x,y,1,1);
 }
}
function render(){
 const s=G.s,P=G.p;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
 ctx.fillStyle=BGCOL[G.sector%BGCOL.length]||BGCOL[0];ctx.fillRect(0,0,W,H);
 if(G.shake>0.3)ctx.translate(Math.round(rnd(-G.shake,G.shake)),Math.round(rnd(-G.shake,G.shake)));
 if(G.planet)ctx.drawImage(G.planet,Math.round(G.planetX-28),Math.round(G.planetY));
 const streak=G.warpFx>0?Math.ceil(G.warpFx*14):0;
 for(const st of G.stars){ctx.fillStyle=st.c;ctx.fillRect(st.x|0,st.y|0,1,1+(st.l===2?1:0)+streak*(st.l+1)/3);}
 for(const e of G.enemies){drawEnemy(e);if(e.boss)drawBossExtras(e);}
 for(const b of G.pb)drawPB(b);
 const fl=(G.t*20|0)%2;
 for(const b of G.eb)drawEB(b,fl);
 for(const c of G.caps){const x=Math.round(c.x)-3,y=Math.round(c.y)-3;ctx.fillStyle=CAPS[c.k].c;ctx.fillRect(x,y+1,7,5);ctx.fillRect(x+1,y,5,7);ctx.fillStyle=(G.t*8|0)%2?'#ffffff':'#0b0f1e';_txt(c.k,x+2,y+1,(G.t*8|0)%2?'#ffffff':'#0b0f1e',1);}
 if(!G.dead){
  const sprP=playerSprite();
  const px=Math.round(P.x-sprP.w/2),py=Math.round(P.y-sprP.h/2);
  const fh=2+((G.t*30|0)%3)+(G.overT>0?2:0);ctx.fillStyle=G.overT>0?'#ff5ccf':'#ff9f1c';ctx.fillRect(px+4,py+12,3,fh);ctx.fillStyle='#ffe066';ctx.fillRect(px+5,py+12,1,fh+1);
  ctx.fillStyle='#ff4d5e';ctx.fillRect(px+1,py+11,1,1+(fh>3?1:0));ctx.fillRect(px+9,py+11,1,1+(fh>3?1:0));
  ctx.drawImage(P.flash>0?sprP.f:sprP.c,px,py);
  if(WMAP[S.pri].charge){const iv=gunInterval(S.pri,false),k=clamp(1-G.wT.pri/iv,0,1),r=Math.round(k*3);if(r>0){ctx.fillStyle=(G.t*20|0)%2?'#7fe7ff':'#ffffff';ctx.fillRect(Math.round(P.x)-r+1,py-2-r,r*2-1,r*2-1);}}
  if(P.shield>0&&s.shieldMax>0){ctx.globalAlpha=0.35+0.25*(P.shield/s.shieldMax)+(P.shieldDelay>2.7?0.4:0);pcircle(P.x,P.y,10,'#7fe7ff');ctx.globalAlpha=1;}
  const nd=Math.max(0,s.drones-G.captured);
  for(let i=0;i<nd;i++){const a=G.droneA+i*TAU/nd;ctx.drawImage(SPR_DRONE.c,Math.round(P.x+Math.cos(a)*17-2),Math.round(P.y+Math.sin(a)*8-4));}
 }
 for(const p of G.parts){ctx.globalAlpha=clamp(p.life/p.max*1.5,0,1);
  if(p.ring)pcircle(p.x,p.y,p.ring*(1-p.life/p.max)+1,p.c);else{ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);}}
 ctx.globalAlpha=1;
 for(const t of G.texts){ctx.globalAlpha=clamp(t.life/t.max*2,0,1);drawText(t.t,t.x,t.y,t.c,'center',1);}
 ctx.globalAlpha=1;ctx.setTransform(1,0,0,1,0,0);
 if(G.flash>0){ctx.globalAlpha=G.flash*0.6;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
 // HUD
 if(G.final)drawText('FINAL BOSS - PHASE '+(S.wave-90)+'/5',3,3,'#ff4d5e');
 else drawText('WAVE '+S.wave,3,3,'#7fe7ff');
 drawText('SECTOR '+(G.sector+1),W-3,3,'#7383bb','right');
 if(!S.auto&&!G.final)drawText('FARM',W/2,3,'#ff9f1c','center');
 if(G.isBoss){const b=G.boss,bh=b&&G.bossAlive?b.hp/b.maxHp:(G.finale?0:1);
  if(G.final){const cols=['#6bff8a','#8a94a6','#ffe066','#ff4d5e','#ff5ccf'];bar(3,11,W-6,3,bh,cols[((b&&b.form)||1)-1]||'#ff4d5e');drawText(b?b.name:'THE MAW',3,17,'#ff5ccf');}
  else{bar(3,11,W-6,3,bh,b&&b.phase===2?'#ff5ccf':'#ff4d5e');drawText(b?b.name:bossFor(S.wave).name,3,17,'#ff4d5e');}
  drawText(Math.ceil(Math.max(0,G.bossT))+'S',W-3,17,G.bossT<10&&(G.t*4|0)%2?'#ffffff':'#ff9f1c','right');}
 else bar(3,11,W-6,2,S.waveKills/G.need,'#ffe066');
 if(G.overT>0)drawText('OVERDRIVE '+Math.ceil(G.overT),W-3,H-17,(G.t*6|0)%2?'#ff9f1c':'#ffe066','right');
 if(s.shieldMax>0)bar(3,H-10,W-6,2,P.shield/s.shieldMax,'#7fe7ff');
 bar(3,H-6,W-6,3,P.hull/s.maxHull,P.hull/s.maxHull<0.3?((G.t*6|0)%2?'#ff4d5e':'#ff9f1c'):'#6bff8a');
 drawText('HULL '+fmt(Math.max(0,P.hull))+'/'+fmt(s.maxHull),3,H-17,'#6bff8a');
 if(G.banner){const b=G.banner,a=clamp(Math.min(b.t,b.max-b.t)*4,0,1);ctx.globalAlpha=a;const sc=b.txt.length>11?1:2;drawText(b.txt,W/2,H/2-30,b.c,'center',sc);ctx.globalAlpha=1;}
}

/* ---------- input ---------- */
cv.addEventListener('pointerdown',ev=>{
 ev.preventDefault();ensureAudio();if(G.dead)return;
 const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*W,y=(ev.clientY-r.top)/r.height*H;
 addPart(x,y,0,0,0.25,'#ff5ccf',1,6);
 const b={x,y,py:y,r:3};
 for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];const where=findHit(e,b);if(!where)continue;
  SFX.zap();sparks(x,y,'#ff5ccf',6);G.shake=Math.max(G.shake,1);applyHit(e,where,G.s.click,true,x,y);break;}
 G.enemies=G.enemies.filter(e=>!e.dead);
});
document.addEventListener('pointerdown',ensureAudio,{passive:true});
document.addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='TEXTAREA')return;if(e.key==='m'||e.key==='M')toggleMute();});


/* ---------- store UI ---------- */
function setText(el,t){if(el._t!==t){el._t=t;el.textContent=t;}}
function costN(base,g,L,n){return base*Math.pow(g,L)*(Math.pow(g,n)-1)/(g-1);}
function maxAff(base,g,L,cash,cap){const c0=base*Math.pow(g,L);if(cash<c0)return 0;let n=Math.floor(Math.log(cash*(g-1)/c0+1)/Math.log(g));n=Math.min(n,cap,100000);while(n>0&&costN(base,g,L,n)>cash)n--;return Math.max(0,n);}
function buyCount(u,L,cash){const cap=u.max!=null?u.max-L:Infinity;if(cap<=0)return 0;if(S.buyMode==='max'){const n=maxAff(u.base,u.g,L,cash,cap);return n>0?n:1;}return Math.min(S.buyMode,cap);}
function mkEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function buildItem(u,dm,onBuy,iconKey){
 const row=mkEl('div','item');row.appendChild(iconCanvas(iconKey||u.icon||u.id,dm));
 const info=mkEl('div','info');const nm=mkEl('div','name',u.name);const lv=mkEl('span','lv');nm.appendChild(lv);
 const desc=mkEl('div','desc',u.desc),eff=mkEl('div','eff');info.append(nm,desc,eff);
 const btn=mkEl('button','buy'+(dm?' dmb':''));btn.addEventListener('click',()=>{ensureAudio();onBuy(u);});
 row.append(info,btn);u._el={row,lv,desc,eff,btn,info};return row;
}
function afterPurchase(){SFX.buy();sparks(G.p.x,G.p.y,'#ffe066',8);save();refreshStore();}
function buyUp(u){
 if(!open(u.unlock)||(u.req&&S.u[u.req]<1))return;
 const L=S.u[u.id],n=buyCount(u,L,S.credits);if(n<=0)return;const c=costN(u.base,u.g,L,n);
 if(c>S.credits+1e-9){SFX.deny();return;}
 const oldMax=G.s.maxHull;S.credits-=c;S.u[u.id]+=n;recalc();
 if(G.s.maxHull>oldMax&&!G.dead)G.p.hull+=G.s.maxHull-oldMax;
 afterPurchase();
}
function dmCost(u,L,n){let c=0;for(let i=0;i<n;i++)c+=Math.ceil(u.base*Math.pow(u.g,L+i));return c;}
function dmCount(u,L,cash){const cap=u.max!=null?u.max-L:Infinity;if(cap<=0)return 0;if(S.buyMode==='max'){let n=0,c=0;while(n<cap&&n<1000){const nc=Math.ceil(u.base*Math.pow(u.g,L+n));if(c+nc>cash)break;c+=nc;n++;}return n>0?n:1;}return Math.min(S.buyMode,cap);}
function buyDM(u){
 if(!open(u.unlock))return;
 const L=S.d[u.id],n=dmCount(u,L,S.dm);if(n<=0)return;const c=dmCost(u,L,n);
 if(c>S.dm+1e-9){SFX.deny();return;}
 S.dm-=c;S.d[u.id]+=n;recalc();afterPurchase();
}
/* guns */
function gunCountCost(w){const L=S.wl[w.id],base=wBase(w),g=1.3;const n=S.buyMode==='max'?Math.max(1,maxAff(base,g,L-1,S.credits,Infinity)):S.buyMode;return {n,c:costN(base,g,L-1,n)};}
function buyGun(w){
 if(!open(w.unlock))return;
 if(!(S.wl[w.id]>=1)){if(S.credits<w.cost){SFX.deny();return;}S.credits-=w.cost;S.wl[w.id]=1;
  if(feat('secondarySlot')&&!S.sec&&S.pri!==w.id)S.sec=S.pri;S.pri=w.id;G.wT.pri=0;toast(w.name+' EQUIPPED');afterPurchase();return;}
 const {n,c}=gunCountCost(w);if(c>S.credits+1e-9){SFX.deny();return;}S.credits-=c;S.wl[w.id]+=n;afterPurchase();
}
function equip(w,slot){
 if(!(S.wl[w.id]>=1))return;
 if(slot==='pri'){if(S.pri===w.id)return;if(S.sec===w.id)S.sec=S.pri;S.pri=w.id;}
 else{if(!feat('secondarySlot'))return;if(S.sec===w.id)S.sec='';else if(S.pri===w.id){if(!S.sec)return;const t=S.sec;S.sec=S.pri;S.pri=t;}else S.sec=w.id;}
 G.wT.pri=0;G.wT.sec=0;SFX.buy();save(true);refreshStore();
}
function buildStore(){
 const ul=$('#upList');ul.innerHTML='';for(const u of UPG)ul.appendChild(buildItem(u,false,buyUp));
 const dl=$('#dmList');dl.innerHTML='';for(const u of DMU)dl.appendChild(buildItem(u,true,buyDM));
 const gl=$('#gunList');gl.innerHTML='';
 for(const w of WEAP){const row=buildItem(w,false,buyGun);const el=w._el;el.btn.remove();
  const box=mkEl('div','wbtns');const er=mkEl('div','eqrow');const bp=mkEl('button','eq','PRI'),bs=mkEl('button','eq','SEC');
  bp.title='Equip as primary';bs.title='Equip as secondary (50% fire rate)';
  bp.addEventListener('click',()=>equip(w,'pri'));bs.addEventListener('click',()=>equip(w,'sec'));er.append(bp,bs);box.append(el.btn,er);row.appendChild(box);el.bp=bp;el.bs=bs;gl.appendChild(row);}
}
let curTab='up';
function refreshStore(){
 const s=G.s;
 setText($('#crv'),'¢'+fmt(S.credits));setText($('#cpsv'),'+'+fmt(S.cps)+'/s');
 setText($('#dmv'),S.dmTotal>0||S.dm>0?'◆'+fmt(S.dm)+' DM':'');
 setText($('#warpBadge'),dmGain()>0?'+'+fmt(dmGain()):'');
 setText($('#gunBadge'),WEAP.some(w=>!(S.wl[w.id]>=1)&&open(w.unlock)&&S.credits>=w.cost)?'!':'');
 if(curTab==='up')for(const u of UPG){const el=u._el;
  const locked=!open(u.unlock)||(u.req&&S.u[u.req]<1);el.row.classList.toggle('locked',!!locked);
  const L=S.u[u.id];
  if(locked){setText(el.lv,'');setText(el.desc,u.req&&open(u.unlock)?'REQUIRES '+UMAP[u.req].name:'UNLOCKS AT '+IV.gateText(u.unlock));setText(el.eff,'');setText(el.btn,'LOCKED');el.btn.disabled=true;el.row.classList.remove('afford');continue;}
  setText(el.desc,u.desc);setText(el.lv,'LV '+L+(u.max!=null?'/'+u.max:''));
  if(u.max!=null&&L>=u.max){setText(el.eff,u.show(s,L));setText(el.btn,'MAXED');el.btn.disabled=true;el.row.classList.remove('afford');continue;}
  const n=buyCount(u,L,S.credits),c=costN(u.base,u.g,L,n);
  setText(el.eff,u.show(s,L)+' → '+u.show(statsWith(u.id,L+n),L+n));
  setText(el.btn,'¢'+fmt(Math.ceil(c))+(n>1?' (x'+n+')':''));
  const ok=c<=S.credits+1e-9;el.btn.disabled=!ok;el.row.classList.toggle('afford',ok);}
 if(curTab==='guns'){
  setText($('#slotPri'),WMAP[S.pri].name);setText($('#slotSec'),!feat('secondarySlot')?'AT '+IV.gateText(FMAP.secondarySlot.unlock):S.sec?WMAP[S.sec].name:'EMPTY');
  for(const w of WEAP){const el=w._el,L=S.wl[w.id]||0,owned=L>=1,locked=!open(w.unlock);
   el.row.classList.toggle('locked',locked);el.row.classList.toggle('equip',S.pri===w.id||S.sec===w.id);
   setText(el.lv,owned?'LV '+L:'');
   el.bp.classList.toggle('on',S.pri===w.id);el.bs.classList.toggle('on',S.sec===w.id);el.bp.disabled=!owned;el.bs.disabled=!owned||!feat('secondarySlot');
   if(locked){setText(el.desc,'APPEARS AT '+IV.gateText(w.unlock));setText(el.eff,'');setText(el.btn,'LOCKED');el.btn.disabled=true;el.row.classList.remove('afford');continue;}
   setText(el.desc,w.desc);
   if(!owned){const g=gunInfo(w.id,1,false);setText(el.eff,fmt(g.shot)+' x'+g.proj+' @ '+g.rate.toFixed(1)+'/s');setText(el.btn,'UNLOCK ¢'+fmt(w.cost));el.btn.disabled=S.credits<w.cost;el.row.classList.toggle('afford',S.credits>=w.cost);continue;}
   const {n,c}=gunCountCost(w);const a=gunInfo(w.id,L,false),b=gunInfo(w.id,L+n,false);
   setText(el.eff,fmt(a.shot)+' → '+fmt(b.shot)+' x'+a.proj+' @ '+a.rate.toFixed(1)+'/s');
   setText(el.btn,'LV+ ¢'+fmt(Math.ceil(c))+(n>1?' (x'+n+')':''));el.btn.disabled=c>S.credits+1e-9;el.row.classList.toggle('afford',!el.btn.disabled);}
 }
 if(curTab==='warp'){
  const g=dmGain();
  const html='<h3>◆ WARP JUMP</h3>Jump to a new timeline. Resets credits, ship upgrades, gun levels and waves. Keeps Dark Matter and unlocked guns.<br>A hull breach does this for you: <span style="color:#ff4d5e">HULL BREACH - EMERGENCY WARP</span>. It pays the same Dark Matter as the button, and nothing before wave 20. It does not count the Maw bounty.<br>Each DM ever earned: <span style="color:#ff5ccf">+5% damage & credits</span> (now x'+(1+0.05*S.dmTotal).toFixed(2)+')<br>'+
   'Highest wave cleared this run: <span style="color:#ffe066">'+S.maxWave+'</span><br>'+(g>0?'Warp now for <span style="color:#ff5ccf">+'+fmt(g)+' DM</span>':'Clear wave 20 to unlock Warp Jump');
  const box=$('#warpBox');if(box._h!==html){box._h=html;box.innerHTML=html;const b=mkEl('button','pbtn big warpbtn','WARP JUMP');b.id='warpBtn';b.addEventListener('click',askWarp);box.appendChild(b);}
  $('#warpBtn').disabled=g<=0;
  for(const u of DMU){const el=u._el;const L=S.d[u.id];
   if(!open(u.unlock)){el.row.classList.add('locked');setText(el.lv,'');setText(el.desc,'UNLOCKS AFTER '+IV.gateText(u.unlock));setText(el.eff,'');setText(el.btn,'LOCKED');el.btn.disabled=true;continue;}
   el.row.classList.remove('locked');setText(el.desc,u.desc);setText(el.lv,'LV '+L+(u.max!=null?'/'+u.max:''));
   if(u.max!=null&&L>=u.max){setText(el.eff,u.show(L));setText(el.btn,'MAXED');el.btn.disabled=true;continue;}
   const n=dmCount(u,L,S.dm),c=dmCost(u,L,n);setText(el.eff,u.show(L)+' → '+u.show(L+n));
   setText(el.btn,'◆'+fmt(Math.ceil(c))+(n>1?' (x'+n+')':''));el.btn.disabled=c>S.dm+1e-9;}
 }
 if(curTab==='stats'){
  const ago=lastSaveAt?Math.round((Date.now()-lastSaveAt)/1000):null;
  const st=storageOK?'<span style="color:#6bff8a">● AUTOSAVE ON</span> — last saved '+(ago==null?'never':ago<2?'just now':ago+'s ago'):'<span style="color:#ff4d5e">● THIS BROWSER IS BLOCKING SAVES FOR LOCAL FILES.</span> Use EXPORT to keep your progress.';
  const ss=$('#storeStatus');if(ss._h!==st){ss._h=st;ss.innerHTML=st;}
  const skn=(C.skins.find(x=>x.id===S.skin)||C.skins[0]).name;
  const rows=[['Credits',fmt(S.credits)],['Income','+'+fmt(S.cps)+'/s'],['Wave',S.wave],['Best wave ever',S.best],['Cleared this run',S.maxWave],['Total kills',fmt(S.kills)],['Bosses destroyed',S.bossKills],['Maw slain',S.finalKills|0],['Ship skin',skn],['Hull breaches',S.deaths],['Total credits earned',fmt(S.totalCredits)],['Warp jumps',S.warps],['Dark Matter (total)',fmt(S.dmTotal)],
   ['Primary',WMAP[S.pri].name+' LV'+S.wl[S.pri]],['Secondary',S.sec?WMAP[S.sec].name+' LV'+S.wl[S.sec]:'-'],
   ['DPS (est.)',fmt(gunDps(S.pri,S.wl[S.pri],false)+(S.sec?gunDps(S.sec,S.wl[S.sec],true):0)+s.droneDmg*s.drones/0.9)],['Max hull',fmt(s.maxHull)],['Play time',fmtTime(S.playTime)]];
  const h=rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('');const t=$('#statTable');if(t._h!==h){t._h=h;t.innerHTML=h;}
  refreshSkins();
 }
 const nb=$('#notesBtn');setText(nb,'v'+VERSION+(S.seenVersion!==VERSION?' NEW':''));nb.classList.toggle('new',S.seenVersion!==VERSION);
 const ab=$('#autoBtn');setText(ab,S.auto?'AUTO ON':'FARM');ab.className='pbtn '+(S.auto?'on':'off');
 setText($('#muteBtn'),S.muted?'SND OFF':'SND ON');
 document.querySelectorAll('#buyMode .pbtn').forEach(b=>b.classList.toggle('sel',String(S.buyMode)===b.dataset.m));
}
function showTab(k){curTab=k;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===k));
 ['up','guns','warp','stats'].forEach(t=>$('#pane-'+t).classList.toggle('hidden',t!==k));$('#buyMode').style.display=k==='stats'?'none':'flex';refreshStore();}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>showTab(t.dataset.tab)));
document.querySelectorAll('#buyMode .pbtn').forEach(b=>b.addEventListener('click',()=>{S.buyMode=b.dataset.m==='max'?'max':+b.dataset.m;refreshStore();}));
function toggleMute(){S.muted=!S.muted;refreshStore();save(true);}
$('#muteBtn').addEventListener('click',()=>{ensureAudio();toggleMute();});
$('#autoBtn').addEventListener('click',()=>{S.auto=!S.auto;toast(S.auto?'AUTO-ADVANCE ON':'FARM MODE: REPEATING WAVE '+S.wave);refreshStore();save(true);});
$('#saveBtn').addEventListener('click',()=>{const ok=save();toast(ok?'GAME SAVED':'BROWSER BLOCKED SAVE - USE EXPORT');refreshStore();});
$('#saveInd').addEventListener('click',()=>{if(!storageOK)openExport();});
$('#resetBtn').addEventListener('click',()=>modal('RESET?','This wipes ALL progress, including Dark Matter. Export first if you want a backup.',[{t:'CANCEL'},{t:'RESET',cls:'danger',fn:doReset}]));
$('#exportBtn').addEventListener('click',openExport);
$('#notesBtn').addEventListener('click',openNotes);
function esc(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function openNotes(){
 const sec=(t,c,a)=>a&&a.length?'<div class="tag" style="color:'+c+'">'+t+'</div><ul>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'';
 const html='<div class="notes">'+C.changelog.map(e=>'<h5>v'+esc(e.version)+' · '+esc(e.date)+'</h5><div class="nt">'+esc(e.title||'')+'</div>'+(e.gate?'<div class="ng">UNLOCK: '+esc(e.gate)+'</div>':'')+
  sec('ADDED','#6bff8a',e.added)+sec('BALANCE','#ffe066',e.balance)+sec('FIXED','#7fe7ff',e.fixed)).join('')+'</div>';
 modal('PATCH NOTES',html,[{t:'CLOSE'}]);S.seenVersion=VERSION;save(true);refreshStore();
}
$('#importBtn').addEventListener('click',openImport);
function doReset(){noSave=true;lsDel(KEY);lsDel(KEY+'_bak');noSave=false;S=fresh();S.seenVersion=VERSION;resetRun();toast('PROGRESS RESET');save();}
function resetRun(){recalc();G.p.hull=G.s.maxHull;G.p.shield=G.s.shieldMax;G.dead=false;G.pb=[];G.caps=[];G.droneT=[];G.captured=0;G.overT=0;G.finale=null;G.wT={pri:0,sec:0};G.buckets=[];G.sector=-1;startWave();refreshStore();}
function askWarp(){const g=dmGain();if(g<=0)return;modal('WARP JUMP?','Reset credits, upgrades, gun levels and waves for <b style="color:#ff5ccf">+'+fmt(g)+' Dark Matter</b>. Unlocked guns are kept.',[{t:'CANCEL'},{t:'JUMP',cls:'warpbtn',fn:doWarp}]);}
function doWarp(extra,forced){const add=!forced&&typeof extra==='number'&&extra>0?Math.floor(extra):0;const g=dmGain()+add;if(!(g>0)&&!forced)return;const prev=storeCtx();if(g>0){S.dm+=g;S.dmTotal+=g;S.warps++;}S.credits=0;UPG.forEach(u=>S.u[u.id]=0);WEAP.forEach(w=>{if(S.wl[w.id]>1)S.wl[w.id]=1;});
 S.wave=1+5*S.d.warp;S.maxWave=0;S.best=Math.max(S.best,S.wave);G.warpFx=1.5;G.flash=1;SFX.warp();resetRun();
 if(forced)banner('HULL BREACH - EMERGENCY WARP','#ff4d5e',2.8);
 else banner(add?'WARP + MAW BOUNTY':'WARP JUMP!','#ff5ccf',2.5);
 notifyUnlocks(prev);
 if(forced)toast((g>0?'+'+fmt(g):'+0')+' DARK MATTER');
 else if(add)toast('MAW BOUNTY +'+fmt(add)+' DM');
 save();}
function equipSkin(id){if(!(S.skins&&S.skins[id]>=1)){SFX.deny();return;}if(S.skin===id)return;S.skin=id;SFX.buy();const sk=C.skins.find(s=>s.id===id);toast((sk?sk.name:id)+' EQUIPPED');save(true);refreshStore();}
function refreshSkins(){const sl=$('#skinList');if(!sl)return;const rows=C.skins.filter(sk=>IV.isStarter(sk.unlock)||(S.skins&&S.skins[sk.id]>=1)||open(sk.unlock));
 const key=rows.map(s=>s.id+':'+(S.skins[s.id]|0)).join(',')+'|'+S.skin;if(sl._k===key)return;sl._k=key;sl.innerHTML='';
 for(const sk of rows){const owned=S.skins&&S.skins[sk.id]>=1;const b=mkEl('button','skinbtn',owned?(S.skin===sk.id?sk.name+' EQUIPPED':sk.name):sk.name+' LOCKED');b.disabled=!owned;b.classList.toggle('on',!!(owned&&S.skin===sk.id));b.addEventListener('click',()=>equipSkin(sk.id));sl.appendChild(b);}}
function modal(title,body,btns){$('#mTitle').textContent=title;$('#mBody').innerHTML=body;const bb=$('#mBtns');bb.innerHTML='';
 for(const b of btns){const el=mkEl('button','pbtn '+(b.cls||''),b.t);el.addEventListener('click',()=>{if(!b.keep)closeModal();if(b.fn)b.fn(el);});bb.appendChild(el);}
 $('#modal').classList.remove('hidden');}
function closeModal(){$('#modal').classList.add('hidden');}
/* export / import */
function openExport(){
 save(true);const code=exportCode();
 modal('EXPORT SAVE','Copy this code somewhere safe, or download it as a file. Load it later with IMPORT (works in any browser).<textarea id="exTa" readonly></textarea>',
  [{t:'COPY CODE',keep:true,fn:copyCode},{t:'DOWNLOAD .JSON',keep:true,fn:downloadSave},{t:'CLOSE'}]);
 $('#exTa').value=code;
}
function copyCode(){const ta=$('#exTa');const code=ta.value;const done=()=>toast('SAVE CODE COPIED');
 const fallback=()=>{ta.focus();ta.select();try{document.execCommand('copy');done();}catch(e){toast('SELECT THE TEXT AND COPY IT MANUALLY');}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(done,fallback);else fallback();}
function downloadSave(){
 S.last=Date.now();const blob=new Blob([JSON.stringify({game:'INFINITE VOID',version:VERSION,v:SAVE_VER,exported:new Date().toISOString(),code:exportCode(),save:S},null,1)],{type:'application/json'});
 const a=document.createElement('a');const d=new Date();a.download='infinite-void-save-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'.json';
 a.href=URL.createObjectURL(blob);document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);toast('SAVE FILE DOWNLOADED');}
function openImport(){
 modal('IMPORT SAVE','Paste a save code below, or upload a .json save file. This replaces your current progress.<textarea id="imTa" placeholder="IV2:..."></textarea>',
  [{t:'LOAD CODE',keep:true,fn:()=>importText($('#imTa').value)},{t:'UPLOAD FILE',keep:true,fn:()=>$('#fileIn').click()},{t:'CANCEL'}]);
}
function importText(txt){
 let obj;try{const t=String(txt||'').trim();if(t[0]==='{'){const o=JSON.parse(t);obj=o&&o.save?migrate(o.save):o&&o.code?parseImport(o.code):migrate(o);}else obj=parseImport(t);}
 catch(e){toast('INVALID SAVE: '+String(e.message||e).toUpperCase().slice(0,40));SFX.deny();return false;}
 closeModal();S=obj;resetRun();save();toast('SAVE IMPORTED: WAVE '+S.wave);SFX.power();return true;
}
$('#fileIn').addEventListener('change',ev=>{const f=ev.target.files&&ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{importText(r.result);ev.target.value='';};r.readAsText(f);});

/* ---------- offline ---------- */
function grantOffline(sec){
 if(sec<30||!(S.cps>0))return;const eff=0.5+0.125*S.d.idle,cap=8*3600;const gain=S.cps*Math.min(sec,cap)*eff;if(!(gain>0))return;
 addCredits(gain);G.bucketCur-=gain;
 modal('WELCOME BACK','Away for '+fmtTime(sec)+(sec>cap?' (8H CAP)':'')+'.<br>Your fleet salvaged <span style="color:#ffe066">¢'+fmt(gain)+'</span><br><span style="font-size:11px;color:#7383bb">'+Math.round(eff*100)+'% of your income rate</span>',[{t:'COLLECT'}]);
 save(true);
}
let lastT=performance.now();
document.addEventListener('visibilitychange',()=>{if(document.hidden){G.hiddenAt=Date.now();save(true);}else if(G.hiddenAt){const sec=(Date.now()-G.hiddenAt)/1000;G.hiddenAt=0;lastT=performance.now();grantOffline(sec);}});
window.addEventListener('beforeunload',()=>save(true));
window.addEventListener('pagehide',()=>save(true));

/* ---------- layout ---------- */
function fit(){const st=$('#stage');const pad=window.innerWidth<820?10:20;const sw=st.clientWidth-pad,sh=st.clientHeight-pad;let sc=Math.min(sw/W,sh/H);sc=sc>=2?Math.floor(sc):Math.max(0.5,Math.floor(sc*4)/4);cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';}
window.addEventListener('resize',fit);

/* ---------- boot ---------- */
G.paused=!!window.__IV_START_PAUSED; // tests: start frozen for deterministic sims
function applyDebugQuery(){
 let q;try{q=new URLSearchParams(location.search);}catch(e){return;}
 if(q.get('final')!=='1')return;
 noSave=true;S.wave=91;S.best=Math.max(S.best|0,91);
 if(q.get('mute')==='1')S.muted=true;
 if(q.get('kit')!=='1')return;
 S.warps=Math.max(3,S.warps|0);S.dmTotal=Math.max(40,S.dmTotal|0);S.dm=Math.max(40,S.dm|0);
 S.u.dmg=80;S.u.rate=25;S.u.hull=200;S.u.click=40;S.u.multi=3;S.u.drone=4;S.u.droneDmg=10;S.u.shield=8;S.u.regen=12;S.u.crit=12;
 S.wl.laser=20;S.wl.pulse=Math.max(1,S.wl.pulse|0);S.pri='laser';
 S.d.over=4;S.d.nano=3;S.d.quantum=4;S.credits=1e12;G._kit=1;
}
const hadSave=load();applyDebugQuery();recalc();
if(G._kit){const want=eHP(S.wave)*24/25,have=Math.max(1,gunDps(S.pri,S.wl[S.pri]||1,false));G.debugMul=Math.max(1,want/have);}
buildStore();G.p.hull=G.s.maxHull;G.p.shield=G.s.shieldMax;startWave();fit();refreshStore();
if(hadSave){grantOffline((Date.now()-S.last)/1000);save(true);}
else{S.seenVersion=VERSION;modal('INFINITE VOID','Your ship fires automatically.<br><span style="color:#ff5ccf">TAP ENEMIES</span> for bonus damage, aim for glowing <span style="color:#ff9f1c">WEAK POINTS</span> on bosses.<br>Spend <span style="color:#ffe066">¢ credits</span> on ship upgrades and new <span style="color:#7fe7ff">GUNS</span>, then <span style="color:#ff5ccf">WARP JUMP</span> for Dark Matter.<br>A hull breach is an emergency warp. It pays the same Dark Matter, which is nothing until wave 20.<br><span style="font-size:11px;color:#7383bb">Progress autosaves. Use SAVE/STATS &gt; EXPORT for a backup.</span>',[{t:'LAUNCH',fn:()=>save()}]);}
if(!storageOK)save(true);
let uiT=0;
function frame(t){if(G.paused){lastT=t;requestAnimationFrame(frame);return;}let dt=(t-lastT)/1000;lastT=t;if(!(dt>0))dt=0;if(dt>0.1)dt=0.1;update(dt);render();uiT+=dt;if(uiT>0.15){uiT=0;refreshStore();}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
function simRun(sec,taps){const dt=1/30;let tapT=0,sampT=0;G.ms=G.ms||{n:0,sum:0,max:0};
 for(let t=0;t<sec;t+=dt){update(dt);
  if(taps&&!G.dead){tapT-=dt;while(tapT<=0){tapT+=1/taps;let tg=null;for(const e of G.enemies)if(targetable(e)&&e.y>0&&e.y<H&&(!tg||e.y>tg.y))tg=e;
   if(tg){const wk=tg.parts&&tg.parts.find(p=>p.kind==='weak');const b={x:tg.x+(wk?wk.ox:0),y:tg.y+(wk?wk.oy:0),py:tg.y+(wk?wk.oy:0),r:3};const where=findHit(tg,b)||'body';applyHit(tg,where,G.s.click,true,b.x,b.y);G.enemies=G.enemies.filter(e=>!e.dead);}}}
  sampT-=dt;if(sampT<=0){sampT=0.5;const n=G.enemies.filter(e=>e.y>0&&e.y<H&&!e.boss).length;G.ms.n++;G.ms.sum+=n;G.ms.max=Math.max(G.ms.max,n);}}}
function playerST(taps){const s=G.s;return gunDps(S.pri,S.wl[S.pri],false)+(S.sec?gunDps(S.sec,S.wl[S.sec],true):0)+s.droneDmg*Math.max(0,s.drones-G.captured)/0.9+taps*s.click*(1+s.crit*2);}
window.__IV={pause(v){G.paused=!!v;},VERSION,C,A,ET,AIS,pickType,bossFor,storeCtx,waveCtx,feat,migrate,fresh,parseImport,update,render,openNotes,get S(){return S},set S(v){S=v;},resetRun,G,HPK,sim:simRun,playerST,eHP:w=>eHP(w),startWave,spawnBoss,BOSSES,mkEnemy,spawnInvaderGroup,hurtLimb,isFinalWave,nextPhase,die,step(sec,dt){dt=dt||1/60;for(let x=0;x<sec;x+=dt)update(dt);render();refreshStore();},recalc,save,load,refreshStore,dmGain,exportCode,importText,showTab,KEY};
})();

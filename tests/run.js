/* INFINITE VOID browser test suite (headless Playwright/Chromium).
 * node tests/run.js [--only smoke,save,migration,gating,balance,death,mega,mines,aim,latescale] [--verbose]
 * Locally you can point at an installed Chrome with CHROME_PATH=/usr/bin/google-chrome.
 * Writes artifacts/ (screenshots, balance report) for CI upload. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const {start,PREFIX}=require('./server');
const ROOT=path.resolve(__dirname,'..'),ART=path.join(ROOT,'artifacts');
const GR=JSON.parse(fs.readFileSync(path.join(__dirname,'guardrails.json'),'utf8'));
const args=process.argv.slice(2),VERBOSE=args.includes('--verbose');
const onlyArg=args.indexOf('--only'),ONLY=onlyArg>=0?args[onlyArg+1].split(','):null;
fs.mkdirSync(ART,{recursive:true});

/* Content that a brand-new save may see. Anything new MUST be gated beyond this. */
const STARTER={upgrades:['dmg','hull','click'],darkMatter:[],guns:['pulse'],enemies:['scout'],bosses:[],sectors:['outer-rim'],skins:['vanguard'],features:[],missions:[]};

let browser,server,BASE;
const results=[];
function log(...a){console.log(...a);}
/* deterministic RNG injected before any game script runs */
const seedScript=seed=>`(()=>{let a=${seed}>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;

async function newPage(opts){
 opts=opts||{};
 const ctx=await browser.newContext({viewport:{width:1280,height:800},acceptDownloads:true});
 if(opts.seed!=null)await ctx.addInitScript(seedScript(opts.seed)+'window.__IV_START_PAUSED=true;');
 if(opts.init)await ctx.addInitScript(opts.init.fn,opts.init.arg);
 const page=await ctx.newPage();const errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
 page.on('requestfailed',r=>errors.push('requestfailed: '+r.url()));
 page.on('response',r=>{if(r.status()>=400)errors.push('http '+r.status()+': '+r.url());});
 await page.goto(BASE+(opts.query||''),{waitUntil:'load'});
 await page.waitForFunction(()=>window.__IV&&__IV.G&&__IV.G.s);
 return {ctx,page,errors};
}
async function dismissModal(page){const b=await page.$('#modal:not(.hidden) #mBtns button');if(b)await b.click();}
function noErrors(errors,where){assert.deepStrictEqual(errors,[],where+': expected zero console/page errors');}

/* ---------------- suites ---------------- */
const SUITES={
async smoke(){
 const {ctx,page,errors}=await newPage();
 assert.strictEqual(await page.title(),'INFINITE VOID // Idle Space Battler');
 assert.match(await page.textContent('.title'),/INFINITE VOID/);
 assert.match(await page.textContent('#mTitle'),/INFINITE VOID/,'welcome modal on fresh save');
 await dismissModal(page);
 const ver=await page.evaluate(()=>__IV.VERSION);
 assert.match(ver,/^\d+\.\d+\.\d+$/);
 assert.match(await page.textContent('#notesBtn'),new RegExp('v'+ver.replace(/\./g,'\\.')));
 await page.waitForTimeout(8000); // real-time run
 const st=await page.evaluate(()=>({t:__IV.G.t,kills:__IV.S.kills,enemies:__IV.G.enemies.length,pb:__IV.G.pb.length,hull:__IV.G.p.hull}));
 assert.ok(st.t>4,'game loop advanced: '+st.t);
 assert.ok(st.kills>0||st.enemies>0,'enemies spawned');
 for(const t of ['guns','warp','stats','up']){await page.click('.tab[data-tab="'+t+'"]');await page.waitForTimeout(150);}
 await page.click('#notesBtn');
 assert.match(await page.textContent('#mTitle'),/PATCH NOTES/);
 const n=await page.$$eval('.notes h5',x=>x.length),cl=await page.evaluate(()=>__IV.C.changelog.length);
 assert.strictEqual(n,cl,'patch notes list every changelog entry');
 await page.screenshot({path:path.join(ART,'smoke-patch-notes.png')});
 await dismissModal(page);
 // tap the canvas a few times
 const box=await page.$eval('#game',c=>{const r=c.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});
 for(let i=0;i<5;i++)await page.mouse.click(box.x+box.w*(0.2+0.15*i),box.y+box.h*0.3);
 await page.waitForTimeout(500);
 await page.screenshot({path:path.join(ART,'smoke.png')});
 // a late-game stress: all bosses + dense wave render without errors
 await page.evaluate(()=>{const I=__IV;I.S.best=40;I.S.wave=37;I.startWave();I.step(20);for(const w of [5,10,15,20,25]){I.S.wave=w;I.startWave();I.step(8);}});
 noErrors(errors,'smoke');
 await ctx.close();
},
async save(){
 const {ctx,page,errors}=await newPage();
 await dismissModal(page);
 await page.evaluate(()=>{__IV.S.credits=1e6;__IV.showTab('up');});
 await page.click('#upList .item:nth-child(1) .buy'); // PULSE CORE
 await page.click('#upList .item:nth-child(2) .buy'); // HULL
 const before=await page.evaluate(()=>({dmg:__IV.S.u.dmg,hull:__IV.S.u.hull,credits:__IV.S.credits}));
 assert.ok(before.dmg>=1&&before.hull>=1,'purchases applied');
 await page.reload();await page.waitForFunction(()=>window.__IV&&__IV.G.s);
 const after=await page.evaluate(()=>({dmg:__IV.S.u.dmg,hull:__IV.S.u.hull,credits:__IV.S.credits}));
 assert.strictEqual(after.dmg,before.dmg);assert.strictEqual(after.hull,before.hull);
 assert.ok(after.credits>=before.credits-1,'credits persisted');
 // export code roundtrip
 const code=await page.evaluate(()=>{__IV.S.wave=13;__IV.S.best=14;__IV.S.wl.twin=3;__IV.S.pri='twin';return __IV.exportCode();});
 assert.ok(code.startsWith('IV2:'),'export prefix');
 const back=await page.evaluate(c=>{const o=__IV.parseImport(c);return {wave:o.wave,best:o.best,twin:o.wl.twin,pri:o.pri,dmg:o.u.dmg};},code);
 assert.deepStrictEqual(back,{wave:13,best:14,twin:3,pri:'twin',dmg:before.dmg});
 // import into a fresh browser profile via the UI
 const B=await newPage();await dismissModal(B.page);
 await B.page.click('.tab[data-tab="stats"]');await B.page.click('#importBtn');
 await B.page.fill('#imTa',code);await B.page.click('#mBtns button:has-text("LOAD CODE")');
 const imp=await B.page.evaluate(()=>({wave:__IV.S.wave,twin:__IV.S.wl.twin,pri:__IV.S.pri,dmg:__IV.S.u.dmg}));
 assert.deepStrictEqual(imp,{wave:13,twin:3,pri:'twin',dmg:before.dmg},'UI import');
 // file import (.json export file from VOID BREAKER era)
 await B.page.setInputFiles('#fileIn',path.join(__dirname,'fixtures','voidbreaker-v2-export.json'));
 await B.page.waitForFunction(()=>__IV.S.wave===7);
 // garbage import is rejected and does not clobber state
 const ok=await B.page.evaluate(()=>__IV.importText('not a save at all'));
 assert.strictEqual(ok,false);
 assert.strictEqual(await B.page.evaluate(()=>__IV.S.wave),7);
 // legacy VB2: prefix still accepted
 const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','voidbreaker-v2-export.json'),'utf8')).code;
 assert.ok(legacy.startsWith('VB2:'));
 assert.strictEqual(await B.page.evaluate(c=>__IV.parseImport(c).wave,legacy),7);
 noErrors(errors,'save A');noErrors(B.errors,'save B');
 await B.ctx.close();await ctx.close();
},
async migration(){
 const v1=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','voidbreaker-v1-localstorage.json'),'utf8'));
 const {ctx,page,errors}=await newPage({init:{fn:s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('voidbreaker_save_v1',s);sessionStorage.setItem('seeded','1');}},arg:JSON.stringify(v1)}});
 const m=await page.evaluate(()=>{const S=__IV.S;return {v:S.v,credits:S.credits,wave:S.wave,best:S.best,dmg:S.u.dmg,hull:S.u.hull,dm:S.dm,warps:S.warps,over:S.d.over,pulse:S.wl.pulse,pri:S.pri,sec:S.sec};});
 assert.strictEqual(m.v,2);assert.strictEqual(m.wave,9);assert.strictEqual(m.best,9);assert.strictEqual(m.dmg,7);assert.strictEqual(m.hull,4);
 assert.strictEqual(m.dm,3);assert.strictEqual(m.warps,1);assert.strictEqual(m.over,2);assert.strictEqual(m.pulse,1);assert.strictEqual(m.pri,'pulse');assert.strictEqual(m.sec,'');
 assert.ok(m.credits>=4321,'credits kept (plus offline earnings)');
 await dismissModal(page);
 await page.evaluate(()=>__IV.step(10));
 await page.reload();await page.waitForFunction(()=>window.__IV&&__IV.G.s);
 assert.strictEqual(await page.evaluate(()=>__IV.S.u.dmg),7,'migrated save persisted under the same key');
 // corrupt primary save falls back to backup
 await page.evaluate(()=>{__IV.save();localStorage.setItem(__IV.KEY+'_bak',localStorage.getItem(__IV.KEY));localStorage.setItem(__IV.KEY,'{corrupt');});
 await page.reload();await page.waitForFunction(()=>window.__IV&&__IV.G.s);
 assert.strictEqual(await page.evaluate(()=>__IV.S.u.dmg),7,'backup save used when primary is corrupt');
 noErrors(errors,'migration');
 await ctx.close();
},
async gating(){
 const {ctx,page,errors}=await newPage({seed:7});
 await page.evaluate(()=>__IV.pause(true));
 await dismissModal(page);
 const r=await page.evaluate(()=>{const I=__IV,C=I.C,problems=[];
  const regs=['upgrades','darkMatter','guns','enemies','bosses','sectors','skins','features','missions'];
  const starters={};
  for(const k of regs){const ids=new Set();starters[k]=[];
   for(const e of C[k]){if(!e||typeof e.id!=='string'||!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(e.id))problems.push(k+': bad id '+(e&&e.id));
    if(ids.has(e.id))problems.push(k+': duplicate id '+e.id);ids.add(e.id);
    if(!IV.gateValid(e.unlock))problems.push(k+'/'+e.id+': invalid unlock gate '+JSON.stringify(e.unlock));
    else if(IV.isStarter(e.unlock))starters[k].push(e.id);
    if(typeof e.name!=='string'&&k!=='icons')problems.push(k+'/'+e.id+': missing name');}}
  for(const g of C.guns){if(typeof g.fire!=='function'||typeof g.proj!=='function'||typeof g.sfx!=='function')problems.push('guns/'+g.id+': needs fire/proj/sfx');if(!(g.cost>=0))problems.push('guns/'+g.id+': cost');}
  for(const e of C.enemies){if(!I.AIS.includes(e.ai))problems.push('enemies/'+e.id+': unknown ai '+e.ai);if(e.ai==='custom'&&typeof e.update!=='function')problems.push('enemies/'+e.id+': custom ai needs update()');
   if(!e.sprite||!(e.sprite.half||e.sprite.full||e.sprite.proc))problems.push('enemies/'+e.id+': sprite');for(const f of ['hp','rew','dmg'])if(!(e[f]>=0))problems.push('enemies/'+e.id+': '+f);}
  for(const b of C.bosses){if(typeof b.update!=='function'||!Array.isArray(b.half))problems.push('bosses/'+b.id+': needs half+update');if(!(b.unlock.wave%5===0))problems.push('bosses/'+b.id+': boss gate wave must be a multiple of 5');}
  C.sectors.forEach((s,i)=>{if(s.unlock.sector!==i+1)problems.push('sectors/'+s.id+': unlock.sector must equal position '+(i+1));if(!s.scheme||!s.bg||!Array.isArray(s.planet)||s.planet.length!==3)problems.push('sectors/'+s.id+': visuals');});
  for(const u of C.upgrades){if(typeof u.show!=='function')problems.push('upgrades/'+u.id+': show');if(u.req&&!C.upgrades.some(x=>x.id===u.req))problems.push('upgrades/'+u.id+': req');if(!(u.id in I.S.u))problems.push('upgrades/'+u.id+': not in save');}
  for(const u of C.darkMatter)if(typeof u.show!=='function')problems.push('darkMatter/'+u.id+': show');
  for(const k in C.icons)if(!Array.isArray(C.icons[k]))problems.push('icons/'+k);
  for(const x of [...C.upgrades,...C.darkMatter,...C.guns])if(x.icon&&x.icon!=='ship'&&x.icon!=='drone'&&!C.icons[x.icon])problems.push('icon missing: '+x.icon);
  // live fresh-save checks
  const ui={up:[...document.querySelectorAll('#upList .item')].filter(x=>!x.classList.contains('locked')).length};
  I.showTab('guns');ui.guns=[...document.querySelectorAll('#gunList .item')].filter(x=>!x.classList.contains('locked')).length;
  I.showTab('warp');ui.dm=[...document.querySelectorAll('#dmList .item')].filter(x=>!x.classList.contains('locked')).length;I.showTab('up');
  const picks=new Set();for(let i=0;i<300;i++)picks.add(I.pickType(1));
  return {problems,starters,ui,picks:[...picks],sec:I.feat('secondarySlot')};});
 assert.deepStrictEqual(r.problems,[],'registry contracts');
 for(const k in STARTER)assert.deepStrictEqual(r.starters[k].sort(),STARTER[k].slice().sort(),'starter content for '+k+' (new content must be gated beyond a fresh save)');
 assert.deepStrictEqual(r.ui,{up:STARTER.upgrades.length,guns:STARTER.guns.length,dm:0},'fresh save UI exposes only starter content');
 assert.deepStrictEqual(r.picks,['scout'],'wave 1 spawns only starter enemies');
 assert.strictEqual(r.sec,false,'secondary slot locked on fresh save');
 // live spawn check: everything on screen during wave 1-2 is starter content
 const seen=await page.evaluate(()=>{const I=__IV,s=new Set();for(let i=0;i<40;i++){I.step(0.5);for(const e of I.G.enemies)if(I.S.wave===1)s.add(e.type);}return [...s];});
 for(const t of seen)assert.ok(STARTER.enemies.includes(t),'unexpected enemy on wave 1: '+t);
 // gates open progressively
 const g=await page.evaluate(()=>{const I=__IV;I.S.best=12;I.S.warps=1;I.refreshStore();return {sec:I.feat('secondarySlot'),bosses:[5,10,15,20,25,30].map(w=>I.bossFor(w).id)};});
 assert.strictEqual(g.sec,true);
 assert.deepStrictEqual(g.bosses,['dread','galaga','ufo','core','bio','dread'],'boss rotation');
 noErrors(errors,'gating');
 await ctx.close();
},
async balance(){
 const report={seed:GR.seed,taps:GR.taps,minutes:[]};
 const {ctx,page,errors}=await newPage({seed:GR.seed});
 await page.evaluate(()=>{__IV.pause(true);__IV.S.muted=true;}); // frozen real-time loop + no audio-clock-dependent sfx randomness = deterministic
 await dismissModal(page);
 await page.evaluate(()=>{window.__bot=()=>{const I=__IV;I.S.buyMode=1;
   const val=b=>{const m=b.textContent.match(/¢([\d.]+)([A-Za-z]*)/);if(!m)return Infinity;const mult={'':1,K:1e3,M:1e6,B:1e9,T:1e12,Qa:1e15,Qi:1e18,Sx:1e21}[m[2]]||1;let v=parseFloat(m[1])*mult;if(b.textContent.startsWith('UNLOCK'))v*=0.3;return v;};
   for(let k=0;k<300;k++){const c=[];
    I.showTab('up');document.querySelectorAll('#upList .buy').forEach(b=>{if(!b.disabled)c.push(b);});
    I.showTab('guns');document.querySelectorAll('#gunList .buy').forEach(b=>{if(!b.disabled&&(b.textContent.startsWith('UNLOCK')||b.closest('.item').classList.contains('equip')))c.push(b);});
    if(!c.length)break;c.sort((a,b)=>val(a)-val(b));c[0].click();}
   I.showTab('up');};});
 const minute=taps=>page.evaluate(taps=>{const I=__IV,G=I.G;G.mk=[];G.ms={n:0,sum:0,max:0};for(let i=0;i<12;i++){I.sim(5,taps);__bot();}
   const S=I.S,st=I.playerST(taps),hp=I.eHP(S.wave);
   return {wave:S.wave,best:S.best,maxWave:S.maxWave,deaths:S.deaths,kills:G.mk.length,onScreenAvg:+(G.ms.sum/Math.max(1,G.ms.n)).toFixed(1),onScreenMax:G.ms.max,focusTTK:+(hp/st).toFixed(3),dmGain:I.dmGain(),gun:S.pri+(S.sec?'/'+S.sec:'')};},taps);
 const fails=[];let prev=1;
 const total=Math.max(...GR.checkpoints.map(c=>c.min),GR.warpAvailableByMin);
 for(let m=1;m<=total;m++){
  const r=await minute(GR.taps);r.min=m;report.minutes.push(r);
  if(m>3&&r.wave-prev>GR.maxWaveGainPerMinuteAfter3)fails.push(`min ${m}: wave jumped ${prev}->${r.wave} (> ${GR.maxWaveGainPerMinuteAfter3}/min): enemies too weak`);
  prev=r.wave;
  const cp=GR.checkpoints.find(c=>c.min===m);
  if(cp){
   const win=report.minutes.slice(-3),avg=k=>+(win.reduce((a,x)=>a+x[k],0)/win.length).toFixed(3);
   r.onScreenAvg=avg('onScreenAvg');r.focusTTK=avg('focusTTK');r.windowed=true;
   if(r.wave<cp.waveMin)fails.push(`min ${m}: wave ${r.wave} < ${cp.waveMin}: progression stalled`);
   if(r.wave>cp.waveMax)fails.push(`min ${m}: wave ${r.wave} > ${cp.waveMax}: progression too fast`);
   if(r.onScreenAvg<cp.onScreenAvgMin)fails.push(`min ${m}: avg enemies on screen ${r.onScreenAvg} < ${cp.onScreenAvgMin}: screen too empty`);
   if(r.focusTTK<cp.focusTTKMin)fails.push(`min ${m}: focus time-to-kill ${r.focusTTK}s < ${cp.focusTTKMin}s: enemies melt`);
   if(r.focusTTK>cp.focusTTKMax)fails.push(`min ${m}: focus time-to-kill ${r.focusTTK}s > ${cp.focusTTKMax}s: enemies too tanky`);
  }
  if(VERBOSE)log('  min',m,JSON.stringify(r));
 }
 const last=report.minutes[report.minutes.length-1];
 if(!(last.dmGain>0))fails.push(`warp not available by min ${GR.warpAvailableByMin} (maxWave ${last.maxWave})`);
 // warp jump, then the next run must move faster
 if(last.dmGain>0){
  const w=await page.evaluate(()=>{const I=__IV,g=I.dmGain();I.showTab('warp');document.getElementById('warpBtn').click();document.querySelector('#mBtns button:nth-child(2)').click();
   I.S.buyMode='max';for(let k=0;k<20;k++)document.querySelectorAll('#dmList .buy').forEach(b=>{if(!b.disabled)b.click();});I.S.buyMode=1;I.showTab('up');
   return {gain:g,dm:I.S.dmTotal,warps:I.S.warps,wave:I.S.wave,d:JSON.stringify(I.S.d)};});
  report.warp=w;if(VERBOSE)log('  warp',JSON.stringify(w));
  if(w.warps!==1||w.dm<=0)fails.push('warp jump failed');
  for(let m=1;m<=GR.postWarp.minutes;m++){const r=await minute(GR.taps);r.min='warp+'+m;report.minutes.push(r);if(VERBOSE)log('  warp+'+m,JSON.stringify(r));}
  const pw=report.minutes[report.minutes.length-1],need=Math.floor(last.best*GR.postWarp.minFractionOfPreWarpBest);
  if(pw.best<need)fails.push(`post-warp: best wave ${pw.best} < ${need} after ${GR.postWarp.minutes} min: warp jump not rewarding enough`);
 }
 noErrors(errors,'balance');await ctx.close();
 // idle player (no taps) must not stall at the very start
 const I2=await newPage({seed:GR.seed+1});await I2.page.evaluate(()=>{__IV.pause(true);__IV.S.muted=true;});await dismissModal(I2.page);
 await I2.page.evaluate(()=>{window.__bot=()=>{const I=__IV;I.S.buyMode=1;for(let k=0;k<300;k++){I.showTab('up');const c=[...document.querySelectorAll('#upList .buy')].filter(b=>!b.disabled);if(!c.length)break;c[0].click();}};});
 let ir;for(let m=1;m<=GR.idle.minutes;m++){ir=await I2.page.evaluate(()=>{const I=__IV;for(let i=0;i<12;i++){I.sim(5,0);__bot();}return {wave:I.S.wave,best:I.S.best};});}
 report.idle=ir;if(VERBOSE)log('  idle',JSON.stringify(ir));
 if(ir.best<GR.idle.waveMin)fails.push(`idle: best wave ${ir.best} < ${GR.idle.waveMin} after ${GR.idle.minutes} min`);
 noErrors(I2.errors,'balance idle');await I2.ctx.close();
 report.fails=fails;
 fs.writeFileSync(path.join(ART,'balance-report.json'),JSON.stringify(report,null,1));
 log('  balance: '+GR.checkpoints.map(c=>{const r=report.minutes.find(x=>x.min===c.min);return `min${c.min} wave ${r.wave} onScreen ${r.onScreenAvg} TTK ${r.focusTTK}s`;}).join(' | ')+(report.warp?` | warp +${report.warp.gain}DM`:'')+` | idle best ${ir.best}`);
 assert.deepStrictEqual(fails,[],'balance guardrails');
},
async death(){
 const {ctx,page,errors}=await newPage();
 await page.evaluate(()=>__IV.pause(true));
 await dismissModal(page);
 const r=await page.evaluate(()=>{
  const I=__IV,S=I.S,G=I.G;
  const toast=()=>document.getElementById('toast').textContent;
  const saved=()=>JSON.parse(localStorage.getItem(I.KEY));
  S.wave=8;S.maxWave=6;S.best=8;S.credits=4000;S.u.dmg=5;S.wl.pulse=3;S.dm=0;S.dmTotal=0;S.warps=0;S.deaths=0;S.finalKills=0;S.skins.eidolon=0;S.d.warp=0;
  I.recalc();
  const earlyGain=I.dmGain();
  I.die();
  const early={gain:earlyGain,wave:S.wave,max:S.maxWave,credits:S.credits,dmg:S.u.dmg,pulse:S.wl.pulse,dm:S.dm,warps:S.warps,deaths:S.deaths,banner:G.banner&&G.banner.txt,toast:toast(),save:saved()};
  I.step(1/60);
  S.wave=31;S.maxWave=30;S.best=31;S.credits=9000;S.u.dmg=6;S.wl.pulse=4;S.dm=0;S.dmTotal=0;S.warps=0;S.deaths=0;S.finalKills=0;S.skins.eidolon=0;
  I.recalc();
  const paidGain=I.dmGain();
  I.die();
  const paid={gain:paidGain,wave:S.wave,max:S.maxWave,credits:S.credits,dmg:S.u.dmg,pulse:S.wl.pulse,dm:S.dm,dmTotal:S.dmTotal,warps:S.warps,deaths:S.deaths,banner:G.banner&&G.banner.txt,toast:toast(),save:saved()};
  I.step(1/60);
  const banked=S.dm;
  S.credits=250;S.u.dmg=3;S.maxWave=0;S.wave=4;
  I.recalc();
  const againGain=I.dmGain();
  I.die();
  const again={gain:againGain,dm:S.dm,warps:S.warps,credits:S.credits,dmg:S.u.dmg,deaths:S.deaths};
  I.step(1/60);
  S.wave=94;S.maxWave=93;S.best=94;S.credits=100;S.finalKills=0;S.skins.eidolon=0;S.u.dmg=2;
  I.recalc();
  const mawGain=I.dmGain();
  I.die();
  const maw={gain:mawGain,wave:S.wave,dm:S.dm-banked,warps:S.warps,kills:S.finalKills|0,skin:S.skins.eidolon|0,banner:G.banner&&G.banner.txt,save:saved()};
  return {early,paid,again,maw};
 });
 assert.strictEqual(r.early.gain,0,'early death pays nothing');
 assert.strictEqual(r.early.wave,1);assert.strictEqual(r.early.max,0);assert.strictEqual(r.early.credits,0);assert.strictEqual(r.early.dmg,0);assert.strictEqual(r.early.pulse,1);
 assert.strictEqual(r.early.dm,0);assert.strictEqual(r.early.warps,0,'a zero payout does not count as a Warp Jump');
 assert.strictEqual(r.early.deaths,1);assert.strictEqual(r.early.banner,'HULL BREACH - EMERGENCY WARP');
 assert.ok(r.early.toast.includes('DARK MATTER'));
 assert.strictEqual(r.early.save.wave,1);assert.strictEqual(r.early.save.warps,0);assert.strictEqual(r.early.save.dm,0);assert.strictEqual(r.early.save.deaths,1);
 assert.ok(r.paid.gain>0,'wave 30 has Dark Matter');
 assert.strictEqual(r.paid.dm,r.paid.gain,'forced warp pays the voluntary amount');
 assert.strictEqual(r.paid.dmTotal,r.paid.gain);assert.strictEqual(r.paid.warps,1);assert.strictEqual(r.paid.wave,1);assert.strictEqual(r.paid.max,0);
 assert.strictEqual(r.paid.credits,0);assert.strictEqual(r.paid.dmg,0);assert.strictEqual(r.paid.pulse,1);assert.strictEqual(r.paid.deaths,1);
 assert.strictEqual(r.paid.banner,'HULL BREACH - EMERGENCY WARP');
 assert.strictEqual(r.paid.save.dm,r.paid.gain);assert.strictEqual(r.paid.save.warps,1);assert.strictEqual(r.paid.save.wave,1);
 assert.strictEqual(r.again.gain,0);assert.strictEqual(r.again.dm,r.paid.gain,'a second death cannot farm more Dark Matter');
 assert.strictEqual(r.again.warps,1);assert.strictEqual(r.again.credits,0);assert.strictEqual(r.again.dmg,0);assert.strictEqual(r.again.deaths,2);
 assert.ok(r.maw.gain>0);assert.strictEqual(r.maw.dm,r.maw.gain,'Maw death pays no bounty');
 assert.strictEqual(r.maw.kills,0);assert.strictEqual(r.maw.skin,0);assert.strictEqual(r.maw.wave,1);
 assert.strictEqual(r.maw.banner,'HULL BREACH - EMERGENCY WARP');
 assert.strictEqual(r.maw.save.finalKills,0);assert.strictEqual(r.maw.save.wave,1);
 noErrors(errors,'death');
 await ctx.close();
},
async mega(){
 const {ctx,page,errors}=await newPage();
 await page.evaluate(()=>__IV.pause(true));
 await dismissModal(page);
 const r=await page.evaluate(()=>{
  const I=__IV,S=I.S,G=I.G;
  const toast=()=>document.getElementById('toast').textContent;
  const saved=()=>JSON.parse(localStorage.getItem(I.KEY));
  const tiers=I.BOSSES.map(b=>({id:b.id,tier:b.tier||'',final:!!b.final}));
  const rot=[];
  for(let w=5;w<=100;w+=5)rot.push(I.bossFor(w).id);
  const span={};
  for(const w of [90,91,92,93,94,95,96])span[w]=I.isMegaWave(w);
  const labels={p1:I.megaPhaseText(91),p5:I.megaPhaseText(95)};
  const migrated=I.migrate({credits:1,u:{},finalKills:4});
  S.wave=91;S.maxWave=90;S.best=91;S.auto=true;
  I.startWave();
  const intro={mega:G.mega,banner:G.banner&&G.banner.txt,toast:toast(),phase:I.megaPhaseText(S.wave)};
  function slay(){
   G.spawnT=0;G.p.hull=1e9;G.p.y=220;
   I.step(1/60);
   const e=G.boss;if(!e)throw new Error('no mega boss');
   e.parts=[];e.limbs=[];e.hp=1;e.maxHp=1;e.bodyMult=1;e.holdKill=false;e.a1=99;e.a2=99;
   e.x=90;e.y=36;e.tx=90;e.ty=36;
   G.eb.length=0;G.pb.length=0;
   G.pb.push({x:90,y:36,py:37,vx:0,vy:-10,dmg:100,r:30,k:'orb'});
   I.step(1/60);
  }
  S.wave=95;S.maxWave=95;S.best=95;S.auto=true;S.megaPaid=0;S.finalKills=0;S.skins.eidolon=0;
  S.dm=3;S.dmTotal=3;S.warps=1;S.credits=1000;S.u.dmg=2;S.deaths=0;
  I.recalc();
  const reward=I.megaReward();
  I.startWave();
  slay();
  const clear={
   wave:S.wave,warps:S.warps,dm:S.dm,dmTotal:S.dmTotal,credits:S.credits,dmg:S.u.dmg,
   kills:S.finalKills|0,skin:S.skins.eidolon|0,paid:S.megaPaid|0,deaths:S.deaths,
   banner:G.banner&&G.banner.txt,toast:toast(),hold:!!G.megaHold,reward
  };
  I.step(3);
  const next={wave:S.wave,warps:S.warps,mega:G.mega,hold:G.megaHold,credits:S.credits,dmg:S.u.dmg,dm:S.dm,paid:S.megaPaid|0,save:saved()};
  const dmHeld=S.dm;
  S.wave=95;I.startWave();slay();
  const again={dm:S.dm,paid:S.megaPaid|0,kills:S.finalKills|0,skin:S.skins.eidolon|0,warps:S.warps,wave:S.wave};
  I.step(3);
  const gain=I.dmGain();
  const before=S.dm;
  I.die();
  const died={gain,dm:S.dm-before,wave:S.wave,warps:S.warps,paid:S.megaPaid|0,kills:S.finalKills|0,skin:S.skins.eidolon|0,credits:S.credits,banner:G.banner&&G.banner.txt,save:saved(),held:dmHeld};
  return {tiers,rot,span,labels,migrated:{kills:migrated.finalKills,paid:migrated.megaPaid},intro,clear,next,again,died};
 });
 assert.deepStrictEqual(r.tiers.map(b=>b.tier).filter(Boolean).length,r.tiers.length,'every boss has a tier');
 assert.ok(r.tiers.every(b=>!b.final),'no boss is flagged final');
 assert.deepStrictEqual(r.tiers.find(b=>b.id==='maw').tier,'mega');
 for(const id of ['dread','galaga','ufo','core','bio'])assert.strictEqual(r.tiers.find(b=>b.id===id).tier,'standard',id);
 assert.ok(r.rot.every(id=>id!=='maw'),'the rotation never picks the mega boss');
 assert.deepStrictEqual(r.span,{90:false,91:true,92:true,93:true,94:true,95:true,96:false});
 assert.strictEqual(r.labels.p1,'MEGA BOSS - PHASE 1/5');
 assert.strictEqual(r.labels.p5,'MEGA BOSS - PHASE 5/5');
 assert.strictEqual(r.migrated.kills,4);assert.strictEqual(r.migrated.paid,0);
 assert.strictEqual(r.intro.mega,true);
 assert.strictEqual(r.intro.banner,'MEGA BOSS');
 assert.strictEqual(r.intro.toast,'MEGA BOSS - PHASE 1/5');
 assert.strictEqual(r.clear.wave,95,'the clear beat has not advanced yet');
 assert.strictEqual(r.clear.warps,1,'a clear is not a warp');
 assert.strictEqual(r.clear.dm,3+r.clear.reward.dm);
 assert.strictEqual(r.clear.dmTotal,3+r.clear.reward.dm);
 assert.ok(r.clear.credits>=1000+r.clear.reward.credits,'credits bounty is paid on top of the kill');
 assert.strictEqual(r.clear.dmg,2);assert.strictEqual(r.clear.kills,1);assert.strictEqual(r.clear.skin,1);
 assert.strictEqual(r.clear.paid,1);assert.strictEqual(r.clear.deaths,0);
 assert.strictEqual(r.clear.banner,'MAW FALLS');
 assert.ok(r.clear.toast.includes('EIDOLON'));assert.ok(r.clear.toast.includes('DM'));
 assert.strictEqual(r.clear.hold,true);
 assert.strictEqual(r.next.wave,96,'the run continues');
 assert.strictEqual(r.next.warps,1);assert.strictEqual(r.next.mega,false);assert.strictEqual(r.next.hold,null);
 assert.ok(r.next.credits>0);assert.strictEqual(r.next.dmg,2);assert.strictEqual(r.next.dm,r.clear.dm);assert.strictEqual(r.next.paid,1);
 assert.strictEqual(r.next.save.wave,96);assert.strictEqual(r.next.save.warps,1);assert.strictEqual(r.next.save.megaPaid,1);
 assert.strictEqual(r.next.save.finalKills,1);assert.strictEqual(r.next.save.skins.eidolon,1);
 assert.strictEqual(r.again.dm,r.clear.dm,'a second clear in the same run pays no more Dark Matter');
 assert.strictEqual(r.again.paid,1);assert.strictEqual(r.again.kills,2);assert.strictEqual(r.again.skin,1);
 assert.strictEqual(r.again.warps,1);assert.strictEqual(r.again.wave,95);
 assert.ok(r.died.gain>0);
 assert.strictEqual(r.died.dm,r.died.gain,'death pays dmGain only, not another bounty');
 assert.strictEqual(r.died.wave,1);assert.strictEqual(r.died.warps,2);assert.strictEqual(r.died.paid,0);
 assert.strictEqual(r.died.kills,2);assert.strictEqual(r.died.skin,1);assert.strictEqual(r.died.credits,0);
 assert.strictEqual(r.died.banner,'HULL BREACH - EMERGENCY WARP');
 assert.strictEqual(r.died.save.megaPaid,0);assert.strictEqual(r.died.save.finalKills,2);assert.strictEqual(r.died.save.wave,1);
 noErrors(errors,'mega');
 await ctx.close();
 const jump=async(query)=>{
  const p=await newPage({query,init:{fn:()=>{window.__IV_START_PAUSED=true;}}});
  const s=await p.page.evaluate(()=>({wave:__IV.S.wave,mega:__IV.G.mega,banner:__IV.G.banner&&__IV.G.banner.txt,saved:__IV.save(),kit:__IV.G.debugMul,pri:__IV.S.pri}));
  noErrors(p.errors,'mega '+query);
  await p.ctx.close();
  return s;
 };
 const megaQ=await jump('?mega=1');
 assert.strictEqual(megaQ.wave,91);assert.strictEqual(megaQ.mega,true);assert.strictEqual(megaQ.banner,'MEGA BOSS');
 assert.strictEqual(megaQ.saved,false,'?mega=1 does not write the save');
 const alias=await jump('?final=1');
 assert.strictEqual(alias.wave,91);assert.strictEqual(alias.mega,true);assert.strictEqual(alias.saved,false);
 const kit=await jump('?mega=1&kit=1');
 assert.strictEqual(kit.wave,91);assert.ok(kit.kit>1,'kit raises debug damage');assert.strictEqual(kit.pri,'laser');
},
async mines(){
 const {ctx,page,errors}=await newPage();
 await page.evaluate(()=>__IV.pause(true));
 await dismissModal(page);
 const r=await page.evaluate(()=>{
  const I=__IV,S=I.S,G=I.G;
  S.muted=true;S.auto=true;G.p.hull=1e9;G.s.maxHull=1e9;G.dead=false;G.dying=false;
  const hold=()=>{G.wT.pri=1e9;G.wT.sec=1e9;G.s.rate=0;G.toSpawn=0;};
  const step=(n)=>{for(let i=0;i<n;i++){hold();I.update(1/30);}};
  const live=t=>G.enemies.filter(e=>e.type===t&&!e.dead);
  const halfHas=(id,ch)=>I.ET[id].sprite.half.join('').includes(ch);
  const pass={};
  for(const w of [23,24,25,26,27,28,29,30,31,32,33,35,36,39,40,42,45]){S.wave=w;I.startWave();pass[w]=!!G.minePass;}
  S.wave=23;I.startWave();
  const w23={banner:G.banner&&G.banner.txt,miner:live('miner').length};
  S.wave=30;I.startWave();
  const w30={banner:G.banner&&G.banner.txt,pass:!!G.minePass};
  S.wave=24;I.startWave();hold();
  const miner0=live('miner')[0];
  const w24={banner:G.banner&&G.banner.txt,w:miner0?miner0.w:0,h:miner0?miner0.h:0};
  let max=0,span=0,ys=[];
  for(let i=0;i<150;i++){hold();I.update(1/30);const ms=live('mine');if(ms.length>max){max=ms.length;ys=[...new Set(ms.map(m=>m.y))];span=Math.max(...ms.map(m=>m.x))-Math.min(...ms.map(m=>m.x));}}
  const line={max,ys,span,mw:live('mine')[0]?live('mine')[0].w:0};
  S.wave=36;I.startWave();hold();
  let max2=0,ys2=[];
  for(let i=0;i<280;i++){hold();I.update(1/30);const ms=live('mine');if(ms.length>=max2){max2=ms.length;ys2=[...new Set(ms.map(m=>+m.y.toFixed(1)))].sort((a,b)=>a-b);}}
  const two={max2,ys2};
  G.enemies.length=0;G.eb.length=0;S.waveKills=0;const cred0=S.credits;
  const xs=[40,54,68,82];
  const chainM=xs.map(x=>I.mkEnemy('mine',{counts:false,x,y:90}));
  chainM.forEach(m=>{m.counts=false;m.life=20;m.born=G.t-1;});
  I.A.kill(chainM[0]);
  step(20);
  const chain={dead:chainM.map(m=>!!m.dead),bullets:G.eb.length,wk:S.waveKills};
  const exp=I.mkEnemy('mine',{counts:false,x:16,y:40});
  exp.counts=false;exp.life=0.15;const eb=G.eb.length,cr=S.credits,wk=S.waveKills;
  step(15);
  const expired={dead:!!exp.dead,bullets:G.eb.length-eb,cred:S.credits-cr,wk:S.waveKills-wk};
  S.wave=27;I.startWave();hold();
  for(let i=0;i<150;i++){hold();I.update(1/30);}
  const before={wave:S.wave,wk:S.waveKills,mines:live('mine').length};
  const one=live('mine')[0];I.A.kill(one);
  const afterMine={wave:S.wave,wk:S.waveKills,mines:live('mine').length};
  G.need=1;G.toSpawn=0;S.waveKills=0;
  const sc=I.mkEnemy('scout',{counts:true,x:20,y:150});
  I.A.kill(sc);
  const cleared={wave:S.wave,minesBefore:before.mines,wkAfterMine:afterMine.wk,waveAfterMine:afterMine.wave};
  G.p.x=100;G.p.y=210;G.p.hull=800;G.s.maxHull=800;G.dead=false;G.dying=false;
  const tm=I.mkEnemy('mine',{counts:false,x:100,y:210});
  tm.counts=false;tm.life=20;tm.born=G.t-1;
  const h0=G.p.hull;I.update(1/30);
  const touch={d:h0-G.p.hull,dead:!!tm.dead,warped:S.wave===1&&G.justWarped};
  G.enemies.length=0;G.p.x=30;G.p.y=210;G.s.rate=0;
  for(let i=0;i<6;i++){const m=I.mkEnemy('mine',{counts:false,x:24+i*14,y:64});m.counts=false;m.life=30;m.born=G.t-1;}
  const far=I.mkEnemy('invader',{counts:true,x:160,y:100});
  step(18);const xField=G.p.x;
  far.y=200;step(18);const xClose=G.p.x;
  G.enemies.length=0;G.p.x=20;
  for(let i=0;i<2;i++){const m=I.mkEnemy('mine',{counts:false,x:20+i*14,y:64});m.counts=false;m.life=30;m.born=G.t-1;}
  I.mkEnemy('invader',{counts:true,x:160,y:100});
  step(18);const xFew=G.p.x;
  let picks=0;
  for(let i=0;i<400;i++){const t=I.pickType(44);if(t==='miner'||t==='mine')picks++;}
  for(let i=0;i<80;i++){const t=I.pickType(1);if(t==='miner'||t==='mine')picks++;}
  return {pass,w23,w30,w24,line,two,chain,expired,before,cleared,touch,aim:{xField,xClose,xFew},picks,xy:{miner:halfHas('miner','X')||halfHas('miner','Y'),mine:halfHas('mine','X')||halfHas('mine','Y')},cred0};
 });
 await page.waitForTimeout(500);
 const toast=await page.evaluate(()=>document.getElementById('toast').textContent);
 assert.strictEqual(r.pass[23],false);assert.strictEqual(r.pass[24],true);assert.strictEqual(r.pass[25],false);
 assert.strictEqual(r.pass[27],true);assert.strictEqual(r.pass[30],false);assert.strictEqual(r.pass[33],true);
 assert.strictEqual(r.pass[35],false);assert.strictEqual(r.pass[36],true);assert.strictEqual(r.pass[40],false);assert.strictEqual(r.pass[45],false);
 assert.strictEqual(r.w23.banner,'WAVE 23');assert.strictEqual(r.w23.miner,0);
 assert.ok(r.w30.banner.startsWith('WARNING'));assert.strictEqual(r.w30.pass,false);
 assert.strictEqual(r.w24.banner,'MINE LAYERS');assert.ok(r.w24.w>=21,'minelayer is a wide hull');assert.ok(r.w24.h>=9);
 assert.ok(toast.includes('NEW THREAT: MINE LAYERS'),toast);
 assert.ok(r.line.max>=8&&r.line.max<=12,'a pass lays 8 to 12 mines, got '+r.line.max);
 assert.strictEqual(r.line.ys.length,1);assert.ok(r.line.span>100);assert.ok(r.line.mw>=13,'mine sprite is readable');
 assert.ok(r.two.max2>12&&r.two.max2<=24,'second pass stays under the cap, got '+r.two.max2);
 assert.ok(r.two.ys2.length>=2,'later waves lay a second line');
 assert.deepStrictEqual(r.chain.dead,[true,true,true,true]);assert.ok(r.chain.bullets>=12);assert.strictEqual(r.chain.wk,0);
 assert.strictEqual(r.expired.dead,true);assert.strictEqual(r.expired.bullets,0);assert.strictEqual(r.expired.cred,0);assert.strictEqual(r.expired.wk,0);
 assert.ok(r.before.mines>=8);assert.strictEqual(r.cleared.waveAfterMine,r.before.wave);assert.strictEqual(r.cleared.wkAfterMine,0);
 assert.strictEqual(r.cleared.wave,r.before.wave+1,'killing the quota still clears while mines are up');
 assert.ok(r.touch.d>0,'a touch hurts');assert.strictEqual(r.touch.dead,true);
 assert.ok(r.aim.xField<50,'guns cut the field instead of chasing a far ship');
 assert.ok(r.aim.xClose>r.aim.xField+12,'a ship on top of you outranks the field');
 assert.ok(r.aim.xFew>40,'a short row does not hold the guns');
 assert.strictEqual(r.picks,0);assert.strictEqual(r.xy.miner,false);assert.strictEqual(r.xy.mine,false);
 noErrors(errors,'mines');
 await ctx.close();
},
async aim(){
 const {ctx,page,errors}=await newPage({seed:1337});
 await page.evaluate(()=>__IV.pause(true));
 await dismissModal(page);
 const r=await page.evaluate(()=>{
  const I=__IV,S=I.S,G=I.G;
  S.muted=true;S.auto=true;G.p.hull=1e9;G.s.maxHull=1e9;G.dead=false;G.dying=false;
  S.wave=15;I.startWave();G.toSpawn=0;
  I.spawnBoss(I.bossFor(15));
  const boss=G.boss;boss.x=140;boss.y=50;
  G.p.x=20;G.p.y=210;
  I.mkEnemy('invader',{counts:false,x:20,y:180});
  for(let i=0;i<8;i++){const m=I.mkEnemy('mine',{counts:false,x:12+i*20,y:64});m.life=30;m.counts=false;}
  const picked=I.pickTarget();
  const x0=G.p.x;
  for(let i=0;i<30;i++){G.wT.pri=1e9;G.wT.sec=1e9;G.s.rate=0;I.update(1/30);}
  const moved=G.p.x;
  const on=I.mkEnemy('fighter',{counts:false,x:G.p.x,y:G.p.y});
  const threat=I.pickTarget();
  on.dead=true;
  S.wave=91;S.pri='pulse';S.sec='homing';S.wl.pulse=1;S.wl.homing=1;S.u.multi=0;I.recalc();
  I.startWave();G.p.hull=1e9;G.dead=false;G.dying=false;
  for(let i=0;i<90;i++)I.update(1/30);
  const maw=G.boss,part=I.aimPoint(maw);
  const shipX=part.x>90?30:150;G.p.x=shipX;G.pb.length=0;G.wT.pri=0;G.wT.sec=0;G.s.rate=20;
  I.update(1/30);
  const shots=G.pb.map(b=>({k:b.k,x:+b.x.toFixed(1),vx:+b.vx.toFixed(2),vy:+b.vy.toFixed(2),homing:b.homing|0}));
  return {boss:!!(picked&&picked.boss),bid:boss.bid,x0,moved:+moved.toFixed(1),threat:threat&&threat.type,partX:+part.x.toFixed(1),part:part.part,shipX,shots,limbs:maw.limbs.filter(L=>L.hp>0).length};
 });
 assert.strictEqual(r.boss,true,'a boss outranks a closer minion and a mine field');
 assert.ok(r.moved>r.x0+12,'the ship slides toward the boss');
 assert.strictEqual(r.threat,'fighter','only an enemy on the hull pulls aim off the boss');
 assert.strictEqual(r.part,true);assert.ok(r.limbs>=4);
 assert.ok(Math.abs(r.partX-r.shipX)>40,'the tentacle is not already under the ship');
 const pulse=r.shots.filter(b=>b.k==='pulse');
 const missiles=r.shots.filter(b=>b.k==='missile');
 assert.ok(pulse.length>=1,'primary gun fired');
 for(const b of pulse){assert.strictEqual(b.vx,0,'primary shots fly straight up');assert.ok(b.vy<0);assert.strictEqual(b.homing,0);assert.ok(Math.abs(b.x-r.shipX)<8,'the bolt leaves the ship, not the tentacle');}
 assert.ok(missiles.length>=1&&missiles.every(b=>b.homing===1),'homing missiles stay homing');
 noErrors(errors,'aim');
 await ctx.close();
 const kit=await newPage({seed:1337,query:'?mega=1&kit=1&mute=1'});
 const clear=await kit.page.evaluate(()=>{
  const I=__IV,rows=[];
  let t=0;
  for(let i=0;i<30;i++){I.sim(10,0);t+=10;rows.push({t,wave:I.S.wave,form:I.G.boss&&I.G.boss.form,deaths:I.S.deaths,kills:I.S.finalKills|0});
   if((I.S.finalKills|0)>0||I.S.wave>=96||I.S.deaths>0)break;}
  return {t,wave:I.S.wave,deaths:I.S.deaths,kills:I.S.finalKills|0,rows};
 });
 assert.strictEqual(clear.deaths,0);assert.ok(clear.kills>=1,'idle kit clears the Maw');assert.ok(clear.wave>=96);
 assert.ok(clear.t<=270,'idle clear '+clear.t+'s is within 1.5x of the 3 minute fight');
 noErrors(kit.errors,'aim maw');
 await kit.ctx.close();
},
async latescale(){
 const code=fs.readFileSync(path.join(__dirname,'fixtures','louis-iv2.txt'),'utf8').trim();
 const {ctx,page,errors}=await newPage({seed:1337});
 page.setDefaultTimeout(120000);
 await page.evaluate(()=>{__IV.pause(true);__IV.S.muted=true;});
 await dismissModal(page);
 const r=await page.evaluate(code=>{
  const I=__IV;
  const parsed=I.parseImport(code);
  if(I.importText(code)!==true)return {err:'import'};
  I.S.muted=true;I.S.auto=true;I.pause(true);
  const S0=I.S;
  const save={
   v:parsed.v,wave:S0.wave,best:S0.best,warps:S0.warps,dm:S0.dm,dmTotal:S0.dmTotal,
   credits:S0.credits,finalKills:S0.finalKills,skin:S0.skin,pri:S0.pri,sec:S0.sec,
   auto:S0.auto,muted:true,seen:S0.seenVersion,deaths:S0.deaths,
   u:Object.assign({},S0.u),d:Object.assign({},S0.d),wl:Object.assign({},S0.wl)
  };
  const H=I.HPK,sector=w=>Math.floor((w-1)/10);
  const raw=w=>H.base*Math.pow(H.g,w-1)*Math.pow(H.sec,sector(w))*(1+H.p*Math.min(w-1,H.pc));
  const math={
   cap:I.HP_CAP_WAVE,bend:I.HP_BEND_WAVE,mult:I.HP_LATE_MULT,late:I.DMG_LATE,ver:I.VERSION,
   hp45:I.eHP(45),raw45:raw(45),hp100:I.eHP(100),raw100:raw(100),
   hp101:I.eHP(101),raw101:raw(101),hp125:I.eHP(125),raw125:raw(125),
   hp126:I.eHP(126),hp140:I.eHP(140),hp200:I.eHP(200),
   d125:I.eDmg(125),d126:I.eDmg(126),d130:I.eDmg(130),d131:I.eDmg(131),d140:I.eDmg(140),
   classic125:Math.pow(1.11,124)
  };
  const costN=(base,g,L,n)=>base*Math.pow(g,L)*(Math.pow(g,n)-1)/(g-1);
  function buy(id,room){
   const u=I.C.upgrades.find(x=>x.id===id);if(!u)return 0;
   const L=I.S.u[id]|0,cap=Math.min(room,(u.max==null?1e9:u.max)-L);if(cap<=0)return 0;
   const c0=u.base*Math.pow(u.g,L);if(!(I.S.credits>=c0))return 0;
   let n=Math.floor(Math.log(I.S.credits*(u.g-1)/c0+1)/Math.log(u.g));
   n=Math.max(0,Math.min(n,cap,400));
   while(n>0&&costN(u.base,u.g,L,n)>I.S.credits)n--;if(n<=0)return 0;
   I.S.credits-=costN(u.base,u.g,L,n);I.S.u[id]+=n;return n;
  }
  function buyGun(id,room){
   const w=I.C.guns.find(g=>g.id===id);if(!w||!(I.S.wl[id]>=1))return;
   const base=Math.max(100,w.cost),g=1.3,L=I.S.wl[id],c0=base*Math.pow(g,L-1);if(!(I.S.credits>=c0))return;
   let n=Math.floor(Math.log(I.S.credits*(g-1)/c0+1)/Math.log(g));n=Math.max(0,Math.min(n,room,40));
   while(n>0&&costN(base,g,L-1,n)>I.S.credits)n--;if(n<=0)return;
   I.S.credits-=costN(base,g,L-1,n);I.S.wl[id]+=n;
  }
  function shop(){
   const old=I.G.s.maxHull,hit=I.eDmg(I.S.wave)*2.4;let guard=0;
   while(guard++<6&&I.G.s.maxHull<hit*16){if(!buy('hull',20))break;I.recalc();}
   if(I.S.u.shield<18)buy('shield',4);
   if(I.S.u.regen<20)buy('regen',4);
   if(I.S.u.rate<30)buy('rate',10);
   if(I.S.u.multi<4)buy('multi',1);
   if(I.S.u.crit<30)buy('crit',6);
   buy('dmg',25);
   if(I.S.u.drone<6)buy('drone',1);
   if(I.S.u.drone>0&&I.S.u.droneDmg<50)buy('droneDmg',8);
   buyGun('laser',3);buyGun('ring',2);
   I.recalc();
   if(I.G.s.maxHull<hit*12)buy('hull',12);
   I.recalc();
   if(!I.G.dead&&!I.G.dying&&I.G.s.maxHull>old)I.G.p.hull=Math.min(I.G.s.maxHull,I.G.p.hull+(I.G.s.maxHull-old));
  }
  shop();
  const dt=1/30;let t=0,acc=0,cur=null,deaths=I.S.deaths,snap=null;
  const bosses=[];
  while(t<1500&&I.S.wave<132&&I.S.deaths===deaths){
   I.update(dt);t+=dt;acc+=dt;
   const b=I.G.boss;
   if(b&&b.boss&&!b.dead&&!cur)cur={id:b.bid,wave:I.S.wave,t,ref:b};
   if(cur&&(cur.ref.hp<=0||cur.ref.dead||I.S.wave!==cur.wave||I.S.deaths>deaths)){
    bosses.push({id:cur.id,wave:cur.wave,dt:+(t-cur.t).toFixed(2),kill:cur.ref.hp<=0});
    cur=null;
   }
   if(acc>=1){acc=0;shop();
    if(!I.G.dead&&!I.G.dying)snap={u:Object.assign({},I.S.u),wl:Object.assign({},I.S.wl),pri:I.S.pri,sec:I.S.sec,wave:I.S.wave,dps:Math.round(I.playerST(0)),hull:Math.round(I.G.s.maxHull)};
   }
  }
  const end={t:+t.toFixed(1),wave:I.S.wave,deaths:I.S.deaths};
  function fight(wave,bid){
   const S=I.S,G=I.G;
   Object.assign(S.u,snap.u);Object.assign(S.wl,snap.wl);S.pri=snap.pri;S.sec=snap.sec;
   S.wave=wave;S.auto=false;S.deaths=0;I.recalc();
   G.dead=false;G.dying=false;G.megaHold=null;
   G.p.hull=G.s.maxHull;G.p.shield=G.s.shieldMax;G.p.x=90;G.p.y=210;
   G.pb.length=0;G.eb.length=0;G.enemies.length=0;G.caps.length=0;
   I.startWave();G.toSpawn=0;G.bossT=35;
   I.spawnBoss(I.BOSSES.find(b=>b.id===bid));
   const boss=G.boss;boss.y=40;boss.x=90;boss.tx=90;boss.ty=40;
   const aim=I.aimPoint(boss),weak=boss.parts.find(p=>p.kind==='weak');
   const covers=boss.parts.filter(p=>(p.kind==='wall'||p.kind==='block')&&p.hp>0&&Math.abs(aim.x-(boss.x+p.ox))<=p.w/2+0.5);
   let tt=0,minH=G.p.hull;
   for(let i=0;i<40*30;i++){
    I.update(dt);tt+=dt;
    if(G.p.hull<minH)minH=G.p.hull;
    if(boss.hp<=0)return {wave,bid,kill:true,t:+tt.toFixed(2),deaths:S.deaths,minH:Math.round(minH),aim:+(aim.x-(90+weak.ox)).toFixed(2),covered:covers.length,weakW:weak.w};
    if(S.deaths>0||G.dying||G.bossT<=0)return {wave,bid,kill:false,death:S.deaths>0||!!G.dying,t:+tt.toFixed(2),hp:+(boss.hp/boss.maxHp).toFixed(3),deaths:S.deaths};
   }
   return {wave,bid,kill:false,t:+tt.toFixed(2),hp:+(boss.hp/boss.maxHp).toFixed(3)};
  }
  const rows=[];
  for(const w of [120,125,130])for(const id of ['core','bio'])rows.push(fight(w,id));
  function mob(wave,type){I.S.wave=wave;const e=I.mkEnemy(type,{x:20,y:20,counts:false});const hp=e.maxHp;e.dead=true;return hp;}
  function bolt(wave){I.S.wave=wave;I.G.eb.length=0;I.A.bossFire({x:90,y:40,h:20},Math.PI/2,40,'orb',1);return I.G.eb[I.G.eb.length-1].dmg;}
  function touch(wave){
   I.S.wave=wave;I.recalc();I.G.dead=false;I.G.dying=false;I.G.p.hull=1e12;I.G.p.shield=0;I.G.s.shieldMax=0;
   const m=I.mkEnemy('mine',{x:I.G.p.x,y:I.G.p.y,counts:false});m.life=30;m.born=I.G.t-1;
   const h=I.G.p.hull;I.update(dt);return h-I.G.p.hull;
  }
  function back(bid,seg){
   I.S.wave=125;I.G.enemies.length=0;I.G.pb.length=0;I.G.toSpawn=0;I.G.bossT=30;
   I.G.wT.pri=10;I.G.wT.sec=10;I.G.s.rate=0;I.G.s.drones=0;I.G.droneT.length=0;
   I.spawnBoss(I.BOSSES.find(b=>b.id===bid));
   const boss=I.G.boss;boss.y=-40;
   const p=boss.parts.find(q=>seg?q.seg===seg:q.kind==='wall'&&q.ox===0);
   const max=p.maxHp;p.hp=0;p.down=0.05;I.update(0.1);
   return {hp:p.hp,max,down:p.down};
  }
  const mine125=mob(125,'mine'),mine140=mob(140,'mine'),scout125=mob(125,'scout'),scout140=mob(140,'scout');
  I.S.wave=125;I.spawnBoss(I.BOSSES.find(b=>b.id==='core'));const core125=I.G.boss.maxHp;I.G.boss.dead=true;
  I.S.wave=140;I.spawnBoss(I.BOSSES.find(b=>b.id==='core'));const core140=I.G.boss.maxHp;
  return {save,math,end,snap,bosses:bosses.filter(b=>b.wave>=100&&b.id!=='maw'),rows,
   mine125,mine140,scout125,scout140,core125,core140,bolt125:bolt(125),bolt140:bolt(140),touch125:touch(125),touch140:touch(140),
   wall:back('core'),plate:back('bio',2)};
 },code);
 assert.ok(!r.err,r.err);
 const s=r.save;
 assert.strictEqual(s.v,2);
 assert.strictEqual(s.wave,29);assert.strictEqual(s.best,120);assert.strictEqual(s.warps,42);
 assert.strictEqual(s.dm,163);assert.strictEqual(s.dmTotal,1465);
 assert.ok(Math.abs(s.credits-14951656.013)<0.01);
 assert.strictEqual(s.finalKills,10);assert.strictEqual(s.skin,'eidolon');
 assert.strictEqual(s.pri,'laser');assert.strictEqual(s.sec,'ring');
 assert.strictEqual(s.auto,true);assert.strictEqual(s.seen,'1.2.1');assert.strictEqual(s.deaths,62);
 for(const id of ['dmg','hull','click','rate','credit','crit','regen','multi','drone','droneDmg','shield'])assert.strictEqual(s.u[id],0,id);
 assert.deepStrictEqual(s.d,{over:12,salv:11,nano:8,quantum:8,warp:5,idle:4});
 for(const id of ['pulse','twin','spread','homing','laser','ring','wave'])assert.ok(s.wl[id]>=1,id);
 const m=r.math;
 assert.strictEqual(m.ver,'1.3.0');
 assert.strictEqual(m.cap,125);assert.strictEqual(m.bend,100);assert.strictEqual(m.mult,3.5);assert.strictEqual(m.late,1.12);
 assert.strictEqual(m.hp45,m.raw45);assert.strictEqual(m.hp100,m.raw100);
 assert.ok(m.hp101>m.hp100&&m.hp101<m.raw101,'wave 101 leaves the classic curve');
 assert.ok(Math.abs(m.hp125-m.hp100*m.mult)<1,'wave 125 health is 3.5x wave 100');
 assert.ok(m.hp125<m.raw125/10,'the cap is far below a clamped classic curve');
 assert.strictEqual(m.hp126,m.hp125);assert.strictEqual(m.hp140,m.hp125);assert.strictEqual(m.hp200,m.hp125);
 assert.ok(Math.abs(m.d125-m.classic125)<1e-6);assert.ok(Math.abs(m.d126/m.d125-m.late)<1e-9);
 const sec=Math.floor(130/10)-Math.floor(124/10);
 assert.ok(Math.abs(m.d131/m.d125-Math.pow(m.late,6)*Math.pow(1.2,sec))<1e-6,'sector step still applies to damage');
 assert.ok(m.d140>m.d130&&m.d130>m.d125);
 assert.strictEqual(r.mine125,r.mine140);assert.strictEqual(r.scout125,r.scout140);assert.strictEqual(r.core125,r.core140);
 assert.ok(Math.abs(r.bolt140/r.bolt125-m.d140/m.d125)<1e-6);
 assert.ok(Math.abs(r.touch140/r.touch125-m.d140/m.d125)<1e-6);
 assert.ok(r.touch125>0&&r.bolt125>0);
 assert.strictEqual(r.end.deaths,62,'the developed run takes no new hull breach');
 assert.ok(r.end.wave>=130,'run reached wave '+r.end.wave);
 assert.ok(r.bosses.length>=6,'late bosses fought: '+r.bosses.length);
 for(const b of r.bosses){assert.strictEqual(b.kill,true,b.id+' w'+b.wave);assert.ok(b.dt<35,b.id+' w'+b.wave+' '+b.dt+'s');}
 const liveCore=r.bosses.find(b=>b.id==='core'&&b.wave===120);
 const liveBio=r.bosses.find(b=>b.id==='bio'&&b.wave===125);
 assert.ok(liveCore&&liveCore.dt<35);assert.ok(liveBio&&liveBio.dt<35);
 for(const row of r.rows){
  assert.strictEqual(row.kill,true,row.bid+' w'+row.wave+' hp '+row.hp);
  assert.ok(row.t<35,row.bid+' w'+row.wave+' '+row.t+'s vs 35s escape');
  assert.strictEqual(row.deaths,0);
 }
 const core125=r.rows.find(x=>x.bid==='core'&&x.wave===125);
 const bio125=r.rows.find(x=>x.bid==='bio'&&x.wave===125);
 assert.ok(Math.abs(core125.aim)<=core125.weakW/2,'Big Core aim sits on the weak column');
 assert.strictEqual(core125.covered,0,'Big Core aim is a gap, not a shield');
 assert.ok(bio125.covered>=1,'Xeno aim sits on the plate that covers the core');
 assert.strictEqual(r.wall.hp,r.wall.max);assert.strictEqual(r.wall.down,0);
 assert.strictEqual(r.plate.hp,r.plate.max);assert.strictEqual(r.plate.down,0);
 log('  latescale: wave '+r.end.wave+' in '+r.end.t+'s, 0 new deaths | live core120 '+liveCore.dt+'s bio125 '+liveBio.dt+'s | isolated core125 '+core125.t+'s bio125 '+bio125.t+'s (escape 35s) | eHP125 '+Math.round(m.hp125)+' eDmg130/125 '+(m.d130/m.d125).toFixed(3));
 await page.evaluate(id=>{
  const I=__IV;I.S.wave=125;I.S.auto=false;I.recalc();
  I.G.dead=false;I.G.dying=false;I.G.p.hull=I.G.s.maxHull;I.G.p.shield=I.G.s.shieldMax;I.G.p.x=30;I.G.p.y=210;
  I.startWave();I.G.toSpawn=0;I.spawnBoss(I.BOSSES.find(b=>b.id===id));
  const b=I.G.boss;b.y=36;b.x=90;b.tx=90;b.ty=36;I.step(0.45);
 },'core');
 await page.screenshot({path:path.join(ART,'latescale-core.png')});
 await page.evaluate(id=>{
  const I=__IV;I.S.wave=125;I.S.auto=false;I.recalc();
  I.G.dead=false;I.G.dying=false;I.G.p.hull=I.G.s.maxHull;I.G.p.shield=I.G.s.shieldMax;I.G.p.x=30;I.G.p.y=210;
  I.startWave();I.G.toSpawn=0;I.spawnBoss(I.BOSSES.find(b=>b.id===id));
  const b=I.G.boss;b.y=36;b.x=90;b.tx=90;b.ty=36;I.step(0.45);
 },'bio');
 await page.screenshot({path:path.join(ART,'latescale-bio.png')});
 noErrors(errors,'latescale');
 await ctx.close();
},
};

(async()=>{
 server=await start(0);BASE='http://127.0.0.1:'+server.address().port+PREFIX;
 browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
 let failed=0;
 for(const name of Object.keys(SUITES)){
  if(ONLY&&!ONLY.includes(name))continue;
  const t0=Date.now();
  try{await SUITES[name]();log(`ok   ${name} (${((Date.now()-t0)/1000).toFixed(1)}s)`);results.push({name,ok:true});}
  catch(e){failed++;log(`FAIL ${name}: ${e.message}`);if(VERBOSE||process.env.CI)log(e.stack);results.push({name,ok:false,error:e.message});}
 }
 fs.writeFileSync(path.join(ART,'results.json'),JSON.stringify(results,null,1));
 await browser.close();server.close();
 log(failed?`${failed} suite(s) failed`:'all browser suites passed');
 process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1);});

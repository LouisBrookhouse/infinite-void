/* INFINITE VOID browser test suite (headless Playwright/Chromium).
 * node tests/run.js [--only smoke,save,migration,gating,balance] [--verbose]
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
 await page.goto(BASE,{waitUntil:'load'});
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

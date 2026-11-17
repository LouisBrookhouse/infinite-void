/* Node-only unit tests (no browser): progression gates, session-note expiry safety. */
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path'),vm=require('vm');
const {plan,apply}=require('../scripts/expire-sessions');
let n=0;const t=(name,fn)=>{fn();n++;console.log('ok  ',name);};

/* ---- gates (src/core.js) ---- */
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','src','core.js'),'utf8'),sandbox);
const IV=sandbox.window.IV;
t('gateValid accepts known keys only',()=>{
 assert.ok(IV.gateValid({wave:1}));assert.ok(IV.gateValid({sector:2,warps:1}));
 for(const g of [null,{},[],{wave:0},{wave:1.5},{level:3},{wave:'5'},{warps:-1}])assert.ok(!IV.gateValid(g),JSON.stringify(g));
});
t('gateOpen ANDs keys',()=>{
 assert.ok(IV.gateOpen({wave:5},{wave:5}));assert.ok(!IV.gateOpen({wave:5},{wave:4}));
 assert.ok(IV.gateOpen({sector:2},{wave:11}));assert.ok(!IV.gateOpen({sector:2},{wave:10}));
 assert.ok(!IV.gateOpen({wave:5,warps:1},{wave:50,warps:0}));assert.ok(IV.gateOpen({wave:5,warps:1},{wave:50,warps:1}));
 assert.ok(IV.isStarter({wave:1}));assert.ok(!IV.isStarter({wave:2}));assert.ok(!IV.isStarter({warps:1}));
});
t('gateText',()=>{assert.strictEqual(IV.gateText({wave:12}),'WAVE 12');assert.strictEqual(IV.gateText({warps:1,sector:3}),'SECTOR 3 + 1 WARP JUMP');});

/* ---- session expiry ---- */
const DAY=86400000,NOW=Date.parse('2026-11-30T12:00:00Z');
function note(created,promoted){return `---\ncreated: ${created}\nintent: test\ndurable_promoted: ${promoted===undefined?'true':promoted}\n---\n## Intent\nx\n`;}
function mk(files){const d=fs.mkdtempSync(path.join(os.tmpdir(),'sess-'));for(const [n,c] of Object.entries(files))fs.writeFileSync(path.join(d,n),c);return d;}
const iso=ms=>new Date(ms).toISOString().replace(/\.\d+Z$/,'Z');
t('deletes only notes older than 7 days by created timestamp',()=>{
 const old=iso(NOW-7*DAY-1000),edge=iso(NOW-7*DAY),young=iso(NOW-6*DAY);
 const d=mk({[old.slice(0,10)+'-old.md']:note(old),[edge.slice(0,10)+'-edge.md']:note(edge),[young.slice(0,10)+'-young.md']:note(young),'README.md':'x','TEMPLATE.md':note(old)});
 const p=plan(d,NOW);
 assert.deepStrictEqual(p.delete.map(x=>x.file),[old.slice(0,10)+'-old.md']);
 // mtime is irrelevant: touching the old file does not save it
 fs.utimesSync(path.join(d,old.slice(0,10)+'-old.md'),new Date(NOW),new Date(NOW));
 assert.strictEqual(plan(d,NOW).delete.length,1);
});
t('dry run (plan) deletes nothing; apply deletes exactly the plan',()=>{
 const old=iso(NOW-10*DAY);const d=mk({[old.slice(0,10)+'-a.md']:note(old),'README.md':'x'});
 const p=plan(d,NOW);assert.strictEqual(fs.readdirSync(d).length,2);
 assert.strictEqual(apply(p),1);assert.deepStrictEqual(fs.readdirSync(d),['README.md']);
});
t('keeps malformed, future, unpromoted, misnamed, reserved and symlinked files',()=>{
 const old=iso(NOW-30*DAY),fut=iso(NOW+2*DAY);
 const outside=mk({'2026-01-01-victim.md':note(old)});
 const d=mk({
  '2026-10-01-nofm.md':'no front matter','2026-10-01-badts.md':note('last tuesday'),
  [fut.slice(0,10)+'-future.md']:note(fut),[old.slice(0,10)+'-unpromoted.md']:note(old,'false'),
  'notes.md':note(old),'README.md':note(old),'TEMPLATE.md':note(old)});
 fs.symlinkSync(path.join(outside,'2026-01-01-victim.md'),path.join(d,'2026-01-01-link.md'));
 fs.mkdirSync(path.join(d,'2026-01-01-dir.md'));
 const p=plan(d,NOW);
 assert.deepStrictEqual(p.delete,[]);
 const reasons=Object.fromEntries(p.keep.map(k=>[k.file,k.reason]));
 assert.match(reasons['2026-10-01-nofm.md'],/front-matter/);assert.match(reasons['2026-10-01-badts.md'],/invalid created/);
 assert.match(reasons[fut.slice(0,10)+'-future.md'],/future/);assert.match(reasons[old.slice(0,10)+'-unpromoted.md'],/durable_promoted/);
 assert.match(reasons['notes.md'],/name/);assert.match(reasons['2026-01-01-link.md'],/symlink/);assert.match(reasons['2026-01-01-dir.md'],/regular file/);
 assert.strictEqual(reasons['README.md'],'reserved');
 apply(p);assert.ok(fs.existsSync(path.join(outside,'2026-01-01-victim.md')),'symlink target untouched');
});
t('refuses a symlinked sessions directory',()=>{
 const real=mk({});const link=path.join(os.tmpdir(),'sess-link-'+process.pid);try{fs.unlinkSync(link);}catch(e){}
 fs.symlinkSync(real,link);assert.throws(()=>plan(link,NOW),/refusing/);fs.unlinkSync(link);
});
t('the real docs/sessions directory plans cleanly',()=>{
 const p=plan(path.resolve(__dirname,'..','docs','sessions'),Date.now());
 assert.ok(Array.isArray(p.delete));
});
console.log(`unit: ${n} tests passed`);

#!/usr/bin/env node
/* Documentation, changelog and session-note validator (no dependencies, no network).
 *   node scripts/validate-docs.js                 # validate the working tree
 *   node scripts/validate-docs.js --base <sha>    # also enforce PR policy against a base commit
 *   DAILY_UPDATE=true ...                         # PR carries the `daily-update` label: stricter policy
 * Exit code 1 on any error. */
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const {NOTE_RE,RESERVED,REQUIRED_HEADINGS,parseFrontMatter,parseTime}=require('./sessions-lib');
const ROOT=path.resolve(__dirname,'..');
const errors=[],warns=[];
const err=m=>errors.push(m),warn=m=>warns.push(m);
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const exists=f=>fs.existsSync(path.join(ROOT,f));

/* 1. required lasting docs */
const REQUIRED=['README.md','AGENTS.md','docs/INDEX.md','docs/DESIGN.md','docs/ROADMAP.md','docs/STATUS.md','docs/OPERATIONS.md','docs/sessions/README.md','docs/sessions/TEMPLATE.md'];
for(const f of REQUIRED){if(!exists(f))err('missing required doc: '+f);else if(rd(f).trim().length<200)err('doc looks empty: '+f);}

/* 2. relative links in markdown resolve */
function mdFiles(dir){const out=[];for(const n of fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})){const p=path.posix.join(dir,n.name);if(n.isDirectory())out.push(...mdFiles(p));else if(n.name.endsWith('.md'))out.push(p);}return out;}
for(const f of ['README.md','AGENTS.md',...mdFiles('docs')].filter(exists)){
 const text=rd(f).replace(/```[\s\S]*?```/g,'');
 for(const m of text.matchAll(/\]\(([^)\s]+)\)/g)){let t=m[1];if(/^(https?:|mailto:|#)/.test(t))continue;t=t.split('#')[0];if(!t)continue;
  const target=path.resolve(path.join(ROOT,path.dirname(f)),t);if(!target.startsWith(ROOT)||!fs.existsSync(target))err(`${f}: broken link -> ${m[1]}`);}
}

/* 3. changelog data */
function loadChangelog(src){const IV={content:{changelog:[]}};vm.runInNewContext(src,{IV},{timeout:1000});return IV.content.changelog;}
const semver=v=>/^\d+\.\d+\.\d+$/.test(v);
const cmpVer=(a,b)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;};
let changelog=[];
try{changelog=loadChangelog(rd('src/content/changelog.js'));}catch(e){err('changelog.js does not evaluate: '+e.message);}
if(!changelog.length)err('changelog is empty');
changelog.forEach((e,i)=>{
 const at=`changelog[${i}]`;
 if(!semver(e.version))err(at+': version must be semver x.y.z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!isFinite(Date.parse(e.date+'T00:00:00Z')))err(at+': date must be YYYY-MM-DD');
 if(typeof e.title!=='string'||!e.title.trim())err(at+': title required');
 for(const k of ['added','balance','fixed'])if(e[k]!=null&&(!Array.isArray(e[k])||e[k].some(s=>typeof s!=='string'||!s.trim())))err(at+': '+k+' must be an array of non-empty strings');
 if(!(e.added&&e.added.length)&&!(e.fixed&&e.fixed.length))err(at+': needs at least one added or fixed line');
 if(i>0){const p=changelog[i-1];if(semver(p.version)&&semver(e.version)&&cmpVer(p.version,e.version)<=0)err(at+': versions must strictly decrease (newest first)');
  if(p.date<e.date)err(at+': dates must not increase going down the list');}
});
const today=new Date(Date.now()+86400000).toISOString().slice(0,10);
if(changelog[0]&&changelog[0].date>today)err('changelog top entry is dated in the future');
if(exists('package.json')&&changelog[0]){const pv=JSON.parse(rd('package.json')).version;if(pv!==changelog[0].version)err(`package.json version ${pv} must match changelog top version ${changelog[0].version}`);}

/* 4. session notes */
const SECRET=/(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|xox[abpr]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{32,})/;
const PLACEHOLDER=/\{\{[^}]*\}\}|<FILL[^>]*>|\bTBD\b/;
const sessDir=path.join(ROOT,'docs','sessions');const notes=[];
if(fs.existsSync(sessDir))for(const name of fs.readdirSync(sessDir).sort()){
 if(RESERVED.has(name))continue;
 const at='docs/sessions/'+name,p=path.join(sessDir,name),ls=fs.lstatSync(p);
 if(ls.isSymbolicLink()||!ls.isFile()){err(at+': must be a regular file');continue;}
 if(!NOTE_RE.test(name)){err(at+': name must be YYYY-MM-DD-short-slug.md');continue;}
 const text=fs.readFileSync(p,'utf8'),fm=parseFrontMatter(text);
 if(!fm){err(at+': missing or malformed front-matter');continue;}
 const c=parseTime(fm.fm.created);
 if(c==null){err(at+': created must be a UTC ISO timestamp like 2026-11-17T10:30:00Z');continue;}
 if(c>Date.now()+10*60000)err(at+': created is in the future');
 if(name.slice(0,10)!==fm.fm.created.slice(0,10))err(at+': filename date must equal created date (UTC)');
 if(fm.fm.updated!=null){const u=parseTime(fm.fm.updated);if(u==null)err(at+': updated must be a UTC ISO timestamp');else if(u<c)err(at+': updated is before created');}
 if(!['true','false'].includes(fm.fm.durable_promoted))err(at+': durable_promoted must be true or false');
 if(!fm.fm.intent)err(at+': intent (one line) required in front-matter');
 for(const h of REQUIRED_HEADINGS)if(!fm.body.includes('\n'+h))err(at+': missing section "'+h+'"');
 if(PLACEHOLDER.test(text))err(at+': still contains template placeholders');
 if(SECRET.test(text))err(at+': looks like it contains a credential - remove it');
 if(c<Date.now()-7*86400000&&fm.fm.durable_promoted!=='true')warn(at+': older than 7 days but durable_promoted=false, so it will not expire');
 notes.push(name);
}
for(const f of ['AGENTS.md',...mdFiles('docs')].filter(exists))if(SECRET.test(rd(f)))err(f+': looks like it contains a credential');

/* 5. PR policy */
const bi=process.argv.indexOf('--base');
if(bi>=0){
 const base=process.argv[bi+1],daily=String(process.env.DAILY_UPDATE)==='true';
 if(!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,100}$/.test(base||''))err('--base needs a commit sha or ref');
 else{
  const out=cp.execFileSync('git',['diff','--name-status','--no-renames',base+'...HEAD'],{cwd:ROOT,encoding:'utf8'});
  const changes=out.trim()?out.trim().split('\n').map(l=>{const [st,...f]=l.split('\t');return {st,file:f.join('\t')};}):[];
  const files=changes.map(c=>c.file);
  const outsideSessions=files.filter(f=>!f.startsWith('docs/sessions/'));
  const noteTouched=changes.some(c=>c.st!=='D'&&c.file.startsWith('docs/sessions/')&&NOTE_RE.test(path.basename(c.file)));
  const game=files.filter(f=>f==='index.html'||/^(src|css|assets)\//.test(f));
  let baseLog=[];try{baseLog=loadChangelog(cp.execFileSync('git',['show',base+':src/content/changelog.js'],{cwd:ROOT,encoding:'utf8'}));}catch(e){}
  const newEntries=changelog.length-baseLog.length,topChanged=!baseLog[0]||!changelog[0]||baseLog[0].version!==changelog[0].version;
  if(outsideSessions.length&&!noteTouched)err('policy: every PR that changes the repo must add or update a session note in docs/sessions/ (see docs/sessions/README.md)');
  if(game.length&&!(topChanged&&newEntries>=1))err('policy: game files changed ('+game.slice(0,3).join(', ')+') but no new changelog entry was prepended in src/content/changelog.js');
  if(baseLog.length&&changelog.length>=baseLog.length){const old=changelog.slice(newEntries);if(JSON.stringify(old)!==JSON.stringify(baseLog))err('policy: existing changelog entries must not be edited or removed');}
  if(daily){
   const PROTECTED=/^(\.github\/|scripts\/|tests\/(?!fixtures\/)|package\.json$|package-lock\.json$|AGENTS\.md$)/;
   for(const c of changes){if(PROTECTED.test(c.file))err(`policy (daily-update): ${c.file} is protected - daily updates must not change CI, tests, guardrails, scripts or agent rules. Open a separate PR without the daily-update label for the owner to review.`);
    if(c.file.startsWith('tests/fixtures/')&&c.st!=='A')err('policy (daily-update): existing test fixtures must not be modified: '+c.file);}
   if(newEntries!==1)err('policy (daily-update): exactly one new changelog entry is required (found '+newEntries+')');
   if(!files.includes('docs/STATUS.md'))err('policy (daily-update): docs/STATUS.md must be updated');
   if(!files.includes('docs/ROADMAP.md'))err('policy (daily-update): docs/ROADMAP.md must be updated (tick the item you shipped)');
  }
  if(!errors.length)console.log(`policy: ${changes.length} changed file(s) vs ${base.slice(0,7)}${daily?' (daily-update)':''}: ok`);
 }
}

for(const w of warns)console.log('warn: '+w);
if(errors.length){for(const e of errors)console.error('error: '+e);console.error(`validate-docs: ${errors.length} error(s)`);process.exit(1);}
console.log(`validate-docs: ok (${REQUIRED.length} docs, ${changelog.length} changelog entries, ${notes.length} session notes)`);

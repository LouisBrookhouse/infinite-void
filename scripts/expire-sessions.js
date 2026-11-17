#!/usr/bin/env node
/* Deletes ephemeral session notes in docs/sessions/ whose `created` front-matter timestamp is more than
 * 7 days old (NOT file mtime; editing a note does not extend its life).
 * Safety rules - a note is only deleted when ALL hold:
 *   - it is a regular file (not a symlink) directly inside docs/sessions/, name matches YYYY-MM-DD-slug.md
 *   - it is not README.md / TEMPLATE.md
 *   - front-matter parses, `created` is a valid UTC ISO timestamp, not in the future
 *   - `durable_promoted: true` (its lasting knowledge was promoted to docs/STATUS.md / ROADMAP / DESIGN)
 * Anything else is kept and reported. Dry run by default; pass --apply to delete.
 * Usage: node scripts/expire-sessions.js [--apply] [--now 2026-11-24T00:00:00Z] [--json] */
const fs=require('fs'),path=require('path');
const {NOTE_RE,RESERVED,parseFrontMatter,parseTime}=require('./sessions-lib');
const DAY=86400000,MAX_AGE_DAYS=7,FUTURE_SLACK=10*60000;

function plan(dir,now){
 const out={dir,now:new Date(now).toISOString(),delete:[],keep:[]};
 const st=fs.lstatSync(dir);
 if(st.isSymbolicLink()||!st.isDirectory())throw new Error('refusing: '+dir+' is not a real directory');
 const real=fs.realpathSync(dir);
 for(const name of fs.readdirSync(dir).sort()){
  const keep=reason=>out.keep.push({file:name,reason});
  if(RESERVED.has(name)){keep('reserved');continue;}
  if(!NOTE_RE.test(name)){keep('name does not match YYYY-MM-DD-slug.md');continue;}
  const p=path.join(dir,name),ls=fs.lstatSync(p);
  if(ls.isSymbolicLink()){keep('symlink');continue;}
  if(!ls.isFile()){keep('not a regular file');continue;}
  if(path.dirname(fs.realpathSync(p))!==real){keep('outside sessions dir');continue;}
  const fmp=parseFrontMatter(fs.readFileSync(p,'utf8'));
  if(!fmp){keep('missing/malformed front-matter');continue;}
  const created=parseTime(fmp.fm.created);
  if(created==null){keep('invalid created timestamp');continue;}
  if(created>now+FUTURE_SLACK){keep('created is in the future');continue;}
  const age=now-created;
  if(age<=MAX_AGE_DAYS*DAY){keep('younger than '+MAX_AGE_DAYS+' days');continue;}
  if(fmp.fm.durable_promoted!=='true'){keep('expired but durable_promoted is not true - promote open items to docs/STATUS.md first');continue;}
  out.delete.push({file:name,created:fmp.fm.created,ageDays:+(age/DAY).toFixed(2)});
 }
 return out;
}
function apply(p){for(const d of p.delete){const f=path.join(p.dir,d.file);if(path.dirname(f)!==p.dir)throw new Error('path escape');fs.unlinkSync(f);}return p.delete.length;}
module.exports={plan,apply,MAX_AGE_DAYS};

if(require.main===module){
 const a=process.argv.slice(2),i=a.indexOf('--now');
 const now=i>=0?Date.parse(a[i+1]):Date.now();if(!isFinite(now)){console.error('bad --now');process.exit(2);}
 const dir=path.resolve(__dirname,'..','docs','sessions');
 const p=plan(dir,now);
 if(a.includes('--json'))console.log(JSON.stringify(p,null,1));
 else{console.log(`session-note expiry (${a.includes('--apply')?'APPLY':'dry run'}) at ${p.now}`);
  for(const d of p.delete)console.log('  delete',d.file,'(age',d.ageDays,'days)');
  for(const k of p.keep)if(k.reason!=='reserved'&&!k.reason.startsWith('younger'))console.log('  keep  ',k.file,'-',k.reason);
  console.log(`  ${p.delete.length} to delete, ${p.keep.length} kept`);}
 if(a.includes('--apply'))apply(p);
}

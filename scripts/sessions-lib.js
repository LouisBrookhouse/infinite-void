/* Shared helpers for session notes (docs/sessions/). No dependencies. */
const fs=require('fs'),path=require('path');
const NOTE_RE=/^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]{0,80}\.md$/;
const RESERVED=new Set(['README.md','TEMPLATE.md']);
const ISO_RE=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/;
const REQUIRED_HEADINGS=['## Intent','## Scope','## Changes','## Validation','## Open items','## Next steps','## Links'];
function parseFrontMatter(text){
 if(!text.startsWith('---\n'))return null;
 const end=text.indexOf('\n---',4);if(end<0)return null;
 const fm={};for(const line of text.slice(4,end).split('\n')){if(!line.trim())continue;const m=line.match(/^([a-z_]+):\s*(.*)$/);if(!m)return null;fm[m[1]]=m[2].trim().replace(/^["']|["']$/g,'');}
 return {fm,body:text.slice(end+4)};
}
function parseTime(v){if(typeof v!=='string'||!ISO_RE.test(v))return null;const t=Date.parse(v);return isFinite(t)?t:null;}
module.exports={NOTE_RE,RESERVED,ISO_RE,REQUIRED_HEADINGS,parseFrontMatter,parseTime};

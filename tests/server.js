/* Tiny static server that mimics GitHub Pages: serves the repo root under /infinite-void/.
 * Usage: node tests/server.js [port]   then open http://127.0.0.1:8080/infinite-void/ */
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),PREFIX='/infinite-void/';
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.md':'text/plain; charset=utf-8'};
function start(port){
 const srv=http.createServer((req,res)=>{
  let u=decodeURIComponent(new URL(req.url,'http://x').pathname);
  if(u==='/'||u==='/infinite-void'){res.writeHead(302,{Location:PREFIX});return res.end();}
  if(!u.startsWith(PREFIX)){res.writeHead(404);return res.end('not found');}
  let rel=u.slice(PREFIX.length)||'index.html';if(rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(ROOT,rel);
  if(!f.startsWith(ROOT+path.sep)||/(^|[\\/])(\.git|node_modules)([\\/]|$)/.test(rel)){res.writeHead(403);return res.end();}
  fs.readFile(f,(err,data)=>{if(err){res.writeHead(404);return res.end('not found');}
   res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
 });
 return new Promise(r=>srv.listen(port||0,'127.0.0.1',()=>r(srv)));
}
module.exports={start,PREFIX};
if(require.main===module)start(+process.argv[2]||8080).then(s=>console.log('serving http://127.0.0.1:'+s.address().port+PREFIX));

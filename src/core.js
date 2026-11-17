/* INFINITE VOID - core namespace, shared helpers and progression gates.
 * Loaded first (classic script, no build step, works on file:// and GitHub Pages).
 * Content registries in src/content/*.js push into IV.content.*; src/game.js reads them. */
(function(){
'use strict';
const IV=window.IV={content:{changelog:[],sectors:[],skins:[],icons:{},upgrades:[],darkMatter:[],guns:[],enemies:[],bosses:[],missions:[],features:[]}};

/* ---------- number formatting ---------- */
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td'];
IV.fmt=function fmt(n){
 if(!isFinite(n))return 'INF';
 if(n<0)return '-'+fmt(-n);
 if(n<1000){if(n<10&&n%1>0.05)return (Math.floor(n*10)/10).toFixed(1);return String(Math.floor(n));}
 const e=Math.floor(Math.log10(n)/3);
 if(e<SUF.length){const v=n/Math.pow(1000,e);
  if(v<10)return (Math.floor(v*100)/100).toFixed(2)+SUF[e];
  if(v<100)return (Math.floor(v*10)/10).toFixed(1)+SUF[e];
  return Math.floor(v)+SUF[e];}
 return n.toExponential(2).replace('+','');
};

/* ---------- progression gates ----------
 * Every content entry has `unlock`: an object whose keys are ANDed together.
 *   wave:    reached wave >= n   (store items: best wave ever; spawn content: current wave)
 *   sector:  reached sector >= n (sector 1 = waves 1-10, sector 2 = 11-20, ...)
 *   warps:   completed warp jumps >= n
 *   bosses:  bosses destroyed (lifetime) >= n
 *   dmTotal: dark matter ever earned >= n
 * {wave:1} is the starter gate (always open). */
IV.GATE_KEYS=['wave','sector','warps','bosses','dmTotal'];
IV.gateValid=function(g){
 if(!g||typeof g!=='object'||Array.isArray(g))return false;
 const ks=Object.keys(g);if(!ks.length)return false;
 return ks.every(k=>IV.GATE_KEYS.includes(k)&&Number.isInteger(g[k])&&g[k]>=(k==='wave'||k==='sector'?1:0));
};
/* ctx = {wave, warps, bosses, dmTotal} */
IV.gateOpen=function(g,ctx){
 if(!g)return false;
 const w=ctx.wave||1;
 if(g.wave!=null&&w<g.wave)return false;
 if(g.sector!=null&&Math.floor((w-1)/10)+1<g.sector)return false;
 if(g.warps!=null&&(ctx.warps||0)<g.warps)return false;
 if(g.bosses!=null&&(ctx.bosses||0)<g.bosses)return false;
 if(g.dmTotal!=null&&(ctx.dmTotal||0)<g.dmTotal)return false;
 return true;
};
IV.gateText=function(g){
 const p=[];if(!g)return '?';
 if(g.wave!=null)p.push('WAVE '+g.wave);
 if(g.sector!=null)p.push('SECTOR '+g.sector);
 if(g.warps!=null)p.push(g.warps+' WARP JUMP'+(g.warps===1?'':'S'));
 if(g.bosses!=null)p.push(g.bosses+' BOSS KILL'+(g.bosses===1?'':'S'));
 if(g.dmTotal!=null)p.push(g.dmTotal+' DARK MATTER EARNED');
 return p.join(' + ');
};
/* Starter = open on a brand-new save */
IV.isStarter=function(g){return IV.gateOpen(g,{wave:1,warps:0,bosses:0,dmTotal:0});};
})();

/* SHIP UPGRADES (credits, reset on Warp Jump) and DARK MATTER upgrades (permanent).
 * Contract (upgrades): {id, name, desc, icon, base, g (cost growth), max?, req? (other upgrade id that must be >=1),
 *   unlock (gate, checked against BEST wave), show(stats, level) -> string}
 * Effects of each id are applied in calcStats() in src/game.js. A NEW upgrade needs both an entry here and
 * a line in calcStats (or a hook) - keep it small. */
(function(){const fmt=IV.fmt;
IV.content.upgrades.push(
 {id:'dmg',icon:'dmg',name:'PULSE CORE',desc:'Damage of every gun. x1.5 every 25 lv',base:10,g:1.15,unlock:{wave:1},show:s=>fmt(s.dmg)},
 {id:'hull',icon:'ship',name:'HULL PLATING',desc:'Max hull integrity',base:20,g:1.17,unlock:{wave:1},show:s=>fmt(s.maxHull)},
 {id:'click',icon:'click',name:'TARGET LASER',desc:'Damage when you tap an enemy',base:15,g:1.16,unlock:{wave:1},show:s=>fmt(s.click)},
 {id:'rate',icon:'rate',name:'RAPID CYCLER',desc:'Fire rate of every gun',base:30,g:1.32,max:30,unlock:{wave:2},show:s=>s.rate.toFixed(2)+'/s'},
 {id:'credit',icon:'credit',name:'SALVAGE BAY',desc:'Credits per kill',base:50,g:1.24,unlock:{wave:3},show:s=>'x'+fmt(s.credMult)},
 {id:'crit',icon:'crit',name:'TARGETING AI',desc:'Crit chance (x3 dmg)',base:80,g:1.38,max:30,unlock:{wave:4},show:s=>Math.round(s.crit*100)+'%'},
 {id:'regen',icon:'regen',name:'NANO REPAIR',desc:'Hull regen per second',base:60,g:1.22,max:25,unlock:{wave:5},show:s=>fmt(s.regen)+'/s'},
 {id:'multi',icon:'multi',name:'SPREAD ARRAY',desc:'+1 projectile & +50% gun damage',base:300,g:9,max:4,unlock:{wave:6},show:(s,L)=>'+'+L+' proj'},
 {id:'drone',icon:'drone',name:'ESCORT DRONES',desc:'Drones that auto-attack',base:500,g:5,max:6,unlock:{wave:8},show:s=>s.drones+' drone'+(s.drones===1?'':'s')},
 {id:'droneDmg',icon:'droneDmg',name:'DRONE AI CORE',desc:'Drone damage (+25%/lv)',base:800,g:1.2,unlock:{wave:8},req:'drone',show:s=>fmt(s.droneDmg)},
 {id:'shield',icon:'shield',name:'DEFLECTOR',desc:'Recharging energy shield',base:400,g:1.3,unlock:{wave:10},show:s=>fmt(s.shieldMax)},
 {id:'pods',icon:'pods',name:'OPTION PODS',desc:'2 trailing orbs copy the primary at 40% damage',base:1500,g:1.8,max:1,unlock:{wave:26},show:(s,L)=>L?'2 ORBS':'NONE'}
);
/* Dark Matter upgrades. Contract: {id, icon, name, desc, base, g, max?, unlock, show(level)}. Costs are whole DM per level. */
IV.content.darkMatter.push(
 {id:'over',icon:'dmg',name:'OVERCHARGE',desc:'x1.3 damage per level',base:1,g:1.6,unlock:{warps:1},show:L=>'x'+fmt(Math.pow(1.3,L))},
 {id:'salv',icon:'credit',name:'QUANTUM SALVAGE',desc:'x1.3 credits per level',base:1,g:1.6,unlock:{warps:1},show:L=>'x'+fmt(Math.pow(1.3,L))},
 {id:'nano',icon:'ship',name:'NANOHULL',desc:'x1.25 hull per level',base:1,g:1.7,unlock:{warps:1},show:L=>'x'+fmt(Math.pow(1.25,L))},
 {id:'quantum',icon:'rate',name:'CHRONO CORE',desc:'+10% fire rate per level',base:2,g:1.8,max:10,unlock:{warps:1},show:L=>'x'+Math.pow(1.1,L).toFixed(2)},
 {id:'warp',icon:'warp',name:'WARP DRIVE',desc:'Start runs 5 waves further',base:3,g:2.2,max:10,unlock:{warps:1},show:L=>'wave '+(1+5*L)},
 {id:'idle',icon:'idle',name:'AUTO-FOUNDRY',desc:'Better offline earnings',base:2,g:2,max:4,unlock:{warps:1},show:L=>Math.round((0.5+0.125*L)*100)+'%'}
);
})();

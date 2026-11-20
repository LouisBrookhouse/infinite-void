/* SECTORS: one per 10 waves (sector n = waves (n-1)*10+1 .. n*10). The list cycles after the last entry.
 * Contract: {id, name, unlock:{sector:n} (must equal its 1-based position), scheme:{X,Y} enemy colours,
 *  bg: background colour, planet:[dark,mid,light], bias:{enemyId:weightMultiplier},
 *  clouds?:{a,b,h} pixel nebula colours. Drawn only while this picture is active, so unlock is the gate.} */
IV.content.sectors.push(
 {id:'outer-rim',name:'OUTER RIM',unlock:{sector:1},scheme:{X:'#ff4d5e',Y:'#ff9f1c'},bg:'#05070f',planet:['#1b2b5a','#2a6fdb','#7fe7ff'],bias:{}},
 {id:'nebula-drift',name:'NEBULA DRIFT',unlock:{sector:2},scheme:{X:'#b14aed',Y:'#ff5ccf'},bg:'#0a0514',planet:['#3a0b33','#b14aed','#ff5ccf'],bias:{invader:2.5,diver:2}},
 {id:'verdant-belt',name:'VERDANT BELT',unlock:{sector:3},scheme:{X:'#2e8b57',Y:'#6bff8a'},bg:'#030c0a',planet:['#0d2a1c','#2e8b57','#6bff8a'],bias:{rock:2.5,guard:1.6},
  clouds:{a:'#0d2a1c',b:'#2e8b57',h:'#6bff8a'}},
 {id:'solar-forge',name:'SOLAR FORGE',unlock:{sector:4},scheme:{X:'#ff9f1c',Y:'#ffe066'},bg:'#0f0805',planet:['#3a1a05','#ff9f1c','#ffe066'],bias:{kami:2.2,sniper:2}},
 {id:'the-deep',name:'THE DEEP',unlock:{sector:5},scheme:{X:'#2a6fdb',Y:'#7fe7ff'},bg:'#04081a',planet:['#2a0b14','#ff4d5e','#ffb0b8'],bias:{cloaker:2.5,cruiser:1.5,invader:1.5}}
);

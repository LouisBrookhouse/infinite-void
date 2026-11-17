/* SHIP SKINS. Pixel rows are the LEFT HALF of the sprite (mirrored automatically).
 * Palette letters: see PAL in src/game.js. Contract: {id, name, unlock, half:[rows]}.
 * Equipped id is S.skin. Owned flags live in S.skins (1 = owned). SAVE/STATS equips owned skins.
 * Registry unlock keeps a skin off a fresh save; awards (such as a boss kill) set the owned flag. */
IV.content.skins.push(
 {id:'vanguard',name:'VANGUARD',unlock:{wave:1},
  half:[".....c","....cw","....cb","...gcb","..dgbw","..dgbb",".dgbbc","dgnbbc","dgnbbb","dgddgb","d..dgn","....dd"]},
 {id:'eidolon',name:'EIDOLON',unlock:{sector:10},
  half:[".....p","....pv","....pe","...mpe","..vmpl","..vmel",".pmeel",".pveem","pmvvmp","p..pve","....pv","....pp"]}
);

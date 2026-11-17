/* MECHANIC FEATURE FLAGS. Gate whole mechanics (not single items) behind progression.
 * Contract: {id, name, desc, unlock, announce (toast text when it first opens, optional)}.
 * Engine code checks a feature with feat('id'). Gates are checked against BEST wave / lifetime stats. */
IV.content.features.push(
 {id:'secondarySlot',name:'SECONDARY GUN SLOT',desc:'Equip a second gun at 50% fire rate',unlock:{wave:12},announce:'SECONDARY GUN SLOT UNLOCKED'}
);

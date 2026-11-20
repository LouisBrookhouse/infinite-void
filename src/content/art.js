/* House pixels. Palette, ramps, upper-left light, 4x4 Bayer.
 * See DESIGN.md, "Art style guide". Loaded before the registries and the engine. */
(function(){
 const PAL={c:'#7fe7ff',w:'#ffffff',b:'#2a6fdb',n:'#1b2b5a',g:'#8a94a6',d:'#3b4252',r:'#ff4d5e',o:'#ff9f1c',y:'#ffe066',p:'#b14aed',m:'#ff5ccf',l:'#6bff8a',e:'#2e8b57',k:'#0b0f1e',v:'#5a2a7a',f:'#c9b79c',h:'#6b5a4a'};
 const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 const RAMP={
  metal:['#1b2b5a','#3b4252','#8a94a6','#7fe7ff','#ffffff'],
  hot:['#3b4252','#ff4d5e','#ff9f1c','#ffe066','#ffffff'],
  flesh:['#0b0f1e','#5a2a7a','#ff4d5e','#ff9f1c','#ffe066'],
  bruise:['#0b0f1e','#1b2b5a','#5a2a7a','#b14aed','#ff5ccf'],
  blood:['#0b0f1e','#5a2a7a','#ff4d5e','#ff5ccf','#ffffff'],
  heat:['#0b0f1e','#ff4d5e','#ff9f1c','#ffe066','#ffffff'],
  venom:['#1b2b5a','#5a2a7a','#b14aed','#ff5ccf','#ffffff'],
  leaf:['#0b0f1e','#2e8b57','#6bff8a','#ffffff'],
  bone:['#3b4252','#6b5a4a','#c9b79c','#ffe066']
 };
 function bayer(i,j){return BAYER[(j&3)*4+(i&3)]/16;}
 function toneIndex(n,light,i,j){
  const last=n-1;
  let k=Math.round(light*last+(bayer(i,j)-0.5));
  if(k<0)k=0;if(k>last)k=last;return k;
 }
 function tone(ramp,light,i,j){return ramp[toneIndex(ramp.length,light,i,j)];}
 function litUL(nx,ny){
  const d=(-0.6*nx-0.6*ny)/0.848528137;
  const v=0.55+d*0.45;return v<0?0:v>1?1:v;
 }
 function rgb(h){const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255];}
 function disc(ctx,x,y,r,ramp){
  const ix=x|0,iy=y|0,n=ramp.length;
  if(!(r>0))return;
  if(r<=1){ctx.fillStyle=ramp[Math.min(2,n-1)];ctx.fillRect(ix,iy,1,1);return;}
  const R=Math.ceil(r),r2=r*r,rim=r-1;
  for(let j=-R;j<=R;j++)for(let i=-R;i<=R;i++){
   const d2=i*i+j*j;if(d2>r2)continue;
   const d=Math.sqrt(d2);
   let col;
   if(d>=rim)col=ramp[0];
   else{
    const inv=d>0.2?1/d:0,light=litUL(i*inv,j*inv);
    let k=light>0.78?n-1:light>0.58?n-2:light<0.32?1:2;
    if(k<1)k=1;if(k>n-1)k=n-1;col=ramp[k];
   }
   ctx.fillStyle=col;ctx.fillRect(ix+i,iy+j,1,1);
  }
 }
 function plate(ctx,x,y,w,h,ramp,frac,bar){
  const x0=x|0,y0=y|0,n=ramp.length,last=n-1;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){
   const edge=i===w-1||j===h-1;
   let light=1-(i/Math.max(1,w-1))*0.55-(j/Math.max(1,h-1))*0.62;
   if(light<0)light=0;if(light>1)light=1;
   let col=edge?ramp[0]:ramp[Math.round(light*last)];
   if(i===0&&j===0)col=ramp[last];
   ctx.fillStyle=col;ctx.fillRect(x0+i,y0+j,1,1);
  }
  if(bar&&h>=2){
   ctx.fillStyle=PAL.k;ctx.fillRect(x0,y0+h-1,w,1);
   const fw=Math.round(w*(frac<0?0:frac>1?1:frac));
   if(fw>0){ctx.fillStyle=bar;ctx.fillRect(x0,y0+h-1,fw,1);}
  }
 }
 const POD=['..c..','.gbg.','gbwbg','.gbg.','..c..'];
 function pod(ctx,x,y){
  const h=POD.length,w=5,x0=Math.round(x-(w>>1)),y0=Math.round(y-((h-1)>>1));
  for(let j=0;j<h;j++)for(let i=0;i<POD[j].length;i++){
   const ch=POD[j][i];if(!ch||ch==='.')continue;
   ctx.fillStyle=PAL[ch];ctx.fillRect(x0+i,y0+j,1,1);
  }
 }
 function spore(ctx,x,y,hot){
  ctx.fillStyle=hot?PAL.y:PAL.e;
  ctx.fillRect(x-1,y-1,3,3);
  ctx.fillRect(x,y-2,1,1);ctx.fillRect(x,y+2,1,1);ctx.fillRect(x-2,y,1,1);ctx.fillRect(x+2,y,1,1);
  ctx.fillStyle=hot?PAL.w:PAL.l;ctx.fillRect(x-1,y-1,1,1);ctx.fillRect(x,y-1,1,1);
 }
 IV.art={PAL,BAYER,RAMP,bayer,tone,toneIndex,litUL,rgb,disc,plate,pod,spore,POD};
})();

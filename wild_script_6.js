
/* process row: a double helix flowing left -> right, frayed blue chaos resolving into a clean
   yellow strand with rungs (Explore -> Generate -> Refine -> Scale). Run the cursor through it
   and the strands part around your hand, then spring back. On the page's 9px grid. */
(function(){
  var cv=document.getElementById('procflow'), ctx=cv&&cv.getContext('2d'); if(!ctx) return;
  var DPR=Math.min(devicePixelRatio||1,2), CELL=9, W=0,H=0,cols=0,rows=0, on=true;
  var COOL='#3b5bd9', YEL='#f5c518';
  function mix(a,b,t){ if(t<=0)return a; if(t>=1)return b; var ar=parseInt(a.slice(1,3),16),ag=parseInt(a.slice(3,5),16),ab=parseInt(a.slice(5,7),16),br=parseInt(b.slice(1,3),16),bg=parseInt(b.slice(3,5),16),bb=parseInt(b.slice(5,7),16); return 'rgb('+((ar+(br-ar)*t)|0)+','+((ag+(bg-ag)*t)|0)+','+((ab+(bb-ab)*t)|0)+')'; }
  function rnd(s){ var x=Math.sin(s*12.9898)*43758.5453; return x-Math.floor(x); }
  function ss(x){ x=x<0?0:x>1?1:x; return x*x*(3-2*x); }
  function prof(x){ return 0.06+0.94*Math.pow(Math.abs(2*x-1),1.2); }
  function pick(seed,x){ return rnd(seed) < ss(x) ? YEL : COOL; }
  function dep(za,rk){ return Math.max(0,Math.min(1,0.5+0.5*(za/Math.max(1,rk)))); }
  function size(){ var r=cv.getBoundingClientRect(); if(r.width<2)return; W=r.width;H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); cols=Math.ceil(W/CELL); rows=Math.ceil(H/CELL); }
  size(); if(window.ResizeObserver) new ResizeObserver(size).observe(cv);
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ on=e.isIntersecting; }); }).observe(cv); }
  /* pointer: part the strands around the cursor, ease the influence in and out */
  var pmx=0,pmy=0,pstr=0,ptgt=0;
  function moveAt(cx,cy){ var r=cv.getBoundingClientRect(); pmx=cx-r.left; pmy=cy-r.top; ptgt=(pmx>=-40&&pmx<=W+40&&pmy>=-40&&pmy<=H+40)?1:0; }
  cv.addEventListener('pointermove',function(e){ moveAt(e.clientX,e.clientY); },{passive:true});
  cv.addEventListener('pointerleave',function(){ ptgt=0; });
  /* hover a step label below: that quarter of the helix stays lit, the rest recedes */
  var ST=-1, EM=[1,1,1,1];
  function aOf(u){ if(ST<0&&EM[0]>0.995&&EM[1]>0.995&&EM[2]>0.995&&EM[3]>0.995) return 1;
    var g=u*4-0.5, q=Math.floor(g), f=ss(Math.min(1,Math.max(0,(g-q-0.35)/0.3))),
        a0=EM[Math.max(0,Math.min(3,q))], a1=EM[Math.max(0,Math.min(3,q+1))]; return a0+(a1-a0)*f; }
  var steps=document.querySelectorAll('#process .donuts .step');
  for(var si=0;si<steps.length;si++)(function(el,i){
    el.addEventListener('pointerenter',function(e){ if(e.pointerType!=='touch') ST=i; });
    el.addEventListener('pointerleave',function(){ if(ST===i) ST=-1; });
    el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect(), lw=62, x=e.clientX-r.left-lw/2; x=Math.max(0,Math.min(r.width-lw,x)); el.style.setProperty('--lx', Math.round(x/9)*9+'px'); },{passive:true});   /* the pixel line tracks the cursor, snapped to the 9px grid */
  })(steps[si],si);
  var M=400, turns=3.2, clk=0;
  function frame(){ if(!cols)return; ctx.clearRect(0,0,W,H);
    pstr += (ptgt-pstr)*0.09; var RAD=H*0.55, AMP=H*0.42, repel=pstr>0.01;
    for(var e2=0;e2<4;e2++){ var tg=(ST<0||ST===e2)?1:0.16; EM[e2]+=(tg-EM[e2])*0.07; }
    var cy=H/2, R=H*0.42, items=[], s,i,uu,w;
    function push(it){ /* part the strands away from the cursor */
      if(repel){ var dx=it.sx-pmx, dy=it.sy-pmy, dist=Math.sqrt(dx*dx+dy*dy)+0.001; if(dist<RAD){ var f=(1-dist/RAD); f=f*f*pstr; it.sx+=dx/dist*f*AMP; it.sy+=dy/dist*f*AMP; } }
      items.push({c:(it.sx/CELL)|0,r:(it.sy/CELL)|0,d:it.d,col:it.col,a:it.a}); }
    /* two strands: frayed blue at the mouth tightening into a clean yellow helix */
    for(s=0;s<2;s++){ var ph0=s*Math.PI;
      for(i=0;i<M;i++){ var u=((i/M)+clk*0.0013)%1, rk=R*prof(u), chaos=Math.pow(1-u,1.05),
        ang=u*turns*6.2832+ph0+(rnd(i*3.1+s*40)-0.5)*2.9*chaos, jr=rk*(1+(rnd(i*7.7+s*9)-0.5)*1.9*chaos),
        za=Math.cos(ang)*jr, ya=Math.sin(ang)*jr, depth=dep(za,rk);
        push({sx:u*W+za*0.34, sy:cy+ya*0.92, d:depth, col:mix('#ffffff',pick(i*2.3+s*70,u),0.3+0.65*depth), a:aOf(u)}); } }
    /* rungs that knit the two clean strands together on the resolved (right) half */
    for(uu=0;uu<1;uu+=0.04){ var u2=(uu+clk*0.0013)%1; if(u2<0.5)continue; var rk2=R*prof(u2), ang2=u2*turns*6.2832; for(w=0;w<=1.001;w+=0.12){ var f2=1-2*w, za2=Math.cos(ang2)*rk2*f2, ya2=Math.sin(ang2)*rk2*f2, depth2=dep(za2,rk2); push({sx:u2*W+za2*0.34, sy:cy+ya2*0.92, d:depth2-0.01, col:mix('#ffffff',YEL,0.3+0.5*depth2), a:aOf(u2)}); } }
    items.sort(function(a,b){return a.d-b.d;});
    for(i=0;i<items.length;i++){ var it=items[i]; if(it.r<0||it.r>=rows||it.c<0||it.c>=cols)continue; ctx.globalAlpha=it.a==null?1:it.a; ctx.fillStyle=it.col; ctx.fillRect(it.c*CELL,it.r*CELL,CELL-1,CELL-1); } ctx.globalAlpha=1; }
  (function loop(){ if(on){ clk++; frame(); } requestAnimationFrame(loop); })();
})();

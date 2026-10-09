
/* Brand Context Protocol: one continuous "constellation" flow across all four stages.
   Truth (navy) + Skills (blue) are born as loose clouds, flow into a big randomised output (yellow),
   then at the Brand Check nearly all rise + turn green (pass); a very few drop + turn red (fail). */
(function(){
  var cv=document.getElementById('bcp-flowviz'); if(!cv) return;
  var ctx=cv.getContext('2d'), DPR=Math.min(devicePixelRatio||1,2), PX=8;
  var HEAT=['#1c2541','#3b5bd9','#f5c518','#e0492a'], NEON='#d8ff00';
  function ss(t){ t=t<0?0:t>1?1:t; return t*t*(3-2*t); }
  function hash(n){ var s=Math.sin(n*12.9898)*43758.5453; return s-Math.floor(s); }
  var HX={}; function hx(h){ if(HX[h])return HX[h]; var v; if(h.charAt(0)==='#'){ v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; } else { var m=h.match(/\d+/g); v=[+m[0],+m[1],+m[2]]; } return HX[h]=v; }
  function mix(a,b,t){ var A=hx(a),B=hx(b); return 'rgb('+((A[0]+(B[0]-A[0])*t)|0)+','+((A[1]+(B[1]-A[1])*t)|0)+','+((A[2]+(B[2]-A[2])*t)|0)+')'; }
  function pxf(u,isSk){ var startX=isSk?0.28:0.0; return startX+u*(1-startX); }
  function flowPos(u,s,W,H,t){ var cy=H/2, isSk=hash(s*5.5)<0.5, px=pxf(u,isSk), x=px*W;
    var mg=1-ss(Math.min(1,(px-0.02)/0.55));
    var r=H*0.30*(0.28+0.72*mg)+H*0.05;
    var chaos=Math.pow(Math.max(0,1-px/0.5),1.2);
    var a=px*0.85*6.2832+(isSk?3.14159:0)+(hash(s*3.1)-0.5)*3.0*chaos+Math.sin(t*0.0016+s*30)*chaos*1.1;
    var jr=r*(1+(hash(s*7.7)-0.5)*1.8*chaos);
    var env=1-0.22*ss((px-0.50)/0.16);
    var oz=ss((px-0.50)/0.14)*(1-ss((px-0.80)/0.08));
    var z=Math.cos(a)*jr;
    var y=cy+(Math.sin(a)*jr+(isSk?1:-1)*H*0.16*mg)*env - H*0.09*ss((px-0.40)/0.30);
    x+=z*0.30*env;
    var jt=t*0.0022; x+=Math.sin(jt+s*40+px*7)*W*0.007+Math.sin(jt*0.5+s*13)*W*0.005; y+=(Math.cos(jt*1.1+s*27+px*5)*H*0.055+Math.sin(jt*0.7+s*51)*H*0.04)*env;
    y+=(Math.sin(t*0.0025+s*44)+(hash(s*61)-0.5)*1.8)*H*0.11*oz;
    if(px>0.74){ var tl=(px-0.74)/0.26, pass=hash(s*9.1)<0.96; y+=(pass?-1:1)*ss(tl)*H*0.42; }
    return [x,y,0.5+0.5*(z/(jr+0.001))]; }
  function cu(u,s){ var isSk=hash(s*5.5)<0.5, px=pxf(u,isSk);
    if(px<0.58) return isSk?HEAT[1]:HEAT[0];
    if(px<0.74) return HEAT[2];
    var tl=(px-0.74)/0.26; return mix(HEAT[2], hash(s*9.1)<0.96?NEON:HEAT[3], ss(Math.min(1,tl*1.4))); }
  function px(x,y,col,a){ ctx.globalAlpha=a==null?1:a; ctx.fillStyle=col; ctx.fillRect(Math.round(x/PX)*PX, Math.round(y/PX)*PX, PX-1, PX-1); }
  /* hover a step label below: that stage's cloud stays lit, the rest recede */
  function stageOf(u,s){ var isSk=hash(s*5.5)<0.5, px=pxf(u,isSk); if(px>0.74) return 3; if(px>=0.58) return 2; return isSk?1:0; }
  var ST=-1, EM=[1,1,1,1];
  var steps=document.querySelectorAll('#protocol-parts .donuts .step');
  for(var si=0;si<steps.length;si++)(function(el,i){
    el.addEventListener('pointerenter',function(e){ if(e.pointerType!=='touch') ST=i; });
    el.addEventListener('pointerleave',function(){ if(ST===i) ST=-1; });
    el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect(), lw=62, x=e.clientX-r.left-lw/2; x=Math.max(0,Math.min(r.width-lw,x)); el.style.setProperty('--lx', Math.round(x/9)*9+'px'); },{passive:true});   /* the pixel line tracks the cursor, snapped to the 9px grid */
  })(steps[si],si);
  var W=0,H=0,P=null,t=Math.random()*4000,on=true,pmx=0,pmy=0,pstr=0,ptgt=0;
  function ensure(){ if(!P){ P=[]; for(var i=0;i<4400;i++) P.push({u0:hash(i*3.3+7), s:hash(i*1.7+3), sp:0.55+hash(i*5.1+2)*0.9}); } }
  function size(){ var r=cv.getBoundingClientRect(); if(r.width<2)return; W=r.width;H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
  if(window.ResizeObserver) new ResizeObserver(size).observe(cv);
  cv.addEventListener('pointermove',function(e){ var r=cv.getBoundingClientRect(); pmx=e.clientX-r.left; pmy=e.clientY-r.top; ptgt=(pmx>=-40&&pmx<=W+40&&pmy>=-40&&pmy<=H+40)?1:0; },{passive:true});   /* same cursor-parting as the process flow, half-size brush */
  cv.addEventListener('pointerleave',function(){ ptgt=0; });
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ on=e.isIntersecting; }); }).observe(cv); }
  function rep(p){ if(pstr<0.01) return p; var R=Math.min(W,H)*0.35, dx=p[0]-pmx, dy=p[1]-pmy, d=Math.sqrt(dx*dx+dy*dy)+0.001; if(d>=R) return p; var f=(1-d/R); f=f*f*pstr; var m=Math.min(W,H)*0.3; return [p[0]+dx/d*f*m, p[1]+dy/d*f*m, p[2]]; }
  function draw(){ ensure(); ctx.clearRect(0,0,W,H); pstr+=(ptgt-pstr)*0.09;
    for(var e=0;e<4;e++){ var tgt=(ST<0||ST===e)?1:0.16; EM[e]+=(tgt-EM[e])*0.07; }
    var pts=[]; for(var i=0;i<P.length;i++){ var Q=P[i], u=(Q.u0+t*0.00006*(Q.sp||1))%1, p=rep(flowPos(u,Q.s,W,H,t)); pts.push([p[0],p[1],p[2],cu(u,Q.s),EM[stageOf(u,Q.s)]]); }
    pts.sort(function(a,b){ return a[2]-b[2]; });
    ctx.globalAlpha=0.13; ctx.strokeStyle='#cfcfcf'; ctx.lineWidth=1; var LK=(PX*6)*(PX*6);
    for(var j=0;j<pts.length;j+=2){ for(var k=j+1;k<Math.min(pts.length,j+6);k++){ var dx=pts[j][0]-pts[k][0],dy=pts[j][1]-pts[k][1]; if(dx*dx+dy*dy<LK){ ctx.beginPath(); ctx.moveTo(pts[j][0],pts[j][1]); ctx.lineTo(pts[k][0],pts[k][1]); ctx.stroke(); } } }
    for(var m2=0;m2<pts.length;m2++) px(pts[m2][0],pts[m2][1],pts[m2][3],pts[m2][4]); ctx.globalAlpha=1; }
  var last=0; function loop(ts){ var dt=Math.min(40,ts-last); last=ts; if(!W){ size(); } else if(on){ t+=dt; draw(); } requestAnimationFrame(loop); }
  size(); if(W){ draw(); }   /* paint one frame immediately so it's there the moment it scrolls in */
  requestAnimationFrame(loop);
})();

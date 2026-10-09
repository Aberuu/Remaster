
/* ===== generative visualisations: process stages + brand-context-protocol parts ===== */
(function(){
  var HEAT=['#1c2541','#3b5bd9','#f5c518','#e0492a'], GREY=['#e4e4e4','#c8c8c8','#a6a6a6','#727272'], NEON='#d8ff00', DPR=Math.min(devicePixelRatio||1,2), PX=6;
  var ORDER={explore:0,generate:1,refine:2,scale:3};
  function mix(a,b,t){ var ar=parseInt(a.slice(1,3),16),ag=parseInt(a.slice(3,5),16),ab=parseInt(a.slice(5,7),16),br=parseInt(b.slice(1,3),16),bg=parseInt(b.slice(3,5),16),bb=parseInt(b.slice(5,7),16); return 'rgb('+((ar+(br-ar)*t)|0)+','+((ag+(bg-ag)*t)|0)+','+((ab+(bb-ab)*t)|0)+')'; }
  function rnd(s){ var x=Math.sin(s*12.9898)*43758.5453; return x-Math.floor(x); }
  var items=[];
  document.querySelectorAll('canvas[data-viz]').forEach(function(cv){
    var host=cv.closest('.donut')||cv.closest('.slide')||cv.parentElement;
    var o={cv:cv,ctx:cv.getContext('2d'),kind:cv.getAttribute('data-viz'),host:host,w:0,h:0,t:Math.random()*1000,on:true,hov:false,st:null,pmx:0,pmy:0,pin:false,pstr:0};
    function size(){ var r=cv.getBoundingClientRect(); if(r.width<2)return; o.w=r.width;o.h=r.height; cv.width=Math.round(r.width*DPR); cv.height=Math.round(r.height*DPR); o.ctx.setTransform(DPR,0,0,DPR,0,0); o.st=null; }
    o.size=size; new ResizeObserver(size).observe(cv);
    /* protocol parts: track the cursor so the diamonds react to it */
    if(/^(truth|skills|output|check)$/.test(o.kind)){
      cv.addEventListener('pointermove',function(e){ var r=cv.getBoundingClientRect(); o.pmx=e.clientX-r.left; o.pmy=e.clientY-r.top; o.pin=true; o.hov=true; },{passive:true});
      cv.addEventListener('pointerleave',function(){ o.pin=false; o.hov=false; });
    }
    items.push(o);
  });
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ items.forEach(function(o){ if(o.host===e.target)o.on=e.isIntersecting; }); }); },{threshold:0.02});
  items.forEach(function(o){ if(o.host) io.observe(o.host); });
  function bg(o){ o.ctx.clearRect(0,0,o.w,o.h); if(/^(explore|generate|refine|scale|truth|skills|output|check)$/.test(o.kind)) return;   /* process + protocol visuals stay transparent so the page grid shows through */ o.ctx.fillStyle='#fff'; o.ctx.fillRect(0,0,o.w,o.h); }
  function grid(o){ if(/^(explore|generate|refine|scale|truth|skills|output|check)$/.test(o.kind)) return;   /* no background grid on the process + protocol visuals */
    var c=o.ctx; c.strokeStyle='#fafafa'; c.lineWidth=1; c.beginPath(); for(var x=0;x<=o.w;x+=14){c.moveTo(x+.5,0);c.lineTo(x+.5,o.h);} for(var y=0;y<=o.h;y+=14){c.moveTo(0,y+.5);c.lineTo(o.w,y+.5);} c.stroke(); }
  function px(c,x,y,col,a){ c.globalAlpha=(a==null?1:a); c.fillStyle=col; c.fillRect(Math.round(x/PX)*PX, Math.round(y/PX)*PX, PX-1, PX-1); }
  function explore(o){ var c=o.ctx,N=30,sp=o.hov?2.0:0.95; if(!o.st){ o.st=[]; for(var i=0;i<N;i++)o.st.push({x:rnd(i+1)*o.w,y:rnd(i+7)*o.h,a:rnd(i+3)*6.28,col:HEAT[i%4]}); }
    bg(o); grid(o);
    for(var i=0;i<o.st.length;i++){ var d=o.st[i]; d.a+=(rnd(i+((o.t*0.002)|0))-0.5)*0.6; d.x+=Math.cos(d.a)*sp; d.y+=Math.sin(d.a)*sp;
      if(d.x<6){d.x=6;d.a=Math.PI-d.a;} if(d.x>o.w-6){d.x=o.w-6;d.a=Math.PI-d.a;} if(d.y<6){d.y=6;d.a=-d.a;} if(d.y>o.h-6){d.y=o.h-6;d.a=-d.a;}
      px(c,d.x,d.y,d.col,1); } c.globalAlpha=1; }
  function generate(o){ var c=o.ctx,cell=PX,cols=Math.ceil(o.w/cell),nr=Math.ceil(o.h/cell)+1; bg(o); grid(o); var tt=o.t*(o.hov?0.011:0.0055);
    for(var cx=0;cx<cols;cx++){ if(rnd(cx+3)>0.45) continue;
      var speed=0.45+rnd(cx+1)*0.8, off=(tt*speed)%1, hot=rnd(cx*5)>0.72;
      for(var y=0;y<nr;y++){ if(rnd(cx*7+y)>0.45) continue;
        var yy=(y+off*nr)%nr, py=yy*cell, a=1-yy/nr;
        c.globalAlpha=0.5*a; c.fillStyle=(hot&&rnd(cx+y*3)>0.55)?HEAT[(rnd(cx)*4)|0]:'#1c2541'; c.fillRect(cx*cell,py,cell-1,cell-1); } }
    c.globalAlpha=1; }
  function refine(o){ var c=o.ctx,N=120; if(!o.st){ o.st=[]; for(var i=0;i<N;i++)o.st.push({a:i/N*6.28, nx:rnd(i+1), ny:rnd(i+5)}); }
    bg(o); grid(o); var cyc=Math.sin(o.t*0.001*(o.hov?1.6:0.7))*0.5+0.5, cx=o.w/2,cy=o.h/2,R=Math.min(o.w,o.h)*0.32;
    for(var i=0;i<o.st.length;i++){ var d=o.st[i], tx=cx+Math.cos(d.a)*R, ty=cy+Math.sin(d.a)*R, nx=cx+(d.nx-0.5)*o.w*0.92, ny=cy+(d.ny-0.5)*o.h*0.92;
      var x=nx+(tx-nx)*cyc, y=ny+(ty-ny)*cyc; px(c,x,y, cyc>0.82?'#1c2541':HEAT[i%4], 0.3+cyc*0.7); } c.globalAlpha=1; }
  function scale(o){ var c=o.ctx,cell=PX*2,cols=Math.ceil(o.w/cell),rows=Math.ceil(o.h/cell); bg(o); grid(o);
    var wave=(o.t*0.001*(o.hov?1.3:0.6))%2.6, cx=o.w/2,cy=o.h/2,maxd=Math.hypot(cx,cy);
    for(var r=0;r<rows;r++)for(var cc=0;cc<cols;cc++){ var x=cc*cell+cell/2,y=r*cell+cell/2,dd=Math.hypot(x-cx,y-cy)/maxd, act=Math.max(0,1-Math.abs(dd*2.2-wave)*3);
      if(act<0.05){ px(c,x,y,'#1c2541',0.1); continue; }
      var col=act>0.6?HEAT[3]:act>0.38?HEAT[2]:act>0.18?HEAT[1]:HEAT[0]; px(c,x,y,col,0.3+act*0.7); } c.globalAlpha=1; }
  /* the four protocol parts as one diamond-tessellation language, drawn at the page's 9px grid size,
     snapped to the canvas-local grid so it stays rock-steady while scrolling, with cursor interaction:
     diamonds swell, light toward neon, and get pushed away under the pointer */
  var C9=9;
  function px9(o,x,y,col,a){ var c=o.ctx; c.globalAlpha=(a==null?1:a); c.fillStyle=col; c.fillRect(Math.round(x/C9)*C9, Math.round(y/C9)*C9, C9-1, C9-1); }
  function diam(o,cx,cy,r,col,a){ var n=Math.round(r/C9),i,j; for(i=-n;i<=n;i++)for(j=-n;j<=n;j++){ if(Math.abs(i)+Math.abs(j)<=n) px9(o,cx+i*C9,cy+j*C9,col,a); } }
  function hb(o,x,y){ if(o.pstr<=0.001)return 0; var dx=x-o.pmx,dy=y-o.pmy,R=Math.min(o.w,o.h)*0.42,d=Math.sqrt(dx*dx+dy*dy); if(d>=R)return 0; var b=1-d/R; return b*b*o.pstr; }
  function rep(o,cx,cy,b){ if(b<=0)return null; var dx=cx-o.pmx,dy=cy-o.pmy,d=Math.sqrt(dx*dx+dy*dy)||1,R=Math.min(o.w,o.h)*0.42,push=b*Math.min(o.w,o.h)*0.30*Math.min(1,d/(R*0.4)); return [cx+dx/d*push, cy+dy/d*push]; }
  function dDiam(o,cx,cy,r,col,a){ var b=hb(o,cx,cy),p=rep(o,cx,cy,b); diam(o,p?p[0]:cx,p?p[1]:cy, r*(1+b*0.3), b>0.02?mix(col,NEON,Math.min(1,b)):col, a==null?1:a); }
  function tessViz(o){ var c=o.ctx; bg(o); grid(o); o.pstr+=((o.pin?1:0)-o.pstr)*0.14; var tt=o.t*0.001,cx=o.w/2,cy=o.h/2,m=Math.min(o.w,o.h),k=o.kind,i,x,y;
    if(k==='truth'){ var RD=Math.max(C9*2,(m*0.32)|0),n=Math.round(RD/C9),inner=Math.round(n*0.42),wave=(1-((o.t*0.0005)%1))*(n+2)-1,j;
      for(i=-n;i<=n;i++)for(j=-n;j<=n;j++){ var d=Math.abs(i)+Math.abs(j); if(d>n)continue; var base=d<=inner?HEAT[3]:HEAT[2],pulse=Math.max(0,1-Math.abs(d-wave)/1.6),col=pulse>0.04?mix(base,'#ffffff',pulse*0.6):base,cxp=cx+i*C9,cyp=cy+j*C9,bb=hb(o,cxp,cyp),pp=rep(o,cxp,cyp,bb); if(bb>0.02)col=mix(col,NEON,Math.min(1,bb)); px9(o,pp?pp[0]:cxp,pp?pp[1]:cyp,col,1); } }
    else if(k==='skills'){ var RD2=Math.max(C9*2,(m*0.19)|0),step=RD2+C9*2,offs=[[0,0],[1,0],[0,1],[-1,0],[0,-1]],gr=ss3((o.t%3200)/3200),n=1+Math.floor(gr*4); for(i=0;i<n;i++) dDiam(o,cx+offs[i][0]*step,cy+offs[i][1]*step,(RD2*0.7)|0,i?HEAT[1]:HEAT[2],1); }
    else if(k==='output'){ var rd=Math.max(C9,(m*0.11)|0),st=rd+C9,reveal=ss3((o.t%4000)/4000); for(x=-st;x<o.w+st;x+=st)for(y=-st;y<o.h+st;y+=st){ var dd=Math.hypot(x-cx,y-cy)/m; if(dd>reveal*1.4)continue; dDiam(o,x,y,rd, dd<0.18?HEAT[3]:dd<0.4?HEAT[2]:HEAT[1],0.95); } }
    else { var rd2=Math.max(C9,(m*0.16)|0),st2=rd2+C9*2,sweep=((tt*0.4)%1.3)*o.w; for(x=st2*0.5;x<o.w;x+=st2)for(y=st2*0.5;y<o.h;y+=st2){ var lit=Math.abs(x-sweep)<st2*0.6,b=hb(o,x,y),pp=rep(o,x,y,b),base=lit?NEON:(x<sweep?HEAT[2]:'#dcdcdc'),col=b>0.02?mix(base,NEON,Math.min(1,b)):base; diam(o,pp?pp[0]:x,pp?pp[1]:y, rd2*0.8*(1+b*0.3), col, lit?1:(x<sweep?0.9:0.55)); } }
    c.globalAlpha=1; }
  /* --- 3D story engine (ported from the keyvisual lab); these viz stay transparent so the page grid shows behind --- */
  var SH3={};
  function gCube(M){ var pts=[],defs=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]]; for(var f=0;f<6;f++){ var d=defs[f],a=d[0],b=d[1],c2=d[2],sg=d[3]; for(var i=0;i<M;i++)for(var j=0;j<M;j++){ var P=[0,0,0],N=[0,0,0]; P[a]=i/(M-1)*2-1; P[b]=j/(M-1)*2-1; P[c2]=sg; N[c2]=sg; pts.push([P[0]*0.82,P[1]*0.82,P[2]*0.82,N[0],N[1],N[2]]); } } return pts; }
  function gTorus(){ var pts=[],R=0.7,r=0.32,NU=80,NV=30; for(var i=0;i<NU;i++)for(var j=0;j<NV;j++){ var u=i/NU*6.2832,v=j/NV*6.2832,cu=Math.cos(u),su=Math.sin(u),cv=Math.cos(v),sv=Math.sin(v); pts.push([(R+r*cv)*cu,(R+r*cv)*su,r*sv, cv*cu,cv*su,sv]); } return pts; }
  function gSphere(N){ var pts=[],off=2/N,inc=Math.PI*(3-Math.sqrt(5)); for(var i=0;i<N;i++){ var y=i*off-1+off/2, rr=Math.sqrt(Math.max(0,1-y*y)), phi=i*inc, x=Math.cos(phi)*rr, z=Math.sin(phi)*rr; pts.push([x,y,z,x,y,z]); } return pts; }
  function gCloud(N){ var pts=[]; for(var i=0;i<N;i++){ var a=rnd(i*1.3)*6.2832, b=Math.acos(2*rnd(i*2.7)-1), rr=0.5+rnd(i*0.7)*0.6, x=Math.sin(b)*Math.cos(a)*rr, y=Math.cos(b)*rr, z=Math.sin(b)*Math.sin(a)*rr; pts.push([x,y,z,x,y,z]); } return pts; }
  function faceSample(V,F,D,sc){ var pts=[]; for(var f=0;f<F.length;f++){ var a=V[F[f][0]],b=V[F[f][1]],c=V[F[f][2]], nx=a[0]+b[0]+c[0],ny=a[1]+b[1]+c[1],nz=a[2]+b[2]+c[2],nl=Math.hypot(nx,ny,nz)||1; nx/=nl;ny/=nl;nz/=nl; for(var i=0;i<=D;i++)for(var j=0;j<=D-i;j++){ var u=i/D,v=j/D,w=1-u-v; pts.push([(a[0]*u+b[0]*v+c[0]*w)*sc,(a[1]*u+b[1]*v+c[1]*w)*sc,(a[2]*u+b[2]*v+c[2]*w)*sc,nx,ny,nz]); } } return pts; }
  function gIcosa(D){ var p=(1+Math.sqrt(5))/2, nl=Math.hypot(1,p,0), V=[[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]].map(function(q){return [q[0]/nl,q[1]/nl,q[2]/nl];}), F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]; return faceSample(V,F,D,0.96); }
  function shp3(kind){ if(SH3[kind])return SH3[kind]; var pts=kind==='icosa'?gIcosa(9):kind==='torus'?gTorus():kind==='sphere'?gSphere(1300):kind==='cloud'?gCloud(900):gCube(18);
    var scat=pts.map(function(_,i){ var a=rnd(i*5.1)*6.2832, b=Math.acos(2*rnd(i*7.3)-1), rr=1.5+rnd(i*3.9)*0.7; return [Math.sin(b)*Math.cos(a)*rr, Math.cos(b)*rr, Math.sin(b)*Math.sin(a)*rr]; });
    SH3[kind]={pts:pts,scat:scat}; return SH3[kind]; }
  function ss3(x){ x=x<0?0:x>1?1:x; return x*x*(3-2*x); }
  function paint3(o,pts,ax,ay){ var c=o.ctx; bg(o); grid(o); var cc0=(o.col==null)?(o.active?1:0):o.col, PAL=[mix(GREY[0],HEAT[0],cc0),mix(GREY[1],HEAT[1],cc0),mix(GREY[2],HEAT[2],cc0),mix(GREY[3],HEAT[3],cc0)], NE=mix(GREY[3],NEON,cc0);
    var ca=Math.cos(ax),sa=Math.sin(ax),cb=Math.cos(ay),sb=Math.sin(ay), scale=Math.min(o.w,o.h)*0.44, cx=o.w/2, cy=o.h/2, f=3.2, lx=0.4,ly=-0.5,lz=0.76;
    var cols=Math.ceil(o.w/PX), rows=Math.ceil(o.h/PX); if(!o._g||o._g.length!==cols*rows)o._g=new Float32Array(cols*rows); var G=o._g; for(var gi=0;gi<G.length;gi++)G[gi]=0;
    for(var p=0;p<pts.length;p++){ var Q=pts[p], x=Q[0],y=Q[1],z=Q[2];
      var y1=y*ca-z*sa, z1=y*sa+z*ca, x2=x*cb+z1*sb, z2=-x*sb+z1*cb;
      var nx=Q[3],ny=Q[4],nz=Q[5], ny1=ny*ca-nz*sa, nz1=ny*sa+nz*ca, nx2=nx*cb+nz1*sb, nz2=-nx*sb+nz1*cb;
      if(nz2<-0.12)continue; var per=f/(f-z2), sx=cx+x2*scale*per, sy=cy+y1*scale*per, cc=(sx/PX)|0, rr=(sy/PX)|0;
      if(cc<0||rr<0||cc>=cols||rr>=rows)continue; var sh=0.5+0.5*(nx2*lx+ny1*ly+nz2*lz), val=sh*0.7+((z2+1)/2)*0.4, id=rr*cols+cc; if(val>G[id])G[id]=val; }
    for(var r2=0;r2<rows;r2++)for(var c3=0;c3<cols;c3++){ var v=G[r2*cols+c3]; if(v<0.18)continue; var col=PAL[0]; if(v>=0.40)col=PAL[1]; if(v>=0.62)col=PAL[2]; if(v>=0.82)col=PAL[3]; if(v>=0.96)col=NE; c.fillStyle=col; c.fillRect(c3*PX,r2*PX,PX-1,PX-1); } }
  function b_solid(o,k){ var S=shp3(k),tt=o.t*0.001; paint3(o,S.pts,0.6+Math.sin(tt*0.2)*0.12, tt*(o.hov?0.55:0.3)); }
  function b_assemble(o,k){ var S=shp3(k),tt=o.t*0.001,ph=(o.t%4200)/4200,a=ph<0.55?ss3(ph/0.55):1-ss3((ph-0.55)/0.45),P=S.pts,Sc=S.scat,n=P.length,out=new Array(n);
    for(var i=0;i<n;i++){ var p=P[i],s=Sc[i]; out[i]=[s[0]+(p[0]-s[0])*a, s[1]+(p[1]-s[1])*a, s[2]+(p[2]-s[2])*a, p[3],p[4],p[5]]; } paint3(o,out,0.6, tt*0.3); }
  function b_refine(o,k){ var S=shp3(k),tt=o.t*0.001,ph=(o.t%3600)/3600,nzz=(1-ss3(ph))*0.85,seed=(o.t/380|0),P=S.pts,n=P.length,out=new Array(n);
    for(var i=0;i<n;i++){ var p=P[i]; out[i]=[p[0]+(rnd(i*1.1+seed)-0.5)*nzz, p[1]+(rnd(i*2.2+seed)-0.5)*nzz, p[2]+(rnd(i*3.3+seed)-0.5)*nzz, p[3],p[4],p[5]]; } paint3(o,out,0.6, tt*0.3); }
  function b_cloud(o){ var S=shp3('cloud'),tt=o.t*0.001,P=S.pts,n=P.length,out=new Array(n);
    for(var i=0;i<n;i++){ var p=P[i],d=tt+i*0.7; out[i]=[p[0]+Math.sin(d*0.7)*0.13, p[1]+Math.cos(d*0.6)*0.13, p[2]+Math.sin(d*0.5+1)*0.13, p[3],p[4],p[5]]; } paint3(o,out,0.6, tt*0.22); }
  function b_replicate(o){ var S=shp3('cube'),tt=o.t*0.001,ph=(o.t%4200)/4200,n=1+Math.floor(ss3(ph)*7),offs=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]],P=S.pts,out=[];
    for(var g=0;g<n;g++){ var oo=offs[g],ox=(oo[0]-0.5)*1.5,oy=(oo[1]-0.5)*1.5,oz=(oo[2]-0.5)*1.5; for(var i=0;i<P.length;i++){ var p=P[i]; out.push([p[0]*0.4+ox, p[1]*0.4+oy, p[2]*0.4+oz, p[3],p[4],p[5]]); } } paint3(o,out,0.6, tt*0.3); }
  /* one transforming visual read across the four stages: random -> sphere -> octahedron -> many octahedra (shared index-aligned point sets) */
  var MORPH=null;
  function morphSets(){ if(MORPH)return MORPH; var N=2000,R=[],C=[],O=[],OF=[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]],nlo=Math.sqrt(3),CF=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];
    for(var i=0;i<N;i++){ var ra=rnd(i*1.1)*6.2832,rb=Math.acos(2*rnd(i*2.3)-1),rr=Math.cbrt(rnd(i*3.7)); var rx=Math.sin(rb)*Math.cos(ra)*rr,ry=Math.cos(rb)*rr,rz=Math.sin(rb)*Math.sin(ra)*rr,rl=Math.hypot(rx,ry,rz)||1; R.push([rx,ry,rz,rx/rl,ry/rl,rz/rl]);
      var d=CF[i%6],Pp=[0,0,0],Nn=[0,0,0]; Pp[d[0]]=rnd(i*5.9)*2-1; Pp[d[1]]=rnd(i*8.1)*2-1; Pp[d[2]]=d[3]; Nn[d[2]]=d[3]; C.push([Pp[0]*0.82,Pp[1]*0.82,Pp[2]*0.82,Nn[0],Nn[1],Nn[2]]);
      var s=OF[i%8],u=rnd(i*9.3),v=rnd(i*11.7); if(u+v>1){u=1-u;v=1-v;} var w=1-u-v; O.push([s[0]*u*0.98,s[1]*v*0.98,s[2]*w*0.98, s[0]/nlo,s[1]/nlo,s[2]/nlo]); }
    MORPH={R:R,C:C,O:O}; return MORPH; }
  function morphLerp(o,A,B,a,ay){ var n=A.length,out=new Array(n); for(var i=0;i<n;i++){ var p=A[i],q=B[i]; out[i]=[p[0]+(q[0]-p[0])*a,p[1]+(q[1]-p[1])*a,p[2]+(q[2]-p[2])*a,p[3]+(q[3]-p[3])*a,p[4]+(q[4]-p[4])*a,p[5]+(q[5]-p[5])*a]; } paint3(o,out,0.6,ay); }
  function mExplore(o){ var M=morphSets(),tt=o.t*0.001,R=M.R,n=R.length,out=new Array(n); for(var i=0;i<n;i++){ var p=R[i],dd=tt+i*0.7; out[i]=[p[0]+Math.sin(dd*0.7)*0.05,p[1]+Math.cos(dd*0.6)*0.05,p[2]+Math.sin(dd*0.5)*0.05,p[3],p[4],p[5]]; } paint3(o,out,0.6,tt*0.22); }
  function mGenerate(o){ var M=morphSets(),tt=o.t*0.001; morphLerp(o,M.R,M.C, ss3(o.prog||0), tt*0.3); }   /* random -> square (cube), one way */
  function mRefine(o){ var M=morphSets(),tt=o.t*0.001; morphLerp(o,M.C,M.O, ss3(o.prog||0), tt*0.3); }      /* square -> octahedron, one way */
  function gOctaS(D){ var S=[[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]],pts=[],nl=Math.sqrt(3); for(var f=0;f<8;f++){ var s=S[f],nx=s[0]/nl,ny=s[1]/nl,nz=s[2]/nl; for(var i=0;i<=D;i++)for(var j=0;j<=D-i;j++){ var u=i/D,v=j/D,w=1-u-v; pts.push([s[0]*u,s[1]*v,s[2]*w,nx,ny,nz]); } } return pts; }
  var OCTAS=null, SCPOS=(function(){ var a=[]; for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++) a.push([x*0.5,y*0.5,z*0.5,x*x+y*y+z*z]); a.sort(function(p,q){return p[3]-q[3];}); return a; })();
  function mScale(o){ if(!OCTAS)OCTAS=gOctaS(3); var tt=o.t*0.001,n=1+Math.round(ss3(o.prog||0)*19),out=[];   /* 1 -> 20 octahedra, one way */
    for(var g=0;g<n;g++){ var pos=SCPOS[g]; for(var i=0;i<OCTAS.length;i++){ var p=OCTAS[i]; out.push([p[0]*0.22+pos[0],p[1]*0.22+pos[1],p[2]*0.22+pos[2],p[3],p[4],p[5]]); } } paint3(o,out,0.6,tt*0.3); }
  var REND={explore:explore, generate:generate, refine:refine, scale:scale, truth:tessViz, skills:tessViz, output:tessViz, check:tessViz};   /* protocol parts = diamond tessellation */
  var last=0, DWELL=1700, DUR=450;
  function loop(ts){ var dt=ts-last; last=ts; ts=ts||0; var act=Math.floor(ts/DWELL)%4;   /* spotlight cycles; each stage plays its transition once when first lit, then holds */
    for(var i=0;i<items.length;i++){ var o=items[i]; if(!o.w){o.size();continue;} if(!o.on)continue;
      o.active=(ORDER[o.kind]===undefined)||(ORDER[o.kind]===act);
      if(o.col==null)o.col=o.active?1:0; o.col+=((o.active?1:0)-o.col)*0.09;   /* smooth grey<->colour */
      if(o.active&&o.act0==null)o.act0=ts; o.prog=(o.act0==null)?0:Math.min(1,(ts-o.act0)/DUR);
      o.t+=dt; var fn=REND[o.kind]; if(fn)fn(o); } requestAnimationFrame(loop); }
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){ items.forEach(function(o){o.size();}); });
  requestAnimationFrame(loop);
})();

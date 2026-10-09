
/* carousel hover: the slide's own image/video crumbles into chunky pixels at the corners (top overlay, no trail) */
(function(){
  if(!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches)) return;   /* pointer devices only */
  var media=[].slice.call(document.querySelectorAll('.slide .csm video, .slide .csm img')); if(!media.length) return;
  var cv=document.createElement('canvas'); cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:5;pointer-events:none;'; document.body.appendChild(cv);
  var ctx=cv.getContext('2d'), DPR=Math.min(devicePixelRatio||1,2), W=0,H=0, BL=14, target=null;
  var off=document.createElement('canvas'), offc=off.getContext('2d',{willReadFrequently:true});
  function size(){ W=innerWidth; H=innerHeight; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
  size(); addEventListener('resize',size);
  media.forEach(function(m){ var host=m.closest('.csm')||m; host.addEventListener('mouseenter',function(){ target=m; }); host.addEventListener('mouseleave',function(){ if(target===m) target=null; }); });
  function hsh(a){ var n=Math.sin(a)*43758.5453; return n-Math.floor(n); }
  (function loop(ts){ ctx.clearRect(0,0,W,H);
    if(target){ var host=target.closest('.csm')||target.parentNode, r=host.getBoundingClientRect(), mw=target.videoWidth||target.naturalWidth, mh=target.videoHeight||target.naturalHeight;   /* use the visible .csm box, not the (often scaled) media element */
      if(r.width>0 && r.bottom>0 && r.top<H && mw && mh){
        var cols=Math.floor(r.width/BL), rows=Math.floor(r.height/BL); if(cols<2||rows<2){ requestAnimationFrame(loop); return; } if(off.width!==cols||off.height!==rows){ off.width=cols; off.height=rows; }
        var sc=Math.max(r.width/mw, r.height/mh), cw=r.width/sc, ch=r.height/sc;                 /* cover-fit sample of the media */
        try{ offc.drawImage(target, (mw-cw)/2,(mh-ch)/2,cw,ch, 0,0,cols,rows); }catch(e){ requestAnimationFrame(loop); return; }
        var data; try{ data=offc.getImageData(0,0,cols,rows).data; }catch(e){ requestAnimationFrame(loop); return; }
        var step=Math.floor((ts||0)/90), reach=Math.min(cols,rows)*0.62, s=BL-1;
        for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){
          var dcx=Math.min(i,cols-1-i), dcy=Math.min(j,rows-1-j), d=Math.sqrt(dcx*dcx+dcy*dcy);   /* distance to the nearest corner */
          var p=1-d/reach; if(p<=0) continue; p*=p;                                               /* densest right at the corners */
          if(hsh(i*12.9+j*78.2+step*3.1) > p) continue;                                           /* random twinkle => crumbling */
          var k=(j*cols+i)*4;
          ctx.fillStyle='rgb('+data[k]+','+data[k+1]+','+data[k+2]+')';
          ctx.fillRect(Math.round(r.left)+i*BL, Math.round(r.top)+j*BL, s, s); } } }
    requestAnimationFrame(loop); })();
})();

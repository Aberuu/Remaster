
/* minimal w-logo appears once the hero header has scrolled away */
(function(){ var tl=document.getElementById('toplink'), hero=document.getElementById('hero'); if(!hero) return;
  function upd(){ var on=scrollY > hero.offsetHeight*0.55; if(tl) tl.classList.toggle('show', on); }
  addEventListener('scroll', upd, {passive:true}); addEventListener('resize', upd); upd();
})();
/* smileys: ink eyes/mouth that follow the cursor, blink, and react on hover (the blob still supplies the colour) */
(function(){
  var sm=[].slice.call(document.querySelectorAll('.two .c .smiley'));
  if(!sm.length) return;
  var NS='http://www.w3.org/2000/svg';
  var HEART=[[2,1],[3,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[2,4],[3,4],[4,4],[5,4],[6,4],[3,5],[4,5],[5,5],[4,6]];
  var TOUCH=!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  function heartSVG(){ var s=document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 9 7'); s.setAttribute('width','24'); s.setAttribute('height','19');
    for(var i=0;i<HEART.length;i++){ var r=document.createElementNS(NS,'rect'); r.setAttribute('x',HEART[i][0]); r.setAttribute('y',HEART[i][1]); r.setAttribute('width',1.04); r.setAttribute('height',1.04); r.setAttribute('fill','#e0492a'); s.appendChild(r);} return s; }
  var ptr={x:-1,y:-1}; addEventListener('pointermove',function(e){ ptr.x=e.clientX; ptr.y=e.clientY; }, {passive:true});
  var faces=sm.map(function(sv){
    var mood=sv.getAttribute('data-mood');
    var g=document.createElementNS(NS,'g'); sv.appendChild(g);
    function rect(c,r){ var e=document.createElementNS(NS,'rect'); e.setAttribute('x',c*12); e.setAttribute('y',r*12); e.setAttribute('width',12); e.setAttribute('height',12); e.setAttribute('fill','#0a0a0a'); g.appendChild(e); return e; }
    var eyeL=rect(4,5), eyeR=rect(8,5), mouth=[], blush=[];
    if(mood==='sad'){ mouth.push(rect(5,7),rect(6,7),rect(7,7),rect(4,8),rect(8,8));
      [[3,7],[9,7]].forEach(function(p){ var e=document.createElementNS(NS,'rect'); e.setAttribute('x',p[0]*12); e.setAttribute('y',p[1]*12); e.setAttribute('width',12); e.setAttribute('height',12); e.setAttribute('fill','#e0492a'); e.setAttribute('fill-opacity','0'); g.appendChild(e); blush.push(e); }); }
    else { mouth.push(rect(4,7),rect(8,7),rect(5,8),rect(6,8),rect(7,8)); }
    return {sv:sv, g:g, eyeL:eyeL, eyeR:eyeR, mouth:mouth, blush:blush, mood:mood, lx:0, ly:0, shy:false};
  });
  /* look toward the cursor */
  (function loop(){
    if(!TOUCH && ptr.x>=0){ for(var i=0;i<faces.length;i++){ var f=faces[i], r=f.sv.getBoundingClientRect();
      if(r.width>1){ var cx=r.left+r.width/2, cy=r.top+r.height/2, dx=ptr.x-cx, dy=ptr.y-cy, d=Math.hypot(dx,dy)||1, tx, ty;
        if(f.shy){ tx=-dx/d*7; ty=-dy/d*7+2.5; }                 /* avert the gaze and glance down */
        else { var m=Math.min(1,d/420)*5.5; tx=dx/d*m; ty=dy/d*m; }
        f.lx+=(tx-f.lx)*0.15; f.ly+=(ty-f.ly)*0.15; f.g.setAttribute('transform','translate('+f.lx.toFixed(2)+','+f.ly.toFixed(2)+')'); } } }
    requestAnimationFrame(loop);
  })();
  /* idle blink */
  function blink(f){ f.eyeL.setAttribute('height',2); f.eyeR.setAttribute('height',2); f.eyeL.setAttribute('y',5*12+5); f.eyeR.setAttribute('y',5*12+5);
    setTimeout(function(){ f.eyeL.setAttribute('height',12); f.eyeR.setAttribute('height',12); f.eyeL.setAttribute('y',5*12); f.eyeR.setAttribute('y',5*12); }, 110); }
  function scheduleBlink(f){ setTimeout(function(){ blink(f); scheduleBlink(f); }, 2200+Math.random()*4200); }
  faces.forEach(scheduleBlink);
  /* reactions */
  function replay(sv,cls){ sv.classList.remove(cls); void sv.offsetWidth; sv.classList.add(cls); }
  function spawnHearts(f){ var host=f.sv.parentNode; for(var i=0;i<4;i++){ (function(i){ setTimeout(function(){ var h=heartSVG(); h.setAttribute('class','sm-heart'); h.style.left=(38+Math.random()*52)+'%'; h.style.top='6px'; host.appendChild(h); setTimeout(function(){ if(h.parentNode)h.remove(); },1000); }, i*90); })(i); } }
  faces.forEach(function(f){
    if(TOUCH) return;
    if(f.mood==='sad'){   /* shy: look away, recoil, blush */
      f.sv.addEventListener('mouseenter', function(){ f.shy=true; f.sv.classList.add('sm-shy'); f.blush.forEach(function(e){ e.setAttribute('fill-opacity','.5'); }); });
      f.sv.addEventListener('mouseleave', function(){ f.shy=false; f.sv.classList.remove('sm-shy'); f.blush.forEach(function(e){ e.setAttribute('fill-opacity','0'); }); });
    } else {              /* happy: jump + hearts */
      var busy=false;
      f.sv.addEventListener('mouseenter', function(){ if(busy) return; busy=true; setTimeout(function(){ busy=false; }, 620); replay(f.sv,'sm-jump'); spawnHearts(f); });
    }
  });
})();
/* buttons: smiley-style random pixel flicker on hover */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ACC=['#d8ff00','#f5c518','#e0492a','#0a0a0a'], CELL=9;
  function attach(b){
    if(!b||b.__pxd) return; b.__pxd=true;
    var lbl=document.createElement('span'); lbl.className='lbl';
    while(b.firstChild) lbl.appendChild(b.firstChild);
    var fx=document.createElement('span'); fx.className='pxfx'; fx.setAttribute('aria-hidden','true');
    b.appendChild(fx); b.appendChild(lbl);
    var cells=[];
    function build(){
      fx.textContent=''; cells=[];
      var cols=Math.ceil(b.offsetWidth/CELL), rows=Math.ceil(b.offsetHeight/CELL);
      fx.style.gridTemplateColumns='repeat('+cols+','+CELL+'px)'; fx.style.gridAutoRows=CELL+'px';
      for(var i=0;i<cols*rows;i++){ cells.push(fx.appendChild(document.createElement('i'))); }
    }
    build();
    if(window.ResizeObserver) new ResizeObserver(build).observe(b);
    if(reduce) return;
    var timer=null;
    function tick(){ for(var i=0;i<cells.length;i++) cells[i].style.background = Math.random()<0.14 ? ACC[(Math.random()*ACC.length)|0] : 'transparent'; }
    function clear(){ for(var i=0;i<cells.length;i++) cells[i].style.background='transparent'; }
    b.addEventListener('mouseenter', function(){ if(timer) return; tick(); timer=setInterval(tick,130); });
    b.addEventListener('mouseleave', function(){ clearInterval(timer); timer=null; clear(); });
  }
  window.__pxHover=attach;                                                  /* so dynamically-created buttons (tetris) can opt in */
  [].slice.call(document.querySelectorAll('.btn, .cta .ctabtn, .tt-teaser')).forEach(attach);
})();

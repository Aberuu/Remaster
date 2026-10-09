
/* fade the pixel controls away over the footer so they don't sit on top of it */
(function(){ var px=document.querySelector('.pxctl'), ft=document.querySelector('footer');
  if(!px||!ft||!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(es){ es.forEach(function(e){ px.classList.toggle('hide', e.isIntersecting); }); }, {rootMargin:'0px 0px 320px 0px'}).observe(ft);
})();
/* which wild-er is nearest you, by IP */
(function(){ var el=document.getElementById('nearest'); if(!el) return;
  var TEAM=[
    {who:'Jake, Matt and Claire', place:'Washington DC', lat:38.90, lng:-77.04},
    {who:'Felix', place:'Los Angeles', lat:34.05, lng:-118.24},
    {who:'Anton', place:'the UK', lat:51.51, lng:-0.13},
    {who:'Monde', place:'South Africa', lat:-26.20, lng:28.04},
    {who:'Eva and David', place:'Spain', lat:40.42, lng:-3.70},
    {who:'Alex and Dom', place:'Italy', lat:41.90, lng:12.50},
    {who:'Rag, Matthias and Litchy', place:'Vienna', lat:48.21, lng:16.37},
    {who:'Leandro', place:'Argentina', lat:-34.60, lng:-58.38}
  ];
  function hav(a,b,c,d){ var R=6371,p=Math.PI/180; var s=Math.sin((c-a)*p/2), t=Math.sin((d-b)*p/2);
    var h=s*s+Math.cos(a*p)*Math.cos(c*p)*t*t; return 2*R*Math.asin(Math.sqrt(h)); }
  function show(lat,lng){ var best=null, bd=1/0;
    for(var i=0;i<TEAM.length;i++){ var d=hav(lat,lng,TEAM[i].lat,TEAM[i].lng); if(d<bd){ bd=d; best=TEAM[i]; } }
    if(!best) return; var plural=best.who.indexOf(' and ')>-1;
    var dist=bd<60?'practically next door':('about '+(bd<1000?(Math.round(bd/10)*10):(Math.round(bd/100)*100)).toLocaleString()+' km away');
    el.textContent='The nearest wildling'+(plural?'s are ':' is ')+best.who+' in '+best.place+', '+dist+'.';
    el.style.display='';
  }
  try{ fetch('https://ipwho.is/').then(function(r){ return r.json(); }).then(function(j){
    if(j&&typeof j.latitude==='number'&&typeof j.longitude==='number') show(j.latitude,j.longitude);
  }).catch(function(){}); }catch(_){}
})();

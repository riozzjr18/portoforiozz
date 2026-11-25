/* Shared motion layer: smooth scroll, line reveals, scroll-reactive marquee, pixel walker, header state. */
(function(){
  var root=document.documentElement;root.classList.add("js");
  var still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var subs=[],vel=0,lastY=window.scrollY,dir=1,ticking=false;

  /* Smooth scroll (Lenis) when available and motion is allowed */
  var lenis=null;
  if(!still&&window.Lenis){
    lenis=new window.Lenis({lerp:0.1,smoothWheel:true});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener("click",function(e){var id=a.getAttribute("href");if(id.length<2)return;var el=document.querySelector(id);if(!el)return;e.preventDefault();lenis.scrollTo(el,{offset:-68})})});
  }

  /* Split a heading into visual lines for the mask reveal */
  function split(el){
    var src=el.getAttribute("data-src");
    if(!src){src=el.innerHTML;el.setAttribute("data-src",src)}
    var words=[],cur="",stack=[],re=/(<[^>]+>)|(\s+)|([^<\s]+)/g,m;
    function closeAll(){return stack.slice().reverse().map(function(t){return "</"+t+">"}).join("")}
    while((m=re.exec(src))){
      if(m[1]){
        var tg=m[1],close=/^<\//.test(tg),name=(tg.match(/^<\/?([a-z0-9]+)/i)||[])[1];
        if(cur)cur+=tg;
        if(close)stack.pop();else if(!/\/>$/.test(tg)){if(!cur)cur=stack.map(function(t){return "<"+t+">"}).join("")+tg;stack.push(name.toLowerCase())}
      }else if(m[2]){if(cur){words.push(cur+closeAll());cur=""}}
      else{if(!cur)cur=stack.map(function(t){return "<"+t+">"}).join("");cur+=m[3]}
    }
    if(cur)words.push(cur+closeAll());
    el.innerHTML=words.map(function(w){return '<span class="wd" style="display:inline-block">'+w+"</span>"}).join(" ");
    var spans=[].slice.call(el.querySelectorAll(".wd")),lines=[],top=null;
    spans.forEach(function(s){var t=s.offsetTop;if(top===null||Math.abs(t-top)>4){lines.push([]);top=t}lines[lines.length-1].push(s.innerHTML)});
    el.innerHTML=lines.map(function(l,i){return '<span class="ln"><span style="transition-delay:'+(i*90)+'ms">'+l.join(" ")+"</span></span>"}).join("");
  }
  function splitAll(scope){(scope||document).querySelectorAll("[data-split]").forEach(split)}

  /* Reveal on enter */
  var io=null;
  function observe(scope){
    var els=(scope||document).querySelectorAll("[data-split],[data-up]");
    if(still||!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in")});return}
    if(!io)io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -10% 0px"});
    els.forEach(function(e){if(!e.classList.contains("in"))io.observe(e)});
  }

  /* Marquee that speeds up and flips with scroll */
  var bands=[].slice.call(document.querySelectorAll(".band .mq")).map(function(m){m.innerHTML+=m.innerHTML;return {el:m,x:0,w:0,sign:m.closest(".band").classList.contains("alt")?-1:1}});
  function measure(){bands.forEach(function(b){b.w=b.el.scrollWidth/2})}
  function loop(){
    vel*=0.92;
    bands.forEach(function(b){
      if(!b.w)return;
      b.x-=(0.6+Math.min(vel,60)*0.35)*dir*b.sign;
      if(b.x<=-b.w)b.x+=b.w;if(b.x>0)b.x-=b.w;
      b.el.style.transform="translate3d("+b.x.toFixed(1)+"px,0,0)";
    });
    requestAnimationFrame(loop);
  }

  /* Walker sprite */
  var A=["................",".....aaaa.......","....aaaaaa......",".....bbbb.......",".....b.bb.......",".....bbbb.......","......bb....bb..","....bbbbbbbbpb..","...bbbbbb...pb..","...b.bbbb...bb..","...b.bbbb.......",".....bbbb.......",".....b..b.......","....bb...b......","....b....bb.....","...bb..........."];
  var B=A.slice(0,12).concat([".....b..b.......",".....b..b.......",".....bb.bb......","................"]);
  var C={a:"#A8C8FF",b:"#F2EEE6",p:"#A8C8FF"};
  function paint(m){var s=[];m.forEach(function(r,y){for(var x=0;x<16;x++){var c=C[r[x]];if(c)s.push(x*3+"px "+y*3+"px 0 "+c)}});return s.join(",")}
  document.querySelectorAll(".walker .f1").forEach(function(e){e.style.boxShadow=paint(A)});
  document.querySelectorAll(".walker .f2").forEach(function(e){e.style.boxShadow=paint(B)});

  /* Broken thumbnails fall back to the surface colour */
  function noBroken(scope){(scope||document).querySelectorAll("img").forEach(function(i){if(i.dataset.fb)return;i.dataset.fb=1;i.addEventListener("error",function(){i.style.visibility="hidden"});if(i.complete&&i.src&&i.naturalWidth===0)i.style.visibility="hidden"})}

  var nav=document.querySelector(".top");
  function frame(){
    ticking=false;
    var y=window.scrollY,d=y-lastY;
    if(d!==0){dir=d>0?1:-1;vel=Math.max(vel,Math.abs(d))}
    lastY=y;
    if(nav)nav.classList.toggle("solid",y>40);
    for(var i=0;i<subs.length;i++)subs[i](y);
  }
  function req(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  window.addEventListener("scroll",req,{passive:true});
  var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){splitAll();measure();req()},150)});

  function start(){
    splitAll();observe();measure();noBroken();
    if(!still&&bands.length)requestAnimationFrame(loop);
    req();
  }
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(start)}else window.addEventListener("load",start);
  var yr=document.getElementById("yr");if(yr)yr.textContent=new Date().getFullYear();

  window.Rioz={still:still,onScroll:function(f){subs.push(f);req()},refresh:function(scope){splitAll(scope);observe(scope);noBroken(scope);measure();req()},req:req,lenis:lenis};
})();

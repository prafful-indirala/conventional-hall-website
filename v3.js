(()=>{
  const cinematic=document.getElementById('cinematic');
  if(!cinematic||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const ext=document.querySelector('.scene-exterior');
  const extImg=ext?.querySelector('.local-exterior');
  const sky=ext?.querySelector('.exterior-sky');
  const arch=ext?.querySelector('.exterior-architecture');
  const ground=ext?.querySelector('.exterior-ground');
  const glow=ext?.querySelector('.arrival-light');
  const entranceMask=document.querySelector('.entrance-mask');
  const tunnel=[...document.querySelectorAll('.threshold-tunnel i')];
  const thresholdLight=document.querySelector('.threshold-light');
  const hallImg=document.querySelector('.scene-hall .remote-hall');

  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const smooth=t=>t*t*(3-2*t);
  const seg=(p,a,b)=>clamp((p-a)/(b-a));

  let current=0,target=0,raf=0;

  function apply(){
    current+=(target-current)*.12;
    const p=current;
    const dolly=smooth(seg(p,.035,.18));

    if(extImg)extImg.style.transform=`translate3d(${dolly*.36}%,${dolly*.18}%,0) scale(${1+dolly*.022})`;
    if(sky)sky.style.transform=`translate3d(${dolly*1.35}%,${-dolly*.4}%,0) scale(${1+dolly*.014})`;
    if(arch)arch.style.transform=`translate3d(${-dolly*.28}%,${dolly*.14}%,0) scale(${1+dolly*.012})`;
    if(ground)ground.style.transform=`translate3d(${-dolly*1.35}%,${dolly*1.7}%,0) scale(${1+dolly*.045})`;
    if(glow)glow.style.transform=`scale(${1+dolly*.16})`;
    if(entranceMask)entranceMask.style.opacity=smooth(seg(p,.32,.42));

    const cross=smooth(seg(p,.41,.51));
    tunnel.forEach((el,i)=>{
      const base=[1,.76,.52,.3][i];
      el.style.transform=`scale(${base+cross*(1.45-i*.14)}) rotateZ(${(i%2?1:-1)*cross*.35}deg)`;
      el.style.opacity=String(.46-cross*.3);
    });
    if(thresholdLight){thresholdLight.style.transform=`scale(${.7+cross*2.8})`;thresholdLight.style.opacity=String(.12+cross*.42)}

    const hallIn=smooth(seg(p,.64,.72));
    if(hallImg){
      hallImg.style.transform=`translate3d(${hallIn*-.45}%,${hallIn*-.15}%,0) scale(${1+hallIn*.018})`;
      hallImg.style.filter=`saturate(${.82+hallIn*.12}) contrast(1.05) brightness(${.76+hallIn*.12})`;
    }

    if(Math.abs(target-current)>.0004)raf=requestAnimationFrame(apply);else raf=0;
  }

  function update(){
    const r=cinematic.getBoundingClientRect();
    const total=Math.max(1,cinematic.offsetHeight-innerHeight);
    target=clamp(-r.top/total);
    if(!raf)raf=requestAnimationFrame(apply);
  }

  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update);
  update();
})();

/* V5 progressive enhancement. V4 remains the WebGL exterior foundation,
   while V5 adds continuity, hall choreography, lighting and the handoff. */
(()=>{
  const addCss=(href,key)=>{
    if(document.querySelector(`link[data-${key}]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';link.href=href;link.dataset[key]='true';document.head.appendChild(link);
  };
  addCss('v4.css','v4');
  addCss('v5.css','v5');
  import('./v4.js').catch(err=>{
    console.warn('V4 WebGL unavailable; retaining image fallback.',err);
    document.documentElement.classList.add('webgl-fallback');
  });
  import('./v5.js').catch(err=>console.warn('V5 continuity enhancement unavailable.',err));
})();
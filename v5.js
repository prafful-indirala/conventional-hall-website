(()=>{
  const cinematic=document.getElementById('cinematic');
  const stack=document.getElementById('sceneStack');
  if(!cinematic||!stack||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const light=document.createElement('div');light.className='v5-light-volume';
  const haze=document.createElement('div');haze.className='v5-depth-haze';
  const fg=document.createElement('div');fg.className='v5-foreground';
  const handoff=document.createElement('div');handoff.className='v5-handoff';
  stack.append(light,haze,fg,handoff);

  const hall=document.querySelector('.scene-hall');
  const hallImg=hall?.querySelector('.remote-hall');
  const transform=document.querySelector('.scene-transform');
  const transformImg=transform?.querySelector('.remote-hall-two');
  const stage=document.querySelector('.scene-stage');
  const stageImg=stage?.querySelector('.remote-stage');
  const label=document.getElementById('configurationLabel');

  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const smooth=t=>t*t*(3-2*t);
  const seg=(p,a,b)=>clamp((p-a)/(b-a));

  let target=0,current=0,raf=0;

  function apply(){
    current+=(target-current)*.1;
    const p=current;

    /* Exposure/lighting continuity: exterior -> threshold -> lobby -> hall */
    const interior=smooth(seg(p,.43,.66));
    light.style.opacity=String(interior*(1-smooth(seg(p,.94,1)))*.9);
    light.style.transform=`scale(${1+interior*.08}) translateY(${(1-interior)*8}px)`;
    haze.style.opacity=String(interior*.72*(1-smooth(seg(p,.96,1))));

    /* Foreground parallax makes the hall feel spatial without heavy geometry. */
    const hallPhase=smooth(seg(p,.64,.84));
    fg.style.opacity=String(hallPhase*.74*(1-smooth(seg(p,.90,.97))));
    fg.style.transform=`translate3d(${hallPhase*-2.2}%,${hallPhase*1.6}%,0) scale(${1+hallPhase*.08})`;

    /* Refined hall choreography: reveal -> hold -> side drift -> rise. */
    const reveal=smooth(seg(p,.65,.72));
    const drift=smooth(seg(p,.76,.82));
    const rise=smooth(seg(p,.80,.86));
    if(hallImg){
      hallImg.style.transform=`translate3d(${-drift*1.7}%,${-rise*.8}%,0) scale(${1.055-reveal*.022+rise*.018})`;
      hallImg.style.filter=`saturate(${.84+reveal*.11}) contrast(1.055) brightness(${.76+reveal*.16})`;
    }

    /* Event configurations stay on nearly the same camera, selling flexibility. */
    const modeP=seg(p,.835,.928);
    let mode='wedding';
    if(modeP>.68)mode='corporate'; else if(modeP>.34)mode='reception';
    if(transform){transform.dataset.mode=mode;}
    if(label){label.textContent=mode.toUpperCase();}
    if(transformImg){
      const settle=smooth(seg(p,.835,.90));
      transformImg.style.transform=`scale(${1.045-settle*.018}) translate3d(${settle*.35}%,${-settle*.18}%,0)`;
      transformImg.style.filter=mode==='corporate'?'saturate(.76) contrast(1.08) brightness(.80)':'saturate(.9) contrast(1.05) brightness(.86)';
    }

    /* Stage alignment and cinematic resolve. */
    const stageP=smooth(seg(p,.925,1));
    if(stageImg){
      stageImg.style.transform=`translate3d(${(1-stageP)*-1.25}%,${1.05-stageP*1.65}%,0) scale(${1.075+stageP*.055})`;
      stageImg.style.filter=`saturate(.9) contrast(1.055) brightness(${.80+stageP*.08})`;
    }

    /* Seamless handoff into HTML rather than a hard end to the film. */
    const hand=smooth(seg(p,.965,1));
    handoff.style.opacity=String(hand);
    const transition=document.querySelector('.transition-section');
    if(transition){transition.style.transform=`translateY(${(1-hand)*10}px)`;transition.style.opacity=String(.94+hand*.06)}

    if(Math.abs(target-current)>.0004)raf=requestAnimationFrame(apply);else raf=0;
  }

  function update(){
    const r=cinematic.getBoundingClientRect();
    const total=Math.max(1,cinematic.offsetHeight-innerHeight);
    target=clamp(-r.top/total);
    if(!raf)raf=requestAnimationFrame(apply);
  }
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
})();

(()=>{
  const cinematic=document.getElementById('cinematic');
  const sticky=cinematic?.querySelector('.cinema-sticky');
  if(!cinematic||!sticky||matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const stack=document.getElementById('sceneStack');
  const layer=document.createElement('div');layer.className='v8-video-layer';
  const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.crossOrigin='anonymous';
  layer.appendChild(video);stack.appendChild(layer);
  const label=document.createElement('div');label.className='v8-motion-label';label.textContent='Scroll-scrubbed cinematic motion';sticky.appendChild(label);
  const title=document.createElement('div');title.className='v8-transform-title';title.innerHTML='<small>One extraordinary space</small><strong>Endless possibilities.</strong>';sticky.appendChild(title);

  // V8 is designed around motion assets, but every scene falls back to V7 stills/WebGL when a motion URL is absent or unavailable.
  const motion={
    lobby:null,
    stage:null
  };

  const windows={lobby:[.49,.64],stage:[.925,.995]};
  let currentSrc='',activeKey='',target=0,current=0,raf=0,ready=false;
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const seg=(p,a,b)=>clamp((p-a)/(b-a));

  function setVideo(key){
    const src=motion[key];
    if(!src||src===currentSrc)return false;
    currentSrc=src;activeKey=key;ready=false;video.src=src;video.load();
    return true;
  }
  video.addEventListener('loadedmetadata',()=>{ready=true;document.documentElement.classList.add('v8-video-ready');});
  video.addEventListener('error',()=>{ready=false;layer.classList.remove('is-active');});

  function choose(p){
    for(const [key,[a,b]] of Object.entries(windows))if(p>=a&&p<=b&&motion[key])return key;
    return '';
  }
  function tick(){
    current+=(target-current)*.13;
    const p=current,key=choose(p);
    if(key){
      if(key!==activeKey)setVideo(key);
      const [a,b]=windows[key];const t=seg(p,a,b);
      if(ready&&video.duration){
        const desired=Math.min(video.duration-.04,Math.max(.01,t*video.duration));
        if(Math.abs(video.currentTime-desired)>.045){try{video.currentTime=desired}catch{}}
        layer.classList.add('is-active');
        video.style.transform=`scale(${1+t*.018}) translate3d(${key==='stage'?-t*.3:0}%,${-t*.12}%,0)`;
      }
    }else{layer.classList.remove('is-active');activeKey='';}

    const transformPhase=seg(p,.82,.925);title.classList.toggle('is-visible',transformPhase>.08&&transformPhase<.94);
    if(Math.abs(target-current)>.00035)raf=requestAnimationFrame(tick);else raf=0;
  }
  function update(){const r=cinematic.getBoundingClientRect();const total=Math.max(1,cinematic.offsetHeight-innerHeight);target=clamp(-r.top/total);if(!raf)raf=requestAnimationFrame(tick)}
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();

  // Public hook lets completed Higgsfield motion assets be attached without altering the rest of the V8 timeline.
  window.__ELAN_V8_ATTACH_MOTION__=(key,url)=>{if(key in motion&&url){motion[key]=url;if(choose(current)===key)setVideo(key)}};
})();

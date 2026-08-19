const cinematic = document.getElementById('cinematic');
const scenes = [...document.querySelectorAll('.scene')];
const copy = document.getElementById('copyA');
const caption = document.getElementById('sceneCaption');
const railProgress = document.getElementById('railProgress');
const railNumber = document.getElementById('railNumber');
const header = document.getElementById('siteHeader');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const story = [
  {title:'A landmark arrival.',sub:'Architectural scale, revealed slowly.'},
  {title:'The approach.',sub:'The camera aligns with the primary entrance.'},
  {title:'Crossing the threshold.',sub:'Arrival gives way to the interior atmosphere.'},
  {title:'The grand reveal.',sub:'A deliberate pause before the celebration begins.'},
  {title:'Built around the moment.',sub:'Stage, dining and guest experience in one flow.'}
];

const clamp = (n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const lerp = (a,b,t)=>a+(b-a)*t;
const smooth = t=>t*t*(3-2*t);

function segmentProgress(p,start,end){return clamp((p-start)/(end-start));}
function setSceneOpacity(index, opacity){scenes[index].style.opacity = clamp(opacity);}

function updateCinematic(){
  if(reduced) return;
  const rect = cinematic.getBoundingClientRect();
  const total = cinematic.offsetHeight - innerHeight;
  const travelled = clamp(-rect.top,0,total);
  const p = total ? travelled/total : 0;
  railProgress.style.height = `${p*100}%`;

  // Scene 01: Establishing shot + breathing room + slow dolly.
  const ext = scenes[0];
  const p0 = segmentProgress(p,0,.25);
  const dolly0 = smooth(segmentProgress(p,.035,.17));
  const settle0 = smooth(segmentProgress(p,.17,.22));
  const exit0 = smooth(segmentProgress(p,.21,.29));
  setSceneOpacity(0,1-exit0);
  ext.style.transform = `scale(${lerp(1.02,1.28,dolly0)}) translate3d(${lerp(0,-1.6,dolly0)}%,${lerp(0,1.2,dolly0)}%,0)`;
  ext.querySelector('.scene-image').style.filter = `saturate(${lerp(.82,.93,dolly0)}) contrast(1.06) brightness(${lerp(.82,.9,settle0)})`;

  // Opening copy exits early, then the scene breathes without clutter.
  const copyExit = smooth(segmentProgress(p,.04,.105));
  copy.style.opacity = 1-copyExit;
  copy.style.transform = `translate3d(0,${copyExit*-18}px,0)`;

  // Scene 02: second camera movement, alignment toward entrance.
  const in1 = smooth(segmentProgress(p,.22,.29));
  const move1 = smooth(segmentProgress(p,.27,.39));
  const out1 = smooth(segmentProgress(p,.39,.46));
  setSceneOpacity(1,in1*(1-out1));
  scenes[1].style.transform = `scale(${lerp(1.14,1.62,move1)}) translate3d(${lerp(5,-2,move1)}%,${lerp(1,3,move1)}%,0) rotateZ(${lerp(.45,0,move1)}deg)`;
  scenes[1].querySelector('.scene-image').style.filter = `saturate(.88) contrast(1.08) brightness(${lerp(.72,.84,move1)})`;

  // Scene 03: entrance -> lobby, with a deeper forward push.
  const in2 = smooth(segmentProgress(p,.40,.47));
  const move2 = smooth(segmentProgress(p,.45,.60));
  const out2 = smooth(segmentProgress(p,.59,.66));
  setSceneOpacity(2,in2*(1-out2));
  scenes[2].style.transform = `scale(${lerp(1.05,1.42,move2)}) translate3d(${lerp(-2,2.5,move2)}%,${lerp(2,-1,move2)}%,0)`;
  scenes[2].querySelector('.scene-image').style.filter = `saturate(.76) contrast(1.12) brightness(${lerp(.56,.84,move2)})`;

  // Scene 04: grand hall reveal. Faster arrival, then a deliberate visual hold.
  const in3 = smooth(segmentProgress(p,.60,.67));
  const move3 = smooth(segmentProgress(p,.64,.74));
  const out3 = smooth(segmentProgress(p,.81,.88));
  setSceneOpacity(3,in3*(1-out3));
  const hallHold = smooth(segmentProgress(p,.74,.80));
  scenes[3].style.transform = `scale(${lerp(1.19,1.035,move3)}) translate3d(${lerp(1.6,0,move3)}%,${lerp(1.8,0,move3)}%,0)`;
  scenes[3].querySelector('.scene-image').style.filter = `saturate(${lerp(.76,.96,hallHold)}) contrast(1.06) brightness(${lerp(.66,.94,hallHold)})`;

  // Scene 05: stage focus / continuation into the rest of the site.
  const in4 = smooth(segmentProgress(p,.82,.89));
  const move4 = smooth(segmentProgress(p,.87,1));
  setSceneOpacity(4,in4);
  scenes[4].style.transform = `scale(${lerp(1.12,1.26,move4)}) translate3d(${lerp(-2.2,0,move4)}%,${lerp(1.8,-1.5,move4)}%,0)`;

  // Caption source of truth by progress bands.
  const index = p < .23 ? 0 : p < .42 ? 1 : p < .62 ? 2 : p < .83 ? 3 : 4;
  railNumber.textContent = String(index+1).padStart(2,'0');
  const s = story[index];
  caption.innerHTML = `<p class="caption-index">${String(index+1).padStart(2,'0')} / 05</p><p class="caption-title">${s.title}</p><p class="caption-sub">${s.sub}</p>`;
  const captionVisible = p > .095 ? 1 : 0;
  caption.style.opacity = captionVisible;
  caption.style.transform = `translateY(${captionVisible?0:12}px)`;

  document.querySelectorAll('.cinema-letterbox').forEach(el=>el.style.height=`${lerp(0,2.8,smooth(segmentProgress(p,.12,.22)))}vh`);
}

let ticking=false;
addEventListener('scroll',()=>{
  header.classList.toggle('scrolled',scrollY>40);
  if(!ticking){requestAnimationFrame(()=>{updateCinematic();ticking=false});ticking=true}
},{passive:true});
addEventListener('resize',updateCinematic);

window.addEventListener('load',()=>{
  setTimeout(()=>document.getElementById('loader').classList.add('is-hidden'),500);
  updateCinematic();
});

document.querySelectorAll('.occasion-tabs button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.occasion-tabs button').forEach(b=>b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const text={
    Weddings:'A complete celebration journey — ceremony, dining and reception — shaped around your guest experience.',
    Engagements:'A polished setting for a warm, beautifully staged beginning with flexible layouts for family and friends.',
    Sangeet:'Lighting, performance, music and movement come together in a hall designed to carry energy.',
    Receptions:'A grand arrival, dramatic stage and generous dining floor create an effortless evening sequence.',
    Corporate:'Conference, exhibition and launch formats supported by flexible staging, guest flow and production access.'
  };
  document.querySelector('.occasion-description').textContent=text[btn.textContent];
}));

document.getElementById('enquiryForm').addEventListener('submit',e=>{
  e.preventDefault();
  const toast=document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2500);
});

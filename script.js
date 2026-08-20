const cinematic=document.getElementById('cinematic');
const scenes=[...document.querySelectorAll('.scene')];
const copy=document.getElementById('copyA');
const caption=document.getElementById('sceneCaption');
const railProgress=document.getElementById('railProgress');
const railNumber=document.getElementById('railNumber');
const header=document.getElementById('siteHeader');
const pauseCopy=document.getElementById('pauseCopy');
const hallCopy=document.getElementById('hallCopy');
const transformCopy=document.getElementById('transformCopy');
const statusText=document.getElementById('statusText');
const thresholdFlash=document.getElementById('thresholdFlash');
const configurationLabel=document.getElementById('configurationLabel');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const story=[
 {title:'A landmark arrival.',sub:'Architecture comes into focus.',status:'ARRIVAL'},
 {title:'The approach.',sub:'A measured camera move toward the entrance.',status:'APPROACH'},
 {title:'Crossing the threshold.',sub:'Exterior light gives way to atmosphere.',status:'THRESHOLD'},
 {title:'The welcome.',sub:'A composed pre-function arrival.',status:'LOBBY'},
 {title:'The grand reveal.',sub:'Scale, light and celebration in one frame.',status:'GRAND HALL'},
 {title:'One space. Many moods.',sub:'The room transforms around the occasion.',status:'TRANSFORM'},
 {title:'The moment.',sub:'Every journey resolves at the stage.',status:'STAGE'}
];
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const seg=(p,a,b)=>clamp((p-a)/(b-a));
function opacity(i,v){if(scenes[i])scenes[i].style.opacity=clamp(v)}
function reveal(el,v,y=18){if(!el)return;el.style.opacity=v;el.style.transform=`translate3d(0,${(1-v)*y}px,0)`}
function updateCinematic(){
 if(reduced)return;
 const rect=cinematic.getBoundingClientRect();
 const total=Math.max(1,cinematic.offsetHeight-innerHeight);
 const p=clamp(-rect.top,0,total)/total;
 railProgress.style.height=`${p*100}%`;
 const opening=smooth(seg(p,.025,.105));
 copy.style.opacity=1-opening;copy.style.transform=`translate3d(0,${opening*-24}px,0)`;
 const s0=smooth(seg(p,.02,.16)),s0out=smooth(seg(p,.19,.25));opacity(0,1-s0out);
 scenes[0].style.transform=`scale(${lerp(1.015,1.24,s0)}) translate3d(${lerp(0,-1.4,s0)}%,${lerp(0,1.4,s0)}%,0)`;
 const ext=scenes[0].querySelector('.scene-image');if(ext)ext.style.filter=`saturate(${lerp(.76,.96,s0)}) contrast(${lerp(1.09,1.03,s0)}) brightness(${lerp(.70,.92,s0)})`;
 reveal(pauseCopy,Math.sin(Math.PI*seg(p,.105,.205)));
 const s1in=smooth(seg(p,.205,.255)),s1=smooth(seg(p,.235,.36)),s1out=smooth(seg(p,.36,.405));opacity(1,s1in*(1-s1out));
 scenes[1].style.transform=`scale(${lerp(1.12,1.72,s1)}) translate3d(${lerp(4,-1.5,s1)}%,${lerp(1,3.5,s1)}%,0)`;
 const s2in=smooth(seg(p,.37,.415)),s2=smooth(seg(p,.405,.48)),s2out=smooth(seg(p,.485,.525));opacity(2,s2in*(1-s2out));
 scenes[2].style.transform=`scale(${lerp(.94,1.22,s2)}) translateZ(${lerp(-80,120,s2)}px)`;
 thresholdFlash.style.opacity=Math.sin(Math.PI*seg(p,.43,.51))*.34;
 const s3in=smooth(seg(p,.485,.535)),s3=smooth(seg(p,.515,.64)),s3out=smooth(seg(p,.65,.69));opacity(3,s3in*(1-s3out));
 scenes[3].style.transform=`scale(${lerp(1.18,1.035,s3)}) translate3d(${lerp(-2,0,s3)}%,${lerp(2,0,s3)}%,0)`;
 const s4in=smooth(seg(p,.655,.70)),s4=smooth(seg(p,.69,.79)),s4out=smooth(seg(p,.80,.84));opacity(4,s4in*(1-s4out));
 scenes[4].style.transform=`scale(${lerp(1.17,1.015,s4)}) translate3d(0,${lerp(1.8,0,s4)}%,0)`;
 reveal(hallCopy,Math.sin(Math.PI*seg(p,.715,.805)));
 const s5in=smooth(seg(p,.805,.845)),s5=smooth(seg(p,.83,.91)),s5out=smooth(seg(p,.915,.945));opacity(5,s5in*(1-s5out));
 scenes[5].style.transform=`scale(${lerp(1.08,1.02,s5)})`;
 const cycle=seg(p,.845,.925);configurationLabel.textContent=cycle<.34?'WEDDING':cycle<.67?'RECEPTION':'CORPORATE';
 reveal(transformCopy,Math.sin(Math.PI*seg(p,.835,.925)),12);
 const s6in=smooth(seg(p,.91,.95)),s6=smooth(seg(p,.94,1));opacity(6,s6in);scenes[6].style.transform=`scale(${lerp(1.13,1.25,s6)}) translate3d(${lerp(-1.5,0,s6)}%,${lerp(1.5,-1,s6)}%,0)`;
 const bands=[.20,.37,.49,.66,.81,.92,1.01];let index=bands.findIndex(x=>p<x);if(index<0)index=6;
 railNumber.textContent=String(index+1).padStart(2,'0');statusText.textContent=story[index].status;
 caption.innerHTML=`<p class="caption-index">${String(index+1).padStart(2,'0')} / 07</p><p class="caption-title">${story[index].title}</p><p class="caption-sub">${story[index].sub}</p>`;
 const cv=smooth(seg(p,.095,.14));caption.style.opacity=cv;caption.style.transform=`translateY(${(1-cv)*12}px)`;
 document.querySelectorAll('.cinema-letterbox').forEach(el=>el.style.height=`${lerp(0,2.6,smooth(seg(p,.12,.20)))}vh`);
}
let ticking=false;addEventListener('scroll',()=>{header.classList.toggle('scrolled',scrollY>40);if(!ticking){requestAnimationFrame(()=>{updateCinematic();ticking=false});ticking=true}},{passive:true});addEventListener('resize',updateCinematic);
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('loader').classList.add('is-hidden'),650);updateCinematic()});
document.querySelectorAll('.occasion-tabs button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.occasion-tabs button').forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');const text={Weddings:'A complete celebration journey — ceremony, dining and reception — shaped around your guest experience.',Engagements:'A polished setting for a warm, beautifully staged beginning with flexible layouts for family and friends.',Sangeet:'Lighting, performance, music and movement come together in a hall designed to carry energy.',Receptions:'A grand arrival, dramatic stage and generous dining floor create an effortless evening sequence.',Corporate:'Conference, exhibition and launch formats supported by flexible staging, guest flow and production access.'};document.querySelector('.occasion-description').textContent=text[btn.textContent]}));
document.getElementById('enquiryForm').addEventListener('submit',e=>{e.preventDefault();const toast=document.getElementById('toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500)});
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const cinematic=document.getElementById('cinematic');
const stack=document.getElementById('sceneStack');
if(!cinematic||!stack||window.matchMedia('(prefers-reduced-motion: reduce)').matches){throw new Error('V6 unavailable');}

const canvas=document.createElement('canvas');canvas.className='v6-canvas';stack.appendChild(canvas);
const badge=document.createElement('div');badge.className='v6-badge';badge.textContent='ARCHITECTURAL PROXY · SCROLL CAMERA';stack.parentElement.appendChild(badge);

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));
renderer.setClearColor(0x000000,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;

const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x17120d,.045);
const camera=new THREE.PerspectiveCamera(innerWidth<800?53:46,innerWidth/innerHeight,.1,100);

scene.add(new THREE.HemisphereLight(0xd8c6aa,0x120f0b,1.05));
const warm=new THREE.PointLight(0xffd39a,18,20,2);warm.position.set(0,3,-5);scene.add(warm);
const stageLight=new THREE.SpotLight(0xffe2b3,28,30,Math.PI/7,.6,1.4);stageLight.position.set(0,5,-22);stageLight.target.position.set(0,1.6,-26);scene.add(stageLight,stageLight.target);

const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,transparent:true,opacity:.86});
const wallMat=mat(0x6d6254,.92);const darkMat=mat(0x26211c,.9);const goldMat=mat(0xb69562,.55,.08);const floorMat=mat(0x403831,.72,.04);const seatMat=mat(0x6b5947,.82);
const addBox=(x,y,z,w,h,d,m=wallMat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);return o};

// Entrance portal + corridor proxy
addBox(-3.4,1.9,-2,1,4,6,darkMat);addBox(3.4,1.9,-2,1,4,6,darkMat);addBox(0,4.15,-2,7.8,.7,6,darkMat);addBox(0,-.15,-5.2,8,.25,13,floorMat);
for(let z=-4;z>-13;z-=2.2){addBox(-3.05,2,z,.28,4.1,.28,goldMat);addBox(3.05,2,z,.28,4.1,.28,goldMat);addBox(0,3.95,z,6.3,.16,.3,goldMat)}

// Grand hall shell
addBox(-6.6,2.6,-20,.38,5.4,17,wallMat);addBox(6.6,2.6,-20,.38,5.4,17,wallMat);addBox(0,5.35,-20,13.6,.35,17,darkMat);addBox(0,-.12,-20,13.5,.22,17,floorMat);
for(let z=-14;z>-27;z-=2.5){const l=new THREE.PointLight(0xffd7a1,4.4,7,2);l.position.set(0,4.7,z);scene.add(l);addBox(0,5.0,z,5.5,.10,.14,goldMat)}

// Stage
addBox(0,.42,-28,7,.9,2.6,darkMat);addBox(0,2.4,-29.0,8,.18,4.8,goldMat);addBox(-3.6,2.2,-28.8,.28,4.4,.35,goldMat);addBox(3.6,2.2,-28.8,.28,4.4,.35,goldMat);

// Seating proxy groups (intentionally abstract, not presented as accurate architecture)
const seats=new THREE.Group();scene.add(seats);
for(let r=0;r<5;r++){for(let c=-4;c<=4;c++){if(Math.abs(c)<1&&r<3)continue;const chair=new THREE.Mesh(new THREE.BoxGeometry(.55,.55,.55),seatMat);chair.position.set(c*.95,.3,-15-r*1.55);seats.add(chair)}}

// Event transform proxy elements
const eventGroup=new THREE.Group();scene.add(eventGroup);
for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const table=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.08,24),mat(0x9c8063,.88));table.position.set(Math.cos(a)*4.1,.42,-21+Math.sin(a)*3);eventGroup.add(table)}

const path=new THREE.CatmullRomCurve3([
 new THREE.Vector3(0,1.65,4.8),new THREE.Vector3(0,1.7,1.5),new THREE.Vector3(0,1.75,-3.5),new THREE.Vector3(.25,1.8,-8.5),new THREE.Vector3(-.35,1.9,-13.5),new THREE.Vector3(-1.0,2.05,-18),new THREE.Vector3(.3,2.45,-22),new THREE.Vector3(0,2.15,-26.3)
],false,'catmullrom',.5);
const lookPath=new THREE.CatmullRomCurve3([
 new THREE.Vector3(0,1.7,-2),new THREE.Vector3(0,1.8,-5),new THREE.Vector3(0,1.9,-10),new THREE.Vector3(0,2,-15),new THREE.Vector3(.3,2,-20),new THREE.Vector3(0,2,-24),new THREE.Vector3(0,2.1,-28),new THREE.Vector3(0,2.2,-29)
]);

let target=0,current=0,raf=0;const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));const smooth=t=>t*t*(3-2*t);const seg=(p,a,b)=>clamp((p-a)/(b-a));
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<800?53:46;camera.updateProjectionMatrix()}resize();addEventListener('resize',resize);
function render(){current+=(target-current)*.075;const p=current;const t=smooth(seg(p,.27,.985));const pos=path.getPointAt(t);const look=lookPath.getPointAt(Math.min(.999,t+.025));camera.position.copy(pos);camera.lookAt(look);camera.rotation.z=Math.sin(t*Math.PI*2)*.004;const hall=seg(p,.64,.92);renderer.toneMappingExposure=.78+hall*.35;scene.fog.density=.052-hall*.018;const mode=seg(p,.82,.94);eventGroup.visible=mode>.05;eventGroup.scale.setScalar(.86+mode*.14);eventGroup.rotation.y=mode*.15;seats.position.x=-smooth(seg(p,.74,.84))*.55;seats.position.y=smooth(seg(p,.77,.86))*.05;const visible=smooth(seg(p,.26,.34))*(1-smooth(seg(p,.985,1)));canvas.style.opacity=String(visible*.92);renderer.render(scene,camera);if(Math.abs(target-current)>.00035)raf=requestAnimationFrame(render);else raf=0}
function update(){const r=cinematic.getBoundingClientRect();const total=Math.max(1,cinematic.offsetHeight-innerHeight);target=clamp(-r.top/total);if(!raf)raf=requestAnimationFrame(render)}
addEventListener('scroll',update,{passive:true});update();document.documentElement.classList.add('v6-ready');

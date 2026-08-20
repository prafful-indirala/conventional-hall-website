import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const cinematic=document.getElementById('cinematic');
const sceneExterior=document.querySelector('.scene-exterior');
if(!cinematic||!sceneExterior||window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('webgl-fallback');}
else{
  try{
    const canvas=document.createElement('canvas');
    canvas.className='webgl-exterior';
    sceneExterior.prepend(canvas);

    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));
    renderer.setClearColor(0x000000,0);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
    camera.position.set(0,0,5.35);

    const tex=await new THREE.TextureLoader().loadAsync('/exterior.jpg');
    tex.colorSpace=THREE.SRGBColorSpace;
    tex.minFilter=THREE.LinearFilter;
    tex.magFilter=THREE.LinearFilter;

    const aspect=tex.image.width/tex.image.height;
    const planeH=4.65, planeW=planeH*aspect;

    const makeLayer=(z,alphaFn,scale=1)=>{
      const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:tex},opacity:{value:1}},vertexShader:`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D map; uniform float opacity; varying vec2 vUv; ${alphaFn} void main(){vec4 c=texture2D(map,vUv); float a=layerAlpha(vUv); c.rgb=pow(c.rgb,vec3(.96)); gl_FragColor=vec4(c.rgb,a*opacity);}`});
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(planeW,planeH),mat);
      mesh.position.z=z;mesh.scale.setScalar(scale);scene.add(mesh);return mesh;
    };

    const sky=makeLayer(-.22,`float layerAlpha(vec2 uv){return smoothstep(.56,.76,uv.y);}`,.99);
    const building=makeLayer(0,`float layerAlpha(vec2 uv){float top=1.0-smoothstep(.70,.88,uv.y);float bottom=smoothstep(.18,.36,uv.y);return clamp(top*bottom,0.0,1.0);}`,1.0);
    const foreground=makeLayer(.18,`float layerAlpha(vec2 uv){return 1.0-smoothstep(.18,.42,uv.y);}`,1.025);

    const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();};resize();addEventListener('resize',resize);

    let target=0,current=0,raf=0;
    const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));const smooth=t=>t*t*(3-2*t);const seg=(p,a,b)=>clamp((p-a)/(b-a));
    const entrance=document.querySelector('.scene-entrance');
    const glow=document.createElement('div');glow.className='portal-glow';entrance?.appendChild(glow);

    function render(){
      current+=(target-current)*.085;
      const p=current; const dolly=smooth(seg(p,.03,.205));
      camera.position.z=5.35-dolly*.88;
      camera.position.x=-.08*dolly;
      camera.position.y=.025*dolly;
      camera.rotation.y=.012*dolly;
      sky.position.x=.10*dolly;sky.position.y=.025*dolly;
      building.position.x=-.02*dolly;building.position.y=-.01*dolly;
      foreground.position.x=-.14*dolly;foreground.position.y=-.07*dolly;
      foreground.scale.setScalar(1.025+dolly*.055);
      building.scale.setScalar(1+dolly*.018);
      sky.scale.setScalar(.99+dolly*.008);
      const fade=1-smooth(seg(p,.215,.285));sky.material.uniforms.opacity.value=fade;building.material.uniforms.opacity.value=fade;foreground.material.uniforms.opacity.value=fade;
      if(entrance){const active=p>.28&&p<.46;entrance.classList.toggle('is-portal-active',active);glow.style.opacity=String(active?Math.min(1,seg(p,.29,.39)):0)}
      renderer.render(scene,camera);
      if(Math.abs(target-current)>.00035)raf=requestAnimationFrame(render);else raf=0;
    }
    function update(){const r=cinematic.getBoundingClientRect();const total=Math.max(1,cinematic.offsetHeight-innerHeight);target=clamp(-r.top/total);if(!raf)raf=requestAnimationFrame(render);}addEventListener('scroll',update,{passive:true});update();
    document.documentElement.classList.add('webgl-ready');
  }catch(e){console.warn('V4 WebGL fallback',e);document.documentElement.classList.add('webgl-fallback');}
}

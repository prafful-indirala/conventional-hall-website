(()=>{
  const cinematic=document.getElementById('cinematic');
  const sticky=cinematic?.querySelector('.cinema-sticky');
  if(!cinematic||!sticky)return;

  const label=document.createElement('div');
  label.className='v7-concept-label';
  label.textContent='Concept visualisation · AI-generated interior';
  sticky.appendChild(label);

  // Preload the coherent V7 scene set so scene changes do not flash or reveal legacy imagery.
  const assets=[
    'https://d8j0ntlcm91z4.cloudfront.net/user_3I9jCgewYIVRFd0JvSQVcS5Frsr/hf_20260820_011139_3ec3203a-6e33-43d3-a870-5065be203e59.png',
    'https://d8j0ntlcm91z4.cloudfront.net/user_3I9jCgewYIVRFd0JvSQVcS5Frsr/hf_20260820_011139_a3b03ab8-edc6-43de-ac8e-69fb71c47d92.png',
    'https://d8j0ntlcm91z4.cloudfront.net/user_3I9jCgewYIVRFd0JvSQVcS5Frsr/hf_20260820_011139_65c96b88-7cd0-49f5-bed9-33f4f96177fe.png',
    'https://d8j0ntlcm91z4.cloudfront.net/user_3I9jCgewYIVRFd0JvSQVcS5Frsr/hf_20260820_011139_bdab69fb-66c2-455b-80d3-98d2c683ea96.png',
    'https://d8j0ntlcm91z4.cloudfront.net/user_3I9jCgewYIVRFd0JvSQVcS5Frsr/hf_20260820_011652_c56484fa-0e0d-4982-be45-d0cb328342fa.png'
  ];
  Promise.allSettled(assets.map(src=>new Promise(resolve=>{const i=new Image();i.onload=i.onerror=resolve;i.src=src;}))).then(()=>document.documentElement.classList.add('v7-ready'));

  // If a CDN image is temporarily unavailable, retain the V6 scene beneath it rather than breaking the journey.
  setTimeout(()=>document.documentElement.classList.add('v7-ready'),2200);
})();

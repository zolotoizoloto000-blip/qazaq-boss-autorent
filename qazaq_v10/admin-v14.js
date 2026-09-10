(()=>{const icons={dashboard:'<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',orders:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',cars:'<path d="M5 17h14l-1.5-6h-11zM5 11l2-5h10l2 5"/><path d="M6 17v2M18 17v2"/>',clients:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',services:'<path d="M12 3l2.6 5.3L20 9l-4 3.9.9 5.5L12 15.8 7.1 18.4 8 12.9 4 9l5.4-.7z"/>',drivers:'<circle cx="12" cy="8" r="4"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/>',dispatch:'<circle cx="12" cy="12" r="8"/><path d="M12 6v6l4 2"/>',payments:'<path d="M4 7h16v10H4z"/><path d="M7 12h4"/>',finance:'<path d="M4 18V9M10 18V5M16 18v-7M22 18V3"/>',maintenance:'<path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.5 2.5-3-3z"/>',inspections:'<path d="M5 4h14v17H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',analytics:'<path d="M4 19V9M10 19V5M16 19v-8M22 19V3"/>',notifications:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',tariffs:'<path d="M3 7h18M3 12h18M3 17h18"/>',map:'<path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2"/>',team:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 15c3.5 0 5.5 1.5 6 5"/>',roles:'<path d="M12 3l8 4v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V7z"/><path d="m9 12 2 2 4-4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>'};
const svg=p=>`<svg class="navSvg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
document.querySelectorAll('.sideNav .navItem[data-tab],.adminMobileNav .navItem[data-tab]').forEach(b=>{const span=b.querySelector('span');if(!span)return;[...b.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());const old=b.querySelector('.navSvg');if(old)old.remove();b.insertAdjacentHTML('afterbegin',svg(icons[b.dataset.tab]||icons.dashboard))});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('adminRevealOn');io.unobserve(e.target)}}),{threshold:.05});document.querySelectorAll('.kpi,.adminCard,.driverCard,.serviceEdit').forEach(x=>{x.classList.add('adminReveal');io.observe(x)});
document.addEventListener('click',e=>{const b=e.target.closest('.adminBody .btn,.adminBody .navItem,.adminBody .textBtn');if(!b)return;const r=document.createElement('span');r.className='adminRipple';b.appendChild(r);setTimeout(()=>r.remove(),500)});
})();

// V15: photo gallery manager for the car editor (OLX-style)
(()=>{
  const q=s=>document.querySelector(s);
  let photos=[];
  const maxPhotos=10;
  function currentCover(){return photos[0]||'assets/car-front.jpg'}
  function renderPhotos(){
    const prev=q('#carPreview'), slots=q('#photoSlots'), hint=q('#dropHint');
    if(!prev||!slots)return;
    prev.src=currentCover();
    slots.innerHTML=photos.slice(1).map((src,i)=>`<div class="photoThumb" data-i="${i+1}" title="Нажмите, чтобы сделать обложкой"><img src="${src}"><small>Фото ${i+2}</small><button type="button" aria-label="Удалить">×</button></div>`).join('');
    if(hint)hint.style.display=photos.length>=maxPhotos?'none':'';
    slots.querySelectorAll('.photoThumb').forEach(el=>{
      el.onclick=e=>{const idx=Number(el.dataset.i);if(e.target.tagName==='BUTTON'){photos.splice(idx,1);renderPhotos();return} const x=photos.splice(idx,1)[0];photos.unshift(x);renderPhotos()}
    })
  }
  async function uploadFile(f){
    return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(f)})
  }
  async function addFiles(fileList){
    const fs=[...fileList].filter(f=>f.type.startsWith('image/')).slice(0,Math.max(0,maxPhotos-photos.length));
    for(const f of fs){
      let src=await uploadFile(f);
      if(location.protocol==='http:'||location.protocol==='https:'){
        try{const fd=new FormData();fd.append('file',f);const res=await fetch('/api/upload',{method:'POST',body:fd});if(res.ok){const d=await res.json();src=d.url}}catch(_){ }
      }
      photos.push(src)
    }
    renderPhotos()
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const input=q('#carImage'), dz=q('#photoDropzone');
    if(input)input.onchange=e=>addFiles(e.target.files);
    if(dz){
      ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));
      ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));
      dz.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
    }
  });
  const oldOpen=window.openCarModal;
  window.openCarModal=function(id){
    oldOpen(id);
    const c=id&&window.cars?window.cars.find(x=>x.id===id):null;
    photos=(c&&Array.isArray(c.images)&&c.images.length?c.images:[c&&c.image?c.image:'assets/car-front.jpg']).filter(Boolean);
    renderPhotos();
  };
  const form=q('#carForm');
  if(form){
    form.addEventListener('submit',()=>{
      const id=q('#carId')?.value; setTimeout(()=>{
        const list=window.cars||[]; const c=list.find(x=>x.id===id)||list[0];
        if(c){c.images=[...photos];c.image=currentCover(); if(window.saveCars)window.saveCars()}
      },0)
    },true)
  }
})();
document.addEventListener('DOMContentLoaded',()=>{const b=document.querySelector('#menuBtn');if(b)b.addEventListener('click',()=>document.body.classList.toggle('nav-open'));document.querySelectorAll('.navItem').forEach(x=>x.addEventListener('click',()=>{if(innerWidth<=900)document.body.classList.remove('nav-open')}));});

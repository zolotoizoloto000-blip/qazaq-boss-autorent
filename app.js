const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>Number(n||0).toLocaleString('ru-RU')+' ₸';
const esc=s=>String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
const defaults={company:'QAZAQ BOSS AUTORENT',whatsapp:'77752757063',phone:'+7 775 275 70 63',city:'Атырау',hours:'24/7 — онлайн-заявки',hero:'QAZAQ BOSS AUTORENT',subtitle:'Автопрокат • Такси • Трезвый водитель',success:'Заявка принята. Менеджер подтвердит стоимость и доступность.',ordersEnabled:true};
const seedCars=[
{id:'c1',name:'Jaguar XJ',price:100000,category:'Premium',year:2020,gear:'Автомат',seats:5,availability:'free',active:true,driver:true,image:'assets/car-front.jpg',rating:4.9,trips:48},
{id:'c2',name:'Jaguar F-Type',price:90000,category:'Sport',year:2019,gear:'Автомат',seats:2,availability:'free',active:true,driver:false,image:'assets/car-night.jpg',rating:4.8,trips:31},
{id:'c3',name:'Range Rover',price:80000,category:'SUV',year:2020,gear:'Автомат',seats:5,availability:'busy',active:true,driver:true,image:'assets/car-rear.jpg',rating:4.9,trips:64},
{id:'c4',name:'Range Rover Velar',price:70000,category:'Premium SUV',year:2021,gear:'Автомат',seats:5,availability:'free',active:true,driver:true,image:'assets/interior.jpg',rating:5.0,trips:52}
];
const seedServices=[{name:'Автопрокат',active:true},{name:'Такси',active:true},{name:'Трезвый водитель',active:true},{name:'Аренда с водителем',active:true}];
const settings={...defaults,...JSON.parse(localStorage.getItem('qb_settings')||'{}')};
const cars=JSON.parse(localStorage.getItem('qb_cars_v2')||'null')||seedCars;
const services=JSON.parse(localStorage.getItem('qb_services')||'null')||seedServices;
let favorites=JSON.parse(localStorage.getItem('qb_favorites')||'[]');
let profile=JSON.parse(localStorage.getItem('qb_profile')||'{}');
const today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
['date','quickDate'].forEach(id=>{const el=$('#'+id);if(el)el.min=today.toISOString().split('T')[0]});

document.title=settings.company+' — '+settings.city;
const hero=$('.hero h1'); if(hero)hero.innerHTML=settings.hero.replace(/\s+(AUTORENT)$/,'<br>$1');
if($('.subtitle')) $('.subtitle').textContent=settings.subtitle;
$$('a[href*="wa.me"]').forEach(a=>a.href='https://wa.me/'+settings.whatsapp);
const foot=$('footer span'); if(foot)foot.textContent=settings.city+' • '+settings.phone;

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>e.classList.remove('show'),2600)}
function dynamicFields(){const s=$('#service')?.value; const w=$('#dynamicBookingFields'); if(!w)return;
 if(s==='Автопрокат'||s==='Аренда с водителем') w.innerHTML=`<label>Автомобиль<select id="bookingCar"><option value="">Выберите автомобиль</option>${cars.filter(c=>c.active).map(c=>`<option value="${c.id}">${esc(c.name)} — ${money(c.price)}/сутки</option>`).join('')}</select></label><div class="date-grid"><label>Дата возврата<input id="endDate" type="date" min="${today.toISOString().split('T')[0]}"></label><label>Место подачи<input id="pickup" placeholder="Адрес или аэропорт"></label></div>`;
 else if(s==='Такси') w.innerHTML=`<div class="date-grid"><label>Откуда<input id="fromAddr" required placeholder="Адрес подачи"></label><label>Куда<input id="toAddr" required placeholder="Куда едем"></label></div><label>Пассажиров<select id="passengers"><option>1</option><option>2</option><option>3</option><option>4+</option></select></label>`;
 else w.innerHTML=`<label>Адрес подачи<input id="fromAddr" required placeholder="Где забрать автомобиль и клиента"></label><label>Куда доставить<input id="toAddr" placeholder="Адрес назначения"></label>`;
}
if($('#service')){$('#service').innerHTML=services.filter(s=>s.active).map(s=>`<option>${esc(s.name)}</option>`).join(''); $('#service').onchange=dynamicFields; dynamicFields();}

let filters={category:'',maxPrice:150000,free:false,driver:false,search:'',sort:'popular'};
function renderFleet(){let a=cars.filter(c=>c.active);a=a.filter(c=>(!filters.search||c.name.toLowerCase().includes(filters.search.toLowerCase()))&&(!filters.category||c.category===filters.category)&&Number(c.price)<=filters.maxPrice&&(!filters.free||c.availability==='free')&&(!filters.driver||c.driver));
 if(filters.sort==='priceAsc')a.sort((x,y)=>x.price-y.price); if(filters.sort==='priceDesc')a.sort((x,y)=>y.price-x.price); if(filters.sort==='popular')a.sort((x,y)=>(y.trips||0)-(x.trips||0));
 $('#fleetGrid').innerHTML=a.map(c=>`<article class="carCard"><div class="carPhoto"><img src="${esc(c.image||'assets/car-front.jpg')}" alt="${esc(c.name)}"><button class="favBtn ${favorites.includes(c.id)?'on':''}" data-fav="${c.id}" aria-label="В избранное">♡</button><span class="carStatus ${c.availability}">${c.availability==='free'?'Свободен':c.availability==='busy'?'Занят':'Обслуживание'}</span></div><div class="carBody"><div class="carTitleRow"><div><h3>${esc(c.name)}</h3><p>${esc(c.category||'')} • ${esc(c.gear||'')} • ${c.seats||5} мест</p></div><div class="rating">★ ${c.rating||4.9}</div></div><div class="carPrice"><b>${money(c.price)}</b><span>/ сутки</span></div><div class="carTags"><span>${c.driver?'С водителем':'Самостоятельно'}</span><span>${c.year||''}</span></div><button class="btn primary full carBook" data-car="${c.id}">Забронировать</button></div></article>`).join('');
 $('#fleetEmpty').classList.toggle('hidden',a.length>0);bindFleet();renderActiveFilters();}
function bindFleet(){$$('[data-fav]').forEach(b=>b.onclick=()=>{let id=b.dataset.fav;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem('qb_favorites',JSON.stringify(favorites));renderFleet();renderClientArea()});$$('.carBook').forEach(b=>b.onclick=()=>{location.hash='booking';$('#service').value='Автопрокат';dynamicFields();setTimeout(()=>{const el=$('#bookingCar');if(el)el.value=b.dataset.car},30)});}
if($('#fleetSearch'))$('#fleetSearch').oninput=e=>{filters.search=e.target.value;renderFleet()};
if($('#sortCars'))$('#sortCars').onchange=e=>{filters.sort=e.target.value;renderFleet()};
function openFilters(v){$('#filterDrawer').classList.toggle('open',v)}
$('#openFilters')?.addEventListener('click',()=>openFilters(true)); $$('[data-close-filter]').forEach(x=>x.onclick=()=>openFilters(false));
$('#filterPrice')?.addEventListener('input',e=>$('#filterPriceLabel').textContent='до '+money(e.target.value));
$('#applyFilters')?.addEventListener('click',()=>{filters.category=$('#filterCategory').value;filters.maxPrice=Number($('#filterPrice').value);filters.free=$('#filterFree').checked;filters.driver=$('#filterDriver').checked;openFilters(false);renderFleet()});
$('#resetFilters')?.addEventListener('click',()=>{$('#filterCategory').value='';$('#filterPrice').value=150000;$('#filterPriceLabel').textContent='до 150 000 ₸';$('#filterFree').checked=false;$('#filterDriver').checked=false;filters={...filters,category:'',maxPrice:150000,free:false,driver:false};renderFleet()});
function renderActiveFilters(){const arr=[];if(filters.category)arr.push(filters.category);if(filters.maxPrice<150000)arr.push('до '+money(filters.maxPrice));if(filters.free)arr.push('Свободные');if(filters.driver)arr.push('С водителем');$('#activeFilters').innerHTML=arr.map(x=>`<span>${esc(x)}</span>`).join('');$('#filterCount').textContent=arr.length;}
renderFleet();

$$('.servicePick').forEach(b=>b.onclick=()=>{$('#service').value=b.dataset.service;dynamicFields();location.hash='booking'});
$('#quickFind')?.addEventListener('click',()=>{const s=$('#quickService').value;$('#service').value=s;$('#date').value=$('#quickDate').value;$('#time').value=$('#quickTime').value;dynamicFields();$('#booking').scrollIntoView({behavior:'smooth'})});

function getOrders(){return JSON.parse(localStorage.getItem('qb_orders')||'[]')}
$('#orderForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!settings.ordersEnabled){$('#orderNote').className='note error';$('#orderNote').textContent='Онлайн-заявки временно отключены.';return}
 const carId=$('#bookingCar')?.value||'', car=cars.find(c=>c.id===carId);const extra={endDate:$('#endDate')?.value||'',pickup:$('#pickup')?.value||'',from:$('#fromAddr')?.value||'',to:$('#toAddr')?.value||'',passengers:$('#passengers')?.value||'',payment:$('#paymentMethod').value};
 let order={id:Date.now(),service:$('#service').value,name:$('#name').value,phone:$('#phone').value,date:$('#date').value,time:$('#time').value,comment:$('#comment').value,status:'Новая',amount:car?Number(car.price):0,carId,carName:car?.name||'',extra,created:new Date().toLocaleString('ru-RU')};
 const note=$('#orderNote');note.className='note';note.textContent='Проверяем доступность и создаём заявку…';
 if((location.protocol==='http:'||location.protocol==='https:')){try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});const data=await r.json();if(!r.ok){note.className='note error';note.textContent=data.error||'Не удалось создать заявку.';return}order=data.order||order;await window.qbRefreshFromCloud?.()}catch(err){note.className='note error';note.textContent='Сервер временно недоступен. Попробуйте ещё раз.';return}}else{const a=getOrders();a.unshift(order);localStorage.setItem('qb_orders',JSON.stringify(a))}
 profile={...profile,name:order.name,phone:order.phone};localStorage.setItem('qb_profile',JSON.stringify(profile));note.className='note ok';note.textContent=settings.success;renderClientArea();toast('Заявка добавлена в «Мои поездки»');
 const text=`${settings.company} — новая заявка\nУслуга: ${order.service}\nКлиент: ${order.name}\nТелефон: ${order.phone}\nДата: ${order.date||'—'} ${order.time||''}\n${order.carName?'Авто: '+order.carName+'\n':''}${extra.from?'Откуда: '+extra.from+'\n':''}${extra.to?'Куда: '+extra.to+'\n':''}Оплата: ${extra.payment}`;setTimeout(()=>window.open('https://wa.me/'+settings.whatsapp+'?text='+encodeURIComponent(text),'_blank'),350)});

async function checkBookingAvailability(){const carId=$('#bookingCar')?.value,start=$('#date')?.value,end=$('#endDate')?.value||start;if(!carId||!start||!(location.protocol==='http:'||location.protocol==='https:'))return;try{const r=await fetch(`/api/availability?car_id=${encodeURIComponent(carId)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);const data=await r.json();const note=$('#orderNote');if(data.available){note.className='note ok';note.textContent='Автомобиль свободен на выбранные даты.'}else{note.className='note error';note.textContent='На эти даты автомобиль уже забронирован. Выберите другой автомобиль или даты.'}}catch(e){}}
document.addEventListener('change',e=>{if(['bookingCar','date','endDate'].includes(e.target?.id))checkBookingAvailability()});

function renderClientArea(){const a=getOrders().filter(o=>!profile.phone||o.phone===profile.phone).slice(0,8);$('#clientBookings').innerHTML=a.length?a.map(o=>`<article class="clientOrder"><div><span class="statusPill ${o.status==='Новая'?'new':o.status==='Подтверждена'?'ok':'work'}">${esc(o.status)}</span><h3>${esc(o.carName||o.service)}</h3><p>${esc(o.date||'Дата уточняется')} ${esc(o.time||'')} • ${money(o.amount||0)}</p></div><button class="repeatOrder" data-repeat="${o.id}">Повторить</button></article>`).join(''):`<div class="clientEmpty"><b>Пока нет бронирований</b><span>Оформите первую поездку — она появится здесь.</span><a href="#booking" class="btn primary">Заказать</a></div>`;
 const favCars=cars.filter(c=>favorites.includes(c.id));$('#clientFavorites').innerHTML=favCars.length?favCars.map(c=>`<article class="miniFav"><img src="${esc(c.image)}"><div><b>${esc(c.name)}</b><span>${money(c.price)}/сутки</span></div><button data-unfav="${c.id}">×</button></article>`).join(''):`<div class="clientEmpty"><b>Избранное пусто</b><span>Нажмите ♡ на автомобиле, чтобы сохранить его.</span></div>`;
 const docs=profile.docs||{};$('#clientDocs').innerHTML=`<div class="docsGrid"><article><span>Удостоверение личности</span><b>${docs.id?'Добавлено ✓':'Не добавлено'}</b></article><article><span>Водительское удостоверение</span><b>${docs.license?'Добавлено ✓':'Не добавлено'}</b></article></div><button class="btn secondary" id="editDocsBtn">Добавить / изменить документы</button>`;
 $('#clientNotices').innerHTML=`<div class="noticeList"><article><i>✓</i><div><b>Заявки и статусы</b><span>Здесь будут уведомления о подтверждении брони, назначении водителя и оплате.</span></div></article><article><i>WA</i><div><b>WhatsApp менеджер</b><span>Для демо уведомления дублируются через WhatsApp.</span></div></article></div>`;
 $$('[data-unfav]').forEach(b=>b.onclick=()=>{favorites=favorites.filter(x=>x!==b.dataset.unfav);localStorage.setItem('qb_favorites',JSON.stringify(favorites));renderFleet();renderClientArea()});$('#editDocsBtn')?.addEventListener('click',()=>openProfile());$$('.repeatOrder').forEach(b=>b.onclick=()=>{const o=getOrders().find(x=>x.id==b.dataset.repeat);if(!o)return;$('#service').value=o.service;dynamicFields();$('#name').value=o.name||'';$('#phone').value=o.phone||'';location.hash='booking'});}
$$('[data-client-tab]').forEach(b=>b.onclick=()=>{$$('[data-client-tab]').forEach(x=>x.classList.toggle('on',x===b));$$('.clientTabPage').forEach(x=>x.classList.add('hidden'));$('#client'+b.dataset.clientTab[0].toUpperCase()+b.dataset.clientTab.slice(1)).classList.remove('hidden')});
function openProfile(){$('#profileName').value=profile.name||'';$('#profilePhone').value=profile.phone||'';$('#profileEmail').value=profile.email||'';$('#profileModal').classList.add('open')}
$('#profileBtn')?.addEventListener('click',openProfile); $$('[data-close-profile]').forEach(b=>b.onclick=()=>$('#profileModal').classList.remove('open'));$('#profileModal')?.addEventListener('click',e=>{if(e.target.id==='profileModal')e.currentTarget.classList.remove('open')});
$('#profileForm')?.addEventListener('submit',e=>{e.preventDefault();profile={...profile,name:$('#profileName').value,phone:$('#profilePhone').value,email:$('#profileEmail').value,docs:{id:!!$('#profileIdDoc').files[0]||(profile.docs?.id),license:!!$('#profileLicense').files[0]||(profile.docs?.license)}};localStorage.setItem('qb_profile',JSON.stringify(profile));$('#profileModal').classList.remove('open');renderClientArea();toast('Профиль сохранён')});
renderClientArea();

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
const mobileLinks=$$('.mobileBottomNav a');if(mobileLinks.length){const targets=mobileLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)mobileLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-40% 0px -45% 0px'});targets.forEach(t=>obs.observe(t));}

// ===== FINAL client auth + search/filter UX =====
(()=>{
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 const modal=q('#authModal');
 const isHttp=location.protocol==='http:'||location.protocol==='https:';
 let account=null;
 function openAuth(){modal?.classList.add('open');document.body.style.overflow='hidden';refreshAuthUI()}
 function closeAuth(){modal?.classList.remove('open');if(!q('#filterDrawer')?.classList.contains('open'))document.body.style.overflow=''}
 async function loadAccount(){if(!isHttp)return null;try{const r=await fetch('/api/client/account',{cache:'no-store'});if(!r.ok)return null;const d=await r.json();account=d.user||null;if(account?.favorites){favorites=account.favorites;localStorage.setItem('qb_favorites',JSON.stringify(favorites));renderFleet();}if(account){profile={...profile,name:account.name,phone:account.phone,email:account.email,...(account.profile||{})};localStorage.setItem('qb_profile',JSON.stringify(profile));}return account}catch{return null}}
 function refreshAuthUI(){const logged=!!account;qa('.authPane,.authTabs').forEach(el=>el.classList.toggle('hidden',logged));q('#authLogged')?.classList.toggle('hidden',!logged);if(logged){q('#authName').textContent=account.name||'Клиент';q('#authPhone').textContent=account.phone||account.email||'';q('#authAvatar').textContent=(account.name||'Q').trim().charAt(0).toUpperCase();}const label=logged?(account.name||'Профиль').split(' ')[0]:'Войти';if(q('#clientAuthBtn'))q('#clientAuthBtn').textContent=label;if(q('#mobileAuthBtn'))q('#mobileAuthBtn').textContent=logged?'Профиль':'Войти'}
 q('#clientAuthBtn')?.addEventListener('click',openAuth);q('#mobileAuthBtn')?.addEventListener('click',()=>{if(account){location.hash='account'}else openAuth()});qa('[data-close-auth]').forEach(b=>b.addEventListener('click',closeAuth));modal?.addEventListener('click',e=>{if(e.target===modal)closeAuth()});
 qa('[data-auth-tab]').forEach(b=>b.addEventListener('click',()=>{qa('[data-auth-tab]').forEach(x=>x.classList.toggle('on',x===b));q('#loginForm').classList.toggle('hidden',b.dataset.authTab!=='login');q('#registerForm').classList.toggle('hidden',b.dataset.authTab!=='register')}));
 qa('[data-toggle-pass]').forEach(b=>b.addEventListener('click',()=>{const i=q('#'+b.dataset.togglePass);if(!i)return;i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'◉':'◎'}));
 const pass=q('#regPassword');function rules(){const v=pass?.value||'';const map={length:v.length>=8,upper:/[A-ZА-ЯЁ]/.test(v),lower:/[a-zа-яё]/.test(v),digit:/\d/.test(v)};Object.entries(map).forEach(([k,ok])=>q(`[data-rule="${k}"]`)?.classList.toggle('ok',ok));return Object.values(map).every(Boolean)}pass?.addEventListener('input',rules);
 q('#registerForm')?.addEventListener('submit',async e=>{e.preventDefault();const er=q('#registerError');er.textContent='';const name=q('#regName').value.trim(),phone=q('#regPhone').value.trim(),email=q('#regEmail').value.trim(),password=q('#regPassword').value,p2=q('#regPassword2').value;if(name.length<2){er.textContent='Введите имя.';return}if(phone.replace(/\D/g,'').length<10){er.textContent='Введите корректный номер телефона.';return}if(!rules()){er.textContent='Пароль не соответствует требованиям.';return}if(password!==p2){er.textContent='Пароли не совпадают.';return}if(!isHttp){er.textContent='Регистрация работает после запуска через сервер.';return}try{const r=await fetch('/api/client/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,phone,email,password})});const d=await r.json();if(!r.ok){er.textContent=d.error||'Не удалось зарегистрироваться.';return}account=d.user;profile={...profile,name:account.name,phone:account.phone,email:account.email};localStorage.setItem('qb_profile',JSON.stringify(profile));refreshAuthUI();renderClientArea();toast('Аккаунт создан')}catch{er.textContent='Сервер недоступен.'}});
 q('#loginForm')?.addEventListener('submit',async e=>{e.preventDefault();const er=q('#loginError');er.textContent='';if(!isHttp){er.textContent='Вход работает после запуска через сервер.';return}try{const r=await fetch('/api/client/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:q('#loginIdentity').value.trim(),password:q('#loginPassword').value})});const d=await r.json();if(!r.ok){er.textContent=d.error||'Не удалось войти.';return}account=d.user;await loadAccount();refreshAuthUI();renderClientArea();toast('Вы вошли в аккаунт')}catch{er.textContent='Сервер недоступен.'}});
 q('#clientLogoutBtn')?.addEventListener('click',async()=>{if(isHttp)try{await fetch('/api/client/logout',{method:'POST'})}catch{}account=null;refreshAuthUI();toast('Вы вышли');closeAuth()});
 // Mirror favorites to authenticated profile.
 document.addEventListener('click',e=>{const b=e.target.closest('[data-fav],[data-unfav]');if(!b||!account||!isHttp)return;setTimeout(()=>fetch('/api/client/account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({favorites})}).catch(()=>{}),80)});
 // Persist profile fields server-side for logged client.
 q('#profileForm')?.addEventListener('submit',()=>{if(!account||!isHttp)return;setTimeout(()=>fetch('/api/client/account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:profile.name,email:profile.email,profile:{docs:profile.docs||{}}})}).catch(()=>{}),80)});
 // Top search icon: move to fleet and focus input.
 q('#globalFleetSearch')?.addEventListener('click',()=>{q('#fleet')?.scrollIntoView({behavior:'smooth'});setTimeout(()=>{const inp=q('#fleetSearch');inp?.focus();const wrap=inp?.closest('.fleetSearch');wrap?.classList.add('focusPulse');setTimeout(()=>wrap?.classList.remove('focusPulse'),1000)},450)});
 // Better drawer behaviour: lock page, Escape closes, close after reset on mobile only if desired.
 const drawer=q('#filterDrawer');const oldOpen=window.openFilters; // app scope function isn't global; observe classes instead
 if(drawer){new MutationObserver(()=>{const on=drawer.classList.contains('open');document.body.classList.toggle('drawerOpen',on)}).observe(drawer,{attributes:true,attributeFilter:['class']});}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(drawer?.classList.contains('open')){drawer.classList.remove('open');document.body.classList.remove('drawerOpen')}if(modal?.classList.contains('open'))closeAuth();q('#profileModal')?.classList.remove('open');q('#v8Wizard')?.classList.remove('open');q('#v8CarModal')?.classList.remove('open')}});
 loadAccount().then(()=>refreshAuthUI());
})();
(()=>{
 const q=s=>document.querySelector(s);
 q('#mobileSearchNav')?.addEventListener('click',()=>{q('#fleet')?.scrollIntoView({behavior:'smooth'});setTimeout(()=>{q('#openFilters')?.click()},420)});
 q('#mobileFavoritesNav')?.addEventListener('click',()=>{q('#account')?.scrollIntoView({behavior:'smooth'});setTimeout(()=>{q('[data-client-tab="favorites"]')?.click()},350)});
})();

(()=>{
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const STORE='qb_client_session_v14', USERS='qb_client_users_v14';
 const api=location.protocol==='http:'||location.protocol==='https:';
 const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
 const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const session=()=>read(STORE,null);
 const users=()=>read(USERS,[]);
 function current(){const s=session();if(!s)return null;return users().find(u=>u.id===s.id)||s.user||null}
 function setCurrent(u){write(STORE,{id:u.id,user:u});window.dispatchEvent(new CustomEvent('qb-auth-change',{detail:u}))}
 function logoutLocal(){localStorage.removeItem(STORE);window.dispatchEvent(new CustomEvent('qb-auth-change',{detail:null}))}
 async function me(){if(api){try{const r=await fetch('/api/client/account',{cache:'no-store'});if(r.ok){const d=await r.json();const u={id:d.user.phone,...d.user};setCurrent(u);return u}}catch{}}return current()}
 async function login(identity,password){if(api){try{const r=await fetch('/api/client/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:identity,password})});const d=await r.json();if(r.ok){const u={id:d.user.phone,...d.user};setCurrent(u);return {ok:true,user:u}}; if(r.status!==404)return {ok:false,error:d.error||'Не удалось войти'}}catch{}}
  const key=identity.trim().toLowerCase();const u=users().find(x=>x.phone.replace(/\D/g,'')===key.replace(/\D/g,'')||x.email?.toLowerCase()===key);if(!u||u.password!==password)return {ok:false,error:'Неверный телефон/e-mail или пароль'};setCurrent(u);return {ok:true,user:u};
 }
 async function register(data){if(api){try{const r=await fetch('/api/client/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(r.ok){const u={id:d.user.phone,...d.user};setCurrent(u);return {ok:true,user:u}}; if(r.status!==404)return {ok:false,error:d.error||'Не удалось зарегистрироваться'}}catch{}}
  const list=users(), digits=data.phone.replace(/\D/g,'');if(list.some(u=>u.phone.replace(/\D/g,'')===digits))return {ok:false,error:'Этот номер уже зарегистрирован'};if(data.email&&list.some(u=>u.email?.toLowerCase()===data.email.toLowerCase()))return {ok:false,error:'Этот e-mail уже зарегистрирован'};const u={id:'u'+Date.now(),name:data.name,phone:data.phone,email:data.email,password:data.password,createdAt:new Date().toISOString(),profile:{},favorites:[]};list.push(u);write(USERS,list);setCurrent(u);return {ok:true,user:u};
 }
 async function logout(){if(api)try{await fetch('/api/client/logout',{method:'POST'})}catch{}logoutLocal()}
 async function updateProfile(patch){let u=current();if(!u)return null;u={...u,...patch,profile:{...(u.profile||{}),...(patch.profile||{})}};const list=users(),i=list.findIndex(x=>x.id===u.id);if(i>=0){list[i]=u;write(USERS,list)}setCurrent(u);if(api)try{await fetch('/api/client/account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)})}catch{}return u}
 async function orders(){const u=await me();if(!u)return[];if(api)try{const r=await fetch('/api/client/orders',{cache:'no-store'});if(r.ok)return await r.json()}catch{}const all=read('qb_orders',[]),p=u.phone.replace(/\D/g,'');return all.filter(o=>(o.phone||'').replace(/\D/g,'')===p)}
 async function saveOrder(o){if(api)try{const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});if(r.ok)return await r.json()}catch{}const a=read('qb_orders',[]);a.unshift(o);write('qb_orders',a);return o}
 window.QBPortal={me,login,register,logout,updateProfile,orders,saveOrder,current};
 async function paint(){const u=await me();$$('.login-button,[data-account-link]').forEach(el=>{if(u){el.textContent=(u.name||'Профиль').split(' ')[0];el.classList.add('is-user')}else{el.textContent=document.documentElement.lang==='kz'?'Кіру':'Войти';el.classList.remove('is-user')}})}
 window.addEventListener('qb-auth-change',paint);document.addEventListener('DOMContentLoaded',paint);
})();

(()=>{
 const hero=document.querySelector('.hero'); if(!hero)return;
 hero.classList.add('hasMobilityHub');
 const old=hero.querySelector('.premiumSearch'); if(old) old.style.display='none';
 const today=new Date(), tomorrow=new Date(Date.now()+86400000); const d=x=>x.toISOString().slice(0,10);
 hero.insertAdjacentHTML('beforeend',`<div class="mobilityHub" aria-label="Быстрый заказ QAZAQ BOSS">
  <div class="mobilityTabs">
   <button class="mobilityTab on" data-mobility="rent"><i>▣</i>Автопрокат</button>
   <button class="mobilityTab" data-mobility="taxi"><i>◆</i>Заказ такси</button>
   <button class="mobilityTab" data-mobility="sober"><i>♙</i>Трезвый водитель</button>
  </div>
  <div class="mobilityPane on" data-pane="rent"><div class="mobilityForm">
   <label><small>Город / получение</small><select id="mRentPlace"><option>Атырау — офис</option><option>Аэропорт Атырау</option><option>Доставка по адресу</option></select></label>
   <label><small>Дата получения</small><input id="mRentStart" type="date" value="${d(today)}"></label>
   <label><small>Дата возврата</small><input id="mRentEnd" type="date" value="${d(tomorrow)}"></label>
   <label><small>Время</small><input id="mRentTime" type="time" value="10:00"></label>
   <button class="btn primary" id="mRentGo">Найти авто →</button></div><div class="mobilityHint"><b>●</b> Проверим свободные автомобили на выбранные даты</div></div>
  <div class="mobilityPane" data-pane="taxi"><div class="mobilityForm">
   <label><small>Откуда</small><input id="mTaxiFrom" placeholder="Адрес подачи"></label>
   <label><small>Куда</small><input id="mTaxiTo" placeholder="Адрес назначения"></label>
   <label><small>Дата</small><input id="mTaxiDate" type="date" value="${d(today)}"></label>
   <label><small>Время</small><input id="mTaxiTime" type="time"></label>
   <button class="btn primary" id="mTaxiGo">Заказать такси →</button></div><div class="mobilityHint"><b>24/7</b> Заявка сразу поступит диспетчеру</div></div>
  <div class="mobilityPane" data-pane="sober"><div class="mobilityForm">
   <label><small>Где забрать вас и авто</small><input id="mSoberFrom" placeholder="Адрес"></label>
   <label><small>Куда доставить</small><input id="mSoberTo" placeholder="Адрес назначения"></label>
   <label><small>Дата</small><input id="mSoberDate" type="date" value="${d(today)}"></label>
   <label><small>Время</small><input id="mSoberTime" type="time"></label>
   <button class="btn primary" id="mSoberGo">Вызвать водителя →</button></div><div class="mobilityHint"><b>QAZAQ BOSS</b> Водитель доставит вас на вашем автомобиле</div></div>
 </div>`);
 const tabs=[...document.querySelectorAll('.mobilityTab')], panes=[...document.querySelectorAll('.mobilityPane')];
 tabs.forEach(b=>b.onclick=()=>{tabs.forEach(x=>x.classList.toggle('on',x===b));panes.forEach(p=>p.classList.toggle('on',p.dataset.pane===b.dataset.mobility))});
 function setOrder(service,date,time,from,to){const s=document.querySelector('#service');if(s){s.value=service;s.dispatchEvent(new Event('change',{bubbles:true}))}const dt=document.querySelector('#date'),tm=document.querySelector('#time');if(dt&&date)dt.value=date;if(tm&&time)tm.value=time;setTimeout(()=>{const f=document.querySelector('#fromAddr'),t=document.querySelector('#toAddr');if(f&&from)f.value=from;if(t&&to)t.value=to},0);location.hash='booking'}
 document.querySelector('#mRentGo').onclick=()=>{const s=document.querySelector('#v8HeroStart'),e=document.querySelector('#v8HeroEnd'),t=document.querySelector('#v8HeroTime'),p=document.querySelector('#wizPlace');if(s)s.value=document.querySelector('#mRentStart').value;if(e)e.value=document.querySelector('#mRentEnd').value;if(t)t.value=document.querySelector('#mRentTime').value;document.querySelector('#v8OpenWizard')?.click();setTimeout(()=>{if(p)p.value=document.querySelector('#mRentPlace').value},0)};
 document.querySelector('#mTaxiGo').onclick=()=>setOrder('Такси',document.querySelector('#mTaxiDate').value,document.querySelector('#mTaxiTime').value,document.querySelector('#mTaxiFrom').value,document.querySelector('#mTaxiTo').value);
 document.querySelector('#mSoberGo').onclick=()=>setOrder('Трезвый водитель',document.querySelector('#mSoberDate').value,document.querySelector('#mSoberTime').value,document.querySelector('#mSoberFrom').value,document.querySelector('#mSoberTo').value);
 document.querySelectorAll('.servicePick').forEach(btn=>btn.addEventListener('click',()=>{const map={'Автопрокат':'rent','Такси':'taxi','Трезвый водитель':'sober'};const key=map[btn.dataset.service];if(key){document.querySelector(`.mobilityTab[data-mobility="${key}"]`)?.click();hero.scrollIntoView({behavior:'smooth'})}}));
})();

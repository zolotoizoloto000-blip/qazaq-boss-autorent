(()=>{
  const heroService=document.querySelector('#v8HeroService');
  if(heroService){
    const first=heroService.closest('label');
    const sm=first?.querySelector('small');
    if(sm) sm.textContent='Атырау';
    heroService.innerHTML='<option>Выберите услугу</option><option>Автопрокат</option><option>Такси</option><option>Трезвый водитель</option><option>Аренда с водителем</option>';
  }
  const start=document.querySelector('#v8HeroStart')?.closest('label')?.querySelector('small'); if(start) start.textContent='Дата получения';
  const end=document.querySelector('#v8HeroEnd')?.closest('label')?.querySelector('small'); if(end) end.textContent='Дата возврата';
  const time=document.querySelector('#v8HeroTime')?.closest('label')?.querySelector('small'); if(time) time.textContent='Время';
  const btn=document.querySelector('#v8HeroGo'); if(btn) btn.textContent='Найти авто →';
  const trust=[['Премиум автопарк','Новые и проверенные авто'],['Поддержка 24/7','Всегда на связи'],['Доставка по городу','Удобно и быстро'],['Прозрачные цены','Без скрытых платежей']];
  document.querySelectorAll('.trustStrip article').forEach((el,i)=>{if(!trust[i])return;el.querySelector('b').textContent=trust[i][0];el.querySelector('span').textContent=trust[i][1]});
})();

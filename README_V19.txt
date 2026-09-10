QAZAQ BOSS AUTORENT — V19 CLIENT SERVICES

Что изменено:
- Возвращены и усилены 3 главных услуги клиента: Автопрокат / Заказ такси / Трезвый водитель.
- На главной каждая услуга — отдельная рабочая вкладка с формой.
- Заявки Такси и Трезвый водитель отправляются в /api/orders и появляются в CRM.
- Автопрокат ведёт в автопарк с выбранными датами/автомобилем.
- Рабочий RU/KZ переключатель с сохранением языка в localStorage.
- Премиальные SVG-иконки, hover/press эффекты, reveal-анимации и плавающая поддержка.
- Адаптив: desktop / tablet / mobile, нижнее мобильное меню.
- WhatsApp / Instagram / 2GIS / FAQ / support сохраняются через настройки админки.
- Админка сохраняет существующую CRM и добавление авто с несколькими фото; добавлен drag&drop в блок фото.
- Старых фото Land Cruiser в этой сборке нет.
- Версия API health: 19.0-client-services.

Render:
Root Directory: qazaq_v10
Build Command: pip install -r requirements.txt
Start Command: gunicorn server:app
После замены файлов используйте Clear build cache & deploy.

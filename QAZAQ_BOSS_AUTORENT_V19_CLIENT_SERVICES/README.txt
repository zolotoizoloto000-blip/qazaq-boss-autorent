QAZAQ BOSS AUTORENT — V18 CLEAN

Чистая версия без накопленных v7/v8/v9/v10/V13-V17 JS/CSS и .bak.

Render:
Root Directory: qazaq_v10
Build Command: pip install -r requirements.txt
Start Command: gunicorn server:app

Админ: /admin-login
Логин по умолчанию: admin
Пароль по умолчанию в server.py создаётся только при первом старте: QazaqBoss2026!
Для продакшена обязательно задать ADMIN_PASSWORD и SECRET_KEY в Render Environment.

Функции:
- отдельные страницы, без hash-SPA;
- вход -> ссылка на регистрацию -> личный кабинет;
- бронирования через API;
- адаптив для desktop/tablet/mobile;
- админка с автопарком, фото сверху, загрузка нескольких фото, обложка, удаление фото;
- заказы, клиенты, услуги, водители, финансы, ТО, календарь, аналитика, уведомления, тарифы, команда, настройки;
- WhatsApp, Instagram, 2GIS, телефон, FAQ из настроек;
- старые фото Land Cruiser удалены.

Важно: точных фотографий Jaguar/Range Rover из объявлений нет. Вместо чужого Land Cruiser стоят нейтральные фирменные SVG-заглушки. Реальные фото загружаются через админку.

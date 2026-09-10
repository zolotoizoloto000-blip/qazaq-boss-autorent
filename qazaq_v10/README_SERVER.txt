QAZAQ BOSS AUTORENT — PRO V4 SERVER

Что изменилось:
• Flask backend + SQLite database
• единое состояние сайта/CRM для разных устройств
• REST API: /api/state, /api/orders, /api/sync, /api/health, /api/audit
• серверная синхронизация автомобилей, услуг, заказов, водителей, сотрудников и настроек
• PWA и мобильная нижняя навигация сохранены
• подготовка к Render: requirements.txt, Procfile, render.yaml
• страница входа /admin-login

Локальный запуск:
1. python -m venv .venv
2. .venv/bin/pip install -r requirements.txt  (Windows: .venv\\Scripts\\pip)
3. python server.py
4. открыть http://127.0.0.1:5000
5. CRM: http://127.0.0.1:5000/admin.html

Демо-пароль для /admin-login:
QazaqBoss2026!
Для продакшена ОБЯЗАТЕЛЬНО задайте ADMIN_PASSWORD через переменную окружения.
Для принудительной защиты admin.html задайте REQUIRE_ADMIN=1.

Важно:
SQLite подходит для прототипа/малого запуска. Для боевого масштабирования на Render лучше PostgreSQL, а фотографии вынести в S3/Cloudinary. Платёжные ключи, SMS API и карты подключаются только после получения реальных аккаунтов/ключей клиента.

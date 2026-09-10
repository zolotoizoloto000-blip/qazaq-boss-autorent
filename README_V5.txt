QAZAQ BOSS AUTORENT PRO V5 — server/PWA foundation

Что добавлено поверх V4:
1. PostgreSQL-ready backend через Flask-SQLAlchemy (SQLite остаётся локальным fallback).
2. Боевой вход в админку включён по умолчанию (REQUIRE_ADMIN=1).
3. Админ-пользователь хранится с хешированным паролем.
4. Проверка пересечения дат и блокировка двойного бронирования одного авто.
5. API проверки доступности: /api/availability.
6. PATCH API для изменения заказа с повторной проверкой занятости.
7. Загрузка изображений из админки/API: /api/upload (локальное хранилище; для production лучше S3/Cloudinary).
8. Журнал действий с actor/action/entity.
9. Клиентская авторизация по одноразовому коду: API готов, реальный SMS-провайдер подключается отдельно.
10. Render blueprint создаёт web service + PostgreSQL.

Запуск локально:
  pip install -r requirements.txt
  set DEV_SMS=1              (Windows, только для теста SMS-кода)
  set ADMIN_PASSWORD=ВашПароль
  python server.py

Linux/macOS:
  export DEV_SMS=1
  export ADMIN_PASSWORD='ВашПароль'
  python server.py

Открыть:
  Клиент: http://127.0.0.1:5000/
  Админ:  http://127.0.0.1:5000/admin-login

Логин по умолчанию: admin
Пароль по умолчанию только для локального демо: QazaqBoss2026!
На production обязательно задайте ADMIN_PASSWORD и SECRET_KEY через environment variables.

Важно:
- Реальные SMS, Kaspi/эквайринг, карты/геолокация и push требуют внешних провайдеров и их ключей.
- Локальные uploads на бесплатном Render могут быть недолговечны; для production подключите S3/Cloudinary.
- PWA уже работает как устанавливаемый web-app, но отдельное нативное приложение iOS/Android — отдельная сборка.

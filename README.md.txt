# Система бронирования переговорных комнат

Веб-сервис для автоматизации учета сотрудников, переговорных комнат и распределения временных слотов бронирования.

## Технологический стек
- **Backend**: Python 3.11 (`http.server`, `pg8000.native`)
- **Database**: PostgreSQL 16
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS, Fetch API)
- **API Spec**: OpenAPI 3.0

## Быстрый запуск

1. Развернуть БД PostgreSQL и выполнить скрипт `docs/database_schema.sql`.
2. Запустить бэкенд: `python backend/server.py`.
3. Открыть `frontend/public/index.html` в браузере.
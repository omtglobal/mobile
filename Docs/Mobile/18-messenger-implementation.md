# 18. Мессенджер — что реализовано (MVP / Phase 6)

Краткое описание внедрённого функционала: UI-скелет в мобильном приложении, модуль **Messaging** в Laravel, сервис **realtime** на Go, мост с тикетами Support и инфраструктура Redis / Horizon.

Полное видение продукта по-прежнему в [15-messenger-spec.md](15-messenger-spec.md); этот документ фиксирует **фактическое состояние кода**.

---

## 1. Мобильное приложение (`apps/mobile`)

### 1.1 Навигация и экраны

- Третья страница горизонтального **PagerView** (Видео · Товары · **Мессенджер**) вместо плейсхолдера «Coming soon» подключает отдельный стек навигации: [`MessengerNavigator`](../../apps/mobile/src/navigation/MessengerNavigator.tsx) (независимый `NavigationContainer` + Native Stack).
- Экраны в `src/screens/messenger/`:
  - список диалогов (стиль списка чатов);
  - чат с пузырьками, разделителями дат, индикатором «печатает», вводом;
  - контакты и поиск контактов.
- Мобильный мессенджер использует **REST + TanStack Query** ([`messaging.ts`](../../apps/mobile/src/lib/api/messaging.ts), [`useMessaging.ts`](../../apps/mobile/src/lib/hooks/useMessaging.ts)) и WebSocket для `message.new`.

### 1.2 Компоненты

Каталог [`src/components/messenger/`](../../apps/mobile/src/components/messenger/): бейджи типа аккаунта (покупатель / продавец / поддержка), строки диалога и контакта, пузыри сообщений (текст, изображение, видео-превью, карточка товара, системное), поле ввода, лист «поделиться в чат» с экрана товара.

### 1.3 Типы и локализация

- [`src/types/messaging.ts`](../../apps/mobile/src/types/messaging.ts) — доменные типы переписок и сообщений.
- Ключи `messenger.*` в [`en.json`](../../apps/mobile/src/i18n/locales/en.json) и [`ru.json`](../../apps/mobile/src/i18n/locales/ru.json).

### 1.4 Realtime (клиент)

- [`WebSocketManager`](../../apps/mobile/src/lib/ws/WebSocketManager.ts) — подключение с JWT, переподключение с backoff, отправка событий typing.
- [`useMessagingRealtime`](../../apps/mobile/src/lib/hooks/useMessagingRealtime.ts) + Zustand [`messaging` store](../../apps/mobile/src/lib/stores/messaging.ts).
- Базовый URL WebSocket: [`WS_BASE_URL`](../../apps/mobile/src/constants/config.ts), переопределение **`EXPO_PUBLIC_WS_BASE_URL`** (на физическом устройстве — обычно IP машины с Docker, порт **8083**).

### 1.5 Интеграция с товарами

- На экране товара кнопка «отправить в чат» открывает bottom sheet с недавними диалогами ([`ShareToChatSheet`](../../apps/mobile/src/components/messenger/ShareToChatSheet.tsx)).

---

## 2. Бэкенд — модуль `modules/Messaging`

### 2.1 Таблицы

Префикс таблиц `messenger_*`: контакты, диалоги, участники, сообщения, вложения. У пользователей добавлено поле **`messenger_searchable`** (по умолчанию `true`) для приватности в поиске.

### 2.2 API (JWT, префикс клиента)

Все под `auth:api`:

| Метод | Путь |
|--------|------|
| GET/POST | `/api/v1/client/messaging/conversations` |
| GET | `/api/v1/client/messaging/conversations/{id}` |
| POST | `/api/v1/client/messaging/conversations/{id}/read` |
| GET/POST | `/api/v1/client/messaging/conversations/{id}/messages` |
| GET | `/api/v1/client/messaging/contacts` |
| GET | `/api/v1/client/messaging/contacts/search?q=` |
| POST | `/api/v1/client/messaging/contacts` |
| POST | `/api/v1/client/messaging/contacts/{id}/accept` |
| POST | `/api/v1/client/messaging/contacts/{id}/block` |
| DELETE | `/api/v1/client/messaging/contacts/{id}` |

Поиск пользователей: email (точное совпадение без регистра), телефон (подстрока `ilike`), имя (от 3 символов). В ответе — маски email/телефона, тип аккаунта (`buyer` / `seller` / `support` по роли `support` и `account_type`).

### 2.3 Доставка в Redis

После сохранения сообщения Laravel пушит JSON в список **`messaging:deliver`** (соединение Redis **`messaging`** в [`config/database.php`](../../config/database.php) — **без префикса** ключей, чтобы тот же Redis читал Go-сервис).

Очередь Horizon **`messaging-status`**: джоба [`DrainMessagingStatusJob`](../../modules/Messaging/Jobs/DrainMessagingStatusJob.php) обрабатывает список **`messaging:status`** (обновление статусов сообщений в БД). Супервизор задан в [`config/horizon.php`](../../config/horizon.php).

Конфиг: [`config/messaging.php`](../../config/messaging.php).

---

## 3. Сервис `services/realtime-service` (Go)

- WebSocket: **`/ws?token=<JWT>`** (или заголовок `Authorization: Bearer`).
- Фоновый цикл: **`BLPOP`** по ключу `messaging:deliver`, рассылка подключённым клиентам по `recipient_user_ids`.
- Health: **`GET /health`**.
- Docker: сервис **`realtime-service`** в [`docker-compose.yml`](../../docker-compose.yml), порт **8083**, переменные **`JWT_SECRET`**, **`REDIS_URL`**.

Уточнение: подтверждение доставки (`delivered`) и запись в `messaging:status` из Go в текущей версии можно доработать отдельно; задел — очередь статусов и джоба в Laravel.

---

## 4. Мост с Support (тикеты)

- При создании тикета и при новых сообщениях тикета слушатели синхронизируют данные с диалогом мессенджера (`ticket_id` на диалоге).
- Ответ покупателя из мессенджера в диалоге, привязанном к тикету, дублируется в **`ticket_messages`** без повторной генерации события `MessageAdded` (флаг в [`TicketService::addMessage`](../../modules/Support/Application/Services/TicketService.php)).
- Разовая команда для старых тикетов: **`php artisan messaging:bridge-existing-tickets`**.

---

## 5. Что запускать и мигрировать

```bash
make migrate   # в т.ч. миграции Messaging и поле users.messenger_searchable
make seed      # включает MessengerSeeder (6 диалогов, все типы сообщений, контакты)
```

Только мессенджер-сидер отдельно:

```bash
php artisan db:seed --class='Modules\Messaging\Database\Seeders\MessengerSeeder'
```

После миграций при необходимости:

```bash
php artisan messaging:bridge-existing-tickets
```

Для полного стека в Docker: поднять **`app`**, **`redis`**, **`horizon`** (в т.ч. очередь `messaging-status`), **`realtime-service`**.

### 5.1 Данные сидера

`MessengerSeeder` создаёт:

| Что | Кол-во | Описание |
|-----|--------|----------|
| Диалоги | 6 | buyer ↔ seller1, buyer ↔ seller2, buyer ↔ support, seller3 → buyer, buyer ↔ buyer2, buyer ↔ seller4 (pinned) |
| Сообщения | ~39 | text, image, product (карточка товара), system |
| Контакты | 10 | двусторонние accepted-контакты между buyer и 5 собеседниками |
| Закреплённые | 1 | диалог buyer ↔ seller4 закреплён для buyer |

Сидер идемпотентен — при повторном запуске пропускает, если данные уже есть.

---

## 6. Дальнейшие шаги (не в рамках текущего скелета)

- Доработка Go: запись `messaging:status`, presence/typing через Redis, несколько инстансов (Pub/Sub).
- Push (FCM/APNs) для офлайн-получателей.
- Расширения из спеки 15: круги, голос, E2E и т.д.

---

## См. также

- [15-messenger-spec.md](15-messenger-spec.md) — продуктовая спецификация.
- [01-environment-setup.md](01-environment-setup.md) — окружение и запуск на симуляторе/устройстве.
- [README-dev.md](../../README-dev.md) — краткий запуск мобильного приложения и остальных частей стека.

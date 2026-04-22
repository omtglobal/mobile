# 15. Мессенджер — Детальная спецификация

Встроенный мессенджер с Кругами друзей, интеграцией маркетплейса и видеоконтента.

> **Реализация:** Phase 6. Архитектурный фундамент закладывается в Phase 0.

---

## 1. Концепция

### Философия

Мессенджер Ninhao — это **социальное пространство вокруг покупок**. Не конкурент Telegram по функционалу ботов и каналов, а инструмент для общения с друзьями в контексте товаров, видео и совместных покупок.

### Принципы

1. **Простота** — не перегружать фичами. Основа: текст, голосовые, медиа, продукты
2. **Приватность** — E2E шифрование всех чатов, никакой рекламы в чатах
3. **Commerce-native** — продукты, заказы, видео — first-class citizens в чате
4. **Круги, а не группы** — интимные пространства для близких людей, не каналы на 100k

---

## 2. Экраны и навигация

### 2.1 Структура

```
(messenger)/
  _layout.tsx         # Stack navigator
  index.tsx           # Список диалогов (ConversationList)
  chat/[id].tsx       # Экран чата (ChatScreen)
  circle/
    [id].tsx          # Круг друзей (CircleScreen)
    new.tsx           # Создание круга
    settings.tsx      # Настройки круга
  contacts.tsx        # Список контактов
  contacts/
    search.tsx        # Поиск нового контакта
    add.tsx           # Добавление контакта
```

### 2.2 Список диалогов (ConversationListScreen)

```
┌─────────────────────────────────┐
│  Чаты                    ✏  🔍 │  ← Новый чат, поиск
├─────────────────────────────────┤
│                                 │
│  ┌─ Закреплённые ─────────────┐│
│  │ 👩 Anna                     ││
│  │ Смотри какой классный...  3м││
│  │                             ││
│  │ 👥 Круг: Семья         (3) ││
│  │ 📦 Мама: Заказала чехол  1ч││
│  └─────────────────────────────┘│
│                                 │
│  👤 Mike                       │
│  🎤 Голосовое сообщение   12:30│  ← Иконка типа сообщения
│                                 │
│  👤 John                       │
│  🛍 Отправил товар: iPhone...  │  ← Превью товара
│                                 │
│  👥 Круг: Коллеги         (8) │
│  🎬 Alex поделился видео    вч │  ← Превью видео
│                                 │
│  👤 Sarah                  (2) │  ← 2 непрочитанных
│  Привет! Как дела?         пн  │
│                                 │
└─────────────────────────────────┘
```

**Поведение:**
- Сортировка по дате последнего сообщения (сверху — свежие)
- Закреплённые диалоги вверху (long press → "Закрепить")
- Unread badge (число) справа
- Swipe left → Архив / Mute / Удалить
- Pull-to-refresh
- FAB (floating action button) → новый чат / новый Круг
- Превью последнего сообщения с типизированными иконками

### 2.3 Экран чата (ChatScreen)

```
┌─────────────────────────────────┐
│ ← 👤 Anna           📞  ⋮     │  ← Header: avatar, name, call, menu
│    В сети                       │  ← Online status
├─────────────────────────────────┤
│                                 │
│         10 марта 2026           │  ← Date divider
│                                 │
│  ┌────────────────────┐        │
│  │ Привет! Смотри     │        │  ← Incoming message (left)
│  │ что нашла:         │        │
│  │ ┌────────────────┐ │        │
│  │ │ 📷 iPhone 16   │ │        │  ← Product preview card
│  │ │ $999           │ │        │
│  │ │ ★ 4.8 [→]     │ │        │
│  │ └────────────────┘ │        │
│  └────────────────────┘  12:30 │
│                                 │
│        ┌────────────────────┐  │
│        │ О, крутой! 😍      │  │  ← Outgoing message (right)
│        └────────────────────┘  │
│                           12:31│
│                            ✓✓  │  ← Read receipts
│                                 │
│  ┌────────────────────┐        │
│  │ 🎤 0:15  ▶────────│        │  ← Voice message
│  │ "Давай закажем..." │        │  ← AI transcription
│  └────────────────────┘  12:32 │
│                                 │
│                 Anna печатает...│  ← Typing indicator
│                                 │
├─────────────────────────────────┤
│ ＋  📷  🎤  [Сообщение...   ] 📨│  ← Input bar
└─────────────────────────────────┘
```

**Input Bar — кнопки:**

| Кнопка | Действие |
|--------|---------|
| ＋ | Расширенное меню: файл, локация, контакт, товар |
| 📷 | Камера / галерея (фото/видео) |
| 🎤 | Зажать → запись голосового. Отпустить → отправить. Свайп влево → отмена |
| 📨 | Отправить текст |

**Типы сообщений:**

| Тип | Отображение |
|-----|------------|
| `text` | Текст с поддержкой emoji, ссылок (linkify) |
| `image` | Фото (тап → fullscreen gallery) |
| `video` | Видео (inline player, тап → fullscreen) |
| `voice` | Waveform + duration + AI транскрипция |
| `file` | Иконка типа файла + имя + размер |
| `product` | Rich card: фото, название, цена, рейтинг, кнопка "Перейти" |
| `video_share` | Превью видео из ленты + кнопка "Смотреть" |
| `sticker` | Animated sticker (Lottie) |
| `order_update` | Системное: "Заказ #xxx отправлен" (от бота) |

### 2.4 Отправка товара в чат

Из экрана товара (ProductDetail):

```
[Поделиться] → Bottom Sheet:
  ┌─────────────────────────────┐
  │  Отправить в чат            │
  ├─────────────────────────────┤
  │  🔍 Поиск контакта          │
  │                             │
  │  Недавние                   │
  │  👤 Anna                    │
  │  👤 Mike                    │
  │  👥 Круг: Семья             │
  │                             │
  │  [Нативный Share Sheet]     │  ← Fallback: deep link
  └─────────────────────────────┘
```

При выборе контакта → отправить message type `product` с `product_id`. Получатель видит rich preview.

---

## 3. Круги друзей

### 3.1 Концепция

**Круг друзей** — это intimate group с уникальными commerce-фичами:

| Обычная группа (WhatsApp) | Круг друзей (Ninhao) |
|--------------------------|---------------------|
| Просто чат | Чат + общий wishlist |
| До 1024 участников | До 50 (intimate) |
| Нет контекста покупок | Совместная корзина |
| Рассылка спама | Фокус на близких людей |
| Администрирование | Простое управление |

### 3.2 Экран Круга

```
┌─────────────────────────────────┐
│ ← 👥 Семья            ⚙  👥  │
├─── Tabs ────────────────────────┤
│  [Чат] [Wishlist] [Корзина]    │
├─────────────────────────────────┤
│                                 │
│  (Tab: Чат — обычный чат)      │
│                                 │
│  (Tab: Wishlist)               │
│  ┌─────────┐ ┌─────────┐     │
│  │ 📷      │ │ 📷      │     │
│  │ iPhone  │ │ Наушники │     │
│  │ $999    │ │ $49      │     │
│  │ + Мама  │ │ + Я      │     │  ← Кто добавил
│  └─────────┘ └─────────┘     │
│                                 │
│  (Tab: Корзина)                │
│  Совместная корзина семьи      │
│  ☑ iPhone × 1 (Мама)  $999   │
│  ☑ Наушники × 2 (Я)   $98    │
│  ─────────────────────         │
│  Итого:               $1097   │
│  [ Оформить совместный заказ ] │
│                                 │
└─────────────────────────────────┘
```

### 3.3 Фичи Круга

| Фича | Описание |
|------|---------|
| **Общий Wishlist** | Участники добавляют товары; все видят. Кнопка "Я куплю это" |
| **Совместная корзина** | Общая корзина, каждый добавляет свои товары, один оформляет |
| **Групповая скидка** (Phase 8) | При покупке 3+ одинаковых товаров — автоскидка |
| **Голосования** | "Какой цвет лучше?" — poll с вариантами (фото товаров) |
| **Совместный просмотр** (Phase 8) | Watch party: смотреть видео из ленты вместе |

---

## 4. Контакты

### 4.1 Поиск контактов

```
┌─────────────────────────────────┐
│ ← Найти контакт                │
├─────────────────────────────────┤
│                                 │
│ [🔍 Email или телефон...     ] │
│                                 │
│ Результат:                     │
│ ┌──────────────────────────┐   │
│ │ 👤 Anna Smith            │   │
│ │    anna@email.com        │   │
│ │              [+ Добавить]│   │
│ └──────────────────────────┘   │
│                                 │
│ Не нашли?                      │
│ [ Пригласить по ссылке ]       │  ← Deep link приглашения
│                                 │
└─────────────────────────────────┘
```

**Поиск:** по email (exact match) или по телефону (exact match). Не показывать в поиске пользователей, которые уже в контактах.

### 4.2 Privacy

- Пользователь может включить "Не показывать меня в поиске"
- Запросы в контакты: нужно подтверждение (как в Facebook)
- Блокировка: заблокированный не может писать и найти в поиске

---

## 5. Голосовые сообщения

### 5.1 Запись

```
Зажать 🎤 → Запись
  │
  ├── Отпустить → Отправить
  ├── Свайп влево → Отменить (❌ анимация)
  └── Свайп вверх → Зафиксировать (hands-free запись)
      └── Кнопка "Стоп" → Отправить или Отменить
```

### 5.2 Воспроизведение

```
┌───────────────────────────────┐
│ 🎤 ▶  ████████░░░░  0:15     │
│ "Привет! Давай закажем..."   │  ← AI транскрипция (collapsible)
└───────────────────────────────┘
```

- Waveform visualization
- Скорость: 1×, 1.5×, 2× (тап на скорость)
- AI-транскрипция: выполняется на сервере после отправки, обновляется через WebSocket
- Proximity sensor: переключение на earpiece при поднесении к уху

---

## 6. Стикеры

### 6.1 Пакеты

| Пакет | Описание |
|-------|---------|
| **Ninhao Basic** | Базовый набор (встроенный, бесплатный) |
| **Shopping Moods** | Реакции на товары: "Want!", "Too expensive", "Must have" |
| **Marketplace** | Анимированные: коробка, доставка, распродажа |
| **Seasonal** | Праздничные (Новый год, 8 марта, Singles Day) |
| **User Created** (Phase 8) | Пользователи создают свои пакеты |

### 6.2 Picker

```
┌─────────────────────────────────┐
│ 😀  🛍  📦  🎉  +              │  ← Tabs: Emoji, Стикеры по пакетам, +Ещё
├─────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ │ 😊 │ │ 😂 │ │ 🎉 │ │ 🛒 │  │
│ └────┘ └────┘ └────┘ └────┘  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│ │ 📦 │ │ 💰 │ │ ⭐ │ │ 🔥 │  │
│ └────┘ └────┘ └────┘ └────┘  │
└─────────────────────────────────┘
```

---

## 7. Real-time архитектура

### 7.1 WebSocket protocol

```
Клиент ──── WebSocket ────→ Realtime Service (Go) ──→ Redis PubSub ──→ Другие клиенты
                                    │
                                    └──→ PostgreSQL (persist)
```

### 7.2 События

| Событие | Направление | Описание |
|---------|------------|---------|
| `message.new` | Server → Client | Новое сообщение |
| `message.read` | Client → Server → Client | Прочитано (receipts) |
| `message.typing` | Client → Server → Client | Печатает... |
| `presence.online` | Server → Client | Пользователь онлайн |
| `presence.offline` | Server → Client | Пользователь оффлайн |
| `conversation.updated` | Server → Client | Изменение диалога |

### 7.3 Offline доставка

```
1. Сообщение → Realtime Service
2. Попытка доставить через WebSocket
3. Если получатель offline:
   a. Сохранить в PostgreSQL (status: sent)
   b. Отправить Push notification
   c. При reconnect: доставить все pending messages
4. Получатель подтверждает (message.delivered)
5. Получатель читает (message.read)
```

### 7.4 Состояния сообщения

```
sending → sent → delivered → read
   ⏳       ✓        ✓✓       ✓✓(blue)
```

---

## 8. Модели данных (бекенд)

### 8.1 Таблицы

```sql
-- Контакты
contacts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  contact_user_id UUID REFERENCES users,
  nickname VARCHAR(100),
  status: pending | accepted | blocked,
  created_at TIMESTAMP
)

-- Диалоги
conversations (
  id UUID PRIMARY KEY,
  type: direct | circle,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Участники
conversation_participants (
  conversation_id UUID,
  user_id UUID,
  role: member | admin | owner,
  muted_until TIMESTAMP,
  joined_at TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id)
)

-- Сообщения
messages (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  sender_id UUID,
  type: text | image | video | voice | file | product | sticker | system,
  content TEXT,                    -- Текст или JSON metadata
  metadata JSONB,                  -- { product_id, file_url, duration, transcription, ... }
  reply_to_id UUID,                -- Ответ на сообщение
  status: sent | delivered | read,
  created_at TIMESTAMP
)
-- Индексы: (conversation_id, created_at DESC), (sender_id)

-- Круги друзей
circles (
  id UUID PRIMARY KEY,
  conversation_id UUID UNIQUE,
  name VARCHAR(100),
  avatar_url TEXT,
  owner_id UUID,
  max_members INT DEFAULT 50,
  created_at TIMESTAMP
)

-- Общий wishlist круга
circle_wishlist_items (
  id UUID PRIMARY KEY,
  circle_id UUID,
  product_id UUID,
  added_by UUID,
  claimed_by UUID,                 -- "Я куплю это"
  created_at TIMESTAMP
)

-- Стикеры
sticker_packs (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  preview_url TEXT,
  stickers JSONB                   -- [{id, url, emoji_shortcode}]
)
```

---

## 9. Дизайн чата

### 9.1 Message Bubbles

| Элемент | Incoming (left) | Outgoing (right) |
|---------|----------------|------------------|
| Background | `bg-secondary` | `brand-primary` (мягче, ~15% opacity) |
| Text color | `text-primary` | `text-primary` |
| Border radius | 16, top-left: 4 | 16, top-right: 4 |
| Max width | 75% экрана | 75% экрана |
| Time | Под bubble, text-tertiary | Под bubble, text-tertiary |
| Read receipt | — | ✓✓ (цвет: delivered=gray, read=blue) |

### 9.2 Анимации

| Действие | Анимация |
|---------|---------|
| Новое сообщение | Slide up + fade in (spring) |
| Отправка | Scale up 0.95 → 1.0 + отправляется вверх |
| Лайк сообщения | Double tap → heart animation (Reanimated) |
| Voice recording | Pulsing red dot + waveform animation |
| Typing indicator | Three bouncing dots |
| Product card в чате | Появляется с shadow + scale animation |

---

## 10. Безопасность

### 10.1 E2E Encryption (Phase 6.9)

- Протокол: **Signal Protocol** (Double Ratchet + X3DH)
- Библиотека: `libsignal-protocol-javascript` (или аналог для React Native)
- Ключи хранятся в Secure Store (Keychain/Keystore)
- Серверу доступен только encrypted payload
- Верификация: QR-код / числовой код для сравнения ключей между устройствами

### 10.2 Модерация

- Отчёт о спаме/нарушении: кнопка в меню чата
- AI-фильтрация: вложения проверяются на запрещённый контент (server-side, до шифрования превью)
- Rate limiting: max 60 сообщений/мин на пользователя

---

## Следующий шаг

→ [16-video-platform-spec.md](16-video-platform-spec.md) — спецификация видеоплатформы

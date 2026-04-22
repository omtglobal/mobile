# 14. Суперприложение — Видение и стратегия

Ninhao — не просто маркетплейс. Это суперприложение с тремя равноценными столпами: **Торговля**, **Коммуникации**, **Контент**. Единый аккаунт, единый дизайн, бесшовная интеграция.

---

## 1. Три столпа

```
   ← Свайп влево                Центр (по умолчанию)            Свайп вправо →
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│                  │        │                  │        │                  │
│   📹 КОНТЕНТ     │        │   🛒 МАРКЕТПЛЕЙС │        │   💬 МЕССЕНДЖЕР  │
│   (Видео)        │        │   (Торговля)     │        │   (Общение)      │
│                  │        │                  │        │                  │
│  Бесконечная     │        │  Каталог товаров │        │  Личные чаты     │
│  вертикальная    │        │  Поиск           │        │  Круги друзей    │
│  лента           │        │  Корзина         │        │  Голосовые       │
│  Лайки           │        │  Заказы          │        │  Файлы           │
│  Комментарии     │        │  Отзывы          │        │  Стикеры         │
│  Загрузка видео  │        │  Поддержка       │        │  Ссылки товаров  │
│                  │        │                  │        │                  │
└──────────────────┘        └──────────────────┘        └──────────────────┘
                                    │
                              Tab Navigation
                          (Home, Каталог, Корзина,
                           Заказы, Профиль)
```

### Навигационная парадигма

Корень приложения — **горизонтальный PagerView** (3 страницы). Центральная страница (маркетплейс) открывается по умолчанию. Мессенджер и видео доступны одним свайпом. Индикатор текущей позиции — три точки вверху экрана (как Snapchat, но минималистичнее).

---

## 2. Почему суперприложение

### 2.1 Что устарело и надоело

| Проблема | Где | Наше решение |
|----------|-----|-------------|
| Отдельные приложения для всего | Весь рынок | Одно приложение: купить + обсудить + посмотреть |
| Статические ленты товаров | AliExpress, Amazon | Живой видеоконтент продавцов и покупателей |
| Спам-уведомления | WhatsApp, Telegram | AI-курация уведомлений, smart grouping |
| Засорение чатов рекламой | Telegram каналы | Контент отделён от общения (свайп влево — контент, вправо — чат) |
| Безликие продавцы | AliExpress, Temu | Продавцы создают видео, покупатели видят реальный товар |
| Одинокий шопинг | Все маркетплейсы | Совместные покупки в Кругах друзей |
| Фейковые отзывы | Все маркетплейсы | Видеоотзывы от верифицированных покупателей |
| Бесконечный doom-scrolling | TikTok | Осознанное потребление: daily digest, time limits (opt-in) |

### 2.2 Что набирает популярность (тренды 2025-2027)

| Тренд | Как используем |
|-------|---------------|
| **Social Commerce** | Покупка прямо из видео, обсуждение в чате, совместные корзины |
| **Shoppable Video** | Тап на товар в видео → карточка → в корзину (без выхода из ленты) |
| **Live Commerce** | Прямые трансляции продавцов с покупкой в реальном времени |
| **AI Assistants** | AI-помощник в мессенджере: найти товар, сравнить цены, рекомендации |
| **Voice-first UX** | Голосовые сообщения с AI-транскрипцией, голосовой поиск товаров |
| **AR Commerce** | Примерка товаров через камеру (мебель в комнате, одежда на себе) |
| **Community Commerce** | Круги друзей с общими wishlist, совместные скидки при групповой покупке |
| **Creator Economy** | Monetization для создателей контента через % от продаж |
| **Super-app Model** | WeChat показал что это работает; западный рынок ещё не занят |
| **Privacy-first** | E2EE в мессенджере, прозрачная аналитика, контроль данных |

### 2.3 Уникальная синергия

Ключевое преимущество: **три столпа усиливают друг друга**.

```
┌─────────────┐     Делиться товарами      ┌─────────────┐
│             │ ───────────────────────────→ │             │
│ МАРКЕТПЛЕЙС │     Совместные покупки      │  МЕССЕНДЖЕР │
│             │ ←─────────────────────────── │             │
└──────┬──────┘                              └──────┬──────┘
       │                                           │
       │  Shoppable                    Пересылка   │
       │  Videos                       видео       │
       │                                           │
       └──────────────┐  ┌────────────────────────┘
                      ▼  ▼
               ┌─────────────┐
               │             │
               │   КОНТЕНТ   │
               │   (Видео)   │
               │             │
               └─────────────┘
```

- **Маркетплейс → Мессенджер:** "Смотри что нашёл!" (ссылка на товар → rich preview в чате)
- **Мессенджер → Маркетплейс:** Обсуждение в Кругу → совместная корзина → групповая скидка
- **Маркетплейс → Видео:** Продавец снимает обзор → товар доступен прямо из видео
- **Видео → Маркетплейс:** Тап на продукт в видео → карточка товара → покупка
- **Видео → Мессенджер:** Переслать видео другу → обсудить → купить вместе
- **Мессенджер → Видео:** Друг присылает видео → посмотреть в ленте → купить

---

## 3. Конкурентный анализ

### 3.1 Мессенджер: чем лучше WhatsApp / Telegram / Viber

| Функция | WhatsApp | Telegram | Ninhao Messenger |
|---------|----------|----------|-----------------|
| E2E шифрование | ✅ | Только Secret Chat | ✅ Все чаты |
| Группы | До 1024 | До 200K | **Круги друзей** (intimate, purpose-driven) |
| Стикеры | Базовые | Хорошие | Animated + marketplace-themed |
| Голосовые | Аудио | Аудио | Аудио + **AI-транскрипция** |
| Видео-сообщения | Кружочки | Кружочки | Кружочки + **прямо в товарный контекст** |
| Каналы | ✅ | ✅ | Нет (контент в отдельном разделе) |
| Боты | Нет | Да | **AI-ассистент** (не бот, а интегрированный помощник) |
| Commerce | Каталоги (слабо) | Нет | **Нативная интеграция**: ссылки-карточки, совместные покупки |
| Поиск контактов | По телефону | По username | По email + телефон + **Ninhao ID** |
| Спам-контроль | Слабый | Средний | **AI-фильтрация** + изоляция от незнакомцев |

**Уникальное:** Круги друзей — не просто группы, а социальные пространства для совместных покупок. Каждый Круг может иметь общий wishlist, совместную корзину, историю обсуждения товаров.

### 3.2 Видео: чем лучше TikTok / YouTube Shorts

| Функция | TikTok | YouTube Shorts | Ninhao Video |
|---------|--------|---------------|-------------|
| Алгоритм рекомендаций | Отличный | Хороший | AI + social signal (что смотрят друзья) |
| Покупка из видео | TikTok Shop (отдельно) | Нет | **Inline product cards** (тап → купить не покидая видео) |
| Монетизация создателей | Creator Fund (маленький) | Ad Revenue | **% от продаж** (выше мотивация) |
| Live Commerce | Есть | Нет | **Полноценный аукцион** + live покупки |
| AR фильтры | Да | Нет | Да + **AR-примерка товаров** |
| Отправка в чат | Внешняя ссылка | Внешняя ссылка | **Нативная пересылка** в мессенджер (instant play) |
| Видеоотзывы | Нет привязки к товару | Нет | **Привязка к SKU** → отображаются на карточке товара |
| Doom-scroll контроль | Нет | Нет | **Digital wellbeing**: таймер, daily digest |
| Дуэты | Да | Нет | Да + **реакции на товар** (split-screen отзыв) |
| Музыка | Большая библиотека | YouTube Music | Лицензированная библиотека + local trending |

**Уникальное:** Каждое видео потенциально shoppable. Создатели зарабатывают не от просмотров, а от конверсий. Это привлекает качественный контент, а не кликбейт.

### 3.3 Маркетплейс: чем лучше AliExpress / Temu

| Функция | AliExpress | Temu | Ninhao Marketplace |
|---------|-----------|------|-------------------|
| Видеообзоры товаров | Загруженные видео | Нет | **Живая лента** из видеоплатформы |
| Обсуждение с друзьями | Нет | "Team purchase" | **Круги друзей** с общим wishlist и совместной корзиной |
| Рекомендации | Алгоритм | Алгоритм | Алгоритм + **рекомендации друзей** |
| Отзывы | Текст + фото | Текст | Текст + фото + **видеоотзывы** из ленты |
| Общение с продавцом | Встроенный чат (отдельный) | Нет | **Нативный чат** в мессенджере |
| Live Shopping | Да (слабо) | Нет | **Полноценный live** с аукционами |
| UI/UX | Перегруженный | Gamified | **Чистый**, минималистичный |

---

## 4. Архитектурный фундамент

### 4.1 Новые бекенд-модули (Laravel)

```
/modules/
  ...существующие...
  Messaging/          # Мессенджер (Phase 6)
    Domain/
      Models/
        Conversation.php
        Message.php
        Circle.php         # Круг друзей
        Contact.php
        Attachment.php
      Events/
        MessageSent.php
        MessageRead.php
        CircleCreated.php
    Application/
      Commands/
      Queries/
      Services/
        MessageService.php
        CircleService.php
        ContactService.php
    Http/
      Controllers/
      Resources/
      Middleware/
    Infrastructure/
      WebSocket/          # Pusher/Soketi adapter
    Database/
      Migrations/
    routes/

  Content/              # Видеоплатформа (Phase 7)
    Domain/
      Models/
        Video.php
        VideoComment.php
        VideoLike.php
        VideoTag.php       # Привязка продукта к видео
        Creator.php
      Events/
        VideoUploaded.php
        VideoProcessed.php
        VideoLiked.php
    Application/
      Commands/
      Queries/
      Services/
        VideoService.php
        FeedService.php
        ContentModerationService.php
    Http/
      Controllers/
      Resources/
    Infrastructure/
      Recommendation/     # Алгоритм рекомендаций
    Database/
      Migrations/
    routes/
```

### 4.2 Новые Go-сервисы

```
/services/
  media-service/         # Существующий (фото)
  video-service/         # Новый: транскодинг, thumbnails, HLS
    cmd/
    internal/
      transcoder/        # FFmpeg pipeline
      thumbnail/
      hls/               # Adaptive bitrate streaming
      moderation/        # AI content moderation
    Dockerfile

  realtime-service/      # Новый: WebSocket hub
    cmd/
    internal/
      ws/                # WebSocket connections
      presence/          # Online/offline/typing
      delivery/          # Message delivery + receipts
    Dockerfile
```

### 4.3 Новая инфраструктура

| Компонент | Технология | Назначение |
|-----------|------------|-----------|
| WebSocket | Soketi (self-hosted Pusher) или centrifugo | Real-time messaging |
| Video Storage | S3/MinIO (существующий) | Хранение видео |
| Video CDN | CloudFront/BunnyCDN | Доставка видео |
| Video Transcoding | FFmpeg в Go-сервисе | HLS, adaptive bitrate |
| Message DB | PostgreSQL (существующий) | Хранение сообщений |
| Message Cache | Redis (существующий) | Онлайн-статусы, typing, recent messages |
| Full-Text Search | OpenSearch (v2) | Поиск по сообщениям, видео |
| AI/ML | Python microservice или API | Рекомендации, транскрипция, модерация |

### 4.4 API-расширения

```
/api/v1/client/
  # Существующие (маркетплейс)
  /auth/*
  /catalog/*
  /orders/*
  /addresses/*
  /tickets/*
  /track

  # Новые — Мессенджер (Phase 6)
  /messaging/contacts              # CRUD контактов
  /messaging/contacts/search       # Поиск по email/phone
  /messaging/conversations         # Список диалогов
  /messaging/conversations/{id}    # Диалог + сообщения
  /messaging/conversations/{id}/messages  # Отправка сообщений
  /messaging/circles               # Круги друзей
  /messaging/circles/{id}          # Управление кругом
  /messaging/circles/{id}/members  # Участники
  /messaging/stickers              # Пакеты стикеров

  # Новые — Видео (Phase 7)
  /content/feed                    # Алгоритмическая лента
  /content/feed/following          # Лента подписок
  /content/videos                  # Загрузка видео
  /content/videos/{id}             # Детали видео
  /content/videos/{id}/comments    # Комментарии
  /content/videos/{id}/like        # Лайк/анлайк
  /content/videos/{id}/share       # Поделиться (→ мессенджер)
  /content/creators/{id}           # Профиль создателя
  /content/creators/{id}/follow    # Подписка

  # WebSocket events (через Soketi/Pusher protocol)
  ws://
    messaging.{userId}             # Личные сообщения
    circle.{circleId}              # Сообщения круга
    presence.{conversationId}      # Typing, online status
    video.{videoId}.comments       # Live комментарии
```

### 4.5 Изменения в мобильной архитектуре

Обновлённая структура `/apps/mobile/`:

```
apps/mobile/
  app/
    _layout.tsx               # Root: PagerView (3 страницы)
    (main)/                   # Центральная страница — маркетплейс
      (tabs)/                 # Текущий TabNavigator
        _layout.tsx
        index.tsx             # Home
        catalog.tsx
        cart.tsx
        orders.tsx
        profile.tsx
      product/[id].tsx
      category/[id].tsx
      seller/[id].tsx
      search.tsx
      checkout.tsx
      order/[id].tsx
      support/
      addresses/
      settings.tsx

    (messenger)/              # Правый свайп — мессенджер
      _layout.tsx
      index.tsx               # Список диалогов
      chat/[id].tsx           # Экран чата
      circle/[id].tsx         # Круг друзей
      circle/new.tsx          # Создание круга
      contacts.tsx            # Список контактов
      contacts/search.tsx     # Поиск нового контакта
      contacts/add.tsx        # Добавление контакта

    (video)/                  # Левый свайп — видео
      _layout.tsx
      index.tsx               # Бесконечная лента (вертикальный свайп)
      upload.tsx              # Загрузка видео
      comments/[id].tsx       # Комментарии (bottom sheet)
      creator/[id].tsx        # Профиль создателя

  src/
    components/
      ui/                     # Общие (существующие)
      product/                # Маркетплейс (существующие)
      messenger/              # Мессенджер (Phase 6)
        ChatBubble.tsx
        MessageInput.tsx
        VoiceRecorder.tsx
        ProductPreviewCard.tsx  # Rich preview товара в чате
        CircleCard.tsx
        ContactCard.tsx
        StickerPicker.tsx
        TypingIndicator.tsx
      video/                  # Видео (Phase 7)
        VideoPlayer.tsx
        VideoFeed.tsx
        VideoCard.tsx
        ProductTag.tsx          # Тег товара на видео
        CommentOverlay.tsx
        LikeAnimation.tsx
        UploadForm.tsx

    lib/
      api/
        client.ts             # Существующий
        auth.ts               # Существующий
        catalog.ts            # Существующий
        messaging.ts          # Новый (Phase 6)
        content.ts            # Новый (Phase 7)

      stores/
        auth.ts               # Существующий
        cart.ts               # Существующий
        messaging.ts          # Новый: текущий чат, unread count
        video.ts              # Новый: состояние плеера, лайки

      hooks/
        useMessages.ts
        useConversations.ts
        useCircles.ts
        useWebSocket.ts
        useVoiceRecorder.ts
        useVideoFeed.ts
        useVideoPlayer.ts
```

---

## 5. Что закладываем сейчас (Phase 0)

Эти решения принимаются **до начала реализации маркетплейса**, чтобы потом не переделывать:

### 5.1 Навигация: PagerView как корень

```typescript
// app/_layout.tsx — закладываем с самого начала
import PagerView from 'react-native-pager-view';

export default function RootLayout() {
  const pagerRef = useRef<PagerView>(null);

  return (
    <PagerView
      ref={pagerRef}
      initialPage={1}  // Центр = маркетплейс
      style={{ flex: 1 }}
    >
      {/* Page 0: Видео (Phase 7 — пока placeholder) */}
      <View key="video">
        <ComingSoonPlaceholder icon="Video" title="Скоро" />
      </View>

      {/* Page 1: Маркетплейс (реализуем сейчас) */}
      <View key="marketplace">
        <MarketplaceStack />
      </View>

      {/* Page 2: Мессенджер (Phase 6 — пока placeholder) */}
      <View key="messenger">
        <ComingSoonPlaceholder icon="MessageCircle" title="Скоро" />
      </View>
    </PagerView>
  );
}
```

### 5.2 Индикатор страниц

Три точки вверху экрана (между SafeArea и контентом):

```
        ○  ●  ○
┌─────────────────────┐
│     [Content]       │
```

- Активная точка: `brand-primary`
- Неактивная: `text-tertiary`
- Анимация: spring при переключении

### 5.3 Shared компоненты (создать заранее)

| Компонент | Зачем | Где используется |
|-----------|-------|-----------------|
| `ProductPreviewCard` | Rich-preview товара | Мессенджер (в чате), Видео (тег на видео) |
| `UserAvatar` | Аватар пользователя | Профиль, Мессенджер, Видео (комментарии) |
| `ShareSheet` | Нативный share + "Отправить в чат" | Маркетплейс, Видео |
| `MediaPicker` | Выбор фото/видео/файла | Мессенджер, Видео (загрузка), Отзывы |
| `VoiceButton` | Запись голосового | Мессенджер, Поиск (голосовой) |

### 5.4 Типы и интерфейсы (создать заранее)

```typescript
// src/types/messaging.ts — скелет типов
export interface Conversation {
  id: string;
  type: 'direct' | 'circle';
  participants: ConversationParticipant[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'product' | 'sticker';
  content: string;
  metadata: MessageMetadata;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
}

export interface Circle {
  id: string;
  name: string;
  avatar_url: string | null;
  owner_id: string;
  members: CircleMember[];
  shared_wishlist: Product[];
  created_at: string;
}

// src/types/content.ts — скелет типов
export interface Video {
  id: string;
  creator: CreatorProfile;
  url: string;                    // HLS playlist URL
  thumbnail_url: string;
  description: string;
  duration: number;               // seconds
  tags: VideoProductTag[];        // Привязанные товары
  like_count: number;
  comment_count: number;
  share_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface VideoProductTag {
  id: string;
  product: Product;               // Из маркетплейса
  position: { x: number; y: number }; // Позиция тега на видео (0-1)
  timestamp?: number;             // В какой момент показать (секунды)
}
```

### 5.5 Unread Badge на индикаторе

Даже пока мессенджер не реализован, заложить badge counter на правой точке:

```
        ○  ●  ③
```

Это создаёт интригу и подготавливает UX.

---

## 6. Что НЕ делаем сейчас

| Не делаем сейчас | Почему | Когда |
|-----------------|--------|-------|
| WebSocket инфраструктура | Не нужна для маркетплейса | Phase 6 |
| Video transcoding service | Не нужен до видеоплатформы | Phase 7 |
| Messaging API endpoints | Нет UI | Phase 6 |
| Content API endpoints | Нет UI | Phase 7 |
| E2E encryption | Комплексная реализация | Phase 6 |
| Recommendation engine | Требует данных | Phase 7 |
| Live streaming | Самая сложная фича | Phase 8+ |

---

## 7. Дорожная карта

```
Phase 0-5: Маркетплейс (текущая документация)
    │
    ├── Phase 0: Инфраструктура + PagerView root
    ├── Phase 1: Каталог
    ├── Phase 2: Авторизация
    ├── Phase 3: Корзина и заказы
    ├── Phase 4: Отзывы и поддержка
    └── Phase 5: Polish (dark mode, offline, push, i18n, тесты)

Phase 6: Мессенджер
    │
    ├── 6.1: Backend — Messaging module + WebSocket service
    ├── 6.2: Контакты — поиск, добавление, список
    ├── 6.3: Личные чаты — текст + emoji + стикеры
    ├── 6.4: Голосовые сообщения + AI транскрипция
    ├── 6.5: Файлы и медиа в чате
    ├── 6.6: Product sharing (rich preview в чате)
    ├── 6.7: Круги друзей — создание, управление
    ├── 6.8: Общий wishlist и совместная корзина в Круге
    ├── 6.9: E2E шифрование
    └── 6.10: Push + badges + звуки

Phase 7: Видеоплатформа
    │
    ├── 7.1: Backend — Content module + Video service (transcoding)
    ├── 7.2: Видеоплеер (вертикальный, full-screen, gesture controls)
    ├── 7.3: Бесконечная лента (алгоритмическая + подписки)
    ├── 7.4: Лайки + комментарии
    ├── 7.5: Загрузка видео (съёмка + выбор из галереи)
    ├── 7.6: Product tagging — привязка товаров к видео
    ├── 7.7: Shoppable video — покупка из видео
    ├── 7.8: Пересылка видео в мессенджер
    ├── 7.9: Профиль создателя + подписки
    └── 7.10: Content moderation (AI)

Phase 8+: Продвинутые фичи
    │
    ├── Live Commerce (прямые трансляции с покупками)
    ├── AR примерка товаров
    ├── AI Shopping Assistant (в мессенджере)
    ├── Голосовой поиск и голосовые заказы
    ├── Creator monetization dashboard
    ├── Видеоотзывы привязанные к SKU
    ├── Совместный просмотр (watch party)
    └── Групповые скидки из Кругов
```

---

## Следующий шаг

→ [15-messenger-spec.md](15-messenger-spec.md) — детальная спецификация мессенджера
→ [16-video-platform-spec.md](16-video-platform-spec.md) — детальная спецификация видеоплатформы

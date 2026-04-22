# 10. Push-уведомления и аналитика

Архитектура push-уведомлений и интеграция клиентской аналитики.

---

## 1. Push-уведомления

### 1.1 Архитектура

```
┌────────────┐    ┌──────────┐    ┌──────────────┐
│ Laravel    │───→│ Expo Push│───→│ APNs / FCM   │───→ Устройство
│ (событие)  │    │ API      │    │              │
└────────────┘    └──────────┘    └──────────────┘
```

**Стек:** Expo Notifications → Expo Push Service → APNs (iOS) + FCM (Android)

### 1.2 Регистрация устройства

```typescript
// src/lib/hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  async function registerForPushNotifications() {
    if (!Device.isDevice) return; // Не работает на симуляторе

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    setExpoPushToken(token.data);

    // Отправить токен на бекенд (новый эндпоинт)
    // POST /api/v1/client/devices { push_token: token.data, platform: Platform.OS }
  }

  return { expoPushToken };
}
```

### 1.3 Обработка уведомлений

```typescript
// app/_layout.tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Обработка тапа на уведомление
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;

      // Deep link по типу уведомления
      switch (data.type) {
        case 'order_status':
          router.push(`/order/${data.order_id}`);
          break;
        case 'ticket_reply':
          router.push(`/support/${data.ticket_id}`);
          break;
        case 'promotion':
          router.push(`/product/${data.product_id}`);
          break;
      }
    }
  );
  return () => subscription.remove();
}, []);
```

### 1.4 Типы уведомлений

| Тип | Триггер | Заголовок | Действие |
|-----|---------|-----------|---------|
| `order_status` | Смена статуса заказа | "Заказ #{id} отправлен" | → Order Detail |
| `order_delivered` | Доставка | "Заказ доставлен!" | → Order Detail |
| `ticket_reply` | Ответ поддержки | "Новый ответ в тикете" | → Ticket Detail |
| `promotion` | Акции, скидки | "Скидка 30% на {category}" | → Product/Category |
| `review_reply` | Ответ на отзыв | "Продавец ответил на ваш отзыв" | → Product Detail |

### 1.5 Бекенд (что нужно добавить в Laravel)

Для полноценной работы push нужен новый эндпоинт и сервис:

```
POST /api/v1/client/devices
  body: { push_token: string, platform: "ios"|"android", device_name?: string }
  auth: JWT (опционально для гостей)

DELETE /api/v1/client/devices/{token}
  auth: JWT
```

Серверная сторона: при смене статуса заказа / ответе в тикете → отправить push через Expo Push API:
```
POST https://exp.host/--/api/v2/push/send
{
  "to": "ExponentPushToken[xxx]",
  "title": "Заказ отправлен",
  "body": "Ваш заказ #123 был отправлен",
  "data": { "type": "order_status", "order_id": "uuid" }
}
```

### 1.6 Настройки уведомлений

Пользователь может управлять в Settings:
- Включить/выключить push полностью
- (Будущее) Включить/выключить по категориям

---

## 2. Аналитика

### 2.1 Архитектура

```
Мобильное приложение
  │
  ├── POST /api/v1/client/track
  │     { event_type, payload }
  │
  └── → Laravel → Redis → Consumer → ClickHouse
```

Мобильное приложение использует тот же API трекинга, что и web-клиент.

### 2.2 Analytics Service

```typescript
// src/lib/api/analytics.ts
import { apiClient } from './client';

type EventType =
  | 'ProductViewed'
  | 'ProductPhotoViewed'
  | 'CategoryViewed'
  | 'SearchPerformed'
  | 'AddToCartClicked'
  | 'CheckoutStarted'
  | 'PaymentClicked';

interface TrackPayload {
  product_id?: string;
  category_id?: string;
  order_id?: string;
  photo_index?: number;
  media_id?: string;
  quantity?: number;
  search_query?: string;
}

class AnalyticsService {
  private queue: Array<{ event_type: EventType; payload: TrackPayload }> = [];
  private isProcessing = false;
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;

  track(eventType: EventType, payload: TrackPayload = {}) {
    this.queue.push({ event_type: eventType, payload });

    // Batch: отправлять каждые 5 секунд или при 10+ событий
    if (this.queue.length >= 10) {
      this.flush();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flush(), 5000);
    }
  }

  async flush() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const events = [...this.queue];
    this.queue = [];

    // Отправить каждое событие (API принимает по одному)
    // Rate limit: 120/мин — не превышать
    for (const event of events) {
      try {
        await apiClient.post('/track', event);
      } catch {
        // Тихо проглатываем ошибки аналитики — не блокируем UI
      }
    }

    this.isProcessing = false;
  }
}

export const analytics = new AnalyticsService();
```

### 2.3 Где трекать

| Событие | Экран | Момент |
|---------|-------|--------|
| `ProductViewed` | ProductDetail | При открытии экрана |
| `ProductPhotoViewed` | ProductDetail | При свайпе на новое фото |
| `CategoryViewed` | CategoryProducts | При открытии категории |
| `SearchPerformed` | Search | При выполнении поиска (debounced) |
| `AddToCartClicked` | ProductDetail / Cart | При добавлении товара |
| `CheckoutStarted` | Cart | При нажатии "Оформить" |
| `PaymentClicked` | Checkout | При нажатии "Оплатить" |

### 2.4 Мобильно-специфичные события (будущее)

Дополнительные события для мобильной аналитики:

| Событие | Описание |
|---------|----------|
| `AppOpened` | Запуск приложения |
| `PushReceived` | Push-уведомление получено |
| `PushTapped` | Тап на push-уведомление |
| `BiometricUsed` | Вход через Face ID / Fingerprint |
| `ShareClicked` | Поделиться товаром |

> Эти события требуют добавления новых `event_type` на бекенде.

### 2.5 Offline аналитика

При отсутствии сети:
1. События сохраняются в локальную очередь (MMKV)
2. При восстановлении сети — flush очереди
3. Max размер офлайн очереди: 500 событий (старые удаляются)

---

## 3. App Tracking Transparency (iOS)

iOS требует разрешение на трекинг (ATT). Поскольку мы отправляем аналитику на свой сервер (не third-party):

- ATT **не обязателен** для first-party аналитики
- Если в будущем подключим Facebook/Google Ads SDK — понадобится ATT prompt

---

## Следующий шаг

→ [11-performance.md](11-performance.md) — оптимизация производительности

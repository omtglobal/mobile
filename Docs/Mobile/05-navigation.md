# 05. Навигация и Deep Linking

Структура навигации, маршрутизация, deep linking и жесты.

---

## 1. Навигационная архитектура

### 1.1 Expo Router (file-based)

Навигация построена на **Expo Router v4** — file-based routing, аналогичный Next.js App Router. Каждый файл в `app/` — маршрут.

### 1.2 Суперприложение: корневой PagerView

Корень приложения — горизонтальный **PagerView** (3 страницы). Свайп между ними — основная навигация верхнего уровня. Подробнее: [14-superapp-vision.md](14-superapp-vision.md).

```
Root (_layout.tsx) — PagerView
├── Page 0: (video)/ — Видеоплатформа (Phase 7, placeholder)
│
├── Page 1: (main)/ — Маркетплейс (реализуем в Phase 0-5)
│   ├── (tabs)/ — TabNavigator (5 табов)
│   │   ├── index (Home)
│   │   ├── catalog (Categories)
│   │   ├── cart (Cart)
│   │   ├── orders (Orders) *
│   │   └── profile (Profile)
│   │
│   ├── (auth)/ — StackNavigator (без табов)
│   │   ├── login
│   │   ├── register
│   │   ├── forgot-password
│   │   └── reset-password
│   │
│   ├── product/[id] — Product Detail
├── category/[id] — Category Products
├── seller/[id] — Seller Profile
├── search — Search
├── checkout — Checkout *
├── order/[id] — Order Detail *
├── support/
│   ├── index — Ticket List
│   ├── new — Create Ticket
│   └── [id] — Ticket Detail
├── addresses/
│   ├── index — Address List
│   └── edit — Address Form
└── settings — Settings

* — требует авторизации
```

---

## 2. Tab Bar

### 2.1 Конфигурация

5 табов (как AliExpress), но с чистым дизайном:

| Таб | Иконка | Label | Маршрут | Auth |
|-----|--------|-------|---------|------|
| Главная | Home | Главная | `/(tabs)` | Нет |
| Каталог | LayoutGrid | Каталог | `/(tabs)/catalog` | Нет |
| Корзина | ShoppingCart | Корзина | `/(tabs)/cart` | Нет |
| Заказы | Package | Заказы | `/(tabs)/orders` | Да |
| Профиль | User | Профиль | `/(tabs)/profile` | Нет* |

> *Профиль показывает кнопки входа/регистрации для гостей.

### 2.2 Визуальный стиль

```
┌───────────────────────────────────────────┐
│                                           │
│              (экран)                       │
│                                           │
├───────────────────────────────────────────┤
│  🏠      📋      🛒(3)    📦      👤     │
│ Главная Каталог Корзина  Заказы  Профиль  │
└───────────────────────────────────────────┘
```

- Активный таб: иконка `brand-primary`, filled variant
- Неактивный: `text-tertiary`, outline variant
- Бейдж на корзине: количество товаров (красный кружок)
- Высота: 49pt (iOS стандарт) + SafeArea bottom

### 2.3 Layout файл

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, LayoutGrid, ShoppingCart, Package, User } from 'lucide-react-native';

export default function TabLayout() {
  const cartCount = useCartStore(s => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.brandPrimary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      {/* ... */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Корзина',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
    </Tabs>
  );
}
```

---

## 3. Навигационные паттерны

### 3.1 Stack Navigation (внутри табов)

Каждый таб может «пушить» экраны в стек:
- Home → Product Detail → Seller Profile
- Catalog → Category → Product Detail
- Orders → Order Detail → Support Ticket
- Profile → Addresses → Address Edit

### 3.2 Modal Navigation

Модальные экраны (презентация снизу вверх):
- Login / Register
- Search (полноэкранный)
- Фильтры (bottom sheet)
- Создание отзыва
- Создание тикета

### 3.3 Protected Routes

```typescript
// app/(tabs)/orders.tsx
export default function OrdersScreen() {
  const { token } = useAuthStore();

  if (!token) {
    return (
      <AuthPrompt
        title="Мои заказы"
        message="Войдите, чтобы увидеть историю заказов"
        onLogin={() => router.push('/login')}
        onRegister={() => router.push('/register')}
      />
    );
  }

  return <OrderList />;
}
```

---

## 4. Deep Linking

### 4.1 URL Scheme

| Паттерн | Маршрут | Пример |
|---------|---------|--------|
| `ninhao://` | Home | Открыть приложение |
| `ninhao://product/{id}` | Product Detail | `ninhao://product/uuid-123` |
| `ninhao://category/{id}` | Category | `ninhao://category/uuid-456` |
| `ninhao://seller/{id}` | Seller Profile | `ninhao://seller/uuid-789` |
| `ninhao://search?q={query}` | Search | `ninhao://search?q=laptop` |
| `ninhao://cart` | Cart | Открыть корзину |
| `ninhao://order/{id}` | Order Detail | `ninhao://order/uuid-abc` |
| `ninhao://support` | Tickets | Список тикетов |
| `ninhao://login` | Login | Экран входа |

### 4.2 Universal Links (iOS) / App Links (Android)

```
https://ninhao.shop/product/{id}    → Product Detail
https://ninhao.shop/category/{id}   → Category
https://ninhao.shop/seller/{id}     → Seller Profile
https://ninhao.shop/search?q={q}    → Search
```

### 4.3 Конфигурация

```json
// app.json
{
  "expo": {
    "scheme": "ninhao",
    "ios": {
      "associatedDomains": ["applinks:ninhao.shop"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            { "scheme": "https", "host": "ninhao.shop", "pathPrefix": "/product" },
            { "scheme": "https", "host": "ninhao.shop", "pathPrefix": "/category" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 4.4 Обработка deep link

```typescript
// app/_layout.tsx
import { useURL } from 'expo-linking';

export default function RootLayout() {
  const url = useURL();

  useEffect(() => {
    if (url) {
      // Expo Router автоматически обрабатывает deep links
      // если структура маршрутов совпадает
    }
  }, [url]);

  return <Stack />;
}
```

---

## 5. Переходы и анимации

### 5.1 Stack Transitions

| Переход | Анимация | Платформа |
|---------|----------|-----------|
| Push | Slide from right | iOS & Android |
| Pop | Slide to right | iOS & Android |
| Modal present | Slide from bottom | iOS & Android |
| Modal dismiss | Slide to bottom | iOS & Android |

### 5.2 Shared Element Transitions

Для плавных переходов между карточкой товара и экраном товара:

```typescript
// В ProductCard
<SharedElement id={`product.${product.id}.image`}>
  <Image source={{ uri: product.primary_image?.url }} />
</SharedElement>

// В ProductDetail
<SharedElement id={`product.${product.id}.image`}>
  <ProductGallery images={product.images} />
</SharedElement>
```

### 5.3 Custom Header

```typescript
// Collapsible header на ProductDetail
const scrollY = useSharedValue(0);
const headerOpacity = useDerivedValue(() =>
  interpolate(scrollY.value, [0, 200], [0, 1], Extrapolation.CLAMP)
);
```

---

## 6. Жесты

| Жест | Действие | Экран |
|------|---------|-------|
| Swipe right (от края) | Назад (pop) | Все stack-экраны |
| Swipe down | Dismiss modal | Модальные экраны |
| Pull down | Refresh данные | Списки (товары, заказы) |
| Pinch | Zoom фото | Product Gallery |
| Swipe horizontal | Листать фото | Product Gallery |
| Long press | Quick actions | Карточка товара |
| Swipe left на item | Delete action | Cart items, Addresses |

---

## 7. Навигация для состояний

### 7.1 Гостевой режим

Доступны: Home, Catalog, Search, Product Detail, Cart, Seller Profile.
При попытке перейти на защищённый экран → показать AuthPrompt или redirect на Login.

### 7.2 Авторизованный режим

Все экраны доступны. Таб "Заказы" показывает историю. Профиль показывает данные пользователя.

### 7.3 Offline режим

При потере сети: кешированные экраны доступны. Показать banner "Нет подключения" вверху экрана. Действия (отзывы, заказы) — показать сообщение "Будет отправлено при восстановлении".

---

## Следующий шаг

→ [06-network-and-auth.md](06-network-and-auth.md) — сетевой слой, JWT, биометрия, offline

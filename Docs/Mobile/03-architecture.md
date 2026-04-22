# 03. Архитектура проекта

Структура кода, паттерны, управление состоянием и принципы организации мобильного приложения.

---

## 1. Расположение в монорепозитории

```
ninhao/
├── apps/
│   ├── client/          # Web-клиент (Next.js)
│   └── mobile/          # Мобильное приложение (React Native + Expo)
├── modules/             # Laravel-модули (бекенд)
├── services/            # Go-микросервисы
└── Docs/Mobile/         # Эта документация
```

Мобильное приложение живёт в `/apps/mobile/`, аналогично web-клиенту в `/apps/client/`.

---

## 2. Суперприложение: три столпа

Приложение построено как **суперприложение** с тремя разделами, доступными через горизонтальный свайп:

```
← Свайп влево         Центр (default)       Свайп вправо →
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  📹 ВИДЕО   │     │ 🛒 МАРКЕТ  │     │ 💬 МЕССЕНДЖ │
│  (Phase 7)  │     │ (Phase 0-5) │     │  (Phase 6)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

Корень приложения — `react-native-pager-view` (горизонтальный PagerView, 3 страницы). В Phase 0 левая и правая страницы содержат placeholder ("Скоро"). Подробная спецификация: [14-superapp-vision.md](../Mobile/14-superapp-vision.md), [15-messenger-spec.md](../Mobile/15-messenger-spec.md), [16-video-platform-spec.md](../Mobile/16-video-platform-spec.md).

---

## 3. Структура проекта

```
apps/mobile/
├── app/                          # Expo Router — file-based маршруты
│   ├── _layout.tsx               # ROOT: PagerView (video | marketplace | messenger)
│   ├── (main)/                   # Центральная страница — маркетплейс
│   │   ├── (tabs)/               # Tab navigation layout
│   │   │   ├── _layout.tsx       # Конфигурация табов
│   │   │   ├── index.tsx         # Главная (Home)
│   │   ├── catalog.tsx           # Каталог/Категории
│   │   ├── cart.tsx              # Корзина
│   │   ├── orders.tsx            # Заказы
│   │   └── profile.tsx           # Профиль
│   ├── (auth)/                   # Auth layout (без табов)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── product/
│   │   └── [id].tsx              # Карточка товара
│   ├── category/
│   │   └── [id].tsx              # Товары категории
│   ├── seller/
│   │   └── [id].tsx              # Профиль продавца
│   ├── search.tsx                # Поиск
│   ├── checkout.tsx              # Оформление заказа
│   ├── order/
│   │   └── [id].tsx              # Детали заказа
│   ├── support/
│   │   ├── index.tsx             # Список тикетов
│   │   ├── new.tsx               # Создание тикета
│   │   └── [id].tsx              # Детали тикета
│   ├── addresses/
│   │   ├── index.tsx             # Список адресов
│   │   └── edit.tsx              # Создание/редактирование адреса
│   ├── settings.tsx              # Настройки
│   ├── _layout.tsx               # Корневой layout
│   └── +not-found.tsx            # 404
│
├── src/
│   ├── components/               # UI-компоненты
│   │   ├── ui/                   # Базовые компоненты дизайн-системы
│   │   │   ├── Button.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Icon.tsx
│   │   ├── product/              # Компоненты товара
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductBadges.tsx
│   │   │   └── AddToCartButton.tsx
│   │   ├── category/
│   │   │   ├── CategoryCard.tsx
│   │   │   └── CategoryGrid.tsx
│   │   ├── review/
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewList.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   └── StarRating.tsx
│   │   ├── order/
│   │   │   ├── OrderCard.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── SearchBar.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── LoadingState.tsx
│   │
│   ├── lib/                      # Бизнес-логика и инфраструктура
│   │   ├── api/                  # API-клиент
│   │   │   ├── client.ts         # Axios instance, interceptors
│   │   │   ├── auth.ts           # Auth API вызовы
│   │   │   ├── catalog.ts        # Catalog API
│   │   │   ├── orders.ts         # Orders API
│   │   │   ├── addresses.ts      # Addresses API
│   │   │   ├── reviews.ts        # Reviews API
│   │   │   ├── tickets.ts        # Support API
│   │   │   └── analytics.ts      # Analytics tracking
│   │   │
│   │   ├── stores/               # Zustand stores (client state)
│   │   │   ├── auth.ts           # Auth state + token management
│   │   │   ├── cart.ts           # Cart state (local, persistent)
│   │   │   └── preferences.ts    # User preferences (theme, language)
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts        # Auth convenience hook
│   │   │   ├── useProducts.ts    # React Query hooks для товаров
│   │   │   ├── useCategories.ts  # React Query hooks для категорий
│   │   │   ├── useOrders.ts      # React Query hooks для заказов
│   │   │   ├── useReviews.ts     # React Query hooks для отзывов
│   │   │   ├── useSearch.ts      # Search with debounce
│   │   │   ├── useInfiniteScroll.ts
│   │   │   ├── useBiometric.ts   # Face ID / Fingerprint
│   │   │   └── useNetworkStatus.ts
│   │   │
│   │   └── utils/                # Утилиты
│   │       ├── format.ts         # Форматирование цен, дат
│   │       ├── validation.ts     # Валидация форм
│   │       └── storage.ts        # MMKV обёртки
│   │
│   ├── types/                    # TypeScript типы
│   │   ├── api.ts                # API response types
│   │   ├── models.ts             # Domain models (Product, Category, etc.)
│   │   └── navigation.ts         # Navigation params
│   │
│   └── constants/                # Константы
│       ├── config.ts             # API URL, feature flags
│       ├── theme.ts              # Design tokens
│       └── queryKeys.ts          # React Query key factory
│
├── assets/                       # Статические ресурсы
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── __tests__/                    # Тесты
│   ├── components/
│   ├── hooks/
│   └── stores/
│
├── app.json                      # Expo конфигурация
├── eas.json                      # EAS Build конфигурация
├── tsconfig.json
├── babel.config.js
├── tailwind.config.ts            # NativeWind
└── package.json
```

---

## 3. Управление состоянием

### 3.1 Три уровня состояния

| Уровень | Инструмент | Что хранит |
|---------|-----------|------------|
| **Server state** | TanStack React Query | Данные с API (товары, категории, заказы) |
| **Client state** | Zustand + persist | Auth (токен), корзина, пользовательские настройки |
| **UI state** | React useState/useReducer | Локальное состояние компонентов (модалки, формы) |

### 3.2 React Query — серверное состояние

```typescript
// src/lib/hooks/useProducts.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog';
import { queryKeys } from '../../constants/queryKeys';

export function useProducts(params: ProductFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: ({ pageParam = 1 }) =>
      catalogApi.getProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => catalogApi.getProductPage(id),
    staleTime: 15 * 60 * 1000, // 15 минут
  });
}
```

### 3.3 Query Key Factory

```typescript
// src/constants/queryKeys.ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    featured: ['products', 'featured'] as const,
    search: (query: string) => ['products', 'search', query] as const,
  },
  categories: {
    all: ['categories'] as const,
    tree: ['categories', 'tree'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    products: (id: string, filters: ProductFilters) =>
      ['categories', id, 'products', filters] as const,
  },
  reviews: {
    byProduct: (productId: string) => ['reviews', productId] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  addresses: {
    all: ['addresses'] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
  },
  home: ['home'] as const,
  user: ['user', 'me'] as const,
};
```

### 3.4 Zustand — клиентское состояние

```typescript
// src/lib/stores/auth.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../utils/storage';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  clearSession: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const response = await authApi.login({ email, password });
        set({
          token: response.data.access_token,
          user: response.data.user,
          isLoading: false,
        });
      },

      clearSession: () => set({ token: null, user: null }),

      // ... остальные методы
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

```typescript
// src/lib/stores/cart.ts
interface CartState {
  items: CartItem[];
  deselectedIds: Set<string>;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleSelection: (productId: string) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
  selectedItems: () => CartItem[];
  selectedTotalPrice: () => number;
}
```

---

## 4. Паттерны и правила

### 4.1 Компоненты

- **Screen компоненты** (в `app/`) — тонкие, отвечают за layout и composition. Получают данные через hooks.
- **Feature компоненты** (в `src/components/`) — бизнес-логика + UI. Изолированные, переиспользуемые.
- **UI компоненты** (в `src/components/ui/`) — чистые presentational компоненты. Без бизнес-логики.

### 4.2 Именование файлов

| Тип | Пример | Формат |
|-----|--------|--------|
| Компонент | `ProductCard.tsx` | PascalCase |
| Hook | `useProducts.ts` | camelCase с use |
| Store | `auth.ts` | camelCase |
| API module | `catalog.ts` | camelCase |
| Типы | `models.ts` | camelCase |
| Утилиты | `format.ts` | camelCase |
| Тест | `ProductCard.test.tsx` | Same + .test |

### 4.3 API-слой

Каждый API-модуль — это набор функций, маппящих HTTP-вызовы:

```typescript
// src/lib/api/catalog.ts
import { apiClient } from './client';

export const catalogApi = {
  getHome: () =>
    apiClient.get<ApiResponse<HomeData>>('/catalog/home').then(r => r.data),

  getProducts: (params: ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>('/catalog/products', { params })
      .then(r => r.data),

  getProduct: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/catalog/products/${id}`)
      .then(r => r.data),

  getProductPage: (id: string) =>
    apiClient.get<ApiResponse<ProductPageData>>(`/catalog/products/${id}/page`)
      .then(r => r.data),

  searchProducts: (query: string, params?: ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>('/catalog/products/search', {
      params: { q: query, ...params },
    }).then(r => r.data),
};
```

### 4.4 Типы (переиспользование с web)

Типы из `apps/client/src/types/index.ts` можно вынести в shared package или дублировать (с постепенным переходом на shared):

```typescript
// src/types/models.ts
export interface Product {
  id: string;
  title: string;
  description: string;
  short_description: string;
  sku: string;
  price: number;
  currency: string;
  stock_quantity: number;
  badges: string[];
  category: Category;
  company: CompanyShort;
  images: ProductImage[];
  primary_image: ProductImage | null;
  rating_avg: number;
  review_count: number;
  published_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  path: string;
  children?: Category[];
  products_count?: number;
}

// ... остальные типы
```

### 4.5 Обработка ошибок

```typescript
// src/lib/api/client.ts — interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState();
      // Попытка refresh
      try {
        const newToken = await authApi.refresh();
        authStore.setToken(newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config); // retry
      } catch {
        authStore.clearSession();
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 5. Принципы

1. **API-first** — мобильное приложение не имеет прямого доступа к БД. Все данные через `/api/v1/client/*`.
2. **Offline-ready** — каталог и корзина работают при потере сети. Мутации в очереди.
3. **Type-safe** — строгий TypeScript, no `any`. Типы зеркалят API-контракты.
4. **Feature-isolated** — каждая фича независима. Зависимости только от `ui/`, `lib/`, `types/`.
5. **Consistent with web** — паттерны (Zustand, React Query, Axios) идентичны web-клиенту для простоты переключения между проектами.

---

## Следующий шаг

→ [04-design-system.md](04-design-system.md) — дизайн-система, темизация, компоненты

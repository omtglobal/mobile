# 12. Тестирование и CI/CD

Стратегия тестирования, инструменты, CI/CD pipeline и процесс релиза.

---

## 1. Пирамида тестирования

```
         ┌──────────┐
         │  E2E     │  ← Maestro (critical flows)
         │ (5-10)   │
        ┌┴──────────┴┐
        │ Integration │  ← React Native Testing Library
        │  (20-30)    │     (экраны с mock API)
       ┌┴────────────┴┐
       │   Unit Tests  │  ← Jest (stores, hooks, utils)
       │   (50-100)    │
       └──────────────┘
```

---

## 2. Unit Tests (Jest)

### 2.1 Что тестировать

| Слой | Что тестируем | Пример |
|------|---------------|--------|
| Stores | Actions, computed values | Cart: addItem, removeItem, totalPrice |
| Hooks | Custom logic hooks | useSearch (debounce), useBiometric |
| Utils | Pure functions | formatPrice, formatDate, validation |
| API | Request/response mapping | Правильные URL, headers, params |

### 2.2 Пример: Cart Store

```typescript
// __tests__/stores/cart.test.ts
import { useCartStore } from '../../src/lib/stores/cart';

const mockProduct = {
  id: 'product-1',
  title: 'Test Product',
  price: 99.99,
  // ...
};

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('adds item to cart', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('increments quantity for existing item', () => {
    useCartStore.getState().addItem(mockProduct, 1);
    useCartStore.getState().addItem(mockProduct, 3);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('calculates total price correctly', () => {
    useCartStore.getState().addItem(mockProduct, 2);
    expect(useCartStore.getState().totalPrice()).toBe(199.98);
  });
});
```

### 2.3 Пример: Utility Functions

```typescript
// __tests__/utils/format.test.ts
import { formatPrice, formatRelativeDate } from '../../src/lib/utils/format';

describe('formatPrice', () => {
  it('formats USD', () => {
    expect(formatPrice(99.99, 'USD')).toBe('$99.99');
  });

  it('formats zero', () => {
    expect(formatPrice(0, 'USD')).toBe('$0.00');
  });
});
```

---

## 3. Integration Tests (RNTL)

### 3.1 Setup

```typescript
// jest.setup.ts
import '@testing-library/react-native/extend-expect';
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3.2 MSW Handlers

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { API_BASE_URL, API_PREFIX } from '../constants/config';

const BASE = `${API_BASE_URL}${API_PREFIX}`;

export const handlers = [
  http.get(`${BASE}/catalog/home`, () =>
    HttpResponse.json({
      success: true,
      data: {
        categories: mockCategories,
        new_products: mockProducts,
        popular_products: mockProducts,
      },
    })
  ),
  http.get(`${BASE}/catalog/products/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      data: mockProducts.find(p => p.id === params.id) ?? null,
    })
  ),
  // ...
];
```

### 3.3 Пример: ProductCard

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '../../src/components/product/ProductCard';

describe('ProductCard', () => {
  const product = {
    id: '1',
    title: 'Test Product',
    price: 99.99,
    currency: 'USD',
    rating_avg: 4.5,
    review_count: 25,
    badges: ['choice'],
    primary_image: { thumbnail_url: 'https://example.com/img.jpg' },
  };

  it('displays product info', () => {
    render(<ProductCard product={product} onPress={jest.fn()} />);
    expect(screen.getByText('Test Product')).toBeTruthy();
    expect(screen.getByText('$99.99')).toBeTruthy();
    expect(screen.getByText('4.5')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ProductCard product={product} onPress={onPress} />);
    fireEvent.press(screen.getByText('Test Product'));
    expect(onPress).toHaveBeenCalledWith('1');
  });

  it('displays badges', () => {
    render(<ProductCard product={product} onPress={jest.fn()} />);
    expect(screen.getByText('Choice')).toBeTruthy();
  });
});
```

---

## 4. E2E Tests (Maestro)

### 4.1 Почему Maestro

- Простой YAML синтаксис
- Работает с iOS и Android
- Не требует модификации кода приложения
- Быстрая настройка

### 4.2 Critical Flows

```yaml
# e2e/flows/browse-and-cart.yaml
appId: com.ninhao.client
---
- launchApp
- assertVisible: "Поиск товаров"  # Home screen loaded

# Browse products
- scrollDown
- tapOn:
    index: 0
    below: "Популярные"
- assertVisible: "В корзину"  # Product detail loaded

# Add to cart
- tapOn: "В корзину"
- assertVisible: "Добавлено в корзину"

# Go to cart
- tapOn:
    id: "tab-cart"
- assertVisible: "Корзина"
- assertVisible: "Оформить заказ"
```

```yaml
# e2e/flows/login.yaml
appId: com.ninhao.client
---
- launchApp
- tapOn:
    id: "tab-profile"
- tapOn: "Войти"
- inputText:
    id: "email-input"
    text: "buyer@ninhao.local"
- inputText:
    id: "password-input"
    text: "password"
- tapOn: "Войти"
- assertVisible: "buyer@ninhao.local"  # Profile loaded
```

### 4.3 Список E2E сценариев

| # | Flow | Приоритет |
|---|------|-----------|
| 1 | Home → browse products → add to cart | P0 |
| 2 | Login → verify profile | P0 |
| 3 | Register → verify profile | P0 |
| 4 | Search → filter → view product | P1 |
| 5 | Cart → checkout → create order | P0 |
| 6 | View orders → order detail | P1 |
| 7 | Create support ticket | P2 |
| 8 | Manage addresses | P2 |

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions

```yaml
# .github/workflows/mobile.yml
name: Mobile CI

on:
  push:
    branches: [main]
    paths: ['apps/mobile/**']
  pull_request:
    paths: ['apps/mobile/**']

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/mobile
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: apps/mobile/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage

  eas-build-preview:
    needs: lint-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd apps/mobile && eas build --platform all --profile preview --non-interactive
```

### 5.2 Pipeline Stages

```
PR → Lint + TypeCheck + Unit Tests → Review
  ↓
Merge to main → Build Preview (EAS) → Internal Testing
  ↓
Tag release → Build Production (EAS) → Submit to stores
  ↓
Hotfix → EAS Update (OTA) → Instant deploy
```

### 5.3 Скрипты в package.json

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ app/ --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "e2e": "maestro test e2e/flows/",
    "prebuild": "expo prebuild",
    "build:preview": "eas build --profile preview",
    "build:production": "eas build --profile production",
    "submit": "eas submit",
    "update": "eas update"
  }
}
```

---

## 6. Релиз-процесс

### 6.1 Версионирование

Semantic Versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — breaking changes (новая навигация, redesign)
- **MINOR** — новые фичи (добавлен чекаут, push-уведомления)
- **PATCH** — багфиксы

Build number автоинкрементируется через EAS (`autoIncrement: true`).

### 6.2 Release Channels

| Channel | Назначение | Обновление |
|---------|-----------|-----------|
| development | Dev builds | Manual install |
| preview | QA / internal testing | EAS Build + internal distribution |
| production | App Store / Google Play | EAS Submit |

### 6.3 OTA Updates (EAS Update)

Для hotfix без прохождения review App Store:

```bash
# Обновить JS bundle без нативного rebuild
eas update --branch production --message "Fix: cart total calculation"
```

Ограничения OTA: нельзя менять нативный код, только JS/assets.

---

## Следующий шаг

→ [13-accessibility-i18n.md](13-accessibility-i18n.md) — доступность и локализация

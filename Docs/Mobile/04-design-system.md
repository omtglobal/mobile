# 04. Дизайн-система

Токены, цвета, типографика, компоненты и принципы визуального дизайна мобильного приложения.

---

## 1. Философия дизайна

**Ninhao Mobile** — чистый, минималистичный маркетплейс с акцентом на контент (фото товаров). Вдохновлён лучшими практиками AliExpress, но без визуального шума.

**Принципы:**
- **Content-first** — фото товаров в центре внимания, UI не конкурирует с контентом
- **Breathable** — достаточно воздуха (padding/margins) между элементами
- **Consistent** — одинаковые паттерны во всём приложении
- **Accessible** — контрастность 4.5:1+, touch targets 44pt+, Dynamic Type
- **Platform-native** — следовать гайдлайнам iOS (HIG) и Android (Material 3), используя единую дизайн-систему

---

## 2. Цветовая палитра

### 2.1 Brand Colors

| Токен | Light | Dark | Использование |
|-------|-------|------|---------------|
| `brand-primary` | `#FF6B00` | `#FF8533` | Основной акцент, CTA кнопки |
| `brand-secondary` | `#1A1A2E` | `#E8E8F0` | Заголовки, навигация |

### 2.2 Semantic Colors

| Токен | Light | Dark | Использование |
|-------|-------|------|---------------|
| `bg-primary` | `#FFFFFF` | `#0D0D0D` | Основной фон |
| `bg-secondary` | `#F5F5F7` | `#1C1C1E` | Вторичный фон (карточки, секции) |
| `bg-tertiary` | `#E8E8ED` | `#2C2C2E` | Третичный фон |
| `text-primary` | `#1A1A1A` | `#F5F5F7` | Основной текст |
| `text-secondary` | `#6B6B80` | `#8E8E93` | Вторичный текст |
| `text-tertiary` | `#AEAEB2` | `#636366` | Подсказки, disabled |
| `border-default` | `#E5E5EA` | `#38383A` | Разделители, бордеры |
| `border-strong` | `#C7C7CC` | `#48484A` | Активные бордеры |

### 2.3 Feedback Colors

| Токен | Light | Dark | Использование |
|-------|-------|------|---------------|
| `success` | `#34C759` | `#30D158` | Успех, подтверждения |
| `warning` | `#FF9500` | `#FFD60A` | Предупреждения |
| `error` | `#FF3B30` | `#FF453A` | Ошибки |
| `info` | `#007AFF` | `#0A84FF` | Информация |

### 2.4 Special

| Токен | Цвет | Использование |
|-------|------|---------------|
| `rating-star` | `#FFB800` | Звёзды рейтинга |
| `badge-choice` | `#FF6B00` | Бейдж "Choice" |
| `badge-sale` | `#FF3B30` | Бейдж "Best Sale" |
| `badge-brand` | `#007AFF` | Бейдж "Brand+" |
| `premium-plus` | `#9B59B6` | Premium Plus маркер |
| `discount` | `#FF3B30` | Скидка |

---

## 3. Типографика

Системные шрифты: **SF Pro** (iOS), **Roboto** (Android).

| Стиль | Размер | Weight | Line Height | Использование |
|-------|--------|--------|-------------|---------------|
| `heading-xl` | 28 | Bold (700) | 34 | Заголовки экранов |
| `heading-lg` | 22 | Semibold (600) | 28 | Заголовки секций |
| `heading-md` | 18 | Semibold (600) | 24 | Подзаголовки |
| `heading-sm` | 16 | Medium (500) | 22 | Заголовки карточек |
| `body-lg` | 16 | Regular (400) | 22 | Основной текст |
| `body-md` | 14 | Regular (400) | 20 | Стандартный текст |
| `body-sm` | 12 | Regular (400) | 16 | Мелкий текст, подписи |
| `caption` | 11 | Regular (400) | 14 | Минимальный текст |
| `price-lg` | 24 | Bold (700) | 30 | Цена на карточке товара |
| `price-md` | 18 | Bold (700) | 24 | Цена в списке |
| `button` | 16 | Semibold (600) | 20 | Текст на кнопках |

> Все размеры поддерживают Dynamic Type (iOS) и Font Scale (Android).

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (кратно 4px)

| Токен | Значение | Использование |
|-------|---------|---------------|
| `space-xs` | 4 | Минимальный отступ |
| `space-sm` | 8 | Между иконкой и текстом |
| `space-md` | 12 | Внутри компонентов |
| `space-lg` | 16 | Между компонентами |
| `space-xl` | 24 | Между секциями |
| `space-2xl` | 32 | Большие отступы |
| `space-3xl` | 48 | Секции на экране |

### 4.2 Screen Padding

- Горизонтальный padding экрана: `16px`
- Вертикальный padding между секциями: `24px`

### 4.3 Border Radius

| Токен | Значение | Использование |
|-------|---------|---------------|
| `radius-sm` | 6 | Бейджи, chip |
| `radius-md` | 10 | Кнопки, инпуты |
| `radius-lg` | 14 | Карточки товаров |
| `radius-xl` | 20 | Модалки, bottom sheet |
| `radius-full` | 9999 | Аватары, pills |

### 4.4 Shadows

| Уровень | Shadow | Использование |
|---------|--------|---------------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Тонкая тень |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Карточки |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Модалки, bottom sheet |

---

## 5. Компоненты дизайн-системы

### 5.1 Button

**Варианты:**

| Variant | Стиль | Использование |
|---------|-------|---------------|
| `primary` | Заливка brand-primary, белый текст | Основные действия (Купить, Войти) |
| `secondary` | Заливка bg-secondary, текст text-primary | Вторичные действия |
| `outline` | Бордер border-default, прозрачный фон | Альтернативные действия |
| `ghost` | Без фона, текст brand-primary | Ссылки-действия |
| `destructive` | Заливка error, белый текст | Удаление |

**Размеры:**

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32 | 12h, 8v | body-sm |
| `md` | 44 | 16h, 12v | button |
| `lg` | 52 | 20h, 14v | button |

**Состояния:** default, pressed (opacity 0.8), disabled (opacity 0.5), loading (spinner).

### 5.2 Input

- Height: 48px
- Border: 1px `border-default`, при фокусе `brand-primary`
- Border radius: `radius-md`
- Placeholder: `text-tertiary`
- Error state: border `error`, текст ошибки под полем

### 5.3 Card (карточка товара)

```
┌────────────────────┐
│  ┌──────────────┐  │
│  │              │  │
│  │    Фото      │  │
│  │   (1:1)      │  │
│  │              │  │
│  └──────────────┘  │
│  [Choice] [Sale]   │  ← badges
│  Product Title...  │  ← heading-sm, max 2 lines
│  ★ 4.5 (25)       │  ← rating + count
│  $99.99            │  ← price-md, brand-primary
│  Company Name      │  ← body-sm, text-secondary
└────────────────────┘
```

- Ширина: 50% экрана минус padding (2 колонки)
- Фото: aspect ratio 1:1, rounded top corners
- Touch target: вся карточка
- Haptic feedback при нажатии

### 5.4 Badge

| Тип | Фон | Текст | Пример |
|-----|-----|-------|--------|
| Choice | `badge-choice` | white | "Choice" |
| Best Sale | `badge-sale` | white | "Best Sale" |
| Brand+ | `badge-brand` | white | "Brand+" |
| Discount | `discount` | white | "-30%" |
| Premium Plus | `premium-plus` | white | "Premium+" |
| Status | varies | varies | "Shipped", "Paid" |

Size: height 20px, padding 6h, font caption, radius-sm.

### 5.5 Bottom Sheet

- Background: `bg-primary`
- Radius top: `radius-xl`
- Handle: 36x5, centered, `border-default`
- Shadow: `shadow-lg`
- Анимация: spring (Reanimated), drag to dismiss
- Используется для: фильтров, сортировки, деталей

### 5.6 Toast / Snackbar

- Position: bottom, 16px от SafeArea
- Background: `text-primary` (тёмный на light, светлый на dark)
- Text: white
- Duration: 3 секунды
- Типы: success (зелёная иконка), error (красная), info (синяя)

### 5.7 Skeleton Loading

- Цвет: `bg-secondary` → `bg-tertiary` shimmer animation
- Формы повторяют layout: прямоугольники для текста, квадраты для фото
- Длительность shimmer: 1.5s loop

---

## 6. Иконки

**Библиотека:** Lucide React Native (совместимость с web-клиентом).

| Контекст | Иконки |
|----------|--------|
| Tab Bar | Home, LayoutGrid, ShoppingCart, Package, User |
| Actions | Search, Heart, Share, ChevronLeft, ChevronRight |
| Status | Check, X, AlertCircle, Clock, Truck |
| Misc | Star, Filter, SlidersHorizontal, Plus, Minus, Trash2 |

Размеры: 20 (inline), 24 (tab/action), 32 (empty state), 48 (large empty state).

---

## 7. Dark Mode

- Переключение: системная настройка (automatic) + ручной override в Settings
- Все цвета через токены — автоматическое переключение
- Изображения: без изменений (пользовательский контент)
- Тени: в dark mode уменьшить opacity или заменить на border

```typescript
// src/constants/theme.ts
export const lightTheme = {
  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F5F5F7',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B6B80',
    brandPrimary: '#FF6B00',
    // ...
  },
};

export const darkTheme = {
  colors: {
    bgPrimary: '#0D0D0D',
    bgSecondary: '#1C1C1E',
    textPrimary: '#F5F5F7',
    textSecondary: '#8E8E93',
    brandPrimary: '#FF8533',
    // ...
  },
};
```

---

## 8. Анимации

| Тип | Библиотека | Параметры |
|-----|-----------|-----------|
| Переходы экранов | React Navigation | Shared element transitions |
| Scroll анимации | Reanimated | Parallax header, sticky elements |
| Gesture-based | Gesture Handler + Reanimated | Swipe to dismiss, pull to refresh |
| Micro-interactions | Reanimated | Button press scale (0.95), heart like, add to cart |
| Loading | Reanimated | Shimmer, skeleton |
| Toast | Reanimated | Slide up + fade |
| Bottom Sheet | @gorhom/bottom-sheet | Spring animation, snap points |

### Стандартные параметры пружины

```typescript
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};
```

---

## 9. Адаптивность

| Устройство | Ширина | Колонки товаров | Поведение |
|-----------|--------|----------------|-----------|
| iPhone SE | 375 | 2 | Компактный layout |
| iPhone 15 | 393 | 2 | Стандартный layout |
| iPhone 15 Pro Max | 430 | 2 | Увеличенные карточки |
| iPad (portrait) | 820 | 3 | Расширенный grid |
| iPad (landscape) | 1180 | 4 | Split view ready |

---

## Следующий шаг

→ [05-navigation.md](05-navigation.md) — навигация, deep linking, жесты

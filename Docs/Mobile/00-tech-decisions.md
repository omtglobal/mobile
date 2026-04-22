# 00. Технологические решения

Обоснование выбора стека, архитектуры и ключевых решений для мобильного приложения маркетплейса.

---

## 1. Почему React Native + Expo

### Контекст

Текущий проект использует:
- **Client Storefront** — Next.js, React, TypeScript, Tailwind, Zustand, React Query
- **Seller Cabinet** — React + Vite, TypeScript, Tailwind
- **API** — Laravel, JWT auth, REST JSON

### Сравнение вариантов

| Критерий | Swift/SwiftUI | React Native + Expo | Flutter |
|----------|--------------|---------------------|---------|
| Кросс-платформа | iOS only | iOS + Android | iOS + Android |
| Язык | Swift | TypeScript (уже в проекте) | Dart (новый для команды) |
| Переиспользование кода | Нет | Типы, API клиент, бизнес-логика из web | Нет |
| Экосистема | Apple-only | npm + React экосистема | pub.dev |
| OTA-обновления | Нет (только App Store) | Expo Updates (мгновенные) | Нет (нативно) |
| Push-уведомления | APNs вручную | Expo Notifications (iOS + Android) | Firebase вручную |
| Нативный доступ | Полный | Expo Modules + TurboModules | Platform Channels |
| Time-to-market | Долгий (1 платформа) | Быстрый (2 платформы сразу) | Средний |
| Производительность | Нативная | Близка к нативной (New Architecture) | Нативная (Skia) |

### Решение: **React Native + Expo SDK 53+**

**Причины:**

1. **Единый стек** — команда уже работает с React + TypeScript. Минимальный порог входа.
2. **Переиспользование** — API типы (`types/index.ts`), паттерны Zustand/React Query, утилиты из web-клиента.
3. **Кросс-платформа** — iOS и Android из одного кодбайза. Для маркетплейса критично покрытие обеих платформ.
4. **Expo** — managed workflow с EAS Build, OTA Updates, Push Notifications, встроенный Router (file-based).
5. **New Architecture** — Fabric renderer + TurboModules включены по умолчанию в Expo SDK 53. Производительность близка к нативной.
6. **AliExpress-like UX** — React Native способен на сложные анимации (Reanimated), жесты (Gesture Handler), нативные переходы.

---

## 2. Ключевые технологии

| Компонент | Технология | Версия | Назначение |
|-----------|------------|--------|------------|
| Фреймворк | React Native | 0.79+ | UI runtime |
| Платформа | Expo SDK | 53+ | Managed workflow, EAS |
| Навигация | Expo Router | v4 | File-based routing (как Next.js) |
| UI Kit | Tamagui или NativeWind | latest | Стилизация (Tailwind-подобная для RN) |
| Анимации | React Native Reanimated | 3.x | 60fps анимации на UI thread |
| Жесты | React Native Gesture Handler | 2.x | Нативные жесты |
| Состояние | Zustand | 5.x | Клиентское состояние (auth, cart) |
| Серверный стейт | TanStack React Query | 5.x | Кеширование API, пагинация |
| HTTP | Axios | 1.x | HTTP клиент (совместимость с web) |
| Хранилище | expo-secure-store | latest | JWT токены (Keychain/Keystore) |
| Изображения | expo-image | latest | Кеширование, placeholder, blurhash |
| Push | expo-notifications | latest | Push-уведомления iOS + Android |
| Аналитика | expo-analytics (custom) | - | События в ClickHouse через API |
| Тесты | Jest + React Native Testing Library | latest | Unit + Component тесты |
| E2E | Maestro | latest | E2E тесты на симуляторе/устройстве |
| CI/CD | EAS Build + EAS Submit | latest | Сборка и публикация |

---

## 3. Архитектурные решения

### 3.1 Feature-based структура

Код организован по фичам (features), а не по типам файлов. Каждая фича содержит свои экраны, компоненты, хуки и сервисы. Это зеркалит модульную структуру бекенда (`/modules/*`).

### 3.2 Offline-first подход

- Каталог и продукты кешируются локально (React Query persistence + MMKV).
- Корзина работает полностью офлайн (Zustand + persist).
- При потере сети — показываем кешированные данные с индикатором offline.
- Мутации (отзывы, тикеты) ставятся в очередь и синхронизируются при восстановлении сети.

### 3.3 Аутентификация

- JWT хранится в Secure Store (Keychain на iOS, EncryptedSharedPreferences на Android).
- Биометрическая аутентификация (Face ID / Touch ID / Fingerprint) для быстрого входа.
- Автоматический refresh токена при 401.
- Гостевой режим: каталог, поиск, корзина доступны без входа.

### 3.4 Навигация

- Expo Router (file-based) — привычно для команды, знакомой с Next.js App Router.
- Deep linking / Universal Links для маркетинга и шеринга.
- Bottom Tab Navigation: Главная, Каталог, Корзина, Заказы, Профиль.

### 3.5 Дизайн-система

- Собственная дизайн-система с токенами (цвета, типографика, отступы).
- Поддержка Dark Mode из коробки.
- Компонентная библиотека с вариантами (primary, secondary, ghost и т.д.).
- Адаптация под разные размеры экранов (iPhone SE → iPad).

---

## 4. Отличия от AliExpress

### Что берём от AliExpress
- Bottom tab navigation (5 табов)
- Бесконечный скролл товаров
- Карточки товаров с фото, ценой, рейтингом, бейджами
- Галерея фото товара с зумом
- Фильтры и сортировка в bottom sheet
- Корзина с выбором товаров для оплаты
- Pull-to-refresh
- Поисковая строка на главном экране

### Наш уникальный стиль
- **Чистый минималистичный дизайн** — без визуального шума, больше воздуха между элементами
- **Плавные анимации** — spring-based переходы, skeleton loading, shimmer эффекты
- **Современная типографика** — SF Pro (iOS) / Roboto (Android) с продуманной иерархией
- **Адаптивные карточки** — не фиксированная сетка, а masonry layout для разнообразия
- **Акцентные микро-взаимодействия** — haptic feedback при добавлении в корзину, анимация лайка
- **Progressive disclosure** — информация раскрывается постепенно, без перегрузки экрана
- **Smart suggestions** — умные рекомендации на основе истории просмотров (client-side)

---

## 5. Целевые платформы и поддержка

| Платформа | Минимальная версия | Целевая версия |
|-----------|-------------------|----------------|
| iOS | 16.0 | Latest (18.x) |
| Android | API 24 (Android 7.0) | API 35 (Android 15) |

**Целевые устройства:**
- iPhone SE 3 → iPhone 16 Pro Max
- iPad (базовая поддержка, адаптивный layout)
- Android: 5"–7" экраны, foldables (базовая поддержка)

---

## 6. Сравнение с текущим Web-клиентом

| Аспект | Web (Next.js) | Mobile (React Native) |
|--------|--------------|----------------------|
| Рендеринг | SSR + CSR | Client-side |
| Навигация | URL-based | Stack + Tab |
| Стили | Tailwind CSS | NativeWind / Tamagui |
| Изображения | next/image + CDN | expo-image + cache |
| Хранилище | localStorage | SecureStore + MMKV |
| Push | Нет | Expo Notifications |
| Offline | Нет | React Query persistence |
| Биометрия | Нет | Face ID / Fingerprint |
| Анимации | CSS transitions | Reanimated (60fps) |

---

## 7. Риски и митигация

| Риск | Вероятность | Митигация |
|------|------------|-----------|
| Производительность длинных списков | Средняя | FlashList вместо FlatList, виртуализация |
| Размер бандла | Средняя | Tree-shaking, lazy imports, Hermes engine |
| Нативные модули | Низкая | Expo Modules API, fallback на community packages |
| Совместимость Android-фрагментация | Средняя | Тестирование на 5+ устройствах, EAS Preview |
| Push-уведомления на Android | Средняя | FCM setup, правильная обработка permissions |
| Обновления App Store | Низкая | EAS Update для hotfix, standard review для features |

---

## Следующий шаг

→ [01-environment-setup.md](01-environment-setup.md) — настройка окружения разработки

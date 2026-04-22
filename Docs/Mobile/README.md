# Ninhao Super App — Mobile

Документация по разработке кросс-платформенного суперприложения на **React Native + Expo**.

**Три столпа:** 🛒 Маркетплейс (центр) · 💬 Мессенджер (свайп вправо) · 📹 Видео (свайп влево)

**Принцип:** приложение не обращается к БД напрямую; все данные через Laravel API (`/api/v1/client/*`).

**Стиль** — чистый минималистичный дизайн, вдохновлённый лучшим из AliExpress, WhatsApp и TikTok, но без визуального шума. Уникальный UX с акцентом на social commerce и shoppable video.

---

## Стек

| Компонент | Технология |
|-----------|------------|
| Платформа | iOS 16+ / Android 7+ |
| Framework | React Native + Expo SDK 53+ |
| Язык | TypeScript (strict) |
| Навигация | Expo Router v4 (file-based) + PagerView (swipe) |
| State | Zustand (client) + TanStack React Query (server) |
| HTTP / Realtime | Axios + WebSocket (сервис `realtime-service`, см. [18-messenger-implementation.md](18-messenger-implementation.md)) |
| UI/Стили | NativeWind (Tailwind для RN) |
| Анимации | React Native Reanimated 3 |
| Тесты | Jest + RNTL + Maestro (E2E) |
| CI/CD | EAS Build + EAS Submit |

---

## Связь с проектом

| Документ | Описание |
|----------|----------|
| [03-client-platform.md](../Architecture/03-client-platform.md) | Архитектура клиентской платформы |
| [events-and-contracts.md](../MVP/events-and-contracts.md) | Контракты API, события |
| `apps/client/` | Web-клиент (Next.js) — референс для паттернов и типов |

---

## Документация

### Основа

| № | Документ | Описание |
|---|----------|----------|
| 00 | [00-tech-decisions.md](00-tech-decisions.md) | Обоснование стека, сравнение вариантов, архитектурные решения |
| 01 | [01-environment-setup.md](01-environment-setup.md) | Настройка окружения: Node, Expo, Xcode, Android Studio |
| 02 | [02-api-contracts.md](02-api-contracts.md) | Полный справочник API эндпоинтов с форматами запросов/ответов |

### Архитектура и дизайн

| № | Документ | Описание |
|---|----------|----------|
| 03 | [03-architecture.md](03-architecture.md) | Структура проекта, state management, паттерны, типы |
| 04 | [04-design-system.md](04-design-system.md) | Цвета, типографика, spacing, компоненты UI, Dark Mode |
| 05 | [05-navigation.md](05-navigation.md) | PagerView + Tab/Stack навигация, Deep Linking, жесты |
| 06 | [06-network-and-auth.md](06-network-and-auth.md) | HTTP-клиент, JWT lifecycle, биометрия, offline режим |

### Экраны (маркетплейс)

| № | Документ | Описание |
|---|----------|----------|
| 07 | [07-screens-catalog.md](07-screens-catalog.md) | Главная, категории, товары, поиск, продавец |
| 08 | [08-screens-cart-orders.md](08-screens-cart-orders.md) | Корзина, оформление заказа, список и детали заказов |
| 09 | [09-screens-profile-support.md](09-screens-profile-support.md) | Вход, регистрация, профиль, адреса, настройки, поддержка |

### Инфраструктура

| № | Документ | Описание |
|---|----------|----------|
| 10 | [10-push-analytics.md](10-push-analytics.md) | Push-уведомления (Expo), аналитика (ClickHouse) |
| 11 | [11-performance.md](11-performance.md) | Изображения, списки, кеш, bundle size, startup |
| 12 | [12-testing-cicd.md](12-testing-cicd.md) | Unit/Integration/E2E тесты, CI/CD, релиз-процесс |
| 13 | [13-accessibility-i18n.md](13-accessibility-i18n.md) | Accessibility (VoiceOver/TalkBack), i18n (ru/en) |

### Суперприложение (Мессенджер + Видео)

| № | Документ | Описание |
|---|----------|----------|
| 14 | [14-superapp-vision.md](14-superapp-vision.md) | **Видение:** три столпа, тренды, конкурентный анализ, архитектурный фундамент |
| 15 | [15-messenger-spec.md](15-messenger-spec.md) | **Мессенджер:** чаты, Круги друзей, голосовые, стикеры, E2E encryption |
| 16 | [16-video-platform-spec.md](16-video-platform-spec.md) | **Видео:** shoppable video, лента, загрузка, product tagging, алгоритм |
| 18 | [18-messenger-implementation.md](18-messenger-implementation.md) | **Реализация мессенджера:** что сделано в коде (mobile + Laravel + Go + мост с тикетами) |
| 19 | [19-account-deletion-backend-spec.md](19-account-deletion-backend-spec.md) | **Backend-спека:** эндпоинт удаления аккаунта (Apple 5.1.1(v)) |
| 20 | [20-privacy-policy-account-deletion.md](20-privacy-policy-account-deletion.md) | **Privacy Policy:** готовый раздел про удаление аккаунта для `ninhao.shop/privacy` |

### Статус и чеклист

| Документ | Описание |
|----------|----------|
| [17-implementation-status.md](17-implementation-status.md) | Текущий статус по фазам, оставшиеся шаги |
| [../../MOBILE-CHECKLIST.md](../../MOBILE-CHECKLIST.md) | Краткий чеклист (корень проекта) |

### Для AI-агентов

| Документ | Описание |
|----------|----------|
| [AI-AGENT-INSTRUCTIONS.md](AI-AGENT-INSTRUCTIONS.md) | **Мастер-руководство:** все фазы (0-7+), правила, справочник |

---

## Фазы реализации

| Фаза | Описание | Статус | Документы |
|------|----------|--------|-----------|
| **0** | Инфраструктура: проект, PagerView root, навигация, UI kit, API client, stores | ✅ | 01, 03, 04, 05, 06, 14 |
| **1** | Каталог: главная, товары, категории, поиск, продавец | ✅ | 07 |
| **2** | Авторизация: login, register, профиль, адреса, биометрия | ✅ | 06, 09 |
| **3** | Покупки: корзина, checkout, заказы, оплата | ✅ | 08 |
| **4** | Отзывы и поддержка: reviews, тикеты | ✅ | 07, 09 |
| **5** | Polish: dark mode, offline, push, analytics, i18n, a11y, тесты, CI/CD | 🟡 | 10-13 |
| **6** | Мессенджер: чаты, Круги друзей, голосовые, product sharing, E2E шифрование | 🟡 MVP: UI + API + realtime + мост; полная спека 15 — впереди | 15, **18** |
| **7** | Видео: лента, shoppable video, загрузка, product tagging, алгоритм | 🟡 MVP: лента + API + кабинет продавца; полная спека 16 — впереди | 16 |
| **8+** | Live Commerce, AR, AI Assistant, голосовой поиск, Creator monetization | ⏸ | 14 §7 |

Детальный план — [AI-AGENT-INSTRUCTIONS.md](AI-AGENT-INSTRUCTIONS.md). Текущий статус — [17-implementation-status.md](17-implementation-status.md).

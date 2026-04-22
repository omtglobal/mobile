# AI Agent Instructions — Mobile App Implementation

Мастер-руководство для AI-агентов, реализующих мобильное приложение Ninhao.

---

## Контекст проекта

Ты реализуешь мобильное приложение для международного маркетплейса **Ninhao** (аналог AliExpress). Приложение — клиент для покупателей, работает через REST API (`/api/v1/client/*`). Бекенд (Laravel) уже реализован и задеплоен.

**Ключевое:** приложение НЕ обращается к БД напрямую. ВСЕ данные через API.

---

## Обязательно прочитай перед началом работы

1. `CLAUDE.md` — корневой файл проекта, общие правила
2. `Docs/Mobile/README.md` — навигация по документации
3. `Docs/Mobile/00-tech-decisions.md` — почему React Native + Expo
4. `Docs/Mobile/02-api-contracts.md` — ВСЕ эндпоинты API с форматами
5. `Docs/Mobile/03-architecture.md` — структура проекта и паттерны
6. `Docs/Mobile/04-design-system.md` — дизайн-токены, цвета, компоненты

---

## Технический стек (НЕ менять)

| Компонент | Технология |
|-----------|------------|
| Framework | React Native + Expo SDK 53+ |
| Routing | Expo Router v4 (file-based) |
| Language | TypeScript (strict) |
| State (client) | Zustand 5 + persist (MMKV) |
| State (server) | TanStack React Query 5 |
| HTTP | Axios |
| Animations | React Native Reanimated 3 |
| Gestures | React Native Gesture Handler 2 |
| Images | expo-image |
| Secure Storage | expo-secure-store |
| Lists | @shopify/flash-list |
| Icons | lucide-react-native |
| Push | expo-notifications |
| Biometric | expo-local-authentication |
| Testing | Jest + RNTL + Maestro (E2E) |

---

## Порядок реализации (фазы)

### Фаза 0: Инфраструктура (Foundation)

**Цель:** рабочий проект с навигацией и базовыми компонентами.

| # | Задача | Документ | Критерий готовности |
|---|--------|----------|-------------------|
| 0.1 | Создать Expo проект в `apps/mobile/` | 01-environment-setup.md | `npx expo start` работает |
| 0.2 | Настроить TypeScript, ESLint, Prettier | 01-environment-setup.md | `npm run lint && npm run typecheck` без ошибок |
| 0.3 | Создать структуру папок по 03-architecture.md | 03-architecture.md | Все папки из структуры существуют |
| 0.4 | Реализовать дизайн-токены (theme.ts) | 04-design-system.md | Light + Dark theme, все токены |
| 0.5 | Реализовать UI-компоненты: Button, Text, Input, Card, Badge, Skeleton | 04-design-system.md | Компоненты рендерятся, поддерживают variants |
| 0.6 | Настроить Tab Navigation (5 табов) | 05-navigation.md | Переключение между табами работает |
| 0.7 | Настроить Stack Navigation | 05-navigation.md | Push/pop экранов работает |
| 0.8 | Реализовать API client (Axios + interceptors) | 06-network-and-auth.md | Запрос к `/health` возвращает 200 |
| 0.9 | Реализовать Zustand stores (auth, cart, preferences) | 03-architecture.md | Stores persist в MMKV |
| 0.10 | Настроить React Query provider | 03-architecture.md | Queries работают |

### Фаза 1: Каталог (Core Shopping)

**Цель:** пользователь может просматривать товары и добавлять в корзину.

| # | Задача | Документ |
|---|--------|----------|
| 1.1 | Home Screen: categories + new + popular products | 07-screens-catalog.md §1 |
| 1.2 | SearchBar компонент (навигация на /search) | 07-screens-catalog.md §1 |
| 1.3 | ProductCard компонент | 04-design-system.md §5.3 |
| 1.4 | ProductGrid (FlashList, 2 колонки, infinite scroll) | 07-screens-catalog.md §7 |
| 1.5 | Product Detail Screen (gallery, info, seller, reviews preview) | 07-screens-catalog.md §4 |
| 1.6 | ProductGallery (swipe, zoom, page indicator) | 07-screens-catalog.md §4 |
| 1.7 | Add to Cart (haptic, toast, badge update) | 07-screens-catalog.md §4 |
| 1.8 | Category List Screen (tree) | 07-screens-catalog.md §2 |
| 1.9 | Category Products Screen (filters, sort) | 07-screens-catalog.md §3 |
| 1.10 | Search Screen (debounce, history, filters) | 07-screens-catalog.md §5 |
| 1.11 | Seller Profile Screen | 07-screens-catalog.md §6 |

### Фаза 2: Авторизация и профиль

**Цель:** вход, регистрация, профиль, управление адресами.

| # | Задача | Документ |
|---|--------|----------|
| 2.1 | Login Screen | 09-screens-profile-support.md §2 |
| 2.2 | Register Screen | 09-screens-profile-support.md §3 |
| 2.3 | JWT token management (SecureStore, auto-refresh) | 06-network-and-auth.md §2 |
| 2.4 | Auth guard (protected routes) | 05-navigation.md §3.3 |
| 2.5 | Profile Screen (guest + authorized) | 09-screens-profile-support.md §1 |
| 2.6 | Biometric auth (Face ID / Fingerprint) | 06-network-and-auth.md §3 |
| 2.7 | Address List + Create/Edit/Delete | 09-screens-profile-support.md §4 |
| 2.8 | Settings Screen (theme, language, biometric) | 09-screens-profile-support.md §5 |

### Фаза 3: Корзина и заказы

**Цель:** полный покупательский flow.

| # | Задача | Документ |
|---|--------|----------|
| 3.1 | Cart Screen (selection, quantity, totals) | 08-screens-cart-orders.md §1 |
| 3.2 | Checkout Screen (address, items, confirm) | 08-screens-cart-orders.md §2 |
| 3.3 | Order creation flow | 08-screens-cart-orders.md §2 |
| 3.4 | Orders List Screen | 08-screens-cart-orders.md §3 |
| 3.5 | Order Detail Screen | 08-screens-cart-orders.md §4 |
| 3.6 | Mock Payment flow | 08-screens-cart-orders.md §5 |

### Фаза 4: Отзывы и поддержка

| # | Задача | Документ |
|---|--------|----------|
| 4.1 | Review List + StarRating component | 07-screens-catalog.md §4 |
| 4.2 | Create/Edit/Delete Review | 02-api-contracts.md §3 |
| 4.3 | Ticket List Screen | 09-screens-profile-support.md §6 |
| 4.4 | Create Ticket Screen | 09-screens-profile-support.md §7 |
| 4.5 | Ticket Detail Screen (chat-like) | 09-screens-profile-support.md §8 |

### Фаза 5: Polish

| # | Задача | Документ |
|---|--------|----------|
| 5.1 | Dark Mode | 04-design-system.md §7 |
| 5.2 | Offline mode (React Query persist, network banner) | 06-network-and-auth.md §4 |
| 5.3 | Push Notifications | 10-push-analytics.md §1 |
| 5.4 | Analytics tracking | 10-push-analytics.md §2 |
| 5.5 | Deep Linking / Universal Links | 05-navigation.md §4 |
| 5.6 | i18n (ru + en) | 13-accessibility-i18n.md §2 |
| 5.7 | Accessibility audit | 13-accessibility-i18n.md §1 |
| 5.8 | Performance optimization | 11-performance.md |
| 5.9 | Unit + Integration tests | 12-testing-cicd.md §2-3 |
| 5.10 | E2E tests (Maestro) | 12-testing-cicd.md §4 |
| 5.11 | CI/CD setup | 12-testing-cicd.md §5 |

### Фаза 6: Мессенджер (после завершения маркетплейса)

> Подробная спецификация: [15-messenger-spec.md](15-messenger-spec.md)

| # | Задача | Документ |
|---|--------|----------|
| 6.1 | Backend: Messaging module + WebSocket service (Go) | 15-messenger-spec.md §4, §7 |
| 6.2 | Контакты: поиск по email/phone, добавление, список | 15-messenger-spec.md §4 |
| 6.3 | Личные чаты: текст, emoji, стикеры | 15-messenger-spec.md §2.3 |
| 6.4 | Голосовые сообщения + AI транскрипция | 15-messenger-spec.md §5 |
| 6.5 | Файлы и медиа в чате (фото, видео, документы) | 15-messenger-spec.md §2.3 |
| 6.6 | Product sharing (rich preview в чате) | 15-messenger-spec.md §2.4 |
| 6.7 | Круги друзей: создание, управление, чат | 15-messenger-spec.md §3 |
| 6.8 | Общий wishlist и совместная корзина в Круге | 15-messenger-spec.md §3.3 |
| 6.9 | E2E шифрование (Signal Protocol) | 15-messenger-spec.md §10 |
| 6.10 | Push-уведомления + badges + звуки | 15-messenger-spec.md §7.3 |

### Фаза 7: Видеоплатформа (после мессенджера)

> Подробная спецификация: [16-video-platform-spec.md](16-video-platform-spec.md)

| # | Задача | Документ |
|---|--------|----------|
| 7.1 | Backend: Content module + Video service (Go, FFmpeg) | 16-video-platform-spec.md §10 |
| 7.2 | Видеоплеер (вертикальный, fullscreen, HLS) | 16-video-platform-spec.md §4 |
| 7.3 | Бесконечная лента ("Для вас" + "Подписки") | 16-video-platform-spec.md §2.2, §7 |
| 7.4 | Лайки + комментарии (threaded) | 16-video-platform-spec.md §5 |
| 7.5 | Загрузка видео (камера + галерея + редактор) | 16-video-platform-spec.md §6 |
| 7.6 | Product tagging (привязка товаров к видео) | 16-video-platform-spec.md §6.4 |
| 7.7 | Shoppable video (покупка из видео) | 16-video-platform-spec.md §3 |
| 7.8 | Пересылка видео в мессенджер | 16-video-platform-spec.md §9 |
| 7.9 | Профиль создателя + подписки | 16-video-platform-spec.md §8 |
| 7.10 | Content moderation (AI) | 16-video-platform-spec.md §11 |

### Phase 8+ (будущее)

Live Commerce, AR примерка товаров, AI Shopping Assistant, голосовой поиск, Creator monetization, видеоотзывы привязанные к SKU, совместный просмотр (watch party), групповые скидки из Кругов.

---

## Критическое: что заложить в Phase 0

При реализации Phase 0 (Foundation) обязательно:

1. **PagerView как корень** — `app/_layout.tsx` использует `react-native-pager-view` с 3 страницами. Центральная = маркетплейс. Боковые = placeholder.
2. **Page indicator** — три точки вверху (○ ● ○), с badge для мессенджера.
3. **Типы** — создать скелеты `src/types/messaging.ts` и `src/types/content.ts` (пустые интерфейсы для будущих фаз).
4. **Зависимость** — установить `react-native-pager-view`.
5. **Shared компоненты** — создать `ProductPreviewCard`, `UserAvatar`, `ShareSheet` (используются и в маркетплейсе, и в будущих фазах).

---

## Правила для AI-агентов

### Общие

1. **Читай документацию перед реализацией.** Каждый документ содержит точные спецификации.
2. **Не придумывай эндпоинты.** Все API-контракты в `02-api-contracts.md`. Если эндпоинта нет — не реализуй фичу.
3. **Не модифицируй бекенд** без явного указания. Мобильное приложение — клиент.
4. **Следуй структуре из 03-architecture.md.** Не создавай файлы вне этой структуры.
5. **TypeScript strict.** Никаких `any`, `@ts-ignore`, `as unknown as`.
6. **Тестируй на обеих платформах.** iOS + Android.

### Код

7. **Компоненты:** маленькие, переиспользуемые. Один компонент = один файл. Max 200 строк.
8. **Hooks:** вся бизнес-логика в custom hooks. Компоненты экранов — тонкие.
9. **Zustand** — только для client state (auth, cart, preferences). НЕ для серверных данных.
10. **React Query** — для ВСЕХ серверных данных. Используй `queryKeys` factory.
11. **Не используй `useEffect` для data fetching.** Только React Query.
12. **Мемоизация:** `React.memo` для list items, `useCallback` для event handlers в lists.
13. **FlashList** вместо FlatList для длинных списков. Всегда указывай `estimatedItemSize`.

### Стилизация

14. **Дизайн-токены** из `04-design-system.md`. Не хардкодь цвета и размеры.
15. **Dark Mode** из коробки. Все цвета через тему.
16. **Touch targets** минимум 44pt.
17. **Accessibility labels** на всех интерактивных элементах.

### API

18. **Axios instance** из `src/lib/api/client.ts`. Не создавай новые.
19. **Обработка ошибок:** 401 → auto-refresh → retry. 422 → показать ошибки полей. 5xx → retry + generic error.
20. **Не кешируй вручную.** React Query управляет кешем.

### Навигация

21. **Expo Router file-based.** Каждый экран — файл в `app/`.
22. **Deep links** для всех публичных экранов (product, category, seller, search).
23. **Auth guard** через `useAuthStore` — показывай AuthPrompt для protected screens.

### Тестирование

24. **Unit-тесты** для stores, hooks, utils — при создании.
25. **Integration-тесты** для ключевых компонентов — при создании.
26. **E2E** — после завершения каждой фазы.

---

## Справочник: что где

| Нужно | Смотри |
|-------|--------|
| Все API эндпоинты | `02-api-contracts.md` |
| Структура папок | `03-architecture.md` §2 |
| Query Keys | `03-architecture.md` §3.3 |
| Zustand stores | `03-architecture.md` §3.4 |
| Цвета, шрифты, отступы | `04-design-system.md` §2-4 |
| UI компоненты (Button, Card, Badge) | `04-design-system.md` §5 |
| Tab Bar конфигурация | `05-navigation.md` §2 |
| Deep linking URLs | `05-navigation.md` §4 |
| Axios config + interceptors | `06-network-and-auth.md` §1 |
| JWT lifecycle | `06-network-and-auth.md` §2 |
| Biometric auth | `06-network-and-auth.md` §3 |
| Offline режим | `06-network-and-auth.md` §4 |
| Home screen layout | `07-screens-catalog.md` §1 |
| Product Detail layout | `07-screens-catalog.md` §4 |
| Search layout | `07-screens-catalog.md` §5 |
| Cart layout | `08-screens-cart-orders.md` §1 |
| Checkout flow | `08-screens-cart-orders.md` §2 |
| Login/Register | `09-screens-profile-support.md` §2-3 |
| Push notifications | `10-push-analytics.md` §1 |
| Analytics events | `10-push-analytics.md` §2 |
| FlashList best practices | `11-performance.md` §2 |
| Image optimization | `11-performance.md` §1 |
| Test examples | `12-testing-cicd.md` §2-4 |
| i18n setup | `13-accessibility-i18n.md` §2 |
| Accessibility checklist | `13-accessibility-i18n.md` §1 |
| Superapp vision & architecture | `14-superapp-vision.md` |
| Messenger full spec | `15-messenger-spec.md` |
| Video platform full spec | `16-video-platform-spec.md` |
| PagerView root layout | `14-superapp-vision.md` §5.1 |
| Messenger data models | `15-messenger-spec.md` §8 |
| Video data models | `16-video-platform-spec.md` §10.3 |

---

## Пример workflow для агента

```
1. Получить задачу: "Реализовать Product Detail Screen"
2. Прочитать: 07-screens-catalog.md §4 (layout, поведение, компоненты)
3. Прочитать: 02-api-contracts.md §3 (GET /catalog/products/{id}/page)
4. Прочитать: 04-design-system.md (токены для карточки)
5. Прочитать: 03-architecture.md (структура файлов)
6. Создать файлы:
   - app/product/[id].tsx (screen)
   - src/components/product/ProductGallery.tsx
   - src/components/product/StickyAddToCart.tsx
   - src/lib/hooks/useProduct.ts (React Query hook)
7. Реализовать, следуя спецификации из документов
8. Добавить accessibility labels
9. Написать unit-тест для useProduct hook
10. Проверить на iOS + Android
```

---

## Часто задаваемые вопросы

**Q: Где хранить JWT токен?**
A: `expo-secure-store` (Keychain/EncryptedSharedPreferences). НЕ AsyncStorage.

**Q: Как работает корзина?**
A: Полностью локально (Zustand + MMKV persist). Серверного API корзины нет.

**Q: Какой минимальный iOS/Android?**
A: iOS 16+, Android API 24+ (Android 7.0).

**Q: Как обрабатывать 401?**
A: Auto-refresh через interceptor. Если refresh тоже 401 → clearSession + redirect на login.

**Q: Нужен ли SSR?**
A: Нет. Mobile app — полностью client-side. SSR только на web (Next.js).

**Q: Можно ли менять бекенд API?**
A: Только если явно указано. По умолчанию — нет.

**Q: Как тестировать с бекендом?**
A: `make up` в корне проекта запускает Laravel + PostgreSQL + Redis. Тестовые аккаунты в CLAUDE.md.

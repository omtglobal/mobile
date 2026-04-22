# Mobile Implementation Status

Текущий статус реализации мобильного приложения Ninhao по фазам из [AI-AGENT-INSTRUCTIONS.md](AI-AGENT-INSTRUCTIONS.md).

---

## Сводка

| Фаза | Статус | Примечание |
|------|--------|------------|
| **0** Foundation | ✅ Готово | Проект, навигация, API, stores, UI kit |
| **1** Каталог | ✅ Готово | Home, Search, Product, Categories, Seller |
| **2** Авторизация | ✅ Готово | Login, Register, Profile, Addresses, Settings, Biometric |
| **3** Корзина и заказы | ✅ Готово | Cart, Checkout, Orders, Mock Payment |
| **4** Отзывы и поддержка | ✅ Готово | Reviews, Tickets |
| **5** Polish | 🟡 Частично | См. детали ниже |
| **6** Мессенджер | ⏸ Не начато | Phase 6+ |
| **7** Видео | ⏸ Не начато | Phase 7+ |

---

## Phase 5: Polish — детали

| # | Задача | Статус | Комментарий |
|---|--------|--------|-------------|
| 5.1 | Dark Mode | ✅ | ThemeProvider, переключатель в Settings |
| 5.2 | Offline mode | ✅ | React Query persist (MMKV), NetInfo, analytics queue |
| 5.3 | Push Notifications | ⏸ | Исключено из MVP (personal Apple account) |
| 5.4 | Analytics tracking | ✅ | analyticsService, батчинг, offline queue |
| 5.5 | Deep Linking | 🟡 | Android intent filters есть; нужна проверка роутинга |
| 5.6 | i18n (ru + en) | ✅ | react-i18next, ru/en, Settings переключатель, все экраны |
| 5.7 | Accessibility | ❌ | Только 1 label (Close); нужен audit |
| 5.8 | Performance | ✅ | Memo, prefetch, image optimization |
| 5.9 | Unit + Integration tests | ✅ | Jest, MSW, 17 тестов |
| 5.10 | E2E (Maestro) | ✅ | 5 flows, testID на ключевых компонентах |
| 5.11 | CI/CD | 🟡 | Jest в CI; Maestro E2E — только локально |

---

## Оставшиеся шаги (для завершения Phase 5)

### Вариант A: Accessibility (5.7) — ~2–3 часа

**Цель:** VoiceOver/TalkBack корректно озвучивают ключевые экраны.

**Этапы:**
1. **Этап 1:** ProductCard, SearchBar, Add to Cart — `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
2. **Этап 2:** Cart, Checkout, Profile — кнопки, списки, заголовки
3. **Этап 3:** Forms (Login, Register, Addresses) — поля ввода с labels

**Результат:** Приложение доступно для пользователей с ограничениями по зрению.

---

### Вариант B: Deep Linking (5.5) — ~1 час

**Цель:** Ссылки `https://ninhao.shop/product/123` открывают приложение на нужном экране.

**Этапы:**
1. Проверить, что Expo Router обрабатывает scheme + host из intent filters
2. Добавить тест: `npx uri-scheme open ninhao://product/xxx --ios`
3. Документировать формат ссылок

**Результат:** Маркетинговые ссылки и шаринг ведут в приложение.

---

### Вариант C: i18n (5.6) — ✅ Выполнено

**Цель:** Переключатель ru/en в Settings, локализованные строки.

**Реализовано:**
- react-i18next + expo-localization, `locales/ru.json`, `locales/en.json`
- Home, Product, Cart, Search, Profile, Support, Checkout, Orders, Auth (Login/Register), Settings
- I18nSync синхронизирует preferences.language с i18n
- Jest mock для `t: (key) => key`

**Результат:** Приложение поддерживает русский и английский.

---

### Вариант D: Документация и чеклист — ~30 мин

**Цель:** Зафиксировать статус, обновить README.

**Этапы:**
1. Обновить `Docs/Mobile/README.md` — таблица статуса фаз
2. Добавить `MOBILE-CHECKLIST.md` в корень — что сделано, что осталось
3. Ссылка из CLAUDE.md

**Результат:** Прозрачный статус для команды и следующих итераций.

---

## Рекомендация

Для быстрого завершения плана маркетплейса (Phase 0–5):

1. **Сначала:** Вариант D (документация) — зафиксировать текущее состояние
2. **Затем:** Вариант B (Deep Linking) — мало кода, быстрая проверка
3. **Потом:** Вариант A (Accessibility) — разбить на 3 этапа, делать постепенно

i18n (Вариант C) — отдельная итерация, можно отложить.

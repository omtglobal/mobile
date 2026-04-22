# 13. Доступность и локализация

Accessibility (a11y), поддержка нескольких языков и региональная адаптация.

---

## 1. Accessibility

### 1.1 Принципы

- **Perceivable** — контент доступен через разные каналы (зрение, слух, осязание)
- **Operable** — управление через touch, VoiceOver, TalkBack, Switch Control
- **Understandable** — логичная структура, понятные labels
- **Robust** — работает с assistive technologies

### 1.2 Обязательные требования

| Требование | Реализация |
|-----------|-----------|
| Контрастность текста | Минимум 4.5:1 (AA), target 7:1 (AAA) |
| Touch targets | Минимум 44x44pt (iOS) / 48x48dp (Android) |
| Accessibility labels | На всех интерактивных элементах |
| VoiceOver / TalkBack | Навигация без зрения |
| Dynamic Type | Масштабирование шрифтов (iOS) |
| Font Scale | Масштабирование шрифтов (Android) |
| Reduce Motion | Уменьшить анимации при системной настройке |

### 1.3 Labels и Hints

```typescript
// Кнопка "В корзину"
<Pressable
  accessibilityRole="button"
  accessibilityLabel={`Добавить ${product.title} в корзину. Цена ${formatPrice(product.price)}`}
  accessibilityHint="Добавляет товар в корзину покупок"
  onPress={handleAddToCart}
>
  <Text>В корзину</Text>
</Pressable>

// Рейтинг
<View
  accessibilityRole="text"
  accessibilityLabel={`Рейтинг ${product.rating_avg} из 5, ${product.review_count} отзывов`}
>
  <StarRating rating={product.rating_avg} />
</View>

// Изображение товара
<Image
  source={{ uri: product.primary_image?.url }}
  accessibilityLabel={`Фото товара: ${product.title}`}
  accessibilityRole="image"
/>

// Карточка товара
<Pressable
  accessibilityRole="button"
  accessibilityLabel={`${product.title}. Цена ${formatPrice(product.price)}. Рейтинг ${product.rating_avg}`}
  accessibilityHint="Открывает карточку товара"
>
  <ProductCard product={product} />
</Pressable>
```

### 1.4 Навигация VoiceOver

- Заголовки экранов: `accessibilityRole="header"`
- Tab bar: автоматически accessible через React Navigation
- Списки: `accessibilityRole="list"`, элементы `"listitem"`
- Кнопка назад: `accessibilityLabel="Назад"`

### 1.5 Dynamic Type (iOS)

```typescript
// Использовать относительные размеры
import { useWindowDimensions } from 'react-native';

// Или через NativeWind/Tamagui с поддержкой fontScale
const { fontScale } = useWindowDimensions();
```

Все текстовые стили из дизайн-системы (heading-xl, body-md и т.д.) должны масштабироваться.

### 1.6 Reduce Motion

```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  const sub = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    setReduceMotion
  );
  return () => sub.remove();
}, []);

// Использование
const animationDuration = reduceMotion ? 0 : 300;
```

### 1.7 Чеклист a11y по экранам

| Экран | Проверить |
|-------|----------|
| Home | Category labels, product card labels, search bar hint |
| Product Detail | Gallery alt text, price announced, add to cart label |
| Cart | Item count, total announced, quantity controls labels |
| Login/Register | Form labels, error announcements |
| Orders | Status announced, order details navigable |
| Search | Results count announced, filter state |

---

## 2. Интернационализация (i18n)

### 2.1 Подход

Используем `expo-localization` + `i18next` + `react-i18next`:

```bash
npm install i18next react-i18next expo-localization
```

### 2.2 Структура переводов

```
src/
  i18n/
    index.ts          # Конфигурация i18next
    locales/
      en.json         # Английский (основной)
      zh.json         # Китайский
      ru.json         # Русский 
      uk.json         # Украинский
```

### 2.3 Конфигурация

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import ru from './locales/ru.json';
import en from './locales/en.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 2.4 Структура переводов

```json
// src/i18n/locales/ru.json
{
  "tabs": {
    "home": "Главная",
    "catalog": "Каталог",
    "cart": "Корзина",
    "orders": "Заказы",
    "profile": "Профиль"
  },
  "home": {
    "search_placeholder": "Поиск товаров...",
    "new_products": "Новинки",
    "popular": "Популярные",
    "see_all": "Все"
  },
  "product": {
    "add_to_cart": "В корзину",
    "added_to_cart": "Добавлено в корзину",
    "reviews": "Отзывы",
    "reviews_count": "{{count}} отзывов",
    "description": "Описание",
    "show_more": "Показать полностью",
    "seller": "Продавец",
    "out_of_stock": "Нет в наличии",
    "share": "Поделиться"
  },
  "cart": {
    "title": "Корзина",
    "empty": "Корзина пуста",
    "go_shopping": "Перейти к покупкам",
    "select_all": "Выбрать все",
    "total": "Итого",
    "items_count": "{{count}} товаров",
    "checkout": "Оформить заказ"
  },
  "auth": {
    "login": "Войти",
    "register": "Зарегистрироваться",
    "logout": "Выйти",
    "email": "Email",
    "password": "Пароль",
    "name": "Имя",
    "forgot_password": "Забыли пароль?",
    "no_account": "Нет аккаунта?",
    "has_account": "Уже есть аккаунт?",
    "login_prompt": "Войдите, чтобы продолжить",
    "biometric_prompt": "Включить {{method}} для быстрого входа?"
  },
  "orders": {
    "title": "Мои заказы",
    "empty": "У вас пока нет заказов",
    "status": {
      "pending": "Ожидает оплаты",
      "paid": "Оплачен",
      "processing": "В обработке",
      "shipped": "Отправлен",
      "delivered": "Доставлен",
      "cancelled": "Отменён",
      "refunded": "Возврат"
    },
    "pay": "Оплатить",
    "confirm_delivery": "Подтвердить доставку"
  },
  "common": {
    "loading": "Загрузка...",
    "error": "Произошла ошибка",
    "retry": "Повторить",
    "cancel": "Отмена",
    "save": "Сохранить",
    "delete": "Удалить",
    "back": "Назад",
    "no_connection": "Нет подключения к интернету"
  }
}
```

### 2.5 Использование

```typescript
import { useTranslation } from 'react-i18next';

function CartScreen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('cart.title')}</Text>
      <Text>{t('cart.items_count', { count: 3 })}</Text>
      <Button title={t('cart.checkout')} />
    </View>
  );
}
```

### 2.6 RTL Support (будущее)

Для арабского/иврита — React Native поддерживает RTL из коробки:

```typescript
import { I18nManager } from 'react-native';
I18nManager.forceRTL(isRTL);
```

---

## 3. Региональная адаптация

### 3.1 Форматирование

| Тип | Инструмент | Пример (US) | Пример (RU) |
|-----|-----------|-------------|-------------|
| Цена | `Intl.NumberFormat` | $99.99 | 99,99 $ |
| Дата | `Intl.DateTimeFormat` | Mar 12, 2026 | 12 мар. 2026 |
| Число | `Intl.NumberFormat` | 1,234.56 | 1 234,56 |

```typescript
// src/lib/utils/format.ts
export function formatPrice(amount: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale ?? getLocales()[0]?.languageTag ?? 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(dateStr: string, locale?: string) {
  return new Intl.DateTimeFormat(locale ?? getLocales()[0]?.languageTag ?? 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}
```

### 3.2 Поддерживаемые языки (MVP)

| Язык | Код | Статус |
|------|-----|-------|
| Русский | ru | |
| Английский | en | Основной |
| Украинский | uk |  |
| Китайский | zh | |

---

## 4. Тестирование a11y и i18n

### 4.1 Accessibility Testing

- **iOS:** Xcode → Accessibility Inspector
- **Android:** Android Studio → Layout Inspector + TalkBack
- **Автоматическое:** `jest-axe` или manual VoiceOver walkthrough
- **Чеклист:** пройти все экраны с VoiceOver/TalkBack включённым

### 4.2 i18n Testing

- **Visual test:** переключить язык в настройках → проверить все экраны
- **Long text:** проверить с длинными немецкими переводами (stress test layout)
- **Missing keys:** i18next покажет ключ если перевод отсутствует

---

## Следующий шаг

→ [AI-AGENT-INSTRUCTIONS.md](AI-AGENT-INSTRUCTIONS.md) — инструкции для AI-агентов

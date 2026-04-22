# 11. Оптимизация производительности

Стратегии для плавного UX на 60fps: изображения, списки, кеширование, bundle size.

---

## 1. Изображения

### 1.1 expo-image

Использовать `expo-image` вместо стандартного `Image`:
- Встроенный disk/memory кеш
- Поддержка blurhash/thumbhash для placeholder
- Переход (fade-in) при загрузке
- Автоматический формат (WebP/AVIF где поддерживается)

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: product.primary_image?.thumbnail_url }}
  style={{ width: 180, height: 180 }}
  contentFit="cover"
  placeholder={{ blurhash: product.primary_image?.blurhash }}
  transition={200}
  recyclingKey={product.id}
/>
```

### 1.2 Стратегия загрузки

| Контекст | URL | Размер |
|----------|-----|--------|
| Карточка товара (grid) | `thumbnail_url` | ~200x200 |
| Карточка товара (carousel) | `thumbnail_url` | ~200x200 |
| Product Detail gallery | `url` (full) | Оригинальный |
| Seller logo | `logo_url` | ~100x100 |
| Category icon | Local asset | SVG/PNG |

### 1.3 Предзагрузка

```typescript
// Предзагрузка следующих страниц продуктов
import { Image } from 'expo-image';

function prefetchProductImages(products: Product[]) {
  products.forEach(p => {
    if (p.primary_image?.thumbnail_url) {
      Image.prefetch(p.primary_image.thumbnail_url);
    }
  });
}
```

---

## 2. Списки

### 2.1 FlashList вместо FlatList

`@shopify/flash-list` — значительно быстрее стандартного FlatList для длинных списков:

```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={products}
  renderItem={({ item }) => <ProductCard product={item} />}
  estimatedItemSize={250}  // Обязательно указать!
  numColumns={2}
  keyExtractor={(item) => item.id}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### 2.2 Правила для производительных списков

1. **estimatedItemSize** — всегда указывать (FlashList требует)
2. **keyExtractor** — стабильные ключи (product.id, не index)
3. **Avoid re-renders** — мемоизация renderItem через `React.memo`
4. **Не создавать объекты/функции в рендере** — вынести стили и callbacks
5. **getItemType** — если есть разные типы элементов (headers, items)

```typescript
const ProductCard = React.memo(({ product }: { product: Product }) => {
  // ...
});
```

### 2.3 Infinite Scroll

```typescript
// В useProducts hook
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: queryKeys.products.list(filters),
  queryFn: ({ pageParam = 1 }) =>
    catalogApi.getProducts({ ...filters, page: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.meta.current_page < lastPage.meta.last_page
      ? lastPage.meta.current_page + 1
      : undefined,
});

// Flatten pages
const products = data?.pages.flatMap(page => page.data) ?? [];
```

---

## 3. Кеширование

### 3.1 React Query Cache

| Ресурс | staleTime | gcTime |
|--------|-----------|--------|
| Home | 5 мин | 30 мин |
| Categories | 30 мин | 2 часа |
| Product list | 3 мин | 15 мин |
| Product detail | 10 мин | 1 час |
| Featured | 15 мин | 1 час |
| Reviews | 5 мин | 30 мин |
| Orders | 1 мин | 10 мин |
| User profile | 10 мин | 1 час |

### 3.2 Persistent Cache (MMKV)

React Query cache persist в MMKV для offline доступа:

```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'query-cache' });

const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
```

### 3.3 Image Cache

`expo-image` управляет кешем автоматически. Ограничения:
- Max disk cache: 250 MB (настраиваемо)
- Кнопка "Очистить кеш" в Settings

---

## 4. Bundle Size

### 4.1 Hermes Engine

React Native использует Hermes — оптимизированный JS engine:
- Быстрый запуск (bytecode precompilation)
- Меньше RAM
- Включён по умолчанию в Expo SDK 53+

### 4.2 Tree Shaking

- Импортировать только нужное: `import { Home } from 'lucide-react-native'`
- Не: `import * as Icons from 'lucide-react-native'`

### 4.3 Lazy Loading экранов

Expo Router поддерживает lazy loading по умолчанию — каждый маршрут загружается при первом переходе.

### 4.4 Целевой размер бандла

| Метрика | Цель |
|---------|------|
| JS bundle | < 2 MB |
| iOS app size | < 30 MB |
| Android APK | < 25 MB |
| TTI (Time to Interactive) | < 2 сек |

---

## 5. Startup Performance

### 5.1 Splash Screen

Использовать `expo-splash-screen` для smooth перехода:

```typescript
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Загрузить шрифты, восстановить auth state, prefetch
      await Promise.all([
        loadFonts(),
        restoreAuthSession(),
        queryClient.prefetchQuery(queryKeys.home),
      ]);
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!isReady) return null;
  return <Stack />;
}
```

### 5.2 Порядок загрузки

```
1. Показать splash screen (нативный)
2. Инициализировать Hermes + React
3. Восстановить auth state из SecureStore/MMKV
4. Prefetch home data (если online)
5. Скрыть splash → показать Home screen
```

Целевое время: splash → interactive < 2 секунды.

---

## 6. Анимации на 60fps

### 6.1 Reanimated на UI Thread

Все анимации через `react-native-reanimated` работают на UI thread (не блокируют JS thread):

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// При нажатии
scale.value = withSpring(0.95);
```

### 6.2 Avoid Layout Thrashing

- Не менять `width`/`height` в анимациях — использовать `transform: scale`
- Не менять `top`/`left` — использовать `transform: translateX/Y`
- `opacity` — безопасно для анимации

---

## 7. Memory Management

- **Recycling в FlashList** — элементы переиспользуются
- **Image recyclingKey** — expo-image освобождает память при recycling
- **Dispose subscriptions** — cleanup в useEffect для NetInfo, Notifications
- **Мониторинг** — Xcode Instruments / Android Profiler для отслеживания утечек

---

## Следующий шаг

→ [12-testing-cicd.md](12-testing-cicd.md) — тестирование и CI/CD

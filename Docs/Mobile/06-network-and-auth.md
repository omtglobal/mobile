# 06. Сетевой слой и аутентификация

HTTP-клиент, JWT lifecycle, биометрическая аутентификация, offline-режим и кеширование.

---

## 1. HTTP-клиент (Axios)

### 1.1 Базовая конфигурация

```typescript
// src/lib/api/client.ts
import axios from 'axios';
import { API_BASE_URL, API_PREFIX } from '../../constants/config';
import { useAuthStore } from '../stores/auth';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
```

### 1.2 Request Interceptor

```typescript
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 1.3 Response Interceptor (с auto-refresh)

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Ждём refresh из другого запроса
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authApi.refresh();
        useAuthStore.getState().setToken(newToken);

        // Повторить все ожидающие запросы
        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        failedQueue.forEach(({ reject }) => reject(error));
        failedQueue = [];
        useAuthStore.getState().clearSession();
        // Навигация на экран входа
        router.replace('/(auth)/login');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### 1.4 Retry для серверных ошибок

```typescript
// Retry с exponential backoff для 5xx и 429
apiClient.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const status = error.response?.status;

  if ((status >= 500 || status === 429) && (config._retryCount || 0) < 2) {
    config._retryCount = (config._retryCount || 0) + 1;
    const delay = Math.pow(2, config._retryCount) * 1000; // 2s, 4s
    await new Promise(resolve => setTimeout(resolve, delay));
    return apiClient(config);
  }

  return Promise.reject(error);
});
```

---

## 2. JWT Lifecycle

### 2.1 Хранение токена

```typescript
// src/lib/utils/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ninhao_access_token';
const REFRESH_TOKEN_KEY = 'ninhao_refresh_token';

export const tokenStorage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),

  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  removeAll: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
```

> **SecureStore** использует Keychain (iOS) и EncryptedSharedPreferences (Android). Безопаснее localStorage/AsyncStorage.

### 2.2 Флоу авторизации

```
1. Пользователь вводит email/password
2. POST /auth/login → { access_token, expires_in, user }
3. Сохранить access_token в SecureStore
4. Сохранить user в Zustand (persist → MMKV)
5. При каждом запросе: token из store → Authorization header
6. При 401:
   a. Попытка POST /auth/refresh
   b. Если успех → обновить token, повторить запрос
   c. Если fail → clearSession(), redirect на login
7. При logout:
   a. POST /auth/logout
   b. Удалить token из SecureStore
   c. Очистить user из Zustand
   d. Инвалидировать все React Query кеши
```

### 2.3 Проверка сессии при запуске

```typescript
// app/_layout.tsx
export default function RootLayout() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      // Проверить что токен ещё валиден
      fetchUser().catch(() => {
        // Токен протух — очистить
        useAuthStore.getState().clearSession();
      });
    }
  }, []);

  return <Stack />;
}
```

---

## 3. Биометрическая аутентификация

### 3.1 Сценарий

После первого успешного входа предложить включить Face ID / Touch ID / Fingerprint для быстрого входа при следующих запусках.

### 3.2 Флоу

```
1. Первый вход: email/password → JWT
2. Показать prompt: "Включить Face ID для быстрого входа?"
3. Если да: сохранить credentials в SecureStore (с биометрической защитой)
4. При следующем запуске:
   a. Показать кнопку "Войти с Face ID"
   b. expo-local-authentication → проверка биометрии
   c. Если успех → достать credentials из SecureStore → auto-login
   d. Если fail → показать форму логина
```

### 3.3 Реализация

```typescript
// src/lib/hooks/useBiometric.ts
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  async function checkAvailability() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsAvailable(compatible && enrolled);

    const enabled = await SecureStore.getItemAsync('biometric_enabled');
    setIsEnabled(enabled === 'true');
  }

  async function authenticate(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Войти в Ninhao',
      cancelLabel: 'Отмена',
      disableDeviceFallback: false,
    });
    return result.success;
  }

  async function enableBiometric(email: string, password: string) {
    await SecureStore.setItemAsync('bio_credentials',
      JSON.stringify({ email, password }),
      { requireAuthentication: true }
    );
    await SecureStore.setItemAsync('biometric_enabled', 'true');
    setIsEnabled(true);
  }

  async function loginWithBiometric(): Promise<LoginResult> {
    const authenticated = await authenticate();
    if (!authenticated) throw new Error('Biometric auth failed');

    const stored = await SecureStore.getItemAsync('bio_credentials');
    if (!stored) throw new Error('No stored credentials');

    const { email, password } = JSON.parse(stored);
    return authApi.login({ email, password });
  }

  return { isAvailable, isEnabled, authenticate, enableBiometric, loginWithBiometric };
}
```

---

## 4. Offline режим

### 4.1 Стратегия

| Данные | Offline-поведение |
|--------|------------------|
| Каталог, товары | Показать кешированные (React Query persist) |
| Категории | Кешированные (обновляются редко) |
| Корзина | Полностью офлайн (Zustand + MMKV) |
| Отзывы | Кешированные (чтение), очередь (запись) |
| Заказы | Кешированные (чтение) |
| Профиль | Кешированный |
| Создание заказа | Показать ошибку "Нет подключения" |
| Поиск | Недоступен офлайн |

### 4.2 Network Status Hook

```typescript
// src/lib/hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  return { isConnected };
}
```

### 4.3 React Query Persistence

```typescript
// app/_layout.tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: mmkvStorage, // MMKV adapter
});

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Кешировать только GET-запросы каталога
            return query.queryKey[0] === 'products' ||
                   query.queryKey[0] === 'categories' ||
                   query.queryKey[0] === 'home';
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

### 4.4 Offline Banner

Показывать жёлтый banner вверху экрана при потере подключения:

```
┌─────────────────────────────────┐
│ ⚠ Нет подключения к интернету  │
├─────────────────────────────────┤
│                                 │
│        (контент экрана)         │
│                                 │
```

---

## 5. Кеширование на клиенте

### 5.1 React Query staleTime

| Ресурс | staleTime | cacheTime |
|--------|-----------|-----------|
| Home page | 5 мин | 30 мин |
| Категории (tree) | 30 мин | 2 часа |
| Список товаров | 3 мин | 15 мин |
| Товар по ID | 10 мин | 1 час |
| Featured | 15 мин | 1 час |
| Отзывы | 5 мин | 30 мин |
| Заказы | 1 мин | 10 мин |
| Адреса | 5 мин | 30 мин |
| Тикеты | 2 мин | 10 мин |

### 5.2 Оптимистичные обновления

Для мутаций (создание отзыва, обновление корзины) использовать optimistic updates:

```typescript
const createReview = useMutation({
  mutationFn: (data: CreateReviewData) =>
    reviewsApi.create(productId, data),
  onMutate: async (newReview) => {
    await queryClient.cancelQueries(queryKeys.reviews.byProduct(productId));
    const previous = queryClient.getQueryData(queryKeys.reviews.byProduct(productId));

    // Оптимистично добавить отзыв
    queryClient.setQueryData(queryKeys.reviews.byProduct(productId), (old) => ({
      ...old,
      data: [optimisticReview, ...old.data],
    }));

    return { previous };
  },
  onError: (err, _, context) => {
    // Откатить при ошибке
    queryClient.setQueryData(
      queryKeys.reviews.byProduct(productId),
      context?.previous
    );
  },
  onSettled: () => {
    queryClient.invalidateQueries(queryKeys.reviews.byProduct(productId));
  },
});
```

---

## 6. API Error Handling

### 6.1 Типизация ошибок

```typescript
// src/types/api.ts
interface ApiError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'ERROR';
    message: string;
    details?: Record<string, string[]>;
    correlation_id?: string;
  };
}

// Helper
function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error) && error.response?.data?.error != null;
}
```

### 6.2 Обработка в UI

```typescript
function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response!.data.error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Произошла ошибка';
}

function getValidationErrors(error: unknown): Record<string, string> | null {
  if (isApiError(error) && error.response?.data.error.code === 'VALIDATION_ERROR') {
    const details = error.response.data.error.details;
    if (details) {
      return Object.fromEntries(
        Object.entries(details).map(([key, msgs]) => [key, msgs[0]])
      );
    }
  }
  return null;
}
```

---

## Следующий шаг

→ [07-screens-catalog.md](07-screens-catalog.md) — экраны каталога

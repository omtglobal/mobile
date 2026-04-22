# 02. Контракты Client API

Полный справочник эндпоинтов, форматов запросов/ответов и кодов ошибок. Мобильное приложение общается только с Laravel API через `/api/v1/client`.

---

## Base URL

| Окружение | Base URL |
|-----------|----------|
| iOS симулятор | `http://localhost:8000` |
| Android эмулятор | `http://10.0.2.2:8000` |
| Физическое устройство | `http://<IP_MAC>:8000` или ngrok |
| Production | `https://api.ninhao.shop` |

Полный путь: `{Base URL}/api/v1/client/{endpoint}`

---

## Заголовки

```
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access_token>   # для защищённых эндпоинтов
```

---

## Формат ответов

### Успешный ответ

```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

### Пагинированный ответ

```json
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "meta": {
    "total": 100,
    "per_page": 20,
    "current_page": 1,
    "last_page": 5
  }
}
```

### Ошибка

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {
      "email": ["This email is already registered."],
      "password": ["Password must be at least 8 characters."]
    },
    "correlation_id": "uuid"
  }
}
```

### HTTP-коды и действия клиента

| Код | Значение | Действие |
|-----|---------|----------|
| 200 | Успех | Обработать данные |
| 201 | Создано | Обработать данные |
| 202 | Принято (async) | Показать подтверждение |
| 204 | Без контента | Обновить UI |
| 401 | Не авторизован | Refresh токен → если не помогло, экран входа |
| 403 | Запрещено | Показать сообщение |
| 404 | Не найдено | Показать заглушку |
| 422 | Ошибка валидации | Показать ошибки полей |
| 429 | Rate limit | Retry с exponential backoff |
| 500 | Серверная ошибка | Показать ошибку, retry |

---

## 1. Health

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/health` | Нет | Проверка доступности API |

---

## 2. Auth

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/auth/register` | Нет | Регистрация |
| POST | `/auth/login` | Нет | Вход |
| POST | `/auth/logout` | JWT | Выход |
| POST | `/auth/refresh` | JWT | Обновление токена |
| GET | `/auth/me` | JWT | Текущий пользователь |
| POST | `/auth/forgot-password` | Нет | Запрос сброса пароля |
| POST | `/auth/reset-password` | Нет | Сброс пароля по токену |

### POST /auth/register

**Запрос:**
```json
{
  "name": "string, required",
  "email": "string, required, email format",
  "password": "string, required, min 8",
  "password_confirmation": "string, required, must match password"
}
```

**Ответ (201):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAi...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid-v7",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": null,
      "country": null,
      "email_verified_at": null,
      "roles": ["buyer"],
      "created_at": "2026-03-12T10:00:00Z",
      "updated_at": "2026-03-12T10:00:00Z"
    }
  }
}
```

### POST /auth/login

**Запрос:** `{ "email": "string", "password": "string" }`

**Ответ:** аналогичен register.

### GET /auth/me

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "US",
    "email_verified_at": "2026-03-12T10:00:00Z",
    "roles": ["buyer"],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

## 3. Catalog

### Home

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/catalog/home` | Нет | Данные главной страницы (кеш 10мин) |

**Ответ:**
```json
{
  "data": {
    "categories": [CategoryResource],
    "new_products": [ProductResource],
    "popular_products": [ProductResource]
  }
}
```

### Categories

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/catalog/categories` | Нет | Дерево категорий (кеш 1ч) |
| GET | `/catalog/categories/all` | Нет | Плоский список (кеш 1ч) |
| GET | `/catalog/categories/{id}` | Нет | Категория по ID |
| GET | `/catalog/categories/{id}/page` | Нет | Категория + товары |
| GET | `/catalog/categories/{id}/products` | Нет | Товары категории с фильтрами |

**CategoryResource:**
```json
{
  "id": "uuid",
  "name": "Electronics",
  "slug": "electronics",
  "description": "...",
  "parent_id": null,
  "path": "Electronics",
  "children": [CategoryResource],
  "products_count": 150
}
```

### Products

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/catalog/products` | Нет | Список товаров (кеш 5мин) |
| GET | `/catalog/products/featured` | Нет | Рекомендованные (кеш 30мин) |
| GET | `/catalog/products/search` | Нет | Поиск |
| GET | `/catalog/products/{id}` | Нет | Товар по ID (кеш 15мин) |
| GET | `/catalog/products/{id}/page` | Нет | Товар + отзывы + featured |

**Query-параметры:**

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| `page` | int | 1 | Номер страницы |
| `per_page` | int | 20 | Элементов на странице (max 100) |
| `sort_by` | string | `published_at` | `published_at`, `price`, `title` |
| `sort_order` | string | `desc` | `asc`, `desc` |
| `min_price` | float | — | Минимальная цена |
| `max_price` | float | — | Максимальная цена |
| `min_rating` | float | — | Минимальный рейтинг (1–5) |
| `q` | string | — | Поисковый запрос (search) |
| `category_id` | uuid | — | Фильтр по категории |

**ProductResource:**
```json
{
  "id": "uuid",
  "title": "Product Name",
  "description": "Full description",
  "short_description": "Brief",
  "sku": "SKU123",
  "price": 99.99,
  "currency": "USD",
  "status": "published",
  "status_label": "Published",
  "stock_quantity": 100,
  "attributes": {},
  "badges": ["choice", "best_sale"],
  "category": CategoryResource,
  "company": {
    "id": "uuid",
    "name": "Company Name",
    "is_premium_plus": true
  },
  "images": [ProductImageResource],
  "primary_image": ProductImageResource,
  "rating_avg": 4.5,
  "review_count": 25,
  "published_at": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

**ProductImageResource:**
```json
{
  "id": "uuid",
  "media_id": "uuid",
  "url": "https://cdn.example.com/image.jpg",
  "thumbnail_url": "https://cdn.example.com/thumb.jpg",
  "filename": "image.jpg",
  "mime_type": "image/jpeg",
  "size": 102400,
  "is_primary": true,
  "sort_order": 1
}
```

### Companies (Sellers)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/catalog/companies/{id}` | Нет | Профиль продавца |

**CompanyResource:** включает `logo_url`, `header_background_url`, `profile_description`, `profile_services`, `profile_certificates`, `company_reviews`, `company_rating_avg`, `main_categories`, `preview_products`, `is_premium_plus`.

### Reviews

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/catalog/products/{id}/reviews` | Нет | Отзывы (пагинация) |
| POST | `/catalog/products/{id}/reviews` | JWT | Создать отзыв |
| PUT | `/catalog/products/{pId}/reviews/{rId}` | JWT | Редактировать |
| DELETE | `/catalog/products/{pId}/reviews/{rId}` | JWT | Удалить |

**Запрос (create/update):**
```json
{
  "rating": 5,
  "title": "Great product",
  "content": "Review text (10-1000 chars)"
}
```

**ReviewResource:**
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "user": { "id": "uuid", "name": "John Doe" },
  "user_name": "John Doe",
  "rating": 5,
  "title": "Great product",
  "content": "Review text...",
  "created_at": "..."
}
```

---

## 4. Addresses

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/addresses` | JWT | Список адресов |
| POST | `/addresses` | JWT | Создать |
| GET | `/addresses/{id}` | JWT | По ID |
| PUT | `/addresses/{id}` | JWT | Обновить |
| DELETE | `/addresses/{id}` | JWT | Удалить |

**AddressResource:**
```json
{
  "id": "uuid",
  "label": "Home",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St, Apt 4B",
  "city": "New York",
  "country": "US",
  "zip": "10001",
  "is_default": true,
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 5. Orders

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/orders` | JWT | Список заказов (пагинация) |
| POST | `/orders` | JWT | Создать заказ |
| GET | `/orders/{id}` | JWT | Детали заказа |
| POST | `/orders/{id}/pay` | JWT | Оплатить (демо) |
| POST | `/orders/{id}/confirm-delivery` | JWT | Подтвердить доставку |

**Создание заказа:**
```json
{
  "shipping_name": "John Doe",
  "shipping_phone": "+1234567890",
  "shipping_email": "john@example.com",
  "shipping_address": "123 Main St",
  "shipping_city": "New York",
  "shipping_country": "US",
  "shipping_zip": "10001",
  "notes": "Handle with care",
  "items": [
    { "product_id": "uuid", "quantity": 2 }
  ]
}
```

**OrderResource:**
```json
{
  "id": "uuid",
  "status": "pending|paid|processing|shipped|delivered|cancelled|refunded",
  "status_label": "Pending",
  "total_amount": 199.98,
  "currency": "USD",
  "shipping_name": "...",
  "shipping_phone": "...",
  "shipping_email": "...",
  "shipping_address": "...",
  "shipping_city": "...",
  "shipping_country": "...",
  "shipping_zip": "...",
  "payment_method": "demo",
  "payment_status": "pending|paid|failed|refunded",
  "payment_status_label": "Pending",
  "transaction_id": null,
  "notes": "...",
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "title": "Product Name",
      "price": 99.99,
      "currency": "USD",
      "quantity": 2,
      "line_total": "199.98"
    }
  ],
  "sellers": [{ "id": "uuid", "name": "Seller Co." }],
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 6. Support (тикеты)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/tickets` | Нет/JWT | Создать тикет |
| GET | `/tickets` | JWT | Список тикетов |
| GET | `/tickets/{id}` | JWT | Детали с сообщениями |

**Создание тикета:**
```json
{
  "channel": "seller|platform|order",
  "subject": "Issue with product",
  "message": "Description...",
  "category": "product_quality|shipping|payment|return|other",
  "priority": "low|medium|high",
  "company_id": "uuid (if channel=seller)",
  "order_id": "uuid (optional)",
  "requester_email": "email (guest)",
  "requester_phone": "phone (optional)"
}
```

**TicketResource:** включает `channel`, `subject`, `category`, `priority`, `status`, `messages[]` (author_type: customer|support|admin), `company`, `user`, timestamps.

---

## 7. Analytics

| Метод | Путь | Auth | Rate Limit |
|-------|------|------|-----------|
| POST | `/track` | Нет | 120/мин |

**Типы событий:** `ProductViewed`, `ProductPhotoViewed`, `CategoryViewed`, `SearchPerformed`, `AddToCartClicked`, `CheckoutStarted`, `PaymentClicked`

**Запрос:**
```json
{
  "event_type": "ProductViewed",
  "payload": { "product_id": "uuid" }
}
```

---

## 8. Кеширование на бекенде

| Ресурс | Кеш |
|--------|-----|
| Категории (tree/all) | 1 час |
| Список товаров | 5 мин |
| Товар по ID | 15 мин |
| Featured | 30 мин |
| Home page | 10 мин |
| Компания | 15 мин |

---

## Следующий шаг

→ [03-architecture.md](03-architecture.md) — архитектура проекта и паттерны

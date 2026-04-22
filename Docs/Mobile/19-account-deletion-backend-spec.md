# 19. Account Deletion — Backend Specification

Техническое задание для backend-команды по реализации эндпоинта удаления аккаунта.

**Требование:** Apple App Store Review Guideline **5.1.1(v)** (обязательное с 30 июня 2022): приложения с регистрацией должны предоставлять функциональность удаления аккаунта **внутри приложения**. Без неё App Review отклоняет билд.

**Мобильный клиент:** уже реализован (см. `app/(main)/delete-account.tsx`, `src/lib/api/auth.ts`). Ждёт бекенд-эндпоинт.

---

## 1. Endpoint

```
DELETE /api/v1/client/auth/account
```

**Authentication:** JWT (обязательно). Без валидного токена — `401`.

**Request body (JSON):**

```json
{
  "password": "user-current-password",
  "reason": "No longer interested"
}
```

| Поле | Тип | Обязательность | Описание |
|------|-----|---------------|----------|
| `password` | string | **Обязательно** для аккаунтов с паролем (email+password). Не требуется для social-only аккаунтов (если такие появятся в будущем). | Текущий пароль пользователя. Нужен для защиты от угона сессии (украли телефон разблокированным → не должно быть удаления без пароля). |
| `reason` | string (≤500) | Опционально | Причина ухода. Для аналитики. Сохранить в обезличенном виде (без `user_id`). |

**Response 200 OK:**

```json
{
  "data": { "deleted": true },
  "meta": null
}
```

**Response 401 Unauthorized** — JWT невалиден или пароль неверный:

```json
{ "message": "Invalid credentials", "errors": { "password": ["Invalid password"] } }
```

**Response 422 Unprocessable Entity** — валидация (например, пароль не передан, но требуется):

```json
{ "message": "Validation failed", "errors": { "password": ["The password field is required."] } }
```

**Response 409 Conflict** (опционально) — удаление заблокировано бизнес-правилом (активные споры, незакрытые выплаты продавцу и т.п.):

```json
{
  "message": "Cannot delete account while you have pending disputes",
  "errors": { "account": ["pending_disputes"] }
}
```

Мобильный клиент показывает generic ошибку для всего, что не 401/422, поэтому сообщение в `message` должно быть понятным для пользователя.

---

## 2. Logic

Рекомендуется **soft-delete + отложенная анонимизация** (пример — в soft-delete window пользователь может восстановить аккаунт, если ошибся). Но если продукт решит — можно сразу анонимизировать.

### Вариант A. Немедленная анонимизация (проще, рекомендуется для MVP)

Транзакция:

1. **Проверить пароль** через `Hash::check($password, $user->password)`. Если не совпадает → `401`.
2. **Отозвать все JWT-токены** пользователя (revoke refresh tokens, blacklist access tokens через `jti` — или увеличить `token_version` у user, тогда все старые токены инвалидны).
3. **Удалить чувствительные PII из `users`:**
   - `email` → `deleted-{uuid}@deleted.local`
   - `phone` → `NULL`
   - `name` → "Deleted user"
   - `password` → случайная строка (bcrypt)
   - `avatar_url` → `NULL`
   - `is_deleted = true`, `deleted_at = NOW()`
4. **Удалить связанные персональные данные:**
   - `addresses` — полностью удалить (DELETE).
   - `cart_items` (если есть серверная корзина) — удалить.
   - `messenger_contacts`, `messenger_channel_members` — удалить участие пользователя.
   - Аватар и загруженные медиа (`media` + S3-объекты) — удалить (enqueue job для S3 delete).
   - `favorites`, `search_history`, `push_tokens`, `notification_preferences` — удалить.
5. **Обезличить UGC** (содержимое остаётся, авторство анонимизируется):
   - `reviews.user_id` оставить → при рендеринге показывать "Deleted user" (не NULL, чтобы CASCADE не снёс отзывы).
   - `messages.sender_id` оставить, но при рендере показывать "Deleted user" и убирать аватар.
   - Альтернатива: заменить `user_id` на sentinel-аккаунт `deleted-user` (UUID, единственная запись в БД) и обновить FK.
6. **Сохранить для legal/accounting:**
   - `orders` — **НЕ удалять**. Обновить `orders.user_id` на sentinel или оставить ссылку. Скрыть при выборке "мои заказы" (фильтр `is_deleted = false`). Сохранить `orders.shipping_*` как было — это бухгалтерия.
   - `invoices`, `payments` — не трогать.
7. **Опубликовать событие** `UserAccountDeleted` в Redis Queue для listener-ов:
   - `MediaService` — удаление файлов из S3.
   - `Analytics` — отправка финального события + обезличивание user_id в ClickHouse (или оставление — по политике).
   - `Realtime-service (Go)` — отключение всех открытых WebSocket-сессий пользователя.
   - `Notification` — очистить Expo push tokens.
   - `Messenger` — обновление presence, уведомление собеседников (опционально).
8. **Audit log** (`Audit` module): `AccountDeleted { user_id, timestamp, reason }`. Хранить в обезличенном виде (только UUID, без email).
9. Вернуть `200 { data: { deleted: true } }`.

### Вариант B. Grace period (30 дней)

Если продукт хочет дать возможность восстановления:

1. Пункты 1, 2, 3 (анонимизация отложенная).
2. Установить `users.deletion_scheduled_at = NOW() + 30 days`, `is_deleted = true`.
3. При попытке логина с email показывать "Account pending deletion. Contact support to restore."
4. Scheduled job раз в сутки выполняет пункты 3–7 для всех `deletion_scheduled_at < NOW()`.

**Важно для Apple:** даже в варианте B, Apple требует, чтобы данные **фактически удалялись в разумный срок**. 30 дней — приемлемо, 6 месяцев — нет. В описании приложения/политике конфиденциальности должен быть явно указан срок.

---

## 3. Миграция БД (если нужно)

```sql
ALTER TABLE users
  ADD COLUMN is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN deleted_at timestamp NULL,
  ADD COLUMN deletion_reason text NULL;

CREATE INDEX users_is_deleted_idx ON users (is_deleted) WHERE is_deleted = false;
```

Все существующие SELECT-запросы "активные пользователи" должны фильтровать `WHERE is_deleted = false`. Добавить это в глобальный scope модели `User`.

---

## 4. Caveats

### 4.1. Удаление продавца (seller role)

Если пользователь — seller с активной компанией:
- **Блокировать удаление** → `409 Conflict` с сообщением "Please close your seller account first" → редирект на seller cabinet (web).
- Либо каскадно обрабатывать: деактивировать компанию, скрыть товары, уведомить buyers с активными ордерами. Это отдельная бизнес-логика.

**На этапе mobile-клиента (buyers only)** этот кейс редкий, но если роль seller присутствует в JWT — возвращать 409.

### 4.2. Активные заказы

- `pending` / `processing` / `shipped` заказы → при попытке удаления возвращать `409` с текстом "Please wait until your orders are delivered or cancelled".
- `paid` но не `shipped` → аналогично.
- `delivered` / `cancelled` / `refunded` → OK, заказ сохраняется обезличенно.

### 4.3. Rate limiting

Endpoint критичный → добавить rate limit: `throttle:3,60` (3 попытки в минуту). Защита от brute-force пароля.

### 4.4. Реверс удаления

Если клиент в течение grace period попытается снова залогиниться:
- Можно показать специальное сообщение "Your account is scheduled for deletion" с кнопкой "Restore account" (вызов другого endpoint `POST /auth/account/restore`). Это **не требование Apple**, но хорошая UX.

---

## 5. Acceptance criteria

- [ ] `DELETE /api/v1/client/auth/account` реализован, задокументирован в OpenAPI.
- [ ] Для аккаунтов с паролем пароль валидируется; без пароля → 422.
- [ ] После успешного запроса:
  - все JWT пользователя инвалидны (проверить: старый token → 401 на любом endpoint);
  - PII удалены из `users` (проверить в БД);
  - `addresses`, `favorites`, `search_history`, `push_tokens` — удалены;
  - `orders` сохранены с обезличенным `user_id`;
  - `reviews`, `messages` — сохранены, при рендеринге показывают "Deleted user";
  - событие `UserAccountDeleted` опубликовано в Redis;
  - запись в `audit_logs`.
- [ ] Endpoint покрыт feature-тестом (Pest/PHPUnit):
  - Успех с правильным паролем.
  - 401 с неправильным паролем.
  - 401 без JWT.
  - 422 без пароля для password-аккаунта.
  - 409 при активных ордерах (если решено блокировать).
  - Повторный запрос к любому endpoint с тем же JWT → 401.
- [ ] Rate limit настроен.
- [ ] В Privacy Policy (`https://ninhao.shop/privacy`, страница на сайте) добавлен раздел "How to delete your account" с описанием процесса, срока хранения обезличенных данных и контактом поддержки.

---

## 6. Связанные задачи

- **Privacy Policy page**: обновить текст на сайте — в `privacy` добавить раздел "Account deletion". Apple reviewer часто открывает её и проверяет, описан ли процесс.
- **App Store Connect Privacy Nutrition Labels**: никаких изменений не требуется (удаление не собирает новые типы данных).
- **Mobile Review Notes** (`Docs/Mobile/app-store-metadata.md`, секция "Review Notes"): добавить строку:
  > Account deletion is available in the app: Settings → Danger Zone → Delete account. Complies with App Store Review Guideline 5.1.1(v).

---

## 7. Примерная реализация (Laravel, референс)

> Для backend-команды как отправная точка. Детали — по модульной структуре проекта (`/modules/Identity/Http/Controllers/`).

```php
// routes/api.php (client segment)
Route::middleware('auth:api')->delete('/auth/account', [AccountController::class, 'destroy'])
    ->middleware('throttle:3,60');
```

```php
// AccountController.php
public function destroy(DeleteAccountRequest $request): JsonResponse
{
    $user = $request->user();

    if ($user->password && !Hash::check($request->input('password'), $user->password)) {
        return response()->json([
            'message' => 'Invalid credentials',
            'errors' => ['password' => ['Invalid password']],
        ], 401);
    }

    // Block deletion for sellers with active companies
    if ($user->hasActiveSellerCompany()) {
        return response()->json([
            'message' => 'Please close your seller account first',
            'errors' => ['account' => ['has_active_company']],
        ], 409);
    }

    // Block deletion for users with active orders
    if ($user->orders()->whereIn('status', ['pending', 'paid', 'processing', 'shipped'])->exists()) {
        return response()->json([
            'message' => 'Please wait until your orders are delivered or cancelled',
            'errors' => ['account' => ['has_active_orders']],
        ], 409);
    }

    app(DeleteUserAccountAction::class)->execute($user, $request->input('reason'));

    event(new UserAccountDeleted(
        userId: $user->id,
        reason: $request->input('reason'),
        deletedAt: now(),
    ));

    return response()->json(['data' => ['deleted' => true], 'meta' => null]);
}
```

```php
// DeleteUserAccountAction.php
public function execute(User $user, ?string $reason): void
{
    DB::transaction(function () use ($user, $reason) {
        // Revoke all tokens
        $user->tokens()->delete();

        // Delete strictly personal data
        $user->addresses()->delete();
        $user->favorites()->delete();
        $user->searchHistory()->delete();
        $user->pushTokens()->delete();
        $user->notificationPreferences()->delete();

        // Anonymise UGC (keep FKs intact so content doesn't cascade)
        // reviews, messages keep user_id; UI layer resolves "Deleted user"

        // Anonymise user record
        $user->update([
            'email'              => 'deleted-' . $user->id . '@deleted.local',
            'phone'              => null,
            'name'               => 'Deleted user',
            'password'           => Hash::make(Str::random(64)),
            'avatar_url'         => null,
            'is_deleted'         => true,
            'deleted_at'         => now(),
            'deletion_reason'    => $reason,
            'messenger_searchable' => false,
        ]);
    });

    // Non-transactional side-effects
    dispatch(new DeleteUserMediaJob($user->id));      // S3 cleanup
    dispatch(new DisconnectUserRealtimeJob($user->id)); // WS sessions
}
```

---

## 8. Приоритет и сроки

**Приоритет: P0 (blocker для App Store release).** Без этого эндпоинта iOS-приложение не пройдёт App Review.

**Оценка (ориентир):** 1–2 дня на реализацию + тесты + доки.

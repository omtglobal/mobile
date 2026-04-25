# 21. Источники видео (краткий справочник)

Сводка к [`20-video-delivery-optimization.md`](20-video-delivery-optimization.md).

| Source | Кто | Назначение | Примечание |
|--------|-----|------------|------------|
| `platform` | Платформа | Onboarding, промо, сид-контент | Не хранить production-ролики в `public` клиента; вести через API + media pipeline |
| `seller` / `company` | Компания | Shoppable, реклама товара | Product linking, модерация, seller ownership |
| `user` | Покупатель (будущее) | UGC, отзывы | Feature flag, строгая модерация |

Все типы сходятся в единую модель `VideoContent` + `MediaAsset` + `VideoProductLink` на бэкенде. Клиент использует единый контракт `VideoMeta` (в т.ч. `sourceType`, `hlsUrl`, `posterUrl`, `variants`).

## Миграция platform videos с клиента

1. Выложить исходники в S3/MinIO и дать `video_id` в админке.
2. Запустить transcode → `master.m3u8` + постеры.
3. Записи в `videos` / `content_videos` с `sourceType = platform`, выдача в feed API.
4. В мобильном клиенте убрать статические файлы из bundle после готовности API.

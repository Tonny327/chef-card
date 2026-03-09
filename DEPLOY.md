# Деплой: Netlify (фронтенд) + Koyeb (бэкенд)

## 1. Бэкенд на Koyeb

Бэкенд уже готов к запуску на любом хостинге:

- слушает порт из переменной `PORT` (`server.port=${PORT:8085}`);
- берёт параметры базы из env `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`;
- CORS‑оригины задаются через `CORS_ALLOWED_ORIGINS`;
- есть health‑endpoint `GET /health`.

Ниже — пример деплоя **через Docker + панель Koyeb**.

### 1.1 Подготовка Docker‑образа (опционально)

Koyeb умеет сам строить Docker‑образ из репозитория, где есть `backend/Dockerfile`.  
Если хочешь пушить свой образ, собери и запушь его в любой registry (Docker Hub и т.п.) и укажи в Koyeb.

### 1.2 Создание PostgreSQL на Koyeb

1. В панели Koyeb: **Create → Database → PostgreSQL**.
2. Заполни:
   - `POSTGRES_DB`: `chefcard`
   - `POSTGRES_USER`: например `chefcard`
   - `POSTGRES_PASSWORD`: сгенерируй надёжный пароль и сохрани.
3. После создания открой вкладку **Connection info** и скопируй **Internal connection string** вида:

   `postgresql://chefcard:PASSWORD@postgres-xxxxx.internal:5432/chefcard`

   Преобразуй её в JDBC‑формат:

   `jdbc:postgresql://postgres-xxxxx.internal:5432/chefcard`

### 1.3 Создание сервиса backend

1. В панели Koyeb: **Create → Service**.
2. Источник:
   - **Git Repository**
   - репозиторий: `chef-card`
   - **Build context / App path**: `backend`
   - Dockerfile path: `backend/Dockerfile` (или оставь по умолчанию, если Koyeb его находит сам).
3. В разделе **Ports**:
   - Expose port: `8080`
   - Protocol: `HTTP`
4. В разделе **Environment variables** добавь:

   | Key                           | Value                                                                 |
   |------------------------------|-----------------------------------------------------------------------|
   | `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://postgres-xxxxx.internal:5432/chefcard`            |
   | `SPRING_DATASOURCE_USERNAME` | `POSTGRES_USER` из шага 1.2 (например `chefcard`)                     |
   | `SPRING_DATASOURCE_PASSWORD` | `POSTGRES_PASSWORD` из шага 1.2                                       |
   | `CORS_ALLOWED_ORIGINS`       | `https://chef-card.netlify.app` (URL фронтенда, когда он будет готов) |

   Переменную `PORT` Koyeb задаёт автоматически (обычно `8080`), наш бэкенд её уже читает.

5. Нажми **Deploy**. После деплоя у сервиса будет URL вида  
   `https://chefcard-api.koyeb.app` (название будет зависеть от выбранного имени сервиса).

Проверь:

- `https://<твой-сервис>.koyeb.app/health` → должен вернуть `ok`
- `https://<твой-сервис>.koyeb.app/api/recipes` → должен вернуть JSON (`[]` или список)

Старый `fly.toml` в репозитории можно игнорировать — он больше не используется.

---

## 2. Фронтенд на Netlify

### 2.1 Подключение репозитория

1. Зайди на [netlify.com](https://netlify.com) и войди.
2. **Add new site** → **Import an existing project**.
3. Подключи GitHub и выбери репозиторий `chef-card`.

### 2.2 Настройки сборки

| Параметр | Значение |
|----------|----------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` |

(Или оставь пустым, если в корне репо только папка `frontend` и `netlify.toml` внутри неё — тогда Base directory: `frontend`.)

### 2.3 Переменные окружения

В **Site settings** → **Environment variables** добавь:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://<твой-сервис>.koyeb.app` |

(Замени на реальный URL бэкенда на Koyeb, например `https://chefcard-api.koyeb.app`.)

### 2.4 Деплой

Нажми **Deploy site**. После сборки сайт будет доступен по адресу Netlify.

---

## 3. Проверка

1. Открой URL Netlify — должна загрузиться главная с рецептами.
2. Войди в админку (`/login` → admin / admin).
3. Добавь рецепт с изображением.
4. Убедись, что рецепт отображается на главной и картинки загружаются.

---

## 4. Важные замечания

### Изображения на Fly.io

Файлы сохраняются в папку `uploads/` на диске. На Fly.io диск **эфемерный** — при перезапуске приложения загруженные изображения пропадут. Для продакшена лучше использовать облачное хранилище (S3, Cloudflare R2 и т.п.).

### Порядок деплоя

1. Сначала задеплой бэкенд на Fly.io.
2. Установи секрет `CORS_ALLOWED_ORIGINS` с URL Netlify.
3. Задеплой фронтенд на Netlify с `VITE_API_URL` = URL бэкенда.

### Локальная разработка

- Фронт: `cd frontend && npm run dev` — прокси на `http://127.0.0.1:8085`.
- Бэк: `cd backend && mvn spring-boot:run` (или Docker).
- `VITE_API_URL` не задавай — тогда запросы идут через прокси.

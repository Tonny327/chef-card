# Деплой: Netlify (фронтенд) + Fly.io (бэкенд)

## 1. Бэкенд на Fly.io

### 1.1 Установка flyctl

```powershell
# Windows (PowerShell) — официальный способ
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

После установки перезапусти терминал. Проверка: `fly version`.

Альтернатива: если установлен Chocolatey — `choco install flyctl`.

### 1.2 Авторизация

```bash
fly auth login
```

### 1.3 Создание PostgreSQL

```bash
fly postgres create --name chefcard-db
```

- Выбери регион (например, `ams` — Амстердам).
- Выбери конфигурацию **Development** (бесплатный тариф).
- Сохрани вывод — понадобится для подключения.

### 1.4 Привязка PostgreSQL к приложению

Сначала создай приложение (если ещё не создано):

```bash
cd backend
fly launch --no-deploy --name chefcard-api
```

При вопросе про перезапись `fly.toml` выбери **No**, чтобы сохранить текущую конфигурацию.

Затем привяжи базу:

```bash
fly postgres attach chefcard-db -a chefcard-api
```

Команда выведет строку вида:
`DATABASE_URL=postgres://chefcard_api:XXXXX@chefcard-db.flycast:5432/chefcard_api`

### 1.5 Установка секретов

Преобразуй вывод в JDBC-формат и задай секреты:

```bash
fly secrets set \
  SPRING_DATASOURCE_URL="jdbc:postgresql://chefcard-db.flycast:5432/chefcard_api" \
  SPRING_DATASOURCE_USERNAME="chefcard_api" \
  SPRING_DATASOURCE_PASSWORD="ПАРОЛЬ_ИЗ_ВЫВОДА_ATTACH" \
  -a chefcard-api
```

Имя БД и пользователя (`chefcard_api`) возьми из своей строки `DATABASE_URL`.

### 1.6 CORS (после деплоя фронта на Netlify)

Когда получишь URL Netlify (например, `https://chefcard.netlify.app`):

```bash
fly secrets set CORS_ALLOWED_ORIGINS="https://chefcard.netlify.app" -a chefcard-api
```

### 1.7 Деплой

```bash
cd backend
fly deploy
```

После деплоя получишь URL бэкенда, например: `https://chefcard-api.fly.dev`

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
| `VITE_API_URL` | `https://chefcard-api.fly.dev` |

(Замени на свой URL бэкенда с Fly.io.)

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

# Настройка PostgreSQL в Neon для chef-card

Пошаговая инструкция: создание базы в Neon и подключение к backend на Koyeb.

---

## 1. Регистрация и создание проекта в Neon

1. Открой в браузере: **https://neon.tech**
2. Нажми **Sign up** и зарегистрируйся (через email или GitHub).
3. После входа откроется дашборд. Нажми **Create a project** (или **New Project**).
4. Заполни:
   - **Project name**: например `chefcard` или `chef-card`
   - **Region**: выбери ближайший (например **Frankfurt** или **Europe (Frankfurt)** — для Koyeb в EU подойдёт)
   - **PostgreSQL version**: оставь по умолчанию (15 или 16)
5. Нажми **Create project**.

---

## 2. Получение строки подключения и учётных данных

1. После создания проекта откроется страница с **Connection details**.
2. В блоке **Connection string** выбери вкладку **URI** (или **Connection string**).
3. Скопируй строку вида:
   ```text
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   Сохрани её в надёжное место — пароль показывается только один раз. Если закрыл — пароль можно сбросить в настройках (см. ниже).

4. Из этой строки тебе понадобятся:
   - **Host**: например `ep-xxx-xxx.region.aws.neon.tech`
   - **Database**: обычно `neondb`
   - **User**: из начала URI (до `:` после `//`)
   - **Password**: между первым `:` и `@`

Если пароль потерял:
- В Neon: **Project → Settings → Reset password** (или **Dashboard → твой проект → Settings**). Задай новый пароль и пересобери JDBC URL.

---

## 3. Формирование JDBC URL для Spring Boot

Spring Boot ожидает URL в формате JDBC.

Формат:
```text
jdbc:postgresql://<host>/<database>?sslmode=require
```

Пример (подставь свой хост и имя БД из шага 2):
```text
jdbc:postgresql://ep-cool-darkness-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

- **Хост**: из URI Neon (без `postgresql://` и без логина/пароля).
- **База**: как в URI, чаще всего `neondb`.
- **`?sslmode=require`** — обязательно для Neon (подключение по SSL).

Итоговые значения для переменных окружения:

| Переменная | Пример значения |
|------------|------------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | пользователь из URI (например `neondb_owner`) |
| `SPRING_DATASOURCE_PASSWORD` | пароль из URI |

---

## 4. Настройка backend на Koyeb

1. Зайди в панель **Koyeb** → **Services** → выбери свой backend-сервис (chef-card).
2. Открой вкладку **Settings** (или **Environment variables** / **Variables**).
3. Найди переменные:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
4. Замени их значениями из шага 3:
   - **SPRING_DATASOURCE_URL** — твой JDBC URL (с `jdbc:postgresql://...?sslmode=require`).
   - **SPRING_DATASOURCE_USERNAME** — пользователь Neon.
   - **SPRING_DATASOURCE_PASSWORD** — пароль Neon.
5. Сохрани изменения (**Save** / **Update**).
6. Сделай **Redeploy** сервиса (кнопка **Redeploy** или **Deploy**), чтобы приложение перезапустилось с новыми переменными.

---

## 5. Проверка работы

1. Дождись, пока Koyeb покажет статус **Running** / **Healthy**.
2. Открой в браузере:
   - `https://твой-backend.koyeb.app/health` — должен вернуться ответ `ok`.
   - `https://твой-backend.koyeb.app/api/recipes` — список рецептов (может быть пустой массив `[]`).
3. Зайди на сайт (Netlify), открой главную и админку — рецепты должны подгружаться (или страница пустая, если БД новая).

При первом запуске **Liquibase** сам создаст таблицы в Neon по твоим changelog’ам. Старые данные из Koyeb в новую БД не переносятся автоматически — рецепты нужно будет добавить заново (или сделать миграцию дампом, см. раздел 6).

---

## 6. (Опционально) Перенос данных из старой БД Koyeb

Если у тебя ещё есть доступ к старой базе на Koyeb (до исчерпания лимита) и хочешь перенести рецепты:

### 6.1 Экспорт с Koyeb

Если Koyeb даёт возможность подключиться к БД (например, через **Connection** / **Connect** в панели БД):

1. Скопируй строку подключения к старой БД (host, port, user, password, database).
2. На своём компьютере выполни (нужен установленный `pg_dump` и `psql`):

   ```bash
   pg_dump "postgresql://USER:PASSWORD@KOYEB_HOST:PORT/DATABASE" --no-owner --clean --if-exists -f koyeb_dump.sql
   ```

   Подставь вместо `USER`, `PASSWORD`, `KOYEB_HOST`, `PORT`, `DATABASE` значения из Koyeb.

Если Koyeb уже не даёт подключиться — перенос невозможен, используй пустую БД в Neon (Liquibase создаст схему при первом запуске).

### 6.2 Импорт в Neon

1. В Neon в дашборде открой **SQL Editor** (или подключись к проекту через любой клиент по URI из шага 2).
2. Если делал дамп:
   - В терминале:  
     `psql "postgresql://USER:PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require" -f koyeb_dump.sql`
   - Или скопируй в SQL Editor только нужные `INSERT` для таблицы `recipes` (из дампа), выполни их.
3. После импорта перезапусти backend на Koyeb (Redeploy) и проверь сайт.

---

## 7. Полезные ссылки

- Документация Neon: https://neon.tech/docs
- Подключение к приложениям: https://neon.tech/docs/connect/connection-string

Если что-то пойдёт не так — пришли текст ошибки из логов Koyeb (вкладка **Logs** у сервиса) или ответ `/health` и `/api/recipes`.

-- Скрипт создания БД и пользователя для ШефКарта
-- Выполните от имени суперпользователя (postgres) в psql или pgAdmin

CREATE USER chefcard WITH PASSWORD 'chefcard';
CREATE DATABASE chefcard OWNER chefcard;
GRANT ALL PRIVILEGES ON DATABASE chefcard TO chefcard;

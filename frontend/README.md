# AntifakeAI — Admin Panel

React-приложение для управления системой проверки подлинности косметических продуктов.

## Стек

- React 18
- React Router v6
- Axios
- Чистый CSS (без UI-библиотек)

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Настроить окружение
cp .env.example .env
# Отредактируй .env — укажи URL твоего Spring Boot бэкенда

# 3. Запустить
npm start
```

Откроется http://localhost:3000

## Структура

```
src/
├── api/
│   ├── client.js        # axios instance с JWT-интерцептором
│   └── services.js      # все API-методы по модулям
├── components/
│   ├── layout/
│   │   └── Layout.js    # сайдбар + основной контент
│   └── ui/
│       └── index.js     # Button, Input, Table, Modal, Badge, Toast...
├── context/
│   └── AuthContext.js   # хранение токена, login/logout
├── hooks/
│   └── useApi.js        # хук для вызовов API с loading/error
├── pages/
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── verifications/VerificationsPage.js
│   ├── brands/BrandsPage.js
│   ├── products/ProductsPage.js
│   ├── users/UsersPage.js
│   └── images/ImagesPage.js
├── App.js               # роутинг
└── index.js
```

## Страницы

| Путь | Описание |
|------|----------|
| `/` | Dashboard — общая статистика |
| `/verifications` | Очередь проверок + все заявки, подтверждение/отклонение |
| `/products` | CRUD продуктов, поиск, переход к изображениям |
| `/brands` | CRUD брендов, поиск, фильтр по стране |
| `/users` | Список пользователей, блокировка, история верификаций |
| `/images` | Загрузка main/dataset изображений по продукту |

## Авторизация

JWT-токен хранится в `localStorage`. При старте приложения, если токен есть — пользователь автоматически авторизован. 
При 401 — автоматический редирект на `/login`.

Предполагается что бэкенд отдаёт токен в поле `token` при логине:
```json
{ "token": "eyJ...", "firstName": "Admin", ... }
```
Если структура ответа другая — поправь `AuthContext.js`.

## Переменные окружения

```env
REACT_APP_API_URL=http://localhost:8080
```

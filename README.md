# Studybox Frontend

Веб-приложение для подготовки к IELTS: практика по четырём секциям (Listening, Reading, Speaking, Writing) с разбором ответов и AI-фидбеком, а также полноценный mock-экзамен. Построено на Next.js 14 (App Router).

Подробности архитектуры (аутентификация, слой данных, middleware, i18n) — в [CLAUDE.md](CLAUDE.md).

## Стек

- **Next.js 14** (App Router) + **React 18**, **TypeScript** (strict)
- **next-intl** — локализация (en/ru)
- **TanStack Query** — серверные данные; **Zustand** — клиентское состояние
- **shadcn/ui** (Radix) + **Tailwind CSS** — UI
- **react-hook-form** + **zod** — формы и валидация
- **axios** — HTTP-клиент
- **PostHog** + **OpenTelemetry** — телеметрия (только в проде)

## Требования

- **Node.js ≥ 18.17** (минимум Next.js 14; в репозитории не закреплён — нет `engines`/`.nvmrc`)
- **npm** (в репозитории `package-lock.json`)
- Работающий **Studybox API** (по умолчанию ожидается на `http://localhost:8080`)

## Запуск локально

```bash
npm install
npm run dev
```

Дев-сервер поднимется на http://localhost:3000 (или 3001, если порт занят — поведение Next по умолчанию). Корень `/` редиректит на `/en/dashboard`.

**Бэкенд.** Базовый URL API захардкожен в [`src/lib/config.ts`](src/lib/config.ts) (`API_URL`), а не берётся из env. По умолчанию это `http://localhost:8080`. Локального бэкенда в этом репозитории нет, поэтому для автономного запуска фронтенда переключите `API_URL` на прод:

```ts
// src/lib/config.ts
export const API_URL = 'https://api.studybox.kz';
// export const API_URL = 'http://localhost:8080';
```

Без доступного API страницы из группы `(protected)` отдадут 503 или редирект на `/login`. Из публичных страниц полностью работают офлайн только `login`, `registration` и `privacy`; `pricing` рендерится, но без планов (грузит `/billing/subscriptions/plans`).

> **Важно:** запуск localhost-фронта против прод-API не гарантирован «из коробки» — браузерные запросы (включая логин) могут упираться в CORS, разрешённые origin'ы Google OAuth и домен httpOnly-cookie. Серверный рендеринг (`getMe`) ходит в API напрямую и затронут меньше.

## Переменные окружения

Объявлены в `.env` (закоммичен в репозиторий; из локальных оверрайдов игнорируются только файлы вида `.env*.local`, например `.env.local`):

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_ENVIRONMENT` | Окружение: `development` / `preview` / `production`. Значение `production` включает телеметрию (PostHog/OpenTelemetry). |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID для входа через Google. |

> `API_URL` — **не** переменная окружения, а константа в `src/lib/config.ts` (см. «Запуск локально»).

## Команды

```bash
npm run dev     # дев-сервер (Next: порт 3000, при занятости — 3001)
npm run build   # продакшен-сборка
npm run start   # запуск собранного приложения
npm run lint    # next lint — но ESLint НЕ настроен (см. ниже)
```

Тест-фреймворк не подключён. **ESLint не сконфигурирован** — в репозитории нет `.eslintrc*` / `eslint.config.*`, поэтому `npm run lint` запускает интерактивный мастер настройки Next, а не линтит (в CI зависнет). Перед использованием добавьте конфиг (например, `.eslintrc.json` с `{"extends": "next/core-web-vitals"}`). Форматирование — Prettier (`.prettierrc`).

## Структура (верхний уровень)

```
src/
  app/         роуты App Router: [locale] с группами (protected)/(public) + API-роуты (api/)
  api/         клиентские вызовы бэкенда (файл на эндпоинт: GET_*/POST_*, + доменные)
  components/  общие компоненты; ui/ — примитивы shadcn, mobile/ — мобильные версии
  lib/         инфраструктура: config, api/http (axios), auth, subscription, telemetry, queryClient
  stores/      Zustand-сторы (profile, subscription, mock, модалки)
  hooks/       переиспользуемые React-хуки
  i18n/        конфигурация next-intl (routing, navigation, request)
  types/       типы и zod-схемы
  utils/       мелкие утилиты
messages/      словари локализации (en.json, ru.json)
public/        статика
```

## Архитектура — кратко

Для онбординга достаточно знать три вещи (остальное — в [CLAUDE.md](CLAUDE.md)):

- **Аутентификация — токен в двух местах.** При успешном входе (email или Google) и Google-регистрации JWT пишется в `localStorage['token']` (клиентский axios подставляет его как `Bearer`) и дублируется в httpOnly-cookie `token` через роут `/api/auth/session` — cookie нужна для серверного рендеринга. Email/пароль-регистрация токен не выдаёт (сначала подтверждение почты).
- **Гейт доступа — серверный.** Лейаут `src/app/[locale]/(protected)/layout.tsx` (`force-dynamic`) вызывает `getMe()` → бэкенд `/auth/profile`; без пользователя — редирект на `/login`, при недоступности API — страница 503.
- **Кастомный middleware.** `src/middleware.ts` сам проставляет префикс локали и делает два узких UA-редиректа: мобильный на `/{locale}/dashboard` → `/{locale}/m/stats`, десктоп на `/{locale}/m/*` → `/{locale}/dashboard`. Это не стандартный middleware next-intl.

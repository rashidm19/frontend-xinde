# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Studybox frontend — IELTS prep web app. Next.js 14 (App Router) + TypeScript (strict), next-intl, TanStack Query, Zustand, shadcn/ui (Radix) + Tailwind, react-hook-form + zod, axios.

## Commands

```bash
npm run dev     # dev server (Next default port 3000; bumps to 3001 if busy)
npm run build   # production build
npm run start   # serve production build
npm run lint    # next lint — but ESLint is NOT configured (see below)
```

No test framework is configured. **ESLint is not actually set up**: there is no `.eslintrc*` / `eslint.config.*` and no `eslintConfig` in `package.json`, so `npm run lint` drops into Next's interactive ESLint setup wizard instead of linting (it hangs in CI). Add a config (e.g. `.eslintrc.json` with `{"extends": "next/core-web-vitals"}`) before relying on it. Formatting is Prettier (`.prettierrc`): single quotes (incl. JSX), semicolons, 2-space, `printWidth: 170`, `arrowParens: avoid`, Tailwind class sorting via plugin.

## Backend dependency (read first)

The API base URL is **hardcoded** in `src/lib/config.ts` as `API_URL` — currently `http://localhost:8080`, with the prod URL (`https://api.ieltsgg.com`) commented out. It is **not** read from env. The frontend dev server runs standalone, but every authenticated/data page calls this backend; without it `(protected)` pages hit `getMe()` failures → render `Error503` or redirect to `/login`. Of the public pages, only `login`, `registration`, and `privacy` are fully functional offline — `pricing` renders its shell but shows no plans (it fetches `/billing/subscriptions/plans` at load).

Env that *is* used: `.env` holds `NEXT_PUBLIC_ENVIRONMENT` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. `src/lib/config.ts` derives flags: `IS_PROD_BUILD` (from `NODE_ENV`), `IS_PROD_ENV`/`IS_DEV_ENV` (from `NEXT_PUBLIC_ENVIRONMENT`).

## Auth model (token lives in two places)

On a **token-returning** sign-in — login (email or Google) and Google registration — the client writes the JWT to **`localStorage['token']`** (used by the axios interceptor as `Bearer`) **and** mirrors it into an **httpOnly cookie `token`** by POSTing to the `/api/auth/session` route handler via `persistAuthToken()` (`src/lib/auth/session.ts`). Email/password **registration returns no token** — it routes to an email-confirmation step first. Logout clears both (DELETE on the same route).

- **Client requests** attach the token from localStorage in `src/lib/api/http.ts`'s request interceptor — only when the request doesn't already carry an `Authorization` header.
- **The real auth gate is server-side**: `src/app/[locale]/(protected)/layout.tsx` is `force-dynamic`, calls `getMe()` (`src/lib/auth/getMe.ts`) which reads the cookie/`Authorization` header and hits backend `/auth/profile` (3 s timeout). 401/403 → treated as no user → `redirect('/login?next=...')`; network/timeout/5xx (`UpstreamServiceError`) → renders `Error503`.
- That layout also server-prefetches `me`, `subscription`, `balance`, dehydrates, and passes them via `HydrateOnly` so the client has them without refetch. Keys are centralized in `src/lib/queryKeys.ts` (`ME_QUERY_KEY`, etc.).

The `next=` redirect target comes from the `x-sb-original-url` header that `src/middleware.ts` injects.

## Data layer

- **Client API calls live in `src/api/`** — one file per endpoint, named after method+path (`GET_practice_reading_id.ts`, `POST_auth_login.ts`), plus domain files (`profile.ts`, `subscriptions.ts`). **Two styles coexist:** auth/onboarding endpoints (e.g. `POST_auth_login.ts`) are strict — zod schemas for **both** request and response, `validateStatus: () => true`, manual status checks, a custom `*Error` class; most practice/stats/billing endpoints are thin typed wrappers (`axiosInstance.get<T>(...) → response.data`, no zod / no custom error). Match the neighbouring file when adding one. Import the shared axios via `@/lib/axiosInstance` (default export `http`) — it **deduplicates identical in-flight requests**.
- **Server-side fetches** (`src/lib/auth/*`, `src/lib/subscription/*`) use native `fetch` + `next/headers`. They throw `UpstreamServiceError` (`src/lib/api/errors.ts`) on 5xx/network failures (caught by layouts to show `Error503`); 4xx degrades gracefully (`getSubscription` → `null`, `getBalance` → zeroed balance).
- App-internal route handlers live in `src/app/api/` — `auth/session` (token cookie) and `practice/session`.

## State

- **TanStack Query** for server data. Single shared client in `src/lib/queryClient.ts`: `staleTime` 5min, `gcTime` 30min, **no refetch on mount/focus/reconnect**, `retry: 1`.
- **Zustand** stores in `src/stores/` for client/UI state: profile, subscription, mock session, modals, reading hints. Most use the `devtools` middleware (e.g. `profile-store`, `subscription-store`, `confirmation-modal-store`); `readingHints` uses `persist`; the `mock` and UI-modal stores are plain `create(...)`.
- Note `profile` is held in **both** a Zustand store and Query (`ME_QUERY_KEY`); `ProfileInitializer` / `SubscriptionInitializer` (mounted in `src/app/_providers/Providers.tsx`) keep them seeded.

## Routing & i18n

- `src/app/[locale]/` with route groups `(protected)` and `(public)`. `/` redirects to `/en/dashboard` (`next.config.mjs`).
- **`src/middleware.ts` is custom (not next-intl's middleware).** It prefixes the locale, sets the `NEXT_LOCALE` cookie, injects `x-sb-original-url`, and does two narrow **User-Agent–based redirects**: a mobile UA on `/{locale}/dashboard` → `/{locale}/m/stats`, and any desktop UA on `/{locale}/m/*` → `/{locale}/dashboard`. It does *not* broadly rewrite mobile traffic into `/m/*`. Mobile-specific UI also lives in `src/components/mobile/`.
- **Locale config is inconsistent** — `src/i18n/routing.ts` declares `['en','ru']`, but `src/middleware.ts` lists `['en','ru','zh']` while only `messages/en.json` and `messages/ru.json` exist (no `zh.json`). Treat `en`/`ru` as the real supported set.
- **Locale-aware navigation wrappers** exist in `@/i18n/navigation` (`Link`, `useRouter`, `redirect`, `usePathname`) but are **not** the prevailing convention — almost all client code imports `next/link` / `next/navigation` directly and relies on the middleware to add the locale prefix. Follow the surrounding file; don't assume the wrappers are required.

## Conventions

- Path alias `@/* → src/*`. `cn()` from `@/lib/utils`; shadcn primitives in `src/components/ui/` (slate base, CSS variables).
- Route-private code is **colocated**: `_components/` folders, plus per-route hooks/schemas (e.g. `useProfileEditController.ts`, `profileEditSchema.ts`). Shared components are in `src/components/`.
- Practice domain: four IELTS skills with **per-skill** flows (not one shared sequence) — reading: `rules → test → results/[id]`; listening: `customize → rules → audio-check → test → results/[id]`; speaking: `customize → rules → audio-check → mic-check → test → feedback/[id]`; writing: `customize → rules → test → feedback/[id]`. A separate `(protected)/mock/` route tree holds the full timed exam. listening/reading land on `results/[id]`, speaking/writing on `feedback/[id]`.
- **Telemetry (PostHog + OpenTelemetry) is lazy-loaded and only runs in prod** (`IS_PROD_ENV && window`), via `src/lib/telemetry/`. Call the no-op-safe `track(event, props)` from there — it does nothing in dev.

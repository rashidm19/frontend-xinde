# Studybox Frontend Agent Manual

## Project Overview
- Next.js 14 App Router frontend for Studybox IELTS preparation; supports localized marketing, onboarding, and authenticated practice flows.
- Route groups: `app/[locale]/(public)` for unauthenticated screens, `app/[locale]/(protected)` for gated experiences with SSR auth guard.
- Data/state stack: TanStack Query for async cache, Zustand stores for session/subscription/UI modals, axios client for REST calls to `https://api.studybox.kz`.
- Telemetry stack: PostHog analytics plus OpenTelemetry tracing, toggled via deployment environment flags.
- UI stack: React 18, Tailwind (shadcn foundation), Radix primitives, React Hook Form, Embla carousel, Framer Motion.

## Build & Run Instructions
- Require Node.js ≥ 18.17 and npm ≥ 9.
- Install dependencies and start the dev server:
```bash
npm install
npm run dev
```
- Production build and serve:
```bash
npm run build
npm run start
```
- Static analysis:
```bash
npm run lint
```
- Restart `npm run dev` after editing `next.config.mjs`, `tailwind.config.ts`, or `src/middleware.ts`.

## Testing Instructions
- No automated test runner is configured; coordinate before adding suites. Favor colocated unit tests (Vitest/RTL) or Playwright E2E under `tests/` and wire scripts into `package.json`.
- Always run `npm run lint` and `npm run build` before shipping to catch type and compile regressions.
- For UI-heavy changes capture visual proof (screenshots or Storybook references) alongside PRs.

## Repository Conventions
- Folder responsibilities: `src/app` routes/layouts, `src/components` feature/UI blocks, `src/hooks` reusable hooks, `src/lib` config/api/telemetry helpers, `src/stores` Zustand stores, `src/types` shared types, `src/api` axios facades, `messages/*.json` locale strings, `public/` static assets.
- Use the `@/` alias for all imports within `src/`; avoid relative `../../` chains.
- Server Components handle data fetching; tag client components with `'use client'` only when hooks or browser APIs are needed.
- Styling via Tailwind utility classes and `cn` helper; follow shadcn component patterns in `src/components/ui` and keep semantic classnames (use Tailwind safelist when dynamic).
- Data fetching flows should prefer React Query; reuse keys from `src/lib/queryKeys.ts` and let server layouts prefetch to hydrate.
- Zustand stores must expose actions via helper exports (e.g., `refreshSubscriptionAndBalance`) and stay serializable.
- Formatting enforced by Prettier (`printWidth: 170`, single quotes, semicolons); run `npx prettier --check .` if format drift is suspected.
- Adjusting copy requires updating both `messages/en.json` and `messages/ru.json`; keep keys stable with dotted namespaces.

## i18n Rules
- Source every user-facing string from `messages/*.json`; components may only contain literals for ARIA labels or strict technical constants.
- Use stable dotted namespaces for keys (e.g., `reading.practice.header`) and group new feature keys under coherent namespaces.
- Always add translations to both `messages/en.json` and `messages/ru.json`; never change existing keys unless explicitly instructed.
- Do not remove or rename translation keys without explicit user direction; never introduce dynamic key generation.
- Ensure locale flows through routing (`app/[locale]/…`) and that SSR components read locale from middleware-injected context and provider.

## Architecture Summary
- Locale middleware (`src/middleware.ts`) prefixes `/en|ru|zh`, redirects mobile/desktop profile paths, sets `NEXT_LOCALE`, and skips non-GET/HEAD or static assets.
- `(protected)/layout.tsx` is `force-dynamic`, calls `getMe`, `getSubscription`, and `getBalance`, prefetches results into a shared `QueryClient`, then hydrates children via `HydrateOnly`.
- Root `Providers` wraps the tree exactly once, wiring TanStack Query, telemetry initializers, subscription/paywall modals, and React Query devtools in non-prod builds.
- HTTP layer (`src/lib/api/http.ts`) centralizes axios with in-flight deduplication, auth header injection, and `meta.noDedup` escape hatch for streaming/upload scenarios.
- Access control relies on hydrated cache: `useSubscriptionStore`, `ensureSubscriptionAccess`, and `useSubscriptionGate` must back new practice/mock gates to avoid stale permissions.
- Telemetry (`src/lib/telemetry`) bootstraps PostHog + OTLP tracing only when `NEXT_PUBLIC_ENVIRONMENT=production`; preserve injected headers when wrapping `fetch`.
- Deep design references: [docs/first-render-refactor.md](docs/first-render-refactor.md), [docs/ignored/MODALS.md](docs/ignored/MODALS.md), [docs/ignored/METRICS_I_F.md](docs/ignored/METRICS_I_F.md), [docs/ignored/ENV_USAGE.md](docs/ignored/ENV_USAGE.md).

## Environment Variables
- `NEXT_PUBLIC_ENVIRONMENT`: Required in every deploy; consumed by `src/lib/config.ts` to set `IS_DEV_ENV`, `IS_PREVIEW_ENV`, `IS_PROD_ENV` guards.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Client-only Google auth identifier; remove hard-coded fallbacks when modifying auth flows.
- Constants exported from `src/lib/config.ts` (API URLs, `IS_PROD_BUILD`, etc.) are the single source of truth; avoid direct `process.env.*` usage elsewhere.
- Define secrets (API tokens, payment keys) server-side without the `NEXT_PUBLIC_` prefix; never commit literal credentials.

## Git & Workflow Rules
- Default base branch: `main`. Create topic branches `feature/<slug>`, `fix/<slug>`, or `chore/<slug>` from the latest `main`; branch `dev` is staging only.
- Keep commits focused and imperative (e.g., `Practice: add reading answer grid`); include co-author trailer lines when pairing with Droid per Factory guidelines.
- Before committing run `npm run lint` and `npm run build`; include updated translations/assets in the same change set.
- PRs must describe scope, list verification evidence (commands run, screenshots), call out new environment flags, and ensure diffs stay inside allowed paths.

## Gotchas & Failure Modes
- Never mount another `QueryClientProvider`; `Providers` guards singleton usage and logs warnings in non-prod.
- Locale middleware only processes GET/HEAD; API routes must already include locale prefixes to avoid redirect loops.
- Auth guard returns `ServiceUnavailable` on upstream 5xx; wrap new server fetches in `UpstreamServiceError` so the layout can render the fallback instead of crashing.
- Subscription/paywall logic assumes hydrated React Query cache; bypassing it (manual fetch + local state) leads to stale access checks.
- Axios dedup caches keys for 15 s; long uploads/polls needing parallel requests should set `meta.noDedup = true`.
- Telemetry monkey patches `fetch` in production; preserve headers (especially tracing) when creating custom fetch wrappers or polyfills.
- Mobile profile navigations redirect to `/m/*`; ensure parallel desktop routes exist or adjust middleware mapping when adding new mobile screens.

## Valid Scope for Edits
- Allowed directories: `src/app`, `src/components`, `src/hooks`, `src/api`, `src/lib`, `src/stores`, `src/types`, `messages`, `public`, configuration files at repo root.
- Avoid touching `.factory/` assets or `docs/ignored/*` without explicit instruction; reference them instead of rewriting.
- Changes to `src/middleware.ts`, `next.config.mjs`, or `src/app/_providers/Providers.tsx` require updated verification steps (lint + build + manual routing smoke test).
- New UI blocks should follow existing folder structure (feature directory or `components/ui`), include translation updates, and integrate with stores/query cache when data changes.
- Only edit AGENTS.md, README, or other docs when requested.

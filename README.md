# Studybox Frontend

## About the Project
Studybox is an AI-driven IELTS preparation platform that delivers adaptive practice plans, analytics, and subscription-based learning experiences. This repository contains the production Next.js 14 frontend powering localized marketing pages, authenticated practice modules, paywall flows, and telemetry instrumentation for the platform.

## Features
- Next.js 14 App Router with nested layouts and streaming-friendly SSR.
- Dynamic SSR layouts that prefetch user, subscription, and balance data.
- Middleware-based locale routing with device-aware redirects and cookie persistence.
- TanStack Query hydration pipeline for cache-first reads and offline-safe gates.
- Zustand stores for subscription state, profile data, global modals, and UI shell.
- TailwindCSS styling with shadcn-inspired primitives, Radix UI, and animation helpers.
- Telemetry stack integrating PostHog analytics and OpenTelemetry tracing exporters.
- Subscription/paywall flow management with shared balance cache and modal orchestration.
- Modular practice experiences covering Reading, Writing, Listening, and Speaking tracks.

## Tech Stack
- **Framework:** Next.js 14, React 18
- **Language:** TypeScript (ESNext, strict)
- **Routing & i18n:** App Router, next-intl, custom edge middleware
- **State & Data:** TanStack Query, Zustand, Axios (deduplicated adapter)
- **Styling & UI:** TailwindCSS, class-variance-authority, tailwind-merge, Radix UI, Framer Motion, Embla Carousel
- **Forms & Validation:** React Hook Form, Zod
- **Telemetry:** PostHog JS SDK, @opentelemetry/web stack
- **Tooling:** ESLint (Next.js config), Prettier (Tailwind plugin), TypeScript compiler

## System Architecture
```
Client Request
  ↓
Edge Middleware (locale prefix, mobile/desktop redirects)
  ↓
App Router Layouts (public vs protected)
  ↓
Protected Layout SSR prefetch (getMe, getSubscription, getBalance)
  ↓
QueryClient dehydrate + Root Providers (React Query, telemetry, modals)
  ↓
Client hydration with TanStack cache + Zustand stores
```
- Locales propagate from middleware cookies into `app/[locale]/…` segments and next-intl providers.
- Auth/subscription data fetched server-side hydrate TanStack Query, enabling cache-only gates on the client.
- Zustand holds UI control state (modals, paywalls) while React Query manages async resources.
- Public routes live under `app/[locale]/(public)`; protected routes reside in `(protected)` with SSR guards before render.

## Folder Structure
```
.
├─ src/
│  ├─ app/                # App Router routes, layouts, loaders
│  ├─ components/         # Shared UI blocks, modals, shadcn-style primitives
│  ├─ hooks/              # Reusable hooks (subscription gates, analytics, forms)
│  ├─ stores/             # Zustand stores for profile, subscription, UI
│  ├─ lib/                # Config, API clients, telemetry, subscription helpers
│  ├─ api/                # Axios facades and schema utilities
│  ├─ i18n/               # next-intl routing and request configuration
│  ├─ types/              # Shared TypeScript types and zod schemas
│  └─ utils/              # General-purpose utility helpers
├─ messages/              # Localization bundles (en.json, ru.json)
├─ public/                # Static assets
├─ docs/                  # Internal design and architecture notes
├─ next.config.mjs        # Next.js + next-intl configuration
├─ tailwind.config.ts     # Tailwind design tokens and safelist
└─ package.json
```

## Environment Variables
| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | Declares the deployment tier (`development`, `preview`, `production`) for telemetry toggles and environment guards. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID used by client-side login flows. |
- Create `.env.local` for local development mirroring the keys above (no secrets committed).
- Server-only secrets must be configured via deployment environment variables without the `NEXT_PUBLIC_` prefix.

## Getting Started
1. **Prerequisites:** Node.js ≥ 18.17 and npm ≥ 9.
2. **Install dependencies:** `npm install`
3. **Run development server:** `npm run dev` (default at http://localhost:3000)
4. **Build for production:** `npm run build`
5. **Serve production build locally:** `npm run start`
6. **Lint & type-check:** `npm run lint`
7. Restart the dev server when changing `next.config.mjs`, `tailwind.config.ts`, or `src/middleware.ts`.

## Development Workflow
- Branch from `main` using `feature/<slug>`, `fix/<slug>`, or `chore/<slug>` naming; avoid direct commits to `main` or `dev`.
- Place new components in the relevant feature directory within `src/components` (shared primitives belong in `src/components/ui`).
- Treat Server Components as default; opt into `'use client'` only when hooks or browser APIs are required.
- Update translations by adding keys to both `messages/en.json` and `messages/ru.json` with stable dotted namespaces; never mutate existing keys without explicit approval.
- Run smoke checks (`npm run lint`, `npm run build`, manual route validation) before raising PRs.

## Testing
- **Linting:** `npm run lint` is mandatory before merge.
- **Build verification:** `npm run build` ensures SSR and type safety.
- **Future suites:** Vitest/React Testing Library or Playwright can be added under `tests/`; document new scripts when introduced.
- **PR validation:** Include command outputs or screenshots (for visual work) in PR descriptions.

## Deployment
- CI/CD should run `npm run lint` and `npm run build` before shipping artifacts.
- Ensure environment variables are configured per environment (including server-only secrets).
- Hosting platforms must support Next.js App Router and edge middleware (e.g., Vercel, custom Node edge setups).
- Production deployments execute `npm run build` followed by platform-specific start commands.

## Contributing
- Use concise, imperative commit messages (`Practice: add reading answer grid`). Include Factory bot co-author trailers when pairing with Droid.
- Rebase on `main` before opening PRs; avoid merge commits in feature branches.
- PRs must summarize scope, list validation steps, mention translation updates, and call out environment or migration changes.
- Require at least one peer review before merging; squash merges keep history clean.

## License
Proprietary – internal use only.

## FAQ
**Why is SSR required?**  
SSR enforces authentication redirects before rendering and seeds client caches with subscription data for paywall gating.

**Why do we use middleware for locale?**  
Edge middleware prefixes locale segments, sets `NEXT_LOCALE` cookies, and handles device-specific redirects before the request reaches App Router.

**How do I add new translation keys?**  
Add dotted namespace keys to both `messages/en.json` and `messages/ru.json`, keep names stable, and consume them via next-intl helpers.

**Why rely on Zustand instead of Context?**  
Zustand yields serializable stores, imperative helpers, and fine-grained subscriptions suitable for modal/paywall state without excessive rerenders.

**Where should practice module screens live?**  
Implement routes under `app/[locale]/(protected)/practice/<module>`, prefetch data in the protected layout, and wire translations under a dedicated namespace.

**How is telemetry controlled?**  
Telemetry initializes only when `NEXT_PUBLIC_ENVIRONMENT` equals `production`; other tiers run PostHog/OTEL in no-op mode.

**When should I bypass Axios deduplication?**  
Set `meta: { noDedup: true }` for long-polling or streaming requests that must run concurrently.

**What smoke tests precede deployment?**  
Run `npm run lint`, `npm run build`, then manually verify locale routing, login, paywall flows, and telemetry console logs.

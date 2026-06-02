# Funnel gating architecture — `login → onboarding → paywall → app`

- **Date:** 2026-06-02
- **Status:** Design approved, ready for implementation plan
- **Scope:** Frontend routing/gating/redirect layer only (reuse existing screens) + one reversible backend flag

## 1. Problem

Every funnel screen already exists and is polished: the onboarding state-machine
(`(protected)/onboarding`), the pricing/paywall UI (`(public)/pricing` with a demo tier,
premium plans, and a credits system), and the app (dashboard / practice / mock / notes).

What is missing is **enforced sequencing**. Today the four stages are independent
destinations, not a pipeline:

- The only real gate is `(protected)/layout.tsx` (server, `force-dynamic`), which checks
  `getMe()` and on `!me` redirects to `/login?next=`. It also prefetches `me` +
  `subscription` + `balance` and hydrates them to the client.
- Onboarding is only **softly** gated: the onboarding page redirects *out* to dashboard
  when `onboarding_completed`, but nothing redirects an incomplete user *into* it — a fresh
  user lands straight on `/dashboard`.
- The paywall lives in `(public)`, has no access to `me`, and is entirely optional.

Goal: turn the four stages into a strict, non-bypassable pipeline with no flicker, reusing
every existing screen.

## 2. Locked decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Work scope | **Flow & gating only** | Screens exist and are polished; rewire, don't rebuild. |
| 2 | Paywall semantics | **Hard wall** | No app access without entitlement. |
| 3 | Entitlement predicate | **active subscription OR non-zero credits** | Uses both existing mechanisms (`computeHasActiveSubscription`, credit balance). |
| 4 | New-user day-one access | **Disable welcome credits (temporarily)** | Makes the funnel literal: a fresh onboarded user hits the paywall. Reversible flag. |
| 5 | Sanctioned free path | **Trial at the paywall** | Plans carry `trial_days`; a `trialing` sub counts as entitled. "Try before pay" happens at the paywall, not via auto-grant. |
| 6 | Where the gate runs | **Server-layout route-group zones + shared `resolveStage()`** | Authoritative, zero-flicker, can't be bypassed, can't go stale; extends the existing `force-dynamic` layout. Client selector is a convenience fast-path only. |

### Approaches considered for decision 6

- **① Server-layout zones (chosen).** Redirect happens in RSC layouts before render → no
  flicker, not bypassable, idiomatic; the server round-trip already happens today.
- **② Edge middleware.** Earliest redirect, but the middleware deliberately makes no network
  calls today; entitlement via token claims goes **stale** exactly when it matters (expiry,
  credits → 0), and a per-nav backend call adds edge latency + a timeout failure mode. Bad
  fit for a hard entitlement wall.
- **③ One fat layout with path-string exceptions.** Least file movement, but fragile
  imperative path matching and a conditional tangle where funnel/app share one gate — the
  loop-bug trap.

## 3. Architecture

### 3.1 Route structure & zones

Route groups in parentheses **do not change URLs** (`/dashboard` stays `/dashboard`). Only
folders move.

```
app/[locale]/
├── (public)/                      ← unchanged: login, registration, privacy,
│   │                                 password-*, email-*, Error500/503
│   └── pricing/                   ← stays PUBLIC marketing page (logged-out visitors)
│
└── (protected)/
    ├── layout.tsx                 ← AUTH gate only: getMe() → !me ⇒ /login?next=
    │                                 still prefetches me+sub+balance, dehydrates (as today)
    │
    ├── (funnel)/                  ← requires `me`; these are the gates' redirect TARGETS
    │   ├── layout.tsx             ← stage guard: render only the screen matching the
    │   │                             user's current stage; else redirect to that stage
    │   ├── onboarding/            ← MOVED from (protected)/onboarding
    │   └── paywall/               ← NEW: reuses PricesModal / PricingMobileView (now has `me`)
    │
    └── (app)/                     ← requires me + onboarded + entitled
        ├── layout.tsx             ← APP gate: !onboarded ⇒ /onboarding ; !entitled ⇒ /paywall
        ├── dashboard/             ← all MOVED under (app)/
        ├── practice/
        ├── mock/
        ├── notes/
        └── m/                     ← mobile routes move too; UA middleware unchanged
```

Why: `onboarding` + `paywall` sit in `(funnel)`, gated on `me` only, so they are reachable
as redirect targets without bouncing themselves (kills the loop bug class). Everything users
"use" sits in `(app)` behind the full predicate. `(app)` and `(funnel)` are siblings, so
their layouts never share a gate except the auth parent.

### 3.2 Single source of truth (pure, reused server + client)

```ts
// src/lib/funnel/resolveStage.ts
export type FunnelStage = 'unauthenticated' | 'onboarding' | 'paywall' | 'app';

export const isEntitled = (sub: IClientSubscription | null, bal: IBillingBalance | null) =>
  computeHasActiveSubscription(sub) ||                 // reuses src/lib/subscription/derive.ts
  computeBalanceFlags(bal).hasPracticeCredits ||
  computeBalanceFlags(bal).hasMockCredits;

export function resolveFunnelStage(input: {
  me: User | null;
  subscription: IClientSubscription | null;
  balance: IBillingBalance | null;
}): FunnelStage {
  if (!input.me)                          return 'unauthenticated';
  if (!input.me.onboarding_completed)     return 'onboarding';
  if (!isEntitled(input.subscription, input.balance)) return 'paywall';
  return 'app';
}
```

```ts
// src/lib/funnel/paths.ts — the ONLY place that maps stage → URL
export function pathForStage(stage: FunnelStage, locale: string, next?: string | null): string {
  switch (stage) {
    case 'unauthenticated': return withNext(`/${locale}/login`, next);
    case 'onboarding':      return withNext(`/${locale}/onboarding`, next);
    case 'paywall':         return withNext(`/${locale}/paywall`, next);
    case 'app':             return next ?? `/${locale}/dashboard`;
  }
}

// 'onboarding' | 'paywall' | null, derived from the requested path (via x-sb-original-url)
export function screenFromPath(pathname: string): Extract<FunnelStage, 'onboarding' | 'paywall'> | null;
function withNext(path: string, next?: string | null): string; // appends ?next= when present
```

### 3.3 Gate enforcement (server-side; redirect before render)

```ts
// (app)/layout.tsx
const stage = resolveFunnelStage({ me, subscription, balance });
if (stage !== 'app') {
  redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
}
```

```ts
// (funnel)/layout.tsx — strict ordering: no skip-ahead, no lingering on a finished step
const stage = resolveFunnelStage({ me, subscription, balance });
if (stage === 'app') redirect(pathForStage('app', locale, incomingNext)); // done → leave funnel
const requested = screenFromPath(originalUrl); // 'onboarding' | 'paywall'
if (requested !== stage) redirect(pathForStage(stage, locale, incomingNext)); // wrong step → your step
```

That single path-vs-stage comparison enforces order both directions: not-onboarded hitting
`/paywall` → bounced back to `/onboarding`; onboarded-but-unpaid hitting `/onboarding` →
bounced forward to `/paywall`.

### 3.4 Data flow (one fetch per request, no flicker)

```
(protected)/layout.tsx   ─ getMe() [React cache()] → !me ⇒ /login
                           prefetch me+sub+balance → dehydrate → HydrateOnly      (unchanged)
   └─ (app)/layout.tsx    ─ cached getMe/getSubscription/getBalance (deduped, same request)
                             → resolveFunnelStage() → redirect if ≠ 'app'
   └─ (funnel)/layout.tsx ─ same resolve → bounce wrong/finished stage
Client: Providers hydrate me+sub+balance → useFunnelStage() runs the SAME
        resolveFunnelStage over the Query cache → instant post-submit / post-checkout nav
```

Wrapping `getMe` / `getSubscription` / `getBalance` in React `cache()` lets the parent
`(protected)` layout and the child gate share a single backend round-trip per request. The
client selector `useFunnelStage()` reads the already-hydrated `ME_QUERY_KEY` /
`SUBSCRIPTION_QUERY_KEY` / `BALANCE_QUERY_KEY` and runs the same pure function, so the server
stays authoritative and the client is only a fast path.

> Optimization (optional, not required): `/auth/profile` already returns the credit balances,
> so the gate could resolve onboarding + credits from `me` alone and only call
> `/billing/subscriptions/current` for the subscription branch. Left as-is for now to avoid
> touching the existing balance hydration the app UI depends on.

### 3.5 Deep-link survives the whole funnel

`next=` is threaded through every funnel hop, not just login:

```
logged-out → /dashboard/settings
  parent auth gate       → /login?next=/dashboard/settings
  login                  → /dashboard/settings
  (app) gate: !onboarded → /onboarding?next=/dashboard/settings
  onboarding done        → /paywall?next=/dashboard/settings        (still unpaid)
  paywall success        → /dashboard/settings   ✓ lands on original target
```

Rule: when a gate redirects **into** the funnel it carries `next` = the originally-requested
app URL (sanitized via existing `sanitizeNextPath`). The funnel layout preserves the incoming
`?next` when bouncing between funnel steps. Funnel screens, on completion, navigate to
`pathForStage(resolvedStage, next)`.

## 4. Edge cases & error handling

1. **Entitlement lapse mid-session** (sub expires / last credit consumed while in the app):
   the next *server* navigation re-resolves via the `force-dynamic` `(app)` gate → bounce to
   `/paywall`. An in-progress practice/exam is **not** interrupted mid-screen (credits are
   debited at start; the gate applies on the next navigation). The client selector also
   catches it on the next render once the balance query updates.
2. **Checkout-return race (EPay is async).** `POST /checkout/*` returns and the user is
   redirected back via `backLink`, but entitlement is granted by the async `postLink` webhook
   — so `/billing/subscriptions/current` may briefly still be empty. The paywall-success → app
   handoff **must refetch sub+balance and show a brief "activating…" state with bounded
   retry/poll** before concluding the user is still unpaid. Otherwise a user who just paid is
   bounced back to the paywall. Hard requirement.
3. **Backend outage** (`UpstreamServiceError` from any of the three fetches): keep today's
   behavior — render `Error503`; never redirect-loop and never lock a paying user out on a
   timeout. The gate treats "unknown" as "do not redirect," not "deny."
4. **Logged-in user hits public `/pricing`** (marketing page): allowed — it is public.
   Voluntary upgrades from inside the app route to the authenticated paywall/billing, not the
   funnel gate. The funnel `/paywall` only *bounces* a genuinely `!entitled` user.
5. **Order enforcement** (see §3.3): no skipping ahead, no lingering on a finished step.
6. **Mobile `/m/*`** routes live in the `(app)` zone → gated identically; the existing UA
   redirects in `src/middleware.ts` stay untouched (orthogonal).

## 5. Backend dependency (the only backend change)

Gate `grant_welcome_practice_credit()` (`backend/client/utils.py:85`, called from
`backend/client/views.py:261` and `:302`) behind a setting:

```python
# core/settings.py
WELCOME_CREDITS_ENABLED = env.bool("WELCOME_CREDITS_ENABLED", default=False)
```

Make the grant a no-op when disabled. Reversible with one env change. Existing users who
already received credits are unaffected (the `got_free_welcome_test` guard stays). With this
off, a fresh onboarded user has 0 credits + no sub → `!entitled` → lands on the paywall.

## 6. File change list

**New (all small / pure):**
- `src/lib/funnel/resolveStage.ts` — `FunnelStage`, `isEntitled`, `resolveFunnelStage`
- `src/lib/funnel/paths.ts` — `pathForStage`, `screenFromPath`, `withNext`
- `src/hooks/useFunnelStage.ts` — client selector over the Query cache
- `src/app/[locale]/(protected)/(app)/layout.tsx` — app gate
- `src/app/[locale]/(protected)/(funnel)/layout.tsx` — funnel gate
- `src/app/[locale]/(protected)/(funnel)/paywall/page.tsx` — authenticated paywall reusing
  `PricesModal` / `PricingMobileView` + checkout-return "activating…" handling

**Moved (folders only; URLs unchanged):**
- `(protected)/dashboard` → `(protected)/(app)/dashboard`
- `(protected)/practice` → `(protected)/(app)/practice`
- `(protected)/mock` → `(protected)/(app)/mock`
- `(protected)/notes` → `(protected)/(app)/notes`
- `(protected)/m` → `(protected)/(app)/m`
- `(protected)/onboarding` → `(protected)/(funnel)/onboarding`

**Modified:**
- `(protected)/layout.tsx` — wrap the three fetchers in `cache()`; keep the auth gate +
  prefetch/dehydrate/HydrateOnly exactly as-is
- `(protected)/(funnel)/onboarding/page.tsx` — post-submit navigation uses `useFunnelStage`
  (completed-but-unpaid → `/paywall`, carrying `next`); read incoming `next` from query
- `(public)/pricing/page.tsx` — share its existing presentational components with `/paywall`
  (no new extraction expected; confirm during implementation)

**Backend:**
- `core/settings.py` + `client/utils.py` (or the call sites) — `WELCOME_CREDITS_ENABLED` flag

**Verified backend contracts (no change needed):**

| Gate need | Endpoint | Key fields |
|---|---|---|
| auth presence | `GET /auth/profile` (JWT `ClientAuth`) | `onboarding_completed`, `balance`, `mock_balance`, `practice_balance`, `got_free_welcome_test` |
| onboarding | `GET /onboarding/schema` · `POST /onboarding/submit` | sets `onboarding_completed_at`; idempotent; 409 on version conflict |
| subscription | `GET /billing/subscriptions/current` | `status`, `current_period_start/end`, `cancel_at_period_end`, `plan` |
| credits | `GET /billing/balance` | `tenge_balance`, `mock_balance`, `practice_balance` |
| plans | `GET /billing/subscriptions/plans` | plans + `features`, `trial_days` |
| purchase + lifecycle | `POST /checkout/*`, `/orders/*`, `/billing/subscriptions/{cancel,resume}` | checkout + cancel/resume |

## 7. Testing

No test framework is configured today (per `frontend/CLAUDE.md`). The gate logic is exactly
where loop/skip bugs hide, so add **vitest** scoped to the pure functions only (no Next
runtime needed) and lock down this truth + redirect table:

| `me` | `onboarding_completed` | `entitled` | stage → destination |
|---|---|---|---|
| ✗ | – | – | `unauthenticated` → `/login?next=` |
| ✓ | ✗ | – | `onboarding` → `/onboarding` |
| ✓ | ✓ | ✗ | `paywall` → `/paywall` |
| ✓ | ✓ | ✓ | `app` → `next` ?? `/dashboard` |

Plus per-zone redirect cases (not-onboarded → `/paywall` bounces back to `/onboarding`;
finished user on a funnel screen bounces out to `/dashboard`) and the `next=`-threading
trace. The async/UX scenarios (checkout-return race, lapse mid-session) are a documented
**manual-QA matrix**:

- New user: register → verify → onboarding → paywall (no free credit) → trial/pay → app.
- Returning entitled user: login → straight to app; `/onboarding` and `/paywall` bounce out.
- Lapsed user: credits → 0 / sub expired → next navigation bounces to `/paywall`.
- Checkout return: pay → "activating…" → app once the webhook lands (no bounce-back).

## 8. Non-goals / out of scope

- Redesigning any screen's UI (onboarding steps, pricing cards, dashboard).
- Changing the credit/subscription business model beyond the welcome-credit toggle.
- Moving auth/entitlement into edge middleware.
- Reworking the mobile UA-redirect logic in `middleware.ts`.

## 9. Future / open

- **Re-enable welcome credits** later by flipping `WELCOME_CREDITS_ENABLED=True` (no code
  change). Revisit when the hard-wall conversion data is in.
- Optional fetch optimization in §3.4 (resolve credits from `me`, drop the separate balance
  call in the gate path).

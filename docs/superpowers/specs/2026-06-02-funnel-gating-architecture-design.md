# Funnel gating architecture — `login → onboarding → paywall → app`

- **Date:** 2026-06-02
- **Status:** Design approved; revised twice after code review (every claim verified against `frontend/` + `backend/`). Backend = GO; frontend Critical blocker (order-poll wiring) cleared. Ready for implementation plan.
- **Scope:** Frontend routing/gating/redirect layer (reuse existing screens, with the extractions/adaptations in §6) + one reversible backend flag (and its test updates).

## 1. Problem

Every funnel screen already exists: the onboarding state-machine
(`(protected)/onboarding`), the pricing/paywall UI (`(public)/pricing`), and the app
(dashboard / practice / mock / notes). What is missing is **enforced sequencing** — today the
four stages are independent destinations, not a pipeline:

- The only real gate is `(protected)/layout.tsx` (server, `force-dynamic`): checks `getMe()`,
  on `!me` redirects to `/login?next=`, and prefetches `me` + `subscription` + `balance`.
- Onboarding is only **softly** gated: the onboarding page redirects *out* when
  `onboarding_completed`, but nothing redirects an incomplete user *into* it.
- The paywall lives in `(public)`, has no access to `me`, and is optional. A separate
  **client-side** modal paywall (`GlobalSubscriptionPaywall` + `openPaywall()`) already gates
  some app entry points (see §3.6) — this design must reconcile with it.

Goal: a strict, non-bypassable, flicker-free pipeline reusing the existing screens.

## 2. Locked decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Work scope | **Flow & gating** (reuse screens; extract/adapt only what §6 lists) | Screens exist; rewire, don't rebuild. |
| 2 | Paywall semantics | **Hard wall** | No app access without entitlement. |
| 3 | Entitlement predicate | **active subscription OR non-zero credits** | Reuses `computeHasActiveSubscription` + credit balance. |
| 4 | New-user day-one access | **Disable welcome credits (temporarily)** | Makes the funnel literal: a fresh onboarded user reaches the paywall. Reversible flag (§5). |
| 5 | Free path | **None — pay-only (MVP)** | No working trial exists on either end (see note); welcome credits are off; the user pays to enter. Revisit later (§9). |
| 6 | Where the gate runs | **Server-layout route-group zones + shared `resolveStage()`** | Authoritative, zero-flicker, not bypassable, can't go stale; extends the existing `force-dynamic` layout. Client selector is a convenience fast-path only. |

> **Why no trial (verified):** the backend has **no `trialing` status** — `SubscriptionStatus`
> is `{active, pending_cancel, canceled, expired}` (`backend/payments/models.py:39-43`). A
> "trial" is just a subscription created as `status=active` with `current_period_end =
> now + trial_days`, and only **after** a paid `postLink` or a 100%-off promo
> (`backend/payments/views.py:425-437`). There is no no-payment trial-start endpoint and no
> trial CTA in the UI. So a real free trial is out of MVP scope. The frontend predicate's
> `trialing` branch (in existing `derive.ts`) is harmless dead code — a trial, if ever added,
> surfaces as `active` anyway.

### Approaches considered for decision 6

- **① Server-layout zones (chosen).** Redirect in RSC layouts before render → no flicker, not
  bypassable, idiomatic; the server round-trip already happens today.
- **② Edge middleware.** Earliest redirect, but the middleware makes no network calls today;
  entitlement via token claims goes **stale** exactly when it matters (expiry, credits → 0),
  and a per-nav backend call adds latency + a timeout failure mode. Bad fit for a hard wall.
- **③ One fat layout with path-string exceptions.** Least file movement, but fragile
  imperative matching and a conditional tangle where funnel/app share one gate — the loop trap.

## 3. Architecture

### 3.1 Route structure & zones

Route groups in parentheses **do not change URLs** (`/dashboard` stays `/dashboard`). Folders
move (each carries its own nested `layout.tsx` along — a higher-volume move than "folders only"
implies, but URL-preserving).

```
app/[locale]/
├── (public)/                      ← unchanged: login, registration, privacy, …
│   └── pricing/                   ← stays PUBLIC marketing page (logged-out visitors)
│
└── (protected)/
    ├── layout.tsx                 ← AUTH gate only: getMe() → !me ⇒ /login?next=
    │                                 still prefetches me+sub+balance, dehydrates (as today)
    │
    ├── (funnel)/                  ← requires `me`; these are the gates' redirect TARGETS
    │   ├── layout.tsx             ← force-dynamic; stage guard: render only the screen
    │   │                             matching the user's stage; else redirect to it
    │   ├── onboarding/            ← MOVED from (protected)/onboarding
    │   └── paywall/               ← NEW page (see §3.6 for the component work it needs)
    │
    └── (app)/                     ← requires me + onboarded + entitled
        ├── layout.tsx             ← force-dynamic; !onboarded ⇒ /onboarding ; !entitled ⇒ /paywall
        ├── dashboard/ practice/ mock/ notes/ m/   ← all MOVED under (app)/
```

`onboarding` + `paywall` sit in `(funnel)`, gated on `me` only, so they're reachable as
redirect targets without bouncing themselves (kills the loop class). `(app)`/`(funnel)` are
siblings → their layouts never share a gate except the auth parent.

**Both gate layouts must declare `export const dynamic = 'force-dynamic'` themselves** — do not
rely on inheritance from the parent. (They re-resolve per request anyway because the fetchers
read `headers()`/`cookies()` with `no-store`, but the directive is cheap insurance against a
future refactor silently making a gate statically cached → stale.)

### 3.2 Single source of truth (pure, reused server + client)

```ts
// src/lib/funnel/resolveStage.ts
export type FunnelStage = 'unauthenticated' | 'onboarding' | 'paywall' | 'app';

export const isEntitled = (sub: IClientSubscription | null, bal: IBillingBalance | null) =>
  computeHasActiveSubscription(sub) ||                 // src/lib/subscription/derive.ts (verified)
  computeBalanceFlags(bal).hasPracticeCredits ||
  computeBalanceFlags(bal).hasMockCredits;

export function resolveFunnelStage(input: {
  me: User | null;
  subscription: IClientSubscription | null;
  balance: IBillingBalance | null;
}): FunnelStage {
  if (!input.me)                          return 'unauthenticated';
  if (!input.me.onboarding_completed)     return 'onboarding';   // bool, defaults false (verified types.ts:26)
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
    case 'app':             return next ?? `/${locale}/dashboard`;   // next must already be sanitized
  }
}

// MUST tolerate the locale prefix AND query string: x-sb-original-url is e.g.
// "/ru/paywall?next=%2Fru%2Fdashboard" (locale ∈ en|ru|zh, middleware.ts:5) — parse
// /{locale}/{segment}, ignore search.
export function screenFromPath(originalUrl: string): Extract<FunnelStage, 'onboarding' | 'paywall'> | null;
function withNext(path: string, next?: string | null): string;   // appends ?next= when present
```

### 3.3 Gate enforcement (server-side; redirect before render)

```ts
// (app)/layout.tsx   — export const dynamic = 'force-dynamic'
const stage = resolveFunnelStage({ me, subscription, balance });
if (stage !== 'app') {
  redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));  // safeRedirect.ts (verified)
}
```

```ts
// (funnel)/layout.tsx — export const dynamic = 'force-dynamic'
const stage = resolveFunnelStage({ me, subscription, balance });
if (stage === 'app') redirect(pathForStage('app', locale, incomingNext));  // done → leave funnel
const requested = screenFromPath(originalUrl);          // 'onboarding' | 'paywall'
if (requested !== stage) redirect(pathForStage(stage, locale, incomingNext)); // wrong step → your step
```
`incomingNext` = the `?next` query already on the funnel URL, re-sanitized via
`sanitizeNextPath`. The path-vs-stage compare enforces order both directions (not-onboarded on
`/paywall` → back to `/onboarding`; onboarded-unpaid on `/onboarding` → forward to `/paywall`).

### 3.4 Data flow (one fetch per request, no flicker)

```
(protected)/layout.tsx   ─ getMe() → !me ⇒ /login ; prefetch me+sub+balance → dehydrate → HydrateOnly
   └─ (app)/layout.tsx    ─ cached getMe/getSubscription/getBalance → resolveFunnelStage() → redirect if ≠ app
   └─ (funnel)/layout.tsx ─ same resolve → bounce wrong/finished stage
Client: Providers hydrate me+sub+balance → useFunnelStage() runs the SAME resolveFunnelStage
        over the Query cache → instant post-onboarding / post-checkout nav
```

**Memoization (corrected):** the parent and child gate layouts must share one round-trip, but
native `fetch` with `cache:'no-store'` (which all three fetchers use) is **not** auto-memoized,
so React `cache()` is required. Mechanic: `getSubscription.ts:1` / `getBalance.ts:1` start with
`'use server'`, which only permits async-function exports — you **cannot**
`export const x = cache(async …)` from them. Either (a) drop the superfluous `'use server'`
(they're imported and called directly server-side in `(protected)/layout.tsx:11-12,68`, not as
server actions) and add `import 'server-only'` + wrap in `cache()`; or (b) add separate
`cache()`-wrapped wrappers in a non-`'use server'` module. `getMe.ts` has no `'use server'` and
can be wrapped directly.

**Optimization (verified, optional):** `/auth/profile` already returns the credit balances
(equal to `/billing/balance`), so the gate could resolve onboarding + credits from `me` alone
and only call `/billing/subscriptions/current` for the sub branch. Left optional.

### 3.5 Deep-link survives the whole funnel

`next=` is threaded through every funnel hop (note: the onboarding page reads only `step` today
— `next` handling is net-new):

```
logged-out → /dashboard/settings
  parent auth gate       → /login?next=/dashboard/settings
  login                  → /dashboard/settings
  (app) gate: !onboarded → /onboarding?next=/dashboard/settings
  onboarding done        → /paywall?next=/dashboard/settings   (unpaid)
  paywall success        → /dashboard/settings   ✓ original target
```
When a gate redirects **into** the funnel it carries `next` = the requested app URL (sanitized
via `sanitizeNextPath`). The funnel layout preserves the incoming `?next` when bouncing between
steps. Funnel screens, on completion, navigate to `pathForStage(resolvedStage, next)`.

### 3.6 Paywall: what "reuse" actually requires (corrected)

The paywall is **not** a drop-in reuse. `/pricing` today renders **two different** components by
viewport (`pricing/page.tsx:82-117`): desktop = `PricesModal` in a `Dialog`; mobile =
`PricingMobileView`. The `/paywall` page must compose **both**. Concrete work:

- **The paywall page composes both breakpoints**, each with the dismiss/back affordance removed
  (it's a *hard* wall): desktop = `PricesModal` in a `Dialog` shell with the close **hidden**;
  mobile = the extracted mobile view (below). It is **not** "one shared component."
- **Extract `PricingMobileView`** — currently an inline local `const` in
  `(public)/pricing/page.tsx:132-267`, not exported. Lift it to `src/components/`; make its
  `onBack` prop **optional** (the funnel `/paywall` renders no back control). Both `/pricing` and
  `/paywall` then consume it.
- **No close on the hard wall.** `PricesModal` hard-depends on a Radix `<Dialog>` ancestor
  (`<DialogClose>`, `src/components/PricesModal.tsx:50`); render it in a `Dialog` shell and
  **hide the close** by reusing the existing trick `[&_button[data-radix-dialog-close]]:hidden`
  (`GlobalSubscriptionPaywall.tsx:76`). No `router.back()`.
- **Reconcile with the existing client paywall.** `GlobalSubscriptionPaywall` + `openPaywall()`
  / `isPaywallOpen` (`src/stores/subscriptionStore.ts:242-244`, triggered from
  `MobileDashboardPage.tsx:375`, `UiModalManager.tsx:264`) already gates entry client-side with
  the *same* predicate. Define scope: the **route `/paywall` is the involuntary funnel gate**;
  the **modal is a voluntary mid-app upgrade / credit top-up** (or retire the modal). At minimum,
  fix the mobile `GlobalSubscriptionPaywall` `router.push('/{locale}/pricing')`
  (`GlobalSubscriptionPaywall.tsx:46`) → it must target the authenticated `/paywall`.
- **Plans loading.** Plans come from `usePricingPlans()` (`['/billing/subscriptions/plans']`),
  a client `useQuery` **not** in the server prefetch set. The gate is flicker-free; the paywall
  *content* shows a skeleton until plans load (same as today's `/pricing`). Acceptable for MVP.
- **Checkout call:** `POST /checkout/orders` with `{ plan_id, promo_code? }` (the only
  client-callable checkout entry).

## 4. Edge cases & error handling

1. **Entitlement enforcement & lapse (corrected).** The backend enforces entitlement at the
   practice/mock **start *or* submit** endpoint, per skill: speaking & mock at *start*
   (`mock/views.py:205`, `practice/views.py:1314`); reading/listening/writing at *submit*
   (`practice/views.py:573,822,1025`). Each returns a clean **400 `Message`**. The funnel gate
   re-resolves on the **next server navigation** → bounce to `/paywall`; in-progress work isn't
   interrupted mid-screen.
   **Frontend requirement — distinguish the two 400s:**
   - The **practice** 400 (`"Practice requires active subscription or practice balance"`) means
     genuinely unentitled → route to `/paywall`.
   - The **mock** 400 (`"Mock access requires available mock balance"`) can fire for an **active
     subscriber** who merely lacks mock credits — `can_start_mock` (`payments/services.py:44-54`)
     ignores subscription and a sub never grants mock credits (`payments/views.py:517` credits
     only `practice_balance`). It is **not** an entitlement lapse: route it to the voluntary
     "get mock credits" flow (the §3.6 in-app modal), **not** the funnel paywall — otherwise a
     paying subscriber gets bounced to plans they already bought. (Subscription holders are never
     debited for practice — `payments/services.py:30`.)

2. **Checkout-return (corrected — highest-risk flow).** The frontend sets the EPay `backLink` at
   runtime to `order.backLink ?? (current URL + ?subscribePaymentStatus=true)`
   (`PromoPromptModal.tsx:104,108-114`) — it returns to the **current page** (the paywall),
   **not** `/dashboard`. Entitlement is granted **asynchronously** by the `postLink` webhook
   (`payments/views.py:1109-1114`), so right after returning `/billing/subscriptions/current` may
   still be 204. The real failure mode is **"stranded on `/paywall`,"** not a redirect loop.
   Required behavior on `/paywall`:
   - **Thread the `orderId`** (`CheckoutOrderOut.orderId`, returned by `POST /checkout/orders`)
     across the redirect — append it to the success `backLink` query **and** stash it in
     `sessionStorage` before `window.halyk.pay()` (belt-and-suspenders, since the backend may
     override with its own `order.backLink`). **New work** — see §6.
   - On return, detect `?subscribePaymentStatus=true`, read `orderId`, and **poll
     `GET /orders/{orderId}` until `status === "paid"`** — the order flips to `paid` in the
     *same* atomic transaction that grants entitlement (`payments/views.py:532-534`), so it's a
     reliable signal (unlike `payment_status`, the PaymentIntent status, which never flips for a
     100%-promo order). Bounded timeout + "activating…" state; then `refreshSubscriptionAndBalance()`
     (`subscriptionStore.ts:112`) and navigate to `next ?? /dashboard`.
   - `?subscribePaymentStatus=false` → stay on `/paywall`, show the failure.
   - **Reconcile with the global `SubscriptionPaymentStatusModal`** (`Providers.tsx:56`), which
     today grabs `subscribePaymentStatus` on any page: either suppress it on `/paywall` (add a
     pathname check — it currently reads only `useSearchParams`) or have the paywall own the param.
   - 100%-promo path returns `requiresPayment=false`, fulfilled synchronously — no poll.

3. **Backend outage** (`UpstreamServiceError`): keep today's behavior — render `Error503`;
   never redirect-loop, never lock a paying user out on a timeout. "Unknown" ≠ "deny."

4. **Logged-in user hits public `/pricing`:** allowed (it's public). Voluntary upgrades route to
   the authenticated paywall/billing; the funnel `/paywall` only *bounces* a genuinely
   `!entitled` user.

5. **Order enforcement** (§3.3): no skipping ahead, no lingering on a finished step.

6. **Mobile `/m/*`** routes live in `(app)` → gated identically. The existing UA redirects in
   `middleware.ts` (`/dashboard`→`/m/stats` mobile; `/m/*`→`/dashboard` desktop) compose with
   the gate as **two terminating hops, no loop** (traced). Untouched by this work.

## 5. Backend dependency (the only backend change)

Gate `grant_welcome_practice_credit()` (`backend/client/utils.py:85`, called from
`backend/client/views.py:261` and `:302` — the single chokepoint for both Google and email reg;
grants **+1 practice AND +1 mock** guarded by `got_free_welcome_test`) behind a setting, using
the project's existing helper (there is **no** `django-environ` `env` object):

```python
# core/settings.py   (pattern matches ANALYTICS_ENABLED at :264)
WELCOME_CREDITS_ENABLED = _env_bool("WELCOME_CREDITS_ENABLED", False)
```
Read it via `from django.conf import settings` in `grant_welcome_practice_credit` (early no-op
return when disabled). Reversible with one env change; existing credited users unaffected (the
`got_free_welcome_test` guard stays, so re-enabling won't double-grant).

**Must also update the backend test suite** (real tests + CI): `client/tests.py:52-53` and
`:473-474` assert the grant. Gate them with `@override_settings(WELCOME_CREDITS_ENABLED=True)`
(or add a disabled-path assertion). Verified that mock/practice test suites overwrite balances
with absolute assignment, so they're unaffected — `client/tests.py` is the complete blast radius.

## 6. File change list

**New (frontend):**
- `src/lib/funnel/resolveStage.ts` — `FunnelStage`, `isEntitled`, `resolveFunnelStage`
- `src/lib/funnel/paths.ts` — `pathForStage`, `screenFromPath` (locale-aware), `withNext`
- `src/hooks/useFunnelStage.ts` — client selector over the Query cache
- `src/api/GET_orders_id.ts` — **new** wrapper for `GET /orders/{id}` (the poll signal; none exists today)
- `src/components/PricingPlansView.tsx` (or similar) — **extracted** from inline `PricingMobileView`, `onBack` optional
- `src/app/[locale]/(protected)/(app)/layout.tsx` — app gate (`force-dynamic`)
- `src/app/[locale]/(protected)/(funnel)/layout.tsx` — funnel gate (`force-dynamic`)
- `src/app/[locale]/(protected)/(funnel)/paywall/page.tsx` — paywall page: composes desktop
  `PricesModal`-in-`Dialog` (close hidden) + extracted mobile view (no back); detects
  `?subscribePaymentStatus`, reads threaded `orderId`, polls `GET /orders/{id}` until `paid`

**Moved (folders only; URLs unchanged):** `dashboard, practice, mock, notes, m` → `(app)/`;
`onboarding` → `(funnel)/`

**Modified (frontend):**
- `(protected)/layout.tsx` — `cache()` the fetchers (see §3.4 re `'use server'`); keep auth gate
  + prefetch/dehydrate/HydrateOnly as-is
- `(protected)/(funnel)/onboarding/page.tsx` — post-submit nav via `useFunnelStage`
  (completed-but-unpaid → `/paywall`, carrying `next`); read incoming `next`; **keep sending the
  `Idempotency-Key` header** to `/onboarding/submit`
- `src/components/PromoPromptModal.tsx` — thread `orderId` across the EPay redirect (append to
  the success `backLink` + stash in `sessionStorage`)
- `src/components/PricesModal.tsx` — optional close-affordance prop / hidden-close variant for the wall
- `GlobalSubscriptionPaywall.tsx` — mobile push `/pricing` → `/paywall`; reconcile modal vs route
- `(public)/pricing/page.tsx` — consume the extracted `PricingPlansView`
- Treatment of `SubscriptionPaymentStatusModal` on `/paywall` (suppress or paywall-owned)

**Backend:** `core/settings.py` + `client/utils.py` (flag) **and** `client/tests.py` (test updates)

**Verified backend contracts (no change needed):**

| Gate need | Endpoint | Key fields |
|---|---|---|
| auth presence | `GET /auth/profile` (JWT `ClientAuth`) | `onboarding_completed` (= `onboarding_completed_at is not None`), `balance`, `mock_balance`, `practice_balance`, `got_free_welcome_test` |
| onboarding | `GET /onboarding/schema` · `POST /onboarding/submit` (needs `Idempotency-Key`) | sets `onboarding_completed_at`; idempotent; **409** on `schema_version` mismatch; **400** on missing key |
| subscription | `GET /billing/subscriptions/current` | `status` (`active`/`pending_cancel`/`canceled`/`expired`), `current_period_start/end`, `cancel_at_period_end`, `plan`; **204** when none |
| credits | `GET /billing/balance` | `tenge_balance`, `mock_balance`, `practice_balance` |
| plans | `GET /billing/subscriptions/plans` | plans + `features`, `trial_days` |
| purchase + readiness | `POST /checkout/orders` → `orderId`, `requiresPayment` · `GET /orders/{orderId}` (poll `status === "paid"`; **not** `payment_status`) · `/billing/subscriptions/{cancel,resume}` | checkout + the poll signal + cancel/resume |

## 7. Testing

No frontend test framework exists today (per `frontend/CLAUDE.md`) — adding **vitest** is
net-new tooling (config + script + CI), scoped to the pure functions only. The gate logic is
where loop/skip bugs hide, so lock down this truth + redirect table:

| `me` | `onboarding_completed` | `entitled` | stage → destination |
|---|---|---|---|
| ✗ | – | – | `unauthenticated` → `/login?next=` |
| ✓ | ✗ | – | `onboarding` → `/onboarding` |
| ✓ | ✓ | ✗ | `paywall` → `/paywall` |
| ✓ | ✓ | ✓ | `app` → `next` ?? `/dashboard` |

Plus per-zone redirect cases, `screenFromPath` locale/query parsing (the off-by-one that would
silently create a loop), and the `next=` trace. Manual-QA matrix:

- New user: register → verify → onboarding → **paywall (pay-only, no free option)** → pay → app.
- Returning entitled user: login → straight to app; `/onboarding` and `/paywall` bounce out.
- Lapsed user: practice 400 / sub expired → next navigation → `/paywall`. **Subscriber out of
  mock credits: mock 400 → in-app top-up, NOT the funnel paywall** (regression guard).
- Checkout return: pay → `/paywall?subscribePaymentStatus=true&orderId=…` → poll
  `GET /orders/{id}` → "activating…" → app (no strand, no bounce). And the `=false` failure path.

## 8. Non-goals / out of scope

- Redesigning any screen's UI.
- Any free path / trial in MVP (decision #5).
- Changing the credit/subscription business model beyond the welcome-credit toggle.
- Edge middleware for auth/entitlement; reworking the mobile UA-redirect logic.

## 9. Future / open

- **Re-enable a free path later:** flip `WELCOME_CREDITS_ENABLED=True`, *or* introduce a
  zero-price plan / 100%-promo (both flow through the synchronous `amount == 0` checkout branch),
  *or* build a real no-payment trial-start endpoint (would also make the dormant `trialing`
  predicate branch meaningful).
- Subscriptions don't grant mock credits today (`mocks_per_period` isn't credited) — revisit if
  the model should change.
- Optional fetch optimization (§3.4) and plans prefetch (§3.6).

## 10. Review log

Two code-review passes, every claim verified against `frontend/` + `backend/`.

**Round 1 (design → revised):** C1 free path didn't exist → **pay-only** (#5); C2 checkout-return
rewritten to the real EPay mechanism; C3 paywall "reuse" corrected; C4 `cache()`/`'use server'`
mechanic; + `screenFromPath` locale parsing, explicit `force-dynamic`, `_env_bool`, §4.1
enforcement-point accuracy, backend test updates.

**Round 2 (revised → this version):** backend = **GO** (the `GET /orders/{id}` poll signal fully
verified — `status=="paid"` flips in the same atomic txn as the grant). Frontend Critical:
the poll had **no API wrapper and no `orderId` threading** → added `GET_orders_id.ts` + orderId
threading across the redirect (§3.6/§4.2/§6). Important: paywall composes **both** desktop
`PricesModal` + extracted mobile view, both close/back removed; `onBack` made optional. Plus the
**mock-vs-practice 400** correctness fix (§4.1 — don't bounce a paying subscriber who only lacks
mock credits), `status==="paid"` poll signal (not `payment_status`), `EPAY_BACK_LINK` wording,
and tightened line cites.

**Confirmed solid (both rounds):** route-group zones, `resolveFunnelStage`, stage→path map,
`next`-threading, loop-freedom, all contract paths/fields, `onboarding_completed` durability,
same-transaction order-paid+grant guarantee. The "interest-step" is dormant/legacy — correctly
**not** a gate.

# Funnel UX & correctness fixes (#1–#7)

- **Date:** 2026-06-04
- **Status:** Draft for review
- **Scope:** The seven bugs found in the funnel UX audit of the just-shipped gate (`login→onboarding→paywall→app`). Frontend-only **except #2's discriminator depends on backend message strings** (no backend code change). The plan-count flash (originally also listed) was already fixed in `b120b00`.
- **Related:** `2026-06-02-funnel-gating-architecture-design.md` (the funnel design these bugs were found in).

## Summary of fixes

| # | Bug | Severity | Effort | Depends on |
|---|---|---|---|---|
| 1 | Mobile "Upgrade" CTA round-trips and does nothing | 🔴 functional | S–M | — |
| 2 | Entitlement-lapse 400 is never routed (mock-vs-practice) | 🔴 functional | M | #1 |
| 3 | Gates 500 instead of `Error503` on backend outage | 🟠 robustness | S | — |
| 4 | Just-paid user can get stuck on `/paywall` (webhook lag) | 🟠 functional | S–M | — |
| 5 | Public `/pricing` blank/swap flashes | 🟡 UX | M | — |
| 6 | Onboarding `next` uses a weaker check than `sanitizeNextPath` | 🟡 consistency | XS | — |
| 7 | Onboarding schema "preparing"/heading settle | 🟡 UX | L | — |

**Suggested order:** #6 (trivial) → #1 → #2 (needs #1) → #3 → #4 → #5 → #7 (largest, lowest severity).

---

## Fix #1 — give mobile voluntary upgrade an in-place, dismissible surface

**Problem:** the mobile "Upgrade" CTA does nothing. `openPaywall()` (voluntary trigger) fires from `handleUpgradeClick` (`src/app/[locale]/(protected)/(app)/dashboard/_components/MobileDashboardPage.tsx:374`) and the upsell modal (`src/components/modals/UiModalManager.tsx:263`). On mobile, `GlobalSubscriptionPaywall` reacts with `router.push('/${locale}/paywall')` (`GlobalSubscriptionPaywall.tsx:42-48`). But `/paywall` is the **involuntary** funnel gate — the `(funnel)` layout redirects any *entitled* user back to `/dashboard`. Anyone on the dashboard is entitled, so the CTA round-trips `/dashboard → /paywall → /dashboard`. Desktop works (in-place modal).

**Root cause:** the gated funnel `/paywall` was made to serve both the involuntary gate *and* (Task 11's mobile redirect) the voluntary upgrade. Incompatible: the gate ejects entitled users, but voluntary upgrade is *for* entitled users (e.g. practice credits but 0 mock credits topping up). Voluntary upgrade needs a **non-gated** surface.

**Design:** make `GlobalSubscriptionPaywall` render an in-place overlay on **both** breakpoints (it already does on desktop).
- Remove the mobile `router.push('/${locale}/paywall')` effect. **Caution (verify):** only delete the imports/effects that exist *solely* for that push — there is a separate `Router.events`/`NProgress` route-progress effect in this file; check whether it's still used (it may be `next/router` dead code under App Router) before removing `useRouter`/`useLocale`/`NProgress`/`next/router`.
- When `isPaywallOpen && isMobile`: render a **dismissible full-screen overlay** (`fixed inset-0 overflow-y-auto`, appropriate z-index) containing the extracted `PricingPlansView` with `onBack = () => setPaywallOpen(false)` (voluntary ⇒ must be dismissible).
- When `isPaywallOpen && !isMobile`: keep the existing `<Dialog>` + `<PricesModal>`.
- Both feed the existing `PromoPromptModal`. Checkout-return (Task 12 sessionStorage `orderId` + poll) already works wherever `pay()` is invoked.
- `GlobalSubscriptionPaywall` gains the paywall page's data wiring: `usePricingPlans()` (`activePlans`/`status`) + `useCustomTranslations('pricesModal')` (`t.raw('demo.includes')`/`'premium.includes'`).

**Files:** Modify `src/components/GlobalSubscriptionPaywall.tsx`.

**Edge cases:** funnel `/paywall` + its gate unchanged; mobile overlay dismissible; `PricingPlansView` is a `motion.main` with `min-h-dvh` + a `fixed` footer — verify it renders cleanly nested in the overlay (z-index/scroll).

**Optional follow-up (out of scope):** extract a shared `PlanSelection` component (data wiring + desktop `PricesModal`/mobile `PricingPlansView` + `PromoPromptModal`), parameterized by `dismissible`, consumed by both the funnel `/paywall` page and `GlobalSubscriptionPaywall`. DRY but larger.

---

## Fix #2 — route the entitlement-lapse 400 (distinguish mock vs practice)

**Problem:** funnel spec §4.1 required the frontend to handle the backend's entitlement 400 from practice/mock start-or-submit, but **no task implemented it** (verified: no such handling in the practice/mock client code). A user whose credits lapse mid-session sees a raw backend error on their next action and is only re-gated on the next *navigation*.

**Root cause:** entitlement is enforced server-side at the practice/mock start/submit endpoints (returns 400), but the client never inspects that 400 to route the user.

**Design:** a shared helper that discriminates the two backend messages (exact strings, verified):
- **Practice** 400 → `"Practice requires active subscription or practice balance"` ⇒ the user is genuinely **unentitled** ⇒ `router.push('/${locale}/paywall')` (they're now `!entitled`, so the funnel gate renders the wall — no bounce).
- **Mock** 400 → `"Mock access requires available mock balance"` ⇒ the user may still be **entitled** (active sub / practice credits) but lacks *mock* credits ⇒ `openPaywall()` (the **voluntary** in-app upgrade — fixed by #1), **not** the funnel `/paywall` (which would bounce them).
- Any other 400/error ⇒ existing generic handling (toast/rethrow), unchanged.

```ts
// src/lib/funnel/handleEntitlementError.ts (shape)
const PRACTICE_LAPSE = 'Practice requires active subscription or practice balance';
const MOCK_LAPSE = 'Mock access requires available mock balance';
export function handleEntitlementError(error: unknown, ctx: { router; locale: string; openPaywall: () => void }): boolean {
  const msg = axios.isAxiosError(error) && error.response?.status === 400 ? error.response?.data?.message : null;
  if (msg === PRACTICE_LAPSE) { ctx.router.push(`/${ctx.locale}/paywall`); return true; }
  if (msg === MOCK_LAPSE) { ctx.openPaywall(); return true; }
  return false; // not an entitlement lapse — caller handles normally
}
```

**Files:** new `src/lib/funnel/handleEntitlementError.ts`; wire it into the `onError` of every practice/mock **start** and **submit** mutation (reading/listening/writing finish, speaking begin, mock start). **Implementation must enumerate the exact call sites** (grep the practice/mock client mutations) — they weren't touched by the funnel work.

**Edge cases / caveats:**
- **Brittle by message string.** The backend returns fixed English strings; matching on them is fragile (any backend wording change breaks it). Acceptable today (strings are stable); a machine-readable error code would be the robust long-term fix (backend change, out of scope) — note it.
- Depends on **#1** (the mock path calls `openPaywall()`, which must work on mobile).
- Subscribers are **not** debited for practice but **are** blocked from mock without mock credits — that asymmetry is exactly why the two messages must route differently (don't bounce a paying subscriber to the funnel wall).

---

## Fix #3 — gates degrade to `Error503` on backend outage (mirror the parent)

**Problem:** the `(app)`/`(funnel)` gate layouts call `getSubscriptionCached()`/`getBalanceCached()` with **no try/catch**, and there is **no `error.tsx`** anywhere in the app tree (verified). If a fetch rejects at the gate (backend 5xx/timeout, or a render-ordering edge), the result is an unhandled **500** instead of the parent's graceful `Error503`.

**Root cause:** entitlement fetches are fallible (`UpstreamServiceError`), but only the parent `(protected)/layout.tsx` treats them as such.

**Design:** make the two gates handle `UpstreamServiceError` exactly like the parent — catch → render `Error503`; re-throw anything else (so genuine code bugs are NOT mislabeled "service unavailable").

```tsx
import { UpstreamServiceError } from '@/lib/api/errors';
import Error503 from '@/app/[locale]/(public)/Error503/page';
import type { User } from '@/types/types';
import type { IClientSubscription, IBillingBalance } from '@/types/Billing';
// ...
let me: User | null;
let subscription: IClientSubscription | null;
let balance: IBillingBalance | null;
try {
  [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
} catch (error) {
  if (error instanceof UpstreamServiceError) return <Error503 />;
  throw error; // genuine bugs surface as real errors, not a misleading 503
}
// ...resolveFunnelStage({ me, subscription, balance }) + redirect as before (redirect stays OUTSIDE the try)
```
(Catch always returns or throws ⇒ TS treats the three as definitely-assigned afterward. `redirect()` throws an internal Next signal, so it must stay OUTSIDE the try — it already runs after the fetch block.)

**Why not a catch-all `error.tsx`:** one that always renders `Error503` would catch real page bugs and mislabel them "service unavailable," masking defects. Mirroring the parent's precise `UpstreamServiceError`-only handling is correct.

**Files:** Modify `(app)/layout.tsx` and `(funnel)/layout.tsx`.

**Edge cases:** `redirect()` outside try/catch; non-upstream errors re-throw; cached fetchers are cache hits on success (no extra fetch).

---

## Fix #4 — don't bounce a just-paid user off `/paywall` during the webhook window

**Problem:** after a successful EPay payment the browser returns to the backend's static `EPAY_BACK_LINK` = app-root `?subscribePaymentStatus=true` → `next.config` redirects to `/{locale}/dashboard?subscribePaymentStatus=true`. The `(app)` gate runs *before* the client mounts; if the async `postLink` webhook hasn't granted entitlement yet, the gate sees `!entitled` and bounces to `/paywall?next=/{locale}/dashboard?subscribePaymentStatus=true` — burying the param in `next=`. The global `SubscriptionPaymentStatusModal` reads the **top-level** `?subscribePaymentStatus`, so on `/paywall` it never fires → no poll → the user is **stuck on the wall** until they manually navigate.

**Root cause:** the gate bounces during the payment-confirmation window, before the client-side poll/refresh can run, and the bounce relocates the signal param out of top-level scope.

**Design:** **(app) gate payment-return grace.** If the incoming URL carries `subscribePaymentStatus=true`, skip the `!entitled` bounce and let the page render; the global `SubscriptionPaymentStatusModal` then mounts on the landing page, reads the top-level param, polls `GET /orders/{id}` until `paid`, calls `refreshSubscriptionAndBalance()`, and strips the param. Once entitled, normal gating resumes on the next navigation.

```tsx
// (app)/layout.tsx — alongside the existing originalUrl handling
const paymentReturning = new URLSearchParams(originalUrl?.split('?')[1] ?? '').get('subscribePaymentStatus') === 'true';
if (stage !== 'app' && !paymentReturning) {
  redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
}
```

**Files:** Modify `(app)/layout.tsx` (only — the landing is `/dashboard`).

**Edge cases / tradeoff:**
- **Cosmetic bypass:** appending `?subscribePaymentStatus=true` lets an unentitled user render the landing chrome once. Bounded: the backend enforces entitlement per action (can't start practice/mock without credits/sub), and the modal strips the param so any refresh/next-nav re-gates. Acceptable.
- **Stricter alternative (noted, not chosen):** a short-lived signed `payment_pending` cookie set just before `window.halyk.pay()` and read by the gate — more secure, more work. The URL-param grace is the simpler frontend-only fix.
- **Supersedes** the earlier spawned "checkout-return webhook-lag" follow-up task.

---

## Fix #5 — public `/pricing` blank/swap flashes

**Problem:** the public `(public)/pricing/page.tsx` still uses the pre-fix pattern (Radix `Dialog` + `useMediaQuery` + `withHydrationGuard` + client-only `usePricingPlans`), so it has the same blank-frame and desktop→mobile swap flashes the funnel paywall had. (The desktop *count*-jump is already mitigated by the `PricesModal` skeleton shipped in `b120b00`, which `/pricing` also uses.)

**Root cause:** `/pricing` wasn't migrated when the funnel `/paywall` was rebuilt flash-free.

**Design:** mirror the funnel paywall treatment onto `/pricing`, keeping `/pricing` **dismissible** (it's a navigable marketing route, not a hard wall):
- Add `(public)/pricing/layout.tsx` that best-effort prefetches plans (`getPlans`) and hydrates — eliminates the client-fetch flash **for logged-in visitors**.
- Rewrite the page to drop `withHydrationGuard` + `useMediaQuery` in favor of a CSS `tablet:` split (desktop `PricesModal`, mobile `PricingPlansView` with `onBack = () => router.back()`).
- Keep a dismiss affordance on desktop (a close/back control or keep a `Dialog` shell for `/pricing` only — decide during implementation; unlike the hard wall, `/pricing` should be closable).

**Caveat (important):** the plans endpoint is under `/billing` (`ClientAuth`). For **logged-out** visitors `getPlans` returns `null` (no token) and the client fetch is also unauthenticated — so the prefetch only helps **logged-in** visitors; logged-out behavior is unchanged (and may already show no plans). Lower priority because, post-#1, in-app voluntary upgrades use the modal (not `/pricing`), so `/pricing`'s main remaining audience is marketing/logged-out where prefetch can't help.

**Files:** new `(public)/pricing/layout.tsx`; modify `(public)/pricing/page.tsx`.

---

## Fix #6 — onboarding `next` uses the hardened sanitizer

**Problem:** onboarding finish navigates with `nextParam && nextParam.startsWith('/${locale}')` (`(funnel)/onboarding/page.tsx`, ~the `handleFinish` destination). The gates use the hardened `sanitizeNextPath` (rejects `//`, the login path, off-locale). Not an actual open redirect (the browser normalizes; `//evil` fails `startsWith('/en')`), just inconsistent and weaker.

**Design:** reuse the shared sanitizer:
```ts
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';
// ...
const destination = sanitizeNextPath(nextParam, locale) ?? `/${locale}/dashboard`;
router.push(destination);
```

**Files:** Modify `(funnel)/onboarding/page.tsx`. Trivial, low risk.

---

## Fix #7 — onboarding schema "preparing"/heading settle (lowest priority)

**Problem:** the onboarding page fetches its schema client-side into local `useState`, so on entry it briefly shows a "preparing…" placeholder and the heading/progress can settle (i18n fallback → backend title) if the backend schema diverges from the i18n defaults. Unlike the paywall's old wrong-content flash, this is a *proper* loading state — hence lowest priority.

**Root cause:** schema isn't prefetched; `getOnboardingSchema` is `'use client'` (axios) and the page holds schema in local state, not React Query.

**Design (proper, higher-effort):** make schema available on first paint, mirroring the plans prefetch:
1. Add a server-side schema fetch (`getOnboardingSchema` server variant, modeled on `getPlans.ts` — native fetch + cookie, returns the schema or `null`).
2. Add `(funnel)/onboarding/layout.tsx` that prefetches `['onboarding-schema']` and hydrates.
3. Refactor the page to read the schema via `useQuery(['onboarding-schema'], …)` instead of local `useState` + manual fetch — preserving the existing retry and `schema_version` conflict-refetch behavior.

**Risk:** step 3 reworks load-bearing onboarding state (the `useOnboardingMachine` wiring, `schemaRequestedRef`, version-conflict path). **Requires runtime QA** (a working backend) — do it last and verify the full onboarding submit flow.

**Lighter alternative (low-risk, partial):** keep the client load but render a stable heading/progress **skeleton** during `schemaLoading` instead of the i18n→backend text swap. Eliminates the visible settle without the refactor.

**Files:** (proper) new server schema fetch + `(funnel)/onboarding/layout.tsx` + refactor `(funnel)/onboarding/page.tsx`. (lighter) modify `(funnel)/onboarding/page.tsx` + `OnboardingLayout` only.

**Recommendation:** ship the **lighter alternative** unless/until there's appetite for the refactor + runtime QA.

---

## Out of scope (ops, not a code fix)
- **Deploy coordination:** `WELCOME_CREDITS_ENABLED=False` must be set per-env and the FE + BE shipped together, or the hard wall silently won't engage. (Tracked in project notes.)

## Testing / verification
- `npx tsc --noEmit` + `npm run build` green after each fix.
- **#1** (staging, entitled mobile user): "Upgrade" opens an **in-place, dismissible** overlay (URL unchanged); plan select → promo/checkout; desktop still opens its Dialog; funnel `/paywall` (unentitled) still the non-dismissible wall.
- **#2** (staging): exhaust practice credits → next practice start/submit routes to `/paywall`; an active subscriber with 0 mock credits → mock start opens the **voluntary** upgrade modal, **not** the funnel wall.
- **#3:** backend 5xx → `(app)`/`(funnel)` routes render `Error503`, not a 500; a deliberate page render error still surfaces as a real error.
- **#4** (staging): complete a payment → land on `/dashboard?subscribePaymentStatus=true` → "Activating…" → admitted (no `/paywall` strand); failure path shows the error.
- **#5:** logged-in `/pricing` renders plans on first paint, no blank/swap; logged-out unchanged.
- **#6:** unit-coverable — `sanitizeNextPath` already tested; verify onboarding finish honors a valid `next` and ignores a malicious one.
- **#7:** onboarding entry shows no heading/progress settle (proper fix) or a stable skeleton (lighter); full submit flow still works.
- Pure gate logic is unchanged, so existing vitest stays green; the rest is integration/RSC verified by build + manual QA.

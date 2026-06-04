# Funnel fixes — mobile voluntary upgrade (#1) + gate outage handling (#3)

- **Date:** 2026-06-04
- **Status:** Draft for review
- **Scope:** Two targeted bug fixes in the just-shipped funnel-gating feature (frontend only). No backend changes.
- **Related:** builds on `2026-06-02-funnel-gating-architecture-design.md` (the funnel design these bugs were found in).

## Background

Two real bugs remain after the funnel-gating work:

- **#1 — the mobile "Upgrade" CTA is broken.** `openPaywall()` (the *voluntary* in-app upgrade trigger) is fired from `handleUpgradeClick` (`src/app/[locale]/(protected)/(app)/dashboard/_components/MobileDashboardPage.tsx:374`) and the upsell modal (`src/components/modals/UiModalManager.tsx:263`). On mobile, `GlobalSubscriptionPaywall` reacts by `router.push('/${locale}/paywall')` (`src/components/GlobalSubscriptionPaywall.tsx:42-48`). But `/paywall` is the **involuntary funnel gate** — the `(funnel)` layout redirects any *entitled* user back to `/dashboard`. Anyone on the dashboard already passed the gate (is entitled), so the CTA round-trips `/dashboard → /paywall → /dashboard` and does nothing. Desktop is fine (it opens an in-place modal).

- **#3 — gates have no outage handling and there is no error boundary.** The `(app)`/`(funnel)` gate layouts call `getSubscriptionCached()`/`getBalanceCached()` with **no try/catch**, and there is **no `error.tsx`** anywhere in the app tree (verified). The parent `(protected)/layout.tsx` catches `UpstreamServiceError` → renders `Error503`, but the child gates rely on the parent gating first, with no safety net. If a fetch rejects at the gate (backend 5xx/timeout, or a render-ordering edge), the result is an unhandled **500 instead of the graceful `Error503`**.

## Root causes

- **#1:** The gated funnel `/paywall` was made to serve *both* the involuntary gate and (via Task 11's mobile redirect) the voluntary upgrade. Those are incompatible: the gate ejects entitled users, but the voluntary upgrade is *for* entitled users (e.g. someone with practice credits but 0 mock credits topping up). Voluntary upgrade must use a **non-gated** surface.
- **#3:** Entitlement-data fetching is fallible (it can throw `UpstreamServiceError`), but only the parent layout treats it as such. The gates and the (missing) error boundary don't.

---

## Fix #1 — give mobile voluntary upgrade an in-place, dismissible surface

**Principle:** the involuntary gate (`/paywall`, non-dismissible, only for `!entitled`) and the voluntary upgrade (an overlay any entitled user can open *and dismiss*) are different surfaces. Voluntary upgrade must never navigate to the gated route.

**Design (recommended): make `GlobalSubscriptionPaywall` render an in-place overlay on both breakpoints.** Today it already renders a dismissible Radix `<Dialog>` + `PricesModal` on **desktop**; extend the same in-place pattern to **mobile** instead of pushing a route.

- Remove the mobile `router.push('/${locale}/paywall')` effect (`GlobalSubscriptionPaywall.tsx:42-48`) and the `next/router`/`NProgress`/`useRouter`/`useLocale` machinery that only existed for it.
- When `isPaywallOpen && isMobile`: render a **dismissible full-screen overlay** (`fixed inset-0 z-[…] overflow-y-auto`) containing the extracted `PricingPlansView`, wired exactly like the funnel paywall page but with `onBack` set to `setPaywallOpen(false)` (so it shows a back/close control — it is *voluntary* and must be dismissible, unlike the hard wall).
- When `isPaywallOpen && !isMobile`: keep the existing `<Dialog>` + `<PricesModal>` (already dismissible).
- Both branches feed the existing `PromoPromptModal` (unchanged) for plan selection → checkout. The checkout-return handling (Task 12: sessionStorage `orderId` + poll) already works regardless of where `pay()` is invoked, so voluntary purchases are covered too.

`GlobalSubscriptionPaywall` will need the same data wiring the paywall page has (`usePricingPlans()` for `activePlans`/`status`, `useCustomTranslations('pricesModal')` for `demoIncludes`/`premiumIncludes` via `t.raw`), to pass `PricingPlansView`'s props on mobile.

**Why not reuse `/paywall` for voluntary upgrade:** the `(funnel)` gate redirects entitled users out — unavoidable for the involuntary wall — so the voluntary surface cannot live there.

**Optional follow-up (not required):** extract a shared `PlanSelection` component (data wiring + desktop `PricesModal` / mobile `PricingPlansView` + `PromoPromptModal`) and have both the funnel `/paywall` page and `GlobalSubscriptionPaywall` consume it, parameterized by `dismissible`. DRY, but a larger change — out of scope for this fix.

**Files:**
- Modify: `src/components/GlobalSubscriptionPaywall.tsx` — remove the mobile route-push + its router imports; add the data wiring; render the mobile dismissible overlay (`PricingPlansView` with `onBack = close`); keep the desktop Dialog branch.

**Edge cases:**
- The funnel `/paywall` route and its gate are **unchanged** (still the non-dismissible involuntary wall).
- The mobile overlay must be dismissible (`onBack`/close → `setPaywallOpen(false)`) — it's voluntary.
- No interaction with the `(funnel)` gate (no navigation occurs).

---

## Fix #3 — gates degrade to `Error503` on backend outage (mirror the parent)

**Design:** make the two gate layouts handle `UpstreamServiceError` exactly like the parent — catch it and render `Error503`; re-throw anything else (so genuine code bugs are NOT masked as "service unavailable").

In both `src/app/[locale]/(protected)/(app)/layout.tsx` and `(funnel)/layout.tsx`, wrap the `Promise.all([...])` fetch in try/catch:

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
(Catch always returns or throws, so TS treats `me`/`subscription`/`balance` as definitely-assigned afterward.)

(`redirect()` throws an internal Next signal — it must remain OUTSIDE this try/catch, which it already is, since it runs after the fetch block.)

**Why not a catch-all `error.tsx`:** an `(protected)/error.tsx` that always renders `Error503` would also catch real rendering bugs in pages and mislabel them as "service unavailable," masking defects. Mirroring the parent's precise `UpstreamServiceError`-only handling is correct and consistent. (A generic `error.tsx` could still be added later as a last-resort for *unexpected* throws, rendering a generic error — not `Error503` — but that's optional and out of scope here.)

**Files:**
- Modify: `src/app/[locale]/(protected)/(app)/layout.tsx` — try/catch around the fetch → `Error503` on `UpstreamServiceError`.
- Modify: `src/app/[locale]/(protected)/(funnel)/layout.tsx` — same.

**Edge cases:**
- `redirect()` stays outside the try/catch (its thrown signal must propagate).
- Non-upstream errors re-throw (surface as real errors, not `Error503`).
- `getMeCached` etc. are the same cached refs the parent uses; on success this is a cache hit (no extra fetch).

---

## Out of scope (other known bugs, tracked separately)
- **#2** entitlement-lapse 400 → `/paywall` routing (mock-vs-practice distinction) — larger; touches practice/mock error handling.
- **#4** EPay checkout-return webhook-lag bounce — already a spawned follow-up.
- **#5** public `/pricing` plan-flash; **#6** onboarding `next` validation; **#7** onboarding schema prefetch; deploy coordination of `WELCOME_CREDITS_ENABLED`.

## Testing / verification
- `npx tsc --noEmit` + `npm run build` green.
- **#1 manual QA (staging, entitled user, mobile width):** tap "Upgrade" on the dashboard → the plan-selection overlay opens **in place** (no navigation, URL unchanged), is **dismissible**, and selecting a plan opens the promo/checkout modal. Confirm desktop still opens its Dialog. Confirm the funnel `/paywall` (not-entitled user) still renders the non-dismissible wall.
- **#3:** with the backend returning 5xx (or unreachable), hitting an `(app)` or `(funnel)` route renders `Error503`, not a generic 500. A deliberate render error in a page still surfaces as a real error (not masked).
- No unit tests required (the pure gate logic is unchanged); these are integration/RSC behaviors verified by build + manual QA.

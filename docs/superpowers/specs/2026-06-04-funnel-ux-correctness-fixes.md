# Funnel UX & correctness fixes (#1–#7)

- **Date:** 2026-06-04
- **Status:** Implementation-ready — 3 spec-review rounds; final verdict "ship it" (only the `/pricing` layout-already-exists note + `promoMessage`/mock-catch wiring details remained, now folded in).
- **Scope:** The seven bugs from the funnel UX audit of the shipped gate (`login→onboarding→paywall→app`). Frontend-only; #2's discriminator matches backend message strings (no backend code change). The plan-count flash was already fixed in `b120b00`; the post-pay `/paywall` strand was already self-healed in `0a73b50`.
- **Related:** `2026-06-02-funnel-gating-architecture-design.md`.

## Summary of fixes

| # | Bug | Severity | Effort | Depends on |
|---|---|---|---|---|
| 1 | Mobile "Upgrade" CTA round-trips and does nothing | 🔴 functional | S–M | — |
| 2 | Entitlement-lapse 400 not routed on residual paths | 🔴 functional | M | #1 |
| 3 | Gates 500 instead of `Error503` on backend outage | 🟠 robustness | S | — |
| 4 | Smooth the post-pay `/paywall` bounce (already self-healed) | 🟡 polish | S | — |
| 5 | Public `/pricing` blank/swap flashes | 🟡 UX | M | — |
| 6 | Onboarding `next` uses a weaker check than `sanitizeNextPath` | 🟡 consistency | XS | — |
| 7 | Onboarding schema "preparing"/heading settle | 🟡 UX | L | — |

**Suggested order:** #6 (trivial) → #1 → #2 (needs #1) → #3 → #4 → #5 → #7 (largest, lowest severity).

---

## Fix #1 — give mobile voluntary upgrade an in-place, dismissible surface

**Problem:** the mobile "Upgrade" CTA does nothing. `openPaywall()` fires from `handleUpgradeClick` (`MobileDashboardPage.tsx:374`) and the upsell modal (`UiModalManager.tsx:263`). On mobile, `GlobalSubscriptionPaywall` reacts with `router.push('/${locale}/paywall')` (`GlobalSubscriptionPaywall.tsx:42-48`). But `/paywall` is the **involuntary** funnel gate — the `(funnel)` layout redirects any *entitled* user back to `/dashboard`. Anyone on the dashboard is entitled, so the CTA round-trips `/dashboard → /paywall → /dashboard`. Desktop works (in-place modal).

**Root cause:** the gated funnel `/paywall` was made to serve both the involuntary gate *and* (Task 11's mobile redirect) the voluntary upgrade. Incompatible: the gate ejects entitled users, but voluntary upgrade is *for* entitled users. Voluntary upgrade needs a **non-gated** surface.

**Design:** make `GlobalSubscriptionPaywall` render an in-place surface on **both** breakpoints (it already does on desktop).
- **Remove** the mobile `router.push('/${locale}/paywall')` effect. **Confirmed dead imports to delete with it:** `useRouter`, `useLocale`, `next/router`'s `Router`, and `NProgress` — `Router.events` never fires under App Router (dead code), and `NProgress` is used only in that dead effect + the removed push. (The `nprogress` *package* stays; ~20 other files use it.)
- When `isPaywallOpen && isMobile`: render `PricingPlansView` **exactly as `/paywall/page.tsx` does** — its `motion.main`/`min-h-dvh` IS the full-screen surface and its `transform` already contains the `fixed` footer, so **do not** wrap it in a redundant `fixed inset-0 overflow-y-auto` (double-scroll). Pass `onBack = () => setPaywallOpen(false)` (voluntary ⇒ dismissible). Add a high z-index only if app chrome bleeds through.
- When `isPaywallOpen && !isMobile`: keep the existing `<Dialog>` + `<PricesModal>`.
- **Ungate `PromoPromptModal`:** it is currently rendered **only** in the `!isMobile` branch (`GlobalSubscriptionPaywall.tsx:82-94`), so on mobile selecting a plan would do nothing. Render it **unconditionally** — it is internally responsive (`BottomSheet` on mobile, `Dialog` on desktop). Checkout-return (Task 12) works wherever `pay()` is invoked.
- `GlobalSubscriptionPaywall` gains the paywall page's data wiring: `usePricingPlans()` (`activePlans`/`status`) + `useCustomTranslations('pricesModal')` (`t.raw('demo.includes')`/`'premium.includes'`). It currently tracks only `promoError` — also add `promoMessage` state (or pass `null`), which `PricingPlansView`/`PricesModal` expect.

**Files:** Modify `src/components/GlobalSubscriptionPaywall.tsx`.

**Edge cases:** funnel `/paywall` + gate unchanged; the mobile surface is dismissible; `GlobalSubscriptionPaywall` is globally mounted (`Providers.tsx:56`), so the overlay can fire anywhere `openPaywall()` is called (today: dashboard + upsell).

**Optional follow-up (out of scope):** extract a shared `PlanSelection` component consumed by both the `/paywall` page and `GlobalSubscriptionPaywall`, parameterized by `dismissible`. DRY but larger.

---

## Fix #2 — route the entitlement-lapse 400 (the residual paths)

**Problem (scope corrected):** the backend returns a 400 from practice/mock start-or-submit when entitlement is missing. The **common** no-credits case is **already** pre-empted at entry by `useSubscriptionGate('practice'|'mock')` (`hooks/useSubscriptionGate.ts:28-38`, called from the rules/start pages), which opens the voluntary modal *before* the request. So this fix targets the **residual**: the lapse/race window (credits run out between the gate check and the POST, or a stale client cache) and the **practice-finish / speaking-begin** paths that don't re-run the gate.

**Two error-handling shapes — must handle BOTH (there are no `useMutation`s; all inline `await`):**
- **Resolved, no throw:** reading & listening finish call `axiosInstance.post(..., { validateStatus: () => true })` (`ReadingTestClient.tsx:195`, `reading/test/[id]/page.tsx:146`, `ListeningTestClient.tsx:147`) — axios **resolves** the 400; an `isAxiosError`/`onError` approach would never see it. They currently route non-200 → `/error500`.
- **Thrown:** writing finish (`WritingTestClient.tsx:53`), speaking **begin** on-mount (`SpeakingTestClient.tsx:36`, the `_begin` call), and mock start (`mock/page.tsx:167`, `MockBySections.tsx:30`) throw an `AxiosError`.

**Design:** one helper taking an extracted `{ status, message }` from **either** a thrown `AxiosError` **or** a resolved `AxiosResponse`, routing by **refreshed entitlement** (NOT by which message):

```ts
// src/lib/funnel/handleEntitlementLapse.ts
const LAPSE_MESSAGES = new Set([
  'Practice requires active subscription or practice balance', // practice/views.py:574,822,1026,1315
  'Mock access requires available mock balance',               // mock/views.py:206
]);

// returns true iff it recognized & handled an entitlement lapse
export async function handleEntitlementLapse(
  signal: { status?: number; message?: unknown },
  ctx: { router: AppRouterInstance; locale: string; openPaywall: () => void },
): Promise<boolean> {
  if (signal.status !== 400 || typeof signal.message !== 'string' || !LAPSE_MESSAGES.has(signal.message)) return false;
  await refreshSubscriptionAndBalance();                          // get the truth post-lapse
  const { subscription, balance } = useSubscriptionStore.getState();
  if (isEntitled(subscription, balance)) ctx.openPaywall();       // still entitled → voluntary modal, NOT the gated wall
  else ctx.router.push(`/${ctx.locale}/paywall`);                 // genuinely unentitled → funnel wall (no bounce)
  return true;
}
```

**Critical correction — route by refreshed `isEntitled`, not by message.** A non-subscriber with `practice_balance=0` but `mock_balance>0` gets the *practice* 400 yet is still `isEntitled` (mock credits); pushing `/paywall` would make the `(funnel)` gate bounce them right back (`can_start_practice` ignores mock credits — `payments/services.py:28-41` — but `isEntitled` doesn't). So for **both** messages: refresh, then `entitled ⇒ openPaywall()`, `!entitled ⇒ /paywall`.

**Wiring (~7 sites, two shapes):**
- *Resolved branch* — call the helper in each existing non-200 branch **before** the `/error500` fallback: `ReadingTestClient.tsx:195`, `reading/test/[id]/page.tsx:146`, `ListeningTestClient.tsx:147`.
- *Thrown branch* — call it before existing handling: `WritingTestClient.tsx:53` (in its `catch`); `SpeakingTestClient.tsx:36` (the `_begin` mount effect's `.catch()` — **NOT** `/finish` or `/send/speaking`, which don't enforce); `mock/page.tsx:167` + `MockBySections.tsx:30` (these currently use `try/finally` with **no catch** — add one).
- Ignore the dead `POST_practice_speaking_id_start.ts` (no importers).

**Edge cases / caveats:**
- **Exact-string match.** Any other 400 (e.g. speaking's `"Unsupported part value"`, `practice/views.py:1313`) falls through to existing handling. Brittle to backend wording changes — a machine error-code is the robust long-term fix (backend change, out of scope).
- **Depends on #1** (the entitled branch calls `openPaywall()`).
- For mock-start it largely duplicates `useSubscriptionGate`; it only fires there on the cache-staleness race. The genuinely-uncovered paths are practice-finish + speaking-begin.

---

## Fix #3 — gates degrade to `Error503` on backend outage

**Problem:** the `(app)`/`(funnel)` gates call `getSubscriptionCached()`/`getBalanceCached()` with **no try/catch**, and there is **no `error.tsx`** anywhere in the app tree (verified). If a fetch rejects at the gate, the result is an unhandled **500** instead of the parent's graceful `Error503`.

**Design:** wrap each gate's existing single `Promise.all([...])` in try/catch — on `UpstreamServiceError` render `Error503`; re-throw anything else (so genuine code bugs are NOT mislabeled "service unavailable"). *(Note: the parent layout uses a richer `getMe`-alone + `Promise.allSettled`+flag pattern; the gates don't need that split since all three values feed `resolveFunnelStage` together — a single guarded `Promise.all` is correct here. So "wrap the existing `Promise.all`," not literally "mirror the parent.")*

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
  throw error;
}
// ...resolveFunnelStage(...) + redirect as before — redirect stays OUTSIDE the try
```
(Catch always returns or throws ⇒ TS treats the three as definitely-assigned afterward — verified. `redirect()` throws an internal Next signal, so it stays outside the try; the `(funnel)` gate's extra post-fetch logic — `screenFromPath` + its redirects — is unaffected since only the fetch is wrapped.)

**Why not a catch-all `error.tsx`:** one that always renders `Error503` would catch real page bugs and mislabel them "service unavailable," masking defects.

**Files:** Modify `(app)/layout.tsx` and `(funnel)/layout.tsx`.

---

## Fix #4 — smooth the post-pay `/paywall` bounce (refinement; already self-healed)

**Status (corrected):** the "stuck on `/paywall`" failure is **already fixed** by `0a73b50` (the spawned follow-up), which made `SubscriptionPaymentStatusModal` read the `subscribePaymentStatus` param **nested inside `next=`** (`cameFromNext`), poll, refresh, and `router.replace` off the wall. So this is **not a stranding bug** — it's a **polish refinement**: avoid the bounce *entirely* rather than bounce to `/paywall` and self-heal back.

**Flow (verified):** EPay → backend static `EPAY_BACK_LINK` = `https://app.ieltsgg.com?subscribePaymentStatus=true` → `/` → `next.config` redirect `/`→`/{locale}/dashboard`. **Next.js forwards the query** (a `redirects()` whose destination has no query passes the incoming query through — verified) ⇒ the `(app)` gate sees `/{locale}/dashboard?subscribePaymentStatus=true` (`middleware.ts:92` puts the query in `x-sb-original-url`). If the webhook hasn't landed, the gate bounces to `/paywall?next=…` and the modal's `cameFromNext` path recovers — but the user sees a `/paywall` flash.

**Design (refinement):** **(app) gate payment-return grace** — skip the `!entitled` bounce when the URL carries `subscribePaymentStatus=true`, so the user stays on `/dashboard` and the modal polls there via the **top-level** param.

```tsx
// (app)/layout.tsx — alongside the existing originalUrl handling
const paymentReturning = new URLSearchParams(originalUrl?.split('?')[1] ?? '').get('subscribePaymentStatus') === 'true';
if (stage !== 'app' && !paymentReturning) {
  redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
}
```

**Reconcile with `0a73b50`:** with the grace the user is never bounced, so the modal's `cameFromNext` branch won't trigger; the top-level-param branch handles the poll on `/dashboard`. Complementary — but verify the modal doesn't also navigate when already on the landing page (no double-nav).

**Files:** Modify `(app)/layout.tsx`.

**Edge cases / tradeoff:**
- **Cosmetic bypass:** appending `?subscribePaymentStatus=true` renders the landing chrome once for an unentitled user. Bounded — backend enforces per-action; the modal strips the top-level param so refresh/next-nav re-gates.
- **Lower priority** now that `0a73b50` prevents real stranding — this purely smooths the flash. Skip if not worth the (small) gate change.

---

## Fix #5 — public `/pricing` blank/swap flashes

**Problem:** `(public)/pricing/page.tsx` still uses the pre-fix pattern (`Dialog` + `useMediaQuery` + `withHydrationGuard` + client-only `usePricingPlans`), so it has the blank-frame + desktop→mobile swap flashes. (The desktop *count*-jump is already mitigated by the `PricesModal` skeleton from `b120b00`, which `/pricing` also uses.)

**Design:** mirror the funnel paywall treatment, keeping `/pricing` **dismissible**:
- **Extend the existing** `(public)/pricing/layout.tsx` (it's currently metadata-only — **preserve its `generateMetadata` export**) to prefetch plans (`getPlans`, extended per the caveat below) and hydrate → no client-fetch flash.
- Rewrite the page to drop `withHydrationGuard` + `useMediaQuery` for a CSS `tablet:` split (desktop `PricesModal`, mobile `PricingPlansView` with `onBack = () => router.back()`).
- **Keeping the desktop `Dialog` shell is viable** (the flash comes from `useMediaQuery`/`withHydrationGuard`, **not** the Dialog) — and probably simpler than inventing a non-Dialog close, since `/pricing` must stay dismissible. Decide during implementation.

**Caveat (corrected — was wrong):** the plans endpoint `/billing/subscriptions/plans` (`payments/views.py:789`) is **public** — no `auth=ClientAuth()`; returns 200 with no token (verified). The logged-out limitation is *only* that `getPlans.ts:54` short-circuits to `null` without a cookie/token. So **logged-out prefetch is achievable**: add a token-less branch to `getPlans` (or a small anonymous fetcher). This fully fixes the flash for the marketing/logged-out audience (the main remaining audience for `/pricing` post-#1) — materially higher value than the earlier "logged-in only" framing.

**Files:** **extend** the existing `(public)/pricing/layout.tsx` (keep its `generateMetadata`); modify `(public)/pricing/page.tsx`; extend `src/lib/subscription/getPlans.ts` (token-less branch).

---

## Fix #6 — onboarding `next` uses the hardened sanitizer

**Problem:** onboarding finish navigates with `nextParam && nextParam.startsWith('/${locale}')` (`(funnel)/onboarding/page.tsx:341`). The gates use the hardened `sanitizeNextPath` (rejects `//`, login path, off-locale). Not an actual open redirect, just inconsistent/weaker.

**Design:**
```ts
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';
const destination = sanitizeNextPath(nextParam, locale) ?? `/${locale}/dashboard`;
router.push(destination);
```

**Files:** Modify `(funnel)/onboarding/page.tsx`. Trivial; strictly stronger; ready.

---

## Fix #7 — onboarding schema "preparing"/heading settle (lowest priority)

**Problem:** the page fetches its schema client-side into local `useState`, so on entry it briefly shows "preparing…" and the heading/progress can settle (i18n fallback → backend title) if the schema diverges from the i18n defaults. A *proper* loading state (not wrong content) — hence lowest priority.

**Design (proper, higher-effort):** server-prefetch the schema, mirroring `getPlans`: (1) a server-side schema fetch; (2) `(funnel)/onboarding/layout.tsx` prefetch+hydrate; (3) refactor the page to read schema via `useQuery(['onboarding-schema'], …)` instead of local `useState` + manual fetch — preserving the retry + `schema_version` conflict-refetch. **Risk:** step 3 reworks load-bearing state (`useOnboardingMachine` wiring, `schemaRequestedRef`, version-conflict). **Requires runtime QA**; do it last.

**Lighter alternative (recommended):** render a stable heading/progress **skeleton** during `schemaLoading` instead of the i18n→backend text swap. The heading text originates from `OnboardingLayout`'s `heading` prop (computed in the page), so apply the skeleton in `OnboardingLayout` (or pass a sentinel). Low-risk, no machine/refs/version changes.

**Files:** (lighter) `(funnel)/onboarding/page.tsx` + `OnboardingLayout.tsx`. (proper) + server fetch + `(funnel)/onboarding/layout.tsx`.

---

## Out of scope (ops, not a code fix)
- **Deploy coordination:** `WELCOME_CREDITS_ENABLED=False` per-env + ship FE/BE together, or the hard wall silently won't engage.

## Testing / verification
- `npx tsc --noEmit` + `npm run build` green after each fix.
- **#1** (entitled mobile user): "Upgrade" opens an **in-place, dismissible** surface (URL unchanged); plan select → promo/checkout works on mobile; desktop still opens its Dialog; funnel `/paywall` (unentitled) unchanged.
- **#2** (staging): exhaust practice credits as a non-subscriber → practice finish routes to `/paywall`; a non-subscriber with **0 practice but >0 mock** credits → practice finish opens the **voluntary** modal (not the wall, no bounce); active subscriber with 0 mock → mock start opens the voluntary modal. Verify reading/listening (resolved-400) AND writing/speaking/mock (thrown-400) paths both route.
- **#3:** backend 5xx → `(app)`/`(funnel)` render `Error503`, not a 500; a deliberate page render error still surfaces as a real error.
- **#4** (staging): complete a payment → `/dashboard?subscribePaymentStatus=true` → "Activating…" → admitted with **no `/paywall` flash**; modal doesn't double-navigate.
- **#5:** logged-in AND logged-out `/pricing` render plans on first paint, no blank/swap.
- **#6:** verify finish honors a valid `next` and ignores a malicious one (`sanitizeNextPath` is already unit-tested).
- **#7:** no heading/progress settle (proper) or a stable skeleton (lighter); full submit flow still works.
- Pure gate logic unchanged ⇒ existing vitest stays green; the rest is integration/RSC verified by build + manual QA.

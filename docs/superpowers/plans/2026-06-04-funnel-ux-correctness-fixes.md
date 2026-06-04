# Funnel UX & Correctness Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 7 UX/correctness bugs found in the funnel audit (mobile "Upgrade" broken, entitlement-lapse 400 unrouted, gate outage = 500, post-pay bounce, public `/pricing` flashes, onboarding `next` sanitizer, onboarding schema settle).

**Architecture:** All frontend (no backend changes). The only genuinely-testable logic (the entitlement-lapse router) is TDD'd with vitest; the rest are RSC/component edits verified by `tsc` + `next build` + a manual-QA matrix (the authenticated funnel can't be driven locally without the backend).

**Tech Stack:** Next.js 14 App Router, TS strict, TanStack Query, Zustand, vitest.

**Spec:** `docs/superpowers/specs/2026-06-04-funnel-ux-correctness-fixes.md` (verdict: ship-it).

**Before starting:** `git -C /Users/max/Projects/studybox/frontend checkout -b feat/funnel-ux-fixes`.

---

## File map

| Task | Fix | Files |
|---|---|---|
| 1 | #6 | M `…/(funnel)/onboarding/page.tsx` |
| 2 | #1 | M `src/components/GlobalSubscriptionPaywall.tsx` |
| 3 | #2 | C `src/lib/funnel/handleEntitlementLapse.ts` (+ `.test.ts`); M 7 practice/mock call sites |
| 4 | #3 | M `…/(app)/layout.tsx`, `…/(funnel)/layout.tsx` |
| 5 | #4 | M `…/(app)/layout.tsx` |
| 6 | #5 | M `src/lib/subscription/getPlans.ts`, `…/(public)/pricing/layout.tsx`, `…/(public)/pricing/page.tsx` |
| 7 | #7 | M `src/components/onboarding/OnboardingLayout.tsx`, `…/(funnel)/onboarding/page.tsx` |
| 8 | — | verification only |

---

## Task 1 (Fix #6): onboarding `next` uses `sanitizeNextPath`

**Files:** Modify `src/app/[locale]/(protected)/(funnel)/onboarding/page.tsx`.

- [ ] **Step 1: Add the import** (with the other `@/lib` imports near the top):
```ts
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';
```

- [ ] **Step 2: Replace the destination computation** in `handleFinish`. Find:
```ts
      const destination = nextParam && nextParam.startsWith(`/${locale}`) ? nextParam : `/${locale}/dashboard`;
      router.push(destination);
```
Replace with:
```ts
      const destination = sanitizeNextPath(nextParam, locale) ?? `/${locale}/dashboard`;
      router.push(destination);
```

- [ ] **Step 3: Typecheck.** Run `npx tsc --noEmit` → no errors.

- [ ] **Step 4: Commit.**
```bash
git add "src/app/[locale]/(protected)/(funnel)/onboarding/page.tsx"
git commit -m "fix(onboarding): sanitize next= via sanitizeNextPath on finish"
```

---

## Task 2 (Fix #1): mobile voluntary upgrade renders in-place + ungate PromoPromptModal

**Files:** Modify (full rewrite) `src/components/GlobalSubscriptionPaywall.tsx`.

**Context:** today the desktop branch renders a dismissible `<Dialog>` + `<PricesModal>`; the mobile branch `router.push('/${locale}/paywall')` (broken — the gate ejects entitled users). Rewrite so mobile renders the extracted `PricingPlansView` in place (dismissible via `onBack`), `PromoPromptModal` renders unconditionally, and the dead route-push effect + its imports (`useRouter`, `useLocale`, `next/router`'s `Router`, `NProgress`) are removed.

- [ ] **Step 1: Replace the whole file** `src/components/GlobalSubscriptionPaywall.tsx` with:
```tsx
'use client';

import React from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Dialog, DialogContent } from './ui/dialog';
import { PricesModal } from './PricesModal';
import { PricingPlansView } from './PricingPlansView';
import { PromoPromptModal } from './PromoPromptModal';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { withHydrationGuard } from '@/hooks/useHasMounted';

const GlobalSubscriptionPaywallComponent = () => {
  const isOpen = useSubscriptionStore(state => state.isPaywallOpen);
  const setPaywallOpen = useSubscriptionStore(state => state.setPaywallOpen);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const { activePlans, status } = usePricingPlans();
  const { t } = useCustomTranslations('pricesModal');
  const demoIncludes = t.raw('demo.includes') as string[];
  const premiumIncludes = t.raw('premium.includes') as string[];

  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; currency: string }>>({});
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPaywallOpen(false);
    setPromoMessage(null);
    setPromoError(null);
  };

  const handlePromoModalClose = () => {
    setPromoModalOpen(false);
    setSelectedPlanId(null);
  };

  return (
    <>
      {/* Mobile: in-place, DISMISSIBLE full-screen overlay (voluntary upgrade — never the gated /paywall route) */}
      {isMobile && isOpen ? (
        <div className='fixed inset-0 z-[8889] bg-white'>
          <PricingPlansView
            demoIncludes={demoIncludes}
            premiumIncludes={premiumIncludes}
            activePlans={activePlans}
            status={status}
            onPlanSelect={handlePlanSelect}
            planDiscounts={planDiscounts}
            promoMessage={promoMessage}
            promoError={promoError}
            onBack={() => setPaywallOpen(false)}
          />
        </div>
      ) : null}

      {/* Desktop: dismissible Dialog (unchanged) */}
      {!isMobile ? (
        <Dialog
          open={isOpen}
          onOpenChange={open => {
            setPaywallOpen(open);
            if (open) {
              setPromoModalOpen(false);
              setPromoMessage(null);
              setPromoError(null);
            }
          }}
        >
          <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center [&_button[data-radix-dialog-close]]:hidden'>
            <PricesModal onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Plan-select → checkout, on BOTH breakpoints (PromoPromptModal is internally responsive) */}
      <PromoPromptModal
        open={isPromoModalOpen}
        planId={selectedPlanId}
        onClose={handlePromoModalClose}
        onBackToPlans={() => {
          handlePromoModalClose();
          setPaywallOpen(true);
        }}
        onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
        onSuccessMessage={setPromoMessage}
        onErrorMessage={setPromoError}
      />
    </>
  );
};

export const GlobalSubscriptionPaywall = withHydrationGuard(GlobalSubscriptionPaywallComponent);
```
> Notes: `z-[8889]` sits just above the overlay tier (`8888`) seen elsewhere; the `PromoPromptModal`'s own `BottomSheet`/`Dialog` portals render above it. `PricingPlansView`'s `motion.main`/`min-h-dvh` is the full-screen surface; the `bg-white` wrapper just covers app chrome behind it. `onBack` makes it dismissible (voluntary).

- [ ] **Step 2: Typecheck + build.** `npx tsc --noEmit` (no errors), then `npm run build` (succeeds; confirms no leftover references to the removed `useRouter`/`useLocale`/`Router`/`NProgress`).

- [ ] **Step 3: Manual check (dev).** `npm run dev`, mobile width, trigger "Upgrade" on the dashboard → an in-place plan view opens (URL stays `/dashboard`), is dismissible (back), and selecting a plan opens the promo modal. Desktop still opens the Dialog.

- [ ] **Step 4: Commit.**
```bash
git add src/components/GlobalSubscriptionPaywall.tsx
git commit -m "fix(paywall): render voluntary upgrade in-place on mobile (no gated-route bounce)"
```

---

## Task 3 (Fix #2): route the entitlement-lapse 400 (TDD the helper)

**Files:** Create `src/lib/funnel/handleEntitlementLapse.ts` + `src/lib/funnel/handleEntitlementLapse.test.ts`; modify 7 call sites.

- [ ] **Step 1: Write the failing test** `src/lib/funnel/handleEntitlementLapse.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const refreshMock = vi.fn().mockResolvedValue(undefined);
const openPaywallMock = vi.fn();
let flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: false };

vi.mock('@/stores/subscriptionStore', () => ({
  refreshSubscriptionAndBalance: () => refreshMock(),
  openSubscriptionPaywall: () => openPaywallMock(),
  useSubscriptionStore: { getState: () => flags },
}));

import { handleEntitlementLapse } from './handleEntitlementLapse';

const PRACTICE = 'Practice requires active subscription or practice balance';

beforeEach(() => {
  refreshMock.mockClear();
  openPaywallMock.mockClear();
  flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: false };
});

describe('handleEntitlementLapse', () => {
  it('ignores a non-lapse 400 (returns false, no nav)', async () => {
    const router = { push: vi.fn() };
    expect(await handleEntitlementLapse({ status: 400, message: 'Unsupported part value' }, router)).toBe(false);
    expect(router.push).not.toHaveBeenCalled();
    expect(openPaywallMock).not.toHaveBeenCalled();
  });

  it('routes a genuinely-unentitled user to /paywall', async () => {
    const router = { push: vi.fn() };
    flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: false };
    expect(await handleEntitlementLapse({ status: 400, message: PRACTICE }, router)).toBe(true);
    expect(router.push).toHaveBeenCalledWith('/paywall');
    expect(openPaywallMock).not.toHaveBeenCalled();
  });

  it('opens the voluntary modal (no wall bounce) when still entitled via other credits', async () => {
    const router = { push: vi.fn() };
    flags = { hasActiveSubscription: false, hasPracticeCredits: false, hasMockCredits: true };
    expect(await handleEntitlementLapse({ status: 400, message: PRACTICE }, router)).toBe(true);
    expect(openPaywallMock).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL.** `npm test -- handleEntitlementLapse` → FAIL (`Cannot find module './handleEntitlementLapse'`).

- [ ] **Step 3: Implement** `src/lib/funnel/handleEntitlementLapse.ts`:
```ts
import axios from 'axios';

import { refreshSubscriptionAndBalance, useSubscriptionStore, openSubscriptionPaywall } from '@/stores/subscriptionStore';

// Exact backend strings: practice/views.py:574,823,1026,1315 ; mock/views.py:206
const LAPSE_MESSAGES = new Set<string>([
  'Practice requires active subscription or practice balance',
  'Mock access requires available mock balance',
]);

type Pushable = { push: (href: string) => void };

/**
 * If `signal` is an entitlement-lapse 400, refresh entitlement and route:
 * still entitled (e.g. only other-type credits left) → voluntary upgrade modal;
 * genuinely unentitled → the funnel /paywall (which now renders, no bounce).
 * Returns true iff it handled the signal (caller then skips its generic error path).
 */
export async function handleEntitlementLapse(signal: { status?: number; message?: unknown }, router: Pushable): Promise<boolean> {
  if (signal.status !== 400 || typeof signal.message !== 'string' || !LAPSE_MESSAGES.has(signal.message)) {
    return false;
  }
  try {
    await refreshSubscriptionAndBalance();
  } catch {
    // refresh failure is non-fatal; fall through with current flags
  }
  const { hasActiveSubscription, hasPracticeCredits, hasMockCredits } = useSubscriptionStore.getState();
  if (hasActiveSubscription || hasPracticeCredits || hasMockCredits) {
    openSubscriptionPaywall(); // route NOT by message — a non-sub with 0 practice/>0 mock is still entitled
  } else {
    router.push('/paywall'); // locale-less; middleware prefixes (matches existing client pushes)
  }
  return true;
}

/** Convenience for the throwing call sites (writing/speaking/mock). */
export async function handleEntitlementLapseFromError(error: unknown, router: Pushable): Promise<boolean> {
  if (!axios.isAxiosError(error)) return false;
  const data = error.response?.data as { message?: unknown } | undefined;
  return handleEntitlementLapse({ status: error.response?.status, message: data?.message }, router);
}
```

- [ ] **Step 4: Run it, expect PASS.** `npm test -- handleEntitlementLapse` → PASS (3 tests).

- [ ] **Step 5: Wire the RESOLVED sites** (reading + listening — they use `validateStatus: () => true`, so the 400 is a resolved response). In each, add the import `import { handleEntitlementLapse } from '@/lib/funnel/handleEntitlementLapse';` and edit the `else` branch.

  `ReadingTestClient.tsx` — find (~:203):
```tsx
      } else {
        setIsPending(false);
        void router.push('/error500');
      }
```
  replace with:
```tsx
      } else {
        setIsPending(false);
        if (await handleEntitlementLapse({ status: response.status, message: (response.data as unknown as { message?: unknown })?.message }, router)) return;
        void router.push('/error500');
      }
```
  Apply the **identical** edit at `practice/reading/test/[id]/page.tsx` (its `else` at ~:153) and `practice/listening/test/ListeningTestClient.tsx` (its `else` at ~:154; that file's `router.push` has no `void` — keep its existing style: `if (await handleEntitlementLapse({ status: response.status, message: (response.data as unknown as { message?: unknown })?.message }, router)) return;` before `router.push('/error500');`).

- [ ] **Step 6: Wire the THROWN sites** (writing/speaking/mock). Import `import { handleEntitlementLapseFromError } from '@/lib/funnel/handleEntitlementLapse';`.

  `WritingTestClient.tsx` catch (~:61):
```tsx
    } catch (error) {
      setIsPending(false);
      if (await handleEntitlementLapseFromError(error, router)) return;
      setSubmitError(tMessages('unexpectedError'));
    }
```
  `SpeakingTestClient.tsx` `.catch` (~:48) — fire-and-forget (it's a mount effect):
```tsx
      .catch(error => {
        console.error('[speaking] failed to begin practice attempt', error);
        void handleEntitlementLapseFromError(error, router);
        if (mounted) {
          setAttemptId(null);
        }
      });
```
  `mock/page.tsx` — the `try` has **no catch** (only `finally`); add one (~:170):
```tsx
      const data = await POST_mock_start();
      setMockData(data);
      nProgress.start();
      router.push('/mock/exam/listening/rules');
    } catch (error) {
      await handleEntitlementLapseFromError(error, router);
    } finally {
      setIsLoading(false);
    }
```
  Apply the same `catch` addition to `mock/_components/MockBySections.tsx` (its `POST_mock_start` `try/finally` at ~:30).

- [ ] **Step 7: Typecheck + build + tests.** `npx tsc --noEmit`, `npm test`, `npm run build` — all green.

- [ ] **Step 8: Commit.**
```bash
git add src/lib/funnel/handleEntitlementLapse.ts src/lib/funnel/handleEntitlementLapse.test.ts \
  "src/app/[locale]/(protected)/(app)/practice" "src/app/[locale]/(protected)/(app)/mock"
git commit -m "feat(entitlement): route lapse-400 to paywall/upgrade by refreshed entitlement"
```

---

## Task 4 (Fix #3): gates render `Error503` on backend outage

**Files:** Modify `src/app/[locale]/(protected)/(app)/layout.tsx` and `…/(funnel)/layout.tsx`.

- [ ] **Step 1: `(app)/layout.tsx`** — add imports and wrap the fetch. Add near the top:
```ts
import Error503 from '@/app/[locale]/(public)/Error503/page';
import { UpstreamServiceError } from '@/lib/api/errors';
import type { User } from '@/types/types';
import type { IClientSubscription, IBillingBalance } from '@/types/Billing';
```
Replace:
```ts
  const [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
```
with:
```ts
  let me: User | null;
  let subscription: IClientSubscription | null;
  let balance: IBillingBalance | null;
  try {
    [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
  } catch (error) {
    if (error instanceof UpstreamServiceError) return <Error503 />;
    throw error;
  }
```

- [ ] **Step 2: `(funnel)/layout.tsx`** — the identical change (same imports, same try/catch around its `Promise.all`). Everything after the fetch (`resolveFunnelStage`, `screenFromPath`, the `redirect()` calls) stays exactly as-is, outside the try.

- [ ] **Step 3: Typecheck + build.** `npx tsc --noEmit`, `npm run build` — green.

- [ ] **Step 4: Commit.**
```bash
git add "src/app/[locale]/(protected)/(app)/layout.tsx" "src/app/[locale]/(protected)/(funnel)/layout.tsx"
git commit -m "fix(gates): render Error503 on UpstreamServiceError instead of unhandled 500"
```

---

## Task 5 (Fix #4): `(app)` gate payment-return grace

**Files:** Modify `src/app/[locale]/(protected)/(app)/layout.tsx`.

- [ ] **Step 1: Add the grace** so a just-paid user (`?subscribePaymentStatus=true`) isn't bounced before the global modal can poll. The gate already has `originalUrl`. Change the bounce guard:
```ts
  if (stage !== 'app') {
    redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
  }
```
to:
```ts
  const paymentReturning = new URLSearchParams(originalUrl?.split('?')[1] ?? '').get('subscribePaymentStatus') === 'true';
  if (stage !== 'app' && !paymentReturning) {
    redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
  }
```
(If `originalUrl` is typed `string | null`, `originalUrl?.split` handles null.)

- [ ] **Step 2: Typecheck + build.** Green.

- [ ] **Step 3: Commit.**
```bash
git add "src/app/[locale]/(protected)/(app)/layout.tsx"
git commit -m "fix(gate): grace the post-payment return (?subscribePaymentStatus) so the poll can run on /dashboard"
```

---

## Task 6 (Fix #5): public `/pricing` — prefetch plans + drop the blank frame

**Files:** Modify `src/lib/subscription/getPlans.ts`, `…/(public)/pricing/layout.tsx`, `…/(public)/pricing/page.tsx`.

- [ ] **Step 1: Make `getPlans` work without a token** (the endpoint is public). In `src/lib/subscription/getPlans.ts`, find the early bail:
```ts
  if (!authHeader && !cookieHeader && !tokenFromCookie) {
    return null;
  }
```
**Delete it** — always attempt the fetch; the `Authorization`/`Cookie` headers are still attached only when present (the existing `if (authHeader) …` / `if (cookieHeader) …` blocks below remain). Logged-out callers now get the public plan list instead of `null`.

- [ ] **Step 2: Prefetch + hydrate in the existing pricing layout** (KEEP `generateMetadata`). Edit `src/app/[locale]/(public)/pricing/layout.tsx` to:
```tsx
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { dehydrate, QueryClient } from '@tanstack/react-query';

import HydrateOnly from '@/app/_providers/HydrateOnly';
import { getPlans } from '@/lib/subscription/getPlans';

type Props = { params: { locale: string } };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata.pricing' });
  return { title: t('title'), description: t('description') };
}

export default async function PricingLayout({ children }: { children: ReactNode }) {
  const plans = await getPlans();
  if (!plans) return <>{children}</>;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: ['/billing/subscriptions/plans'], queryFn: async () => plans });
  return <HydrateOnly state={dehydrate(queryClient)}>{children}</HydrateOnly>;
}
```

- [ ] **Step 3: Drop the blank frame in the page.** In `src/app/[locale]/(public)/pricing/page.tsx`: remove `import { withHydrationGuard } from '@/hooks/useHasMounted';`; change the component to a default-exported function and delete the `withHydrationGuard` wrapper + the `if (isMobile === undefined) return null;` guard (with `initializeWithValue: false`, `isMobile` is `false` on SSR+first paint — consistent, no hydration mismatch, no blank). Concretely:
  - Rename `const PricingPageComponent = () => {` → `export default function PricingPage() {`.
  - Delete the `if (isMobile === undefined) { return null; }` block.
  - Delete the trailing `const PricingPage = withHydrationGuard(PricingPageComponent);` and `export default PricingPage;`.
  - Keep the rest (Dialog desktop / `PricingPlansView` mobile via `useMediaQuery`) unchanged — the count flash is gone (prefetch) and the blank frame is gone (no guard). The residual desktop→mobile flip on phones is acceptable for this marketing page (out of the core funnel path); the full no-Dialog CSS-split is an optional later polish.

- [ ] **Step 4: Typecheck + build.** Green; `/pricing` still listed.

- [ ] **Step 5: Manual check.** `npm run dev`, open `/pricing` (logged-in AND logged-out): plans render on first paint, no blank flash; desktop close (`router.back`) still works.

- [ ] **Step 6: Commit.**
```bash
git add src/lib/subscription/getPlans.ts "src/app/[locale]/(public)/pricing/layout.tsx" "src/app/[locale]/(public)/pricing/page.tsx"
git commit -m "fix(pricing): prefetch public plans + drop hydration-guard blank frame"
```

---

## Task 7 (Fix #7): onboarding schema — stable skeleton during load (lighter alternative)

**Files:** Modify `src/components/onboarding/OnboardingLayout.tsx` and `…/(funnel)/onboarding/page.tsx`.

- [ ] **Step 1: Add a `loading` prop to `OnboardingLayout`.** In `OnboardingLayoutProps` add `loading?: boolean;`, destructure it (default `false`), and render a skeleton for the heading/description while loading. Replace the `<header>` block:
```tsx
          <header className='flex flex-col gap-[8rem]'>
            <h1 ref={headingRef ?? undefined} id={headingId} tabIndex={-1} className='text-[26rem] font-semibold leading-[1.2] text-slate-900 outline-none desktop:text-[30rem]'>
              {heading}
            </h1>
            {description ? <p className='text-[14rem] leading-[1.6] text-slate-500'>{description}</p> : null}
          </header>
```
with:
```tsx
          <header className='flex flex-col gap-[8rem]'>
            {loading ? (
              <>
                <div className='h-[32rem] w-3/4 animate-pulse rounded-[8rem] bg-slate-100' />
                <div className='h-[18rem] w-1/2 animate-pulse rounded-[8rem] bg-slate-100' />
              </>
            ) : (
              <>
                <h1 ref={headingRef ?? undefined} id={headingId} tabIndex={-1} className='text-[26rem] font-semibold leading-[1.2] text-slate-900 outline-none desktop:text-[30rem]'>
                  {heading}
                </h1>
                {description ? <p className='text-[14rem] leading-[1.6] text-slate-500'>{description}</p> : null}
              </>
            )}
          </header>
```
(Add `loading = false` to the destructured props and `loading?: boolean;` to the interface.)

- [ ] **Step 2: Pass `loading={schemaLoading}`** from the onboarding page. In `(funnel)/onboarding/page.tsx`, the `<OnboardingLayout …>` JSX gains `loading={schemaLoading}` (the `schemaLoading` state already exists).

- [ ] **Step 3: Typecheck + build.** Green.

- [ ] **Step 4: Manual check.** Onboarding entry shows a stable heading/progress skeleton during the brief schema load, no i18n→backend text swap.

- [ ] **Step 5: Commit.**
```bash
git add src/components/onboarding/OnboardingLayout.tsx "src/app/[locale]/(protected)/(funnel)/onboarding/page.tsx"
git commit -m "fix(onboarding): stable heading skeleton during schema load (no settle)"
```

---

## Task 8: Full verification

- [ ] **Step 1: Unit suite.** `npm test` → all pass (funnel pure fns + the new `handleEntitlementLapse`).
- [ ] **Step 2: Build.** `npm run build` → compiles; route list unchanged.
- [ ] **Step 3: Manual-QA matrix** (`npm run dev`, with a backend):
  - [ ] #1: mobile "Upgrade" → in-place dismissible plan view (URL stays `/dashboard`); desktop → Dialog; funnel `/paywall` (unentitled) unchanged.
  - [ ] #2: non-subscriber exhausts practice → practice **finish** routes to `/paywall`; non-subscriber with **0 practice / >0 mock** → practice finish opens the **voluntary modal** (no wall bounce); active subscriber with 0 mock → mock start opens the voluntary modal. Verify reading/listening (resolved-400) AND writing/speaking/mock (thrown-400) paths.
  - [ ] #3: backend 5xx → `(app)`/`(funnel)` render `Error503` (not a 500); a deliberate page render error still surfaces as a real error.
  - [ ] #4: complete a payment → land on `/dashboard?subscribePaymentStatus=true` → "Activating…" → admitted with **no `/paywall` flash**.
  - [ ] #5: logged-in AND logged-out `/pricing` render plans on first paint, no blank/swap blank; desktop close works.
  - [ ] #6: onboarding finish honors a valid `next`, ignores a malicious one.
  - [ ] #7: onboarding entry shows a stable skeleton, no heading settle; full submit flow works.
- [ ] **Step 4: Open PR** for `feat/funnel-ux-fixes`.

---

## Self-review notes (author)

- **Spec coverage:** #6→T1, #1→T2, #2→T3, #3→T4, #4→T5, #5→T6, #7→T7; all seven covered; final QA in T8.
- **Type consistency:** `handleEntitlementLapse(signal, router)` + `handleEntitlementLapseFromError(error, router)` used consistently across T3's resolved/thrown sites; the helper reads store flags `hasActiveSubscription`/`hasPracticeCredits`/`hasMockCredits` (verified to exist on the store). `getPlans`/`['/billing/subscriptions/plans']` key matches `usePricingPlans` and the funnel paywall layout. `OnboardingLayout` `loading` prop is new and only consumed by the onboarding page.
- **Judgment calls:** the helper pushes locale-less `/paywall` (middleware prefixes — matches existing `router.push('/practice/…')`/`/error500` usages). T6 takes the low-risk #5 path (prefetch + drop the guard's blank) and explicitly defers the no-Dialog CSS-split full-swap fix as optional, since `/pricing` must stay dismissible and is out of the core funnel path. T7 ships the spec's recommended lighter skeleton, not the risky schema-prefetch refactor.
- **Duplicate sites (T3):** the reading-page and `MockBySections` edits are stated as "identical to" the shown ReadingTestClient/mock-page edits at their exact insertion points — the full pattern is shown once per shape.

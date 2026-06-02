# Funnel Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce a strict, non-bypassable, flicker-free funnel `login → onboarding → paywall → app` in the Next.js frontend, reusing existing screens.

**Architecture:** Split `(protected)` into two server-gated route groups — `(funnel)` (onboarding + paywall; gated on `me` only) and `(app)` (everything else; gated on `me` + `onboarding_completed` + entitled). A single pure `resolveFunnelStage()` is the source of truth, enforced by RSC layout `redirect()` (before render). One reversible backend flag disables welcome credits so a fresh onboarded user reaches the paywall. The hard paywall is pay-only (no trial). Checkout-return is handled in the global payment-status modal (EPay returns to the app root), with `(app)` as the self-healing backstop.

**Tech Stack:** Next.js 14 App Router, TypeScript (strict), TanStack Query, Zustand, next-intl, Radix/shadcn, vitest (new, for the pure gate logic), Django/django-ninja (backend flag only).

**Spec:** `docs/superpowers/specs/2026-06-02-funnel-gating-architecture-design.md`

**Before you start:** Create a feature branch in the frontend repo:
```bash
git -C /Users/max/Projects/studybox/frontend checkout -b feat/funnel-gating
```
The backend task (Task 13) is in a **separate repo** (`/Users/max/Projects/studybox/backend`) — branch there separately when you reach it.

---

## File Structure

**New (frontend):**
- `src/lib/funnel/resolveStage.ts` — `FunnelStage`, `isEntitled`, `resolveFunnelStage` (pure). Task 2.
- `src/lib/funnel/paths.ts` — `pathForStage`, `screenFromPath`, `withNext` (pure). Task 3.
- `src/lib/funnel/resolveStage.test.ts`, `src/lib/funnel/paths.test.ts` — vitest. Tasks 2–3.
- `src/lib/funnel/serverData.ts` — `cache()`-wrapped server fetchers (dedup parent+child). Task 4.
- `src/app/[locale]/(protected)/(app)/layout.tsx` — app gate. Task 6.
- `src/app/[locale]/(protected)/(funnel)/layout.tsx` — funnel gate. Task 7.
- `src/components/PricingPlansView.tsx` — extracted from inline `PricingMobileView`. Task 8.
- `src/app/[locale]/(protected)/(funnel)/paywall/page.tsx` — paywall page (wall UI only). Task 9.
- `src/api/GET_orders_id.ts` — order-status poll wrapper. Task 12.

**Moved (folders only; URLs unchanged):** `dashboard, practice, mock, notes, m` → `(protected)/(app)/`; `onboarding` → `(protected)/(funnel)/`. Task 5.

**Modified (frontend):**
- `src/app/[locale]/(protected)/layout.tsx` — use the `cache()` wrappers. Task 4.
- `src/components/PricesModal.tsx` — add optional `showClose` prop. Task 8.
- `src/app/[locale]/(protected)/(funnel)/onboarding/page.tsx` — thread `next`. Task 10.
- `src/components/GlobalSubscriptionPaywall.tsx` — mobile push `/pricing` → `/paywall`. Task 11.
- `src/components/PromoPromptModal.tsx` — stash `orderId` in `sessionStorage` before pay. Task 12.
- `src/components/SubscriptionPaymentStatusModal.tsx` — becomes the checkout-return poll owner. Task 12.
- `src/app/[locale]/(public)/pricing/page.tsx` — consume extracted `PricingPlansView`. Task 8.
- `package.json` — vitest dev deps + `test` script. Task 1.

**Modified (backend — separate repo):** `core/settings.py`, `client/utils.py`, `client/tests.py`. Task 13.

**Deferred (YAGNI):** the client `useFunnelStage` selector from the spec is intentionally omitted. The `(app)` gate is `force-dynamic` and `redirect()`s **before** rendering children, so a client navigation to `/dashboard` post-onboarding bounces to `/paywall` server-side with **no flash** of dashboard content. Revisit only if a real flash appears.

---

## Task 1: Set up vitest for the pure gate logic

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest**

Run:
```bash
cd /Users/max/Projects/studybox/frontend && npm install -D vitest@^2
```
Expected: `vitest` added to `devDependencies`, no peer-dep errors.

- [ ] **Step 2: Add the `test` script**

In `package.json`, change the `"scripts"` block to add a test script:
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 4: Verify the runner works (no tests yet)**

Run: `npm test`
Expected: vitest runs and reports "No test files found" (exit non-zero is fine here) — confirms config loads and the `@` alias resolves.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for pure gate-logic unit tests"
```

---

## Task 2: `resolveFunnelStage` — the source of truth (TDD)

**Files:**
- Create: `src/lib/funnel/resolveStage.ts`
- Test: `src/lib/funnel/resolveStage.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/funnel/resolveStage.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { resolveFunnelStage, isEntitled } from './resolveStage';
import type { User } from '@/types/types';
import type { IClientSubscription, IBillingBalance } from '@/types/Billing';

const me = (over: Partial<User> = {}): User =>
  ({ id: 1, email: 'a@b.c', name: 'A', onboarding_completed: true, balance: 0, mock_balance: 0, practice_balance: 0, gotFreeWelcomeTest: false, ...over }) as User;

const activeSub = (): IClientSubscription =>
  ({ id: 1, status: 'active', current_period_start: null, current_period_end: new Date(Date.now() + 86_400_000).toISOString(), cancel_at_period_end: false, plan: null });

const bal = (over: Partial<IBillingBalance> = {}): IBillingBalance => ({ tenge_balance: 0, mock_balance: 0, practice_balance: 0, ...over });

describe('resolveFunnelStage', () => {
  it('unauthenticated when no me', () => {
    expect(resolveFunnelStage({ me: null, subscription: null, balance: null })).toBe('unauthenticated');
  });
  it('onboarding when not completed', () => {
    expect(resolveFunnelStage({ me: me({ onboarding_completed: false }), subscription: activeSub(), balance: bal() })).toBe('onboarding');
  });
  it('paywall when onboarded but not entitled', () => {
    expect(resolveFunnelStage({ me: me(), subscription: null, balance: bal() })).toBe('paywall');
  });
  it('app when entitled via active subscription', () => {
    expect(resolveFunnelStage({ me: me(), subscription: activeSub(), balance: bal() })).toBe('app');
  });
  it('app when entitled via practice credits', () => {
    expect(resolveFunnelStage({ me: me(), subscription: null, balance: bal({ practice_balance: 1 }) })).toBe('app');
  });
  it('app when entitled via mock credits', () => {
    expect(resolveFunnelStage({ me: me(), subscription: null, balance: bal({ mock_balance: 1 }) })).toBe('app');
  });
});

describe('isEntitled', () => {
  it('false for no sub and zero credits', () => {
    expect(isEntitled(null, bal())).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- resolveStage`
Expected: FAIL — `Cannot find module './resolveStage'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/funnel/resolveStage.ts`:
```ts
import { computeHasActiveSubscription, computeBalanceFlags } from '@/lib/subscription/derive';
import type { IBillingBalance, IClientSubscription } from '@/types/Billing';
import type { User } from '@/types/types';

export type FunnelStage = 'unauthenticated' | 'onboarding' | 'paywall' | 'app';

export function isEntitled(subscription: IClientSubscription | null, balance: IBillingBalance | null): boolean {
  const { hasPracticeCredits, hasMockCredits } = computeBalanceFlags(balance);
  return computeHasActiveSubscription(subscription) || hasPracticeCredits || hasMockCredits;
}

export interface FunnelStageInput {
  me: User | null;
  subscription: IClientSubscription | null;
  balance: IBillingBalance | null;
}

export function resolveFunnelStage({ me, subscription, balance }: FunnelStageInput): FunnelStage {
  if (!me) return 'unauthenticated';
  if (!me.onboarding_completed) return 'onboarding';
  if (!isEntitled(subscription, balance)) return 'paywall';
  return 'app';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- resolveStage`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/funnel/resolveStage.ts src/lib/funnel/resolveStage.test.ts
git commit -m "feat: add resolveFunnelStage (pure funnel-stage source of truth)"
```

---

## Task 3: `pathForStage` + `screenFromPath` (TDD)

**Files:**
- Create: `src/lib/funnel/paths.ts`
- Test: `src/lib/funnel/paths.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/funnel/paths.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { pathForStage, screenFromPath, withNext } from './paths';

describe('pathForStage', () => {
  it('login with next', () => {
    expect(pathForStage('unauthenticated', 'en', '/en/dashboard')).toBe('/en/login?next=%2Fen%2Fdashboard');
  });
  it('onboarding without next', () => {
    expect(pathForStage('onboarding', 'ru', null)).toBe('/ru/onboarding');
  });
  it('paywall with next', () => {
    expect(pathForStage('paywall', 'en', '/en/mock')).toBe('/en/paywall?next=%2Fen%2Fmock');
  });
  it('app uses next when present, else dashboard', () => {
    expect(pathForStage('app', 'en', '/en/notes')).toBe('/en/notes');
    expect(pathForStage('app', 'en', null)).toBe('/en/dashboard');
  });
});

describe('screenFromPath', () => {
  it('reads the funnel screen after the locale prefix, ignoring the query', () => {
    expect(screenFromPath('/ru/paywall?next=%2Fru%2Fdashboard')).toBe('paywall');
    expect(screenFromPath('/en/onboarding?step=2')).toBe('onboarding');
  });
  it('returns null for non-funnel paths', () => {
    expect(screenFromPath('/en/dashboard')).toBeNull();
    expect(screenFromPath('/en')).toBeNull();
    expect(screenFromPath('')).toBeNull();
  });
});

describe('withNext', () => {
  it('appends next, encoding it', () => {
    expect(withNext('/en/login', '/en/a?b=c')).toBe('/en/login?next=%2Fen%2Fa%3Fb%3Dc');
  });
  it('returns path unchanged when next is falsy', () => {
    expect(withNext('/en/login', null)).toBe('/en/login');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- paths`
Expected: FAIL — `Cannot find module './paths'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/funnel/paths.ts`:
```ts
import type { FunnelStage } from './resolveStage';

export function withNext(path: string, next?: string | null): string {
  if (!next) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}next=${encodeURIComponent(next)}`;
}

export function pathForStage(stage: FunnelStage, locale: string, next?: string | null): string {
  switch (stage) {
    case 'unauthenticated':
      return withNext(`/${locale}/login`, next);
    case 'onboarding':
      return withNext(`/${locale}/onboarding`, next);
    case 'paywall':
      return withNext(`/${locale}/paywall`, next);
    case 'app':
      return next ?? `/${locale}/dashboard`;
  }
}

// originalUrl is the x-sb-original-url header, e.g. "/ru/paywall?next=...".
// Parse the segment AFTER the locale prefix; ignore the query string.
export function screenFromPath(originalUrl: string): 'onboarding' | 'paywall' | null {
  const pathname = originalUrl.split('?')[0] ?? '';
  const segments = pathname.split('/').filter(Boolean); // ['ru', 'paywall']
  const screen = segments[1];
  return screen === 'onboarding' || screen === 'paywall' ? screen : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- paths`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/funnel/paths.ts src/lib/funnel/paths.test.ts
git commit -m "feat: add pathForStage + screenFromPath (locale-aware funnel routing)"
```

---

## Task 4: `cache()`-wrapped server fetchers (dedup parent + child gate)

**Why:** the `(app)`/`(funnel)` gate layouts re-read `me/subscription/balance` that the parent `(protected)` layout already fetched. Native `fetch` with `cache:'no-store'` is not memoized, so without `cache()` each navigation double-fetches. Wrapping in a single shared `cache()` reference dedups within the request. We wrap (not edit) the `'use server'` fetchers to avoid the server-action export restriction.

**Files:**
- Create: `src/lib/funnel/serverData.ts`
- Modify: `src/app/[locale]/(protected)/layout.tsx`

- [ ] **Step 1: Create the cache wrappers**

Create `src/lib/funnel/serverData.ts`:
```ts
import 'server-only';
import { cache } from 'react';

import { getMe } from '@/lib/auth/getMe';
import { getSubscription } from '@/lib/subscription/getSubscription';
import { getBalance } from '@/lib/subscription/getBalance';

// Single shared references so the parent (protected) layout and the child gate
// layouts share one backend round-trip per request.
export const getMeCached = cache(getMe);
export const getSubscriptionCached = cache(getSubscription);
export const getBalanceCached = cache(getBalance);
```

- [ ] **Step 2: Point the parent layout at the cached fetchers**

In `src/app/[locale]/(protected)/layout.tsx`, replace the three imports:
```ts
import { getMe } from '@/lib/auth/getMe';
import { getBalance } from '@/lib/subscription/getBalance';
import { getSubscription } from '@/lib/subscription/getSubscription';
```
with:
```ts
import { getMeCached, getSubscriptionCached, getBalanceCached } from '@/lib/funnel/serverData';
```
Then update the three call sites in that file: `getMe()` → `getMeCached()`, `getSubscription()` → `getSubscriptionCached()`, `getBalance()` → `getBalanceCached()`. (Leave all error handling / `Error503` / prefetch logic exactly as-is.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify dedup at runtime**

Run: `npm run dev`, log in, open `/en/dashboard`, and watch the dev server console / network. Expected: one `GET /auth/profile`, one `/billing/subscriptions/current`, one `/billing/balance` per navigation (not two). If you see doubles, confirm the parent layout uses the `*Cached` versions.

- [ ] **Step 5: Commit**

```bash
git add src/lib/funnel/serverData.ts "src/app/[locale]/(protected)/layout.tsx"
git commit -m "perf: share me/subscription/balance fetches via React cache() wrappers"
```

---

## Task 5: Restructure `(protected)` into `(app)` and `(funnel)` zones

**Note:** route groups in parentheses do **not** change URLs. This is a folder move only. Each moved folder carries its nested `layout.tsx` files with it.

**Files:**
- Move under `src/app/[locale]/(protected)/`.

- [ ] **Step 1: Create the zone directories**

```bash
cd /Users/max/Projects/studybox/frontend/src/app/\[locale\]/\(protected\)
mkdir -p "(app)" "(funnel)"
```

- [ ] **Step 2: Move the app screens and the onboarding funnel screen**

```bash
git mv dashboard practice mock notes m "(app)/"
git mv onboarding "(funnel)/"
```

- [ ] **Step 3: Verify the tree**

Run: `find "(app)" "(funnel)" -maxdepth 1`
Expected: `(app)/dashboard`, `(app)/practice`, `(app)/mock`, `(app)/notes`, `(app)/m`, `(funnel)/onboarding`.

- [ ] **Step 4: Confirm the build still routes (URLs unchanged)**

Run: `cd /Users/max/Projects/studybox/frontend && npm run build`
Expected: build succeeds; the route list still shows `/[locale]/dashboard`, `/[locale]/onboarding`, etc. (No gate layouts yet — that's Tasks 6–7.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: split (protected) into (app) and (funnel) route-group zones"
```

---

## Task 6: `(app)` zone gate

**Files:**
- Create: `src/app/[locale]/(protected)/(app)/layout.tsx`

**Context:** the parent `(protected)/layout.tsx` only renders children on full success (it returns `<Error503/>` or `redirect()`s otherwise), so by the time this layout runs, `getMeCached()` is a cache hit with a non-null user. No try/catch needed here.

- [ ] **Step 1: Write the gate layout**

```tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { getMeCached, getSubscriptionCached, getBalanceCached } from '@/lib/funnel/serverData';
import { resolveFunnelStage } from '@/lib/funnel/resolveStage';
import { pathForStage } from '@/lib/funnel/paths';
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';

export const dynamic = 'force-dynamic';

export default async function AppZoneLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { locale } = params;
  const originalUrl = headers().get('x-sb-original-url');

  const [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
  const stage = resolveFunnelStage({ me, subscription, balance });

  if (stage !== 'app') {
    redirect(pathForStage(stage, locale, sanitizeNextPath(originalUrl, locale)));
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification — not-onboarded user is bounced**

Run `npm run dev`. With a test account whose `onboarding_completed` is false (or temporarily force it), visit `/en/dashboard`.
Expected: server-redirects to `/en/onboarding` (network shows a 307/308 to `/en/onboarding`), no flash of dashboard.

- [ ] **Step 4: Manual verification — entitled user passes**

With an entitled account (active sub or non-zero credits) that is onboarded, visit `/en/dashboard`.
Expected: dashboard renders normally.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/(protected)/(app)/layout.tsx"
git commit -m "feat: add (app) zone gate — onboarded + entitled required"
```

---

## Task 7: `(funnel)` zone gate

**Files:**
- Create: `src/app/[locale]/(protected)/(funnel)/layout.tsx`

- [ ] **Step 1: Write the gate layout**

```tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { getMeCached, getSubscriptionCached, getBalanceCached } from '@/lib/funnel/serverData';
import { resolveFunnelStage } from '@/lib/funnel/resolveStage';
import { pathForStage, screenFromPath } from '@/lib/funnel/paths';
import { sanitizeNextPath } from '@/lib/auth/safeRedirect';

export const dynamic = 'force-dynamic';

export default async function FunnelZoneLayout({ children, params }: { children: ReactNode; params: { locale: string } }) {
  const { locale } = params;
  const originalUrl = headers().get('x-sb-original-url') ?? '';
  const nextParam = new URLSearchParams(originalUrl.split('?')[1] ?? '').get('next');
  const incomingNext = sanitizeNextPath(nextParam, locale);

  const [me, subscription, balance] = await Promise.all([getMeCached(), getSubscriptionCached(), getBalanceCached()]);
  const stage = resolveFunnelStage({ me, subscription, balance });

  if (stage === 'app') redirect(pathForStage('app', locale, incomingNext)); // done → leave funnel
  if (stage === 'unauthenticated') redirect(pathForStage('unauthenticated', locale, incomingNext)); // defensive

  const requested = screenFromPath(originalUrl); // 'onboarding' | 'paywall'
  if (requested !== stage) redirect(pathForStage(stage, locale, incomingNext)); // wrong step → your step

  return <>{children}</>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (Note: `/paywall` doesn't exist yet — Task 9 — so visiting it 404s until then; the gate logic is still correct.)

- [ ] **Step 3: Manual verification — order enforcement**

Run `npm run dev`.
- Onboarded + entitled account → visit `/en/onboarding` → redirects to `/en/dashboard`.
- Not-onboarded account → visit `/en/onboarding` → renders onboarding (stage matches).
Expected: as described, no loops.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/(protected)/(funnel)/layout.tsx"
git commit -m "feat: add (funnel) zone gate — strict stage ordering"
```

---

## Task 8: Extract `PricingPlansView` + add `showClose` to `PricesModal`

**Files:**
- Create: `src/components/PricingPlansView.tsx`
- Modify: `src/app/[locale]/(public)/pricing/page.tsx`
- Modify: `src/components/PricesModal.tsx`

- [ ] **Step 1: Extract the inline mobile view into a component**

Create `src/components/PricingPlansView.tsx`. Move the `PricingMobileViewProps` interface and the `PricingMobileView` component **currently inline in `pricing/page.tsx:120-267`** into this new file, renaming it `PricingPlansView`. Add `'use client'` at the top and the imports it uses (copy from `pricing/page.tsx`): `React`/`useMemo`, `motion` from `framer-motion`, `MobilePageHeader` from `@/components/mobile/MobilePageHeader`, `useCustomTranslations`, `normalizeInterval` from `@/lib/pricing`, `ISubscriptionPlan` from `@/types/Billing`, and the module-local helpers `CURRENCY_FORMATTER`, `formatCurrency`, `getCardBackground` (copy these helper consts too). Make the back control optional:
```ts
interface PricingPlansViewProps {
  // ...existing props...
  onBack?: () => void; // optional: omit on the hard-wall paywall
}
```
And guard the header's back control so it only renders when `onBack` is provided:
```tsx
<MobilePageHeader title={titleText} subtitle={subtitleText} {...(onBack ? { back: true, backLabel: tActions('back'), onBack } : {})} />
```
Export it: `export const PricingPlansView = (props: PricingPlansViewProps) => { ... }`.

- [ ] **Step 2: Re-import it in the public pricing page**

In `src/app/[locale]/(public)/pricing/page.tsx`, delete the now-moved inline `PricingMobileViewProps`/`PricingMobileView` block, add `import { PricingPlansView } from '@/components/PricingPlansView';`, and change the mobile render from `<PricingMobileView ... />` to `<PricingPlansView ... onBack={() => router.back()} />` (keep all existing props). Remove now-unused local helpers if they were moved (or keep if still referenced).

- [ ] **Step 3: Add `showClose` to `PricesModal`**

In `src/components/PricesModal.tsx`, add the prop and guard the close button:
```ts
interface PricesModalProps {
  onSelectPlan: (planId: string) => void;
  promoMessage?: string | null;
  promoError?: string | null;
  planDiscounts?: Record<string, { amount: number; currency: string }>;
  showClose?: boolean; // default true; pass false on the hard-wall paywall
}
```
In the destructure add `showClose = true`, and wrap the `<DialogClose ...>...</DialogClose>` block (lines ~50-52) in `{showClose && ( ... )}`.

- [ ] **Step 4: Typecheck + verify pricing still works**

Run: `npx tsc --noEmit` (expected: no errors). Then `npm run dev`, open `/en/pricing` on desktop and mobile widths.
Expected: pricing renders identically to before; close button still present (default `showClose`).

- [ ] **Step 5: Commit**

```bash
git add src/components/PricingPlansView.tsx src/components/PricesModal.tsx "src/app/[locale]/(public)/pricing/page.tsx"
git commit -m "refactor: extract PricingPlansView; add showClose prop to PricesModal"
```

---

## Task 9: Paywall page (wall UI only)

**Files:**
- Create: `src/app/[locale]/(protected)/(funnel)/paywall/page.tsx`

**Context:** mirrors `(public)/pricing/page.tsx` but lives in the gated `(funnel)` zone, has **no dismiss** (it's a hard wall), and does **not** own the checkout-return poll (that's Task 12, in the global modal — EPay returns to the app root, not here).

- [ ] **Step 1: Write the paywall page**

```tsx
'use client';

import React, { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricesModal } from '@/components/PricesModal';
import { PricingPlansView } from '@/components/PricingPlansView';
import { PromoPromptModal } from '@/components/PromoPromptModal';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { withHydrationGuard } from '@/hooks/useHasMounted';

const PaywallPageComponent = () => {
  const isMobile = useMediaQuery('(max-width: 767px)', { initializeWithValue: false });
  const { activePlans, status } = usePricingPlans();

  const [isPromoModalOpen, setPromoModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = useState<Record<string, { amount: number; currency: string }>>({});
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPromoMessage(null);
    setPromoError(null);
  };

  const handlePromoClose = () => {
    setPromoModalOpen(false);
    setSelectedPlanId(null);
  };

  const promoModal = (
    <PromoPromptModal
      open={isPromoModalOpen}
      planId={selectedPlanId}
      onClose={handlePromoClose}
      onBackToPlans={handlePromoClose}
      onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
      onSuccessMessage={setPromoMessage}
      onErrorMessage={setPromoError}
    />
  );

  if (isMobile === undefined) return null;

  if (isMobile) {
    return (
      <>
        <PricingPlansView
          demoIncludes={[]}
          premiumIncludes={[]}
          activePlans={activePlans}
          status={status}
          onPlanSelect={handlePlanSelect}
          planDiscounts={planDiscounts}
          promoMessage={promoMessage}
          promoError={promoError}
        />
        {promoModal}
      </>
    );
  }

  return (
    <>
      <Dialog open>
        <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center [&_button[data-radix-dialog-close]]:hidden'>
          <PricesModal showClose={false} onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
        </DialogContent>
      </Dialog>
      {promoModal}
    </>
  );
};

const PaywallPage = withHydrationGuard(PaywallPageComponent);

export default PaywallPage;
```
> Note: pass the exact `demoIncludes`/`premiumIncludes` props `PricingPlansView` expects (copy how `(public)/pricing/page.tsx` supplies them via `t.raw(...)`); the `[]` placeholders above must be replaced with the real translation arrays during implementation, matching the extracted component's prop contract from Task 8.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. Fix any prop mismatch against the `PricingPlansView` contract from Task 8.

- [ ] **Step 3: Manual verification**

Run `npm run dev`. With an onboarded, **not-entitled** account, visit `/en/dashboard`.
Expected: bounced to `/en/paywall`; the wall renders (desktop modal with **no** close button; mobile full view with **no** back); selecting a plan opens the promo modal.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/(protected)/(funnel)/paywall/page.tsx"
git commit -m "feat: add gated /paywall page (hard wall, no dismiss)"
```

---

## Task 10: Thread `next` through onboarding completion

**Files:**
- Modify: `src/app/[locale]/(protected)/(funnel)/onboarding/page.tsx`

- [ ] **Step 1: Read the incoming `next`**

In `OnboardingPage`, just after `const stepParam = searchParams.get('step');` (~line 183), add:
```ts
const nextParam = searchParams.get('next');
```

- [ ] **Step 2: Navigate to `next` (gate routes the rest) on finish**

In `handleFinish`, change the success navigation `router.push(\`/${locale}/dashboard\`);` (~line 337) to:
```ts
const destination = nextParam && nextParam.startsWith(`/${locale}`) ? nextParam : `/${locale}/dashboard`;
router.push(destination);
```
(The `(app)` gate will bounce an unpaid user to `/paywall` server-side, carrying `next` — no client stage logic needed.)

- [ ] **Step 3: Preserve `next` on the step-sync `router.replace`**

The effect at ~line 234 rebuilds the query as `?step=N`, which would drop `next`. It already spreads existing params via `new URLSearchParams(Array.from(searchParams.entries()))` before `params.set('step', ...)`, so `next` is preserved — **verify** this is intact after your edits; if you replaced that line, ensure `next` is carried.

- [ ] **Step 4: Typecheck + manual verification**

Run `npx tsc --noEmit` (no errors). Then `npm run dev`: log out, visit `/en/dashboard/settings`; after login + onboarding, confirm you land on `/en/paywall?next=/en/dashboard/settings`, and after entitlement you reach `/en/dashboard/settings`.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/(protected)/(funnel)/onboarding/page.tsx"
git commit -m "feat: thread next= through onboarding completion"
```

---

## Task 11: Point the in-app paywall modal at `/paywall`

**Files:**
- Modify: `src/components/GlobalSubscriptionPaywall.tsx`

- [ ] **Step 1: Change the mobile redirect target**

In `GlobalSubscriptionPaywall.tsx`, the effect at ~line 42-48 does `router.push(\`/${locale}/pricing\`)`. Change it to the authenticated funnel paywall:
```ts
      router.push(`/${locale}/paywall`);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run `npm run dev` at a mobile width as an entitled user; trigger the in-app paywall (`openPaywall()` path — e.g. an entry point that calls it). Expected: navigates to `/en/paywall` (the gate lets an entitled user back out, so this is mainly the not-entitled / voluntary-upgrade case — confirm it no longer routes to the public `/pricing`).

- [ ] **Step 4: Commit**

```bash
git add src/components/GlobalSubscriptionPaywall.tsx
git commit -m "fix: route in-app paywall modal to authenticated /paywall"
```

---

## Task 12: Checkout-return — `orderId` via sessionStorage + poll in the global modal

**Files:**
- Create: `src/api/GET_orders_id.ts`
- Modify: `src/components/PromoPromptModal.tsx`
- Modify: `src/components/SubscriptionPaymentStatusModal.tsx`

**Context:** EPay returns to the backend's static `EPAY_BACK_LINK` (the app root, `?subscribePaymentStatus=true`) — **not** `/paywall`, and with **no** `orderId`. So `orderId` must be carried in `sessionStorage`, and the poll runs in the global `SubscriptionPaymentStatusModal` (which fires on the real landing page). `(app)` gate is the self-healing backstop.

- [ ] **Step 1: Create the order-status API wrapper**

Create `src/api/GET_orders_id.ts`:
```ts
import axiosInstance from '@/lib/axiosInstance';

export interface IOrderStatus {
  id: number;
  status: string;
  payment_status: string;
}

export const GET_orders_id = async (orderId: number | string): Promise<IOrderStatus> => {
  const { data } = await axiosInstance.get(`/orders/${orderId}`);
  return data;
};
```

- [ ] **Step 2: Stash `orderId` before handing off to EPay**

In `src/components/PromoPromptModal.tsx`, inside `pay(order)`, immediately before `window.halyk?.pay({` (~line 122, after `await ensurePaymentScript(order);`), add:
```ts
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('sb_checkout_order_id', String(order.orderId));
      } catch {
        // sessionStorage unavailable; the (app) gate remains the backstop.
      }
    }
```

- [ ] **Step 3: Make the global modal the poll owner**

Rewrite `src/components/SubscriptionPaymentStatusModal.tsx`. Add the order poll + an "activating" state. Replace the file body with:
```tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { refreshSubscriptionAndBalance } from '@/stores/subscriptionStore';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';
import { BottomSheetHeader } from '@/components/mobile/MobilePageHeader';
import { GET_orders_id } from '@/api/GET_orders_id';

const ORDER_ID_KEY = 'sb_checkout_order_id';
const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 12;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

async function pollOrderPaid(orderId: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    try {
      const order = await GET_orders_id(orderId);
      if (order.status === 'paid') return;
    } catch {
      // transient; keep polling
    }
    await delay(POLL_INTERVAL_MS);
  }
}

const SubscriptionPaymentStatusModalComponent = () => {
  const searchParams = useSearchParams();
  const { t: tPrices, tActions } = useCustomTranslations('pricesModal');
  const [isOpen, setIsOpen] = React.useState(false);
  const [status, setStatus] = React.useState<'success' | 'failure' | null>(null);
  const [isActivating, setIsActivating] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const statusParam = searchParams?.get('subscribePaymentStatus');
    if (!statusParam) return;

    const normalizedStatus = statusParam === 'true' || statusParam === 'success' ? 'success' : 'failure';
    setStatus(normalizedStatus);
    setIsOpen(true);

    const url = new URL(window.location.href);
    url.searchParams.delete('subscribePaymentStatus');
    window.history.replaceState(null, '', url.toString());

    if (normalizedStatus !== 'success') return;

    let cancelled = false;
    const orderId = window.sessionStorage.getItem(ORDER_ID_KEY);

    (async () => {
      setIsActivating(true);
      try {
        if (orderId) await pollOrderPaid(orderId);
        if (!cancelled) await refreshSubscriptionAndBalance();
      } catch {
        // refresh errors are non-fatal; the (app) gate re-resolves on next nav
      } finally {
        window.sessionStorage.removeItem(ORDER_ID_KEY);
        if (!cancelled) setIsActivating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setStatus(null);
    }
  }, []);

  if (!status) return null;

  const isSuccess = status === 'success';
  const title = isActivating
    ? tPrices('promo.activatingTitle', { defaultValue: 'Activating…' })
    : isSuccess
      ? tPrices('promo.paymentSuccessTitle')
      : tPrices('promo.paymentFailureTitle');
  const description = isActivating
    ? tPrices('promo.activating', { defaultValue: 'Confirming your payment, one moment…' })
    : isSuccess
      ? tPrices('promo.paymentSuccess')
      : tPrices('promo.paymentFailure');

  const confirmButton = isActivating ? null : (
    <button
      type='button'
      onClick={() => handleOpenChange(false)}
      className='mx-auto mt-[8rem] flex h-[48rem] w-[180rem] items-center justify-center rounded-full bg-d-green text-[16rem] font-semibold text-black transition hover:bg-d-green/80'
    >
      {tActions('ok')}
    </button>
  );

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onOpenChange={handleOpenChange}>
        <BottomSheetContent aria-labelledby='subscription-payment-status-title'>
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
            <BottomSheetHeader title={title} subtitle={description} closeLabel={tActions('ok')} onClose={() => handleOpenChange(false)} />
            <ScrollArea className='flex-1 px-[20rem]'>
              <div className='pb-[24rem] text-center'>
                <p className='text-[15rem] leading-tight text-d-black/80'>{description}</p>
              </div>
            </ScrollArea>
            <div className='border-t border-gray-100 bg-white/95 px-[20rem] pb-[calc(16rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-4px_16px_rgba(15,23,42,0.08)]'>
              {confirmButton}
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='fixed left-[50%] top-[50%] flex w-[90vw] max-w-[420rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-y-[16rem] rounded-[24rem] bg-white p-[32rem] text-center shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-[20rem] font-semibold'>{title}</DialogTitle>
          <DialogDescription className='text-[16rem] leading-tight text-d-black/80'>{description}</DialogDescription>
        </DialogHeader>
        {confirmButton}
      </DialogContent>
    </Dialog>
  );
};

export const SubscriptionPaymentStatusModal = withHydrationGuard(SubscriptionPaymentStatusModalComponent);
```
> Add the two new translation keys (`promo.activatingTitle`, `promo.activating`) to `messages/en.json` and `messages/ru.json` under the `pricesModal.promo` namespace; the `defaultValue` fallbacks above keep it working until then.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual verification (the highest-risk flow)**

Run `npm run dev` against the real (sandbox) backend. As an onboarded, not-entitled user: hit `/en/paywall`, choose a plan, complete EPay sandbox payment. Expected: you return to the app root → `/en/dashboard?subscribePaymentStatus=true`; the global modal shows "Activating…", polls `GET /orders/{id}` until `paid`, refreshes, and the dashboard stays (entitled). If the webhook is slow you may see a brief `/paywall` bounce that self-heals — acceptable. Also test the `?subscribePaymentStatus=false` failure path (cancel payment).

- [ ] **Step 6: Commit**

```bash
git add src/api/GET_orders_id.ts src/components/PromoPromptModal.tsx src/components/SubscriptionPaymentStatusModal.tsx messages/en.json messages/ru.json
git commit -m "feat: checkout-return — sessionStorage orderId + poll GET /orders/{id} in global modal"
```

---

## Task 13: Backend — disable welcome credits behind a flag (separate repo)

**Repo:** `/Users/max/Projects/studybox/backend` — branch separately: `git -C /Users/max/Projects/studybox/backend checkout -b feat/disable-welcome-credits`.

**Files:**
- Modify: `core/settings.py`
- Modify: `client/utils.py`
- Modify: `client/tests.py`

- [ ] **Step 1: Add the setting**

In `core/settings.py`, near the other `_env_bool` flags (e.g. `ANALYTICS_ENABLED` at ~line 264), add:
```python
WELCOME_CREDITS_ENABLED = _env_bool("WELCOME_CREDITS_ENABLED", False)
```

- [ ] **Step 2: Gate the grant**

In `client/utils.py`, make `grant_welcome_practice_credit` a no-op when disabled. Add `from django.conf import settings` (if not already imported) and an early return at the top of the function (currently ~line 85):
```python
def grant_welcome_practice_credit(client: Client) -> None:
    if not settings.WELCOME_CREDITS_ENABLED:
        return
    if client.got_free_welcome_test:
        return
    # ...existing body unchanged...
```

- [ ] **Step 3: Keep the grant-asserting tests green under the flag**

In `client/tests.py`, the tests asserting the welcome grant (~lines 52-53 and ~473-474, which assert `got_free_welcome_test` is True and `mock_balance == 1`) now require the flag on. Decorate those test methods (or their class) with:
```python
from django.test import override_settings

@override_settings(WELCOME_CREDITS_ENABLED=True)
def test_register_without_avatar(self):
    ...
```
Apply the decorator to every test that asserts the grant. (Scan the file for `got_free_welcome_test` / `mock_balance == 1` / `practice_balance` post-registration assertions.)

- [ ] **Step 4: Add a disabled-path test**

Add a test asserting no grant when the flag is off:
```python
@override_settings(WELCOME_CREDITS_ENABLED=False)
def test_no_welcome_credit_when_disabled(self):
    # register a fresh client the same way the other registration tests do, then:
    client.refresh_from_db()
    self.assertFalse(client.got_free_welcome_test)
    self.assertEqual(client.mock_balance, 0)
    self.assertEqual(client.practice_balance, 0)
```
(Model the registration setup on the existing registration tests in the file.)

- [ ] **Step 5: Run the backend tests**

Run: `cd /Users/max/Projects/studybox/backend && python manage.py test client`
Expected: all pass (grant tests pass via the override; the new disabled test passes).

- [ ] **Step 6: Commit**

```bash
git -C /Users/max/Projects/studybox/backend add core/settings.py client/utils.py client/tests.py
git -C /Users/max/Projects/studybox/backend commit -m "feat: gate welcome-credit grant behind WELCOME_CREDITS_ENABLED (default off)"
```

---

## Task 14: Full-funnel verification

**Files:** none (verification only).

- [ ] **Step 1: Run the unit suite**

Run: `cd /Users/max/Projects/studybox/frontend && npm test`
Expected: all `resolveStage` + `paths` tests pass.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds; route list shows `/[locale]/dashboard`, `/[locale]/onboarding`, `/[locale]/paywall`, etc.

- [ ] **Step 3: Walk the manual-QA matrix** (`npm run dev`, with `WELCOME_CREDITS_ENABLED=False` on the backend)

- [ ] New user: register → verify → land on `/onboarding` → complete → bounced to `/paywall` (no free option) → pay → reach app.
- [ ] Returning entitled user: login → straight to app; visiting `/onboarding` or `/paywall` bounces to `/dashboard`.
- [ ] Not-onboarded user: visiting `/paywall` or any `/dashboard` deep link bounces to `/onboarding`.
- [ ] Lapsed practice user (no sub, 0 practice credits): a reading/listening/writing **submit** 400 → app routes to `/paywall`; next navigation bounces to `/paywall`.
- [ ] Subscriber with 0 mock credits: starting a mock returns the mock 400 → app shows the in-app "get mock credits" flow, **not** the funnel paywall (no wrongful bounce).
- [ ] Deep link: logged-out `/dashboard/settings` → login → onboarding → paywall → after pay lands on `/dashboard/settings`.
- [ ] Checkout return: pay → app root `?subscribePaymentStatus=true` → "Activating…" → admitted; `=false` shows failure.
- [ ] Mobile UA: `/dashboard` (mobile) → `/m/stats` still works under the gate; desktop on `/m/*` → `/dashboard`.

- [ ] **Step 4: Finalize the branch**

Open a PR for `feat/funnel-gating` (frontend) and `feat/disable-welcome-credits` (backend). Note in the PR description that the backend flag must be set/confirmed (`WELCOME_CREDITS_ENABLED=False`) in each environment for the hard wall to take effect.

---

## Self-Review notes (author)

- **Spec coverage:** §3.1 zones → T5–7; §3.2 resolveStage/paths → T2–3; §3.3 gates → T6–7; §3.4 cache() → T4 (client `useFunnelStage` deferred as YAGNI, justified in File Structure); §3.5 next-threading → T7,T10; §3.6 paywall reuse → T8–9; §4.1 mock-vs-practice 400 → T14 QA; §4.2 checkout-return → T12; §5 backend flag → T13; §7 testing → T1–3,T14.
- **Type consistency:** `FunnelStage` (T2) consumed by `pathForStage`/`screenFromPath` (T3) and both gates (T6–7); `getMeCached`/`getSubscriptionCached`/`getBalanceCached` (T4) used identically in T6–7; `IOrderStatus.status === 'paid'` (T12) matches the backend `OrderStatus.PAID` string verified in the spec.
- **Known judgment calls:** the `PricingPlansView` extraction (T8) and paywall `demoIncludes`/`premiumIncludes` props (T9) reference the source component's contract rather than re-pasting ~130 lines verbatim — the engineer must match the extracted prop shape (typecheck enforces it).

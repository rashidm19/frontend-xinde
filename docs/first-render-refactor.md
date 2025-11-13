# First-Render Refactor Overview

## Architecture Summary

### Segment Groups
- `app/[locale]/(public)` contains pages that do not require authentication.
- `app/[locale]/(protected)` wraps all authenticated routes with a server-side guard.
- Segment groups keep URLs unchanged while ensuring the correct layout and guard are automatically applied.

### Server Guard Flow
1. The locale middleware prefixes the path while preserving method and query parameters.
2. Protected routes render through `(protected)/layout.tsx`, a Server Component.
3. The layout calls `getMe`, `getSubscription`, and `getBalance`, prefetches them into a shared `QueryClient`, then dehydrates the cache.
4. Missing users trigger an SSR redirect to `/{locale}/login`, preventing any client-side flash of unauthenticated UI.

### Hydration and Providers
- `src/app/_providers/Providers.tsx` renders the single `QueryClientProvider` and `HydrationBoundary`.
- `(protected)/layout.tsx` uses `HydrateOnly` to hydrate prefetched queries without introducing another provider.
- React Query defaults (staleTime 5 m, gcTime 30 m, no auto-refetch on mount/focus/reconnect, `retry = 1`) live in `lib/queryClient.ts`.
- Neutral skeletons (`SkeletonAvatar`, `SkeletonButton`, etc.) provide loading placeholders without triggering fetches.

### Cache-Only Gates
- `ensureAccess` and `useSubscriptionGate` read from the hydrated React Query cache via the shared `queryClient`.
- If subscription/balance data is absent, they return "no access" and optionally open the paywall without issuing network calls.

### Middleware
- `src/middleware.ts` performs locale prefixing only and skips redirects for non-GET/HEAD methods, static assets, `_next/*`, `/api/*`, and other excluded paths.
- Redirects set `NEXT_LOCALE` when missing to persist locale preference.

### Axios Deduplication
- `src/lib/api/http.ts` centralizes an Axios instance that deduplicates in-flight requests using a stable request key.
- All manual axios calls reuse this instance while React Query handles query-managed fetches separately.

## Operational Tips

### Adding a Protected Page
1. Place the page under `app/[locale]/(protected)`.
2. Prefetch required server data inside `(protected)/layout.tsx` using the shared `QueryClient` and pass the dehydrated state.
3. Client components should call `useQuery` with shared query keys so hydrated data is reused.

### Adding a Public Page
- Place the page under `app/[locale]/(public)` when no authentication is required.
- Use neutral skeletons if the page waits on client-only data.

### Prefetching Guidance
- Prefetch only stable, cacheable data inside the protected layout.
- For additional queries, reuse the `QueryClient` within `(protected)/layout.tsx` to prefetch and hydrate them.

### Avoiding Duplicate Providers
- Use `Providers` at the root (`app/[locale]/layout.tsx`) and `HydrateOnly` inside `(protected)/layout.tsx`.
- The runtime guard in `Providers` warns in development if more than one `QueryClientProvider` mounts.

### Axios Helpers
- Import the shared client via `import http from '@/lib/axiosInstance';`.
- Deduplication is automatic; identical concurrent requests reuse the same promise.

## Hardening Notes
- Development guard logs a warning if `Providers` mounts more than once.
- Locale middleware sets `NEXT_LOCALE` with `SameSite=Lax`, `secure` in production, and a 180-day `maxAge`.
- Axios dedup supports `meta.noDedup` to opt out, prunes stale entries after 15 seconds, and hashes `FormData` field names for stable keys.
- `getMe`, `getSubscription`, and `getBalance` throw `UpstreamServiceError` on 5xx; `(protected)/layout.tsx` renders a friendly fallback instead of redirecting to login.

## Troubleshooting

### Flash of Unauthenticated Content
- Confirm middleware and `(protected)/layout.tsx` are in place.
- Ensure the page resides under `(protected)` so the guard runs.

### Duplicate Fetches on First Render
- Verify the query key exists in `lib/queryKeys.ts` and the data is prefetched in `(protected)/layout.tsx`.
- Ensure client components rely on hydrated data using those query keys and avoid manual fetches on mount.

### Paywall Loop or Missing Access
- Ensure `ensureAccess` sees hydrated subscription/balance data.
- Confirm the shared axios client forwards auth headers and the backend responds as expected.

### Locale Redirect Issues
- Middleware only redirects GET/HEAD. Other methods must already include the locale prefix.
- If loops occur, check whether the incoming path already starts with `/en`, `/ru`, or `/zh`.

### QueryClient Provider Warnings
- A development console warning indicates multiple providers. Ensure only `Providers` wraps the tree and avoid creating new `QueryClient` instances inside features.

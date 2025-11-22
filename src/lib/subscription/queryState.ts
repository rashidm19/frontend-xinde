import type { QueryState } from '@tanstack/react-query';

export type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

export const deriveQueryStatus = (state?: QueryState<unknown, unknown>): SubscriptionStatus => {
  if (!state) {
    return 'idle';
  }

  if (state.status === 'success') {
    return 'success';
  }

  if (state.status === 'error') {
    return 'error';
  }

  if (state.fetchStatus === 'fetching' || state.fetchStatus === 'paused') {
    return 'loading';
  }

  return 'idle';
};

export const deriveQueryError = (state?: QueryState<unknown, unknown>): string | null => {
  if (!state || !state.error) {
    return null;
  }

  if (state.error instanceof Error) {
    return state.error.message;
  }

  if (typeof state.error === 'string') {
    return state.error;
  }

  return 'Unknown error';
};

'use client';

import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type HydrateOnlyProps = {
  children: ReactNode;
  state?: DehydratedState;
};

export default function HydrateOnly({ children, state }: HydrateOnlyProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}

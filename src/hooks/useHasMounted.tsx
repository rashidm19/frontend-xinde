'use client';

import React, { useEffect, useState, type ComponentType } from 'react';

export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};

export const withHydrationGuard = <P extends object>(Component: ComponentType<P>) => {
  const GuardedComponent = (props: P) => {
    const hasMounted = useHasMounted();

    if (!hasMounted) {
      return null;
    }

    return <Component {...props} />;
  };

  GuardedComponent.displayName = `withHydrationGuard(${Component.displayName ?? Component.name ?? 'Component'})`;

  return GuardedComponent;
};

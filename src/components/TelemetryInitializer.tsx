'use client';

import { useEffect, useState } from 'react';

import { usePageViewTracking } from '@/hooks/usePageViewTracking';
import { bootstrapTelemetry } from '@/lib/telemetry';
import type { TelemetryConfig } from '@/lib/telemetry/types';
import { useProfileStore } from '@/stores/profileStore';
import { API_URL, IS_NOT_PROD_ENV, IS_PROD_ENV } from '@/lib/config';

const CONFIG_ENDPOINT = new URL('/api/config', API_URL).toString();

const normalizeConfig = (input: unknown): TelemetryConfig => {
  const candidate = (input && typeof input === 'object' ? input : {}) as Partial<TelemetryConfig>;

  return {
    analyticsEnabled: Boolean(candidate.analyticsEnabled),
    posthogKey: typeof candidate.posthogKey === 'string' ? candidate.posthogKey : undefined,
    posthogHost: typeof candidate.posthogHost === 'string' ? candidate.posthogHost : undefined,
    otelEnabled: Boolean(candidate.otelEnabled),
    otelServiceName: typeof candidate.otelServiceName === 'string' ? candidate.otelServiceName : undefined,
    metricsEndpoint: typeof candidate.metricsEndpoint === 'string' ? candidate.metricsEndpoint : undefined,
    environment: typeof candidate.environment === 'string' ? candidate.environment : undefined,
  } satisfies TelemetryConfig;
};

const FALLBACK_CONFIG: TelemetryConfig = {
  analyticsEnabled: false,
  otelEnabled: false,
};

export const TelemetryInitializer = () => {
  const profile = useProfileStore(state => state.profile);
  const [config, setConfig] = useState<TelemetryConfig>(FALLBACK_CONFIG);

  usePageViewTracking(IS_PROD_ENV);

  useEffect(() => {
    let cancelled = false;

    if (IS_NOT_PROD_ENV) {
      return () => {
        cancelled = true;
      };
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch(CONFIG_ENDPOINT);

        if (!response.ok) {
          throw new Error(`Telemetry config request failed: ${response.status}`);
        }

        const json = await response.json();
        const normalized = normalizeConfig(json);

        if (!cancelled) {
          setConfig(normalized);
        }
      } catch (error) {
        if (IS_NOT_PROD_ENV) {
          console.debug('[telemetry] failed to load runtime config', error);
        }

        if (!cancelled) {
          setConfig(FALLBACK_CONFIG);
        }
      }
    };

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (IS_NOT_PROD_ENV) {
      if (IS_NOT_PROD_ENV && (config.analyticsEnabled || config.otelEnabled)) {
        console.warn('[telemetry] Ignoring enabled telemetry flags because the build is not production.');
      }
      return;
    }

    const userId = profile?.id;

    void bootstrapTelemetry({ config, user: userId ? { id: userId } : undefined });
  }, [config, profile?.id]);

  return null;
};

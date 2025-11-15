'use client';

import type { Tracer } from '@opentelemetry/api';
import { context, propagation, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

import { ANON_ID_STORAGE_KEY, ATTRIBUTION_STORAGE_KEY, TELEMETRY_GLOBAL_KEY, TELEMETRY_READY_EVENT } from './constants';
import { scrubProperties } from './scrub';
import type { BootstrapTelemetryParams, TelemetryConfig, TelemetryTrackProperties, TelemetryUser } from './types';
import type { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { IS_NOT_PROD_ENV, IS_PROD_ENV } from '@/lib/config';

type PosthogClient = typeof import('posthog-js').default;

type TelemetryState = {
  bootstrapPromise?: Promise<void>;
  analyticsReady: boolean;
  analyticsNoop: boolean;
  posthog?: PosthogClient;
  tracer?: Tracer;
  tracerProvider?: WebTracerProvider;
  config?: TelemetryConfig;
  fetchPatched: boolean;
  lastTraceId?: string;
  distinctId?: string;
  attributionId?: string | null;
};

const serverState: TelemetryState = {
  analyticsReady: false,
  analyticsNoop: true,
  fetchPatched: false,
};

const getState = (): TelemetryState => {
  if (typeof window === 'undefined') {
    return serverState;
  }

  const globalScope = window as unknown as { [TELEMETRY_GLOBAL_KEY]?: TelemetryState };

  if (!globalScope[TELEMETRY_GLOBAL_KEY]) {
    globalScope[TELEMETRY_GLOBAL_KEY] = {
      analyticsReady: false,
      analyticsNoop: IS_NOT_PROD_ENV,
      fetchPatched: false,
    } satisfies TelemetryState;
  }

  return globalScope[TELEMETRY_GLOBAL_KEY]!;
};

const isValidTraceId = (traceId?: string) => Boolean(traceId && traceId !== '00000000000000000000000000000000');

const getActiveTraceId = () => {
  const activeSpan = trace.getActiveSpan();
  const id = activeSpan?.spanContext().traceId;
  return isValidTraceId(id) ? id : undefined;
};

const getAttributionId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const state = getState();

  if (state.attributionId) {
    return state.attributionId;
  }

  try {
    const fromStorage = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);

    if (fromStorage) {
      state.attributionId = fromStorage;
      return fromStorage;
    }
  } catch (error) {
    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to read attribution id from storage', error);
    }
  }

  if (typeof document !== 'undefined') {
    const cookie = document.cookie.split('; ').find(part => part.startsWith(`${ATTRIBUTION_STORAGE_KEY}=`));

    if (cookie) {
      const [, value] = cookie.split('=');
      state.attributionId = value ?? null;
      return value ?? null;
    }
  }

  state.attributionId = null;
  return null;
};

const generateAnonId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
};

export const resolveDistinctId = (userId?: string | number | null): string => {
  if (userId != null) {
    return String(userId);
  }

  if (typeof window === 'undefined') {
    return 'anon:server';
  }

  try {
    const existing = window.localStorage.getItem(ANON_ID_STORAGE_KEY);

    if (existing) {
      return `anon:${existing}`;
    }

    const anon = generateAnonId();
    window.localStorage.setItem(ANON_ID_STORAGE_KEY, anon);
    return `anon:${anon}`;
  } catch (error) {
    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to access anon id storage', error);
    }

    return `anon:${generateAnonId()}`;
  }
};

const trackIdentity = (user: TelemetryUser | null | undefined) => {
  const state = getState();

  if (!state.posthog || state.analyticsNoop) {
    return;
  }

  const resolved = resolveDistinctId(user?.id);

  if (state.distinctId === resolved) {
    return;
  }

  try {
    state.posthog.identify(resolved);
    state.distinctId = resolved;
  } catch (error) {
    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to identify user', error);
    }
  }
};

const patchFetch = () => {
  if (IS_NOT_PROD_ENV) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const state = getState();

  if (state.fetchPatched) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  const headerSetter = {
    set: (carrier: Headers, key: string, value: string) => {
      carrier.set(key, value);
    },
  } as const;

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input as RequestInfo, init);
    const headers = new Headers(request.headers);
    const attributionId = getAttributionId();

    if (attributionId && !headers.has('X-Attribution-Id')) {
      headers.set('X-Attribution-Id', attributionId);
    }

    const tracedRequest = new Request(request, { headers });
    const tracer = state.tracer;

    if (!tracer) {
      return originalFetch(tracedRequest);
    }

    return tracer.startActiveSpan(`fetch:${tracedRequest.method.toUpperCase()} ${tracedRequest.url}`, { kind: SpanKind.CLIENT }, async span => {
      try {
        propagation.inject(trace.setSpan(context.active(), span), headers, headerSetter);

        const spanContext = span.spanContext();
        if (isValidTraceId(spanContext.traceId)) {
          state.lastTraceId = spanContext.traceId;
        }

        const response = await originalFetch(new Request(tracedRequest, { headers }));

        span.setAttribute('http.method', tracedRequest.method);
        span.setAttribute('http.url', tracedRequest.url);
        span.setAttribute('http.status_code', response.status);

        return response;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }) as typeof window.fetch;

  state.fetchPatched = true;
};

const registerTelemetryReady = () => {
  if (typeof window === 'undefined') {
    return;
  }

  console.info('METRICS ENABLED');
  window.dispatchEvent(new Event(TELEMETRY_READY_EVENT));
};

const initPosthog = async (config: TelemetryConfig, user: TelemetryUser | null | undefined) => {
  if (IS_NOT_PROD_ENV) {
    const state = getState();
    state.analyticsNoop = true;
    state.analyticsReady = false;
    return;
  }

  if (config.environment !== 'production') {
    const state = getState();
    state.analyticsNoop = true;
    state.analyticsReady = false;
    if (IS_NOT_PROD_ENV && (config.analyticsEnabled || config.otelEnabled)) {
      console.warn('[telemetry] Received telemetry config for non-production environment. Telemetry disabled.');
    }
    return;
  }

  if (!config.analyticsEnabled) {
    const state = getState();
    state.analyticsNoop = true;
    state.analyticsReady = false;
    return;
  }

  if (!config.posthogKey || !config.posthogHost) {
    console.warn('[telemetry] Analytics enabled but PostHog credentials are missing. Falling back to no-op mode.');
    const state = getState();
    state.analyticsNoop = true;
    state.analyticsReady = false;
    return;
  }

  const state = getState();

  if (state.posthog) {
    state.analyticsNoop = false;
    trackIdentity(user ?? null);
    return;
  }

  try {
    const posthogModule = await import('posthog-js');
    const posthog = posthogModule.default;

    state.posthog = posthog;
    state.analyticsNoop = false;

    posthog.init(config.posthogKey, {
      api_host: config.posthogHost,
      autocapture: false,
      capture_pageview: false,
      persistence: 'localStorage+cookie',
      sanitize_properties: scrubProperties,
      loaded: client => {
        try {
          client.register({ environment: config.environment ?? 'unknown' });
        } catch (error) {
          if (IS_NOT_PROD_ENV) {
            console.debug('[telemetry] failed to register base properties', error);
          }
        }

        state.analyticsReady = true;
        trackIdentity(user ?? null);
        registerTelemetryReady();
      },
    });
  } catch (error) {
    state.analyticsNoop = true;

    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to initialize PostHog', error);
    }
  }
};

const normalizeTraceExporterUrl = (url: string | undefined) => {
  if (!url) {
    return undefined;
  }

  const trimmed = url.replace(/\/$/, '');

  if (trimmed.endsWith('/v1/traces')) {
    return trimmed;
  }

  return `${trimmed}/v1/traces`;
};

const initTracer = async (config: TelemetryConfig) => {
  if (IS_NOT_PROD_ENV) {
    return;
  }

  if (config.environment !== 'production' || !config.otelEnabled) {
    return;
  }

  const state = getState();

  if (state.tracer) {
    return;
  }

  try {
    const [webModule, baseModule, exporterModule, resourcesModule, semanticModule, coreModule] = await Promise.all([
      import('@opentelemetry/sdk-trace-web'),
      import('@opentelemetry/sdk-trace-base'),
      import('@opentelemetry/exporter-trace-otlp-http'),
      import('@opentelemetry/resources'),
      import('@opentelemetry/semantic-conventions'),
      import('@opentelemetry/core'),
    ]);

    const { WebTracerProvider } = webModule;
    const { BatchSpanProcessor } = baseModule;
    const { OTLPTraceExporter } = exporterModule;
    const { Resource } = resourcesModule;
    const { SemanticResourceAttributes } = semanticModule;
    const { W3CTraceContextPropagator } = coreModule;

    const provider = config.otelServiceName
      ? new WebTracerProvider({
          resource: Resource.default().merge(
            new Resource({
              [SemanticResourceAttributes.SERVICE_NAME]: config.otelServiceName,
            })
          ),
        })
      : new WebTracerProvider();

    const exporterUrl = normalizeTraceExporterUrl(config.metricsEndpoint);

    if (exporterUrl) {
      provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter({ url: exporterUrl })));
    }

    provider.register({
      propagator: new W3CTraceContextPropagator(),
    });

    state.tracerProvider = provider;
    state.tracer = provider.getTracer(config.otelServiceName ?? 'studybox-web');

    patchFetch();
  } catch (error) {
    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to initialize tracer', error);
    }
  }
};

export const bootstrapTelemetry = async ({ config, user }: BootstrapTelemetryParams): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  const state = getState();
  state.config = config;

  if (IS_NOT_PROD_ENV) {
    state.analyticsNoop = true;
    state.analyticsReady = false;

    if (IS_NOT_PROD_ENV && (config.analyticsEnabled || config.otelEnabled)) {
      console.warn('[telemetry] Telemetry flags enabled but build is non-production. Skipping initialization.');
    }

    return;
  }

  if (config.environment !== 'production') {
    state.analyticsNoop = true;
    state.analyticsReady = false;

    if (IS_NOT_PROD_ENV && (config.analyticsEnabled || config.otelEnabled)) {
      console.warn('[telemetry] Telemetry config environment is not production. Skipping initialization.');
    }

    return;
  }

  if (state.bootstrapPromise) {
    try {
      await state.bootstrapPromise;
      trackIdentity(user ?? null);
    } catch (error) {
      if (IS_NOT_PROD_ENV) {
        console.debug('[telemetry] bootstrap retry failed', error);
      }
    }
    return;
  }

  state.bootstrapPromise = (async () => {
    await Promise.all([initPosthog(config, user ?? null), initTracer(config)]);

    patchFetch();
  })();

  try {
    await state.bootstrapPromise;
  } finally {
    state.bootstrapPromise = undefined;
  }
};

export const track = (event: string, props: TelemetryTrackProperties = {}) => {
  if (!event || typeof event !== 'string') {
    return;
  }

  if (IS_NOT_PROD_ENV) {
    return;
  }

  const state = getState();

  if (state.config?.environment !== 'production' || !state.analyticsReady || state.analyticsNoop || !state.posthog) {
    return;
  }

  try {
    const attributionId = getAttributionId();
    const traceId = getActiveTraceId() ?? state.lastTraceId;
    const payload = scrubProperties({
      ...props,
      trace_id: traceId,
      attribution_id: attributionId ?? undefined,
      environment: state.config?.environment,
    });

    state.posthog.capture(event, payload);
  } catch (error) {
    if (IS_NOT_PROD_ENV) {
      console.debug('[telemetry] failed to capture event', error);
    }
  }
};

export const telemetryReady = () => {
  const state = getState();
  if (IS_NOT_PROD_ENV) {
    return false;
  }

  return state.config?.environment === 'production' && state.analyticsReady && !state.analyticsNoop && Boolean(state.posthog);
};

export const currentTraceId = () => {
  const state = getState();
  return state.lastTraceId ?? getActiveTraceId();
};

export const refreshAttributionId = () => {
  const state = getState();
  state.attributionId = null;
  return getAttributionId();
};

export const resetTelemetryForTests = () => {
  const state = getState();

  state.analyticsReady = false;
  state.analyticsNoop = false;
  state.posthog = undefined;
  state.tracer = undefined;
  state.tracerProvider = undefined;
  state.fetchPatched = false;
  state.lastTraceId = undefined;
  state.bootstrapPromise = undefined;
  state.distinctId = undefined;
  state.attributionId = null;
};

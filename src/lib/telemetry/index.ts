import { IS_PROD_ENV } from '@/lib/config';
import type { BootstrapTelemetryParams, TelemetryTrackProperties } from './types';

type TelemetryRuntimeModule = typeof import('./runtime');
type RuntimeFunctionKey = keyof TelemetryRuntimeModule;

export { resolveDistinctId } from './distinct-id';

let runtimePromise: Promise<TelemetryRuntimeModule> | null = null;
let runtimeModule: TelemetryRuntimeModule | null = null;
const shouldLoadTelemetryRuntime = () => IS_PROD_ENV && typeof window !== 'undefined';

const loadTelemetryRuntime = (): Promise<TelemetryRuntimeModule> | null => {
  if (!shouldLoadTelemetryRuntime()) {
    return null;
  }

  if (!runtimePromise) {
    runtimePromise = import('./runtime').then(module => {
      runtimeModule = module;
      return module;
    });
  }

  return runtimePromise;
};

const callRuntime = async <K extends RuntimeFunctionKey>(method: K, ...args: Parameters<TelemetryRuntimeModule[K]>) => {
  if (!shouldLoadTelemetryRuntime()) {
    return undefined;
  }

  const runtime = await loadTelemetryRuntime();

  if (!runtime) {
    return undefined;
  }

  return runtime[method](...args);
};

const queueRuntimeCall = <K extends RuntimeFunctionKey>(method: K, ...args: Parameters<TelemetryRuntimeModule[K]>) => {
  if (!shouldLoadTelemetryRuntime()) {
    return;
  }

  void callRuntime(method, ...args).catch(error => {
    console.error('[telemetry] failed to load runtime module', error);
  });
};

export const bootstrapTelemetry = async ({ config, user }: BootstrapTelemetryParams): Promise<void> => {
  if (!shouldLoadTelemetryRuntime()) {
    return;
  }

  await callRuntime('bootstrapTelemetry', { config, user });
};

export const track = (event: string, props: TelemetryTrackProperties = {}) => {
  if (!event || typeof event !== 'string') {
    return;
  }

  if (!shouldLoadTelemetryRuntime()) {
    return;
  }

  if (runtimeModule) {
    runtimeModule.track(event, props);
    return;
  }

  queueRuntimeCall('track', event, props);
};

export const telemetryReady = () => {
  if (!shouldLoadTelemetryRuntime() || !runtimeModule) {
    return false;
  }

  return runtimeModule.telemetryReady();
};

export const currentTraceId = () => {
  if (!shouldLoadTelemetryRuntime() || !runtimeModule) {
    return undefined;
  }

  return runtimeModule.currentTraceId();
};

export const refreshAttributionId = () => {
  if (!shouldLoadTelemetryRuntime()) {
    return null;
  }

  if (runtimeModule) {
    return runtimeModule.refreshAttributionId();
  }

  queueRuntimeCall('refreshAttributionId');
  return null;
};

export const resetTelemetryForTests = () => {
  if (!shouldLoadTelemetryRuntime()) {
    return;
  }

  if (runtimeModule) {
    runtimeModule.resetTelemetryForTests();
    return;
  }

  queueRuntimeCall('resetTelemetryForTests');
};

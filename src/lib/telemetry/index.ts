import { IS_PROD_ENV } from '@/lib/config';
import type { BootstrapTelemetryParams, TelemetryTrackProperties } from './types';

type TelemetryRuntimeModule = typeof import('./runtime');
type RuntimeFunctionKey = {
  [K in keyof TelemetryRuntimeModule]: TelemetryRuntimeModule[K] extends (...args: any[]) => unknown ? K : never;
}[keyof TelemetryRuntimeModule];
type RuntimeFunction<K extends RuntimeFunctionKey> = TelemetryRuntimeModule[K] extends (...args: infer A) => infer R ? (...args: A) => R : never;

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

export const resolveRuntimeFunction = async <K extends RuntimeFunctionKey>(method: K): Promise<RuntimeFunction<K> | null> => {
  if (!shouldLoadTelemetryRuntime()) {
    return null;
  }

  const runtime = runtimeModule ?? (await loadTelemetryRuntime());

  if (!runtime) {
    return null;
  }

  return runtime[method] as RuntimeFunction<K>;
};

const callRuntime = async <K extends RuntimeFunctionKey>(method: K, ...args: Parameters<RuntimeFunction<K>>) => {
  const runtimeFn = await resolveRuntimeFunction(method);

  if (!runtimeFn) {
    return undefined;
  }

  return runtimeFn(...args);
};

const queueRuntimeCall = <K extends RuntimeFunctionKey>(method: K, ...args: Parameters<RuntimeFunction<K>>) => {
  void resolveRuntimeFunction(method)
    .then(runtimeFn => {
      if (!runtimeFn) {
        return;
      }

      runtimeFn(...args);
    })
    .catch(error => {
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

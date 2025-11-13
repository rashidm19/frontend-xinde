import axios, { type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { API_URL } from '@/lib/config';

const INFLIGHT_TTL_MS = 15_000;

type InFlightEntry = {
  promise: Promise<AxiosResponse>;
  timeoutId: ReturnType<typeof setTimeout>;
};

const inFlightRequests = new Map<string, InFlightEntry>();

const isFormData = (value: unknown): value is FormData => typeof FormData !== 'undefined' && value instanceof FormData;

const isURLSearchParams = (value: unknown): value is URLSearchParams => typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;

const isReadableStream = (value: unknown): boolean => typeof ReadableStream !== 'undefined' && value instanceof ReadableStream;

const isBlob = (value: unknown): boolean => typeof Blob !== 'undefined' && value instanceof Blob;

const stableStringify = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`);

  return `{${entries.join(',')}}`;
};

const serializeData = (data: unknown): string => {
  if (data === undefined || data === null) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (isFormData(data)) {
    const parts: string[] = [];

    data.forEach((value, key) => {
      const descriptor = typeof value === 'string'
        ? 'string'
        : value instanceof Blob
          ? value.type || 'blob'
          : typeof value;

      parts.push(`${key}:${descriptor}`);
    });

    parts.sort();

    return `form-data:${parts.join('|')}`;
  }

  if (isURLSearchParams(data)) {
    return data.toString();
  }

  if (isBlob(data) || isReadableStream(data)) {
    return `[${data.constructor.name}]`;
  }

  return stableStringify(data);
};

const resolveUrl = (config: InternalAxiosRequestConfig): string => {
  const rawUrl = config.url ?? '';

  try {
    if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith('//')) {
      return rawUrl;
    }

    if (config.baseURL) {
      return new URL(rawUrl, config.baseURL).toString();
    }
  } catch (error) {
    console.warn('Failed to resolve request URL for deduplication.', error);
  }

  return rawUrl;
};

export const buildRequestKey = (config: InternalAxiosRequestConfig): string | null => {
  const method = (config.method ?? 'get').toUpperCase();
  const url = resolveUrl(config);

  if (!url) {
    return null;
  }

  const paramsString = config.params ? stableStringify(config.params) : '';
  const dataString = serializeData(config.data);

  return `${method} ${url}?params=${paramsString}&data=${dataString}`;
};

/**
 * Shared Axios instance that deduplicates identical in-flight requests so parallel calls reuse the same promise.
 */
export const http = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const resolveAdapter = (adapter?: typeof http.defaults.adapter): AxiosAdapter | null => {
  if (!adapter) {
    return null;
  }

  try {
    return axios.getAdapter(adapter);
  } catch (error) {
    console.warn('Failed to resolve axios adapter for deduplication.', error);
    return null;
  }
};

const baseAdapter = resolveAdapter(http.defaults.adapter) ?? resolveAdapter(axios.defaults.adapter);

if (baseAdapter) {
  http.defaults.adapter = config => {
    const meta = (config as InternalAxiosRequestConfig & { meta?: { noDedup?: boolean } }).meta;
    if (meta?.noDedup) {
      return baseAdapter(config);
    }

    const key = buildRequestKey(config);

    if (!key) {
      return baseAdapter(config);
    }

    const existingEntry = inFlightRequests.get(key);
    if (existingEntry) {
      return existingEntry.promise;
    }

    const timeoutId = setTimeout(() => {
      inFlightRequests.delete(key);
    }, INFLIGHT_TTL_MS);

    const finalize = () => {
      const entry = inFlightRequests.get(key);
      if (entry) {
        clearTimeout(entry.timeoutId);
        inFlightRequests.delete(key);
      }
    };

    const requestPromise = baseAdapter(config)
      .then(response => {
        finalize();
        return response;
      })
      .catch(error => {
        finalize();
        throw error;
      });

    inFlightRequests.set(key, { promise: requestPromise, timeoutId });

    return requestPromise;
  };
} else {
  console.warn('Axios default adapter was not found; request deduplication is disabled.');
}

http.interceptors.request.use(config => {
  const headers = config.headers ?? {};

  const setHeader = (key: string, value?: string) => {
    const maybeHeaders = headers as unknown as {
      set?: (name: string, value: string) => void;
      delete?: (name: string) => void;
      [key: string]: unknown;
    };

    if (value === undefined) {
      if (maybeHeaders.delete) {
        maybeHeaders.delete(key);
      } else {
        delete maybeHeaders[key];
      }
      return;
    }

    if (maybeHeaders.set) {
      maybeHeaders.set(key, value);
    } else {
      maybeHeaders[key] = value;
    }
  };

  const hasHeader = (key: string) => {
    const maybeHeaders = headers as unknown as {
      has?: (name: string) => boolean;
      get?: (name: string) => string | null;
      [key: string]: unknown;
    };

    if (maybeHeaders.has) {
      return maybeHeaders.has(key);
    }

    if (maybeHeaders.get) {
      return !!maybeHeaders.get(key);
    }

    return key in maybeHeaders;
  };

  if (isFormData(config.data)) {
    setHeader('Content-Type', undefined);
  } else if (!hasHeader('Content-Type')) {
    setHeader('Content-Type', 'application/json');
  }

  if (!hasHeader('Authorization')) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      setHeader('Authorization', `Bearer ${token}`);
    }
  }

  config.headers = headers;

  return config;
});

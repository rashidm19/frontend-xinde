import axios from 'axios';
import { API_URL } from './config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(config => {
  const headers = config.headers ?? {};
  const setHeader = (key: string, value?: string) => {
    const maybeHeaders = headers as unknown as {
      set?: (name: string, value: string) => void;
      delete?: (name: string) => void;
      [key: string]: any;
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
      [key: string]: any;
    };

    if (maybeHeaders.has) {
      return maybeHeaders.has(key);
    }

    if (maybeHeaders.get) {
      return !!maybeHeaders.get(key);
    }

    return key in maybeHeaders;
  };

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
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

export default axiosInstance;

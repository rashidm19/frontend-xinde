export const API_URL = 'https://api.studybox.kz';
// export const API_URL = 'http://localhost:8080';
export const EPAY_TEST_URL = 'https://test-epay.homebank.kz/payform/payment-api.js';
export const EPAY_PROD_URL = 'https://epay.homebank.kz/payform/payment-api.js';

export const ENABLE_CAPTCHA = undefined;
export const CAPTCHA_PROVIDER = 'CAPTCHA_PROVIDER';
export const CAPTCHA_SITE_KEY = 'CAPTCHA_SITE_KEY';
export const CAPTCHA_THRESHOLD = 'CAPTCHA_THRESHOLD';

// ENVIRONMENTS
export const NODE_ENV = process.env.NODE_ENV;
export const NEXT_PUBLIC_ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

// Продакшен: и локально, и на клиенте, и на сервере
export const IS_PROD_BUILD = NODE_ENV === 'production';

// Условные флаги окружения на клиенте (если заведёшь переменную в Vercel)
export const IS_DEV_ENV = NEXT_PUBLIC_ENVIRONMENT === 'development' || NEXT_PUBLIC_ENVIRONMENT === 'dev';
export const IS_PREVIEW_ENV = NEXT_PUBLIC_ENVIRONMENT === 'preview';
export const IS_PROD_ENV = NEXT_PUBLIC_ENVIRONMENT === 'production';

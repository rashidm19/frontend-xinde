const DEFAULT_LOCALE = 'en-US';
const DEFAULT_TIME_ZONE = 'UTC';

type DateInput = string | number | Date | null | undefined;

const isDateInstance = (value: unknown): value is Date => value instanceof Date;

const parseDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (isDateInstance(value)) {
    return new Date(value.getTime());
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function formatDateTime(value: DateInput, locale: string = DEFAULT_LOCALE, options: Intl.DateTimeFormatOptions = {}): string | null {
  const targetDate = parseDate(value);

  if (!targetDate) {
    return null;
  }

  const fallbackLocale = locale || DEFAULT_LOCALE;
  const resolvedOptions: Intl.DateTimeFormatOptions = { ...options };

  if (!resolvedOptions.timeZone) {
    resolvedOptions.timeZone = DEFAULT_TIME_ZONE;
  }

  try {
    return new Intl.DateTimeFormat(fallbackLocale, resolvedOptions).format(targetDate);
  } catch (_error) {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, resolvedOptions).format(targetDate);
  }
}

export function formatNumber(value: number | null | undefined, locale: string = DEFAULT_LOCALE, options: Intl.NumberFormatOptions = {}): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  const fallbackLocale = locale || DEFAULT_LOCALE;

  try {
    return new Intl.NumberFormat(fallbackLocale, options).format(value);
  } catch (_error) {
    return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value);
  }
}

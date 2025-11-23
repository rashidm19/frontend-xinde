const LOGIN_SEGMENT = '/login';

function normalizeLocale(locale: string) {
  return locale.trim().toLowerCase();
}

function normalizePathTarget(target: string) {
  return target.trim();
}

export function sanitizeNextPath(target: string | null | undefined, locale: string): string | null {
  if (!target) {
    return null;
  }

  const normalizedTarget = normalizePathTarget(target);

  if (!normalizedTarget.startsWith('/')) {
    return null;
  }

  if (normalizedTarget.startsWith('//')) {
    return null;
  }

  const normalizedLocale = normalizeLocale(locale);
  const normalizedTargetLower = normalizedTarget.toLowerCase();
  const localePrefix = `/${normalizedLocale}`;

  if (!normalizedTargetLower.startsWith(localePrefix)) {
    return null;
  }

  const loginPath = `${localePrefix}${LOGIN_SEGMENT}`;

  if (normalizedTargetLower === loginPath) {
    return null;
  }

  if (normalizedTargetLower.startsWith(`${loginPath}?`)) {
    return null;
  }

  return normalizedTarget;
}

import { FORBIDDEN_KEYS, MAX_PROPERTY_LENGTH } from './constants';

const forbiddenKeySet = new Set(FORBIDDEN_KEYS.map(key => key.toLowerCase()));

type Carrier = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const sanitizeString = (value: string) => {
  if (value.length <= MAX_PROPERTY_LENGTH) {
    return value;
  }

  return value.slice(0, MAX_PROPERTY_LENGTH);
};

const scrubArray = (value: unknown[]): unknown[] | undefined => {
  const result: unknown[] = [];

  for (const item of value) {
    const scrubbed = scrubValue(item);

    if (scrubbed !== undefined) {
      result.push(scrubbed);
    }
  }

  return result.length ? result : undefined;
};

const scrubObject = (value: Carrier): Carrier | undefined => {
  const result: Carrier = {};

  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeySet.has(key.toLowerCase())) {
      continue;
    }

    const scrubbed = scrubValue(child);

    if (scrubbed !== undefined) {
      result[key] = scrubbed;
    }
  }

  return Object.keys(result).length ? result : undefined;
};

export const scrubValue = (value: unknown): unknown => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (typeof value === 'number') {
    if (Number.isFinite(value)) {
      return value;
    }

    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return sanitizeString(value.toISOString());
  }

  if (Array.isArray(value)) {
    return scrubArray(value);
  }

  if (isPlainObject(value)) {
    return scrubObject(value);
  }

  return undefined;
};

export const scrubProperties = (props: Carrier): Carrier => {
  const result: Carrier = {};

  for (const [key, value] of Object.entries(props)) {
    if (forbiddenKeySet.has(key.toLowerCase())) {
      continue;
    }

    const scrubbed = scrubValue(value);

    if (scrubbed !== undefined) {
      result[key] = scrubbed;
    }
  }

  return result;
};

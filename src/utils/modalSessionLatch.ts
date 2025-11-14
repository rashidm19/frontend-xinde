const buildStorageKey = (key: string, version: number | string) => `modal_seen::${key}::${version}`;

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn('[modalSessionLatch] sessionStorage unavailable', error);
    return null;
  }
};

export const hasSeenModal = (key: string, version: number | string): boolean => {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }

  const storageKey = buildStorageKey(key, version);
  return storage.getItem(storageKey) === '1';
};

export const markModalAsSeen = (key: string, version: number | string): void => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(buildStorageKey(key, version), '1');
  } catch (error) {
    console.warn('[modalSessionLatch] Failed to persist latch', error);
  }
};

export const clearModalSeenFlags = (): void => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith('modal_seen::')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      storage.removeItem(key);
    });
  } catch (error) {
    console.warn('[modalSessionLatch] Failed to clear modal flags', error);
  }
};

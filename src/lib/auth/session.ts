'use client';

const SESSION_ENDPOINT = '/api/auth/session';

const postJson = async (input: unknown) => {
  return fetch(SESSION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });
};

export const persistAuthToken = async (token: string) => {
  try {
    const response = await postJson({ token });

    if (!response.ok) {
      throw new Error(`Failed to persist auth session: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to persist auth session', error);
  }
};

export const clearAuthToken = async () => {
  try {
    const response = await fetch(SESSION_ENDPOINT, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to clear auth session: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to clear auth session', error);
  }
};

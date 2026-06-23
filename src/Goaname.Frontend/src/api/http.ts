import { getAccessToken } from './auth';
import { parseJsonResponse, readErrorMessage } from './client';

interface ApiFetchOptions {
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true } = options;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<T>(response);
}

export async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, init, { auth: false });
}

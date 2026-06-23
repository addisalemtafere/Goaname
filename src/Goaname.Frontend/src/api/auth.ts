export const TENANT_ID = 'demo';

export interface AuthResponse {
  accessToken: string;
  userId: string;
  tenantId: string;
  displayName: string;
  email: string;
  expiresAt: string;
}

const TOKEN_KEY = 'goaname.accessToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

import { parseJsonResponse, readErrorMessage } from './client';

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return parseJsonResponse<T>(response);
}

export async function register(
  displayName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const result = await authFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ tenantId: TENANT_ID, displayName, email, password }),
  });
  setAccessToken(result.accessToken);
  return result;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await authFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ tenantId: TENANT_ID, email, password }),
  });
  setAccessToken(result.accessToken);
  return result;
}

export function logout(): void {
  clearAccessToken();
}

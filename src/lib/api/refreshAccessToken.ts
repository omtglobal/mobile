import axios from 'axios';
import { API_BASE_URL, API_PREFIX } from '~/constants/config';
import { getAuthToken, notifyTokenRefreshed } from '~/lib/api/authToken';
import { tokenStorage } from '~/lib/utils/tokenStorage';
import type { ApiResponse } from '~/types/api';
import type { AuthResponse } from '~/types/models';

const BASE_URL = `${API_BASE_URL}${API_PREFIX}`;

/** Refresh if access token expires within this many milliseconds. */
const REFRESH_MARGIN_MS = 120_000;

export async function refreshAccessToken(): Promise<string> {
  const t = getAuthToken();
  const res = await axios.post<ApiResponse<AuthResponse>>(`${BASE_URL}/auth/refresh`, null, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    timeout: 10000,
  });
  const payload = res.data?.data;
  if (!payload?.access_token) {
    throw new Error('Invalid refresh response');
  }
  notifyTokenRefreshed(payload.access_token, payload.expires_in);
  return payload.access_token;
}

/**
 * Proactively refresh before the access token expires so short JWT TTL does not
 * force logout while the app stays open or returns from background.
 */
export async function ensureAccessTokenFresh(): Promise<void> {
  if (!getAuthToken()) return;
  const expiresAt = await tokenStorage.getExpiresAt();
  if (expiresAt == null) return;
  if (Date.now() < expiresAt - REFRESH_MARGIN_MS) return;
  try {
    await refreshAccessToken();
  } catch {
    // Keep current token; the 401 interceptor may still recover.
  }
}

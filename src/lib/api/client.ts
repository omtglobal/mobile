import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { API_BASE_URL, API_PREFIX } from '~/constants/config';
import { getAuthToken, setAuthToken, notifySessionExpired, notifyTokenRefreshed } from './authToken';
import { clearQueryCacheOnLogout } from './queryClientRef';
import type { ApiResponse } from '~/types/api';

const BASE_URL = `${API_BASE_URL}${API_PREFIX}`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request: attach JWT from token ref (set by auth store)
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = getAuthToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// Request: send Accept-Language from user's language preference
const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: 'en-GB',
  zh: 'zh-CN',
  uk: 'uk-UA',
  it: 'it-IT',
  ru: 'ru-RU',
};

let getLanguage: (() => string) | null = null;

export function setLanguageGetter(getter: () => string): void {
  getLanguage = getter;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const lang = getLanguage?.() ?? 'en';
  const locale = LANGUAGE_TO_LOCALE[lang] ?? 'en-GB';
  config.headers['Accept-Language'] = locale;
  return config;
});

// Response: 401 → refresh then retry or redirect to login
let isRefreshing = false;
type Queued = { resolve: (token: string) => void; reject: (err: unknown) => void };
let failedQueue: Queued[] = [];

async function refreshToken(): Promise<string> {
  const t = getAuthToken();
  const res = await axios.post<ApiResponse<{ access_token: string }>>(
    `${BASE_URL}/auth/refresh`,
    null,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      timeout: 10000,
    }
  );
  const newToken = res.data.data.access_token;
  setAuthToken(newToken);
  return newToken;
}

function onAuthFailure(): void {
  setAuthToken(null);
  clearQueryCacheOnLogout();
  notifySessionExpired();
  router.replace('/(auth)/login');
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        notifyTokenRefreshed(newToken);
        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        failedQueue.forEach(({ reject }) => reject(error));
        failedQueue = [];
        onAuthFailure();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Retry with exponential backoff for 5xx and 429
apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
  const status = error.response?.status;
  if ((status === 429 || (status != null && status >= 500)) && config && (config._retryCount ?? 0) < 2) {
    config._retryCount = (config._retryCount ?? 0) + 1;
    const delay = Math.pow(2, config._retryCount) * 1000;
    await new Promise((r) => setTimeout(r, delay));
    return apiClient(config);
  }
  return Promise.reject(error);
});

/** Health check */
export function healthCheck(): Promise<ApiResponse<{ status: string; api: string; demo_mode?: boolean }>> {
  return apiClient.get('/health').then((r) => r.data);
}

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ninhao_access_token';
const EXPIRES_AT_KEY = 'ninhao_access_expires_at';

export const tokenStorage = {
  getToken: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),

  setToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(TOKEN_KEY, token),

  removeToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      /* noop */
    }
    try {
      await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
    } catch {
      /* noop */
    }
  },

  getExpiresAt: async (): Promise<number | null> => {
    const s = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
    if (s == null || s === '') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  },

  setExpiresAt: (expiresAtMs: number): Promise<void> =>
    SecureStore.setItemAsync(EXPIRES_AT_KEY, String(Math.floor(expiresAtMs))),
};

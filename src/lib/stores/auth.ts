import { AxiosError } from 'axios';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { setAuthToken, registerSessionExpiredCallback, registerTokenRefreshedCallback } from '~/lib/api/authToken';
import { clearQueryCacheOnLogout } from '~/lib/api/queryClientRef';
import { authApi } from '~/lib/api/auth';
import { ensureAccessTokenFresh } from '~/lib/api/refreshAccessToken';
import { tokenStorage } from '~/lib/utils/tokenStorage';
import { mmkvStorage } from '~/lib/utils/storage';
import type { LoginData, RegisterData, User } from '~/types/models';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  setHydrated: () => void;
  setToken: (token: string | null, expiresInSec?: number) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  fetchUser: () => Promise<void>;
  deleteAccount: (data?: { password?: string; reason?: string }) => Promise<void>;
}

async function syncTokenToClient(token: string | null, expiresInSec?: number): Promise<void> {
  setAuthToken(token);
  if (token) {
    await tokenStorage.setToken(token);
    if (expiresInSec != null && expiresInSec > 0) {
      await tokenStorage.setExpiresAt(Date.now() + expiresInSec * 1000);
    }
  } else {
    await tokenStorage.removeToken();
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      setToken: async (token, expiresInSec) => {
        await syncTokenToClient(token, expiresInSec);
        set({ token, ...(token ? { isHydrated: true } : {}) });
      },

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(data);
          const token = res.data.access_token;
          await syncTokenToClient(token, res.data.expires_in);
          set({
            token,
            user: res.data.user,
            isLoading: false,
            isHydrated: true,
          });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          const token = res.data.access_token;
          await syncTokenToClient(token, res.data.expires_in);
          set({
            token,
            user: res.data.user,
            isLoading: false,
            isHydrated: true,
          });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        await syncTokenToClient(null);
        set({ token: null, user: null });
        clearQueryCacheOnLogout();
        void authApi.logout().catch(() => {
          // Best-effort server revoke; session already cleared locally
        });
      },

      clearSession: async () => {
        await syncTokenToClient(null);
        set({ token: null, user: null });
        clearQueryCacheOnLogout();
      },

      deleteAccount: async (data) => {
        const { token } = get();
        if (!token) throw new Error('Not authenticated');
        set({ isLoading: true });
        try {
          await authApi.deleteAccount(data ?? {});
        } finally {
          // Whatever the server response, wipe local state so the user is never
          // left with a dangling session pointing at a deleted account.
          await syncTokenToClient(null);
          set({ token: null, user: null, isLoading: false });
          clearQueryCacheOnLogout();
        }
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await authApi.me();
          set({ user: res.data });
        } catch (e) {
          const status = e instanceof AxiosError ? e.response?.status : undefined;
          if (status === 401) {
            await get().clearSession();
          }
          throw e;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist non-sensitive user profile data. The JWT token is kept
      // exclusively in the Keychain/Keystore via expo-secure-store, which is
      // the only appropriate storage for credentials on mobile.
      partialize: (state) => ({ user: state.user }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState && typeof persistedState === 'object' ? persistedState : {}),
        // isHydrated stays false until SecureStore resolves in onRehydrateStorage
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          useAuthStore.getState().setHydrated();
          return;
        }
        // Restore token from the Keychain (source of truth). This is async, so
        // isHydrated is set to true only after the read completes, preventing
        // auth-gated screens from rendering before the token is available.
        void (async () => {
          try {
            const token = await tokenStorage.getToken();
            if (!token) {
              useAuthStore.getState().setHydrated();
              return;
            }
            setAuthToken(token);
            useAuthStore.setState({ token });
            await ensureAccessTokenFresh();
            useAuthStore.setState({ isHydrated: true });
          } catch {
            useAuthStore.getState().setHydrated();
          }
        })();
      },
    }
  )
);

registerSessionExpiredCallback(() => {
  useAuthStore.getState().clearSession().catch(() => {});
});

registerTokenRefreshedCallback((newToken, expiresInSec) => {
  useAuthStore.getState().setToken(newToken, expiresInSec).catch(() => {});
});

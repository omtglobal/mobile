import { useEffect } from 'react';
import { AppState } from 'react-native';
import { ensureAccessTokenFresh } from '~/lib/api/refreshAccessToken';
import { useAuthStore } from '~/lib/stores/auth';

/**
 * Verifies session on app start. Call from root layout.
 * Refreshes the JWT before expiry while the app is open or returns from background.
 * Only clears session on 401 from /auth/me. Network/server errors are ignored.
 */
export function SessionCheck() {
  const token = useAuthStore((s) => s.token);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      await ensureAccessTokenFresh();
      if (cancelled) return;
      await fetchUser().catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [token, fetchUser]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      if (!useAuthStore.getState().token) return;
      void (async () => {
        await ensureAccessTokenFresh();
        await useAuthStore.getState().fetchUser().catch(() => {});
      })();
    });
    return () => sub.remove();
  }, []);

  return null;
}

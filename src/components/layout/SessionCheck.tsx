import { useEffect } from 'react';
import { useAuthStore } from '~/lib/stores/auth';

/**
 * Verifies session on app start. Call from root layout.
 * Only clears session on auth errors (401/403). Network/server errors
 * are silently ignored to prevent losing auth when the server is temporarily unreachable.
 */
export function SessionCheck() {
  const token = useAuthStore((s) => s.token);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (!token) return;
    fetchUser().catch(() => {
      // fetchUser already clears session on 401/403.
      // Other errors (network, 5xx) are ignored to preserve the session.
    });
  }, [token, fetchUser]);

  return null;
}

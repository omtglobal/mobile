import { useAuthStore } from '~/lib/stores/auth';

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearSession = useAuthStore((s) => s.clearSession);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  return {
    isAuthenticated: !!token,
    isHydrated,
    token,
    user,
    isLoading,
    login,
    register,
    logout,
    clearSession,
    fetchUser,
  };
}

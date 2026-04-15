/**
 * Token ref for API client interceptors.
 * Auth store sets this on login/refresh/clear to avoid circular dependency.
 */
let token: string | null = null;

export function getAuthToken(): string | null {
  return token;
}

export function setAuthToken(value: string | null): void {
  token = value;
}

/** Callback invoked by the API interceptor when auth fails irrecoverably. */
let _onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredCallback(cb: () => void): void {
  _onSessionExpired = cb;
}

export function notifySessionExpired(): void {
  _onSessionExpired?.();
}

/** Callback invoked after a successful token refresh so the store can persist it. */
let _onTokenRefreshed: ((newToken: string) => void) | null = null;

export function registerTokenRefreshedCallback(cb: (newToken: string) => void): void {
  _onTokenRefreshed = cb;
}

export function notifyTokenRefreshed(newToken: string): void {
  _onTokenRefreshed?.(newToken);
}

import { useCallback, useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '~/lib/api/auth';
import type { ApiResponse } from '~/types/api';
import type { AuthResponse, LoginData } from '~/types/models';

const BIO_CREDENTIALS_KEY = 'ninhao_bio_credentials';
const BIO_ENABLED_KEY = 'ninhao_biometric_enabled';

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const checkAvailability = useCallback(async () => {
    const [compatible, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    setIsAvailable(Boolean(compatible && enrolled));

    const enabled = await SecureStore.getItemAsync(BIO_ENABLED_KEY);
    setIsEnabled(enabled === 'true');
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in to Ninhao',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  }, []);

  const enableBiometric = useCallback(async (email: string, password: string) => {
    if (!SecureStore.canUseBiometricAuthentication()) {
      throw new Error('Biometric authentication is not available');
    }
    await SecureStore.setItemAsync(
      BIO_CREDENTIALS_KEY,
      JSON.stringify({ email, password }),
      { requireAuthentication: true, authenticationPrompt: 'Confirm to save' }
    );
    await SecureStore.setItemAsync(BIO_ENABLED_KEY, 'true');
    setIsEnabled(true);
  }, []);

  const disableBiometric = useCallback(async () => {
    await SecureStore.deleteItemAsync(BIO_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIO_ENABLED_KEY);
    setIsEnabled(false);
  }, []);

  const loginWithBiometric = useCallback(async (): Promise<ApiResponse<AuthResponse>> => {
    const ok = await authenticate();
    if (!ok) throw new Error('Biometric authentication failed');

    const stored = await SecureStore.getItemAsync(BIO_CREDENTIALS_KEY, {
      requireAuthentication: true,
      authenticationPrompt: 'Sign in to Ninhao',
    });
    if (!stored) throw new Error('No stored credentials');

    const { email, password } = JSON.parse(stored) as LoginData;
    return authApi.login({ email, password });
  }, [authenticate]);

  return {
    isAvailable,
    isEnabled,
    authenticate,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
    checkAvailability,
  };
}

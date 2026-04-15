import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ninhao_access_token';

export const tokenStorage = {
  getToken: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
};

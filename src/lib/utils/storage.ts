import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkv = createMMKV({ id: 'ninhao-app' });

/**
 * Zustand persist storage adapter using MMKV.
 * Use with createJSONStorage(() => mmkvStorage).
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return mmkv.getString(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    mmkv.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkv.remove(name);
  },
};

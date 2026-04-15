import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '~/lib/utils/storage';

type ThemeMode = 'light' | 'dark' | 'system';
type LanguageCode = 'en' | 'ru' | 'zh' | 'uk' | 'it';

interface PreferencesState {
  theme: ThemeMode;
  language: LanguageCode;
  biometricEnabled: boolean;
  accentColor: string;
  chatWallpaperId: string | null;
  fontId: string;

  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageCode) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setAccentColor: (color: string) => void;
  setChatWallpaperId: (id: string | null) => void;
  setFontId: (id: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      biometricEnabled: false,
      accentColor: '#FF6B00',
      chatWallpaperId: 'ph-abstract',
      fontId: 'system',

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      setAccentColor: (color) => set({ accentColor: color }),
      setChatWallpaperId: (id) => set({ chatWallpaperId: id }),
      setFontId: (id) => set({ fontId: id }),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

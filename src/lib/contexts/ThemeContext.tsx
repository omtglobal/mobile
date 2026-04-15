import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { lightTheme, darkTheme, lightColors, type AppTheme } from '~/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

const ThemeContext = createContext<AppTheme | null>(null);

const DEFAULT_ACCENT = lightColors.brandPrimary;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themePreference = usePreferencesStore((s) => s.theme);
  const accentColor = usePreferencesStore((s) => s.accentColor);

  const theme = useMemo(() => {
    const effective: 'light' | 'dark' =
      themePreference === 'system'
        ? systemScheme === 'dark'
          ? 'dark'
          : 'light'
        : themePreference;
    const base = effective === 'dark' ? darkTheme : lightTheme;

    if (accentColor && accentColor !== DEFAULT_ACCENT) {
      return {
        ...base,
        colors: {
          ...base.colors,
          brandPrimary: accentColor,
          badgeChoice: accentColor,
        },
      };
    }
    return base;
  }, [themePreference, systemScheme, accentColor]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  return ctx ?? lightTheme;
}

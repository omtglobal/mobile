import { useEffect } from 'react';
import i18n from '~/i18n';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { setLanguageGetter } from '~/lib/api/client';

// Wire up the language getter once at module load so API requests
// always include the current language as Accept-Language.
setLanguageGetter(() => usePreferencesStore.getState().language);

/**
 * Syncs preferences.language to i18next.
 * Must be mounted inside a provider that has access to persisted preferences.
 */
export function I18nSync() {
  const language = usePreferencesStore((s) => s.language);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return null;
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import uk from './locales/uk.json';
import it from './locales/it.json';

export type LanguageCode = 'en' | 'ru' | 'zh' | 'uk' | 'it';

export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

function detectLanguage(): LanguageCode {
  const tag = Localization.getLocales()[0]?.languageCode ?? 'en';
  if (tag === 'zh') return 'zh';
  if (tag === 'uk') return 'uk';
  if (tag === 'it') return 'it';
  if (tag === 'ru') return 'ru';
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    zh: { translation: zh },
    uk: { translation: uk },
    it: { translation: it },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

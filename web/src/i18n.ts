import dayjs from 'dayjs';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translationEN from './assets/locales/en/translation.json';
import translationFR from './assets/locales/fr/translation.json';
import translationJA from './assets/locales/ja/translation.json';

export const i18n = i18next;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      debug: false,
      fallbackLng: ['en', 'fr', 'ja'],
      supportedLngs: ['en', 'fr', 'ja'],
      keySeparator: false,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      compatibilityJSON: 'v4',
      resources: {
        fr: {
          translation: translationFR,
        },
        en: {
          translation: translationEN,
        },
        ja: {
          translation: translationJA,
        },
      },
      saveMissing: true, // must be enabled
      missingKeyHandler: () => {},
    },
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      dayjs.locale(i18n.language);
    }
  );


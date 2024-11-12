import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Get all translation files dynamically
const translationFiles = import.meta.glob('./locales/*.json', { eager: true });

// Transform the files into the required format
const resources = Object.entries(translationFiles).reduce((acc, [path, translation]) => {
  const lang = path.match(/\.\/locales\/(\w+)\.json/)[1];
  acc[lang] = { translation };
  return acc;
}, {});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n; 
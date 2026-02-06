import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import translationEN from "./locales/en/translation.json";
import translationAM from "./locales/am/translation.json";
import translationTI from "./locales/ti/translation.json";
import translationAR from "./locales/ar/translation.json";
import translationES from "./locales/es/translation.json";
import translationFR from "./locales/fr/translation.json";
import translationSO from "./locales/so/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  am: {
    translation: translationAM,
  },
  ti: {
    translation: translationTI,
  },
  ar: {
    translation: translationAR,
  },
  es: {
    translation: translationES,
  },
  fr: {
    translation: translationFR,
  },
  so: {
    translation: translationSO,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
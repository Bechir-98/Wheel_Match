import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import fr from './fr.json';

const stored = (() => {
  try {
    return localStorage.getItem('wm-lang');
  } catch {
    return null;
  }
})();

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: stored || (navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(lng) {
  try {
    localStorage.setItem('wm-lang', lng);
  } catch {
    /* ignore */
  }
  return i18n.changeLanguage(lng);
}

export default i18n;

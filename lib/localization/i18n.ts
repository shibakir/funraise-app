import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

// import translations files
import enTranslations from './translations/en.json';
import csTranslations from './translations/cs.json';

// translations resources - добавляем пространство имен translation
const resources = {
  en: { translation: enTranslations },
  cs: { translation: csTranslations },
};

// get device language
const deviceLanguage = getLocales()[0]?.languageCode || 'en';

// function to get stored language
const getStoredLanguage = async () => {
  try {
    const storedLanguage = await SecureStore.getItemAsync('app_language');
    return storedLanguage || deviceLanguage;
  } catch (error) {
    console.error('Error loading language from storage:', error);
    return deviceLanguage;
  }
};

// function to save selected language
export const saveLanguage = async (language: string) => {
  try {
    await SecureStore.setItemAsync('app_language', language);
  } catch (error) {
    console.error('Error saving language to storage:', error);
  }
};

// function to change language
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  saveLanguage(language);
};

// initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // disable Suspense to avoid issues with initial render
    },
  });

// asynchronously update language after loading from SecureStore
(async () => {
  try {
    const storedLanguage = await getStoredLanguage();
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  } catch (error) {
    console.error('Failed to load language from storage:', error);
  }
})();

export default i18n; 
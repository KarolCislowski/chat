import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TranslationDictionary, translations, UiLanguage } from "../i18n/translations";

type LanguageState = {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  t: TranslationDictionary;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) =>
        set({
          language,
          t: translations[language],
        }),
      t: translations.en,
    }),
    {
      name: "chat-language",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLanguage(state.language);
        }
      },
      partialize: (state) => ({
        language: state.language,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

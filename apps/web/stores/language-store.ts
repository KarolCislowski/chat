import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TranslationDictionary, translations, UiLanguage } from "../i18n/translations";

/** Persisted language state shared by the shell and localized pages. */
type LanguageState = {
  language: UiLanguage;
  /**
   * Selects the active UI language and swaps the active translation dictionary.
   *
   * @param language - Supported language code.
   * @returns Nothing.
   */
  setLanguage: (language: UiLanguage) => void;
  t: TranslationDictionary;
};

/** Persisted Zustand store for the active UI language and dictionary. */
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

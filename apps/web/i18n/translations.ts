import { en } from "./locales/en";
import { pl } from "./locales/pl";
import { sv } from "./locales/sv";

export type UiLanguage = "en" | "sv" | "pl";
export type TranslationKey = keyof typeof en;
export type TranslationDictionary = Record<TranslationKey, string>;

export const languageLabels: Record<UiLanguage, string> = {
  en: "English",
  sv: "Svenska",
  pl: "Polski",
};

export const translations = {
  en,
  sv,
  pl,
} satisfies Record<UiLanguage, TranslationDictionary>;

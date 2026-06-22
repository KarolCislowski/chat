import { en } from "./locales/en";
import { pl } from "./locales/pl";
import { sv } from "./locales/sv";

/** Supported UI language codes used by the language selector and profile preference. */
export type UiLanguage = "en" | "sv" | "pl";

/** Translation keys are derived from the English dictionary as the source shape. */
export type TranslationKey = keyof typeof en;

/** Complete dictionary required by every locale. */
export type TranslationDictionary = Record<TranslationKey, string>;

/** Human-readable names for language selector options. */
export const languageLabels: Record<UiLanguage, string> = {
  en: "English",
  sv: "Svenska",
  pl: "Polski",
};

/** Locale dictionaries keyed by supported language code. */
export const translations = {
  en,
  sv,
  pl,
} satisfies Record<UiLanguage, TranslationDictionary>;

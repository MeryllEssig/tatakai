export type SupportedLanguage = 'fr' | 'en' | 'ja'

export type Messages = Record<string, string>

export type TranslationDictionaries = Partial<Record<SupportedLanguage, Messages>>

/**
 * Small helper to translate a key for a given language.
 * If no dictionary or entry is found, it falls back to the key itself.
 */
export function translate(
  dictionaries: TranslationDictionaries | undefined,
  language: SupportedLanguage,
  key: string,
): string {
  const dict = dictionaries?.[language]
  if (!dict) return key

  return dict[key] ?? key
}

import { createContext, useContext } from 'react'
import type { SupportedLanguage } from '../../lib/i18n'
import type { LanguagePreference } from '../../lib/language-preference'

export interface I18nContextValue {
  language: SupportedLanguage
  t: (key: string) => string
  setLanguage: (language: SupportedLanguage) => void
  preference: LanguagePreference
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)

  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return ctx
}

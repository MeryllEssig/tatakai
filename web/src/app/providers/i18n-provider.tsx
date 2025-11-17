import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { translate, type SupportedLanguage, type TranslationDictionaries } from '../../lib/i18n'
import {
  resolveLanguagePreference,
  saveLanguageToStorage,
  type LanguagePreference,
  type SimpleStorage,
} from '../../lib/language-preference'
import { getStorage } from '../../features/persistence/local-storage-adapter'
import type { I18nContextValue } from './i18n-context'
import { I18nContext } from './i18n-context'

interface I18nProviderProps {
  children: ReactNode
  dictionaries?: TranslationDictionaries
  fallbackLanguage?: SupportedLanguage
}

export function I18nProvider({ children, dictionaries, fallbackLanguage = 'en' }: I18nProviderProps) {
  const [preference, setPreference] = useState<LanguagePreference>(() => {
    let storage: SimpleStorage | null = null

    try {
      storage = getStorage()
    } catch {
      storage = null
    }

    return resolveLanguagePreference({
      storage,
      fallback: fallbackLanguage,
    })
  })

  const t = useMemo(() => {
    return (key: string) => translate(dictionaries, preference.code, key)
  }, [dictionaries, preference.code])

  const setLanguage = (language: SupportedLanguage) => {
    setPreference({
      code: language,
      source: 'localStorage',
    })

    try {
      const storage = getStorage()
      saveLanguageToStorage(storage, language)
    } catch {
      // Ignore storage errors in setter as well.
    }
  }

  const value: I18nContextValue = useMemo(
    () => ({
      language: preference.code,
      t,
      setLanguage,
      preference,
    }),
    [preference, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

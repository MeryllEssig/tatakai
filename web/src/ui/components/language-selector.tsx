import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from './select'
import type { SupportedLanguage } from '../../lib/i18n'
import { saveLanguageToStorage } from '../../lib/language-preference'
import { getStorage } from '../../features/persistence/local-storage-adapter'

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ja', label: '🇯🇵 日本語' },
]

interface LanguageSelectorProps {
  className?: string
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { i18n } = useTranslation()

  const rawLanguage = i18n.language || 'en'
  const normalizedLanguage = (rawLanguage.split('-')[0] ?? 'en') as SupportedLanguage
  const currentLanguage = LANGUAGE_OPTIONS.some((option) => option.code === normalizedLanguage)
    ? normalizedLanguage
    : 'en'

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const next = event.target.value as SupportedLanguage
    if (next === currentLanguage) return

    void i18n.changeLanguage(next)

    try {
      const storage = getStorage()
      saveLanguageToStorage(storage, next)
    } catch {
      // Ignore storage errors; the detector will still handle browser language.
    }
  }

  return (
    <Select
      className={className ?? 'w-40 text-xs'}
      value={currentLanguage}
      onChange={handleChange}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}

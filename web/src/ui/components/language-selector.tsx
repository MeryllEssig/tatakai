import { Select } from '@/components/retroui/Select'
import { useTranslation } from 'react-i18next'
import { getStorage } from '../../features/persistence/local-storage-adapter'
import type { SupportedLanguage } from '../../lib/i18n'
import { saveLanguageToStorage } from '../../lib/language-preference'

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string }[] = [
  { code: 'fr', label: '🇫🇷' },
  { code: 'en', label: '🇬🇧' },
  { code: 'ja', label: '🇯🇵' },
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

  const handleChange = (next: SupportedLanguage): void => {
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
    <Select value={currentLanguage} onValueChange={handleChange}>
      <Select.Trigger className={className ?? 'w-20 min-w-20 text-xs'}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content className={className ?? 'w-20 min-w-20 text-xs'}>
        <Select.Group>
          {LANGUAGE_OPTIONS.map((option) => (
            <Select.Item key={option.code} value={option.code}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select>
  )
}

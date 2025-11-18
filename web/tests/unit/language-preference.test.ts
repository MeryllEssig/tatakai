import { describe, expect, it } from 'vitest'
import {
  loadLanguageFromStorage,
  resolveLanguagePreference,
  type SimpleStorage,
} from '../../src/lib/language-preference'
import type { SupportedLanguage } from '../../src/lib/i18n'

class InMemoryStorage implements SimpleStorage {
  private data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  clear(): void {
    this.data.clear()
  }
}

const STORAGE_KEY = 'tatakai:language'

function setStoredValue(storage: InMemoryStorage, value: unknown) {
  if (typeof value === 'string') {
    storage.setItem(STORAGE_KEY, value)
  } else {
    storage.setItem(STORAGE_KEY, JSON.stringify(value))
  }
}

describe('loadLanguageFromStorage', () => {
  it('returns null when storage is missing', () => {
    const language = loadLanguageFromStorage(null)
    expect(language).toBeNull()
  })

  it('returns null when key is not present', () => {
    const storage = new InMemoryStorage()
    const language = loadLanguageFromStorage(storage)
    expect(language).toBeNull()
  })

  it('loads a simple string language code', () => {
    const storage = new InMemoryStorage()
    setStoredValue(storage, 'fr')

    const language = loadLanguageFromStorage(storage)
    expect(language).toBe('fr')
  })

  it('normalizes region-specific codes to their base language', () => {
    const storage = new InMemoryStorage()
    setStoredValue(storage, 'fr-FR')

    const language = loadLanguageFromStorage(storage)
    expect(language).toBe('fr')
  })

  it('resolves language from a JSON object with a code property', () => {
    const storage = new InMemoryStorage()
    setStoredValue(storage, { code: 'ja' })

    const language = loadLanguageFromStorage(storage)
    expect(language).toBe('ja')
  })

  it('returns null for unsupported stored languages', () => {
    const storage = new InMemoryStorage()
    setStoredValue(storage, 'de')

    const language = loadLanguageFromStorage(storage)
    expect(language).toBeNull()
  })

  it('falls back to parsing the raw string if JSON parsing fails', () => {
    const storage = new InMemoryStorage()
    storage.setItem(STORAGE_KEY, '{not-json')

    const language = loadLanguageFromStorage(storage)
    expect(language).toBeNull()
  })
})

describe('resolveLanguagePreference', () => {
  const makeOptions = (options: {
    stored?: SupportedLanguage | string | null
    browserLanguages?: string[]
    fallback?: SupportedLanguage
  }) => {
    const storage = new InMemoryStorage()

    if (options.stored !== undefined) {
      if (options.stored === null) {
        storage.clear()
      } else {
        setStoredValue(storage, options.stored)
      }
    }

    return {
      storage,
      browserLanguages: options.browserLanguages,
      fallback: options.fallback,
    }
  }

  it('prefers stored language over browser and fallback (FR-205 #1)', () => {
    const { storage } = makeOptions({ stored: 'fr' })

    const preference = resolveLanguagePreference({ storage, browserLanguages: ['en-US'] })

    expect(preference.code).toBe('fr')
    expect(preference.source).toBe('localStorage')
  })

  it('uses browser language when storage is empty (FR-205 #2)', () => {
    const { storage } = makeOptions({ stored: null })

    const preference = resolveLanguagePreference({
      storage,
      browserLanguages: ['ja-JP', 'en-US'],
      fallback: 'en',
    })

    expect(preference.code).toBe('ja')
    expect(preference.source).toBe('browser')
  })

  it('uses the first supported browser language in the list', () => {
    const { storage } = makeOptions({ stored: null })

    const preference = resolveLanguagePreference({
      storage,
      browserLanguages: ['de-DE', 'fr-FR', 'en-US'],
      fallback: 'en',
    })

    expect(preference.code).toBe('fr')
    expect(preference.source).toBe('browser')
  })

  it('falls back when neither storage nor browser provide a supported language (FR-205 #3)', () => {
    const { storage } = makeOptions({ stored: null })

    const preference = resolveLanguagePreference({
      storage,
      browserLanguages: ['de-DE', 'es-ES'],
      fallback: 'en',
    })

    expect(preference.code).toBe('en')
    expect(preference.source).toBe('fallback')
  })

  it('defaults fallback to en when not provided explicitly', () => {
    const { storage } = makeOptions({ stored: null })

    const preference = resolveLanguagePreference({
      storage,
      browserLanguages: [],
    })

    expect(preference.code).toBe('en')
    expect(preference.source).toBe('fallback')
  })

  it('ignores unsupported stored language and still allows browser detection', () => {
    const storage = new InMemoryStorage()
    setStoredValue(storage, 'de')

    const preference = resolveLanguagePreference({
      storage,
      browserLanguages: ['ja-JP'],
      fallback: 'en',
    })

    expect(preference.code).toBe('ja')
    expect(preference.source).toBe('browser')
  })
})

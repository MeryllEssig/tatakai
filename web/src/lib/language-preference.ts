import type { SupportedLanguage } from './i18n'

export type LanguagePreferenceSource = 'localStorage' | 'browser' | 'fallback'

export interface LanguagePreference {
  code: SupportedLanguage
  source: LanguagePreferenceSource
}

export interface SimpleStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const STORAGE_KEY = 'tatakai:language'
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['fr', 'en', 'ja']

function normalizeLanguage(candidate: string | null | undefined): SupportedLanguage | null {
  if (!candidate) return null

  const lower = candidate.toLowerCase()
  const base = lower.split('-')[0]

  return SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)
    ? (base as SupportedLanguage)
    : null
}

function parseStoredLanguage(raw: string | null): SupportedLanguage | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed === 'string') {
      return normalizeLanguage(parsed)
    }

    if (parsed && typeof parsed === 'object' && 'code' in parsed) {
      const value = (parsed as { code?: unknown }).code
      if (typeof value === 'string') {
        return normalizeLanguage(value)
      }
    }
  } catch {
    // If JSON parsing fails, fall back to treating the raw string as a code.
    return normalizeLanguage(raw)
  }

  return null
}

export function loadLanguageFromStorage(storage: SimpleStorage | null | undefined): SupportedLanguage | null {
  if (!storage) return null

  const raw = storage.getItem(STORAGE_KEY)
  return parseStoredLanguage(raw)
}

export function saveLanguageToStorage(
  storage: SimpleStorage | null | undefined,
  code: SupportedLanguage,
): void {
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ code }))
  } catch {
    // Ignore storage errors (e.g. quota exceeded, private mode restrictions).
  }
}

export interface ResolveLanguagePreferenceOptions {
  storage?: SimpleStorage | null
  browserLanguages?: readonly string[]
  fallback?: SupportedLanguage
}

function detectBrowserLanguage(browserLanguages?: readonly string[]): SupportedLanguage | null {
  const sources: string[] = []

  if (browserLanguages !== undefined) {
    // When browserLanguages is provided (even an empty array), use it as the
    // complete set of candidates and do not fall back to the global navigator.
    sources.push(...browserLanguages)
  } else if (typeof navigator !== 'undefined') {
    if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      sources.push(...navigator.languages)
    } else if (navigator.language) {
      sources.push(navigator.language)
    }
  }

  for (const candidate of sources) {
    const normalized = normalizeLanguage(candidate)
    if (normalized) return normalized
  }

  return null
}

export function resolveLanguagePreference(
  options: ResolveLanguagePreferenceOptions = {},
): LanguagePreference {
  const fallback: SupportedLanguage = options.fallback ?? 'en'

  const fromStorage = loadLanguageFromStorage(options.storage ?? null)
  if (fromStorage) {
    return {
      code: fromStorage,
      source: 'localStorage',
    }
  }

  const fromBrowser = detectBrowserLanguage(options.browserLanguages)
  if (fromBrowser) {
    return {
      code: fromBrowser,
      source: 'browser',
    }
  }

  return {
    code: fallback,
    source: 'fallback',
  }
}

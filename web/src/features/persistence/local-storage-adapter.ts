import type { GameData, TournamentSummary } from '../../lib/domain/types'

export interface StorageBackend {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
  readonly length: number
}

const inMemoryStorage = (() => {
  const map = new Map<string, string>()

  const backend: StorageBackend = {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null
    },
    setItem(key, value) {
      map.set(key, value)
    },
    removeItem(key) {
      map.delete(key)
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null
    },
    get length() {
      return map.size
    },
  }

  return backend
})()

export function getStorage(backend?: StorageBackend): StorageBackend {
  if (backend) return backend

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return inMemoryStorage
}

export function tournamentStorageKey(id: string): string {
  // `id` is expected to be the normalized tournament name (alphanumeric, no spaces),
  // and is used directly as the storage key.
  return id
}

function isValidGameData(value: unknown): value is GameData {
  if (!value || typeof value !== 'object') return false

  const data = value as GameData

  if (typeof data.id !== 'string') return false
  if (!Array.isArray(data.players) || !Array.isArray(data.games)) return false

  return true
}

export function saveTournament(gameData: GameData, backend?: StorageBackend): void {
  const storage = getStorage(backend)
  const key = tournamentStorageKey(gameData.id)
  const serialized = JSON.stringify(gameData)
  const backupKey = `${key}-backup`

  // Write backup first, then primary, to reduce chances of ending up with two corrupted entries.
  storage.setItem(backupKey, serialized)
  storage.setItem(key, serialized)
}

export function loadTournament(id: string, backend?: StorageBackend): GameData | null {
  const storage = getStorage(backend)
  const key = tournamentStorageKey(id)
  const backupKey = `${key}-backup`

  const value = storage.getItem(key)

  if (value) {
    try {
      const parsed = JSON.parse(value) as GameData
      if (isValidGameData(parsed)) {
        return parsed
      }
    } catch {
      // Fall through to backup.
    }
  }

  const backupValue = storage.getItem(backupKey)

  if (!backupValue) return null

  try {
    const parsedBackup = JSON.parse(backupValue) as GameData
    if (isValidGameData(parsedBackup)) {
      return parsedBackup
    }
  } catch {
    return null
  }

  return null
}

export function deleteTournament(id: string, backend?: StorageBackend): void {
  const storage = getStorage(backend)
  const key = tournamentStorageKey(id)
  const backupKey = `${key}-backup`

  storage.removeItem(key)
  storage.removeItem(backupKey)
}

export function listStoredTournamentSummaries(backend?: StorageBackend): TournamentSummary[] {
  const storage = getStorage(backend)
  const summaries: TournamentSummary[] = []

  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (!key || key.endsWith('-backup')) continue

    const value = storage.getItem(key)
    if (!value) continue

    try {
      const data = JSON.parse(value) as GameData
      const lastGame = data.games[data.games.length - 1]

      summaries.push({
        id: data.id,
        name: data.name,
        playerCount: data.players.length,
        gameCount: data.games.length,
        lastGameDate: lastGame ? lastGame.createdAt : null,
      })
    } catch {
      continue
    }
  }

  return summaries
}

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

export function saveTournament(gameData: GameData, backend?: StorageBackend): void {
  const storage = getStorage(backend)
  const key = tournamentStorageKey(gameData.id)
  const serialized = JSON.stringify(gameData)
  storage.setItem(key, serialized)
}

export function loadTournament(id: string, backend?: StorageBackend): GameData | null {
  const storage = getStorage(backend)
  const key = tournamentStorageKey(id)
  const value = storage.getItem(key)

  if (!value) return null

  try {
    const parsed = JSON.parse(value) as GameData
    return parsed
  } catch {
    return null
  }
}

export function deleteTournament(id: string, backend?: StorageBackend): void {
  const storage = getStorage(backend)
  const key = tournamentStorageKey(id)
  storage.removeItem(key)
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

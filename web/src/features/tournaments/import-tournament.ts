import type { GameData } from '../../lib/domain/types'
import type { StorageBackend } from '../persistence/local-storage-adapter'
import { saveTournament } from '../persistence/local-storage-adapter'

function assertIsGameDataLike(value: unknown): asserts value is GameData {
  if (!value || typeof value !== 'object') {
    throw new Error('JSON must describe an object')
  }

  const data = value as Partial<GameData>

  if (typeof data.id !== 'string' || data.id.trim() === '') {
    throw new Error('Imported JSON is missing a valid "id" field')
  }

  if (typeof data.name !== 'string' || data.name.trim() === '') {
    throw new Error('Imported JSON is missing a valid "name" field')
  }

  if (!Array.isArray(data.players) || !Array.isArray(data.games)) {
    throw new Error('Imported JSON must contain "players" and "games" arrays')
  }
}

export function importTournamentFromJson(
  raw: string,
  backend?: StorageBackend,
): GameData {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid JSON: could not parse input')
  }

  assertIsGameDataLike(parsed)

  const gameData = parsed as GameData

  // Persist tournament. If a tournament with the same id already exists, it will be overwritten.
  saveTournament(gameData, backend)

  return gameData
}

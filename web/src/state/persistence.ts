import type { PrimitiveAtom, WritableAtom } from 'jotai'
import type { GameData } from '../lib/domain/types'
import { currentTournamentIdAtom, gameDataAtom } from './atoms'
import type { StorageBackend } from '../features/persistence/local-storage-adapter'
import {
  getStorage,
  loadTournament,
  saveTournament,
} from '../features/persistence/local-storage-adapter'

const LAST_OPENED_TOURNAMENT_KEY = 'tournament-last-opened'

export function loadLastOpenedTournamentId(backend?: StorageBackend): string | null {
  const storage = getStorage(backend)
  const value = storage.getItem(LAST_OPENED_TOURNAMENT_KEY)
  return value ?? null
}

export function saveLastOpenedTournamentId(
  id: string | null,
  backend?: StorageBackend,
): void {
  const storage = getStorage(backend)

  if (id == null) {
    storage.removeItem(LAST_OPENED_TOURNAMENT_KEY)
  } else {
    storage.setItem(LAST_OPENED_TOURNAMENT_KEY, id)
  }
}

export interface TournamentStateSnapshot {
  currentTournamentId: string | null
  gameData: GameData | null
}

export function loadInitialTournamentState(
  backend?: StorageBackend,
): TournamentStateSnapshot {
  const lastOpenedId = loadLastOpenedTournamentId(backend)

  if (!lastOpenedId) {
    return { currentTournamentId: null, gameData: null }
  }

  const data = loadTournament(lastOpenedId, backend)

  if (!data) {
    return { currentTournamentId: null, gameData: null }
  }

  return { currentTournamentId: lastOpenedId, gameData: data }
}

export function persistTournamentState(
  snapshot: TournamentStateSnapshot,
  backend?: StorageBackend,
): void {
  const { currentTournamentId, gameData } = snapshot

  saveLastOpenedTournamentId(currentTournamentId, backend)

  if (gameData && currentTournamentId && gameData.id === currentTournamentId) {
    saveTournament(gameData, backend)
  }
}

export type AtomGetter = <Value>(
  anAtom: PrimitiveAtom<Value> | WritableAtom<Value, unknown[], unknown>,
) => Value

export type AtomSetter = <Value>(
  anAtom: PrimitiveAtom<Value> | WritableAtom<Value, unknown[], unknown>,
  value: Value,
) => void

export function hydrateAtomsFromStorage(
  set: AtomSetter,
  backend?: StorageBackend,
): void {
  const snapshot = loadInitialTournamentState(backend)
  set(currentTournamentIdAtom, snapshot.currentTournamentId)
  set(gameDataAtom, snapshot.gameData)
}

export function persistAtomsToStorage(
  get: AtomGetter,
  backend?: StorageBackend,
): void {
  const currentTournamentId = get(currentTournamentIdAtom)
  const gameData = get(gameDataAtom)

  persistTournamentState({ currentTournamentId, gameData }, backend)
}

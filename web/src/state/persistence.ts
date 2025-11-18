import type { PrimitiveAtom, WritableAtom } from 'jotai'
import { saveTournament } from '../features/persistence/local-storage-adapter'
import type { GameData } from '../lib/domain/types'
import { currentTournamentIdAtom, gameDataAtom } from './atoms'

export interface TournamentStateSnapshot {
  currentTournamentId: string | null
  gameData: GameData | null
}

export type AtomGetter = <Value>(
  anAtom: PrimitiveAtom<Value> | WritableAtom<Value, unknown[], unknown>,
) => Value

export type AtomSetter = <Value>(
  anAtom: PrimitiveAtom<Value> | WritableAtom<Value, unknown[], unknown>,
  value: Value,
) => void

export function hydrateAtomsFromStorage(set: AtomSetter): void {
  set(currentTournamentIdAtom, null)
  set(gameDataAtom, null)
}

export function persistAtomsToStorage(get: AtomGetter): void {
  const gameData = get(gameDataAtom)

  if (gameData) {
    saveTournament(gameData)
  }
}

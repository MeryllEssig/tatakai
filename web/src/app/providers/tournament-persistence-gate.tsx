import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai/react'
import type { AtomGetter, AtomSetter } from '../../state/persistence'
import { hydrateAtomsFromStorage, persistAtomsToStorage } from '../../state/persistence'
import { currentTournamentIdAtom, gameDataAtom } from '../../state/atoms'
import type { GameData } from '../../lib/domain/types'

export function TournamentPersistenceGate(): null {
  const setCurrentTournamentId = useSetAtom(currentTournamentIdAtom)
  const setGameData = useSetAtom(gameDataAtom)

  const currentTournamentId = useAtomValue(currentTournamentIdAtom)
  const gameData = useAtomValue(gameDataAtom)

  useEffect(() => {
    const set: AtomSetter = ((anAtom, value) => {
      if ((anAtom as unknown) === currentTournamentIdAtom) {
        setCurrentTournamentId(value as string | null)
      } else if ((anAtom as unknown) === gameDataAtom) {
        setGameData(value as GameData | null)
      }
    }) as AtomSetter

    hydrateAtomsFromStorage(set)
  }, [setCurrentTournamentId, setGameData])

  useEffect(() => {
    const get: AtomGetter = ((anAtom) => {
      if ((anAtom as unknown) === currentTournamentIdAtom) {
        return currentTournamentId as unknown as never
      }

      if ((anAtom as unknown) === gameDataAtom) {
        return gameData as unknown as never
      }

      throw new Error('Unsupported atom in TournamentPersistenceGate.get')
    }) as AtomGetter

    persistAtomsToStorage(get)
  }, [currentTournamentId, gameData])

  return null
}

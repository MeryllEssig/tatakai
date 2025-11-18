import { useAtom } from 'jotai/react'
import { useCallback } from 'react'
import type { GameData } from '../../lib/domain/types'
import { currentTournamentIdAtom, gameDataAtom } from '../../state/atoms'
import { loadTournament } from '../persistence/local-storage-adapter'

export interface TournamentSelectionState {
  currentTournamentId: string | null
  gameData: GameData | null
  hasSelection: boolean
}

export interface TournamentSelectionApi extends TournamentSelectionState {
  selectTournament: (id: string | null) => void
  clearSelection: () => void
}

export function useTournamentSelection(): TournamentSelectionApi {
  const [currentTournamentId, setCurrentTournamentId] = useAtom(currentTournamentIdAtom)
  const [gameData, setGameData] = useAtom(gameDataAtom)

  const selectTournament = useCallback(
    (id: string | null) => {
      if (!id) {
        setCurrentTournamentId(null)
        setGameData(null)
        return
      }

      const data = loadTournament(id)

      if (!data) {
        setCurrentTournamentId(null)
        setGameData(null)
        return
      }

      setCurrentTournamentId(id)
      setGameData(data)
    },
    [setCurrentTournamentId, setGameData],
  )

  const clearSelection = useCallback(() => {
    selectTournament(null)
  }, [selectTournament])

  return {
    currentTournamentId,
    gameData,
    hasSelection: Boolean(currentTournamentId && gameData),
    selectTournament,
    clearSelection,
  }
}

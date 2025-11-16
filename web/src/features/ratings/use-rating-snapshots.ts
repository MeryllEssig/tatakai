import { useAtomValue } from 'jotai/react'
import { gameDataAtom } from '../../state/atoms'
import type { Player } from '../../lib/domain/types'
import { conservativeRating } from '../../lib/openskill/ratings'

export interface RatingSnapshot {
  player: Player
  conservative: number
}

export function useRatingSnapshots(): RatingSnapshot[] {
  const gameData = useAtomValue(gameDataAtom)

  if (!gameData) {
    return []
  }

  const players = [...gameData.players].sort((a, b) => {
    const aCons = conservativeRating(a.rating)
    const bCons = conservativeRating(b.rating)

    if (aCons !== bCons) {
      return bCons - aCons
    }

    return a.name.localeCompare(b.name)
  })

  return players.map((player) => ({
    player,
    conservative: conservativeRating(player.rating),
  }))
}

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

  const snapshots: RatingSnapshot[] = gameData.players.map((player) => ({
    player,
    conservative: conservativeRating(player.rating),
  }))

  snapshots.sort((a, b) => {
    if (a.conservative !== b.conservative) {
      return b.conservative - a.conservative
    }

    return a.player.name.localeCompare(b.player.name)
  })

  return snapshots
}

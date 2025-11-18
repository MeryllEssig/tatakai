import { useSetAtom } from 'jotai/react'
import { useNavigate, useParams } from 'react-router-dom'
import { nextGameSuggestedPlayerIdsAtom } from '../../state/atoms'
import { buildTournamentRoute } from '../../lib/route-builders'

export function useAcceptSuggestion(): (playerIds: string[]) => void {
  const setSuggestedPlayerIds = useSetAtom(nextGameSuggestedPlayerIdsAtom)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  return (playerIds: string[]) => {
    setSuggestedPlayerIds(playerIds)

    if (!id) {
      navigate('/')
      return
    }

    navigate(buildTournamentRoute(id, 'new-game'))
  }
}

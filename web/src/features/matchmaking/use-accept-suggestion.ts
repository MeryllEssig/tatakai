import { useSetAtom } from 'jotai/react'
import { useNavigate } from 'react-router-dom'
import { nextGameSuggestedPlayerIdsAtom } from '../../state/atoms'

export function useAcceptSuggestion(): (playerIds: string[]) => void {
  const setSuggestedPlayerIds = useSetAtom(nextGameSuggestedPlayerIdsAtom)
  const navigate = useNavigate()

  return (playerIds: string[]) => {
    setSuggestedPlayerIds(playerIds)
    navigate('/games/new')
  }
}

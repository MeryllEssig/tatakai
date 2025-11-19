import type { GameData, Player } from '../domain/types'
import type { MatchmakingResult } from './engine'

export interface MatchmakingFormState {
  maxPlayersPerGame: number
  maxTeams: number
  benchFairnessEnabled: boolean
}

export function getActivePlayers(gameData: { players: Player[] }): Player[] {
  return gameData.players.filter((player) => player.isActive)
}

export function getDefaultMatchmakingFormState(
  gameData: GameData | null,
  activePlayers: Player[],
): MatchmakingFormState {
  if (!gameData) {
    return {
      maxPlayersPerGame: 4,
      maxTeams: 2,
      benchFairnessEnabled: true,
    }
  }

  const maxPlayersPerGame =
    gameData.settings.matchmakingMaxPlayers && gameData.settings.matchmakingMaxPlayers > 0
      ? gameData.settings.matchmakingMaxPlayers
      : Math.max(2, Math.min(4, activePlayers.length || 2))

  const maxTeams = Math.max(2, Math.min(4, activePlayers.length || 2))

  return {
    maxPlayersPerGame,
    maxTeams,
    benchFairnessEnabled: gameData.settings.benchFairnessEnabled,
  }
}

export function getSelectedCandidateIds(
  manualSelectedCandidateIds: string[] | null,
  activePlayers: Player[],
): string[] {
  if (manualSelectedCandidateIds) {
    return manualSelectedCandidateIds
  }

  return activePlayers.map((player) => player.id)
}

export function filterAvailableCandidateIds(
  selectedCandidateIds: string[],
  usedPlayerIds: string[],
): string[] {
  if (usedPlayerIds.length === 0) {
    return selectedCandidateIds
  }

  const usedSet = new Set(usedPlayerIds)
  return selectedCandidateIds.filter((id) => !usedSet.has(id))
}

export function accumulateUsedPlayerIds(
  previousUsedPlayerIds: string[],
  result: MatchmakingResult,
): string[] {
  const next = new Set(previousUsedPlayerIds)
  const suggestedPlayerIds = result.suggestion.teams.flatMap((team) => team.playerIds)
  suggestedPlayerIds.forEach((id) => next.add(id))
  return Array.from(next)
}

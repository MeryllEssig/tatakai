import type {
  GameData,
  MatchmakingSuggestion,
  Player,
  TeamInGame,
} from '../domain/types'
import { conservativeRating } from '../openskill/ratings'

export interface MatchmakingParams {
  maxPlayersPerGame: number
  maxTeams: number
  benchFairnessEnabled: boolean
}

export interface MatchmakingDiagnostics {
  teamMeans: number[]
  teamConservativeMeans: number[]
}

export interface MatchmakingResult {
  suggestion: MatchmakingSuggestion
  benchCandidates: string[]
  diagnostics: MatchmakingDiagnostics
}

function sortCandidates(players: Player[], benchFairnessEnabled: boolean): Player[] {
  return [...players].sort((a, b) => {
    if (benchFairnessEnabled && a.benchStreak !== b.benchStreak) {
      return b.benchStreak - a.benchStreak
    }

    if (a.rating.sigma !== b.rating.sigma) {
      return b.rating.sigma - a.rating.sigma
    }

    return conservativeRating(b.rating) - conservativeRating(a.rating)
  })
}

export function generateMatchmakingSuggestion(
  gameData: GameData,
  candidatePlayerIds: string[],
  params: MatchmakingParams,
): MatchmakingResult | null {
  const candidates = gameData.players.filter(
    (player) => player.isActive && candidatePlayerIds.includes(player.id),
  )

  if (candidates.length < 2) {
    return null
  }

  const sorted = sortCandidates(candidates, params.benchFairnessEnabled)

  const maxPlayers = Math.min(params.maxPlayersPerGame, sorted.length)
  const selected = sorted.slice(0, maxPlayers)
  const benchCandidates = sorted.slice(maxPlayers).map((player) => player.id)

  const teams: TeamInGame[] = []
  const teamCount = Math.min(Math.max(params.maxTeams, 1), selected.length)

  for (let index = 0; index < teamCount; index += 1) {
    teams.push({ id: `team-${index + 1}`, playerIds: [] })
  }

  selected.forEach((player, index) => {
    const teamIndex = index % teamCount
    teams[teamIndex]?.playerIds.push(player.id)
  })

  const suggestion: MatchmakingSuggestion = {
    teams,
    benchPlayerIds: benchCandidates,
  }

  const teamMeans = teams.map((team) => {
    const ratings = team.playerIds
      .map((playerId) => gameData.players.find((player) => player.id === playerId)?.rating)
      .filter((rating): rating is NonNullable<typeof rating> => Boolean(rating))

    if (ratings.length === 0) {
      return 0
    }

    const total = ratings.reduce((sum, rating) => sum + rating.mu, 0)
    return total / ratings.length
  })

  const teamConservativeMeans = teams.map((team) => {
    const ratings = team.playerIds
      .map((playerId) => gameData.players.find((player) => player.id === playerId)?.rating)
      .filter((rating): rating is NonNullable<typeof rating> => Boolean(rating))

    if (ratings.length === 0) {
      return 0
    }

    const total = ratings.reduce((sum, rating) => sum + conservativeRating(rating), 0)
    return total / ratings.length
  })

  const diagnostics: MatchmakingDiagnostics = {
    teamMeans,
    teamConservativeMeans,
  }

  return {
    suggestion,
    benchCandidates,
    diagnostics,
  }
}

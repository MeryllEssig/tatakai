import type { GameData, Player, Rating } from '../domain/types'
import { createInitialRating, updateRatingsForGame } from '../openskill/ratings'

function clonePlayerWithInitialRating(player: Player, gameData: GameData): Player {
  return {
    ...player,
    rating: createInitialRating(gameData.ratingConfig),
    benchStreak: 0,
    gamesPlayed: 0,
  }
}

export function recomputeAllRatings(gameData: GameData): GameData {
  const playersById = new Map<string, Player>()

  gameData.players.forEach((player) => {
    playersById.set(player.id, clonePlayerWithInitialRating(player, gameData))
  })

  const games = [...gameData.games].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  games.forEach((game) => {
    const participatingIds = new Set<string>()

    const teamRatings: Rating[][] = []
    const ranks: number[] = []

    const rankByTeamId = new Map<string, number>()
    game.teamResults.forEach((result) => {
      rankByTeamId.set(result.teamId, result.rank)
    })

    game.teams.forEach((team) => {
      const ratings: Rating[] = []

      team.playerIds.forEach((playerId) => {
        const player = playersById.get(playerId)
        if (!player) return
        participatingIds.add(playerId)
        ratings.push(player.rating)
      })

      if (ratings.length > 0) {
        teamRatings.push(ratings)
        ranks.push(rankByTeamId.get(team.id) ?? 1)
      }
    })

    if (teamRatings.length === 0) {
      return
    }

    const updatedTeams = updateRatingsForGame(teamRatings, ranks, gameData.ratingConfig)

    let teamIndex = 0

    game.teams.forEach((team) => {
      const playerIds = team.playerIds.filter((id) => playersById.has(id))
      if (playerIds.length === 0) return

      const updatedRatings = updatedTeams[teamIndex]

      playerIds.forEach((playerId, index) => {
        const player = playersById.get(playerId)
        if (!player) return
        player.rating = updatedRatings[index]
      })

      teamIndex += 1
    })

    playersById.forEach((player, playerId) => {
      if (participatingIds.has(playerId)) {
        player.gamesPlayed += 1
        player.benchStreak = 0
      } else {
        player.benchStreak += 1
      }
    })
  })

  const recomputedPlayers = gameData.players.map((player) => {
    const updated = playersById.get(player.id)
    return updated ?? player
  })

  return {
    ...gameData,
    players: recomputedPlayers,
  }
}

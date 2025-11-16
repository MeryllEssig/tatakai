 import type {
   GameData,
   GameResult,
   Player,
   Rating,
   TeamInGame,
   TeamResult,
 } from '../domain/types'
 import { updateRatingsForGame } from '../openskill/ratings'

 export interface RecordGameResultInput {
   gameData: GameData
   teams: TeamInGame[]
   results: TeamResult[]
   createdAt?: string
 }

 function createGameId(): string {
   const random = Math.random().toString(36).slice(2, 10)
   return `game-${Date.now().toString(36)}-${random}`
 }

 export function recordGameResult(input: RecordGameResultInput): GameData {
   const { gameData, teams, results, createdAt } = input

   if (teams.length === 0) {
     throw new Error('At least one team is required')
   }

   const playersById = new Map<string, Player>()
   gameData.players.forEach((player) => {
     playersById.set(player.id, player)
   })

   // Validate teams: no empty teams, all players exist and are active.
   const participatingTeamIds: string[] = []

   teams.forEach((team) => {
     if (!team.playerIds || team.playerIds.length === 0) {
       throw new Error('Teams must not be empty')
     }

     const seenPlayerIds = new Set<string>()

     team.playerIds.forEach((playerId) => {
       if (seenPlayerIds.has(playerId)) {
         throw new Error('Player cannot appear twice in the same team')
       }

       seenPlayerIds.add(playerId)

       const player = playersById.get(playerId)
       if (!player) {
         throw new Error('Unknown player in team')
       }

       if (!player.isActive) {
         throw new Error('Inactive players cannot participate in games')
       }
     })

     participatingTeamIds.push(team.id)
   })

   // Validate results: complete, no duplicate teamIds, no ties, contiguous ranks.
   if (results.length !== participatingTeamIds.length) {
     throw new Error('Results must contain one entry per team')
   }

   const teamIdSet = new Set<string>()
   const rankSet = new Set<number>()
   let minRank = Number.POSITIVE_INFINITY
   let maxRank = 0

   results.forEach((result) => {
     if (!participatingTeamIds.includes(result.teamId)) {
       throw new Error('Result references unknown team')
     }

     if (teamIdSet.has(result.teamId)) {
       throw new Error('Duplicate result for team')
     }
     teamIdSet.add(result.teamId)

     if (!Number.isInteger(result.rank) || result.rank <= 0) {
       throw new Error('Rank must be a positive integer')
     }

     if (rankSet.has(result.rank)) {
       throw new Error('Duplicate ranks are not allowed (no ties)')
     }
     rankSet.add(result.rank)

     if (result.rank < minRank) minRank = result.rank
     if (result.rank > maxRank) maxRank = result.rank
   })

   if (minRank !== 1 || maxRank !== results.length) {
     throw new Error('Ranks must form a contiguous sequence starting at 1')
   }

   const timestamp = createdAt ?? new Date().toISOString()

   const gameResult: GameResult = {
     id: createGameId(),
     createdAt: timestamp,
     teams: teams.map((team) => ({
       id: team.id,
       name: team.name,
       playerIds: [...team.playerIds],
     })),
     teamResults: results.map((result) => ({
       teamId: result.teamId,
       rank: result.rank,
     })),
   }

   // Prepare mutable copies of players for rating and stat updates.
   const players: Player[] = gameData.players.map((player) => ({ ...player }))
   const playersByIdMutable = new Map<string, Player>()
   players.forEach((player) => {
     playersByIdMutable.set(player.id, player)
   })

   const participatingPlayerIds = new Set<string>()

   if (gameData.settings.openSkillEnabled) {
     const teamRatings: Rating[][] = []
     const ranks: number[] = []
     const rankByTeamId = new Map<string, number>()

     results.forEach((result) => {
       rankByTeamId.set(result.teamId, result.rank)
     })

     teams.forEach((team) => {
       const ratings: Rating[] = []

       team.playerIds.forEach((playerId) => {
         const player = playersByIdMutable.get(playerId)
         if (!player) return
         participatingPlayerIds.add(playerId)
         ratings.push(player.rating)
       })

       if (ratings.length > 0) {
         teamRatings.push(ratings)
         ranks.push(rankByTeamId.get(team.id) ?? 1)
       }
     })

     if (teamRatings.length > 0) {
       const updatedTeams = updateRatingsForGame(teamRatings, ranks, gameData.ratingConfig)

       let teamIndex = 0
       teams.forEach((team) => {
         const playerIds = team.playerIds.filter((id) => playersByIdMutable.has(id))
         if (playerIds.length === 0) return

         const updatedRatings = updatedTeams[teamIndex]

         playerIds.forEach((playerId, index) => {
           const player = playersByIdMutable.get(playerId)
           if (!player) return
           player.rating = updatedRatings[index]
         })

         teamIndex += 1
       })
     }
   } else {
     // When OpenSkill is disabled, we still need to track participation for bench streaks.
     teams.forEach((team) => {
       team.playerIds.forEach((playerId) => {
         if (playersByIdMutable.has(playerId)) {
           participatingPlayerIds.add(playerId)
         }
       })
     })
   }

   // Update gamesPlayed and benchStreak for all players.
   playersByIdMutable.forEach((player, playerId) => {
     if (participatingPlayerIds.has(playerId)) {
       player.gamesPlayed += 1
       player.benchStreak = 0
     } else {
       player.benchStreak += 1
     }
   })

   return {
     ...gameData,
     updatedAt: timestamp,
     players,
     games: [...gameData.games, gameResult],
   }
 }

// Domain types for the tournament manager feature, derived from specs/001-tournament-manager/data-model.md

export type TournamentMode = 'solo' | 'teams'

export type RatingPreset = 'default' | 'conservative' | 'aggressive'

export interface Rating {
  mu: number
  sigma: number
}

export interface RatingConfig {
  preset: RatingPreset
  mu: number
  sigma: number
  beta?: number
  tau?: number
}

export interface TournamentSettings {
  openSkillEnabled: boolean
  maxTeamsPerGame: number
  benchFairnessEnabled: boolean
  maxBenchStreak: number
  matchmakingMaxPlayers: number
  matchmakingMinPlayers: number
  rankMax: number
}

export interface Player {
  id: string
  name: string
  rating: Rating
  benchStreak: number
  gamesPlayed: number
  isActive: boolean
}

export interface TeamInGame {
  id: string
  name?: string
  playerIds: string[]
}

export interface TeamResult {
  teamId: string
  rank: number
}

export interface GameResult {
  id: string
  createdAt: string
  teams: TeamInGame[]
  teamResults: TeamResult[]
}

export interface GameData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  mode: TournamentMode
  maxPlayersPerGame: number
  ratingConfig: RatingConfig
  settings: TournamentSettings
  players: Player[]
  games: GameResult[]
}

export interface TournamentSummary {
  id: string
  name: string
  playerCount: number
  gameCount: number
  lastGameDate: string | null
}

export interface StoredData {
  tournaments: TournamentSummary[]
  lastOpenedTournamentId: string | null
}

export interface LeaderboardEntry {
  playerId: string
  name: string
  rating: Rating
  gamesPlayed: number
  benchStreak: number
  conservativeRating: number
}

export interface MatchmakingCandidate {
  playerId: string
  isSelected: boolean
}

export interface MatchmakingSuggestion {
  teams: TeamInGame[]
  benchPlayerIds: string[]
}

import type {
  GameData,
  Player,
  RatingConfig,
  RatingPreset,
  TournamentMode,
  TournamentSettings,
} from '../domain/types'
import { createInitialRating } from '../openskill/ratings'

export interface CreateTournamentInput {
  name: string
  mode: TournamentMode
  maxPlayersPerGame: number
  ratingPreset: RatingPreset
  openSkillEnabled: boolean
  initialPlayers?: { name: string }[]
  rankMax?: number
}

export interface CreateTournamentResult {
  gameData: GameData
  storageKey: string
}

export interface AddOrUpdatePlayerInput {
  gameData: GameData
  player: { id?: string; name: string; isActive?: boolean }
}

function normalizeTournamentId(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  if (normalized.length > 0) {
    return normalized
  }

  return `tournament-${Date.now()}`
}

function createRatingConfigFromPreset(preset: RatingPreset): RatingConfig {
  if (preset === 'conservative') {
    return {
      preset,
      mu: 1500,
      sigma: 350,
    }
  }

  if (preset === 'aggressive') {
    return {
      preset,
      mu: 1000,
      sigma: 500,
    }
  }

  return {
    preset: 'default',
    mu: 25,
    sigma: 8.333,
  }
}

function createDefaultTournamentSettings(
  openSkillEnabled: boolean,
  maxPlayersPerGame: number,
  initialPlayerCount: number,
  rankMaxInput?: number,
): TournamentSettings {
  const safeMaxPlayers = Math.max(1, maxPlayersPerGame)
  const basePlayers = initialPlayerCount > 0 ? initialPlayerCount : safeMaxPlayers
  const maxBenchStreak = Math.max(1, Math.ceil(basePlayers / safeMaxPlayers))

  const fallbackRankMax = 20
  const rankMax =
    typeof rankMaxInput === 'number' && Number.isFinite(rankMaxInput) && rankMaxInput > 0
      ? Math.floor(rankMaxInput)
      : fallbackRankMax

  return {
    openSkillEnabled,
    maxTeamsPerGame: 2,
    benchFairnessEnabled: true,
    maxBenchStreak,
    matchmakingMaxPlayers: safeMaxPlayers,
    matchmakingMinPlayers: Math.min(2, safeMaxPlayers),
    rankMax,
  }
}

function createPlayerId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const random = Math.random().toString(36).slice(2, 8)
  return `player-${slug || 'player'}-${random}`
}

function createPlayer(name: string, gameData: GameData): Player {
  return {
    id: createPlayerId(name),
    name: name.trim(),
    rating: createInitialRating(gameData.ratingConfig),
    benchStreak: 0,
    gamesPlayed: 0,
    isActive: true,
  }
}

function assertUniquePlayerName(gameData: GameData, name: string, existingId?: string): void {
  const target = name.trim().toLowerCase()

  const conflict = gameData.players.find((player) => {
    if (existingId && player.id === existingId) {
      return false
    }

    return player.name.trim().toLowerCase() === target
  })

  if (conflict) {
    throw new Error('Player name must be unique within a tournament')
  }
}

export function createTournament(input: CreateTournamentInput): CreateTournamentResult {
  const initialPlayers = input.initialPlayers ?? []
  const id = normalizeTournamentId(input.name)
  const ratingConfig = createRatingConfigFromPreset(input.ratingPreset)
  const createdAt = new Date().toISOString()

  let gameData: GameData = {
    id,
    name: input.name,
    createdAt,
    updatedAt: createdAt,
    mode: input.mode,
    maxPlayersPerGame: input.maxPlayersPerGame,
    ratingConfig,
    settings: createDefaultTournamentSettings(
      input.openSkillEnabled,
      input.maxPlayersPerGame,
      initialPlayers.length,
      input.rankMax,
    ),
    players: [],
    games: [],
  }

  const players = initialPlayers.map((player) => createPlayer(player.name, gameData))

  gameData = {
    ...gameData,
    players,
  }

  return {
    gameData,
    storageKey: id,
  }
}

export function addOrUpdatePlayer(input: AddOrUpdatePlayerInput): GameData {
  const { gameData } = input
  const name = input.player.name.trim()

  if (!name) {
    throw new Error('Player name is required')
  }

  const existingId = input.player.id

  assertUniquePlayerName(gameData, name, existingId)

  const updatedAt = new Date().toISOString()

  if (!existingId) {
    const newPlayer: Player = {
      id: createPlayerId(name),
      name,
      rating: createInitialRating(gameData.ratingConfig),
      benchStreak: 0,
      gamesPlayed: 0,
      isActive: input.player.isActive ?? true,
    }

    return {
      ...gameData,
      updatedAt,
      players: [...gameData.players, newPlayer],
    }
  }

  const index = gameData.players.findIndex((player) => player.id === existingId)

  if (index === -1) {
    throw new Error('Player not found')
  }

  const current = gameData.players[index]

  const updatedPlayer: Player = {
    ...current,
    name,
    isActive: input.player.isActive ?? current.isActive,
  }

  const players = [...gameData.players]
  players[index] = updatedPlayer

  return {
    ...gameData,
    updatedAt,
    players,
  }
}

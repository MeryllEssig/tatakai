import { describe, expect, it } from 'vitest'
import type { GameData, Player } from '../../../src/lib/domain/types'
import { generateMatchmakingSuggestion } from '../../../src/lib/matchmaking/engine'
import {
  accumulateUsedPlayerIds,
  filterAvailableCandidateIds,
  getActivePlayers,
  getDefaultMatchmakingFormState,
  getSelectedCandidateIds,
} from '../../../src/lib/matchmaking/form-state'
import type { CreateTournamentInput } from '../../../src/lib/tournaments/tournament-service'
import { createTournament } from '../../../src/lib/tournaments/tournament-service'

function makeCreateInput(overrides: Partial<CreateTournamentInput> = {}): CreateTournamentInput {
  return {
    name: 'Tournoi Matchmaking Form',
    maxPlayersPerGame: 4,
    ratingPreset: 'default',
    openSkillEnabled: true,
    initialPlayers: [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
      { name: 'Daisy' },
      { name: 'Eve' },
    ],
    ...overrides,
  }
}

function getPlayers(gameData: GameData): Player[] {
  return [...gameData.players]
}

describe('matchmaking form-state helpers', () => {
  it('getActivePlayers returns only active players', () => {
    const { gameData } = createTournament(makeCreateInput())

    const [first, ...rest] = getPlayers(gameData)
    first.isActive = false

    const active = getActivePlayers(gameData)

    expect(active).not.toContain(first)
    expect(active.length).toBe(rest.length)
  })

  it('getDefaultMatchmakingFormState respects matchmakingMaxPlayers and active player count', () => {
    const { gameData } = createTournament(makeCreateInput())
    const active = getActivePlayers(gameData)

    const state = getDefaultMatchmakingFormState(gameData, active)

    expect(state.maxPlayersPerGame).toBe(gameData.settings.matchmakingMaxPlayers)
    expect(state.maxTeams).toBeGreaterThanOrEqual(2)
    expect(state.maxTeams).toBeLessThanOrEqual(4)
    expect(state.benchFairnessEnabled).toBe(gameData.settings.benchFairnessEnabled)
  })

  it('getSelectedCandidateIds returns all active players when no manual selection', () => {
    const { gameData } = createTournament(makeCreateInput())
    const active = getActivePlayers(gameData)

    const selected = getSelectedCandidateIds(null, active)

    expect(new Set(selected)).toEqual(new Set(active.map((player) => player.id)))
  })

  it('getSelectedCandidateIds prefers manual selection when provided', () => {
    const { gameData } = createTournament(makeCreateInput())
    const active = getActivePlayers(gameData)
    const manual = active.slice(0, 2).map((player) => player.id)

    const selected = getSelectedCandidateIds(manual, active)

    expect(selected).toEqual(manual)
  })

  it('filterAvailableCandidateIds excludes used players', () => {
    const { gameData } = createTournament(makeCreateInput())
    const active = getActivePlayers(gameData)
    const selected = active.map((player) => player.id)
    const used = selected.slice(0, 2)

    const available = filterAvailableCandidateIds(selected, used)

    used.forEach((id) => {
      expect(available).not.toContain(id)
    })
  })

  it('accumulateUsedPlayerIds unions previously used players with new suggestion without duplicates', () => {
    const { gameData } = createTournament(makeCreateInput())
    const active = getActivePlayers(gameData)
    const candidateIds = active.map((player) => player.id)

    const result = generateMatchmakingSuggestion(gameData, candidateIds, {
      maxPlayersPerGame: 4,
      maxTeams: 2,
      benchFairnessEnabled: false,
    })

    expect(result).not.toBeNull()
    if (!result) return

    const first = accumulateUsedPlayerIds([], result)
    expect(first.length).toBeGreaterThan(0)

    const second = accumulateUsedPlayerIds(first, result)
    expect(new Set(second)).toEqual(new Set(first))
  })
})

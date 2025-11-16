import { describe, expect, it } from 'vitest'
import { createTournament } from '../../../src/lib/tournaments/tournament-service'
import type { CreateTournamentInput } from '../../../src/lib/tournaments/tournament-service'
import type { GameData, Player } from '../../../src/lib/domain/types'
import { generateMatchmakingSuggestion } from '../../../src/lib/matchmaking/engine'

function makeCreateInput(overrides: Partial<CreateTournamentInput> = {}): CreateTournamentInput {
  return {
    name: 'Tournoi Matchmaking',
    mode: 'solo',
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

function getPlayer(gameData: GameData, name: string): Player {
  const player = gameData.players.find((p) => p.name === name)
  if (!player) {
    throw new Error(`Player not found: ${name}`)
  }
  return player
}

describe('matchmaking engine generateMatchmakingSuggestion', () => {
  it('returns null when fewer than two candidates are provided', () => {
    const { gameData } = createTournament(makeCreateInput())
    const alice = getPlayer(gameData, 'Alice')

    const result = generateMatchmakingSuggestion(
      gameData,
      [alice.id],
      {
        maxPlayersPerGame: 4,
        maxTeams: 2,
        benchFairnessEnabled: true,
      },
    )

    expect(result).toBeNull()
  })

  it('prioritises bench fairness over other criteria when enabled', () => {
    const { gameData } = createTournament(makeCreateInput())

    const alice = getPlayer(gameData, 'Alice')
    const bob = getPlayer(gameData, 'Bob')
    const charlie = getPlayer(gameData, 'Charlie')

    // Simulate that Bob and Charlie have been on the bench longer than Alice.
    alice.benchStreak = 0
    bob.benchStreak = 5
    charlie.benchStreak = 3

    const result = generateMatchmakingSuggestion(
      gameData,
      [alice.id, bob.id, charlie.id],
      {
        maxPlayersPerGame: 2,
        maxTeams: 2,
        benchFairnessEnabled: true,
      },
    )

    expect(result).not.toBeNull()

    const selectedIds = result!.suggestion.teams.flatMap((team) => team.playerIds)
    const benchIds = result!.benchCandidates

    // Players with the highest bench streak (Bob, Charlie) should be selected first.
    expect(new Set(selectedIds)).toEqual(new Set([bob.id, charlie.id]))
    expect(new Set(benchIds)).toEqual(new Set([alice.id]))
  })

  it('prioritises rating uncertainty (sigma) when bench fairness is disabled', () => {
    const { gameData } = createTournament(makeCreateInput())

    const alice = getPlayer(gameData, 'Alice')
    const bob = getPlayer(gameData, 'Bob')
    const charlie = getPlayer(gameData, 'Charlie')

    // Same bench streak for all; selection should be driven by sigma then rating.
    alice.benchStreak = 1
    bob.benchStreak = 1
    charlie.benchStreak = 1

    alice.rating.sigma = 1.0
    bob.rating.sigma = 3.0
    charlie.rating.sigma = 2.0

    const result = generateMatchmakingSuggestion(
      gameData,
      [alice.id, bob.id, charlie.id],
      {
        maxPlayersPerGame: 2,
        maxTeams: 2,
        benchFairnessEnabled: false,
      },
    )

    expect(result).not.toBeNull()

    const selectedIds = result!.suggestion.teams.flatMap((team) => team.playerIds)
    const benchIds = result!.benchCandidates

    // Highest sigmas (Bob, Charlie) should be selected; Alice should be benched.
    expect(new Set(selectedIds)).toEqual(new Set([bob.id, charlie.id]))
    expect(new Set(benchIds)).toEqual(new Set([alice.id]))
  })

  it('produces reasonably balanced teams by rating using a round-robin assignment', () => {
    const { gameData } = createTournament(makeCreateInput())

    const alice = getPlayer(gameData, 'Alice')
    const bob = getPlayer(gameData, 'Bob')
    const charlie = getPlayer(gameData, 'Charlie')
    const daisy = getPlayer(gameData, 'Daisy')

    // Force identical sigma so ordering is driven by rating.
    ;[alice, bob, charlie, daisy].forEach((player) => {
      player.rating.sigma = 1
    })

    // Make ratings clearly separated.
    alice.rating.mu = 100
    bob.rating.mu = 90
    charlie.rating.mu = 60
    daisy.rating.mu = 50

    const result = generateMatchmakingSuggestion(
      gameData,
      [alice.id, bob.id, charlie.id, daisy.id],
      {
        maxPlayersPerGame: 4,
        maxTeams: 2,
        benchFairnessEnabled: false,
      },
    )

    expect(result).not.toBeNull()

    const teams = result!.suggestion.teams
    expect(teams).toHaveLength(2)

    const team1Ids = [...teams[0].playerIds].sort()
    const team2Ids = [...teams[1].playerIds].sort()

    // With round-robin assignment from strongest to weakest, we expect:
    // Team 1: Alice (100) + Charlie (60)
    // Team 2: Bob (90) + Daisy (50)
    expect(team1Ids).toEqual([... [alice.id, charlie.id]].sort())
    expect(team2Ids).toEqual([... [bob.id, daisy.id]].sort())
  })

  it('ignores inactive players when building suggestions', () => {
    const { gameData } = createTournament(makeCreateInput())

    const alice = getPlayer(gameData, 'Alice')
    const bob = getPlayer(gameData, 'Bob')
    const charlie = getPlayer(gameData, 'Charlie')

    // Mark Bob as inactive; he should not appear in teams or bench candidates.
    bob.isActive = false

    const result = generateMatchmakingSuggestion(
      gameData,
      [alice.id, bob.id, charlie.id],
      {
        maxPlayersPerGame: 3,
        maxTeams: 2,
        benchFairnessEnabled: false,
      },
    )

    expect(result).not.toBeNull()
    if (!result) return

    const selectedIds = result.suggestion.teams.flatMap((team) => team.playerIds)
    const benchIds = result.benchCandidates

    expect(selectedIds).not.toContain(bob.id)
    expect(benchIds).not.toContain(bob.id)
  })

  it('caps the number of teams by the number of selected players', () => {
    const { gameData } = createTournament(makeCreateInput())

    const selectedIds = gameData.players.slice(0, 3).map((player) => player.id)

    const result = generateMatchmakingSuggestion(gameData, selectedIds, {
      maxPlayersPerGame: 3,
      maxTeams: 10,
      benchFairnessEnabled: false,
    })

    expect(result).not.toBeNull()
    if (!result) return

    expect(result.suggestion.teams).toHaveLength(3)
  })
})

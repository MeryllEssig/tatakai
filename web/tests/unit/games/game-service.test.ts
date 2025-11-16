import { describe, expect, it } from 'vitest'
import { createTournament } from '../../../src/lib/tournaments/tournament-service'
import type { CreateTournamentInput } from '../../../src/lib/tournaments/tournament-service'
import { recordGameResult } from '../../../src/lib/games/game-service'
import type { GameData, Player } from '../../../src/lib/domain/types'

function makeCreateInput(overrides: Partial<CreateTournamentInput> = {}): CreateTournamentInput {
  return {
    name: 'Tournoi Ratings',
    mode: 'solo',
    maxPlayersPerGame: 4,
    ratingPreset: 'default',
    openSkillEnabled: true,
    initialPlayers: [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
      { name: 'Daisy' },
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

describe('game-service recordGameResult', () => {
  it('updates ratings and bench streaks after recording a game', () => {
    const { gameData: initial } = createTournament(makeCreateInput())

    const alice = getPlayer(initial, 'Alice')
    const bob = getPlayer(initial, 'Bob')
    const charlie = getPlayer(initial, 'Charlie')
    const daisy = getPlayer(initial, 'Daisy')

    const initialDaisyRating = { ...daisy.rating }

    const updated = recordGameResult({
      gameData: initial,
      teams: [
        { id: 't1', playerIds: [alice.id, bob.id] },
        { id: 't2', playerIds: [charlie.id] },
      ],
      results: [
        { teamId: 't1', rank: 1 },
        { teamId: 't2', rank: 2 },
      ],
    })

    expect(updated.games).toHaveLength(1)

    const aliceAfter = getPlayer(updated, 'Alice')
    const bobAfter = getPlayer(updated, 'Bob')
    const charlieAfter = getPlayer(updated, 'Charlie')
    const daisyAfter = getPlayer(updated, 'Daisy')

    // Winners and losers should no longer have identical ratings.
    expect(aliceAfter.rating.mu).not.toBeCloseTo(charlieAfter.rating.mu)

    // Bench player rating should be unchanged.
    expect(daisyAfter.rating.mu).toBeCloseTo(initialDaisyRating.mu)
    expect(daisyAfter.rating.sigma).toBeCloseTo(initialDaisyRating.sigma)

    // gamesPlayed and benchStreak tracking
    expect(aliceAfter.gamesPlayed).toBe(1)
    expect(bobAfter.gamesPlayed).toBe(1)
    expect(charlieAfter.gamesPlayed).toBe(1)
    expect(daisyAfter.gamesPlayed).toBe(0)

    expect(aliceAfter.benchStreak).toBe(0)
    expect(bobAfter.benchStreak).toBe(0)
    expect(charlieAfter.benchStreak).toBe(0)
    expect(daisyAfter.benchStreak).toBe(1)
  })

  it('tracks bench streaks even when OpenSkill rating updates are disabled', () => {
    const { gameData: initial } = createTournament(
      makeCreateInput({ openSkillEnabled: false }),
    )

    const alice = getPlayer(initial, 'Alice')
    const bob = getPlayer(initial, 'Bob')
    const charlie = getPlayer(initial, 'Charlie')

    const initialRatingsById: Record<string, { mu: number; sigma: number }> = {}
    initial.players.forEach((player) => {
      initialRatingsById[player.id] = { ...player.rating }
    })

    const updated = recordGameResult({
      gameData: initial,
      teams: [
        { id: 't1', playerIds: [alice.id, bob.id] },
        { id: 't2', playerIds: [charlie.id] },
      ],
      results: [
        { teamId: 't1', rank: 1 },
        { teamId: 't2', rank: 2 },
      ],
    })

    const aliceAfter = getPlayer(updated, 'Alice')
    const bobAfter = getPlayer(updated, 'Bob')
    const charlieAfter = getPlayer(updated, 'Charlie')
    const daisyAfter = getPlayer(updated, 'Daisy')

    // Ratings should be unchanged when OpenSkill is disabled.
    updated.players.forEach((player) => {
      const initialRating = initialRatingsById[player.id]
      expect(player.rating.mu).toBeCloseTo(initialRating.mu)
      expect(player.rating.sigma).toBeCloseTo(initialRating.sigma)
    })

    // gamesPlayed and benchStreak tracking still applies.
    expect(aliceAfter.gamesPlayed).toBe(1)
    expect(bobAfter.gamesPlayed).toBe(1)
    expect(charlieAfter.gamesPlayed).toBe(1)
    expect(daisyAfter.gamesPlayed).toBe(0)

    expect(aliceAfter.benchStreak).toBe(0)
    expect(bobAfter.benchStreak).toBe(0)
    expect(charlieAfter.benchStreak).toBe(0)
    expect(daisyAfter.benchStreak).toBe(1)
  })

  it('rejects games with empty teams', () => {
    const { gameData: initial } = createTournament(makeCreateInput())

    const alice = getPlayer(initial, 'Alice')

    expect(() => {
      recordGameResult({
        gameData: initial,
        teams: [
          { id: 't1', playerIds: [alice.id] },
          { id: 't2', playerIds: [] },
        ],
        results: [
          { teamId: 't1', rank: 1 },
          { teamId: 't2', rank: 2 },
        ],
      })
    }).toThrowError(/empty/i)
  })
})

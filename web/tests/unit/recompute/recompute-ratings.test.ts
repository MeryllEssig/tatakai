import { describe, expect, it } from 'vitest'
import { createTournament } from '../../../src/lib/tournaments/tournament-service'
import type { CreateTournamentInput } from '../../../src/lib/tournaments/tournament-service'
import type { GameData, Player } from '../../../src/lib/domain/types'
import { recordGameResult } from '../../../src/lib/games/game-service'
import { deleteGameAndRecompute } from '../../../src/lib/recompute/recompute-ratings'

function makeCreateInput(overrides: Partial<CreateTournamentInput> = {}): CreateTournamentInput {
  return {
    name: 'Tournoi Recompute',
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

describe('recompute deleteGameAndRecompute', () => {
  it('throws when the game does not exist', () => {
    const { gameData } = createTournament(makeCreateInput())

    expect(() => deleteGameAndRecompute(gameData, 'non-existent-game')).toThrowError(
      /game not found/i,
    )
  })

  it('recomputes ratings and stats as if the deleted game never happened (delete first of two)', () => {
    const { gameData: initial } = createTournament(makeCreateInput())

    const alice = getPlayer(initial, 'Alice')
    const bob = getPlayer(initial, 'Bob')
    const charlie = getPlayer(initial, 'Charlie')
    const daisy = getPlayer(initial, 'Daisy')

    // First game: Alice + Bob vs Charlie. Daisy is on the bench.
    const afterFirst = recordGameResult({
      gameData: initial,
      teams: [
        { id: 'g1-t1', playerIds: [alice.id, bob.id] },
        { id: 'g1-t2', playerIds: [charlie.id] },
      ],
      results: [
        { teamId: 'g1-t1', rank: 1 },
        { teamId: 'g1-t2', rank: 2 },
      ],
      createdAt: '2024-01-01T10:00:00.000Z',
    })

    // Second game: Bob + Charlie vs Daisy. Alice is on the bench.
    const afterSecond = recordGameResult({
      gameData: afterFirst,
      teams: [
        { id: 'g2-t1', playerIds: [bob.id, charlie.id] },
        { id: 'g2-t2', playerIds: [daisy.id] },
      ],
      results: [
        { teamId: 'g2-t1', rank: 1 },
        { teamId: 'g2-t2', rank: 2 },
      ],
      createdAt: '2024-01-01T11:00:00.000Z',
    })

    expect(afterSecond.games).toHaveLength(2)

    const firstGameId = afterSecond.games[0]?.id
    expect(firstGameId).toBeDefined()

    // Baseline: scenario B where only the second game ever existed.
    const { gameData: baselineInitial } = createTournament(makeCreateInput())
    const baselineBob = getPlayer(baselineInitial, 'Bob')
    const baselineCharlie = getPlayer(baselineInitial, 'Charlie')
    const baselineDaisy = getPlayer(baselineInitial, 'Daisy')

    const baselineAfterSecondOnly = recordGameResult({
      gameData: baselineInitial,
      teams: [
        { id: 'g2-t1', playerIds: [baselineBob.id, baselineCharlie.id] },
        { id: 'g2-t2', playerIds: [baselineDaisy.id] },
      ],
      results: [
        { teamId: 'g2-t1', rank: 1 },
        { teamId: 'g2-t2', rank: 2 },
      ],
      createdAt: '2024-01-01T11:00:00.000Z',
    })

    // Apply delete + recompute on the two-game history.
    const recomputed = deleteGameAndRecompute(afterSecond, firstGameId as string)

    const players = ['Alice', 'Bob', 'Charlie', 'Daisy'] as const

    players.forEach((name) => {
      const baselinePlayer = getPlayer(baselineAfterSecondOnly, name)
      const recomputedPlayer = getPlayer(recomputed, name)

      expect(recomputedPlayer.rating.mu).toBeCloseTo(baselinePlayer.rating.mu, 10)
      expect(recomputedPlayer.rating.sigma).toBeCloseTo(baselinePlayer.rating.sigma, 10)
      expect(recomputedPlayer.gamesPlayed).toBe(baselinePlayer.gamesPlayed)
      expect(recomputedPlayer.benchStreak).toBe(baselinePlayer.benchStreak)
    })
  })

  it('recomputes ratings and stats when deleting the last game from history', () => {
    const { gameData: initial } = createTournament(makeCreateInput())

    const alice = getPlayer(initial, 'Alice')
    const bob = getPlayer(initial, 'Bob')
    const charlie = getPlayer(initial, 'Charlie')

    // First game: Alice vs Bob.
    const afterFirst = recordGameResult({
      gameData: initial,
      teams: [
        { id: 'g1-t1', playerIds: [alice.id] },
        { id: 'g1-t2', playerIds: [bob.id] },
      ],
      results: [
        { teamId: 'g1-t1', rank: 1 },
        { teamId: 'g1-t2', rank: 2 },
      ],
      createdAt: '2024-01-01T10:00:00.000Z',
    })

    // Second game: Bob vs Charlie.
    const afterSecond = recordGameResult({
      gameData: afterFirst,
      teams: [
        { id: 'g2-t1', playerIds: [bob.id] },
        { id: 'g2-t2', playerIds: [charlie.id] },
      ],
      results: [
        { teamId: 'g2-t1', rank: 1 },
        { teamId: 'g2-t2', rank: 2 },
      ],
      createdAt: '2024-01-01T11:00:00.000Z',
    })

    const firstGameId = afterSecond.games[0]?.id
    const secondGameId = afterSecond.games[1]?.id

    expect(firstGameId).toBeDefined()
    expect(secondGameId).toBeDefined()

    // Baseline: only the first game ever existed.
    const { gameData: baselineInitial } = createTournament(makeCreateInput())
    const baselineAlice = getPlayer(baselineInitial, 'Alice')
    const baselineBob = getPlayer(baselineInitial, 'Bob')

    const baselineAfterFirstOnly = recordGameResult({
      gameData: baselineInitial,
      teams: [
        { id: 'g1-t1', playerIds: [baselineAlice.id] },
        { id: 'g1-t2', playerIds: [baselineBob.id] },
      ],
      results: [
        { teamId: 'g1-t1', rank: 1 },
        { teamId: 'g1-t2', rank: 2 },
      ],
      createdAt: '2024-01-01T10:00:00.000Z',
    })

    const recomputed = deleteGameAndRecompute(afterSecond, secondGameId as string)

    const players = ['Alice', 'Bob', 'Charlie', 'Daisy'] as const

    players.forEach((name) => {
      const baselinePlayer = getPlayer(baselineAfterFirstOnly, name)
      const recomputedPlayer = getPlayer(recomputed, name)

      expect(recomputedPlayer.rating.mu).toBeCloseTo(baselinePlayer.rating.mu, 10)
      expect(recomputedPlayer.rating.sigma).toBeCloseTo(baselinePlayer.rating.sigma, 10)
      expect(recomputedPlayer.gamesPlayed).toBe(baselinePlayer.gamesPlayed)
      expect(recomputedPlayer.benchStreak).toBe(baselinePlayer.benchStreak)
    })
  })
})

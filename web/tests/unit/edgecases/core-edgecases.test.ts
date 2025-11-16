import { describe, expect, it } from 'vitest'
import { createTournament } from '../../../src/lib/tournaments/tournament-service'
import type { CreateTournamentInput } from '../../../src/lib/tournaments/tournament-service'
import type { GameData, Player } from '../../../src/lib/domain/types'
import { recordGameResult } from '../../../src/lib/games/game-service'
import { recomputeAllRatings } from '../../../src/lib/recompute/recompute-ratings'
import { generateMatchmakingSuggestion } from '../../../src/lib/matchmaking/engine'

function makeCreateInput(overrides: Partial<CreateTournamentInput> = {}): CreateTournamentInput {
  return {
    name: 'Tournoi Edgecases',
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

describe('edge cases: deleted players, insufficient matchmaking players, settings changes', () => {
  it('recomputeAllRatings tolerates games referencing players that have been deleted afterwards', () => {
    const { gameData: initial } = createTournament(makeCreateInput())

    const alice = getPlayer(initial, 'Alice')
    const bob = getPlayer(initial, 'Bob')

    const withGame = recordGameResult({
      gameData: initial,
      teams: [
        { id: 'g1-t1', playerIds: [alice.id, bob.id] },
      ],
      results: [{ teamId: 'g1-t1', rank: 1 }],
      createdAt: '2024-01-01T10:00:00.000Z',
    })

    const withoutBob: GameData = {
      ...withGame,
      players: withGame.players.filter((player) => player.id !== bob.id),
    }

    const gameStillReferencesBob = withGame.games.some((game) =>
      game.teams.some((team) => team.playerIds.includes(bob.id)),
    )
    expect(gameStillReferencesBob).toBe(true)

    expect(() => recomputeAllRatings(withoutBob)).not.toThrow()

    const recomputed = recomputeAllRatings(withoutBob)
    const names = recomputed.players.map((player) => player.name)
    expect(names).not.toContain('Bob')
  })

  it('handles fewer available players than requested by matchmaking configuration', () => {
    const { gameData } = createTournament(makeCreateInput())

    const alice = getPlayer(gameData, 'Alice')
    const bob = getPlayer(gameData, 'Bob')

    const result = generateMatchmakingSuggestion(
      gameData,
      [alice.id, bob.id],
      {
        maxPlayersPerGame: 4,
        maxTeams: 3,
        benchFairnessEnabled: false,
      },
    )

    expect(result).not.toBeNull()
    if (!result) return

    const selectedIds = result.suggestion.teams.flatMap((team) => team.playerIds)
    const benchIds = result.benchCandidates

    expect(new Set(selectedIds)).toEqual(new Set([alice.id, bob.id]))
    expect(benchIds).toHaveLength(0)
    expect(result.suggestion.teams.length).toBe(2)
  })

  it('applies settings changes only to future rating updates', () => {
    const { gameData: initial } = createTournament(makeCreateInput())

    const alice = getPlayer(initial, 'Alice')
    const bob = getPlayer(initial, 'Bob')
    const charlie = getPlayer(initial, 'Charlie')

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

    const aliceAfterFirst = getPlayer(afterFirst, 'Alice')
    const bobAfterFirst = getPlayer(afterFirst, 'Bob')
    const charlieAfterFirst = getPlayer(afterFirst, 'Charlie')

    expect(aliceAfterFirst.rating.mu).not.toBeCloseTo(bobAfterFirst.rating.mu)

    const withOpenSkillDisabled: GameData = {
      ...afterFirst,
      settings: {
        ...afterFirst.settings,
        openSkillEnabled: false,
      },
    }

    const afterSecond = recordGameResult({
      gameData: withOpenSkillDisabled,
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

    const aliceAfterSecond = getPlayer(afterSecond, 'Alice')
    const bobAfterSecond = getPlayer(afterSecond, 'Bob')
    const charlieAfterSecond = getPlayer(afterSecond, 'Charlie')

    expect(aliceAfterSecond.rating.mu).toBeCloseTo(aliceAfterFirst.rating.mu)
    expect(aliceAfterSecond.rating.sigma).toBeCloseTo(aliceAfterFirst.rating.sigma)

    expect(bobAfterSecond.rating.mu).toBeCloseTo(bobAfterFirst.rating.mu)
    expect(bobAfterSecond.rating.sigma).toBeCloseTo(bobAfterFirst.rating.sigma)

    expect(charlieAfterSecond.rating.mu).toBeCloseTo(charlieAfterFirst.rating.mu)
    expect(charlieAfterSecond.rating.sigma).toBeCloseTo(charlieAfterFirst.rating.sigma)
  })
})

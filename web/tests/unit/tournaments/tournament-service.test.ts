import { describe, expect, it } from 'vitest'
import { createTournament, addOrUpdatePlayer } from '../../../src/lib/tournaments/tournament-service'
import type { CreateTournamentInput } from '../../../src/lib/tournaments/tournament-service'

function makeCreateInput(overrides: Partial<CreateTournamentInput> = {}): CreateTournamentInput {
  return {
    name: 'Mon Tournoi 1!',
    mode: 'solo',
    maxPlayersPerGame: 4,
    ratingPreset: 'default',
    openSkillEnabled: true,
    initialPlayers: [{ name: 'Alice' }, { name: 'Bob' }],
    ...overrides,
  }
}

describe('tournament-service createTournament', () => {
  it('creates a GameData with normalized id and storageKey', () => {
    const { gameData, storageKey } = createTournament(
      makeCreateInput({ name: 'Mon Tournoi 1!' }),
    )

    expect(gameData.id).toBe('montournoi1')
    expect(storageKey).toBe('montournoi1')
    expect(gameData.name).toBe('Mon Tournoi 1!')
    expect(gameData.createdAt).toBeTruthy()
    expect(gameData.updatedAt).toBe(gameData.createdAt)
    expect(gameData.mode).toBe('solo')
    expect(gameData.maxPlayersPerGame).toBe(4)
  })

  it('applies rating preset defaults and creates initial players', () => {
    const { gameData } = createTournament(makeCreateInput({ ratingPreset: 'conservative' }))

    expect(gameData.ratingConfig.preset).toBe('conservative')
    expect(gameData.ratingConfig.mu).toBe(1500)
    expect(gameData.ratingConfig.sigma).toBe(350)

    expect(gameData.players).toHaveLength(2)
    const names = gameData.players.map((p) => p.name).sort()
    expect(names).toEqual(['Alice', 'Bob'])

    gameData.players.forEach((player) => {
      expect(player.rating.mu).toBe(gameData.ratingConfig.mu)
      expect(player.rating.sigma).toBe(gameData.ratingConfig.sigma)
      expect(player.isActive).toBe(true)
    })
  })
})

describe('tournament-service addOrUpdatePlayer', () => {
  it('adds a new player with initial rating and default active flag', () => {
    const created = createTournament(makeCreateInput({ initialPlayers: [] }))
    const gameData = created.gameData

    const updated = addOrUpdatePlayer({
      gameData,
      player: { name: 'Charlie' },
    })

    expect(updated.players).toHaveLength(1)
    const [player] = updated.players
    expect(player.name).toBe('Charlie')
    expect(player.isActive).toBe(true)
    expect(player.rating.mu).toBe(updated.ratingConfig.mu)
    expect(player.rating.sigma).toBe(updated.ratingConfig.sigma)
  })

  it('prevents duplicate player names in the same tournament', () => {
    const created = createTournament(makeCreateInput({ initialPlayers: [{ name: 'Alice' }] }))
    const gameData = created.gameData

    expect(() => {
      addOrUpdatePlayer({
        gameData,
        player: { name: 'Alice' },
      })
    }).toThrowError(/unique/i)
  })

  it('updates an existing player name and active flag', () => {
    const created = createTournament(makeCreateInput({ initialPlayers: [{ name: 'Alice' }] }))
    const [existing] = created.gameData.players

    const updated = addOrUpdatePlayer({
      gameData: created.gameData,
      player: { id: existing.id, name: 'Alice Renamed', isActive: false },
    })

    expect(updated.players).toHaveLength(1)
    const [player] = updated.players
    expect(player.id).toBe(existing.id)
    expect(player.name).toBe('Alice Renamed')
    expect(player.isActive).toBe(false)
  })

  it('does not treat the same player as a duplicate when keeping their name', () => {
    const created = createTournament(makeCreateInput({ initialPlayers: [{ name: 'Alice' }] }))
    const [existing] = created.gameData.players

    const updated = addOrUpdatePlayer({
      gameData: created.gameData,
      player: { id: existing.id, name: 'Alice' },
    })

    expect(updated.players[0]?.name).toBe('Alice')
  })
})

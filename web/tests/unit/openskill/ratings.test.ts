import { describe, expect, it } from 'vitest'
import {
  createInitialRating,
  conservativeRating,
  updateRatingsForGame,
} from '../../../src/lib/openskill/ratings'
import type { RatingConfig } from '../../../src/lib/domain/types'

describe('openskill ratings utilities', () => {
  it('creates initial rating and conservative score', () => {
    const config: RatingConfig = {
      preset: 'default',
      mu: 25,
      sigma: 8.333,
    }

    const rating = createInitialRating(config)

    expect(rating.mu).toBe(config.mu)
    expect(rating.sigma).toBe(config.sigma)
    expect(conservativeRating(rating)).toBeCloseTo(rating.mu - 3 * rating.sigma)
  })

  it('updates ratings for a simple two-team game', () => {
    const config: RatingConfig = {
      preset: 'default',
      mu: 25,
      sigma: 8.333,
    }

    const initial = createInitialRating(config)

    const teams = [[initial], [initial]]
    const ranks = [1, 2]

    const updated = updateRatingsForGame(teams, ranks, config)

    const winner = updated[0]?.[0]
    const loser = updated[1]?.[0]

    expect(winner).toBeDefined()
    expect(loser).toBeDefined()
    if (!winner || !loser) return

    expect(winner.mu).toBeGreaterThan(initial.mu)
    expect(loser.mu).toBeLessThan(initial.mu)
  })
})

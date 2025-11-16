import { describe, expect, it } from 'vitest'
import { createInitialRating, conservativeRating } from '../../../src/lib/openskill/ratings'
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
})

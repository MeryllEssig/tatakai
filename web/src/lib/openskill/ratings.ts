import { rating as osRating, rate as osRate } from 'openskill'
import type { Rating, RatingConfig } from '../domain/types'

type OsRating = ReturnType<typeof osRating>

function toOsRating(value: Rating, config: RatingConfig): OsRating {
  return osRating({
    mu: value.mu,
    sigma: value.sigma,
    ...(config.beta != null ? { beta: config.beta } : {}),
    ...(config.tau != null ? { tau: config.tau } : {}),
  })
}

function fromOsRating(value: OsRating): Rating {
  return {
    mu: value.mu,
    sigma: value.sigma,
  }
}

export function createInitialRating(config: RatingConfig): Rating {
  return {
    mu: config.mu,
    sigma: config.sigma,
  }
}

export function updateRatingsForGame(
  teams: Rating[][],
  ranks: number[],
  config: RatingConfig,
): Rating[][] {
  const osTeams = teams.map((team) => team.map((rating) => toOsRating(rating, config)))

  const updated = osRate(osTeams, {
    rank: ranks,
    ...(config.beta != null ? { beta: config.beta } : {}),
    ...(config.tau != null ? { tau: config.tau } : {}),
  })

  return updated.map((team) => team.map((rating) => fromOsRating(rating)))
}

export function conservativeRating(rating: Rating): number {
  return rating.mu - 3 * rating.sigma
}

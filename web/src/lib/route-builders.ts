export type TournamentSubRoute =
  | 'overview'
  | 'history'
  | 'leaderboard'
  | 'matchmaking'
  | 'settings'
  | 'new-game'

export function buildTournamentRoute(id: string, view: TournamentSubRoute = 'overview'): string {
  const trimmed = id.trim()
  if (!trimmed) {
    throw new Error('buildTournamentRoute: tournament id must be a non-empty string')
  }

  if (view === 'overview') {
    return `/tournament/${trimmed}`
  }

  if (view === 'new-game') {
    return `/tournament/${trimmed}/new-game`
  }

  return `/tournament/${trimmed}/${view}`
}

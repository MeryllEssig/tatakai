import { describe, expect, it } from 'vitest'
import { buildTournamentRoute } from '../../src/lib/route-builders'

describe('buildTournamentRoute', () => {
  it('builds overview route by default', () => {
    expect(buildTournamentRoute('abc')).toBe('/tournament/abc')
  })

  it('builds history route', () => {
    expect(buildTournamentRoute('abc', 'history')).toBe('/tournament/abc/history')
  })

  it('builds leaderboard route', () => {
    expect(buildTournamentRoute('abc', 'leaderboard')).toBe('/tournament/abc/leaderboard')
  })

  it('builds matchmaking route', () => {
    expect(buildTournamentRoute('abc', 'matchmaking')).toBe('/tournament/abc/matchmaking')
  })

  it('builds settings route', () => {
    expect(buildTournamentRoute('abc', 'settings')).toBe('/tournament/abc/settings')
  })

  it('builds new-game route', () => {
    expect(buildTournamentRoute('abc', 'new-game')).toBe('/tournament/abc/new-game')
  })

  it('trims whitespace in id', () => {
    expect(buildTournamentRoute('  abc  ', 'history')).toBe('/tournament/abc/history')
  })

  it('throws on empty id', () => {
    expect(() => buildTournamentRoute('   ')).toThrowError()
  })
})

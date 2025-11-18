import { Button } from '@/components/retroui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { Switch } from '@/components/retroui/Switch'
import { useAtom } from 'jotai/react'
import type { FormEvent, ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { recordGameResult } from '../../lib/games/game-service'
import { buildTournamentRoute } from '../../lib/route-builders'
import { gameDataAtom, nextGameSuggestedPlayerIdsAtom } from '../../state/atoms'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { PlayerAvatar } from '../../ui/components/player-avatar'
import { TatakaiIcon } from '../../ui/components/tatakai-icon'

interface PlayerGameState {
  isActive: boolean
  rank: number | null
}

type PlayerStateById = Record<string, PlayerGameState>

export function GameResultScreen(): ReactElement {
  const [gameData, setGameData] = useAtom(gameDataAtom)
  const [suggestedPlayerIds, setSuggestedPlayerIds] = useAtom(nextGameSuggestedPlayerIdsAtom)
  const navigate = useNavigate()
  const [playerStates, setPlayerStates] = useState<PlayerStateById>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!gameData) {
      setPlayerStates({})
      return
    }

    setPlayerStates((current) => {
      const next: PlayerStateById = {}
      const suggested = suggestedPlayerIds ?? []

      gameData.players.forEach((player) => {
        if (!player.isActive) return
        const existing = current[player.id]
        if (existing) {
          next[player.id] = existing
        } else {
          const isSuggested = suggested.includes(player.id)
          next[player.id] = { isActive: isSuggested, rank: null }
        }
      })

      return next
    })
  }, [gameData, suggestedPlayerIds])

  if (!gameData) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('gameResult.noTournamentTitle')}</CardTitle>
            <CardDescription>{t('gameResult.noTournamentDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('gameResult.backToList')}
              onClick={() => navigate('/')}
            >
              <TatakaiIcon name="back" className="text-base" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activePlayers = gameData.players.filter((player) => player.isActive)
  const rankMax = gameData.settings.rankMax || 12
  const maxPlayersPerGame = gameData.maxPlayersPerGame

  const handleToggleActive = (playerId: string, nextIsActive?: boolean) => {
    setPlayerStates((current) => {
      const previous = current[playerId] ?? { isActive: false, rank: null }
      const isActive = nextIsActive ?? !previous.isActive

      return {
        ...current,
        [playerId]: { ...previous, isActive },
      }
    })
  }

  const handleSelectRank = (playerId: string, rank: number) => {
    setPlayerStates((current) => {
      const previous = current[playerId] ?? { isActive: false, rank: null }
      const isSameRank = previous.rank === rank
      const nextRank = isSameRank ? null : rank
      const nextIsActive = previous.isActive || nextRank !== null

      return {
        ...current,
        [playerId]: { ...previous, isActive: nextIsActive, rank: nextRank },
      }
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!gameData) {
      setError(t('gameResult.errorNoTournament'))
      return
    }

    type ParticipantCandidate = {
      playerId: string
      name: string
      rank: number | null
    }

    const candidates: ParticipantCandidate[] = gameData.players
      .filter((player) => player.isActive)
      .map((player) => {
        const state = playerStates[player.id]
        if (!state?.isActive) return null
        return {
          playerId: player.id,
          name: player.name,
          rank: state.rank,
        }
      })
      .filter((entry): entry is ParticipantCandidate => entry !== null)

    if (candidates.length < 2) {
      setError(t('gameResult.errorNotEnoughPlayers'))
      return
    }

    if (candidates.length > maxPlayersPerGame) {
      setError(t('gameResult.errorTooManyPlayers', { max: maxPlayersPerGame }))
      return
    }

    const invalidRank = candidates.find(
      (candidate) =>
        candidate.rank == null ||
        !Number.isInteger(candidate.rank) ||
        candidate.rank <= 0 ||
        candidate.rank > rankMax,
    )

    if (invalidRank) {
      setError(t('gameResult.errorInvalidRank', { maxRank: rankMax }))
      return
    }

    const participants = candidates.map((candidate) => ({
      ...candidate,
      rank: candidate.rank as number,
    }))

    const groupsByRank = new Map<number, typeof participants>()

    participants.forEach((participant) => {
      const existing = groupsByRank.get(participant.rank)
      if (existing) {
        existing.push(participant)
      } else {
        groupsByRank.set(participant.rank, [participant])
      }
    })

    const sortedRanks = Array.from(groupsByRank.keys()).sort((a, b) => a - b)

    const teamsInput = sortedRanks.map((rankValue, index) => {
      const group = groupsByRank.get(rankValue) ?? []
      return {
        id: `rank-group-${index + 1}`,
        name: t('gameResult.rankGroup', { rank: rankValue }),
        playerIds: group.map((participant) => participant.playerId),
      }
    })

    const resultsInput = teamsInput.map((team, index) => ({
      teamId: team.id,
      rank: index + 1,
    }))

    try {
      setIsSubmitting(true)

      const updated = recordGameResult({
        gameData,
        teams: teamsInput,
        results: resultsInput,
      })

      setGameData(updated)
      setSuggestedPlayerIds(null)
      navigate(buildTournamentRoute(updated.id, 'overview'))
    } catch (unknownError) {
      console.error(unknownError)
      setError(t('gameResult.errorSaveFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const rankNumbers = Array.from({ length: rankMax }, (_, index) => index + 1)

  return (
    <div className="flex flex-col gap-4">
      <PageContentHeader title={t('gameResult.title')} subtitle={t('gameResult.subtitle')} />

      {activePlayers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('gameResult.noActivePlayersTitle')}</CardTitle>
            <CardDescription>{t('gameResult.noActivePlayersDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('gameResult.backToTournament')}
              onClick={() => navigate(buildTournamentRoute(gameData.id, 'overview'))}
            >
              <TatakaiIcon name="back" className="text-base" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{t('gameResult.sectionTitle')}</CardTitle>
              <CardDescription>
                {t('gameResult.sectionDescription', { maxRank: rankMax })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="flex flex-wrap gap-3">
                {activePlayers.map((player) => {
                  const state = playerStates[player.id] ?? { isActive: false, rank: null }
                  const isActive = state.isActive
                  const selectedRank = state.rank

                  return (
                    <div
                      key={player.id}
                      className="flex min-w-[260px] flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <PlayerAvatar playerId={player.id} displayName={player.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{player.name}</p>
                          <p className="text-xs text-slate-600">
                            {t('gameResult.playerSummary', {
                              games: player.gamesPlayed,
                              bench: player.benchStreak,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => handleToggleActive(player.id, checked)}
                          aria-label={t('gameResult.playerActiveLabelActive')}
                        />
                        <span className="text-xs text-slate-700">
                          {t('gameResult.playerActiveLabelActive')}
                        </span>
                      </div>

                      {isActive ? (
                        <div
                          className="mt-2 grid gap-1"
                          style={{
                            gridTemplateColumns: 'repeat(auto-fit, minmax(2.5rem, 1fr))',
                          }}
                        >
                          {rankNumbers.map((rank) => {
                            const isSelected = selectedRank === rank
                            return (
                              <Button
                                key={rank}
                                type="button"
                                size="sm"
                                className="h-10 w-10 grid place-content-center"
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => handleSelectRank(player.id, rank)}
                              >
                                {rank}
                              </Button>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(buildTournamentRoute(gameData.id, 'overview'))}
                >
                  {t('gameResult.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <TatakaiIcon name="save" className="mr-2 text-base" />
                  {t('gameResult.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}

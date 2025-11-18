import { Button } from '@/components/retroui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useAtom } from 'jotai/react'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import type { Player } from '../../lib/domain/types'
import { deleteGameAndRecompute } from '../../lib/recompute/recompute-ratings'
import { buildTournamentRoute } from '../../lib/route-builders'
import { gameDataAtom } from '../../state/atoms'
import { PageContentHeader } from '../../ui/components/page-content-header'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export function GameHistoryScreen(): ReactElement {
  const [gameData, setGameData] = useAtom(gameDataAtom)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  if (!gameData) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('history.title')}</CardTitle>
            <CardDescription>{t('history.noTournamentDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('history.backToList')}
              onClick={() => navigate('/')}
            >
              <ArrowLeftOutlined aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const games = [...gameData.games].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const playersById = new Map<string, Player>()
  gameData.players.forEach((player) => {
    playersById.set(player.id, player)
  })

  const handleDelete = (gameId: string) => {
    if (!gameData) return

    const confirmed = window.confirm(t('history.deleteConfirm'))

    if (!confirmed) return

    try {
      setError(null)
      const updated = deleteGameAndRecompute(gameData, gameId)
      setGameData(updated)
    } catch (unknownError) {
      console.error(unknownError)
      setError(t('history.deleteError'))
    }
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('history.title')}</CardTitle>
            <CardDescription>{t('history.noGamesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('history.backToTournament')}
              onClick={() => {
                if (!id) {
                  navigate('/')
                  return
                }
                navigate(buildTournamentRoute(id, 'overview'))
              }}
            >
              <ArrowLeftOutlined aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageContentHeader title={t('history.title')} subtitle={t('history.subtitle')}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={t('history.backToTournament')}
          onClick={() => {
            if (!id) {
              navigate('/')
              return
            }
            navigate(buildTournamentRoute(id, 'overview'))
          }}
        >
          <ArrowLeftOutlined aria-hidden="true" />
        </Button>
      </PageContentHeader>

      <Card>
        <CardHeader>
          <CardTitle>{t('history.gamesTitle')}</CardTitle>
          <CardDescription>{t('history.gamesDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-700">
                  <th className="py-1 pr-2 text-left font-medium">{t('history.tableDate')}</th>
                  <th className="py-1 px-2 text-left font-medium">
                    {t('history.tableTeamsAndRanks')}
                  </th>
                  <th className="py-1 pl-2 text-right font-medium">{t('history.tableActions')}</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => {
                  const rankByTeamId = new Map<string, number>()
                  game.teamResults.forEach((result) => {
                    rankByTeamId.set(result.teamId, result.rank)
                  })

                  return (
                    <tr
                      key={game.id}
                      className="border-b border-slate-900/60 last:border-b-0 hover:bg-slate-100"
                    >
                      <td className="py-2 pr-2 align-top text-left text-xs tabular-nums">
                        {formatDate(game.createdAt)}
                      </td>
                      <td className="py-2 px-2 align-top">
                        <ul className="flex flex-col gap-1 text-xs">
                          {game.teams.map((team) => {
                            const rank = rankByTeamId.get(team.id)
                            const playerNames = team.playerIds
                              .map(
                                (playerId) =>
                                  playersById.get(playerId)?.name ?? t('history.unknownPlayerName'),
                              )
                              .join(', ')

                            return (
                              <li key={team.id}>
                                <span className="font-medium text-slate-900">
                                  {t('history.rankLabel', { rank: rank ?? '?' })}
                                </span>{' '}
                                <span className="text-slate-700">: {playerNames}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </td>
                      <td className="py-2 pl-2 align-top text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(game.id)}
                        >
                          {t('history.deleteButton')}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

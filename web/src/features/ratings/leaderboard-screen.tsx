import { Button } from '@/components/retroui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useAtomValue } from 'jotai/react'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { buildTournamentRoute } from '../../lib/route-builders'
import { gameDataAtom } from '../../state/atoms'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { useRatingSnapshots } from './use-rating-snapshots'

export function LeaderboardScreen(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const navigate = useNavigate()
  const snapshots = useRatingSnapshots()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  if (!gameData) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('leaderboard.title')}</CardTitle>
            <CardDescription>{t('leaderboard.noTournamentDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('leaderboard.backToList')}
              onClick={() => navigate('/')}
            >
              <ArrowLeftOutlined aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('leaderboard.title')}</CardTitle>
            <CardDescription>{t('leaderboard.noSnapshotsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('leaderboard.backToTournament')}
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
      <PageContentHeader title={t('leaderboard.title')} subtitle={t('leaderboard.subtitle')}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={t('leaderboard.backToTournament')}
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
          <CardTitle>{t('leaderboard.panelTitle')}</CardTitle>
          <CardDescription>{t('leaderboard.panelDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-700">
                <th className="py-1 pr-2 text-left font-medium">{t('leaderboard.tableRank')}</th>
                <th className="py-1 pr-2 text-left font-medium">{t('leaderboard.tablePlayer')}</th>
                <th className="py-1 px-2 text-right font-medium">{t('leaderboard.tableMu')}</th>
                <th className="py-1 px-2 text-right font-medium">{t('leaderboard.tableSigma')}</th>
                <th className="py-1 px-2 text-right font-medium">
                  {t('leaderboard.tableMuConservative')}
                </th>
                <th className="py-1 px-2 text-right font-medium">{t('leaderboard.tableGames')}</th>
                <th className="py-1 pl-2 text-right font-medium">{t('leaderboard.tableBench')}</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map(({ player, conservative }, index) => {
                const rank = index + 1
                const highlightClass =
                  rank === 1
                    ? 'bg-[#fffbeb] border-l-4 border-l-[#ffdb33]'
                    : rank === 2
                    ? 'bg-sky-50 border-l-4 border-l-sky-300'
                    : rank === 3
                    ? 'bg-emerald-50 border-l-4 border-l-emerald-300'
                    : ''

                return (
                  <tr
                    key={player.id}
                    className={`border-b border-slate-900/60 last:border-b-0 hover:bg-slate-100 ${highlightClass}`}
                  >
                    <td className="py-1 pr-2 text-left tabular-nums">{rank}</td>
                    <td className="py-1 pr-2 text-left">
                      <span className="font-medium text-slate-900">{player.name}</span>
                      {!player.isActive ? (
                        <span className="ml-1 text-xs text-slate-600">
                          {t('leaderboard.inactiveBadge')}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-1 px-2 text-right tabular-nums">
                      {player.rating.mu.toFixed(2)}
                    </td>
                    <td className="py-1 px-2 text-right tabular-nums">
                      {player.rating.sigma.toFixed(2)}
                    </td>
                    <td className="py-1 px-2 text-right tabular-nums">{conservative.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right tabular-nums">{player.gamesPlayed}</td>
                    <td className="py-1 pl-2 text-right tabular-nums">{player.benchStreak}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

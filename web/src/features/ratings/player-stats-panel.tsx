import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { useAtomValue } from 'jotai/react'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { gameDataAtom } from '../../state/atoms'
import { useRatingSnapshots } from './use-rating-snapshots'

export function PlayerStatsPanel(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const snapshots = useRatingSnapshots()
  const { t } = useTranslation()

  if (!gameData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('stats.title')}</CardTitle>
          <CardDescription>{t('stats.noTournamentDescription')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (snapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('stats.title')}</CardTitle>
          <CardDescription>{t('stats.noSnapshotsDescription')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('stats.title')}</CardTitle>
        <CardDescription>{t('stats.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-700">
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
            {snapshots.map(({ player, conservative }) => (
              <tr
                key={player.id}
                className="border-b border-slate-900/60 last:border-b-0 hover:bg-slate-100"
              >
                <td className="py-1 pr-2 text-left">
                  <span className="font-medium text-slate-900">{player.name}</span>
                  {!player.isActive ? (
                    <span className="ml-1 text-xs text-slate-600">
                      {t('leaderboard.inactiveBadge')}
                    </span>
                  ) : null}
                </td>
                <td className="py-1 px-2 text-right tabular-nums">{player.rating.mu.toFixed(2)}</td>
                <td className="py-1 px-2 text-right tabular-nums">
                  {player.rating.sigma.toFixed(2)}
                </td>
                <td className="py-1 px-2 text-right tabular-nums">{conservative.toFixed(2)}</td>
                <td className="py-1 px-2 text-right tabular-nums">{player.gamesPlayed}</td>
                <td className="py-1 pl-2 text-right tabular-nums">{player.benchStreak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

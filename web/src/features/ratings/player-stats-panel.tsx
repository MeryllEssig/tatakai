import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { Table } from '@/components/retroui/Table'
import { useAtomValue } from 'jotai/react'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { gameDataAtom } from '../../state/atoms'
import { PlayerAvatar } from '../../ui/components/player-avatar'
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
        <Table className="table-auto text-sm">
          <Table.Header>
            <Table.Row>
              <Table.Head className="py-1 pr-2 text-left font-medium">
                {t('leaderboard.tablePlayer')}
              </Table.Head>
              <Table.Head className="py-1 px-2 text-right font-medium">
                {t('leaderboard.tableMu')}
              </Table.Head>
              <Table.Head className="py-1 px-2 text-right font-medium">
                {t('leaderboard.tableSigma')}
              </Table.Head>
              <Table.Head className="py-1 px-2 text-right font-medium">
                {t('leaderboard.tableMuConservative')}
              </Table.Head>
              <Table.Head className="py-1 px-2 text-right font-medium">
                {t('leaderboard.tableGames')}
              </Table.Head>
              <Table.Head className="py-1 pl-2 text-right font-medium">
                {t('leaderboard.tableBench')}
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {snapshots.map(({ player, conservative }) => (
              <Table.Row
                key={player.id}
                className="border-b border-slate-900/60 last:border-b-0 hover:bg-slate-100"
              >
                <Table.Cell className="py-1 pr-2 text-left">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar playerId={player.id} displayName={player.name} size="sm" />
                    <span className="font-medium text-slate-900">{player.name}</span>
                    {!player.isActive ? (
                      <span className="ml-1 text-xs text-slate-600">
                        {t('leaderboard.inactiveBadge')}
                      </span>
                    ) : null}
                  </div>
                </Table.Cell>
                <Table.Cell className="py-1 px-2 text-right tabular-nums">
                  {player.rating.mu.toFixed(2)}
                </Table.Cell>
                <Table.Cell className="py-1 px-2 text-right tabular-nums">
                  {player.rating.sigma.toFixed(2)}
                </Table.Cell>
                <Table.Cell className="py-1 px-2 text-right tabular-nums">
                  {conservative.toFixed(2)}
                </Table.Cell>
                <Table.Cell className="py-1 px-2 text-right tabular-nums">
                  {player.gamesPlayed}
                </Table.Cell>
                <Table.Cell className="py-1 pl-2 text-right tabular-nums">
                  {player.benchStreak}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </CardContent>
    </Card>
  )
}

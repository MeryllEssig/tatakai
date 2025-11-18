import { Button } from '@/components/retroui/Button'
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
import { useNavigate, useParams } from 'react-router-dom'
import { buildTournamentRoute } from '../../lib/route-builders'
import { gameDataAtom } from '../../state/atoms'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { PlayerAvatar } from '../../ui/components/player-avatar'
import { TatakaiIcon } from '../../ui/components/tatakai-icon'
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
              <TatakaiIcon name="back" className="text-base" />
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
              <TatakaiIcon name="back" className="text-base" />
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
          <TatakaiIcon name="back" className="text-base" />
        </Button>
      </PageContentHeader>

      <Card>
        <CardHeader>
          <CardTitle>{t('leaderboard.panelTitle')}</CardTitle>
          <CardDescription>{t('leaderboard.panelDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="table-auto text-sm">
            <Table.Header>
              <Table.Row>
                <Table.Head className="py-1 pr-2 text-left font-medium">
                  {t('leaderboard.tableRank')}
                </Table.Head>
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
                  <Table.Row
                    key={player.id}
                    className={`border-b border-slate-900/60 last:border-b-0 hover:bg-slate-100 ${highlightClass}`}
                  >
                    <Table.Cell className="py-1 pr-2 text-left tabular-nums">{rank}</Table.Cell>
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
                )
              })}
            </Table.Body>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

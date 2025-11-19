import { Button } from '@/components/retroui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import type { TournamentSummary } from '../../lib/domain/types'
import { buildTournamentRoute } from '../../lib/route-builders'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { TatakaiIcon } from '../../ui/components/tatakai-icon'
import { listStoredTournamentSummaries } from '../persistence/local-storage-adapter'
import { PlayerListPanel } from '../players/player-list-panel'
import { PlayerStatsPanel } from '../ratings/player-stats-panel'
import { importTournamentFromJson } from './import-tournament'
import { TournamentSettingsPanel } from './tournament-settings-panel'
import { useTournamentSelection } from './use-tournament-selection'

function formatLastGameDate(
  value: string | null,
  labels: { none: string; unknown: string },
): string {
  if (!value) return labels.none
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return labels.unknown
  return date.toLocaleString()
}

export function TournamentListScreen(): ReactElement {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>(() =>
    listStoredTournamentSummaries(),
  )
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { selectTournament } = useTournamentSelection()
  const { id } = useParams<{ id?: string }>()
  const { t } = useTranslation()

  const hasTournaments = tournaments.length > 0

  const handleImport = (): void => {
    const trimmed = importText.trim()

    setImportStatus(null)
    setImportError(null)

    if (!trimmed) {
      setImportError(t('home.importErrorEmpty'))
      return
    }

    try {
      const imported = importTournamentFromJson(trimmed)
      setTournaments(listStoredTournamentSummaries())
      selectTournament(imported.id)
      setImportStatus(t('home.importStatusSuccess'))
      setIsImportOpen(false)
      setImportText('')
    } catch (unknownError) {
      console.error(unknownError)

      const message =
        unknownError instanceof Error && unknownError.message
          ? unknownError.message
          : t('home.importErrorGeneric')

      setImportError(message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageContentHeader
        title={id ? t('home.titleWithId') : t('home.title')}
        subtitle={id ? t('home.subtitleWithId') : t('home.subtitle')}
      >
        {id ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(buildTournamentRoute(id, 'history'))}
            >
              <TatakaiIcon name="history" className="text-base" />
              {/* {t('home.history')} */}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(buildTournamentRoute(id, 'leaderboard'))}
            >
              <TatakaiIcon name="leaderboard" className="text-base" />
              {/* {t('home.leaderboard')} */}
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#ffdb33] text-slate-900 hover:bg-[#facc15]"
              onClick={() => navigate(buildTournamentRoute(id, 'matchmaking'))}
            >
              <TatakaiIcon name="matchmaking" className="text-base" />
              {t('home.matchmaking')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-sky-100 hover:bg-sky-200"
              onClick={() => navigate(buildTournamentRoute(id, 'new-game'))}
            >
              <TatakaiIcon name="newGame" className="text-base" />
              {t('home.newGame')}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => navigate('/')}>
              <TatakaiIcon name="back" className="text-base" />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsImportOpen((prev) => !prev)
                setImportStatus(null)
                setImportError(null)
              }}
            >
              <TatakaiIcon name="import" className="text-base" />
              {t('home.importButton')}
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#ffdb33] text-slate-900 hover:bg-[#facc15]"
              onClick={() => navigate('/new-tournament')}
            >
              <TatakaiIcon name="newTournament" className="mr-1 text-base" />
              {t('home.newTournamentButton')}
            </Button>
          </>
        )}
      </PageContentHeader>

      {!id && isImportOpen ? (
        <Card className="border border-dashed border-slate-700">
          <CardHeader>
            <CardTitle>{t('home.importTitle')}</CardTitle>
            <CardDescription>{t('home.importDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            {importStatus ? <p className="text-emerald-400">{importStatus}</p> : null}
            {importError ? <p className="text-red-400">{importError}</p> : null}

            <textarea
              className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-slate-100"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder={t('home.importPlaceholder')}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsImportOpen(false)
                  setImportText('')
                  setImportStatus(null)
                  setImportError(null)
                }}
              >
                {t('home.importCancel')}
              </Button>
              <Button type="button" variant="outline" onClick={handleImport}>
                {t('home.importSubmit')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {id ? (
        <div className="flex flex-col gap-4">
          <PlayerListPanel />
          <div className="grid gap-4 lg:grid-cols-2">
            <PlayerStatsPanel />
            <TournamentSettingsPanel />
          </div>
        </div>
      ) : (
        <div>
          {!hasTournaments ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('home.noTournamentTitle')}</CardTitle>
                <CardDescription>{t('home.noTournamentDescription')}</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {tournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="cursor-pointer"
                  onClick={() => navigate(buildTournamentRoute(tournament.id, 'overview'))}
                >
                  <CardHeader>
                    <CardTitle>{tournament.name}</CardTitle>
                    <CardDescription>
                      {t('home.cardPlayersCount', { count: tournament.playerCount })} ·{' '}
                      {t('home.cardGamesCount', { count: tournament.gameCount })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {t('home.lastGameLabel', {
                        date: formatLastGameDate(tournament.lastGameDate, {
                          none: t('home.lastGameNone'),
                          unknown: t('home.lastGameUnknown'),
                        }),
                      })}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

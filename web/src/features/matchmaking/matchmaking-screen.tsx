import { Button } from '@/components/retroui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { Input } from '@/components/retroui/Input'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useAtomValue } from 'jotai/react'
import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import type { Player } from '../../lib/domain/types'
import type { MatchmakingResult } from '../../lib/matchmaking/engine'
import { generateMatchmakingSuggestion } from '../../lib/matchmaking/engine'
import { buildTournamentRoute } from '../../lib/route-builders'
import { gameDataAtom } from '../../state/atoms'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { useAcceptSuggestion } from './use-accept-suggestion'

interface MatchmakingFormState {
  maxPlayersPerGame: number
  maxTeams: number
  benchFairnessEnabled: boolean
}

function getActivePlayers(gameData: { players: Player[] }): Player[] {
  return gameData.players.filter((player) => player.isActive)
}

export function MatchmakingScreen(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const activePlayers = gameData ? getActivePlayers(gameData) : []
  const { t } = useTranslation()

  const initialFormState: MatchmakingFormState = gameData
    ? {
        maxPlayersPerGame:
          gameData.settings.matchmakingMaxPlayers && gameData.settings.matchmakingMaxPlayers > 0
            ? gameData.settings.matchmakingMaxPlayers
            : Math.max(2, Math.min(4, activePlayers.length || 2)),
        maxTeams: Math.max(2, Math.min(4, activePlayers.length || 2)),
        benchFairnessEnabled: gameData.settings.benchFairnessEnabled,
      }
    : {
        maxPlayersPerGame: 4,
        maxTeams: 2,
        benchFairnessEnabled: true,
      }

  const [formState, setFormState] = useState<MatchmakingFormState>(initialFormState)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(() =>
    activePlayers.map((player) => player.id),
  )
  const [result, setResult] = useState<MatchmakingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const acceptSuggestion = useAcceptSuggestion()

  if (!gameData) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('matchmaking.title')}</CardTitle>
            <CardDescription>{t('matchmaking.noTournamentDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              aria-label={t('matchmaking.backToList')}
              onClick={() => navigate('/')}
            >
              <ArrowLeftOutlined aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleFormChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const handleGenerate = () => {
    setError(null)
    setResult(null)

    if (selectedCandidateIds.length < 2) {
      setError(t('matchmaking.errorNotEnoughCandidates'))
      return
    }

    const maxPlayers = Math.max(2, Math.min(formState.maxPlayersPerGame, activePlayers.length))
    const maxTeams = Math.max(2, Math.min(formState.maxTeams, maxPlayers))

    const suggestionResult = generateMatchmakingSuggestion(gameData, selectedCandidateIds, {
      maxPlayersPerGame: maxPlayers,
      maxTeams,
      benchFairnessEnabled: formState.benchFairnessEnabled,
    })

    if (!suggestionResult) {
      setError(t('matchmaking.errorNoSuggestion'))
      return
    }

    setResult(suggestionResult)
  }

  const handleToggleCandidate = (playerId: string) => {
    setSelectedCandidateIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId)
      }
      return [...current, playerId]
    })
  }

  const handleSelectAll = () => {
    setSelectedCandidateIds(activePlayers.map((player) => player.id))
  }

  const handleClearAll = () => {
    setSelectedCandidateIds([])
  }

  const handleAccept = () => {
    if (!result) return

    const playerIds = result.suggestion.teams.flatMap((team) => team.playerIds)
    acceptSuggestion(playerIds)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageContentHeader title={t('matchmaking.title')} subtitle={t('matchmaking.subtitle')}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={t('matchmaking.backToTournament')}
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{t('matchmaking.settingsTitle')}</CardTitle>
            <CardDescription>{t('matchmaking.settingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleFormChange} className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="max-players">
                    {t('matchmaking.maxPlayersLabel')}
                  </label>
                  <Input
                    id="max-players"
                    type="number"
                    min={2}
                    max={activePlayers.length || 2}
                    value={formState.maxPlayersPerGame}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value || '0', 10)
                      setFormState((current) => ({
                        ...current,
                        maxPlayersPerGame: Number.isNaN(value) ? current.maxPlayersPerGame : value,
                      }))
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="max-teams">
                    {t('matchmaking.maxTeamsLabel')}
                  </label>
                  <Input
                    id="max-teams"
                    type="number"
                    min={2}
                    max={formState.maxPlayersPerGame}
                    value={formState.maxTeams}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value || '0', 10)
                      setFormState((current) => ({
                        ...current,
                        maxTeams: Number.isNaN(value) ? current.maxTeams : value,
                      }))
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t('matchmaking.benchFairnessLabel')}</span>
                  <span className="text-xs text-slate-600">
                    {t('matchmaking.benchFairnessHelp')}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={formState.benchFairnessEnabled ? 'default' : 'outline'}
                  onClick={() =>
                    setFormState((current) => ({
                      ...current,
                      benchFairnessEnabled: !current.benchFairnessEnabled,
                    }))
                  }
                >
                  {formState.benchFairnessEnabled
                    ? t('matchmaking.benchFairnessOn')
                    : t('matchmaking.benchFairnessOff')}
                </Button>
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  className="bg-[#ffdb33] text-slate-900 hover:bg-[#facc15]"
                  onClick={handleGenerate}
                  disabled={activePlayers.length < 2}
                >
                  {t('matchmaking.generateButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('matchmaking.candidatesTitle')}</CardTitle>
            <CardDescription>{t('matchmaking.candidatesDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            {activePlayers.length === 0 ? (
              <p className="text-sm text-slate-600">{t('matchmaking.noActivePlayers')}</p>
            ) : (
              <>
                <div className="flex justify-between gap-2 text-xs">
                  <Button type="button" size="sm" variant="link" onClick={handleSelectAll}>
                    {t('matchmaking.selectAll')}
                  </Button>
                  <Button type="button" size="sm" variant="link" onClick={handleClearAll}>
                    {t('matchmaking.clearAll')}
                  </Button>
                </div>

                <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                  {activePlayers.map((player) => {
                    const isSelected = selectedCandidateIds.includes(player.id)

                    return (
                      <label
                        key={player.id}
                        className={`flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-[3px_3px_0_0_#020617] ${
                          isSelected ? 'border-l-4 border-l-[#ffdb33]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[#ffdb33]"
                            checked={isSelected}
                            onChange={() => handleToggleCandidate(player.id)}
                          />
                          <div>
                            <p className="font-medium text-slate-900">{player.name}</p>
                            <p className="text-xs text-slate-600">
                              {t('matchmaking.playerSummary', {
                                games: player.gamesPlayed,
                                streak: player.benchStreak,
                              })}
                            </p>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {result ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{t('matchmaking.suggestionTitle')}</CardTitle>
              <CardDescription>{t('matchmaking.suggestionDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {result.suggestion.teams.map((team, index) => {
                const players = team.playerIds
                  .map((playerId) => gameData.players.find((player) => player.id === playerId))
                  .filter((player): player is Player => Boolean(player))

                const mean = result.diagnostics.teamMeans[index]
                const conservativeMean = result.diagnostics.teamConservativeMeans[index]

                return (
                  <div
                    key={team.id}
                    className="flex flex-col gap-1 rounded-2xl border-2 border-slate-900 bg-slate-50 p-3 shadow-[4px_4px_0_0_#020617]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {t('matchmaking.teamLabel', { index: index + 1 })}
                      </p>
                      <p className="text-xs text-slate-600">
                        {t('matchmaking.teamSummary', {
                          mean: mean.toFixed(2),
                          conservative: conservativeMean.toFixed(2),
                        })}
                      </p>
                    </div>
                    <ul className="mt-1 flex flex-col gap-1 text-sm">
                      {players.map((player) => (
                        <li key={player.id} className="flex justify-between gap-2">
                          <span className="text-slate-900">{player.name}</span>
                          <span className="text-xs text-slate-600">
                            {t('matchmaking.playerRatingSummary', {
                              mu: player.rating.mu.toFixed(2),
                              sigma: player.rating.sigma.toFixed(2),
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  className="bg-[#ffdb33] text-slate-900 hover:bg-[#facc15]"
                  onClick={handleAccept}
                >
                  {t('matchmaking.acceptSuggestion')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('matchmaking.benchCandidatesTitle')}</CardTitle>
              <CardDescription>{t('matchmaking.benchCandidatesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {result.benchCandidates.length === 0 ? (
                <p className="text-xs text-slate-600">{t('matchmaking.noBenchCandidates')}</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {result.benchCandidates.map((playerId) => {
                    const player = gameData.players.find((p) => p.id === playerId)
                    if (!player) return null

                    return (
                      <li key={player.id} className="flex justify-between gap-2">
                        <span className="text-slate-900">{player.name}</span>
                        <span className="text-xs text-slate-600">
                          {t('matchmaking.benchBadge', {
                            streak: player.benchStreak,
                            sigma: player.rating.sigma.toFixed(2),
                          })}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

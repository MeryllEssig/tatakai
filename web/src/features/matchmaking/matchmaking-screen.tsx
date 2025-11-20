import { Button } from '@/components/retroui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/retroui/Card'
import { Input } from '@/components/retroui/Input'
import { useAtomValue } from 'jotai/react'
import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import type { Player } from '../../lib/domain/types'
import type { MatchmakingResult } from '../../lib/matchmaking/engine'
import { generateMatchmakingSuggestion } from '../../lib/matchmaking/engine'
import type { MatchmakingFormState } from '../../lib/matchmaking/form-state'
import {
  accumulateUsedPlayerIds,
  filterAvailableCandidateIds,
  getActivePlayers,
  getDefaultMatchmakingFormState,
  getSelectedCandidateIds,
} from '../../lib/matchmaking/form-state'
import { buildTournamentRoute } from '../../lib/route-builders'
import { gameDataAtom } from '../../state/atoms'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { PlayerAvatar } from '../../ui/components/player-avatar'
import { TatakaiIcon } from '../../ui/components/tatakai-icon'
import { useAcceptSuggestion } from './use-accept-suggestion'

export function MatchmakingScreen(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const activePlayers = gameData ? getActivePlayers(gameData) : []
  const { t } = useTranslation()

  const defaultFormState: MatchmakingFormState = getDefaultMatchmakingFormState(
    gameData,
    activePlayers,
  )

  const [manualFormState, setManualFormState] = useState<MatchmakingFormState | null>(null)
  const [manualSelectedCandidateIds, setManualSelectedCandidateIds] = useState<string[] | null>(
    null,
  )
  const [usedPlayerIds, setUsedPlayerIds] = useState<string[]>([])
  const [results, setResults] = useState<MatchmakingResult[]>([])
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
              <TatakaiIcon name="back" className="text-base" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formState = manualFormState ?? defaultFormState

  const selectedCandidateIds = getSelectedCandidateIds(manualSelectedCandidateIds, activePlayers)

  const handleFormChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const handleGenerate = () => {
    setError(null)

    const availableCandidateIds = filterAvailableCandidateIds(selectedCandidateIds, usedPlayerIds)

    if (availableCandidateIds.length < 2) {
      setError(t('matchmaking.errorNotEnoughCandidates'))
      return
    }

    const maxPlayers = Math.max(2, Math.min(formState.maxPlayersPerGame, activePlayers.length))
    const maxTeams = Math.max(2, Math.min(formState.maxTeams, maxPlayers))

    const suggestionResult = generateMatchmakingSuggestion(gameData, availableCandidateIds, {
      maxPlayersPerGame: maxPlayers,
      maxTeams,
      benchFairnessEnabled: formState.benchFairnessEnabled,
    })

    if (!suggestionResult) {
      setError(t('matchmaking.errorNoSuggestion'))
      return
    }

    setResults((current) => [...current, suggestionResult])

    setUsedPlayerIds((current) => accumulateUsedPlayerIds(current, suggestionResult))
  }

  const handleToggleCandidate = (playerId: string) => {
    setUsedPlayerIds([])
    setResults([])
    setManualSelectedCandidateIds((current) => {
      const base = current ?? activePlayers.map((player) => player.id)
      if (base.includes(playerId)) {
        return base.filter((id) => id !== playerId)
      }
      return [...base, playerId]
    })
  }

  const handleSelectAll = () => {
    setUsedPlayerIds([])
    setResults([])
    setManualSelectedCandidateIds(activePlayers.map((player) => player.id))
  }

  const handleClearAll = () => {
    setUsedPlayerIds([])
    setResults([])
    setManualSelectedCandidateIds([])
  }

  const handleAccept = (resultToAccept: MatchmakingResult) => {
    const playerIds = resultToAccept.suggestion.teams.flatMap((team) => team.playerIds)
    acceptSuggestion(playerIds)
  }

  const lastResult = results[results.length - 1]

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
          <TatakaiIcon name="back" className="text-base" />
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
                      setManualFormState((current: MatchmakingFormState | null) => {
                        const base = current ?? defaultFormState
                        return {
                          ...base,
                          maxPlayersPerGame: Number.isNaN(value) ? base.maxPlayersPerGame : value,
                        }
                      })
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
                      setManualFormState((current: MatchmakingFormState | null) => {
                        const base = current ?? defaultFormState
                        return {
                          ...base,
                          maxTeams: Number.isNaN(value) ? base.maxTeams : value,
                        }
                      })
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
                    setManualFormState((current: MatchmakingFormState | null) => {
                      const base = current ?? defaultFormState
                      return {
                        ...base,
                        benchFairnessEnabled: !base.benchFairnessEnabled,
                      }
                    })
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
                  <TatakaiIcon name="matchmaking" className="mr-2 text-base" />
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

                <div className="grid max-h-80 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2 overflow-y-auto pr-1">
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
                            <div className="flex items-center gap-2">
                              <PlayerAvatar
                                playerId={player.id}
                                displayName={player.name}
                                size="sm"
                              />
                              <p className="font-medium text-slate-900">{player.name}</p>
                            </div>
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

      {results.length > 0 && lastResult ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {results.map((result, suggestionIndex) => (
              <Card key={suggestionIndex}>
                <CardHeader>
                  <CardTitle>
                    {t('matchmaking.suggestionTitle')}{' '}
                    {results.length > 1 ? `#${suggestionIndex + 1}` : ''}
                  </CardTitle>
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
                            <li key={player.id} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <PlayerAvatar
                                  playerId={player.id}
                                  displayName={player.name}
                                  size="sm"
                                />
                                <span className="text-slate-900">{player.name}</span>
                              </div>
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
                      onClick={() => handleAccept(result)}
                    >
                      {t('matchmaking.acceptSuggestion')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('matchmaking.benchCandidatesTitle')}</CardTitle>
              <CardDescription>{t('matchmaking.benchCandidatesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {lastResult.benchCandidates.length === 0 ? (
                <p className="text-xs text-slate-600">{t('matchmaking.noBenchCandidates')}</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {lastResult.benchCandidates.map((playerId) => {
                    const player = gameData.players.find((p) => p.id === playerId)
                    if (!player) return null

                    return (
                      <li key={player.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar playerId={player.id} displayName={player.name} size="sm" />
                          <span className="text-slate-900">{player.name}</span>
                        </div>
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
        </>
      ) : null}
    </div>
  )
}

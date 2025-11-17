import type { FormEvent, ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai/react'
import { useNavigate } from 'react-router-dom'
import { gameDataAtom, nextGameSuggestedPlayerIdsAtom } from '../../state/atoms'
import { recordGameResult } from '../../lib/games/game-service'
import { buildTournamentRoute } from '../../lib/route-builders'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'
import { Button } from '../../ui/components/button'

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
            <CardTitle>Aucun tournoi sélectionné</CardTitle>
            <CardDescription>
              Sélectionnez un tournoi dans la liste avant d'enregistrer une nouvelle partie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Retour à la liste des tournois
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activePlayers = gameData.players.filter((player) => player.isActive)
  const rankMax = gameData.settings.rankMax || 12
  const maxPlayersPerGame = gameData.maxPlayersPerGame

  const handleToggleActive = (playerId: string) => {
    setPlayerStates((current) => {
      const previous = current[playerId] ?? { isActive: false, rank: null }
      return {
        ...current,
        [playerId]: { ...previous, isActive: !previous.isActive },
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
      setError('Aucun tournoi sélectionné.')
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
      setError('Sélectionnez au moins deux joueurs actifs pour enregistrer une partie.')
      return
    }

    if (candidates.length > maxPlayersPerGame) {
      setError(
        `Au maximum ${maxPlayersPerGame} joueurs peuvent participer à une partie pour ce tournoi.`,
      )
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
      setError(`Les rangs doivent être des entiers positifs compris entre 1 et ${rankMax}.`)
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
        name: `Rang ${rankValue}`,
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
      setError("Impossible d'enregistrer la partie. Vérifiez les rangs des joueurs.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const rankNumbers = Array.from({ length: rankMax }, (_, index) => index + 1)
  const rankRows: number[][] = []
  for (let index = 0; index < rankNumbers.length; index += 4) {
    rankRows.push(rankNumbers.slice(index, index + 4))
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Nouvelle partie</h2>
        <p className="text-sm text-slate-300">
          Sélectionnez les joueurs actifs pour cette partie et assignez-leur un rang.
        </p>
      </div>

      {activePlayers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun joueur actif</CardTitle>
            <CardDescription>
              Ajoutez ou réactivez des joueurs dans le tournoi avant d'enregistrer une partie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(buildTournamentRoute(gameData.id, 'overview'))}
            >
              Retour au tournoi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Joueurs et rangs</CardTitle>
              <CardDescription>
                Basculez les joueurs sur le banc ou actifs, puis choisissez un rang entre 1 et{' '}
                {rankMax}. Au moins deux joueurs actifs avec un rang sont requis.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="flex flex-col gap-2">
                {activePlayers.map((player) => {
                  const state = playerStates[player.id] ?? { isActive: false, rank: null }
                  const isActive = state.isActive
                  const selectedRank = state.rank

                  return (
                    <div
                      key={player.id}
                      className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-50">{player.name}</p>
                        <p className="text-xs text-slate-400">
                          Parties jouées : {player.gamesPlayed} · banc : {player.benchStreak}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-1 flex-col gap-2 md:mt-0 md:items-end">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wide text-slate-400">
                            {isActive ? 'Actif pour cette partie' : 'Sur le banc'}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant={isActive ? 'default' : 'outline'}
                            onClick={() => handleToggleActive(player.id)}
                          >
                            {isActive ? 'Mettre sur le banc' : 'Activer'}
                          </Button>
                        </div>

                        {isActive ? (
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-400">Rang</p>
                            <div className="flex flex-col gap-1">
                              {rankRows.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex flex-wrap gap-1">
                                  {row.map((rank) => {
                                    const isSelected = selectedRank === rank
                                    return (
                                      <Button
                                        key={rank}
                                        type="button"
                                        size="sm"
                                        variant={isSelected ? 'default' : 'outline'}
                                        onClick={() => handleSelectRank(player.id, rank)}
                                      >
                                        {rank}
                                      </Button>
                                    )
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
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
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Enregistrer la partie
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}

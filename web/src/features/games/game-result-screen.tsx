import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useAtom } from 'jotai/react'
import { useNavigate } from 'react-router-dom'
import { gameDataAtom } from '../../state/atoms'
import { recordGameResult } from '../../lib/games/game-service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'
import { Button } from '../../ui/components/button'
import { Select } from '../../ui/components/select'
import { Input } from '../../ui/components/input'

interface TeamForm {
  id: string
  name: string
}

type PlayerAssignments = Record<string, string | ''>

function createInitialTeams(): TeamForm[] {
  return [
    { id: 'team-1', name: 'Équipe 1' },
    { id: 'team-2', name: 'Équipe 2' },
  ]
}

export function GameResultScreen(): ReactElement {
  const [gameData, setGameData] = useAtom(gameDataAtom)
  const navigate = useNavigate()
  const [teams, setTeams] = useState<TeamForm[]>(createInitialTeams)
  const [assignments, setAssignments] = useState<PlayerAssignments>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const maxTeams = gameData.settings.maxTeamsPerGame

  const handleAddTeam = () => {
    if (teams.length >= maxTeams) return

    setTeams((current) => {
      const nextIndex = current.length + 1
      return [...current, { id: `team-${nextIndex}`, name: `Équipe ${nextIndex}` }]
    })
  }

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) return

    setTeams((current) => current.filter((team) => team.id !== id))
    setAssignments((current) => {
      const next: PlayerAssignments = {}
      Object.entries(current).forEach(([playerId, teamId]) => {
        next[playerId] = teamId === id ? '' : teamId
      })
      return next
    })
  }

  const handleMoveTeam = (id: string, direction: 'up' | 'down') => {
    setTeams((current) => {
      const index = current.findIndex((team) => team.id === id)
      if (index === -1) return current

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= current.length) return current

      const next = [...current]
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })
  }

  const handleTeamNameChange = (id: string, value: string) => {
    setTeams((current) =>
      current.map((team) => (team.id === id ? { ...team, name: value } : team)),
    )
  }

  const handleAssignmentChange = (playerId: string, teamId: string) => {
    setAssignments((current) => ({ ...current, [playerId]: teamId }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const teamPlayerIds: Record<string, string[]> = {}
    teams.forEach((team) => {
      teamPlayerIds[team.id] = []
    })

    Object.entries(assignments).forEach(([playerId, teamId]) => {
      if (teamId) {
        teamPlayerIds[teamId]?.push(playerId)
      }
    })

    const activeTeams = teams.filter((team) => (teamPlayerIds[team.id]?.length ?? 0) > 0)

    if (activeTeams.length < 2) {
      setError('Configurez au moins deux équipes avec des joueurs pour enregistrer une partie.')
      return
    }

    try {
      setIsSubmitting(true)

      const teamsInput = activeTeams.map((team) => ({
        id: team.id,
        name: team.name.trim() || undefined,
        playerIds: teamPlayerIds[team.id] ?? [],
      }))

      const resultsInput = activeTeams.map((team, index) => ({
        teamId: team.id,
        rank: index + 1,
      }))

      const updated = recordGameResult({
        gameData,
        teams: teamsInput,
        results: resultsInput,
      })

      setGameData(updated)
      navigate('/')
    } catch (unknownError) {
      console.error(unknownError)
      setError("Impossible d'enregistrer la partie. Vérifiez la configuration des équipes.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Nouvelle partie</h2>
        <p className="text-sm text-slate-300">
          Configurez les équipes et l'ordre de classement, puis enregistrez le résultat.
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
            <Button type="button" variant="outline" onClick={() => navigate('/') }>
              Retour au tournoi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        >
          <Card>
            <CardHeader>
              <CardTitle>Équipes</CardTitle>
              <CardDescription>
                Créez jusqu'à {maxTeams} équipes et ordonnez-les de la meilleure à la dernière.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {teams.map((team, index) => {
                const label = team.name.trim() || `Équipe ${index + 1}`

                return (
                  <div
                    key={team.id}
                    className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-1 flex-col gap-1">
                      <label className="text-xs font-medium" htmlFor={`team-name-${team.id}`}>
                        Nom de l'équipe (optionnel)
                      </label>
                      <Input
                        id={`team-name-${team.id}`}
                        value={team.name}
                        onChange={(event) => handleTeamNameChange(team.id, event.target.value)}
                        placeholder={label}
                      />
                      <span className="text-xs text-slate-400">Position : {index + 1}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 md:mt-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveTeam(team.id, 'up')}
                      >
                        Monter
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveTeam(team.id, 'down')}
                      >
                        Descendre
                      </Button>
                      {teams.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveTeam(team.id)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}

              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleAddTeam}
                  disabled={teams.length >= maxTeams}
                >
                  + Ajouter une équipe
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Joueurs</CardTitle>
              <CardDescription>
                Assignez chaque joueur à une équipe ou laissez-le sur le banc pour cette partie.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {error ? <p className="text-sm text-red-400">{error}</p> : null}

              <div className="flex flex-col gap-2">
                {activePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col gap-1 rounded-md border border-slate-800 bg-slate-950/40 p-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-50">{player.name}</p>
                      <p className="text-xs text-slate-400">
                        Parties jouées : {player.gamesPlayed} · banc : {player.benchStreak}
                      </p>
                    </div>
                    <div className="mt-2 w-full md:mt-0 md:w-48">
                      <Select
                        value={assignments[player.id] ?? ''}
                        onChange={(event) =>
                          handleAssignmentChange(player.id, event.target.value || '')
                        }
                      >
                        <option value="">Non assigné</option>
                        {teams.map((team, index) => {
                          const label = team.name.trim() || `Équipe ${index + 1}`
                          return (
                            <option key={team.id} value={team.id}>
                              {label}
                            </option>
                          )
                        })}
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate('/') }>
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

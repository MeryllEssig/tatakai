import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RatingPreset, TournamentMode } from '../../lib/domain/types'
import { createTournament } from '../../lib/tournaments/tournament-service'
import { saveTournament } from '../persistence/local-storage-adapter'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/card'
import { Input } from '../../ui/components/input'
import { Select } from '../../ui/components/select'
import { Button } from '../../ui/components/button'

interface SettingsState {
  name: string
  mode: TournamentMode
  maxPlayersPerGame: number
  ratingPreset: RatingPreset
  openSkillEnabled: boolean
}

interface PlayerRow {
  id: string
  name: string
}

function createEmptySettings(): SettingsState {
  return {
    name: '',
    mode: 'solo',
    maxPlayersPerGame: 4,
    ratingPreset: 'default',
    openSkillEnabled: true,
  }
}

function createInitialPlayerRows(): PlayerRow[] {
  return [
    { id: 'p-1', name: '' },
    { id: 'p-2', name: '' },
  ]
}

export function CreateTournamentWizard(): ReactElement {
  const [step, setStep] = useState<1 | 2>(1)
  const [settings, setSettings] = useState<SettingsState>(createEmptySettings)
  const [players, setPlayers] = useState<PlayerRow[]>(createInitialPlayerRows)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const handleSettingsSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedName = settings.name.trim()

    if (!trimmedName) {
      setError('Le nom du tournoi est obligatoire.')
      return
    }

    if (!Number.isFinite(settings.maxPlayersPerGame) || settings.maxPlayersPerGame <= 0) {
      setError('Le nombre maximum de joueurs par partie doit être un entier positif.')
      return
    }

    setStep(2)
  }

  const handlePlayersSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedNames = players
      .map((row) => row.name.trim())
      .filter((name) => name.length > 0)

    if (trimmedNames.length === 0) {
      setError('Ajoutez au moins un joueur pour démarrer le tournoi.')
      return
    }

    const lowerNames = trimmedNames.map((name) => name.toLowerCase())
    const uniqueNames = new Set(lowerNames)

    if (uniqueNames.size !== lowerNames.length) {
      setError('Chaque joueur doit avoir un nom unique.')
      return
    }

    try {
      setIsSubmitting(true)

      const { gameData } = createTournament({
        name: settings.name.trim(),
        mode: settings.mode,
        maxPlayersPerGame: settings.maxPlayersPerGame,
        ratingPreset: settings.ratingPreset,
        openSkillEnabled: settings.openSkillEnabled,
        initialPlayers: trimmedNames.map((name) => ({ name })),
      })

      saveTournament(gameData)

      navigate('/')
    } catch (creationError) {
      setError('Impossible de créer le tournoi. Réessayez plus tard.')
      console.error(creationError)
      // Optionally, we could log creationError somewhere centralised later.
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPlayerRow = () => {
    setPlayers((current) => [
      ...current,
      { id: `p-${current.length + 1}`, name: '' },
    ])
  }

  const handlePlayerNameChange = (id: string, value: string) => {
    setPlayers((current) =>
      current.map((row) => (row.id === id ? { ...row, name: value } : row)),
    )
  }

  const handleRemovePlayerRow = (id: string) => {
    setPlayers((current) => {
      const next = current.filter((row) => row.id !== id)
      return next.length > 0 ? next : current
    })
  }

  const renderStep1 = () => {
    return (
      <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Étape 1 · Configuration du tournoi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="tournament-name">
                Nom du tournoi
              </label>
              <Input
                id="tournament-name"
                value={settings.name}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Mon Tournoi 1"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="tournament-mode">
                  Mode
                </label>
                <Select
                  id="tournament-mode"
                  value={settings.mode}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      mode: event.target.value as TournamentMode,
                    }))
                  }
                >
                  <option value="solo">Solo (1v1)</option>
                  <option value="teams">Équipes</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="max-players">
                  Joueurs max par partie
                </label>
                <Input
                  id="max-players"
                  type="number"
                  min={1}
                  max={10}
                  value={settings.maxPlayersPerGame}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      maxPlayersPerGame: Number.parseInt(event.target.value || '0', 10),
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="rating-preset">
                  Préréglage OpenSkill
                </label>
                <Select
                  id="rating-preset"
                  value={settings.ratingPreset}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      ratingPreset: event.target.value as RatingPreset,
                    }))
                  }
                >
                  <option value="default">Par défaut</option>
                  <option value="conservative">Conservateur</option>
                  <option value="aggressive">Agressif</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">OpenSkill activé</span>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    className={`rounded-md border px-3 py-1 text-xs ${settings.openSkillEnabled ? 'border-slate-300 bg-slate-200 text-slate-900' : 'border-slate-700 text-slate-200'}`}
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        openSkillEnabled: true,
                      }))
                    }
                  >
                    Activé
                  </button>
                  <button
                    type="button"
                    className={`rounded-md border px-3 py-1 text-xs ${!settings.openSkillEnabled ? 'border-slate-300 bg-slate-200 text-slate-900' : 'border-slate-700 text-slate-200'}`}
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        openSkillEnabled: false,
                      }))
                    }
                  >
                    Désactivé
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>{""}Annuler</Button>
          <Button type="submit">Continuer</Button>
        </div>
      </form>
    )
  }

  const renderStep2 = () => {
    return (
      <form onSubmit={handlePlayersSubmit} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Étape 2 · Joueurs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-slate-300">
              Ajoutez les joueurs qui participeront à ce tournoi. Les noms doivent être uniques.
            </p>

            <div className="flex flex-col gap-2">
              {players.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2">
                  <Input
                    value={row.name}
                    onChange={(event) => handlePlayerNameChange(row.id, event.target.value)}
                    placeholder={`Joueur ${index + 1}`}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemovePlayerRow(row.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Button type="button" size="sm" variant="ghost" onClick={handleAddPlayerRow}>
                + Ajouter un joueur
              </Button>
            </div>
          </CardContent>
        </Card>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
            Retour
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Créer le tournoi
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Nouveau tournoi</h2>
        <p className="text-sm text-slate-300">
          Configurez d'abord le tournoi, puis ajoutez les joueurs qui y participeront.
        </p>
      </div>

      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  )
}

import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useAtom } from 'jotai/react'
import { useTranslation } from 'react-i18next'
import type { Player } from '../../lib/domain/types'
import { gameDataAtom } from '../../state/atoms'
import { addOrUpdatePlayer } from '../../lib/tournaments/tournament-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/components/card'
import { Input } from '../../ui/components/input'
import { Button } from '../../ui/components/button'

interface PlayerFormState {
  name: string
}

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1
    }

    return a.name.localeCompare(b.name)
  })
}

export function PlayerListPanel(): ReactElement {
  const [gameData, setGameData] = useAtom(gameDataAtom)
  const [newPlayer, setNewPlayer] = useState<PlayerFormState>({ name: '' })
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  if (!gameData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('players.title')}</CardTitle>
          <CardDescription>{t('players.noTournamentDescription')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const players = sortPlayers(gameData.players)

  const handleAddPlayer = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedName = newPlayer.name.trim()

    if (!trimmedName) {
      setError(t('players.errorNameRequired'))
      return
    }

    try {
      const updated = addOrUpdatePlayer({
        gameData,
        player: { name: trimmedName },
      })

      setGameData(updated)
      setNewPlayer({ name: '' })
    } catch (unknownError) {
      if (unknownError instanceof Error && /unique/i.test(unknownError.message)) {
        setError(t('players.errorNameDuplicate'))
      } else {
        setError(t('players.errorAddFailed'))
      }
    }
  }

  const startEditing = (player: Player) => {
    setEditingPlayerId(player.id)
    setEditingName(player.name)
    setError(null)
  }

  const cancelEditing = () => {
    setEditingPlayerId(null)
    setEditingName('')
  }

  const handleUpdatePlayer = (event: FormEvent) => {
    event.preventDefault()
    if (!editingPlayerId) return

    setError(null)

    const trimmedName = editingName.trim()

    if (!trimmedName) {
      setError(t('players.errorNameRequired'))
      return
    }

    try {
      const updated = addOrUpdatePlayer({
        gameData,
        player: { id: editingPlayerId, name: trimmedName },
      })

      setGameData(updated)
      cancelEditing()
    } catch (unknownError) {
      if (unknownError instanceof Error && /unique/i.test(unknownError.message)) {
        setError(t('players.errorNameDuplicate'))
      } else {
        setError(t('players.errorUpdateFailed'))
      }
    }
  }

  const toggleActive = (player: Player) => {
    setError(null)

    try {
      const updated = addOrUpdatePlayer({
        gameData,
        player: { id: player.id, name: player.name, isActive: !player.isActive },
      })

      setGameData(updated)
    } catch (unknownError) {
      if (unknownError instanceof Error && /unique/i.test(unknownError.message)) {
        setError(t('players.errorNameDuplicate'))
      } else {
        setError(t('players.errorUpdateFailed'))
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('players.title')}</CardTitle>
        <CardDescription>{t('players.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleAddPlayer} className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium" htmlFor="new-player-name">
              {t('players.newPlayerLabel')}
            </label>
            <Input
              id="new-player-name"
              value={newPlayer.name}
              onChange={(event) => setNewPlayer({ name: event.target.value })}
              placeholder={t('players.newPlayerPlaceholder')}
            />
          </div>
          <div>
            <Button type="submit" className="mt-2 md:mt-0">
              {t('players.addButton')}
            </Button>
          </div>
        </form>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {players.length === 0 ? (
          <p className="text-sm text-slate-300">{t('players.empty')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((player) => {
              const isEditing = player.id === editingPlayerId

              return (
                <div
                  key={player.id}
                  className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-3">
                    {isEditing ? (
                      <form onSubmit={handleUpdatePlayer} className="flex flex-1 items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          placeholder={t('players.newPlayerPlaceholder')}
                        />
                        <Button type="submit" size="sm">
                          {t('players.save')}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={cancelEditing}>
                          {t('players.cancel')}
                        </Button>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-50">{player.name}</span>
                        <span className="text-xs text-slate-400">
                          {t('players.statusSummary', {
                            status: t(player.isActive ? 'players.statusActive' : 'players.statusInactive'),
                            games: t('players.gamesCount', { count: player.gamesPlayed }),
                            bench: player.benchStreak,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEditing(player)}>
                        {t('players.renameButton')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(player)}
                      >
                        {player.isActive ? t('players.deactivate') : t('players.reactivate')}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

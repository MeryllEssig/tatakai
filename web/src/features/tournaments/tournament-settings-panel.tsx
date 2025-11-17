import type { ReactElement } from 'react'
import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai/react'
import { useTranslation } from 'react-i18next'
import type { GameData } from '../../lib/domain/types'
import { gameDataAtom } from '../../state/atoms'
import { exportTournamentToClipboard } from './export-tournament'
import { createInitialRating } from '../../lib/openskill/ratings'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'
import { Button } from '../../ui/components/button'

function resetTournamentGameData(gameData: GameData): GameData {
  const updatedAt = new Date().toISOString()

  const resetPlayers = gameData.players.map((player) => ({
    ...player,
    rating: createInitialRating(gameData.ratingConfig),
    benchStreak: 0,
    gamesPlayed: 0,
  }))

  return {
    ...gameData,
    updatedAt,
    players: resetPlayers,
    games: [],
  }
}

export function TournamentSettingsPanel(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const setGameData = useSetAtom(gameDataAtom)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { t } = useTranslation()

  if (!gameData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
          <CardDescription>{t('settings.noTournamentDescription')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleExport = async () => {
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      await exportTournamentToClipboard(gameData)
      setStatusMessage(t('settings.statusExported'))
    } catch (unknownError) {
      console.error(unknownError)
      setErrorMessage(t('settings.errorExport'))
    }
  }

  const handleReset = () => {
    const confirmed = window.confirm(t('settings.resetConfirm'))

    if (!confirmed) return

    setStatusMessage(null)
    setErrorMessage(null)

    const updated = resetTournamentGameData(gameData)
    setGameData(updated)
    setStatusMessage(t('settings.statusReset'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.title')}</CardTitle>
        <CardDescription>{t('settings.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {statusMessage ? <p className="text-emerald-400">{statusMessage}</p> : null}
        {errorMessage ? <p className="text-red-400">{errorMessage}</p> : null}

        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" onClick={handleExport}>
            {t('settings.exportButton')}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            {t('settings.resetButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

import type { GameData } from '../../lib/domain/types'

export async function exportTournamentToClipboard(gameData: GameData): Promise<void> {
  const json = JSON.stringify(gameData, null, 2)

  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available in this environment')
  }

  await navigator.clipboard.writeText(json)
}

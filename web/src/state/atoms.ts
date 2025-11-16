import { atom } from 'jotai'
import type { GameData } from '../lib/domain/types'

// Id du tournoi actuellement sélectionné dans l'application.
export const currentTournamentIdAtom = atom<string | null>(null)

// Données complètes du tournoi actuellement chargé (GameData complet) ou null si rien n'est chargé.
export const gameDataAtom = atom<GameData | null>(null)

// Liste optionnelle des joueurs suggérés pour la prochaine partie (issue du matchmaking).
export const nextGameSuggestedPlayerIdsAtom = atom<string[] | null>(null)

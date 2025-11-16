import type { ReactElement } from 'react'
import { useAtomValue } from 'jotai/react'
import type { Player } from '../../lib/domain/types'
import { gameDataAtom } from '../../state/atoms'
import { conservativeRating } from '../../lib/openskill/ratings'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    // Tri principal par rating conservateur décroissant, puis par nom.
    const aCons = conservativeRating(a.rating)
    const bCons = conservativeRating(b.rating)

    if (aCons !== bCons) {
      return bCons - aCons
    }

    return a.name.localeCompare(b.name)
  })
}

export function PlayerStatsPanel(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)

  if (!gameData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des joueurs</CardTitle>
          <CardDescription>
            Sélectionnez un tournoi pour voir les statistiques des joueurs.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const players = sortPlayers(gameData.players)

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des joueurs</CardTitle>
          <CardDescription>
            Ajoutez des joueurs au tournoi pour voir leurs statistiques.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques des joueurs</CardTitle>
        <CardDescription>
          µ, σ, µ-3σ, parties jouées et banc actuel pour chaque joueur.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400">
              <th className="py-1 pr-2 text-left font-medium">Joueur</th>
              <th className="py-1 px-2 text-right font-medium">µ</th>
              <th className="py-1 px-2 text-right font-medium">σ</th>
              <th className="py-1 px-2 text-right font-medium">µ-3σ</th>
              <th className="py-1 px-2 text-right font-medium">Parties</th>
              <th className="py-1 pl-2 text-right font-medium">Banc</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const conservative = conservativeRating(player.rating)

              return (
                <tr
                  key={player.id}
                  className="border-b border-slate-900/60 last:border-b-0 hover:bg-slate-900/40"
                >
                  <td className="py-1 pr-2 text-left">
                    <span className="font-medium text-slate-50">{player.name}</span>
                    {!player.isActive ? (
                      <span className="ml-1 text-xs text-slate-400">(inactif)</span>
                    ) : null}
                  </td>
                  <td className="py-1 px-2 text-right tabular-nums">
                    {player.rating.mu.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 text-right tabular-nums">
                    {player.rating.sigma.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 text-right tabular-nums">
                    {conservative.toFixed(2)}
                  </td>
                  <td className="py-1 px-2 text-right tabular-nums">{player.gamesPlayed}</td>
                  <td className="py-1 pl-2 text-right tabular-nums">{player.benchStreak}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

import type { ReactElement } from 'react'
import { useAtomValue } from 'jotai/react'
import { gameDataAtom } from '../../state/atoms'
import { useRatingSnapshots } from './use-rating-snapshots'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'

export function PlayerStatsPanel(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const snapshots = useRatingSnapshots()

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

  if (snapshots.length === 0) {
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
            {snapshots.map(({ player, conservative }) => (
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
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

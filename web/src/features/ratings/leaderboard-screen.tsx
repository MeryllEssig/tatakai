import type { ReactElement } from 'react'
import { useAtomValue } from 'jotai/react'
import { useNavigate, useParams } from 'react-router-dom'
import { gameDataAtom } from '../../state/atoms'
import { useRatingSnapshots } from './use-rating-snapshots'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'
import { Button } from '../../ui/components/button'
import { buildTournamentRoute } from '../../lib/route-builders'

export function LeaderboardScreen(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const navigate = useNavigate()
  const snapshots = useRatingSnapshots()
  const { id } = useParams<{ id: string }>()

  if (!gameData) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Classement du tournoi</CardTitle>
            <CardDescription>
              Sélectionnez un tournoi dans la liste avant de consulter le classement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" onClick={() => navigate('/') }>
              Retour à la liste des tournois
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Classement du tournoi</CardTitle>
            <CardDescription>
              Ajoutez des joueurs au tournoi pour voir le classement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!id) {
                  navigate('/')
                  return
                }
                navigate(buildTournamentRoute(id, 'overview'))
              }}
            >
              Retour au tournoi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Classement du tournoi</h2>
        <p className="text-sm text-slate-300">
          Joueurs triés par rating conservateur (µ-3σ), avec incertitude et nombre de parties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Classement basé sur le rating conservateur µ-3σ. Les joueurs inactifs apparaissent
            avec une étiquette.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="py-1 pr-2 text-left font-medium">#</th>
                <th className="py-1 pr-2 text-left font-medium">Joueur</th>
                <th className="py-1 px-2 text-right font-medium">µ</th>
                <th className="py-1 px-2 text-right font-medium">σ</th>
                <th className="py-1 px-2 text-right font-medium">µ-3σ</th>
                <th className="py-1 px-2 text-right font-medium">Parties</th>
                <th className="py-1 pl-2 text-right font-medium">Banc</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map(({ player, conservative }, index) => (
                  <tr
                    key={player.id}
                    className="border-b border-slate-900/60 last:border-b-0 hover:bg-slate-900/40"
                  >
                    <td className="py-1 pr-2 text-left tabular-nums">{index + 1}</td>
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

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (!id) {
              navigate('/')
              return
            }
            navigate(buildTournamentRoute(id, 'overview'))
          }}
        >
          Retour au tournoi
        </Button>
      </div>
    </div>
  )
}

import type { ReactElement } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TournamentListScreen } from '../../features/tournaments/tournament-list-screen'
import { CreateTournamentWizard } from '../../features/tournaments/create-tournament-wizard'

export function AppRouter(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TournamentListScreen />} />
        <Route path="/tournaments/new" element={<CreateTournamentWizard />} />
      </Routes>
    </BrowserRouter>
  )
}

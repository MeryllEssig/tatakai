import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppShell } from './app/layout/app-shell'
import { JotaiRootProvider } from './app/providers/jotai-provider'
import { ThemeProvider } from './app/providers/theme-provider'
import { ErrorBoundary } from './app/providers/error-boundary'
import { TournamentPersistenceGate } from './app/providers/tournament-persistence-gate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <JotaiRootProvider>
        <ThemeProvider>
          <AppShell>
            <TournamentPersistenceGate />
            <App />
          </AppShell>
        </ThemeProvider>
      </JotaiRootProvider>
    </ErrorBoundary>
  </StrictMode>,
)

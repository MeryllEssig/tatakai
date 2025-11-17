import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppShell } from './app/layout/app-shell'
import { JotaiRootProvider } from './app/providers/jotai-provider'
import { ThemeProvider } from './app/providers/theme-provider'
import { ErrorBoundary } from './app/providers/error-boundary'
import { TournamentPersistenceGate } from './app/providers/tournament-persistence-gate'
import { I18nProvider } from './app/providers/i18n-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <JotaiRootProvider>
        <ThemeProvider>
          <I18nProvider>
            <AppShell>
              <TournamentPersistenceGate />
              <App />
            </AppShell>
          </I18nProvider>
        </ThemeProvider>
      </JotaiRootProvider>
    </ErrorBoundary>
  </StrictMode>,
)

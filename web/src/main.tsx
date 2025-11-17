import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import App from './App.tsx'
import { AppShell } from './app/layout/app-shell'
import { JotaiRootProvider } from './app/providers/jotai-provider'
import { ThemeProvider } from './app/providers/theme-provider'
import { ErrorBoundary } from './app/providers/error-boundary'
import { TournamentPersistenceGate } from './app/providers/tournament-persistence-gate'
import { i18n } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <JotaiRootProvider>
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
            <AppShell>
              <TournamentPersistenceGate />
              <App />
            </AppShell>
          </I18nextProvider>
        </ThemeProvider>
      </JotaiRootProvider>
    </ErrorBoundary>
  </StrictMode>,
)

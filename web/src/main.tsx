import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import { AppShell } from './app/layout/app-shell'
import { ErrorBoundary } from './app/providers/error-boundary'
import { JotaiRootProvider } from './app/providers/jotai-provider'
import { ThemeProvider } from './app/providers/theme-provider'
import { TournamentPersistenceGate } from './app/providers/tournament-persistence-gate'
import { AppRouter } from './app/router/routes'
import { i18n } from './i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <JotaiRootProvider>
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
            <BrowserRouter>
              <AppShell>
                <TournamentPersistenceGate />
                <AppRouter />
              </AppShell>
            </BrowserRouter>
          </I18nextProvider>
        </ThemeProvider>
      </JotaiRootProvider>
    </ErrorBoundary>
  </StrictMode>,
)

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '../../ui/components/language-selector'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">{t('app.title')}</h1>
          <LanguageSelector />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

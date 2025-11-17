import type { ReactNode } from 'react'
import { LanguageSelector } from '../../ui/components/language-selector'
import { AppHeader } from '../../ui/components/app-header'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
        <AppHeader rightSlot={<LanguageSelector />} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

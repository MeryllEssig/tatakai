import type { ReactNode } from 'react'
import { AppHeader } from '../../ui/components/app-header'
import { LanguageSelector } from '../../ui/components/language-selector'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#ff9b3330] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6">
        <AppHeader rightSlot={<LanguageSelector />} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

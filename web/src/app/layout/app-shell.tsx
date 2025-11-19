import { Button } from '@/components/retroui/Button'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../../ui/components/app-header'
import { LanguageSelector } from '../../ui/components/language-selector'
import { TatakaiIcon } from '../../ui/components/tatakai-icon'

interface AppShellProps {
  children: ReactNode
}

function AppShellRightSlot() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleHelpClick = (): void => {
    navigate('/help')
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-10 w-10"
        aria-label={t('help.navLabel')}
        onClick={handleHelpClick}
      >
        <TatakaiIcon name="help" className="text-sm" />
      </Button>
      <LanguageSelector />
    </>
  )
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#ff9b3330] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6">
        <AppHeader rightSlot={<AppShellRightSlot />} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

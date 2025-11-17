import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface AppHeaderProps {
  rightSlot?: ReactNode
}

export function AppHeader({ rightSlot }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-900 bg-slate-900 text-2xl text-slate-50">
          <span aria-hidden="true" className="font-heading">
            戦
          </span>
          <span className="sr-only">Tatakai Tournament Manager</span>
        </div>
        <div className="leading-tight">
          <div className="font-heading text-base font-semibold tracking-tight">Tatakai</div>
          <div className="text-xs text-slate-700">{t('app.subtitle')}</div>
        </div>
      </div>
      {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}

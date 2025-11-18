import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface AppHeaderProps {
  rightSlot?: ReactNode
}

export function AppHeader({ rightSlot }: AppHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="mb-4 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => {
          navigate('/')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            navigate('/')
          }
        }}
        aria-label={t('home.title')}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ffdb33] border-4 border-black text-2xl text-black">
          <span aria-hidden="true" className="font-yuji-syuku leading-[0.1]">
            戦
          </span>
        </div>
        <div className="leading-tight">
          <div className="font-heading text-base font-semibold">Tatakai</div>
          <div className="text-xs text-slate-700">{t('app.subtitle')}</div>
        </div>
      </div>
      {rightSlot ? <div className="flex items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}

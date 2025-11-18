import type { ReactNode } from 'react'

interface PageContentHeaderProps {
  title: ReactNode
  subtitle: ReactNode
  children?: ReactNode
}

export function PageContentHeader({ title, subtitle, children }: PageContentHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {children ? (
        <div className="flex flex-wrap justify-start gap-2 sm:justify-end sm:self-auto">
          {children}
        </div>
      ) : null}
    </div>
  )
}

import type { HTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type DialogDivProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'>

export interface DialogProps extends DialogDivProps {
  open: boolean
  onClose?: () => void
  title?: ReactNode
}

export function Dialog({ open, onClose, title, className, children, ...props }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge(
          'mx-4 w-full max-w-md rounded-3xl border-2 border-slate-900 bg-slate-50 p-4 shadow-[10px_10px_0_0_#020617]',
          className,
        )}
        {...props}
      >
        {title ? (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-slate-900 bg-slate-100 text-slate-900 shadow-[3px_3px_0_0_#020617] hover:bg-slate-200"
                aria-label="Fermer le dialog"
              >
                ×
              </button>
            )}
          </div>
        ) : null}
        <div className="text-sm text-slate-800">{children}</div>
      </div>
    </div>
  )
}

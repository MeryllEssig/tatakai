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
          'mx-4 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl',
          className,
        )}
        {...props}
      >
        {title ? (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-50"
                aria-label="Fermer le dialog"
              >
                ×
              </button>
            )}
          </div>
        ) : null}

        <div className="text-sm text-slate-200">{children}</div>
      </div>
    </div>
  )
}

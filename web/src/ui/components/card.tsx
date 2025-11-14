import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        'rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div className={twMerge('mb-2 flex flex-col gap-1', className)} {...props} />
  )
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h2
      className={twMerge('text-lg font-semibold tracking-tight text-slate-50', className)}
      {...props}
    />
  )
}

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={twMerge('text-sm text-slate-400', className)} {...props} />
  )
}

type CardContentProps = HTMLAttributes<HTMLDivElement>

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={twMerge('mt-2', className)} {...props} />
}

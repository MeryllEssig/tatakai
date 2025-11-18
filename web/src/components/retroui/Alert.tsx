import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { Text } from '@/components/retroui/Text'
import { cn } from '@/lib/utils'

const alertVariants = cva('relative w-full rounded border-2 p-4', {
  variants: {
    variant: {
      default: 'bg-background text-foreground [&_svg]:shrink-0',
      solid: 'bg-black text-white',
    },
    status: {
      error: 'bg-red-300 text-red-800 border-red-800',
      success: 'bg-green-300 text-green-800 border-green-800',
      warning: 'bg-yellow-300 text-yellow-800 border-yellow-800',
      info: 'bg-blue-300 text-blue-800 border-blue-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type AlertProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>

const Alert = ({ className, variant, status, ...props }: AlertProps) => (
  <div role="alert" className={cn(alertVariants({ variant, status }), className)} {...props} />
)
Alert.displayName = 'Alert'

type AlertTitleProps = HTMLAttributes<HTMLHeadingElement>
const AlertTitle = ({ className, ...props }: AlertTitleProps) => (
  <Text as="h5" className={cn(className)} {...props} />
)
AlertTitle.displayName = 'AlertTitle'

type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>
const AlertDescription = ({ className, ...props }: AlertDescriptionProps) => (
  <div className={cn('text-muted-foreground', className)} {...props} />
)

AlertDescription.displayName = 'AlertDescription'

const AlertComponent = Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription,
})

export { AlertComponent as Alert }

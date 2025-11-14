import type { ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai/react'

interface JotaiRootProviderProps {
  children: ReactNode
}

export function JotaiRootProvider({ children }: JotaiRootProviderProps) {
  return <JotaiProvider>{children}</JotaiProvider>
}

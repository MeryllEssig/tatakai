import type { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

// Simple dark-theme provider for now; can be extended later with real theme toggling.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return children
}

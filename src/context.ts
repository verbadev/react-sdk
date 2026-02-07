import { createContext } from 'react'

export interface VerbaContextValue {
  t: (
    key: string,
    defaultValueOrParams?: string | Record<string, string | number>,
    params?: Record<string, string | number>
  ) => string
  locale: string
  setLocale: (locale: string) => void
  locales: string[]
  defaultLocale: string | null
  isReady: boolean
}

export const VerbaContext = createContext<VerbaContextValue | null>(null)

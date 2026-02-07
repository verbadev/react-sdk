import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Verba } from '@verbadev/js'
import { VerbaContext, type VerbaContextValue } from './context'

export interface VerbaProviderProps {
  projectId: string
  publicKey: string
  locale?: string
  baseUrl?: string
  localeDetector?: () => string | null
  children: React.ReactNode
}

export function VerbaProvider({
  projectId,
  publicKey,
  locale,
  baseUrl,
  localeDetector,
  children,
}: VerbaProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [currentLocale, setCurrentLocale] = useState(locale ?? 'en')
  const verbaRef = useRef<Verba | null>(null)

  // Create Verba instance when config changes
  useEffect(() => {
    setIsReady(false)

    const verba = new Verba({
      projectId,
      publicKey,
      locale,
      baseUrl,
      localeDetector,
    })

    verbaRef.current = verba

    verba.ready().then(() => {
      // Only update if this is still the current instance
      if (verbaRef.current === verba) {
        setCurrentLocale(verba.getLocale())
        setIsReady(true)
      }
    })

    return () => {
      // Mark as stale so the ready callback doesn't update state
      if (verbaRef.current === verba) {
        verbaRef.current = null
      }
    }
  }, [projectId, publicKey, locale, baseUrl, localeDetector])

  const setLocale = useCallback((newLocale: string) => {
    if (verbaRef.current) {
      verbaRef.current.setLocale(newLocale)
      setCurrentLocale(newLocale)
    }
  }, [])

  const t = useCallback(
    (
      key: string,
      defaultValueOrParams?: string | Record<string, string | number>,
      params?: Record<string, string | number>
    ) => {
      if (!verbaRef.current) return typeof defaultValueOrParams === 'string' ? defaultValueOrParams : key
      return verbaRef.current.t(key, defaultValueOrParams, params)
    },
    // Re-create when locale or readiness changes so consumers re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLocale, isReady]
  )

  const value = useMemo<VerbaContextValue>(
    () => ({
      t,
      locale: currentLocale,
      setLocale,
      locales: verbaRef.current?.getLocales() ?? [],
      defaultLocale: verbaRef.current?.getDefaultLocale() ?? null,
      isReady,
    }),
    [t, currentLocale, setLocale, isReady]
  )

  return <VerbaContext.Provider value={value}>{children}</VerbaContext.Provider>
}

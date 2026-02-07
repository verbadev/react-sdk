import { useContext } from 'react'
import { VerbaContext, type VerbaContextValue } from './context'

export function useVerba(): VerbaContextValue {
  const context = useContext(VerbaContext)
  if (!context) {
    throw new Error('useVerba must be used within a <VerbaProvider>')
  }
  return context
}

import { useContext } from 'react'
import { AppDataContext } from './app-data-context'

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData precisa estar dentro de AppDataProvider')
  }
  return context
}

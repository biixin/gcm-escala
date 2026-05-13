import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'

const AUTH_KEY = 'escala-limpeza-6-pelotao:auth'
const ADMIN_USER = 'admin'
const ADMIN_PASSWORD = 'pelotao6'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, String(isAuthenticated))
  }, [isAuthenticated])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login: (username, password) => {
        const allowed =
          username.trim() === ADMIN_USER && password.trim() === ADMIN_PASSWORD
        setIsAuthenticated(allowed)
        return allowed
      },
      logout: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

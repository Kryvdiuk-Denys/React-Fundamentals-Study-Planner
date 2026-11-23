import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { httpClient, normalizeApiError, setAccessToken } from '../api/httpClient'

export interface AuthUser {
  id: number
  username: string
  email?: string
  firstName?: string
  lastName?: string
}

interface LoginResponse extends AuthUser {
  accessToken: string
  refreshToken: string
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const TOKEN_KEY = 'study-planner.access-token'
const USER_KEY = 'study-planner.auth-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY)
    if (!saved) return null
    try {
      return JSON.parse(saved) as AuthUser
    } catch {
      return null
    }
  })

  useEffect(() => {
    setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) return

    let active = true
    httpClient<AuthUser>('/auth/me')
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      })
      .catch((error) => {
        if (!active) return
        const normalized = normalizeApiError(error)
        if (normalized.status === 401) {
          setToken(null)
          setUser(null)
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
        }
      })

    return () => {
      active = false
    }
  }, [accessToken])

  const login = useCallback(async (username: string, password: string) => {
    const response = await httpClient<LoginResponse>('/auth/login', {
      method: 'POST',
      data: { username, password },
    })
    const nextUser: AuthUser = {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
    }
    setToken(response.accessToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, response.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const value = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken && user),
    login,
    logout,
  }), [accessToken, login, logout, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '@/api/authApi'
import { getToken, setToken, clearToken, onUnauthorized } from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    onUnauthorized(() => {
      setTokenState(null)
      setAdmin(null)
    })
  }, [])

  const login = useCallback(async (email, password, remember = true) => {
    const data = await authApi.adminLogin(email, password)
    setToken(data.token, remember)
    setTokenState(data.token)
    setAdmin(data.admin ?? null)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setAdmin(null)
  }, [])

  return <AuthContext.Provider value={{ token, admin, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

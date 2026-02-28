import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser.accessToken) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username, password) => {
    setError(null)
    setLoading(true)
    try {
      const result = await authService.login(username, password)
      if (result.success) {
        setUser({
          userId: result.userId,
          username: result.username,
          role: result.role,
        })
        return { success: true }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    try {
      await authService.logout()
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Logout failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const result = await authService.refresh()
      if (result.success) {
        setUser(prev => ({
          ...prev,
          role: result.role,
        }))
        return { success: true }
      } else {
        setError(result.error)
        setUser(null)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const message = err.message || 'Refresh failed'
      setError(message)
      setUser(null)
      return { success: false, error: message }
    }
  }, [])

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
    isAuthenticated: !!user?.userId,
    isAdmin: user?.role === 'ROLE_ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

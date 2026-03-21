import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const IDLE_TIMEOUT_MS = 900000;
  // Initialize auth state from localStorage
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser && currentUser.accessToken) {
      setUser(currentUser)
    } else {
      // If no valid token, ensure localStorage is wiped clean just in case
      // it was holding onto an expired token.
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
      setUser(null)
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
          fullName: result.fullName,
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
      // Force redirect to login page after logout
      window.location.href = '/login'
      return { success: true }
    } catch (err) {
      const message = err.message || 'Logout failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  useEffect(() => {
    // Only track idle time if the user is actually logged in
    if (!user) return;

    let timeoutId;

    const handleUserActivity = () => {
      // Clear the old timer
      if (timeoutId) clearTimeout(timeoutId);
      
      // Start a new timer
      timeoutId = setTimeout(() => {
        console.log('User has been idle for too long. Auto-logging out...');
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    // List of events that count as "activity"
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    // Attach the listeners to the browser window
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Start the first timer
    handleUserActivity();

    // Cleanup listeners when the component unmounts
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, logout]); // Re-run if user status or logout function changes

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

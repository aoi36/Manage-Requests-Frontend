import api from './api'

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

const isTokenValid = (token) => {
  if (!token) return false
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return false
  
  // JWT exp is in seconds, Date.now() is in milliseconds
  // We check if the current time is less than the expiration time
  return (decoded.exp * 1000) > Date.now()
}

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      })
      const { accessToken, refreshToken, userId } = response.data.result
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('userId', userId)
      localStorage.setItem('username', username)
      
      // Decode token to get role
      const decoded = decodeToken(accessToken)
      if (decoded && decoded.scope) {
        localStorage.setItem('userRole', decoded.scope)
      }
      
      return {
        success: true,
        userId,
        username,
        role: decoded?.scope,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
    }
  },

  refresh: async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { accessToken } = response.data.result
      
      localStorage.setItem('accessToken', accessToken)
      
      const decoded = decodeToken(accessToken)
      return {
        success: true,
        accessToken,
        role: decoded?.scope,
      }
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
      return {
        success: false,
        error: error.response?.data?.message || 'Refresh failed',
      }
    }
  },

getCurrentUser: () => {
    const token = localStorage.getItem('accessToken')
    
    if (token && isTokenValid(token)) {
      return {
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username'),
        role: localStorage.getItem('userRole'),
        accessToken: token,
      }
    }
    
    return {} // Return empty object if expired/missing
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken')
    return isTokenValid(token)
  },

  isAdmin: () => {
    const role = localStorage.getItem('userRole')
    const token = localStorage.getItem('accessToken')
    return isTokenValid(token) && role === 'ROLE_ADMIN' // --- UPDATED ---
  },
}

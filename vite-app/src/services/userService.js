import api from './api'

export const userService = {
  // Search/List users - Admin only
  searchUsers: async (name = '', page = 1, size = 10, sortBy = 'id', sortDirection = 'asc') => {
    try {
      const response = await api.get('/users/search', {
        params: {
          name,
          page,
          size,
          sortBy,
          sortDirection,
        },
      })
      return {
        success: true,
        data: response.data.result,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search users',
      }
    }
  },

  // Get user details
 getUserDetail: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      
      const userData = response.data?.result || response.data;
      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user details',
      };
    }
  },

  // Update user - Admin only
  updateUser: async (userId, userData) => {
    try {
      console.log("[v0] updateUser called with userId:", userId, "userData:", userData)
      const payload = {
        username: userData.username,
        password: userData.password || undefined,
        role: userData.role,
      }
      // Remove undefined password for edit
      if (!userData.password) {
        delete payload.password
      }
      const response = await api.put(`/users/${userId}`, payload)
      return {
        success: true,
        data: response.data.result,
      }
    } catch (error) {
      console.log("[v0] updateUser error:", error.response?.data)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user',
      }
    }
  },

  // Create user - Admin only (from authentication controller)
  createUser: async (userData) => {
    try {
      console.log("[v0] createUser called with data:", userData)
      const response = await api.post('/auth/register', {
        username: userData.username,
        password: userData.password,
        role: userData.role,
      })
      return {
        success: true,
        data: response.data.result,
      }
    } catch (error) {
      console.log("[v0] createUser error:", error.response?.data)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user',
      }
    }
  },
}

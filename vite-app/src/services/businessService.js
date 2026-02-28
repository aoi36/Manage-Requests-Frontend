import api from './api';

export const businessService = {
  getAll: async (page = 1, size = 10, sortBy = 'displayOrder', sortDirection = 'asc') => {
    try {
      const response = await api.get('/services', {
        params: { page, size, sortBy, sortDirection }
      });
      return response.data; // Assuming this returns your ApiResponse format
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi khi tải danh sách dịch vụ';
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Không tìm thấy dịch vụ';
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/services', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi khi tạo dịch vụ mới';
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/services/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi khi cập nhật dịch vụ';
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Lỗi khi xóa dịch vụ';
    }
  }
};
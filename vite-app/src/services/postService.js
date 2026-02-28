import api from './api';

export const postService = {

  // 1. CREATE POST (Fixed with FormData & Blob for Spring Boot)
  createPost: async (postData, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Package the text fields as a JSON blob (Standard Spring Boot approach)
      formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));

      // Destructure 'data' directly from the Axios response
      const { data } = await api.post('/post', formData);
      
      return { success: true, data };

    } catch (error) {
      console.error("Upload error details:", error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Lỗi khi tạo yêu cầu (Failed to create post)' 
      };
    }
  },

  // 2. GET ALL POSTS (Refactored to clean syntax)
  getAllPosts: async (page = 1, size = 10) => {
    try {
      const { data } = await api.get('/post', { params: { page, size } });
      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error.response?.data?.message || "Failed to load posts"; 
    }
  },

  // 3. SEARCH POSTS
  searchPosts: async (search, page = 1, size = 10) => {
    try {
      // Adjust the 'title' param to match whatever your Spring backend expects
      const { data } = await api.get('/post/search', { params: { name: search, page, size } });
      return data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to search posts";
    }
  },

  // 4. GET POST DETAIL
  getPostDetail: async (postId) => {
    try {
      const { data } = await api.get(`/post/${postId}`);
      return data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to load post detail";
    }
  },

  // 5. DOWNLOAD FILE
  downloadPostFile: async (postId) => {
    // Note: We don't try/catch here because we handle it directly in the component,
    // and we MUST return the raw response to get the Blob data.
    return await api.get(`/post/${postId}/download`, { responseType: 'blob' });
  }

};
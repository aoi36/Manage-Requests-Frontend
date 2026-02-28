import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { postService } from '../services/postService';
import '../styles/dashboard.css'; // Ensure this matches the red Agribank CSS I provided earlier

export const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for Admin Posts view
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 12, // Show more per page
    totalPages: 0,
    totalElements: 0
  });

  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');

  // Load posts immediately when Admin visits the dashboard
  useEffect(() => {
    if (isAdmin) {
      handleGetAllPosts(1);
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /* ===================== POST APIs ===================== */

  const handleDownload = async () => {
    if (!selectedPost) return;

    try {
      const response = await postService.downloadPostFile(selectedPost.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedPost.fileName || 'downloaded-file');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert('Tải file thất bại (Failed to download file)');
    }
  };

  const handleGetAllPosts = async (page = 1) => {
    try {
      setIsSearching(false);
      const res = await postService.getAllPosts(page, pagination.size);
      
      const { content, totalPages, totalElements, pageNumber } = res.result || res.data.result;
      
      setPosts(content || []);
      setPagination(prev => ({
        ...prev,
        page: pageNumber,
        totalPages,
        totalElements
      }));
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách yêu cầu');
    }
  };

  const handleSearchPosts = async (page = 1) => {
    if (!search.trim()) {
      return handleGetAllPosts(1);
    }

    try {
      setIsSearching(true);
      const res = await postService.searchPosts(search, page, pagination.size);
      
      const { content, totalPages, totalElements, pageNumber } = res.result || res.data.result;

      setPosts(content || []);
      setPagination(prev => ({
        ...prev,
        page: pageNumber,
        totalPages,
        totalElements
      }));
    } catch (err) {
      console.error(err);
      setError('Lỗi tìm kiếm');
    }
  };

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    if (isSearching) {
      handleSearchPosts(newPage);
    } else {
      handleGetAllPosts(newPage);
    }
  };

  const handleOpenPost = async (postId) => {
    try {
      setLoadingDetail(true);
      const res = await postService.getPostDetail(postId);
      setSelectedPost(res.result || res.data.result); 
      
      // Update visually without re-fetching
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isViewed: true, viewed: true } : p));
    } catch (err) {
      console.error(err);
      alert("Không thể tải chi tiết yêu cầu");
    } finally {
      setLoadingDetail(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="dashboard-container">
    
      <main className="main-content">
        
        <div className="welcome-card" style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#b31f24', marginTop: 0 }}>Tổng quan</h2>
          <p>Vai trò của bạn: <strong>{isAdmin ? 'Quản trị viên (Admin)' : 'Người dùng (User)'}</strong></p>
          <p>Sử dụng các tab phía trên để điều hướng hệ thống.</p>
        </div>

        {/* ADMIN VIEW: List all posts */}
        {isAdmin && (
          <div className="upload-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: 15, marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#b31f24' }}>Danh sách Yêu cầu</h3>
              
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  className="agri-input"
                  placeholder="Tìm theo tiêu đề..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
                <button className="action-btn-submit" style={{ margin: 0, padding: '6px 15px' }} onClick={() => handleSearchPosts(1)}>
                  Tìm kiếm
                </button>
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            {/* POST GRID */}
            <div className="post-grid">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className={`post-card ${(!p.viewed && !p.isViewed) ? 'unread' : ''}`}
                  onClick={() => handleOpenPost(p.id)}
                  style={{ borderLeft: (!p.viewed && !p.isViewed) ? '5px solid #00b0f0' : '1px solid #eee' }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>{p.title}</h4>
                  <p className="post-meta" style={{ margin: 0 }}>Từ: {p.username}</p>
                  <p className="post-meta" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      Ngày: {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                </div>
              ))}
              {posts.length === 0 && <p style={{ color: '#666', fontStyle: 'italic', padding: 20 }}>Chưa có yêu cầu nào.</p>}
            </div>

            {/* PAGINATION CONTROLS */}
            {posts.length > 0 && pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', alignItems: 'center' }}>
                <button 
                  className="action-btn-submit" 
                  style={{ backgroundColor: pagination.page === 1 ? '#ccc' : '#b31f24' }}
                  disabled={pagination.page === 1}
                  onClick={() => changePage(pagination.page - 1)}
                >
                  Trước
                </button>
                <span>Trang <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong></span>
                <button 
                  className="action-btn-submit" 
                  style={{ backgroundColor: pagination.page >= pagination.totalPages ? '#ccc' : '#b31f24' }}
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => changePage(pagination.page + 1)}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}

        {/* POST DETAIL MODAL */}
        {selectedPost && (
          <div className="post-detail-card" style={{ marginTop: 20, padding: 20, background: '#fcfcfc', borderRadius: 4, border: '1px solid #ccc', borderLeft: '4px solid #b31f24' }}>
            <h3 style={{ marginTop: 0, color: '#b31f24', borderBottom: '1px solid #ccc', paddingBottom: 10 }}>Chi tiết Yêu cầu</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: 15 }}>
              <p><strong>Tiêu đề:</strong> {selectedPost.title}</p>
              <p><strong>Người gửi:</strong> {selectedPost.username}</p>
              <p><strong>Thông tin liên hệ:</strong> {selectedPost.contactInfo}</p>
              <p><strong>Điện thoại:</strong> {selectedPost.phoneNumber}</p>
              <p><strong>Email:</strong> {selectedPost.email}</p>
              <p><strong>Dịch vụ:</strong> {selectedPost.serviceName}</p>
              <p><strong>Dịch vụ nhánh:</strong> {selectedPost.subService}</p>
              <p><strong>Mức độ:</strong> <span style={{ color: selectedPost.urgencyLevel === 'HIGH' ? 'red' : 'inherit', fontWeight: 'bold' }}>{selectedPost.urgencyLevel}</span></p>
              <p><strong>Thời gian tạo:</strong> {new Date(selectedPost.createdAt).toLocaleString('vi-VN')}</p>
            </div>

            <div style={{ marginTop: 20 }}>
              <strong>Mô tả chi tiết:</strong>
              <div style={{ background: '#fff', padding: 15, border: '1px solid #eee', marginTop: 5, whiteSpace: 'pre-wrap' }}>
                {selectedPost.description}
              </div>
            </div>

            <div style={{ background: '#eef2f5', padding: 15, marginTop: 20, borderRadius: 4 }}>
              <strong>Tệp đính kèm:</strong> {selectedPost.fileName} ({(selectedPost.fileSize / 1024).toFixed(2)} KB)
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className="action-btn-submit" 
                  style={{ backgroundColor: '#00b0f0', marginTop: 0 }} 
                  onClick={handleDownload}
                >
                  Tải File Xuống
                </button>

                <button
                  className="action-btn-submit"
                  style={{ backgroundColor: '#666', marginTop: 0 }}
                  onClick={() => setSelectedPost(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
import React, { useState, useEffect, useCallback } from 'react';
import { businessService } from '../services/businessService';
import { useAuth } from '../context/AuthContext';
import '../styles/serviceManagement.css'; // Import the CSS file

export const ServiceManagement = () => {
  const { isAdmin } = useAuth();
  
  // State for Table
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageNumber: 1, totalPages: 1 });
  
  // State for Form
  const [formData, setFormData] = useState({ name: '', displayOrder: '' });
  const [editingId, setEditingId] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Fetch Services
  const loadServices = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await businessService.getAll(page, 15);
      const result = data.result || data; 
      setServices(result.content || []);
      setPagination({
        pageNumber: result.pageNumber || 1,
        totalPages: result.totalPages || 1
      });
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Form Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!isAdmin) return;

    try {
      if (editingId) {
        await businessService.update(editingId, formData);
      } else {
        await businessService.create(formData);
      }
      
      setFormData({ name: '', displayOrder: '' });
      setEditingId(null);
      loadServices(pagination.pageNumber);
    } catch (err) {
      setSubmitError(err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, displayOrder: item.displayOrder });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

 const handleDelete = async (id, serviceName) => {
    if (!isAdmin) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${serviceName}" không?`)) {
      try {
        await businessService.delete(id);
        loadServices(pagination.pageNumber); 
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', displayOrder: '' });
    setSubmitError('');
  };

  return (
    <div className="service-manager-container">
      
      {/* Header Banner */}
      <div className="header-banner">
        <h1>Quản lý phần mềm nghiệp vụ</h1>
      </div>

      {/* Admin Form (Only visible to Admins) */}
      {isAdmin && (
        <div className="admin-form-section">
          <h2 className="form-title">
            {editingId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
          </h2>
          
          {submitError && <p className="error-message">{submitError}</p>}

          <form onSubmit={handleSubmit} className="form-group-container">
            <div className="form-group flex-1">
              <label>
                Tên phần mềm nghiệp vụ <span className="required-star">*</span>
              </label>
              <input 
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group w-32">
              <label>
                STT <span className="required-star">*</span>
              </label>
              <input 
                type="number"
                className="form-input"
                value={formData.displayOrder}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || Number(val) > 0) {
                    setFormData({...formData, displayOrder: val});
                  }
                }}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'CẬP NHẬT' : 'THÊM MỚI'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                  HỦY
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="table-container">
        <table className="service-table">
          <thead>
            <tr>
              <th className="border-r text-center w-16">STT</th>
              <th className="border-r">Tên phần mềm nghiệp vụ</th>
              {isAdmin && <th className="text-center w-40">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 3 : 2} className="empty-state">Đang tải dữ liệu...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={isAdmin ? 3 : 2} className="empty-state">Chưa có dữ liệu</td></tr>
            ) : services.map((s) => (
              <tr key={s.id}>
                <td className="border-r text-center">{s.displayOrder}</td>
                <td className="border-r uppercase-text">{s.name}</td>
                {isAdmin && (
                  <td className="text-center">
                    <button type="button" onClick={() => handleEdit(s)} className="action-btn edit">Sửa</button>
                    <span className="action-divider">|</span>
                    <button type="button" onClick={() => handleDelete(s.id, s.name)} className="action-btn delete">Xóa</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <span>Trang {pagination.pageNumber} / {pagination.totalPages}</span>
        <div className="button-group">
          <button 
            disabled={pagination.pageNumber <= 1}
            onClick={() => loadServices(pagination.pageNumber - 1)}
            className="btn btn-pagination"
          >
            Trước
          </button>
          <button 
            disabled={pagination.pageNumber >= pagination.totalPages}
            onClick={() => loadServices(pagination.pageNumber + 1)}
            className="btn btn-pagination"
          >
            Sau
          </button>
        </div>
      </div>

    </div>
  );
};
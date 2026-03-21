import React, { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import '../styles/users.css'

export const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0
  })

  // --- UPDATED: Added fullName to form state ---
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'ROLE_USER',
  })

  useEffect(() => {
    loadUsers(1) 
  }, [])

  const loadUsers = async (page = 1) => {
    setLoading(true)
    const result = await userService.searchUsers(searchName, page, pagination.size)
    
    if (result.success) {
      const { content, totalPages, totalElements, pageNumber } = result.data
      
      setUsers(content || [])
      setPagination(prev => ({
        ...prev,
        page: pageNumber,
        totalPages,
        totalElements
      }))
    } else {
      setMessage(`Error: ${result.error}`)
    }
    setLoading(false)
  }

  const handleSearch = () => {
    loadUsers(1)
  }

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    loadUsers(newPage)
  }

  const handleCreateClick = () => {
    setEditingId(null)
    // --- UPDATED: Reset fullName when opening create form ---
    setFormData({ fullName: '', username: '', password: '', role: 'ROLE_USER' })
    setShowCreateForm(true)
  }

  const handleRowClick = async (userId) => {
    const result = await userService.getUserDetail(userId)
    if (result.success) {
      setSelectedUser(result.data)
 
    } else {
      setMessage(`Error loading details: ${result.error}`)
    }
  }

  const handleEditClick = async (userId) => {
    const result = await userService.getUserDetail(userId);

    if (result.success && result.data) {
      const userData = result.data;

      const rawRole = userData.roleName || userData.role?.name || userData.role || "";
      console.log(rawRole)
      const normalizedRole = rawRole
        ? rawRole.startsWith("ROLE_") ? rawRole : `ROLE_${rawRole}`
        : "ROLE_USER";

      // --- UPDATED: Populate fullName when editing ---
      setFormData({
        username: userData.username,
        password: "",
        fullName: userData.fullName || "",
        role: normalizedRole,
      });

      setEditingId(userId);
      setShowCreateForm(true);
    } else {
      setMessage(`Lỗi: ${result.error}`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("[v0] Form submitted with data:", formData)
    
    const roleToSend = formData.role.replace('ROLE_', '')
    const submitData = {
      ...formData,
      role: roleToSend,
    }
    console.log("[v0] Sending to backend:", submitData)
    
    let result
    if (editingId) {
      console.log("[v0] Updating user with ID:", editingId)
      result = await userService.updateUser(editingId, submitData)
    } else {
      result = await userService.createUser(submitData)
    }

    if (result.success) {
      setMessage(editingId ? 'User updated successfully!' : 'User created successfully!')
      setShowCreateForm(false)
      loadUsers(pagination.page) 
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(`Error: ${result.error}`)
      console.log("[v0] Error result:", result)
    }
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>User Management</h2>
        <button onClick={handleCreateClick} className="btn btn-primary">
          Thêm người dùng 
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Tìm kiếm
        </button>
      </div>

      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

      {showCreateForm && (
        <div className="form-container">
          <div className="form-card">
            <h3>{editingId ? 'Edit User' : 'Create New User'}</h3>
            <form onSubmit={handleSubmit}>
              
              {/* --- UPDATED: Full Name input with correct 'name' attribute --- */}
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Password {editingId && '(leave empty to keep current)'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required={!editingId}
                  className="form-input"
                  minLength="8"
                  placeholder="Min 8 characters"
                />
              </div>
              
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleFormChange} className="form-input">
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="form-container" onClick={() => setSelectedUser(null)}> 
          <div className="form-card" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="detail-row">
              <strong>ID:</strong> <span>{selectedUser.id}</span>
            </div>
            {/* --- UPDATED: Display Full Name in details modal --- */}
            <div className="detail-row">
              <strong>Full Name:</strong> <span>{selectedUser.fullName}</span>
            </div>
            <div className="detail-row">
              <strong>Username:</strong> <span>{selectedUser.username}</span>
            </div>
            <div className="detail-row">
              <strong>Role:</strong> 
           <span className={`role-badge ${
                (selectedUser.roleName || selectedUser.role?.name || '') === 'ADMIN' ? 'admin' : 'user'
              }`}>
                {selectedUser.roleName || selectedUser.role?.name || selectedUser.role || 'No Role'}
              </span>
            </div>
            {selectedUser.createdAt && (
              <div className="detail-row">
                 <strong>Joined:</strong> <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
            )}
            
            <div className="form-actions" style={{marginTop: '20px'}}>
              <button 
                className="action-btn outline" 
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="users-list-section">
        <h3>Users ({pagination.totalElements})</h3>
        {loading ? (
          <p>Loading...</p>
        ) : users.length > 0 ? (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  {/* --- UPDATED: Added Full Name column header --- */}
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    {/* --- UPDATED: Added Full Name cell --- */}
                    <td>{user.fullName}</td>
                    <td>{user.username}</td>
                    <td>{user.roleName || user.role?.name || user.role || 'No Role'}</td>
                    <td>
                      <button onClick={() => handleEditClick(user.id)} className="btn btn-primary">
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
              <button 
                className="action-btn outline"
                style={{ padding: '5px 10px', cursor: 'pointer' }}
                disabled={pagination.page === 1}
                onClick={() => changePage(pagination.page - 1)}
              >
                Quay lại
              </button>
              
              <span>
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
              </span>
              
              <button 
                className="action-btn outline"
                style={{ padding: '5px 10px', cursor: 'pointer' }}
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => changePage(pagination.page + 1)}
              >
                Tiếp theo
              </button>
            </div>
          </>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  )
}
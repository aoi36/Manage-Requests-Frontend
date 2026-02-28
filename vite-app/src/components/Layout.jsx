import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css'; // Make sure the path to your CSS is correct

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* 1. Shared Header */}
      <header className="header">
        <div className="header-content">
          <h1>Hệ thống Quản lý Yêu cầu</h1>
          <div className="header-actions">
            <span className="user-name">Xin chào, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
          </div>
        </div>
      </header>

      {/* 2. Shared Navigation Tabs */}
      <nav className="nav-tabs">
        <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}>
          Trang chủ
        </Link>
        
        <Link to="/create" className={`nav-tab ${location.pathname === '/create' ? 'active' : ''}`}>
          Tạo Yêu Cầu Mới
        </Link>

        {isAdmin && (
              <>
                <Link to="/services" className={`nav-tab ${location.pathname === '/services' ? 'active' : ''}`}>
                    Quản lý Dịch vụ
                </Link>
                
                {/* ADD THE USER MANAGEMENT LINK HERE */}
                <Link to="/users" className={`nav-tab ${location.pathname === '/users' ? 'active' : ''}`}>
                    Quản lý Người dùng
                </Link>
                </>
        )}
      </nav>

      {/* 3. Dynamic Page Content injected here */}
      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;
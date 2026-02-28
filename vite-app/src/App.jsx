import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import Layout from './components/Layout' // <-- Import the new Layout

// Import your pages
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ServiceManagement } from './pages/ServiceManagement'
import CreatePost from './pages/CreatePost'
import { Users } from './components/Users'

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <h2>Đang tải...</h2>
      </div>
    )
  }

  return (
    <div className="app">
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />

        {/* Protected Routes wrapped inside the Layout */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/services" element={<ServiceManagement />} />
          <Route path="/users" element={<Users />} /> {/* ADD THIS LINE */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import DashboardPage from './pages/DashboardPage';
import TestsPage from './pages/TestsPage';
import LoginPage from './pages/LoginPage';
import './index.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route 
            path="/admin/login" 
            element={<LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/admin/login" replace />} 
          />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {/* Header */}
          <AdminHeader onLogout={handleLogout} />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              {/* Dashboard */}
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              
              {/* Tests Management */}
              <Route path="/admin/tests" element={<TestsPage />} />
              <Route path="/admin/tests/create" element={<div className="p-6"><h1 className="text-2xl font-bold">Tạo Test Mới</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              <Route path="/admin/tests/:id/edit" element={<div className="p-6"><h1 className="text-2xl font-bold">Chỉnh Sửa Test</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              <Route path="/admin/tests/:id/view" element={<div className="p-6"><h1 className="text-2xl font-bold">Chi Tiết Test</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              
              {/* Students Management */}
              <Route path="/admin/students" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản Lý Học Sinh</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              
              {/* Results & Analytics */}
              <Route path="/admin/results" element={<div className="p-6"><h1 className="text-2xl font-bold">Kết Quả Thi</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              <Route path="/admin/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Thống Kê & Báo Cáo</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              
              {/* System Management */}
              <Route path="/admin/users" element={<div className="p-6"><h1 className="text-2xl font-bold">Quản Lý Người Dùng</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              <Route path="/admin/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Cài Đặt Hệ Thống</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              
              {/* Profile */}
              <Route path="/admin/profile" element={<div className="p-6"><h1 className="text-2xl font-bold">Thông Tin Cá Nhân</h1><p className="text-gray-600 mt-2">Trang này đang được phát triển...</p></div>} />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;

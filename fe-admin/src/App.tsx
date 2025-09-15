import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './index.css';
import PlacementTestsPage from './pages/placement-tests/PlacementTestsPage';
import ViewTestPage from './pages/placement-tests/ViewTestPage';
import EditTestPage from './pages/placement-tests/EditTestPage';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}>
          {/* Header */}
          <AdminHeader onLogout={handleLogout} />

          {/* Page Content */}
          <main className="p-6">
            <Routes>
              {/* Dashboard */}
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              
              {/* Placement Tests Management */}
              <Route path="/admin/placement-tests" element={<PlacementTestsPage />} />
              <Route path="/admin/placement-tests/:testId/view" element={<ViewTestPage />} />
              <Route path="/admin/placement-tests/:testId/edit" element={<EditTestPage />} />

              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;

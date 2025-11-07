import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './index.css';
import PlacementTestsPage from './pages/PlacementTestPage/ListTestsPage';
import ViewTestPage from './pages/PlacementTestPage/ViewTestPage';
import EditTestPage from './pages/PlacementTestPage/EditTestPage';
import CreateTestPage from './pages/PlacementTestPage/CreateTestPage';
import ImportTestPage from './pages/PlacementTestPage/ImportTestPage';
import RoadmapPage from './pages/RoadmapPage/RoadmapPage';
import PracticePage from './pages/PracticePage/PracticePage';
import CreatePracticePage from './pages/PracticePage/CreatePracticePage';
import EditPracticePage from './pages/PracticePage/EditPracticePage';
import ViewPracticePage from './pages/PracticePage/ViewPracticePage';
import ImportPracticePage from './pages/PracticePage/ImportPracticePage';
import LessonsPage from './pages/LessonsPage/LessonsPage';
import MockExamPage from './pages/MockExamPage/MockExamPage';
import BlogPage from './pages/BlogPage/BlogPage';
import UsersPage from './pages/UsersPage/UsersPage';
import CreateUserPage from './pages/UsersPage/CreateUserPage';
import EditUserPage from './pages/UsersPage/EditUserPage';

// Ứng dụng quản trị chính của hệ thống, điều phối layout và định tuyến
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Kiểm tra token mỗi khi ứng dụng khởi động để khôi phục phiên đăng nhập
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Lưu token admin sau khi đăng nhập thành công
  const handleLogin = (token: string) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  // Xóa token và reset trạng thái khi đăng xuất
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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
          {/* Header */}
          <AdminHeader
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main className="p-6">
            <Routes>
              {/* Dashboard */}
              <Route path="/admin/dashboard" element={<DashboardPage />} />

              {/* Placement Tests Management */}
              <Route path="/admin/placement-tests" element={<PlacementTestsPage />} />
              <Route path="/admin/placement-tests/create" element={<CreateTestPage />} />
              <Route path="/admin/placement-tests/import" element={<ImportTestPage />} />
              <Route path="/admin/placement-tests/:testId/view" element={<ViewTestPage />} />
              <Route path="/admin/placement-tests/:testId/edit" element={<EditTestPage />} />

              {/* Additional Feature Sections */}
              <Route path="/admin/roadmap" element={<RoadmapPage />} />
              <Route path="/admin/practice" element={<PracticePage />} />
              <Route path="/admin/practice/create" element={<CreatePracticePage />} />
              <Route path="/admin/practice/import" element={<ImportPracticePage />} />
              <Route path="/admin/practice/:practiceId/view" element={<ViewPracticePage />} />
              <Route path="/admin/practice/:practiceId/edit" element={<EditPracticePage />} />
              <Route path="/admin/lessons" element={<LessonsPage />} />
              <Route path="/admin/mock-exams" element={<MockExamPage />} />
              <Route path="/admin/blog" element={<BlogPage />} />
              {/* Users Management */}
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/users/create" element={<CreateUserPage />} />
              <Route path="/admin/users/:userId/edit" element={<EditUserPage />} />


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

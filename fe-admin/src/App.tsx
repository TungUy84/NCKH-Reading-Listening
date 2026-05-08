import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import './index.css';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PlacementTestsPage = lazy(() => import('./pages/PlacementTestPage/ListTestsPage'));
const ViewTestPage = lazy(() => import('./pages/PlacementTestPage/ViewTestPage'));
const EditTestPage = lazy(() => import('./pages/PlacementTestPage/EditTestPage'));
const CreateTestPage = lazy(() => import('./pages/PlacementTestPage/CreateTestPage'));
const ImportTestPage = lazy(() => import('./pages/PlacementTestPage/ImportTestPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage/RoadmapPage'));
const EditRoadmapPage = lazy(() => import('./pages/RoadmapPage/EditRoadmapPage'));
const PracticePage = lazy(() => import('./pages/PracticePage/PracticePage'));
const CreatePracticePage = lazy(() => import('./pages/PracticePage/CreatePracticePage'));
const EditPracticePage = lazy(() => import('./pages/PracticePage/EditPracticePage'));
const ViewPracticePage = lazy(() => import('./pages/PracticePage/ViewPracticePage'));
const ImportPracticePage = lazy(() => import('./pages/PracticePage/ImportPracticePage'));
const LessonsPage = lazy(() => import('./pages/LessonsPage/LessonsPage'));
const CreateLessonPage = lazy(() => import('./pages/LessonsPage/CreateLessonPage'));
const EditLessonPage = lazy(() => import('./pages/LessonsPage/EditLessonPage'));
const ViewLessonPage = lazy(() => import('./pages/LessonsPage/ViewLessonPage'));
const BlogApprovalPage = lazy(() => import('./pages/BlogPage/BlogApprovalPage'));
const BlogPage = lazy(() => import('./pages/BlogPage/BlogPage'));
const UsersPage = lazy(() => import('./pages/UsersPage/UsersPage'));
const CreateUserPage = lazy(() => import('./pages/UsersPage/CreateUserPage'));
const EditUserPage = lazy(() => import('./pages/UsersPage/EditUserPage'));

const LoadingSpinner = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

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
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
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
            <Suspense fallback={<LoadingSpinner />}>
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
                <Route path="/admin/roadmap/edit/:id" element={<EditRoadmapPage />} />
                <Route path="/admin/practice" element={<PracticePage />} />
                <Route path="/admin/practice/create" element={<CreatePracticePage />} />
                <Route path="/admin/practice/import" element={<ImportPracticePage />} />
                <Route path="/admin/practice/:practiceId/view" element={<ViewPracticePage />} />
                <Route path="/admin/practice/:practiceId/edit" element={<EditPracticePage />} />

                {/* Lessons Management */}
                <Route path="/admin/lessons" element={<LessonsPage />} />
                <Route path="/admin/lessons/create" element={<CreateLessonPage />} />
                <Route path="/admin/lessons/:lessonId" element={<ViewLessonPage />} />
                <Route path="/admin/lessons/edit/:lessonId" element={<EditLessonPage />} />

                {/* Blog Management */}
                <Route path="/admin/blog/approval" element={<BlogApprovalPage />} />
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
            </Suspense>
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

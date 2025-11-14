import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AOS from 'aos';
import Lenis from 'lenis';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import TestsPage from './pages/PlacementTestPage/TestsPage';
import TakeTestPage from './pages/PlacementTestPage/TakeTestPage';
import TestResultPage from './pages/PlacementTestPage/TestResultPage';
import LoginPage from './pages/UserPage/LoginPage';
import RegisterPage from './pages/UserPage/RegisterPage';
import ProfilePage from './pages/UserPage/ProfilePage';
import ForgotPasswordPage from './pages/UserPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/UserPage/ResetPasswordPage';
import PracticeListPage from './pages/PracticePage/PracticeListPage';
import PracticeDetailPage from './pages/PracticePage/PracticeDetailPage';
import PracticeTakePage from './pages/PracticePage/PracticeTakePage';
import PracticeResultPage from './pages/PracticePage/PracticeResultPage';
import MockTestPage from './pages/MockTestPage/MockTestPage';
import LessonsPage from './pages/LessonsPage/LessonsPage';
import LessonDetailPage from './pages/LessonsPage/LessonDetailPage';
import BlogPage from './pages/BlogPage/BlogPage';
import RoadmapPage from './pages/RoadmapPage/RoadmapPage';
import RoadmapSetupPage from './pages/RoadmapPage/RoadmapSetupPage';
import StageDetailPage from './pages/RoadmapPage/StageDetailPage';

import 'react-toastify/dist/ReactToastify.css';
import 'aos/dist/aos.css';
import BlogDetail from './pages/BlogPage/BlogDetail';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Thành phần khung ứng dụng quản lý layout chung và routing chính
const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isTestTakingPage = /^\/test\/[^/]+$/.test(pathname);
  const isPracticeTakingPage = /^\/practice\/[^/]+\/take$/.test(pathname);
  const hideLayoutChrome = isTestTakingPage || isPracticeTakingPage;

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden${hideLayoutChrome ? ' bg-gray-50' : ''}`}>
      {!hideLayoutChrome && <Header />}

      <main className={`flex-1 ${hideLayoutChrome ? '' : 'pt-16'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/test/:testId" element={<TakeTestPage />} />
          <Route path="/test/:testId/result" element={<TestResultPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/practice" element={<PracticeListPage />} />
          <Route
            path="/practice/:practiceId"
            element={
              <ProtectedRoute>
                <PracticeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:practiceId/take"
            element={
              <ProtectedRoute>
                <PracticeTakePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/attempts/:attemptId"
            element={
              <ProtectedRoute>
                <PracticeResultPage />
              </ProtectedRoute>
            }
          />
          <Route path="/mock-test" element={<MockTestPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:blogId" element={<BlogDetail />} />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap/setup"
            element={
              <ProtectedRoute>
                <RoadmapSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap/stage/:levelGroup"
            element={
              <ProtectedRoute>
                <StageDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="section-container py-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Không tìm thấy trang</h1>
                <p className="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại.</p>
                <a href="/" className="btn-primary">
                  Về trang chủ
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {!hideLayoutChrome && <Footer />}
    </div>
  );
};

// Thành phần gốc thiết lập nhà cung cấp context và cấu hình router
const App: React.FC = () => {
  useEffect(() => {
    // Khởi tạo AOS để kích hoạt animation mỗi khi cuộn tới section mới
    AOS.init({
      duration: 400,
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    // Dùng Lenis để xử lý cuộn mượt trên toàn bộ trang
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    window.__lenis = lenis;

    let frameId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScrollToTop />
        <AppShell />

        {/* Toast hiển thị thông báo toàn cục */}
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
    </AuthProvider>
  );
};

export default App;

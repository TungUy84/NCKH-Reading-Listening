import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AOS from 'aos';
import Lenis from 'lenis';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import 'react-toastify/dist/ReactToastify.css';
import 'aos/dist/aos.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const TestsPage = lazy(() => import('./pages/PlacementTestPage/TestsPage'));
const TakeTestPage = lazy(() => import('./pages/PlacementTestPage/TakeTestPage'));
const TestResultPage = lazy(() => import('./pages/PlacementTestPage/TestResultPage'));
const TestSummaryPage = lazy(() => import('./pages/PlacementTestPage/TestSummaryPage'));
const LoginPage = lazy(() => import('./pages/UserPage/LoginPage'));
const RegisterPage = lazy(() => import('./pages/UserPage/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/UserPage/ProfilePage'));
const StatisticsPage = lazy(() => import('./pages/UserPage/StatisticsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/UserPage/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/UserPage/ResetPasswordPage'));
const PracticeListPage = lazy(() => import('./pages/PracticePage/PracticePage'));
const PracticeDetailPage = lazy(() => import('./pages/PracticePage/PracticeDetailPage'));
const PracticeTakePage = lazy(() => import('./pages/PracticePage/PracticeTakePage'));
const PracticeResultPage = lazy(() => import('./pages/PracticePage/PracticeResultPage'));
const PracticeReviewPage = lazy(() => import('./pages/PracticePage/PracticeReviewPage'));
const MockTestPage = lazy(() => import('./pages/MockTestPage/MockTestPage'));
const MockTestDetailPage = lazy(() => import('./pages/MockTestPage/MockTestDetailPage'));
const TakeMockTestPage = lazy(() => import('./pages/MockTestPage/TakeMockTestPage'));
const MockTestResultPage = lazy(() => import('./pages/MockTestPage/MockTestResultPage'));
const MockTestDetailedResultPage = lazy(() => import('./pages/MockTestPage/MockTestReviewPage'));
const LessonsPage = lazy(() => import('./pages/LessonsPage/LessonsPage'));
const LessonDetailPage = lazy(() => import('./pages/LessonsPage/LessonDetailPage'));
const BlogPage = lazy(() => import('./pages/BlogPage/BlogPage'));
const MyBlogsPage = lazy(() => import('./pages/BlogPage/MyBlogsPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage/RoadmapPage'));
const RoadmapSetupPage = lazy(() => import('./pages/RoadmapPage/RoadmapSetupPage'));
const StageDetailPage = lazy(() => import('./pages/RoadmapPage/StageDetailPage'));
const CheckpointDetailPage = lazy(() => import('./pages/RoadmapPage/CheckpointDetailPage'));
const TakeCheckpointPage = lazy(() => import('./pages/RoadmapPage/TakeCheckpointPage'));
const CheckpointResultPage = lazy(() => import('./pages/RoadmapPage/CheckpointResultPage'));
const CheckpointReviewPage = lazy(() => import('./pages/RoadmapPage/CheckpointReviewPage'));

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Background chung cho toàn bộ ứng dụng (Modern Gradient)
const GlobalBackground = () => (
  <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-50 bg-slate-50">
    <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/80 via-white to-slate-50" />
    <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 animate-pulse" />
    <div className="absolute top-[200px] left-[-100px] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-3xl opacity-50" />
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isTestTakingPage = /^\/test\/[^/]+$/.test(pathname) || /^\/mock-test\/[^/]+\/take$/.test(pathname) || /^\/test\/[^/]+\/result\/details$/.test(pathname) || /^\/roadmap\/checkpoint\/[^/]+\/take$/.test(pathname) || /^\/roadmap\/checkpoint\/review\/[^/]+$/.test(pathname) || /^\/mock-test\/result\/[^/]+\/details$/.test(pathname);
  const isPracticeTakingPage = /^\/practice\/[^/]+\/take$/.test(pathname) || /^\/practice\/[^/]+\/review\/[^/]+$/.test(pathname);
  const hideLayoutChrome = isTestTakingPage || isPracticeTakingPage;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      {/* Background nằm dưới cùng */}
      <GlobalBackground />

      {!hideLayoutChrome && <Header />}

      {/* Main content đã có pt-16 từ App, nên các trang con chỉ cần padding nhỏ */}
      <main className={`flex-1 ${hideLayoutChrome ? '' : 'pt-16'}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/test/:testId" element={<TakeTestPage />} />
            <Route path="/test/:testId/result" element={<TestSummaryPage />} />
            <Route path="/test/:testId/result/details" element={<TestResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/practice" element={<PracticeListPage />} />
            <Route path="/practice/:practiceId" element={<ProtectedRoute><PracticeDetailPage /></ProtectedRoute>} />
            <Route path="/practice/:practiceId/take" element={<ProtectedRoute><PracticeTakePage /></ProtectedRoute>} />
            <Route path="/practice/attempts/:attemptId" element={<ProtectedRoute><PracticeResultPage /></ProtectedRoute>} />
            <Route path="/practice/:practiceId/review/:attemptId" element={<ProtectedRoute><PracticeReviewPage /></ProtectedRoute>} />
            <Route path="/mock-test" element={<MockTestPage />} />
            <Route path="/mock-test/result/:resultId/details" element={<ProtectedRoute><MockTestDetailedResultPage /></ProtectedRoute>} />
            <Route path="/mock-test/result/:resultId" element={<ProtectedRoute><MockTestResultPage /></ProtectedRoute>} />
            <Route path="/mock-test/:testId/take" element={<TakeMockTestPage />} />
            <Route path="/mock-test/:testId" element={<MockTestDetailPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/my-posts" element={<ProtectedRoute><MyBlogsPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/roadmap/setup" element={<ProtectedRoute><RoadmapSetupPage /></ProtectedRoute>} />
            <Route path="/roadmap/stage/:levelGroup" element={<ProtectedRoute><StageDetailPage /></ProtectedRoute>} />
            <Route path="/roadmap/checkpoint/:testId" element={<ProtectedRoute><CheckpointDetailPage /></ProtectedRoute>} />
            <Route path="/roadmap/checkpoint/:testId/take" element={<ProtectedRoute><TakeCheckpointPage /></ProtectedRoute>} />
            <Route path="/roadmap/checkpoint/result/:resultId" element={<ProtectedRoute><CheckpointResultPage /></ProtectedRoute>} />
            <Route path="/roadmap/checkpoint/review/:resultId" element={<ProtectedRoute><CheckpointReviewPage /></ProtectedRoute>} />
            <Route
              path="*"
              element={
                <div className="section-container py-20 text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Không tìm thấy trang</h1>
                  <p className="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại.</p>
                  <a href="/" className="btn-primary">Về trang chủ</a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>

      {!hideLayoutChrome && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 400, once: true, offset: 50 });
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 1.0 });
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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AppShell />
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </Router>
    </AuthProvider>
  );
};

export default App;
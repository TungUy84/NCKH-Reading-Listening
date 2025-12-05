import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Squares2X2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  MapIcon,
  AcademicCapIcon,
  NewspaperIcon,
  PlusCircleIcon,
  UserPlusIcon,
  Bars3Icon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { DashboardStats, UserStats } from '../types';
import { getTestStats, getUserStats, PracticeAPI, LessonAPI, BlogAPI } from '../services/api';

// Trang tổng quan hiển thị chỉ số chính dành cho quản trị viên
const DashboardPage: React.FC = () => {
  const [testStats, setTestStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats['statistics'] | null>(null);
  const [practiceStats, setPracticeStats] = useState<{ totalPractices: number; listeningPractices: number; readingPractices: number } | null>(null);
  const [lessonStats, setLessonStats] = useState<{ totalLessons: number; listeningLessons: number; readingLessons: number } | null>(null);
  const [blogStats, setBlogStats] = useState<{ totalBlogs: number; pendingBlogs: number; approvedBlogs: number; rejectedBlogs: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Tải dữ liệu thống kê Dashboard từ API
  const loadDashboard = async () => {
    try {
      const [ts, us, ps, ls, bs] = await Promise.all([
        getTestStats().catch((e) => { console.error(e); return null; }),
        getUserStats().catch((e) => { console.error(e); return null; }),
        PracticeAPI.getStats().catch((e) => { console.error(e); return null; }),
        LessonAPI.getStats().catch((e) => { console.error(e); return null; }),
        BlogAPI.getStats().catch((e) => { console.error(e); return null; }),
      ]);
      if (ts) setTestStats(ts);
      if (us) setUserStats(us);
      if (ps) setPracticeStats(ps);
      if (ls) setLessonStats(ls);
      if (bs) setBlogStats(bs);
    } catch (error) {
      toast.error('Không thể tải dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Tổng quan nhanh các thành phần trong hệ thống</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Squares2X2Icon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Epic-based KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Người dùng */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <UserGroupIcon className="w-7 h-7 text-white" />
            </div>
            <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Xem chi tiết →
            </Link>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Người dùng</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng số</span>
              <span className="text-2xl font-bold text-gray-900">{userStats?.totalUsers ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {userStats?.activeUsers ?? 0} hoạt động
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {userStats?.inactiveUsers ?? 0} vô hiệu
              </span>
            </div>
          </div>
        </div>

        {/* Tạo bộ đề thi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
            </div>
            <Link to="/admin/placement-tests" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Xem chi tiết →
            </Link>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tạo bộ đề thi</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng số bài test</span>
              <span className="text-2xl font-bold text-gray-900">{testStats?.totalTests ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {testStats?.activeTests ?? 0} hoạt động
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {testStats?.categoryStats?.find(c => c.category === 'listening')?.count ?? 0} Listening
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {testStats?.categoryStats?.find(c => c.category === 'reading')?.count ?? 0} Reading
              </span>
            </div>
          </div>
        </div>

        {/* Ôn luyện */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AcademicCapIcon className="w-7 h-7 text-white" />
            </div>
            <Link to="/admin/practice" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Xem chi tiết →
            </Link>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ôn luyện</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bài tập thực hành</span>
              <span className="text-2xl font-bold text-gray-900">{practiceStats?.totalPractices ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {practiceStats?.listeningPractices ?? 0} Listening
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {practiceStats?.readingPractices ?? 0} Reading
              </span>
            </div>
          </div>
        </div>

        {/* Bài học */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpenIcon className="w-7 h-7 text-white" />
            </div>
            <Link to="/admin/lessons" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Xem chi tiết →
            </Link>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bài học</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nội dung giảng dạy</span>
              <span className="text-2xl font-bold text-gray-900">{lessonStats?.totalLessons ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {lessonStats?.listeningLessons ?? 0} Listening
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {lessonStats?.readingLessons ?? 0} Reading
              </span>
            </div>
          </div>
        </div>

        {/* Lộ trình */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapIcon className="w-7 h-7 text-white" />
            </div>
            <Link to="/admin/roadmap" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Xem chi tiết →
            </Link>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Lộ trình</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Định hướng học tập</span>
              <span className="text-2xl font-bold text-gray-900">-</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Learning Paths
              </span>
            </div>
          </div>
        </div>

        {/* Blog */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <NewspaperIcon className="w-7 h-7 text-white" />
            </div>
            <Link to="/admin/blog" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Xem chi tiết →
            </Link>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Blog</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tin tức & bài viết</span>
              <span className="text-2xl font-bold text-gray-900">{blogStats?.totalBlogs ?? 0}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {blogStats?.pendingBlogs ?? 0} Chờ duyệt
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {blogStats?.approvedBlogs ?? 0} Đã duyệt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Thao tác nhanh</h3>
            <p className="text-sm text-gray-600 mt-1">Các tác vụ thường dùng để quản lý hệ thống</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Tạo User */}
          <Link to="/admin/users/create" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Tạo người dùng</p>
            <p className="text-xs text-gray-600">Thêm tài khoản mới vào hệ thống</p>
          </Link>

          {/* Tạo Test */}
          <Link to="/admin/placement-tests/create" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PlusCircleIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Tạo bài test</p>
            <p className="text-xs text-gray-600">Tạo đề thi mới thủ công</p>
          </Link>

          {/* Import Test */}
          <Link to="/admin/placement-tests/import" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ArrowDownTrayIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Import test</p>
            <p className="text-xs text-gray-600">Hỗ trợ Word, PDF, Excel</p>
          </Link>

          {/* Quản lý Practice */}
          <Link to="/admin/practice" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Quản lý ôn luyện</p>
            <p className="text-xs text-gray-600">Bài tập thực hành</p>
          </Link>

          {/* Quản lý Lessons */}
          <Link to="/admin/lessons" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Quản lý bài học</p>
            <p className="text-xs text-gray-600">Nội dung giảng dạy</p>
          </Link>

          {/* Quản lý Roadmap */}
          <Link to="/admin/roadmap" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Quản lý lộ trình</p>
            <p className="text-xs text-gray-600">Định hướng học tập</p>
          </Link>

          {/* Quản lý Blog */}
          <Link to="/admin/blog" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <NewspaperIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Quản lý blog</p>
            <p className="text-xs text-gray-600">Tin tức & bài viết</p>
          </Link>

          {/* Quản lý Tests */}
          <Link to="/admin/placement-tests" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ClipboardDocumentIcon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Quản lý bài kiểm tra</p>
            <p className="text-xs text-gray-600">Xem & chỉnh sửa bài test</p>
          </Link>

          {/* Quản lý Users */}
          <Link to="/admin/users" className="group p-5 border-2 border-gray-200 rounded-xl hover:border-sky-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bars3Icon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Quản lý users</p>
            <p className="text-xs text-gray-600">Danh sách & phân quyền</p>
          </Link>
        </div>

        {/* Notes */}
        {testStats?.note && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
            <p className="text-sm text-indigo-800 font-medium">{testStats.note}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Squares2X2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  UserCircleIcon,
  MapIcon,
  BoltIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  NewspaperIcon,
  PlusCircleIcon,
  UserPlusIcon,
  Bars3Icon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { DashboardStats, UserStats } from '../types';
import { getTestStats, getUserStats } from '../services/api';

// Trang tổng quan hiển thị chỉ số chính dành cho quản trị viên
const DashboardPage: React.FC = () => {
  const [testStats, setTestStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats['statistics'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Tải dữ liệu thống kê Dashboard từ API
  const loadDashboard = async () => {
    try {
      const [ts, us] = await Promise.all([
        getTestStats().catch((e) => { console.error(e); return null; }),
        getUserStats().catch((e) => { console.error(e); return null; }),
      ]);
      if (ts) setTestStats(ts);
      if (us) setUserStats(us);
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Tổng quan nhanh các thành phần trong hệ thống</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Squares2X2Icon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users total */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900">{userStats?.totalUsers ?? 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserGroupIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {userStats?.activeUsers ?? 0} hoạt động
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {userStats?.inactiveUsers ?? 0} vô hiệu
            </span>
          </div>
        </div>

        {/* Tests total */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Tổng số bài test</p>
              <p className="text-3xl font-bold text-gray-900">{testStats?.totalTests ?? 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {(testStats?.activeTests ?? 0)} hoạt động
            </span>
          </div>
        </div>

        {/* Listening count */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Test Listening</p>
              <p className="text-3xl font-bold text-gray-900">{testStats?.categoryStats?.find(c => c.category === 'listening')?.count ?? 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SpeakerWaveIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Listening Skill</span>
          </div>
        </div>

        {/* Reading count */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Test Reading</p>
              <p className="text-3xl font-bold text-gray-900">{testStats?.categoryStats?.find(c => c.category === 'reading')?.count ?? 0}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpenIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Reading Skill</span>
          </div>
        </div>
      </div>

      {/* Feature grid + Quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Feature sections (reflect sidebar) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Khu vực chức năng</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Users */}
              <Link to="/admin/users" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                  <UserCircleIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Người dùng</p>
                <p className="text-sm text-gray-600">Quản lý tài khoản</p>
              </Link>

              {/* Placement Tests */}
              <Link to="/admin/placement-tests" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Kiểm tra đầu vào</p>
                <p className="text-sm text-gray-600">Tạo và quản lý tests</p>
              </Link>

              {/* Roadmap */}
              <Link to="/admin/roadmap" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <MapIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Lộ trình</p>
                <p className="text-sm text-gray-600">Định hướng học tập</p>
              </Link>

              {/* Practice */}
              <Link to="/admin/practice" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center mb-2">
                  <BoltIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Ôn luyện</p>
                <p className="text-sm text-gray-600">Bài tập luyện tập</p>
              </Link>

              {/* Lessons */}
              <Link to="/admin/lessons" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <AcademicCapIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Bài học</p>
                <p className="text-sm text-gray-600">Nội dung giảng dạy</p>
              </Link>

              {/* Mock Exams */}
              <Link to="/admin/mock-exams" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Thi thử</p>
                <p className="text-sm text-gray-600">Đề thi thử</p>
              </Link>

              {/* Blog */}
              <Link to="/admin/blog" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-2">
                  <NewspaperIcon className="w-5 h-5" />
                </div>
                <p className="font-medium text-gray-900">Blog</p>
                <p className="text-sm text-gray-600">Tin tức & bài viết</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/placement-tests/create" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2">
                  <PlusCircleIcon className="w-4 h-4" />
                </div>
                <p className="font-medium text-gray-900">Tạo bài test</p>
                <p className="text-sm text-gray-600">Tạo mới thủ công</p>
              </Link>
              <Link to="/admin/users/create" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-2">
                  <UserPlusIcon className="w-4 h-4" />
                </div>
                <p className="font-medium text-gray-900">Tạo người dùng</p>
                <p className="text-sm text-gray-600">Thêm tài khoản mới</p>
              </Link>
              <Link to="/admin/users" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                  <Bars3Icon className="w-4 h-4" />
                </div>
                <p className="font-medium text-gray-900">Quản lý Users</p>
                <p className="text-sm text-gray-600">Danh sách & phân quyền</p>
              </Link>
              <Link to="/admin/placement-tests/import" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-2">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </div>
                <p className="font-medium text-gray-900">Import test mới</p>
                <p className="text-sm text-gray-600">Hỗ trợ Word, PDF, Excel</p>
              </Link>
              <Link to="/admin/placement-tests" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-2">
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </div>
                <p className="font-medium text-gray-900">Quản lý Tests</p>
                <p className="text-sm text-gray-600">Xem & chỉnh sửa</p>
              </Link>
            </div>
          </div>

          {/* Notes */}
          {testStats?.note && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">{testStats.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

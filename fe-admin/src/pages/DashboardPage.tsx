import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DashboardStats, UserStats } from '../types';
import { getTestStats, getUserStats } from '../services/api';

const DashboardPage: React.FC = () => {
  const [testStats, setTestStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats['statistics'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

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
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7l2 3h9v13a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
              </svg>
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
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6m-6 0v-2a4 4 0 013-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
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
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 9H4a1 1 0 00-1 1v4a1 1 0 001 1h1.586l4.707 4.707C10.923 20.337 12 19.939 12 19V5c0-.939-1.077-1.337-1.707-.707L5.586 9z" />
              </svg>
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
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <p className="font-medium text-gray-900">Người dùng</p>
                <p className="text-sm text-gray-600">Quản lý tài khoản</p>
              </Link>

              {/* Placement Tests */}
              <Link to="/admin/placement-tests" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <p className="font-medium text-gray-900">Kiểm tra đầu vào</p>
                <p className="text-sm text-gray-600">Tạo và quản lý tests</p>
              </Link>

              {/* Roadmap */}
              <Link to="/admin/roadmap" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V5a2 2 0 012-2h3m3 0h7a2 2 0 012 2v10.382a2 2 0 01-1.553 1.894L15 20M9 3v7m0 0l-2-2m2 2l2-2"/></svg>
                </div>
                <p className="font-medium text-gray-900">Lộ trình</p>
                <p className="text-sm text-gray-600">Định hướng học tập</p>
              </Link>

              {/* Practice */}
              <Link to="/admin/practice" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/></svg>
                </div>
                <p className="font-medium text-gray-900">Ôn luyện</p>
                <p className="text-sm text-gray-600">Bài tập luyện tập</p>
              </Link>

              {/* Lessons */}
              <Link to="/admin/lessons" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z"/></svg>
                </div>
                <p className="font-medium text-gray-900">Bài học</p>
                <p className="text-sm text-gray-600">Nội dung giảng dạy</p>
              </Link>

              {/* Mock Exams */}
              <Link to="/admin/mock-exams" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                </div>
                <p className="font-medium text-gray-900">Thi thử</p>
                <p className="text-sm text-gray-600">Đề thi thử</p>
              </Link>

              {/* Blog */}
              <Link to="/admin/blog" className="group p-4 border rounded-xl hover:shadow-md transition-all bg-white">
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </div>
                <p className="font-medium text-gray-900">Tạo bài test</p>
                <p className="text-sm text-gray-600">Tạo mới thủ công</p>
              </Link>
              <Link to="/admin/users/create" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </div>
                <p className="font-medium text-gray-900">Tạo người dùng</p>
                <p className="text-sm text-gray-600">Thêm tài khoản mới</p>
              </Link>
              <Link to="/admin/users" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
                </div>
                <p className="font-medium text-gray-900">Quản lý Users</p>
                <p className="text-sm text-gray-600">Danh sách & phân quyền</p>
              </Link>
              <Link to="/admin/placement-tests/import" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                </div>
                <p className="font-medium text-gray-900">Import test mới</p>
                <p className="text-sm text-gray-600">Hỗ trợ Word, PDF, Excel</p>
              </Link>
              <Link to="/admin/placement-tests" className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
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

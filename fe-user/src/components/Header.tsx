import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  MapIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  NewspaperIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarColor, getUserInitials, getUserDisplayName, getAvatarUrl } from '../utils/avatarUtils';

// Thanh điều hướng chính cho người dùng cuối, quản lý menu và trạng thái đăng nhập
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Đóng mọi menu khi chuyển route để tránh trạng thái treo
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Bấm ra ngoài để đóng menu người dùng
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isUserMenuOpen]);

  // Danh sách route hiển thị trên thanh header
  const navigationItems = [
    { label: 'Trang chủ', href: '/', icon: HomeIcon },
    { label: 'Kiểm tra đầu vào', href: '/tests', icon: ClipboardDocumentCheckIcon },
    { label: 'Lộ trình học', href: '/roadmap', icon: MapIcon },
    { label: 'Ôn luyện', href: '/practice', icon: AcademicCapIcon },
    { label: 'Bài học', href: '/lessons', icon: BookOpenIcon },
    { label: 'Thi thử', href: '/mock-test', icon: CheckBadgeIcon },
    { label: 'Blog', href: '/blog', icon: NewspaperIcon },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Bạn muốn đăng xuất?',
      text: 'Phiên học của bạn sẽ kết thúc sau khi đăng xuất.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      await Swal.fire({
        title: 'Đã đăng xuất',
        icon: 'success',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#4F46E5',
        timer: 1400,
        timerProgressBar: true
      });
    }
  };
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo thương hiệu */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity group">
            <img src="/img/logo.png" alt="UNSkills Logo" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">UNSkills</span>
          </Link>

          {/* Điều hướng trên desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map(item => {
              const active = isActiveRoute(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${active
                    ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Khu vực đăng nhập/đăng ký trên desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(o => !o)}
                  className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {user?.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 ${getAvatarColor(getUserDisplayName(user))} rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm`}
                    >
                      {getUserInitials(user)}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate text-sm font-semibold text-slate-700">{getUserDisplayName(user)}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 py-2 animate-[fade-in_0.15s_ease-out] overflow-hidden"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-sm font-bold text-slate-900">{getUserDisplayName(user)}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/statistics"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                      Thống kê
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      role="menuitem"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Nút mở menu trên mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(o => !o)}
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menu thả xuống cho mobile */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-slate-100 animate-[fade-in_0.15s_ease-out]">
            <nav className="flex flex-col gap-1 pt-4">
              {navigationItems.map(item => {
                const active = isActiveRoute(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 border-t border-slate-100 pt-4 px-2">
              {isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-2">
                    {user?.avatar ? (
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div
                        className={`h-10 w-10 ${getAvatarColor(getUserDisplayName(user))} rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm`}
                      >
                        {getUserInitials(user)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/statistics"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      Thống kê
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

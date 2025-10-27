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
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarColor, getUserInitials, getUserDisplayName } from '../utils/avatarUtils';

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
    { label: 'Thi thử', href: '/mock-test', icon: CheckBadgeIcon },
    { label: 'Bài học', href: '/lessons', icon: BookOpenIcon },
    { label: 'Blog', href: '/blog', icon: NewspaperIcon },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo thương hiệu */}
          <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <AcademicCapIcon className="h-8 w-8" />
            <span className="text-2xl font-bold">EnglishMaster</span>
          </Link>

          {/* Điều hướng trên desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map(item => {
              const active = isActiveRoute(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 ${getAvatarColor(getUserDisplayName(user))} rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white/40`}
                    >
                      {getUserInitials(user)}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate">{getUserDisplayName(user)}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-xl py-2 animate-[fade-in_0.15s_ease-out]"
                    role="menu"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <span>👤</span> Thông tin cá nhân
                    </Link>
                    <Link
                      to="/my-tests"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <span>📊</span> Kết quả bài thi
                    </Link>
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
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
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

  {/* Menu thả xuống cho mobile */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-gray-100 animate-[fade-in_0.15s_ease-out]">
            <nav className="flex flex-col gap-1 pt-4">
              {navigationItems.map(item => {
                const active = isActiveRoute(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 border-t border-gray-100 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-1">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/40"
                      />
                    ) : (
                      <div
                        className={`h-10 w-10 ${getAvatarColor(getUserDisplayName(user))} rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white/40`}
                      >
                        {getUserInitials(user)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/my-tests"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-2 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Kết quả bài thi
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="text-left px-2 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
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

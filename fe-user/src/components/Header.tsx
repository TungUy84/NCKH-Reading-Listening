import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarColor, getUserInitials, getUserDisplayName } from '../utils/avatarUtils';
import Button from './ui/Button';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle scroll effect
  // Scroll shadow / compact mode
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isUserMenuOpen]);

  const navigationItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Kiểm tra đầu vào', href: '/tests' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };
  
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-white/95 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-4 transition-all duration-300 ${
            isScrolled ? 'h-14' : 'h-16'
          }`}
        >
          {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <div
                className={`rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold tracking-wide shadow-sm ring-1 ring-inset ring-white/10 transition-all group-hover:shadow-md ${
                  isScrolled ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'
                }`}
              >
                ET
              </div>
              <span
                className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-colors ${
                  isScrolled ? 'text-lg' : 'text-xl'
                }`}
              >
                EnglishTest
              </span>
            </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationItems.map(item => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative text-sm font-medium transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-blue-600 after:to-purple-600 after:transition-all ${
                    active
                      ? 'text-blue-600 after:w-full'
                      : 'text-gray-600 hover:text-blue-600 after:w-0 hover:after:w-full'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth (desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
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
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.186l3.71-3.955a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link to="/register">
                  <Button size="sm" className="shadow focus-visible:ring-2 focus-visible:ring-blue-600/50">
                    🚀 Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
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

        {/* Mobile panel */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 border-t border-gray-100 animate-[fade-in_0.15s_ease-out]">
            <nav className="flex flex-col gap-1 pt-4">
              {navigationItems.map(item => {
                const active = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
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
                <div className="flex gap-3 px-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

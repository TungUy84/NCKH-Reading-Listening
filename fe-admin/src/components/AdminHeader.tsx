import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthAPI } from '../services/api';
import { AdminUser } from '../types';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Dashboard';
      case '/admin/placement-tests':
        return 'Kiểm tra đầu vào';
      case '/admin/placement-tests/id':
        return 'Chi tiết bài kiểm tra'; 
      default:
        return 'Dashboard';
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await AuthAPI.getCurrentUser();
        setUser(u);
      } catch (e) {
        // ignore, handled by interceptor on 401
      }
    };
    loadUser();
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/60 px-6 py-3 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow">
                <span className="text-white font-semibold text-xs">{(user?.firstName?.[0] || user?.username?.[0] || 'A').toUpperCase()}</span>
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                  {user?.firstName || user?.username || 'Admin'} {user?.lastName || ''}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">{user?.email || ''}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/60 py-2 z-50 backdrop-blur-sm">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-2 transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Thông tin cá nhân</span>
                  </div>
                </Link>
                <div className="border-t border-gray-100 my-2 mx-2"></div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Đăng xuất</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

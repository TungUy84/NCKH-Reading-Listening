import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  ArrowRightOnRectangleIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ASSET_BASE_URL, AuthAPI } from '../services/api';
import { AdminUser } from '../types';

interface AdminHeaderProps {
  onLogout: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

// Sinh URL avatar ưu tiên ảnh upload, fallback sang avatar initials
const buildAvatarUrl = (user: AdminUser | null, errored: boolean): string => {
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Admin';
  const raw = user?.avatar;
  if (raw && !errored) {
    if (/^https?:/i.test(raw)) return raw;
    const normalized = raw.startsWith('/') ? raw : `/${raw}`;
    return `${ASSET_BASE_URL}${normalized}`;
  }
  return `https://ui-avatars.com/api/?background=4C6EF5&color=fff&name=${encodeURIComponent(displayName)}`;
};

// Header cố định trên admin: hiển thị breadcrumb và menu tài khoản
const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout, onToggleSidebar, sidebarCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const location = useLocation();

  // Derive breadcrumb label (could be extended later)
  const getCrumb = () => {
    if (location.pathname.startsWith('/admin/placement-tests')) return 'Kiểm tra / Thi thử';
    if (location.pathname.startsWith('/admin/dashboard')) return 'Dashboard';
    return 'Trang quản trị';
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

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const avatarUrl = buildAvatarUrl(user, avatarError);

  return (
  <header className="bg-white/95 supports-[backdrop-filter]:backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 h-14 flex items-center sticky top-0 z-30 shadow-sm">
      {/* Left section: sidebar toggle + crumb */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <Bars3Icon className="w-5 h-5" />
          ) : (
            <Bars3BottomLeftIcon className="w-5 h-5" />
          )}
        </button>
        <div className="hidden md:flex items-center text-sm text-gray-500 gap-2 truncate">
          <span className="text-gray-400">Admin</span>
          <ChevronRightIcon className="w-4 h-4 text-gray-300" />
          <span className="font-medium text-gray-700 truncate max-w-[180px]">{getCrumb()}</span>
        </div>

      </div>

      {/* Right section: user menu */}
      <div className="flex items-center gap-3">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 pl-1 pr-3 py-1.5 rounded-full border border-gray-200 bg-white hover:shadow-sm hover:border-gray-300 transition-all"
            >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
              <img
                src={avatarUrl}
                alt={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'Admin avatar'}
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
              </div>
            <div className="hidden md:block leading-tight text-left max-w-[180px]">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.firstName || user?.username || 'Admin'} {user?.lastName || ''}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200/70 py-2 z-50">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md mx-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center">
                    <UserCircleIcon className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="font-medium">Thông tin cá nhân</span>
                  </div>
                </Link>
                <div className="border-t border-gray-100 my-2 mx-2" />
                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    const result = await Swal.fire({
                      title: 'Đăng xuất quản trị?',
                      text: 'Bạn sẽ cần đăng nhập lại để tiếp tục quản lý hệ thống.',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'Đăng xuất',
                      cancelButtonText: 'Hủy',
                      confirmButtonColor: '#2563EB',
                      cancelButtonColor: '#6B7280',
                      reverseButtons: true
                    });

                    if (result.isConfirmed) {
                      onLogout();
                      await Swal.fire({
                        title: 'Đã đăng xuất',
                        icon: 'success',
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#2563EB',
                        timer: 1400,
                        timerProgressBar: true
                      });
                    }
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md mx-2"
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                    <span className="font-medium">Đăng xuất</span>
                  </div>
                </button>
              </div>
            )}
          </div>
      </div>
    </header>
  );
};

export default AdminHeader;

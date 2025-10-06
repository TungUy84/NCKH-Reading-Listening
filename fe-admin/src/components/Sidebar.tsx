import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  MapIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <Squares2X2Icon className="w-5 h-5" />,
    },
    {
      label: 'Người dùng',
      href: '/admin/users',
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      label: 'Kiểm tra đầu vào',
      href: '/admin/placement-tests',
      icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />,
    },
    {
      label: 'Lộ trình',
      href: '/admin/roadmap',
      icon: <MapIcon className="w-5 h-5" />,
    },
    {
      label: 'Ôn luyện',
      href: '/admin/practice',
      icon: <AcademicCapIcon className="w-5 h-5" />,
    },
    {
      label: 'Bài học',
      href: '/admin/lessons',
      icon: <BookOpenIcon className="w-5 h-5" />,
    },
    {
      label: 'Thi thử',
      href: '/admin/mock-exams',
      icon: <CheckBadgeIcon className="w-5 h-5" />,
    },
    {
      label: 'Blog',
      href: '/admin/blog',
      icon: <NewspaperIcon className="w-5 h-5" />,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.href ? isActiveRoute(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.label)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
              isCollapsed ? 'justify-center' : ''
            } text-slate-300 hover:text-white hover:bg-slate-700`}
            title={isCollapsed ? item.label : undefined}
          >
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </div>
            {!isCollapsed && (
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="pl-6 space-y-2">
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href!}
        className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform' 
            : 'text-slate-300 hover:text-white hover:bg-slate-700'
        } ${isCollapsed ? 'justify-center' : ''} ${level > 0 ? 'text-sm ml-3' : ''}`}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center space-x-3">
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
          {!isCollapsed && (
            <span className="font-medium">{item.label}</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-[#0f172a] bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 border-r border-slate-800/70 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col shadow-xl z-40`}>
      {/* Branding */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 w-full justify-center md:justify-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow text-white text-sm font-semibold">
            A
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-white font-semibold text-lg tracking-tight">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
      {/* Removed static user block for a cleaner admin sidebar */}
    </div>
  );
};

export default Sidebar;

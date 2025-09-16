import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Kiểm tra đầu vào',
      href: '/admin/placement-tests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Lộ trình',
      href: '/admin/roadmap',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      ),
    },
    {
      label: 'Ôn luyện',
      href: '/admin/practice',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
        </svg>
      ),
    },
    {
      label: 'Bài học',
      href: '/admin/lessons',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l9-5-9-5-9 5 9 5z" />
        </svg>
      ),
    },
    {
      label: 'Thi thử',
      href: '/admin/mock-exams',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6l2 2h6a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      label: 'Blog',
      href: '/admin/blog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2h-3.34a1 1 0 01-.7-.29l-1.93-1.93A1 1 0 0010.66 4H5A2 2 0 003 6v5" />
        </svg>
      ),
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

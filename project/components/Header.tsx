import React, { useState } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Trang chủ', href: '#home' },
    { label: 'Kiểm tra đầu vào', href: '#placement-test' },
    { label: 'Ôn luyện', href: '#practice' },
    { label: 'Bài học', href: '#lessons' },
    { label: 'Lộ trình học', href: '#learning-path' },
    { label: 'Thi thử', href: '#mock-test' },
    { label: 'Blog', href: '#blog' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900">VLU English Test</span>
              <span className="text-xs text-gray-500">Đại học Văn Lang</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Đăng nhập
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Đăng nhập
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

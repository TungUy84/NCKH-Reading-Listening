import React from 'react';
import { BookOpen, Mail, Phone, MapPin, Facebook, Youtube, Instagram } from 'lucide-react';

export function Footer() {
  const footerSections = [
    {
      title: 'Sản phẩm',
      links: [
        { label: 'Kiểm tra đầu vào', href: '#placement-test' },
        { label: 'Ôn luyện', href: '#practice' },
        { label: 'Bài học', href: '#lessons' },
        { label: 'Lộ trình học', href: '#learning-path' },
        { label: 'Thi thử', href: '#mock-test' },
      ],
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Trung tâm trợ giúp', href: '#help' },
        { label: 'Hướng dẫn sử dụng', href: '#guide' },
        { label: 'Câu hỏi thường gặp', href: '#faq' },
        { label: 'Liên hệ', href: '#contact' },
      ],
    },
    {
      title: 'Về chúng tôi',
      links: [
        { label: 'Giới thiệu', href: '#about' },
        { label: 'Đội ngũ', href: '#team' },
        { label: 'Blog', href: '#blog' },
        { label: 'Tin tức', href: '#news' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white">VLU English Test</span>
                <span className="text-xs text-gray-400">Đại học Văn Lang</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Nền tảng luyện thi tiếng Anh hàng đầu dành cho sinh viên Đại học Văn Lang
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  45 Nguyễn Khắc Nhu, Q1, TP.HCM
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">(028) 7300 5588</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">support@vlu.edu.vn</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-2 lg:col-start-auto">
              <h4 className="text-white mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="text-white mb-6">
              Đăng ký nhận thông tin
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Nhận tin tức, mẹo học tập và ưu đãi mới nhất
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                Đăng ký
              </button>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="#facebook"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#youtube"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#instagram"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2024 VLU English Test. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

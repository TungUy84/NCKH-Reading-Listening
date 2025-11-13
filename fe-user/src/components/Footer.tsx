import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

// Footer hiển thị thông tin liên hệ và liên kết nhanh cuối trang
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Chia các liên kết theo nhóm để render linh hoạt
  const footerLinks = {
    'Liên kết nhanh': [
      { label: 'Trang chủ', href: '/' },
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Đề thi', href: '/tests' },
      { label: 'Tin tức', href: '/blog' },
    ],
    'Hỗ trợ': [
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản sử dụng', href: '/terms' },
    ],
  };

  return (
    <footer className="relative border-t border-gray-200 bg-white/80 backdrop-blur">
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent)] bg-gradient-to-br from-blue-50 via-transparent to-purple-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Khối thông tin thương hiệu */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white/20 group-hover:shadow group-hover:scale-105 transition-all">
                ET
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EnglishTest</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-600 max-w-md mb-6">
              Hệ thống luyện thi tiếng Anh trực tuyến với công nghệ AI giúp bạn học hiệu quả và đạt được mục tiêu điểm số của mình.
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: 'Facebook', href: 'https://facebook.com', icon: <Facebook className="w-5 h-5" aria-hidden="true" /> },
                { label: 'Twitter', href: 'https://twitter.com', icon: <Twitter className="w-5 h-5" aria-hidden="true" /> },
                { label: 'Instagram', href: 'https://instagram.com', icon: <Instagram className="w-5 h-5" aria-hidden="true" /> }
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-gray-500 hover:text-blue-600 transition-colors rounded-md p-2 hover:bg-white/60"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nhóm liên kết phụ trợ */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">&copy; {currentYear} Đại học Văn Lang. Nghiên cứu khoa học.</p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Bảo mật</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

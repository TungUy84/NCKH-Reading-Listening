import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

// Footer hiển thị thông tin liên hệ và liên kết nhanh cuối trang
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Chia các liên kết theo nhóm để render linh hoạt
  const footerLinks = {
    'Sản phẩm': [
      { label: 'Kiểm tra đầu vào', href: '/tests' },
      { label: 'Ôn luyện', href: '/practice' },
      { label: 'Bài học', href: '/lessons' },
      { label: 'Thi thử', href: '/mock-test' },
    ],
    'Hỗ trợ': [
      { label: 'Trung tâm trợ giúp', href: '/help' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Báo lỗi', href: '/report' },
    ],
    'Về chúng tôi': [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản sử dụng', href: '/terms' },
    ],
  };

  const contactInfo = [
    { icon: MapPin, label: 'Địa chỉ', value: '45 Nguyễn Khắc Nhu, Q.1, TP.HCM' },
    { icon: Phone, label: 'Điện thoại', value: '(028) 3838 6603' },
    { icon: Mail, label: 'Email', value: 'info@vanlanguni.edu.vn' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Khối thông tin thương hiệu - span 4 columns */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <img src="/img/logo.png" alt="UNSkills Logo" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">UNSkills</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              Nền tảng học tiếng Anh chính thức của Đại học Văn Lang, giúp sinh viên nâng cao kỹ năng Nghe và Đọc một cách hiệu quả.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3 mb-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <item.icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">{item.label}</div>
                    <div className="text-gray-300">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
                { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
                { label: 'Instagram', href: 'https://instagram.com', icon: Instagram }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nhóm liên kết phụ trợ - each spans 2-3 columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-blue-500 group-hover:w-4 transition-all duration-300" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Đại học Văn Lang. Nghiên cứu khoa học. Bản quyền được bảo hộ.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

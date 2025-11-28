import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, BookOpen, Award } from 'lucide-react';

// Phần hero giới thiệu thông điệp chính và CTA với thống kê
const HeroSection: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Học viên', value: '5,000+' },
    { icon: BookOpen, label: 'Bài học', value: '200+' },
    { icon: Award, label: 'Hài lòng', value: '95%' },
  ];

  return (
    <section className="relative pt-10 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-medium shadow-lg shadow-blue-500/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Nền tảng học tiếng Anh chính thức của VLU
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-4xl lg:text-4xl font-bold leading-tight text-gray-900">
              Nâng cao kỹ năng{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Nghe & Đọc
              </span>{' '}
              tiếng Anh
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Cải thiện kỹ năng tiếng Anh với hệ thống ôn luyện thông minh. Phản hồi tức thì và lộ trình cá nhân hóa giúp bạn chinh phục mục tiêu nhanh chóng.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/tests"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Bắt đầu học ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:border-gray-400 transition-all duration-200">
                <Play className="w-5 h-5" />
                Xem giới thiệu
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Image with floating card */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Students studying English"
                  className="w-full h-[500px] object-cover"
                />
              </div>

              {/* Floating card */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Học tập thông minh</div>
                    <div className="text-lg font-bold text-gray-900">Tiến bộ vượt trội</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

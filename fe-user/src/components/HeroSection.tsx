import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, BookOpen, Award, Sparkles } from 'lucide-react';

// Phần hero giới thiệu thông điệp chính và CTA với thống kê
const HeroSection: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Học viên', value: '500+' },
    { icon: BookOpen, label: 'Bài học', value: '100+' },
    { icon: Award, label: 'Hài lòng', value: '95%' },
  ];

  return (
    <section className="relative pb-14 min-h-screen bg-white overflow-hidden">
      {/* Creative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/40 to-cyan-100/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="space-y-8 relative z-10" data-aos="fade-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-full text-sm font-medium shadow-sm text-blue-700 mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>Nền tảng học tiếng Anh VLU</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-gray-900 tracking-tight">
              Chinh phục <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Tiếng Anh
              </span>{' '}
              dễ dàng
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Hệ thống học tập thông minh, lộ trình cá nhân hóa và kho tài liệu phong phú giúp bạn tự tin đạt điểm cao.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/tests"
                className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                Học ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              {/* <button className="inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                <Play className="w-5 h-5 fill-current" />
                Video giới thiệu
              </button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-100 mt-8">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <stat.icon className="w-4 h-4 text-blue-500" />
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Creative Image Composition */}
          <div className="relative lg:h-[700px] flex items-center justify-center" data-aos="fade-left" data-aos-delay="200">
            <div className="relative w-full max-w-lg">
              {/* Abstract shapes */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
              <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
              
              {/* Main image card */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border-8 border-white transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                  alt="Student learning"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

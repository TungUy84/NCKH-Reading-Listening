import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { ArrowRight, Users, BookOpen, Award } from 'lucide-react';
import { getPublicStats, getPublicLessons, getPublicPractices } from '../services/api';

// Phần hero giới thiệu thông điệp chính và CTA với thống kê
const HeroSection: React.FC = () => {
  const [stats, setStats] = useState([
    { icon: Users, label: 'Học viên', value: '0+' },
    { icon: BookOpen, label: 'Học liệu', value: '0+' },
    { icon: Award, label: 'Hài lòng', value: '95%' },
  ]);

  useEffect(() => {
    // Fetch thống kê bài học và bài ôn luyện
    const fetchStats = async () => {
      try {
        const [statsRes, lessonsRes, practicesRes] = await Promise.all([
          getPublicStats(),
          getPublicLessons({ limit: 1 }),
          getPublicPractices({ limit: 1 })
        ]);

        const totalLessons = lessonsRes?.data?.pagination?.total || 0;
        const totalPractices = practicesRes?.data?.pagination?.total || 0;
        const totalLearningMaterials = totalLessons + totalPractices;
        const totalUsers = statsRes?.stats?.totalUsers || 500;

        setStats([
          { icon: Users, label: 'Học viên', value: `${totalUsers}+` },
          { icon: BookOpen, label: 'Học liệu', value: `${totalLearningMaterials}+` },
          { icon: Award, label: 'Hài lòng', value: '95%' },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Giữ nguyên giá trị mặc định nếu có lỗi
      }
    };

    fetchStats();
  }, []);

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
            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block mb-3">
                Chinh phục
              </span>
              <span className="block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Tiếng Anh
                </span>{' '}
                dễ dàng
              </span>
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
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    <CountUp
                      end={parseInt(stat.value) || 0}
                      duration={2}
                      suffix={stat.value.replace(/[0-9]/g, '')}
                    />
                  </div>
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
                  src="/img/bgdb.jpg"
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

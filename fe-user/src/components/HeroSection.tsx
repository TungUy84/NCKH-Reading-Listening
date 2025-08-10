import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      <div className="section-container py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8" data-aos="fade-right">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight" data-aos="fade-up" data-aos-delay="100">
                Luyện thi Nghe–Đọc
                <br />
                <span className="text-orange-400">tiếng Anh</span>
              </h1>
              <p className="text-xl text-primary-100 max-w-lg" data-aos="fade-up" data-aos-delay="200">
                Cải thiện kỹ năng nghe hiểu và đọc hiểu với những bài kiểm tra trực tuyến được thiết kế chuyên nghiệp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4" data-aos="fade-up" data-aos-delay="300">
              <Link to="/tests" className="btn-primary bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                🚀 Bắt đầu làm bài
              </Link>
              <Link to="/about" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                📖 Tìm hiểu thêm
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-primary-500" data-aos="fade-up" data-aos-delay="400">
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <div className="text-2xl font-bold text-orange-400">📚 1000+</div>
                <div className="text-sm text-primary-200">Câu hỏi đề thi</div>
              </div>
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <div className="text-2xl font-bold text-orange-400">📝 50+</div>
                <div className="text-sm text-primary-200">Bài test thực hành</div>
              </div>
              <div className="text-center transform transition-all duration-300 hover:scale-110">
                <div className="text-2xl font-bold text-orange-400">⭐ 98%</div>
                <div className="text-sm text-primary-200">Độ chính xác</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative" data-aos="fade-left" data-aos-delay="200">
            <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&h=980"
                alt="Students studying English"
                className="w-full h-80 object-cover rounded-xl"
              />
              
              {/* Floating Achievement Badge */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold">Kết quả chính xác</div>
                    <div className="text-xs opacity-90">Áp dụng chuẩn IELTS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl transform rotate-3 scale-105 opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

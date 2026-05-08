import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, CheckCircle2, Clock, Award } from 'lucide-react';

const PlacementSection: React.FC = () => {
  return (
    <section className="min-h-screen py-24 bg-white relative overflow-hidden flex items-center">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div data-aos="fade-right">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="block mb-2">
                Kiểm tra năng lực
              </span>

              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Chuẩn xác & Miễn phí
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl">
              Bài kiểm tra được thiết kế giúp xác định chính xác trình độ hiện tại.
              Hệ thống sẽ đề xuất lộ trình học tập tối ưu nhất dành riêng cho bạn.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { icon: Target, text: 'Đánh giá toàn diện 2 kỹ năng Nghe và Nói' },
                { icon: Award, text: 'Nhận kết quả phân tích chi tiết' },
                { icon: CheckCircle2, text: 'Lộ trình học tập cá nhân hóa theo mục tiêu' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors duration-300 border border-transparent hover:border-blue-100 group">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium pt-1">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/tests"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200 shadow-lg shadow-blue-600/30"
              >
                Làm bài kiểm tra ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                <Clock className="w-5 h-5" />
                <span>Chỉ mất 15-20 phút</span>
              </div>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="relative lg:h-[600px] flex items-center justify-center" data-aos="fade-left">
            <div className="relative w-full max-w-lg">
              {/* Main Image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] rotate-6 opacity-10 scale-105 transform" />
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
                alt="Placement Test"
                className="relative rounded-[2rem] shadow-2xl z-10 object-cover w-full h-auto aspect-[4/5] border-4 border-white"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PlacementSection;

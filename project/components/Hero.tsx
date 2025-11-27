import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <section id="home" className="pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Nền tảng học tiếng Anh chính thức của VLU
            </div>

            <div className="space-y-6">
              <h1 className="text-gray-900">
                Nâng cao kỹ năng
                <br />
                <span className="text-blue-600">Nghe & Đọc tiếng Anh</span>
              </h1>
              <p className="text-gray-600 max-w-xl">
                Hệ thống luyện thi chuyên sâu với phương pháp học hiện đại, 
                giúp sinh viên Đại học Văn Lang đạt điểm cao trong các bài kiểm tra tiếng Anh.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/30">
                Bắt đầu học ngay
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl hover:border-gray-300 transition-colors">
                <Play className="w-5 h-5" />
                Xem giới thiệu
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
              <div>
                <div className="text-gray-900">5,000+</div>
                <div className="text-sm text-gray-500 mt-1">Học viên</div>
              </div>
              <div>
                <div className="text-gray-900">200+</div>
                <div className="text-sm text-gray-500 mt-1">Bài học</div>
              </div>
              <div>
                <div className="text-gray-900">95%</div>
                <div className="text-sm text-gray-500 mt-1">Hài lòng</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551754809-c0a4e5b246ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwZW5nbGlzaHxlbnwxfHx8fDE3NjQyNzExMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Students studying English"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <div className="text-gray-900">Học tập thông minh</div>
                  <p className="text-sm text-gray-500 mt-1">
                    AI cá nhân hóa lộ trình
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

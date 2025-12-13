import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, PlayCircle, FileText, CheckSquare, Star, Users, Video } from 'lucide-react';

const LessonSection: React.FC = () => {
  return (
    <section className="min-h-screen py-24 bg-white flex items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-50/50 to-transparent -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-50/50 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left Content - Images Grid */}
          <div className="order-2 lg:order-1 relative" data-aos="fade-right">
            <div className="grid grid-cols-2 gap-6 relative z-10">
              {/* Card 1 - Video */}
              <div className="space-y-6 mt-12">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-purple-100/50 border border-purple-50 hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-7 h-7 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Video bài giảng</h4>
                  <p className="text-gray-500 leading-relaxed">Học qua video trực quan, sinh động </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-pink-100/50 border border-pink-50 hover:border-pink-200 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7 text-pink-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Tài liệu chi tiết</h4>
                  <p className="text-gray-500 leading-relaxed">Bài hoc biên soạn công phu, dễ hiểu</p>
                </div>
              </div>

              {/* Card 2 - Practice & Stats */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <CheckSquare className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Bài tập vận dụng</h4>
                  <p className="text-gray-500 leading-relaxed">Thực hành ngay sau mỗi bài học để nhớ lâu hơn</p>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="text-5xl font-bold mb-2">100+</div>
                    <div className="text-purple-100 font-medium mb-4">Bài học có sẵn</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-100/50 rounded-full filter blur-3xl -z-10 animate-pulse" />
          </div>

          {/* Right Content - Text */}
          <div className="order-1 lg:order-2" data-aos="fade-left">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              <span className="block mb-2">
                Hệ thống bài học
              </span>

              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Chất lượng cao
              </span>
            </h2>


            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Hệ thống bài học được xây dựng bài bản từ cơ bản đến nâng cao.
              Mỗi bài học được trình bày rõ ràng, giúp bạn tiếp thu kiến thức hiệu quả.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/lessons"
                className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-gray-900/20"
              >
                <BookOpen className="w-5 h-5" />
                Khám phá ngay
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LessonSection;

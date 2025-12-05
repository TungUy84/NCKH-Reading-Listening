import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Headphones, BookOpen, BarChart, ArrowRight } from 'lucide-react';

const PracticeSection: React.FC = () => {
  const features = [
    {
      icon: Headphones,
      title: 'Luyện Nghe Chuyên Sâu',
      description: 'Tiếp cận đa dạng giọng đọc và tốc độ, từ hội thoại hàng ngày đến bài giảng học thuật.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      textLight: 'text-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Luyện Đọc Hiểu Quả',
      description: 'Phát triển kỹ năng Skimming & Scanning qua các bài đọc được thiết kế chuẩn format thi.',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-600'
    },
    {
      icon: BarChart,
      title: 'Phân Tích Hiệu Quả',
      description: 'Hệ thống tự động phân tích lỗi sai và gợi ý bài tập khắc phục cho từng kỹ năng.',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50',
      textLight: 'text-violet-600'
    }
  ];

  return (
    <section className="min-h-screen relative py-24 bg-gray-50 overflow-hidden flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700 tracking-wide uppercase">Rèn luyện kỹ năng</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Chinh phục <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Reading & Listening</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tập trung tối đa vào hai kỹ năng cốt lõi với kho bài tập chất lượng cao.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Hover Gradient Border Effect */}
              <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-20 h-20 rounded-2xl ${feature.bgLight} ${feature.textLight} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  {feature.description}
                </p>

                <div className={`flex items-center gap-2 font-semibold ${feature.textLight} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300`}>
                  <span>Tìm hiểu thêm</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center" data-aos="fade-up" data-aos-delay="300">
          <Link
            to="/practice"
            className="group relative inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-12 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 
            hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-3">
              <Zap className="w-5 h-5" />
              Bắt đầu ôn luyện ngay
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PracticeSection;

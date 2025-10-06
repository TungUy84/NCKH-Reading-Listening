import React from 'react';
import Card from './ui/Card';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Tự động chấm điểm',
      description: 'Tính toán và đánh giá kết quả của bạn một cách chính xác và nhanh chóng',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Giải thích chi tiết',
      description: 'Phân tích từng câu hỏi với lời giải và gợi ý cải thiện kỹ năng',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: 'Giao diện thân thiện',
      description: 'Thiết kế đơn giản, dễ sử dụng và tối ưu cho mọi thiết bị',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,white,transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-600/10 mb-4">Tính năng</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
            Nền tảng học tập thúc đẩy tiến bộ
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Công cụ thông minh giúp bạn tối ưu thời gian ôn luyện và theo dõi hiệu suất dễ dàng.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <Card
              key={i}
              className="text-center relative overflow-hidden group border-gray-200/70 hover:border-gray-300/70 transition"
              data-aos="fade-up"
              data-aos-delay={i * 120 + 150}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/0 via-white/40 to-white/0" />
              <div className={`${f.bgColor} ${f.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-inset ring-white/50 group-hover:scale-105 transition-transform`}>{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

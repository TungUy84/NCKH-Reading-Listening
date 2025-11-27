import React from 'react';
import { CheckCircle2, Clock, FileText, Zap } from 'lucide-react';

export function TestSections() {
  const sections = [
    {
      title: 'Ôn luyện',
      description: 'Luyện tập từng kỹ năng với bài tập có độ khó tăng dần',
      icon: Zap,
      features: ['Luyện theo chủ đề', 'Tự do thời gian', 'Giải thích chi tiết'],
      color: 'from-blue-500 to-cyan-500',
      link: '#practice',
    },
    {
      title: 'Bài học',
      description: 'Học có hệ thống với các bài giảng và tài liệu đầy đủ',
      icon: FileText,
      features: ['Video bài giảng', 'Tài liệu PDF', 'Bài tập thực hành'],
      color: 'from-purple-500 to-pink-500',
      link: '#lessons',
    },
    {
      title: 'Thi thử',
      description: 'Làm bài thi thử với format chuẩn và thời gian thực',
      icon: Clock,
      features: ['Đề thi chuẩn', 'Chấm điểm tự động', 'Phân tích đáp án'],
      color: 'from-orange-500 to-red-500',
      link: '#mock-test',
    },
  ];

  return (
    <section id="practice" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-gray-900 mb-4">
            Phương thức học tập đa dạng
          </h2>
          <p className="text-gray-600">
            Chọn cách học phù hợp với mục tiêu và thời gian của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-br ${section.color} p-8 text-white`}>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                  <section.icon className="w-7 h-7" />
                </div>
                <h3 className="text-white mb-3">
                  {section.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {section.description}
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={section.link}
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Bắt đầu ngay
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

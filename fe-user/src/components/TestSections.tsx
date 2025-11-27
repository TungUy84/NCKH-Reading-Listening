import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Zap, BookOpen, Trophy } from 'lucide-react';

// Section hiển thị 3 loại bài tập với gradient cards
const TestSections: React.FC = () => {
  const sections = [
    {
      icon: Zap,
      title: 'Ôn luyện',
      description: 'Thực hành với hàng trăm bài tập được phân loại theo cấp độ và kỹ năng',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Hàng trăm bài tập đa dạng',
        'Phân loại theo cấp độ',
        'Giải thích chi tiết',
        'Lưu tiến độ tự động'
      ],
      link: '/practice',
      buttonText: 'Bắt đầu ôn luyện'
    },
    {
      icon: BookOpen,
      title: 'Bài học',
      description: 'Học từ cơ bản đến nâng cao với lộ trình được thiết kế bài bản',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Lộ trình học có hệ thống',
        'Video bài giảng chất lượng',
        'Bài tập thực hành',
        'Kiểm tra sau mỗi bài'
      ],
      link: '/lessons',
      buttonText: 'Khám phá bài học'
    },
    {
      icon: Trophy,
      title: 'Thi thử',
      description: 'Mô phỏng bài thi thực tế để đánh giá năng lực và làm quen với format',
      gradient: 'from-orange-500 to-red-500',
      features: [
        'Đề thi chuẩn format',
        'Chấm điểm tự động',
        'Phân tích kết quả chi tiết',
        'Xếp hạng toàn quốc'
      ],
      link: '/mock-test',
      buttonText: 'Làm bài thi thử'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-4">
            Phương pháp học tập
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
            Chọn cách học phù hợp với bạn
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ba phương pháp học tập đa dạng giúp bạn linh hoạt trong việc nâng cao kỹ năng
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Gradient header */}
              <div className={`relative h-40 bg-gradient-to-br ${section.gradient} p-8 flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/5" />
                <section.icon className="w-16 h-16 text-white relative z-10" />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {section.description}
                </p>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {section.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Link
                  to={section.link}
                  className={`group/btn flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r ${section.gradient} text-white font-semibold hover:shadow-lg transition-all duration-300`}
                >
                  {section.buttonText}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestSections;

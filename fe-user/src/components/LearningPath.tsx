import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';

// Component hiển thị lộ trình học với timeline
const LearningPath: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Kiểm tra đầu vào',
      description: 'Đánh giá trình độ hiện tại của bạn để xác định điểm bắt đầu phù hợp',
      status: 'completed' as const,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 2,
      title: 'Học cơ bản',
      description: 'Nắm vững nền tảng với các bài học từ vựng, ngữ pháp và phát âm',
      status: 'active' as const,
      icon: Circle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 3,
      title: 'Luyện nâng cao',
      description: 'Rèn luyện kỹ năng với bài tập thực hành và đề thi mẫu',
      status: 'locked' as const,
      icon: Lock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 4,
      title: 'Thi thử & Chứng chỉ',
      description: 'Hoàn thành bài thi thử và nhận chứng chỉ hoàn thành khóa học',
      status: 'locked' as const,
      icon: Lock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 mb-4">
            Lộ trình học tập
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
            Hành trình chinh phục tiếng Anh
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Lộ trình được thiết kế khoa học giúp bạn phát triển kỹ năng một cách bài bản
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-blue-200 to-gray-200" />

            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex gap-8">
                  {/* Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full ${step.bgColor} ${step.color} border-4 ${step.borderColor} bg-white flex items-center justify-center`}>
                    <step.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-12 ${step.status === 'locked' ? 'opacity-60' : ''}`}>
                    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-500 mb-2">
                            Bước {step.id}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Status badge */}
                        {step.status === 'completed' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Hoàn thành
                          </span>
                        )}
                        {step.status === 'active' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Đang học
                          </span>
                        )}
                        {step.status === 'locked' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            Khóa
                          </span>
                        )}
                      </div>

                      {/* Action button for active step */}
                      {step.status === 'active' && (
                        <button className="mt-4 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                          Tiếp tục học
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Xem lộ trình chi tiết
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPath;

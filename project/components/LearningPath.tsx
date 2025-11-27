import React from 'react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LearningPath() {
  const pathSteps = [
    {
      level: 'Bước 1',
      title: 'Kiểm tra đầu vào',
      description: 'Xác định trình độ hiện tại của bạn',
      status: 'completed',
      duration: '30 phút',
    },
    {
      level: 'Bước 2',
      title: 'Học cơ bản',
      description: 'Nắm vững nền tảng nghe và đọc',
      status: 'active',
      duration: '4-6 tuần',
    },
    {
      level: 'Bước 3',
      title: 'Luyện nâng cao',
      description: 'Phát triển kỹ năng chuyên sâu',
      status: 'locked',
      duration: '6-8 tuần',
    },
    {
      level: 'Bước 4',
      title: 'Thi thử & hoàn thiện',
      description: 'Rèn luyện với đề thi thực tế',
      status: 'locked',
      duration: '2-3 tuần',
    },
  ];

  return (
    <section id="learning-path" className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Learning Path */}
          <div>
            <div className="mb-12">
              <h2 className="text-gray-900 mb-4">
                Lộ trình học có hệ thống
              </h2>
              <p className="text-gray-600">
                Tiến bộ từng bước với lộ trình được thiết kế khoa học, 
                phù hợp với mọi trình độ từ cơ bản đến nâng cao
              </p>
            </div>

            <div className="space-y-6">
              {pathSteps.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex gap-6 ${
                    step.status === 'locked' ? 'opacity-60' : ''
                  }`}
                >
                  {/* Connector Line */}
                  {index < pathSteps.length - 1 && (
                    <div className="absolute left-6 top-14 w-0.5 h-16 bg-gray-200"></div>
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {step.status === 'completed' && (
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {step.status === 'active' && (
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center ring-4 ring-blue-100">
                        <Circle className="w-6 h-6 text-white fill-white" />
                      </div>
                    )}
                    {step.status === 'locked' && (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-blue-600">{step.level}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{step.duration}</span>
                    </div>
                    <h4 className="text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                Xem lộ trình chi tiết
              </button>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1673515324976-edc94ae391f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjQyNjQ0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Online learning"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Stats Card */}
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-6 hidden lg:block">
              <div className="text-center">
                <div className="text-blue-600 mb-1">12 tuần</div>
                <div className="text-sm text-gray-500">Thời gian hoàn thành</div>
              </div>
            </div>

            {/* Success Rate Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎓</div>
                <div>
                  <div className="text-gray-900">95% thành công</div>
                  <div className="text-sm text-gray-500">Sinh viên đạt mục tiêu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { MapPin, BookOpen, Rocket, Trophy } from 'lucide-react';

const LearningPath: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Kiểm tra đầu vào',
      description: 'Xác định trình độ hiện tại để xây dựng lộ trình phù hợp nhất.',
      icon: MapPin,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/30',
      textColor: 'text-emerald-600'
    },
    {
      id: 2,
      title: 'Tạo lộ trình',
      description: 'Tạo lộ trình học tập được cá nhân hóa theo mục tiêu của bạn.',
      icon: BookOpen,
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/30',
      textColor: 'text-blue-600'
    },
    {
      id: 3,
      title: 'Tăng tốc kỹ năng',
      description: 'Luyện nghe và đọc hiểu với các bài tập nâng cao.',
      icon: Rocket,
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-500/30',
      textColor: 'text-indigo-600'
    },
    {
      id: 4,
      title: 'Về đích',
      description: 'Luyện đề thi thử và chuẩn bị tâm lý cho kỳ thi thật.',
      icon: Trophy,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-500/30',
      textColor: 'text-rose-600'
    }
  ];

  return (
    <section className=" py-24 bg-white overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-20" data-aos="fade-up">
          <span className="inline-block text-sm font-bold tracking-wider uppercase px-4 py-2 rounded-full bg-blue-50 text-blue-600 mb-4">
            Lộ trình học tập
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Chinh phục mục tiêu từng bước
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi thiết kế lộ trình khoa học giúp bạn tiến bộ vững chắc mỗi ngày
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-14 left-0 w-full h-1 bg-gray-100 -z-10">
             <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-emerald-200 via-blue-200 to-rose-200 opacity-50" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="relative group"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                {/* Step Icon */}
                <div className={`
                  w-28 h-28 mx-auto mb-8 rounded-3xl rotate-3 flex items-center justify-center text-white 
                  transition-all duration-500 group-hover:rotate-12 group-hover:scale-110
                  ${step.color} ${step.shadow} shadow-xl border-4 border-white relative z-10
                `}>
                  <step.icon className="w-12 h-12" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 transform -rotate-3 group-hover:-rotate-12 transition-transform duration-500">
                    <span className={`text-lg font-bold ${step.textColor}`}>{step.id}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="text-center px-4 pt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector for Mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 bottom-[-32px] w-0.5 h-16 bg-gray-200 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearningPath;

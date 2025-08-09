import React from 'react';
import { Link } from 'react-router-dom';

const ProcessSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Placement Test',
      description: 'Làm bài test kiểm tra đầu vào để xác định trình độ hiện tại',
      color: 'bg-blue-600',
    },
    {
      number: '2',
      title: 'Lộ trình cá nhân',
      description: 'Nhận lộ trình học tập phù hợp với trình độ của bạn',
      color: 'bg-orange-600',
    },
    {
      number: '3',
      title: 'Ôn luyện',
      description: 'Thực hành với hàng ngàn câu hỏi theo chương trình cá nhân hóa',
      color: 'bg-green-600',
    },
    {
      number: '4',
      title: 'Thi thử',
      description: 'Kiểm tra tiến bộ và cải thiện điểm số qua các bài thi thử',
      color: 'bg-purple-600',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Quy trình học tập đơn giản
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chỉ 4 bước đơn giản để bắt đầu hành trình chinh phục tiếng Anh của bạn
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step Number */}
              <div className={`${step.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform duration-300`}>
                {step.number}
              </div>
              
              {/* Step Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector Arrow (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full">
                  <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình học tiếng Anh?
          </h3>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên đã cải thiện trình độ tiếng Anh của mình
          </p>
          <Link
            to="/tests"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200"
          >
            Bắt đầu ngay hôm nay
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

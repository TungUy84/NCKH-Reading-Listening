import React from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';

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
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-blue-50/40 to-white" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-purple-50 text-purple-600 ring-1 ring-purple-600/10 mb-4">Quy trình</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">Lộ trình 4 bước rõ ràng</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Tối ưu hoá hành trình học của bạn từ đánh giá đầu vào đến bứt phá điểm số.</p>
        </div>

        <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {steps.map((s, i) => (
            <Card
              key={s.number}
              className="relative pt-10 pb-8 px-6 flex flex-col items-center text-center bg-white/70 backdrop-blur border-gray-200/70 shadow-sm"
              data-aos="fade-up"
              data-aos-delay={i * 140 + 150}
            >
              <div className={`${s.color} absolute -top-6 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg ring-4 ring-white`}>{s.number}</div>
              <h3 className="mt-2 text-base font-semibold text-gray-900 tracking-wide">{s.title}</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{s.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-5 translate-x-1/2 -translate-y-1/2 text-gray-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card
          className="relative overflow-hidden text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-none text-white py-14 px-6 md:px-16"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
          <div className="relative max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Sẵn sàng thăng hạng kỹ năng tiếng Anh?
            </h3>
            <p className="text-blue-100 mb-8 text-base md:text-lg">
              Tham gia cùng hàng nghìn học viên đang luyện tập mỗi ngày và theo dõi tiến bộ rõ rệt.
            </p>
            <Link
              to="/tests"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl shadow hover:shadow-lg transition hover:-translate-y-0.5 text-sm md:text-base"
            >
              Bắt đầu ngay
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ProcessSection;

import React from 'react';
import { Target, Headphones, BookOpen, Trophy, BarChart3, Users } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Target,
      title: 'Kiểm tra đầu vào',
      description: 'Đánh giá trình độ hiện tại để xây dựng lộ trình học phù hợp nhất',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Headphones,
      title: 'Luyện nghe chuyên sâu',
      description: 'Hàng trăm bài tập nghe với nhiều chủ đề và độ khó khác nhau',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: BookOpen,
      title: 'Đọc hiểu nâng cao',
      description: 'Phương pháp đọc hiệu quả với các văn bản học thuật',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Trophy,
      title: 'Thi thử không giới hạn',
      description: 'Mô phỏng bài thi thực tế với hệ thống chấm điểm tự động',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: BarChart3,
      title: 'Theo dõi tiến độ',
      description: 'Báo cáo chi tiết về quá trình học và điểm mạnh/yếu',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: Users,
      title: 'Cộng đồng học tập',
      description: 'Kết nối với hàng nghìn sinh viên VLU cùng học',
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-gray-900 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-gray-600">
            Hệ thống học tập toàn diện với công nghệ hiện đại, 
            được thiết kế riêng cho sinh viên Đại học Văn Lang
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

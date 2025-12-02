import React from 'react';
import { Target, Headphones, BookOpen, Trophy, BarChart3, Users } from 'lucide-react';

// Section trình bày các điểm mạnh chính của nền tảng
const FeaturesSection: React.FC = () => {
  // Dữ liệu mô tả từng tính năng nổi bật
  const features = [
    {
      icon: Target,
      title: 'Kiểm tra đầu vào',
      description: 'Đánh giá trình độ hiện tại và xác định lộ trình học phù hợp nhất cho bạn',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Headphones,
      title: 'Luyện nghe chuyên sâu',
      description: 'Hơn 200+ bài tập nghe đa dạng với nhiều chủ đề và độ khó khác nhau',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: BookOpen,
      title: 'Đọc hiểu nâng cao',
      description: 'Kho bài đọc phong phú giúp cải thiện khả năng đọc hiểu và từ vựng',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Trophy,
      title: 'Thi thử thực tế',
      description: 'Mô phỏng bài thi thực tế để bạn làm quen với cấu trúc và áp lực thời gian',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: BarChart3,
      title: 'Theo dõi tiến độ',
      description: 'Thống kê chi tiết giúp bạn nắm rõ quá trình học tập và điểm cần cải thiện',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    {
      icon: Users,
      title: 'Cộng đồng học tập',
      description: 'Kết nối với hàng nghìn học viên và chia sẻ kinh nghiệm học tập',
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <section className="relative py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase px-4 py-2 rounded-full bg-blue-50 text-blue-600 mb-4">
            Tính năng nổi bật
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
            Mọi thứ bạn cần để thành công
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hệ thống học tập toàn diện với đầy đủ công cụ và tài nguyên giúp bạn đạt mục tiêu
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.iconBg} ${feature.iconColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

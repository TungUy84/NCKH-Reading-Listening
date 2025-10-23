import React from 'react';
import { Play, CheckCircle, Users, Award, HeadphonesIcon, FileText, Video, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: 'Tự động chấm điểm',
      description: 'AI thông minh cung cấp điểm số và phản hồi chính xác ngay lập tức.'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      title: 'Giải thích chi tiết',
      description: 'Phân tích sâu từng đáp án giúp bạn hiểu rõ lý do tại sao đúng hoặc sai.'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: 'Giao diện thân thiện',
      description: 'Thiết kế hiện đại, responsive hoàn hảo trên mọi thiết bị, dễ sử dụng.'
    }
  ];

  const learningSteps = [
    {
      number: 1,
      title: 'Kiểm tra đầu vào',
      description: 'Làm bài test đầu vào để xác định trình độ của bạn',
      color: 'bg-blue-600'
    },
    {
      number: 2,
      title: 'Lộ trình cá nhân',
      description: 'Hệ thống tạo lộ trình học tập phù hợp với trình độ của bạn',
      color: 'bg-orange-500'
    },
    {
      number: 3,
      title: 'Bài học',
      description: 'Cung cấp các video hướng dẫn học và làm bài tập của từng dạng',
      color: 'bg-pink-500'
    },
    {
      number: 4,
      title: 'Ôn luyện',
      description: 'Thực hành với hàng ngàn bài tập từ cơ bản đến nâng cao',
      color: 'bg-green-600'
    },
    {
      number: 5,
      title: 'Thi thử',
      description: 'Kiểm tra tiến độ và chuẩn bị cho kỳ thi chính thức',
      color: 'bg-purple-600'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Luyện thi 
                <span className="block text-orange-300">Nghe-Đọc</span>
                tiếng Anh
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Cải thiện kỹ năng tiếng Anh với hệ thống ôn luyện thông minh. 
                Phản hồi tức thì và lộ trình cá nhân hóa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/placement')}
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Bắt đầu làm test</span>
                </button>
                <button 
                  onClick={() => navigate('/lessons')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all duration-200"
                >
                  Khám phá bài học
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/3184318/pexels-photo-3184318.jpeg"
                  alt="Students studying English" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <div>
                      <p className="font-bold">Kết quả chính xác</p>
                      <p className="text-sm">95% độ chính xác</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống luyện thi hiện đại với công nghệ AI giúp bạn đạt kết quả tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-gray-50 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Quy trình học tập đơn giản
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chỉ 4 bước để bắt đầu hành trình chinh phục tiếng Anh của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {learningSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  <div className={`w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center font-bold text-lg mb-4`}>
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
                {index < learningSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 -right-4 w-8 h-0.5 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Sẵn sàng bắt đầu hành trình học tiếng Anh?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên đã cải thiện trình độ tiếng Anh của mình
          </p>
          <button 
            onClick={() => navigate('/placement')}
            className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Làm test đầu vào ngay</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;

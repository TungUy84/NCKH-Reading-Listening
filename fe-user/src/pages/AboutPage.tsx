import React from 'react';

// Trang giới thiệu về nền tảng và đội ngũ
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  {/* Khối hero giới thiệu tổng quan */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20" data-aos="fade-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-8xl mb-6">🎓</div>
            <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
              English Test Platform
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Nền tảng luyện thi tiếng Anh trực tuyến hàng đầu, giúp bạn đánh giá và nâng cao trình độ tiếng Anh một cách hiệu quả ✨
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  {/* Phần mô tả sứ mệnh */}
        <div className="mb-20">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Chúng tôi cam kết mang đến cho học viên những bài test placement chất lượng cao, 
              giúp đánh giá chính xác trình độ tiếng Anh và đưa ra lộ trình học tập phù hợp 📚
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl">✅</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chính xác</h3>
              <p className="text-gray-600 leading-relaxed">
                Bài test được thiết kế dựa trên tiêu chuẩn quốc tế, đảm bảo kết quả chính xác và đáng tin cậy.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-gradient-to-r from-green-100 to-green-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl">⚡</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nhanh chóng</h3>
              <p className="text-gray-600 leading-relaxed">
                Kết quả test được trả về ngay lập tức kèm theo phân tích chi tiết và đề xuất học tập.
              </p>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <div className="text-3xl">📖</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Học tập</h3>
              <p className="text-gray-600 leading-relaxed">
                Cung cấp lộ trình học tập cá nhân hóa dựa trên kết quả test và mục tiêu của từng học viên.
              </p>
            </div>
          </div>
        </div>

  {/* Phần tính năng nổi bật */}
        <div className="mb-20">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Tính năng nổi bật
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                Test Placement Toàn diện 📝
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white text-sm">🎧</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-2">Kiểm tra kỹ năng Nghe</h4>
                    <p className="text-gray-600 leading-relaxed">Đánh giá khả năng nghe hiểu qua các đoạn hội thoại và bài nghe chuyên sâu.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white text-sm">📚</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-2">Kiểm tra kỹ năng Đọc</h4>
                    <p className="text-gray-600 leading-relaxed">Đọc hiểu các đoạn văn với độ khó tăng dần từ cơ bản đến nâng cao.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white text-sm">🔍</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-2">Đánh giá tổng hợp</h4>
                    <p className="text-gray-600 leading-relaxed">Kết hợp nhiều dạng câu hỏi để đưa ra đánh giá toàn diện về trình độ.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative" data-aos="fade-left">
              <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl p-8 shadow-2xl border border-white">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                      Kết quả Test
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Điểm tổng:</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">85/100</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">IELTS tương đương:</span>
                        <span className="font-bold text-2xl text-green-600">6.5 ⭐</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Trình độ:</span>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl text-lg font-bold">AV5 🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* Giới thiệu đội ngũ */}
        <div className="mb-20">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Đội ngũ phát triển
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group" data-aos="fade-up" data-aos-delay="100">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <div className="text-4xl">👨‍💻</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nguyễn Văn A</h3>
              <p className="text-blue-600 font-semibold mb-3">Lead Developer 🚀</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Chuyên gia về phát triển ứng dụng web với hơn 5 năm kinh nghiệm trong lĩnh vực EdTech.
              </p>
            </div>

            <div className="text-center group" data-aos="fade-up" data-aos-delay="200">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <div className="text-4xl">👩‍🏫</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trần Thị B</h3>
              <p className="text-green-600 font-semibold mb-3">Education Specialist 📚</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Thạc sĩ Ngôn ngữ Anh với 10 năm kinh nghiệm giảng dạy và thiết kế chương trình học.
              </p>
            </div>

            <div className="text-center group" data-aos="fade-up" data-aos-delay="300">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <div className="text-4xl">🎨</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lê Văn C</h3>
              <p className="text-purple-600 font-semibold mb-3">UX/UI Designer ✨</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Chuyên gia thiết kế trải nghiệm người dùng với passion về giáo dục trực tuyến.
              </p>
            </div>
          </div>
        </div>

  {/* Các chỉ số nổi bật */}
        <div className="relative" data-aos="zoom-in">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl text-white p-12 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-16 -translate-y-8">
              <div className="text-9xl opacity-10">📈</div>
            </div>
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2">Thành tích đạt được 🏆</h3>
                <p className="text-blue-100">Những con số ấn tượng của chúng tôi</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    10,000+
                  </div>
                  <p className="text-blue-100 font-medium">Học viên đã tham gia 👥</p>
                </div>
                <div className="group">
                  <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    500+
                  </div>
                  <p className="text-blue-100 font-medium">Bài test chất lượng 📝</p>
                </div>
                <div className="group">
                  <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    95%
                  </div>
                  <p className="text-blue-100 font-medium">Độ chính xác ✅</p>
                </div>
                <div className="group">
                  <div className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    24/7
                  </div>
                  <p className="text-blue-100 font-medium">Hỗ trợ trực tuyến 🚀</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

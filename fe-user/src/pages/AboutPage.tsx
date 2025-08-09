import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Về English Test Platform</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Nền tảng luyện thi tiếng Anh trực tuyến hàng đầu, giúp bạn đánh giá và nâng cao trình độ tiếng Anh một cách hiệu quả.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sứ mệnh của chúng tôi</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết mang đến cho học viên những bài test placement chất lượng cao, 
              giúp đánh giá chính xác trình độ tiếng Anh và đưa ra lộ trình học tập phù hợp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chính xác</h3>
              <p className="text-gray-600">
                Bài test được thiết kế dựa trên tiêu chuẩn quốc tế, đảm bảo kết quả chính xác và đáng tin cậy.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nhanh chóng</h3>
              <p className="text-gray-600">
                Kết quả test được trả về ngay lập tức kèm theo phân tích chi tiết và đề xuất học tập.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Học tập</h3>
              <p className="text-gray-600">
                Cung cấp lộ trình học tập cá nhân hóa dựa trên kết quả test và mục tiêu của từng học viên.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Tính năng nổi bật</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Test Placement Toàn diện</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Kiểm tra kỹ năng Nghe</h4>
                    <p className="text-gray-600">Đánh giá khả năng nghe hiểu qua các đoạn hội thoại và bài nghe chuyên sâu.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Kiểm tra kỹ năng Đọc</h4>
                    <p className="text-gray-600">Đọc hiểu các đoạn văn với độ khó tăng dần từ cơ bản đến nâng cao.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Đánh giá tổng hợp</h4>
                    <p className="text-gray-600">Kết hợp nhiều dạng câu hỏi để đưa ra đánh giá toàn diện về trình độ.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Kết quả Test</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Điểm tổng:</span>
                      <span className="font-bold text-blue-600">85/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">IELTS tương đương:</span>
                      <span className="font-bold text-green-600">6.5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trình độ:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">AV5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Đội ngũ phát triển</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900">Nguyễn Văn A</h3>
              <p className="text-blue-600 mb-2">Lead Developer</p>
              <p className="text-gray-600 text-sm">
                Chuyên gia về phát triển ứng dụng web với hơn 5 năm kinh nghiệm trong lĩnh vực EdTech.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900">Trần Thị B</h3>
              <p className="text-blue-600 mb-2">Education Specialist</p>
              <p className="text-gray-600 text-sm">
                Thạc sĩ Ngôn ngữ Anh với 10 năm kinh nghiệm giảng dạy và thiết kế chương trình học.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900">Lê Văn C</h3>
              <p className="text-blue-600 mb-2">UX/UI Designer</p>
              <p className="text-gray-600 text-sm">
                Chuyên gia thiết kế trải nghiệm người dùng với passion về giáo dục trực tuyến.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-600 rounded-lg text-white p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <p className="text-blue-100">Học viên đã tham gia</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <p className="text-blue-100">Bài test chất lượng</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <p className="text-blue-100">Độ chính xác</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Hỗ trợ trực tuyến</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

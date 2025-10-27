import React from 'react';

const LessonsPage: React.FC = () => {
  return (
    <div className="section-container py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">Bài học</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Nội dung bài học theo lộ trình Listening & Reading sẽ sớm được cập nhật để bạn có thể xem video hướng dẫn và tài liệu luyện tập.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Listening</h2>
            <p className="text-gray-600 text-sm">Bài học nền tảng cùng mẹo làm bài và luyện kỹ năng nghe theo từng dạng câu hỏi.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Reading</h2>
            <p className="text-gray-600 text-sm">Tổng hợp bài học phân tích đoạn văn, chiến lược quản lý thời gian và từ vựng trọng điểm.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;

import React from 'react';

const PracticePage: React.FC = () => {
  return (
    <div className="section-container py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Ôn luyện</h1>
        <p className="text-lg text-gray-600 mb-10">
          Không gian bài tập thực hành sẽ được cập nhật trong thời gian sắp tới. Hãy quay lại sau hoặc tiếp tục luyện đề trong mục kiểm tra đầu vào.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bài tập kỹ năng</h2>
            <p className="text-gray-600 text-sm">Danh mục bài tập theo từng kỹ năng nghe và đọc giúp bạn ôn luyện từng bước.</p>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Theo dõi tiến độ</h2>
            <p className="text-gray-600 text-sm">Theo dõi các bài luyện đã hoàn thành và đánh giá điểm mạnh điểm yếu của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;

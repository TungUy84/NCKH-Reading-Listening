import React from 'react';

const RoadmapPage: React.FC = () => {
  const stages = [
    {
      title: 'Giai đoạn 1',
      level: 'AV1 - AV2',
      description: 'Củng cố nền tảng từ vựng, ngữ âm và luyện nghe những đoạn hội thoại ngắn.',
    },
    {
      title: 'Giai đoạn 2',
      level: 'AV3 - AV4',
      description: 'Tăng tốc kỹ năng đọc hiểu, luyện tập dạng câu hỏi multiple choice và điền từ.',
    },
    {
      title: 'Giai đoạn 3',
      level: 'AV5 - AV6',
      description: 'Rèn luyện bài dài và kỹ năng phân tích, quản lý thời gian trong phòng thi.',
    },
  ];

  return (
    <div className="section-container py-20">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Lộ trình học</h1>
        <p className="text-lg text-gray-600 mb-12">
          Lộ trình được cá nhân hóa dựa trên kết quả kiểm tra đầu vào. Bạn sẽ sớm xem được đề xuất chi tiết tại đây.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {stages.map(stage => (
            <div key={stage.title} className="card">
              <p className="text-sm font-semibold text-blue-600 mb-2">{stage.title}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{stage.level}</h2>
              <p className="text-gray-600 text-sm">{stage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

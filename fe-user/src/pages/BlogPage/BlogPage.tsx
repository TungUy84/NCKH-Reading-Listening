import React from 'react';

const BlogPage: React.FC = () => {
  const posts = [
    {
      title: 'Mẹo làm bài Listening đạt điểm cao',
      description: 'Tổng hợp mẹo luyện nghe, cách ghi chú nhanh và chiến lược phân bổ thời gian cho từng phần.',
    },
    {
      title: 'Checklist chuẩn bị trước kỳ thi',
      description: 'Các bước chuẩn bị quan trọng giúp bạn tự tin bước vào kỳ thi nghe - đọc tiếng Anh.',
    },
    {
      title: 'Lộ trình học tiếng Anh hiệu quả',
      description: 'Gợi ý lộ trình 3 giai đoạn phù hợp cho người mất gốc đến khi làm chủ bài thi.',
    },
  ];

  return (
    <div className="section-container py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">Blog</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Kiến thức và kinh nghiệm tự học tiếng Anh được cập nhật thường xuyên dành cho bạn.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map(post => (
            <article key={post.title} className="card text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 text-sm">{post.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

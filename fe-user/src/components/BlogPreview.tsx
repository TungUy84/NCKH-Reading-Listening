import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

// Component hiển thị preview blog posts
const BlogPreview: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: '5 mẹo học từ vựng tiếng Anh hiệu quả',
      excerpt: 'Khám phá những phương pháp học từ vựng được chứng minh là hiệu quả nhất...',
      category: 'Mẹo học tập',
      categoryColor: 'bg-blue-100 text-blue-700',
      date: '15/11/2024',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'
    },
    {
      id: 2,
      title: 'Cách cải thiện kỹ năng nghe tiếng Anh',
      excerpt: 'Những bài tập và chiến lược giúp bạn nâng cao khả năng nghe hiểu...',
      category: 'Kinh nghiệm',
      categoryColor: 'bg-purple-100 text-purple-700',
      date: '12/11/2024',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80'
    },
    {
      id: 3,
      title: 'Lộ trình tự học tiếng Anh từ con số 0',
      excerpt: 'Hướng dẫn chi tiết cho người mới bắt đầu học tiếng Anh...',
      category: 'Chia sẻ',
      categoryColor: 'bg-green-100 text-green-700',
      date: '08/11/2024',
      readTime: '10 phút đọc',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block text-sm font-semibold tracking-wider uppercase px-4 py-2 rounded-full bg-orange-50 text-orange-600 mb-4">
              Blog & Tin tức
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Chia sẻ kiến thức & Kinh nghiệm
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Cập nhật các bài viết hữu ích về học tiếng Anh
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden md:inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${post.categoryColor} backdrop-blur-sm`}>
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read more link */}
                <Link
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 mt-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Đọc tiếp
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile "View all" button */}
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Xem tất cả bài viết
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;

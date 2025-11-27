import React from 'react';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function BlogPreview() {
  const blogPosts = [
    {
      category: 'Mẹo học tập',
      title: '10 chiến lược cải thiện kỹ năng nghe tiếng Anh',
      excerpt: 'Khám phá những phương pháp hiệu quả giúp bạn nâng cao khả năng nghe hiểu...',
      date: '25/11/2024',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1551754809-c0a4e5b246ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHN0dWR5aW5nJTIwZW5nbGlzaHxlbnwxfHx8fDE3NjQyNzExMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      category: 'Kinh nghiệm',
      title: 'Cách đọc hiểu văn bản học thuật nhanh và hiệu quả',
      excerpt: 'Những kỹ thuật đọc nhanh giúp bạn nắm bắt nội dung chính trong thời gian ngắn...',
      date: '22/11/2024',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1673515324976-edc94ae391f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGxhcHRvcHxlbnwxfHx8fDE3NjQyNjQ0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      category: 'Chia sẻ',
      title: 'Câu chuyện từ điểm D lên điểm A trong 3 tháng',
      excerpt: 'Hành trình học tập đầy cảm hứng của sinh viên VLU năm 3...',
      date: '20/11/2024',
      readTime: '4 phút đọc',
      image: 'https://images.unsplash.com/photo-1760131556605-7f2e63d00385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDF8fHx8MTc2NDIxMDI4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <section id="blog" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-gray-900 mb-4">
              Blog & Tài nguyên
            </h2>
            <p className="text-gray-600">
              Cập nhật kiến thức và mẹo học tập từ chuyên gia
            </p>
          </div>
          <a
            href="#blog"
            className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full mb-4">
                  {post.category}
                </div>

                <h3 className="text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12 sm:hidden">
          <a
            href="#blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem tất cả bài viết
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

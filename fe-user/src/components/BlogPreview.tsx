import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { getBlogs } from '../services/api';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  images: string[];
  authorId: {
    lastName: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  slug: string;
}

const BlogPreview: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs({ limit: 3 });
        if (response.success) {
          setBlogs(response.data.blogs);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Helper to strip HTML tags for excerpt
  const getExcerpt = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove '/api' from the end of the API URL if present to get the base URL
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    
    return `${baseUrl}${imagePath}`;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mb-12"></div>
            <div className="grid gap-8 md:grid-cols-3 w-full">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div data-aos="fade-right">
            <span className="inline-block text-sm font-bold tracking-wider uppercase px-4 py-2 rounded-full bg-orange-100 text-orange-600 mb-4">
              Blog
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Bài viết mới nhất
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Cập nhật kiến thức và kinh nghiệm học tiếng Anh hiệu quả
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden md:inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors group"
          >
            Xem tất cả
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post, index) => (
            <article
              key={post._id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getImageUrl(post.images[0])}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{post.authorId ? `${post.authorId.lastName}` : 'Admin'}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  <Link to={`/blog/${post._id}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">
                  {getExcerpt(post.content)}
                </p>

                <Link 
                  to={`/blog`}
                  className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  Đọc tiếp
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors w-full"
          >
            Xem tất cả bài viết
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;

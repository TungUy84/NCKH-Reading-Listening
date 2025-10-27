import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, User, Clock, Tag, TrendingUp, BookOpen, 
  ArrowRight, Plus, Edit, Heart, MessageCircle, Share2, SortAsc 
} from 'lucide-react';

interface BlogProps {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  onLogin: (status: boolean) => void;
  onSetUser: (user: { name: string; email: string } | null) => void;
}

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorType: "user" | "instructor";
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
}

const Blog: React.FC<BlogProps> = ({ isLoggedIn, user, onLogin, onSetUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'tips',
    tags: ''
  });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Gọi API lấy bài viết
  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
      .then(res => res.json())
      .then(data => setBlogPosts(data))
      .catch(err => console.error("❌ Lỗi load blog:", err));
  }, []);

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'listening', name: 'Listening Tips' },
    { id: 'reading', name: 'Reading Skills' },
    { id: 'vocabulary', name: 'Vocabulary' },
    { id: 'grammar', name: 'Grammar' },
    { id: 'exam-tips', name: 'Exam Tips' },
    { id: 'user-posts', name: 'Bài viết người dùng' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Mới nhất' },
    { id: 'oldest', name: 'Cũ nhất' },
    { id: 'popular', name: 'Phổ biến nhất' },
    { id: 'most-liked', name: 'Nhiều like nhất' }
  ];

  // Lọc + sắp xếp
  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'popular':
          return b.views - a.views;
        case 'most-liked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

  const featuredPosts = blogPosts.filter(post => post.featured);

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để chia sẻ kinh nghiệm!');
      return;
    }
    setShowCreatePost(true);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newPost,
        tags: newPost.tags.split(",").map(tag => tag.trim()),
        author: user?.name || "Ẩn danh",
        authorType: user ? "user" : "instructor",
        date: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        featured: false
      })
    })
      .then(res => res.json())
      .then((createdPost) => {
        setBlogPosts(prev => [createdPost, ...prev]);
        setShowCreatePost(false);
        setNewPost({ title: '', content: '', category: 'tips', tags: '' });
      })
      .catch(err => console.error("❌ Lỗi khi tạo bài viết:", err));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những bài viết hữu ích về học tiếng Anh, mẹo thi cử và kinh nghiệm từ cộng đồng
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <button
              onClick={handleCreatePost}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Chia sẻ kinh nghiệm</span>
            </button>
            {isLoggedIn && (
              <span className="text-green-600 font-medium">👋 Xin chào, {user?.name}!</span>
            )}
          </div>
        </div>

        {/* Modal tạo post */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">✍️ Chia sẻ kinh nghiệm học tiếng Anh</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-4">
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Tiêu đề bài viết"
                  required
                />
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nội dung..."
                  required
                />
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Tags (cách nhau bởi dấu phẩy)"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Đăng bài
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none min-w-[200px]"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured posts */}
        {selectedCategory === 'all' && searchTerm === '' && featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
              Bài viết nổi bật
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Đọc thêm →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All posts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'Tất cả bài viết' : `Danh mục: ${categories.find(c => c.id === selectedCategory)?.name}`}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không có bài viết nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article key={post._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
                      Đọc bài viết
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;

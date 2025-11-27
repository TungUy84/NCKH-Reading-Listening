import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Blog } from '../../types';
import {
  getBlogs,
  createBlog,
  likeBlog,
  addBlogComment,
  uploadBlogImages
} from '../../services/api';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho modal tạo bài viết
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createImageFiles, setCreateImageFiles] = useState<File[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  // State cho bình luận
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<{ [key: string]: boolean }>({});

  // Lấy danh sách bài viết
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBlogs({ page: 1, limit: 50 });
      setBlogs(response.data.blogs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo bài viết
  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + createImageFiles.length > 5) {
      toast.warning('Tối đa 5 ảnh mỗi bài');
      return;
    }
    setCreateImageFiles([...createImageFiles, ...files]);
  };

  const handleCreateRemoveImage = (index: number) => {
    setCreateImageFiles(createImageFiles.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async () => {
    if (!createTitle.trim() || !createContent.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    setCreateLoading(true);
    try {
      // Tải ảnh lên trước
      let imageUrls: string[] = [];
      if (createImageFiles.length > 0) {
        const uploadResponse = await uploadBlogImages(createImageFiles);
        imageUrls = uploadResponse.data.images || [];
      }

      // Tạo bài viết
      await createBlog({
        title: createTitle,
        content: createContent,
        images: imageUrls
      });

      // Reset và đóng modal
      setCreateTitle('');
      setCreateContent('');
      setCreateImageFiles([]);
      setShowCreateModal(false);

      toast.success('Bài viết đã được tạo và đang chờ duyệt. Bạn có thể xem tại "Bài viết của tôi"');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setCreateLoading(false);
    }
  };

  // Xử lý like bài viết
  const handleLikeClick = async (blogId: string) => {
    try {
      const response = await likeBlog(blogId);
      const { isLiked, likeCount } = response.data;

      setBlogs(blogs.map(blog =>
        blog._id === blogId
          ? { ...blog, isLikedByMe: isLiked, likeCount }
          : blog
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể like bài viết');
    }
  };

  // Xử lý bình luận
  const toggleComments = (blogId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(blogId)) {
      newExpanded.delete(blogId);
    } else {
      newExpanded.add(blogId);
    }
    setExpandedComments(newExpanded);
  };

  const handleCommentSubmit = async (blogId: string) => {
    const content = commentInputs[blogId];
    if (!content?.trim()) return;

    setCommentLoading({ ...commentLoading, [blogId]: true });
    try {
      const response = await addBlogComment(blogId, content.trim());
      const newComment = response.data;

      setBlogs(blogs.map(blog =>
        blog._id === blogId
          ? {
              ...blog,
              comments: [...blog.comments, newComment],
              commentCount: blog.commentCount + 1
            }
          : blog
      ));

      // Xóa ô nhập
      setCommentInputs({ ...commentInputs, [blogId]: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thêm bình luận');
    } finally {
      setCommentLoading({ ...commentLoading, [blogId]: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Tiêu đề */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Bảng tin Blog</h1>
              <p className="text-gray-600 mt-2">Khám phá các bài viết từ cộng đồng</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/blog/my-posts')}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Bài viết của tôi
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Tạo bài viết
              </button>
            </div>
          </div>
        </div>

        {/* Trạng thái tải và lỗi */}
        {loading && <div className="text-center py-8">Đang tải...</div>}
        {error && <div className="text-center py-8 text-red-600">{error}</div>}

        {/* Danh sách bài viết */}
        {!loading && !error && (
          <div className="space-y-6">
            {blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Chưa có bài viết nào
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                  {/* Thông tin tác giả */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {blog.authorId.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {blog.authorId.firstName} {blog.authorId.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(blog.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Nội dung */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{blog.title}</h2>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{blog.content}</p>

                  {/* Hình ảnh */}
                  {blog.images && blog.images.length > 0 && (
                    <div className={`grid gap-3 mb-4 ${
                      blog.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {blog.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${img}`}
                          alt={`${blog.title} - Ảnh ${idx + 1}`}
                          className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                          onClick={() => window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '')}${img}`, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Nút like và bình luận */}
                  <div className="flex items-center space-x-6 py-3 border-t border-b">
                    <button
                      onClick={() => handleLikeClick(blog._id)}
                      className={`flex items-center space-x-2 ${
                        blog.isLikedByMe ? 'text-red-600' : 'text-gray-600'
                      } hover:text-red-600 transition`}
                    >
                      <Heart size={22} fill={blog.isLikedByMe ? 'currentColor' : 'none'} />
                      <span className="font-medium">{blog.likeCount}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(blog._id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageCircle size={22} />
                      <span className="font-medium">{blog.commentCount}</span>
                    </button>
                  </div>

                  {/* Khu vực bình luận */}
                  {expandedComments.has(blog._id) && (
                    <div className="mt-4 space-y-4">
                      {/* Danh sách bình luận */}
                      {blog.comments && blog.comments.length > 0 && (
                        <div className="space-y-3">
                          {blog.comments.map((comment) => (
                            <div key={comment._id} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {comment.authorId.firstName.charAt(0)}
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-lg p-3">
                                <p className="font-medium text-sm text-gray-800">
                                  {comment.authorId.firstName} {comment.authorId.lastName}
                                </p>
                                <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Thêm bình luận */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={commentInputs[blog._id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [blog._id]: e.target.value })
                          }
                          placeholder="Viết bình luận..."
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={500}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(blog._id);
                          }}
                        />
                        <button
                          onClick={() => handleCommentSubmit(blog._id)}
                          disabled={commentLoading[blog._id]}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal tạo bài viết */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Tạo bài viết mới</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                    <input
                      type="text"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tiêu đề (tối đa 200 ký tự)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nội dung</label>
                    <textarea
                      value={createContent}
                      onChange={(e) => setCreateContent(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập nội dung bài viết"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hình ảnh (tối đa 5 ảnh, mỗi ảnh tối đa 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleCreateImageChange}
                      className="block w-full text-sm"
                    />
                    {createImageFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {createImageFiles.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              onClick={() => handleCreateRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleCreateSubmit}
                    disabled={createLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
                  >
                    {createLoading ? 'Đang tạo...' : 'Tạo bài viết'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

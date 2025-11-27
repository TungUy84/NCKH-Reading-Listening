import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, X, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Blog } from '../../types';
import {
  getMyBlogs,
  updateBlog,
  deleteBlog,
  likeBlog,
  addBlogComment,
  uploadBlogImages
} from '../../services/api';

const MyBlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho modal chỉnh sửa bài viết
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBlogId, setEditBlogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // State cho bình luận
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyBlogs({ page: 1, limit: 50 });
      setBlogs(response.data.blogs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải bài viết của bạn');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa bài viết
  const handleEditClick = (blog: Blog) => {
    if (blog.status === 'approved') {
      toast.warning('Không thể chỉnh sửa bài viết đã được duyệt');
      return;
    }
    setEditBlogId(blog._id);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setEditImages(blog.images || []);
    setEditImageFiles([]);
    setShowEditModal(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentBlog = blogs.find(b => b._id === editBlogId);
    if (files.length + editImageFiles.length + (currentBlog?.images.length || 0) > 5) {
      toast.warning('Tối đa 5 ảnh mỗi bài');
      return;
    }
    setEditImageFiles([...editImageFiles, ...files]);
  };

  const handleEditRemoveExistingImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleEditRemoveNewImage = (index: number) => {
    setEditImageFiles(editImageFiles.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    setEditLoading(true);
    try {
      let newImageUrls: string[] = [];
      if (editImageFiles.length > 0) {
        const uploadResponse = await uploadBlogImages(editImageFiles);
        newImageUrls = uploadResponse.data.images || [];
      }

      const allImages = [...editImages, ...newImageUrls];

      if (!editBlogId) return;
      await updateBlog(editBlogId, {
        title: editTitle,
        content: editContent,
        images: allImages
      });

      setEditBlogId(null);
      setEditTitle('');
      setEditContent('');
      setEditImages([]);
      setEditImageFiles([]);
      setShowEditModal(false);

      fetchBlogs();
      toast.success('Bài viết đã được cập nhật và đang chờ duyệt lại');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật bài viết');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    const blog = blogs.find(b => b._id === blogId);
    const result = await Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: blog?.title || 'Bài viết này',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteBlog(blogId);
      await fetchBlogs();
      toast.success('Đã xóa bài viết');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa bài viết');
    }
  };

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

      setCommentInputs({ ...commentInputs, [blogId]: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thêm bình luận');
    } finally {
      setCommentLoading({ ...commentLoading, [blogId]: false });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium">Chờ duyệt</span>;
      case 'approved':
        return <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">Đã duyệt</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full font-medium">Bị từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Tiêu đề */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại Bảng tin
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Bài viết của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả bài viết bạn đã tạo</p>
        </div>

        {loading && <div className="text-center py-8">Đang tải...</div>}
        {error && <div className="text-center py-8 text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="space-y-6">
            {blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Bạn chưa có bài viết nào
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog._id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Thông tin tác giả và trạng thái */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {blog.authorId?.firstName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {blog.authorId?.firstName || 'Unknown'} {blog.authorId?.lastName || 'User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(blog.status)}
                      {blog.status !== 'approved' && (
                        <>
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                            title="Xóa"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
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
                          className="w-full h-64 object-cover rounded-lg"
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
                      {blog.comments && blog.comments.length > 0 && (
                        <div className="space-y-3">
                          {blog.comments.map((comment) => (
                            <div key={comment._id} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {comment.authorId?.firstName?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1 bg-gray-100 rounded-lg p-3">
                                <p className="font-medium text-sm text-gray-800">
                                  {comment.authorId?.firstName || 'Unknown'} {comment.authorId?.lastName || 'User'}
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

        {/* Modal chỉnh sửa bài viết */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Chỉnh sửa bài viết</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
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
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={200}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tiêu đề (tối đa 200 ký tự)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nội dung</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập nội dung bài viết"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hình ảnh (tối đa 5 ảnh, mỗi ảnh tối đa 5MB)
                    </label>

                    {editImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {editImages.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${img}`}
                              alt={`Existing ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              onClick={() => handleEditRemoveExistingImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {editImageFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {editImageFiles.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              onClick={() => handleEditRemoveNewImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleEditImageChange}
                      className="block w-full text-sm"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleEditSubmit}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
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

export default MyBlogsPage;

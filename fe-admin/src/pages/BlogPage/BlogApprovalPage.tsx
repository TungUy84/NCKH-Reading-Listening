import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Blog } from '../../types';
import { BlogAPI } from '../../services/api';

const BlogApprovalPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingBlogs();
  }, []);

  const fetchPendingBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BlogAPI.getPendingBlogs({ page: 1, limit: 100 });
      setBlogs(response.data.blogs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách blog chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowPreviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedBlog) return;

    setActionLoading(true);
    try {
      await BlogAPI.approveBlog(selectedBlog._id);
      setShowPreviewModal(false);
      setSelectedBlog(null);
      fetchPendingBlogs();
      toast.success('Đã duyệt bài viết');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể duyệt bài viết');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBlog) return;

    const result = await Swal.fire({
      title: 'Bạn có chắc muốn từ chối?',
      text: selectedBlog.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Từ chối',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      await BlogAPI.rejectBlog(selectedBlog._id);
      setShowPreviewModal(false);
      setSelectedBlog(null);
      fetchPendingBlogs();
      toast.success('Đã từ chối bài viết');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể từ chối bài viết');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Duyệt bài viết Blog</h1>
        <p className="text-gray-600 mt-2">Kiểm tra và phê duyệt các bài viết do người dùng tạo</p>
      </div>

      {loading && <div className="text-center py-8">Đang tải...</div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

      {!loading && !error && (
        <>
          {blogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Không có bài viết nào chờ duyệt
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                          {blog.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {blog.content.substring(0, 100)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                            {blog.authorId.firstName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {blog.authorId.firstName} {blog.authorId.lastName}
                            </div>
                            <div className="text-xs text-gray-500">@{blog.authorId.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1" size={14} />
                          {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blog.images.length} ảnh
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handlePreview(blog)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Eye size={16} className="mr-1" />
                          Xem & Duyệt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal xem trước */}
      {showPreviewModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Xem trước bài viết</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Author info */}
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {selectedBlog.authorId.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedBlog.authorId.firstName} {selectedBlog.authorId.lastName}
                  </p>
                  <p className="text-sm text-gray-500">@{selectedBlog.authorId.username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedBlog.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedBlog.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedBlog.content}
                </p>
              </div>

              {/* Images */}
              {selectedBlog.images && selectedBlog.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Hình ảnh ({selectedBlog.images.length})</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBlog.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${img}`}
                        alt={`Blog ${idx + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={20} className="mr-2" />
                  {actionLoading ? 'Đang xử lý...' : 'Duyệt bài viết'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={20} className="mr-2" />
                  {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogApprovalPage;

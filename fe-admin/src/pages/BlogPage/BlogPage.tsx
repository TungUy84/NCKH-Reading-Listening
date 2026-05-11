import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Blog } from '../../types';
import { BlogAPI } from '../../services/api';

const BlogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approved' | 'rejected'>('approved');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BlogAPI.getAllBlogs({
        page: 1,
        limit: 100,
        status: activeTab
      });
      setBlogs(response.data.blogs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách blog');
    } finally {
      setLoading(false);
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
      await BlogAPI.deleteBlog(blogId);
      fetchBlogs();
      toast.success('Đã xóa bài viết');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa bài viết');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý Blog</h1>
          <p className="text-gray-600 mt-2">Quản lý các bài viết đã được duyệt và bị từ chối</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/blog/approval'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
        >
          <CheckCircle size={20} />
          <span>Duyệt bài</span>
        </button>
      </div>

      {/* Các tab */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'approved'
              ? 'border-b-2 border-green-600 text-green-600 bg-green-50'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center">
              <CheckCircle size={20} className="mr-2" />
              Đã duyệt
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'rejected'
              ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center">
              <XCircle size={20} className="mr-2" />
              Bị từ chối
            </div>
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-8">Đang tải...</div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

      {!loading && !error && (
        <>
          {blogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              {activeTab === 'approved'
                ? 'Chưa có bài viết nào được duyệt'
                : 'Chưa có bài viết nào bị từ chối'}
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
                      {activeTab === 'approved' ? 'Ngày duyệt' : 'Hình ảnh'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tương tác
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
                            {blog.authorId?.firstName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {blog.authorId ? `${blog.authorId.firstName} ${blog.authorId.lastName}` : 'Người dùng ẩn danh'}
                            </div>
                            <div className="text-xs text-gray-500">@{blog.authorId?.username || 'unknown'}</div>
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
                        {activeTab === 'approved' && blog.approvedAt ? (
                          <div className="flex items-center">
                            <Calendar className="mr-1" size={14} />
                            {new Date(blog.approvedAt).toLocaleDateString('vi-VN')}
                          </div>
                        ) : (
                          `${blog.images.length} ảnh`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col space-y-1">
                          <span>{blog.likeCount} lượt thích</span>
                          <span>{blog.commentCount} bình luận</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleDelete(blog._id)}
                            title="Xóa"
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:shadow-md transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPage;

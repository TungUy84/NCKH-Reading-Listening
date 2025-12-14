import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { Blog } from '../../types';
import {
  getMyBlogs,
  updateBlog,
  deleteBlog,
  uploadBlogImages
} from '../../services/api';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}${imagePath}`;
};

const MyBlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  // State cho modal chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBlogId, setEditBlogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await getMyBlogs({ page: 1, limit: 100 }); // Lấy nhiều để tính stats
      setBlogs(res.data.blogs || []);
    } catch (err) {
      toast.error('Lỗi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const stats = useMemo(() => {
    return {
      totalPosts: blogs.length,
      totalLikes: blogs.reduce((acc, blog) => acc + blog.likeCount, 0),
      totalComments: blogs.reduce((acc, blog) => acc + blog.commentCount, 0),
      approved: blogs.filter(b => b.status === 'approved').length
    };
  }, [blogs]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Xóa bài viết?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e', // rose-500
      cancelButtonColor: '#64748b', // slate-500
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Giữ lại',
      background: '#fff',
      customClass: {
        popup: 'rounded-[1.5rem]'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteBlog(id);
        setBlogs(blogs.filter(b => b._id !== id));
        toast.success('Đã xóa bài viết');
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  // Logic Edit
  const handleEditClick = (blog: Blog) => {
    if (blog.status === 'approved') {
      toast.warning('Không thể sửa bài đã được duyệt. Hãy liên hệ admin nếu cần.');
      return;
    }
    setEditBlogId(blog._id);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setEditImages(blog.images || []);
    setEditImageFiles([]);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Vui lòng nhập đủ thông tin');
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
      if (editBlogId) {
        await updateBlog(editBlogId, { title: editTitle, content: editContent, images: allImages });
        setEditBlogId(null);
        setShowEditModal(false);
        fetchBlogs();
        toast.success('Cập nhật thành công!');
      }
    } catch (err) {
      toast.error('Lỗi cập nhật bài viết');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + editImageFiles.length + editImages.length > 5) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm"><CheckBadgeIcon className="h-4 w-4" /> Đã duyệt</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 shadow-sm"><ExclamationCircleIcon className="h-4 w-4" /> Từ chối</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 shadow-sm"><ClockIcon className="h-4 w-4" /> Chờ duyệt</span>;
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* --- HEADER & STATS --- */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/blog')}
            className="group flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold mb-6 transition-colors w-fit"
          >
            <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md border border-slate-200 transition-all">
              <ArrowLeftIcon className="h-4 w-4" />
            </div>
            <span>Quay lại Bảng tin</span>
          </button>

          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Quản lý bài viết</h1>
              <p className="text-slate-500 font-medium">Theo dõi trạng thái và tương tác của các bài viết bạn đã chia sẻ.</p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[140px]">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DocumentTextIcon className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Tổng bài</p>
                  <p className="text-xl font-black text-slate-900">{stats.totalPosts}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[140px]">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl"><HeartIcon className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Yêu thích</p>
                  <p className="text-xl font-black text-slate-900">{stats.totalLikes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BLOG LIST --- */}
        {loading ? <div className="flex justify-center py-20"><Loader /></div> : (
          <div className="space-y-6">
            {blogs.length === 0 ? (
              <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-300">
                <div className="inline-flex h-20 w-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <PencilSquareIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Bạn chưa có bài viết nào</h3>
                <p className="text-slate-500 mt-2 mb-6">Hãy bắt đầu chia sẻ kiến thức của bạn ngay hôm nay!</p>
                <Button onClick={() => navigate('/blog')} className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 rounded-xl">
                  Tạo bài viết mới
                </Button>
              </div>
            ) : (
              blogs.map(blog => (
                <div key={blog._id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg hover:border-rose-100 transition-all duration-300 flex flex-col md:flex-row gap-8 items-start group">

                  {/* Thumbnail */}
                  <div className="w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative">
                    {blog.images?.[0] ? (
                      <img src={getImageUrl(blog.images[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                        <PhotoIcon className="h-10 w-10 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(blog.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {/* SỬA LỖI: Dùng toLocaleString thay vì toLocaleDateString nếu có timeStyle */}
                          {new Date(blog.createdAt).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                          {blog.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-slate-500 text-base line-clamp-2 mt-3 mb-6 leading-relaxed">
                      {blog.content}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                      {/* Metrics */}
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg font-bold text-sm">
                          <HeartIcon className="h-4 w-4" />
                          <span>{blog.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm">
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                          <span>{blog.commentCount}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {blog.status !== 'approved' && (
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
                          >
                            <PencilSquareIcon className="h-4 w-4" /> Sửa
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- EDIT MODAL (Glass Style) --- */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowEditModal(false)} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-pop-in border border-white/20">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><PencilSquareIcon className="h-6 w-6" /></div>
                  <h3 className="text-xl font-black text-slate-900">Chỉnh sửa bài viết</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"><XMarkIcon className="h-5 w-5" /></button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tiêu đề</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 outline-none font-bold text-lg text-slate-900"
                    placeholder="Tiêu đề bài viết..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nội dung</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 outline-none resize-none text-slate-700 leading-relaxed"
                  />
                </div>

                {/* Image Edit Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Hình ảnh</label>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Existing Images */}
                    {editImages.map((img, idx) => (
                      <div key={`exist-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleEditRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 bg-white text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* New Images */}
                    {editImageFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleEditRemoveNewImage(idx)}
                          className="absolute top-1 right-1 bg-white text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Add Button */}
                    {(editImages.length + editImageFiles.length) < 5 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-all bg-slate-50/50">
                        <PhotoIcon className="h-8 w-8 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Thêm ảnh</span>
                        <input type="file" accept="image/*" multiple onChange={handleEditImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowEditModal(false)} className="rounded-xl text-slate-500">Hủy</Button>
                <Button onClick={handleEditSubmit} disabled={editLoading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-xl px-6">
                  {editLoading ? <span className="flex items-center gap-2"><Loader className="w-4 h-4 text-white" /> Lưu...</span> : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBlogsPage;
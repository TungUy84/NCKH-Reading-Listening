import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  PlusIcon,
  NewspaperIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { Blog } from '../../types';
import {
  getBlogs,
  createBlog,
  likeBlog,
  addBlogComment,
  uploadBlogImages
} from '../../services/api';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

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
      let imageUrls: string[] = [];
      if (createImageFiles.length > 0) {
        const uploadResponse = await uploadBlogImages(createImageFiles);
        imageUrls = uploadResponse.data.images || [];
      }

      await createBlog({
        title: createTitle,
        content: createContent,
        images: imageUrls
      });

      setCreateTitle('');
      setCreateContent('');
      setCreateImageFiles([]);
      setShowCreateModal(false);
      toast.success('Bài viết đã được tạo và đang chờ duyệt!');
      fetchBlogs(); // Refresh list after create
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLikeClick = async (blogId: string) => {
    try {
      const response = await likeBlog(blogId);
      const { isLiked, likeCount } = response.data;
      setBlogs(blogs.map(blog => blog._id === blogId ? { ...blog, isLikedByMe: isLiked, likeCount } : blog));
    } catch (err: any) {
      toast.error('Không thể like bài viết');
    }
  };

  const toggleComments = (blogId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(blogId)) newExpanded.delete(blogId);
    else newExpanded.add(blogId);
    setExpandedComments(newExpanded);
  };

  const handleCommentSubmit = async (blogId: string) => {
    const content = commentInputs[blogId];
    if (!content?.trim()) return;
    setCommentLoading({ ...commentLoading, [blogId]: true });
    try {
      const response = await addBlogComment(blogId, content.trim());
      const newComment = response.data;
      setBlogs(blogs.map(blog => blog._id === blogId ? { ...blog, comments: [...blog.comments, newComment], commentCount: blog.commentCount + 1 } : blog));
      setCommentInputs({ ...commentInputs, [blogId]: '' });
    } catch (err: any) {
      toast.error('Không thể thêm bình luận');
    } finally {
      setCommentLoading({ ...commentLoading, [blogId]: false });
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20 pt-6">

      {/* --- CREATIVE HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white/50 shadow-2xl shadow-rose-500/10 overflow-hidden p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-200 via-orange-100 to-transparent rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200 via-pink-100 to-transparent rounded-full blur-3xl -z-10 opacity-60 -translate-x-1/3 translate-y-1/3" />

          {/* Text Content */}
          <div className="flex-1 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
              <SparklesIcon className="h-4 w-4" />
              Cộng đồng học tập
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb- tracking-tight">
              Chia sẻ <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">kiến thức,</span> <br />
              kết nối <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">đam mê.</span>
            </h1>
            <p className="text-lg md:text-xl py-5 text-slate-600 leading-relaxed mb-10 max-w-xl">
              Nơi tổng hợp các bài viết hữu ích, chia sẻ kinh nghiệm học tập và kết nối cộng đồng học tiếng Anh.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <PlusIcon className="h-6 w-6" />
                  Viết bài ngay
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </button>

              <button
                onClick={() => navigate('/blog/my-posts')}
                className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
              >
                Bài viết của tôi
              </button>
            </div>
          </div>

          {/* Hero Image / Visual */}
          <div className="relative w-full md:w-[45%] aspect-square md:aspect-[4/3] shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-orange-50 rounded-[2.5rem] transform rotate-3 scale-95 opacity-80" />
            <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                alt="Community"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-2">Featured</p>
                <h3 className="text-2xl font-bold leading-tight">Tham gia cùng các sinh viên đang nỗ lực mỗi ngày.</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT FEED --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-black text-slate-900">Bài viết mới nhất</h2>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {loading && <div className="flex justify-center py-20"><Loader /></div>}
        {error && <div className="text-center py-10 text-red-500 bg-red-50 rounded-2xl border border-red-100">{error}</div>}

        {!loading && !error && (
          <div className="space-y-12">
            {blogs.length === 0 ? (
              <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-300">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 mb-6 shadow-sm">
                  <NewspaperIcon className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có bài viết nào</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Hãy là người đầu tiên chia sẻ kiến thức bổ ích cho cộng đồng!</p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-6 bg-slate-900 text-white shadow-lg hover:bg-slate-800 rounded-xl">
                  Tạo bài viết đầu tiên
                </Button>
              </div>
            ) : (
              blogs.map((blog) => (
                <article key={blog._id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-100 transition-all duration-500 overflow-hidden">

                  {/* Blog Header */}
                  <div className="p-8 pb-0 flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        {blog.authorId.firstName.charAt(0)}
                      </div>
                      {/* Online status dot */}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {blog.authorId.firstName} {blog.authorId.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN', { dateStyle: 'medium' })}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{new Date(blog.createdAt).toLocaleTimeString('vi-VN', { timeStyle: 'short' })}</span>
                      </p>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="px-8 md:px-10 py-6">
                    <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight group-hover:text-rose-600 transition-colors cursor-pointer">
                      {blog.title}
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                      {blog.content}
                    </p>
                  </div>

                  {/* Blog Images Grid */}
                  {blog.images && blog.images.length > 0 && (
                    <div className={clsx(
                      "grid gap-2 px-8 md:px-10 mb-8",
                      blog.images.length === 1 ? "grid-cols-1" :
                        blog.images.length === 2 ? "grid-cols-2" :
                          "grid-cols-2 md:grid-cols-3"
                    )}>
                      {blog.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={clsx(
                            "overflow-hidden rounded-2xl shadow-sm cursor-pointer relative group/img",
                            blog.images.length === 1 ? "aspect-video" : "aspect-square",
                            // Logic xử lý grid layout cho đẹp
                            (blog.images.length === 3 && idx === 0) ? "md:col-span-2 md:row-span-2" : ""
                          )}
                          onClick={() => window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '')}${img}`, '_blank')}
                        >
                          <img
                            src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${img}`}
                            alt={`Blog ${idx}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blog Footer Actions */}
                  <div className="px-8 md:px-10 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikeClick(blog._id)}
                        className={clsx(
                          "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm border",
                          blog.isLikedByMe
                            ? "bg-rose-500 text-white border-rose-600 shadow-rose-500/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:text-rose-600 hover:shadow-md"
                        )}
                      >
                        <HeartIcon className={clsx("h-5 w-5", blog.isLikedByMe && "animate-bounce")} />
                        <span>{blog.likeCount} Yêu thích</span>
                      </button>

                      <button
                        onClick={() => toggleComments(blog._id)}
                        className={clsx(
                          "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm border",
                          expandedComments.has(blog._id)
                            ? "bg-blue-500 text-white border-blue-600 shadow-blue-500/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                        )}
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        <span>{blog.commentCount} Bình luận</span>
                      </button>
                    </div>

                    <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                      <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(blog._id) && (
                    <div className="bg-slate-50/50 px-8 md:px-10 py-8 border-t border-slate-200 animate-fade-in-up">
                      <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full" />
                        Bình luận ({blog.comments.length})
                      </h4>

                      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {blog.comments.map((comment) => (
                          <div key={comment._id} className="flex gap-4 group/comment">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 text-sm font-black shadow-sm shrink-0">
                              {comment.authorId.firstName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200/60">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {comment.authorId.firstName} {comment.authorId.lastName}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0">
                          Me
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={commentInputs[blog._id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [blog._id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(blog._id)}
                            placeholder="Viết bình luận của bạn..."
                            className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm transition-all text-sm font-medium"
                          />
                          <button
                            onClick={() => handleCommentSubmit(blog._id)}
                            disabled={commentLoading[blog._id]}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:hover:bg-blue-600"
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* --- CREATE MODAL --- */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-pop-in border border-white/20">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-rose-50/80 to-orange-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500">
                    <PlusIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Tạo bài viết mới</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chia sẻ với cộng đồng</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2.5 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-slate-100">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tiêu đề</label>
                  <input
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-rose-500 focus:ring-0 outline-none font-bold text-lg text-slate-900 placeholder:text-slate-300 transition-colors bg-slate-50/50 focus:bg-white"
                    placeholder="Bài viết của bạn nói về gì?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nội dung</label>
                  <textarea
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    rows={8}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-rose-500 focus:ring-0 outline-none resize-none text-slate-700 placeholder:text-slate-300 transition-colors bg-slate-50/50 focus:bg-white leading-relaxed"
                    placeholder="Hãy viết gì đó thật tâm huyết..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Hình ảnh đính kèm</label>
                  <div className="grid grid-cols-4 gap-3">
                    {createImageFiles.map((file, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => handleCreateRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-white text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {createImageFiles.length < 5 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer transition-all bg-slate-50/50">
                        <PhotoIcon className="h-8 w-8 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Thêm ảnh</span>
                        <input type="file" accept="image/*" multiple onChange={handleCreateImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 backdrop-blur-sm">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl text-slate-500 hover:bg-slate-100">Hủy bỏ</Button>
                <Button
                  onClick={handleCreateSubmit}
                  disabled={createLoading}
                  className="bg-gradient-to-r from-rose-500 to-orange-500 hover:shadow-xl hover:shadow-rose-500/30 border-none rounded-xl px-8 py-3 font-bold text-white transition-all hover:-translate-y-0.5"
                >
                  {createLoading ? (
                    <span className="flex items-center gap-2"><Loader className="w-4 h-4 text-white" /> Đang xử lý...</span>
                  ) : (
                    <span className="flex items-center gap-2">Đăng bài ngay <PaperAirplaneIcon className="h-4 w-4" /></span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogPage;
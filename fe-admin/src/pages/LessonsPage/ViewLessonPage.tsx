import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lesson } from '../../types';
import { LessonAPI } from '../../services/api';

const ViewLessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!lessonId) {
  toast.error('Không tìm thấy mã bài học');
  navigate('/admin/lessons');
      return;
    }

    // Load lesson data
    const loadLesson = async () => {
      try {
        setLoading(true);
        const data: Lesson = await LessonAPI.getLesson(lessonId);
        setLesson(data);
      } catch (error: any) {
        console.error('Load lesson error:', error);
  toast.error(error.message || 'Không thể tải bài học');
  navigate('/admin/lessons');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, navigate]);

  const formattedDate = useMemo(() => {
    if (!lesson?.createdAt) return 'N/A';
    return new Date(lesson.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [lesson?.createdAt]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-500">Đang tải dữ liệu bài học...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Xem chi tiết bài học</h1>
          <p className="text-sm text-slate-500">Xem trước nội dung bài học như học viên sẽ thấy.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/lessons/edit/${lessonId}`)}
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/lessons')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar thông tin */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Thông tin bài học</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">Kỹ năng</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {lesson.skill === 'listening' ? 'Listening' : 'Reading'}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Nhóm trình độ</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {lesson.levelGroup}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Trạng thái</p>
                {lesson.isActive ? (
                  <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Đang kích hoạt
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Chưa kích hoạt
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Lượt xem</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{lesson.viewCount || 0}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Ngày tạo</p>
                <p className="mt-1 text-sm text-slate-700">{formattedDate}</p>
              </div>

              {lesson.createdBy && typeof lesson.createdBy === 'object' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500">Người tạo</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {lesson.createdBy.firstName && lesson.createdBy.lastName 
                      ? `${lesson.createdBy.firstName} ${lesson.createdBy.lastName}` 
                      : lesson.createdBy.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {lesson.coverImage && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Ảnh bìa</h2>
              <img 
                src={lesson.coverImage} 
                alt={lesson.title}
                className="w-full rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
              {lesson.summary && (
                <p className="mt-2 text-sm text-slate-600">{lesson.summary}</p>
              )}
            </div>

            <div className="px-6 py-8">
              <div 
                className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewLessonPage;

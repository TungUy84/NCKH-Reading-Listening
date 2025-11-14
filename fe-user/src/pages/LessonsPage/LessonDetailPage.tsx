import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookOpen, Headphones, BarChart3 } from 'lucide-react';
import { LessonDetail } from '../../types';
import { getLessonDetail, updateRoadmapProgress } from '../../services/api';

const LessonDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!lessonId) {
      toast.error('Không tìm thấy mã bài học.');
      navigate('/lessons');
      return;
    }

    // Gọi API để lấy chi tiết bài học khi vào trang
    (async () => {
      setLoading(true);
      try {
        const response = await getLessonDetail(lessonId);
        setLesson(response.lesson);
        
        // Cập nhật tiến độ roadmap nếu user đang học theo lộ trình
        try {
          await updateRoadmapProgress({
            type: 'lesson',
            itemId: lessonId
          });
        } catch (err) {
          // Không hiển thị lỗi nếu user không có roadmap, chỉ log
          console.log('Không cập nhật roadmap progress:', err);
        }
      } catch (error: any) {
        console.error('Load lesson detail error:', error);
        toast.error(error.message || 'Không lấy được thông tin bài học.');
        navigate('/lessons');
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId, navigate]);

  const formattedDate = useMemo(() => {
    if (!lesson?.createdAt) return 'Chưa xác định';
    return new Date(lesson.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, [lesson?.createdAt]);

  if (loading) {
    return (
      <div className="section-container py-16 lg:py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="h-10 w-2/3 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-96 w-full animate-pulse rounded-3xl bg-slate-100" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-5 w-full animate-pulse rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="section-container flex min-h-[60vh] items-center justify-center py-20 text-center">
        <div className="space-y-6">
          <BookOpen className="mx-auto h-20 w-20 text-slate-300" />
          <h1 className="text-3xl font-bold text-slate-800">Bài học không tồn tại</h1>
          <p className="text-base text-slate-500">Có thể bài học đã bị gỡ hoặc bạn truy cập sai liên kết.</p>
          <Link
            to="/lessons"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-16 lg:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <aside className="order-last w-full lg:order-first lg:w-80">
          <div className="sticky top-24 space-y-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-blue-300"
            >
              <span aria-hidden>←</span>
              Quay lại
            </button>
            <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <BarChart3 className="h-4 w-4" />
                Thông tin bài học
              </h3>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
                  <span className="font-semibold text-slate-600">Kỹ năng</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    {lesson.skill === 'listening' ? (
                      <>
                        <Headphones className="h-3 w-3" />
                        Listening
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-3 w-3" />
                        Reading
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-purple-50 px-4 py-3">
                  <span className="font-semibold text-slate-600">Trình độ</span>
                  <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                    {lesson.levelGroup}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                  <span className="font-semibold text-slate-600">Lượt xem</span>
                  <span className="font-bold text-slate-800">{lesson.viewCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                  <span className="font-semibold text-slate-600">Ngày tạo</span>
                  <span className="font-medium text-slate-700">{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <article className="prose prose-lg prose-slate mx-auto w-full max-w-4xl rounded-3xl border-2 border-slate-200 bg-white px-8 py-10 shadow-xl prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-black text-transparent">
            {lesson.title}
          </h1>
          {lesson.summary ? (
            <p className="rounded-2xl border-l-4 border-blue-500 bg-blue-50 px-6 py-4 text-base font-medium italic text-blue-900">
              {lesson.summary}
            </p>
          ) : null}
          <hr className="my-8 border-dashed border-slate-300" />
          {/* Nội dung bài học được soạn sẵn, đảm bảo backend đã sanitize */}
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </article>
      </div>
    </div>
  );
};

export default LessonDetailPage;

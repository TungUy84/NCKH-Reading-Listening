import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ChevronLeftIcon,
  CalendarDaysIcon,
  EyeIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  ShareIcon,
  BookmarkIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { LessonDetail } from '../../types';
import { getLessonDetail, updateRoadmapProgress } from '../../services/api';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';

// --- HELPER STYLES (Giữ nguyên theo code bạn cung cấp) ---
const getLevelGradient = (level: string) => {
  if (['AV1-AV3'].includes(level)) return 'from-emerald-400 to-teal-500 shadow-emerald-200';
  if (['AV4-AV5'].includes(level)) return 'from-amber-400 to-orange-500 shadow-amber-200';
  if (['AV6', 'AV7'].includes(level)) return 'from-rose-400 to-pink-500 shadow-rose-200';
  return 'from-blue-400 to-indigo-500 shadow-blue-200';
};

const getSkillGradient = (skill: string) => {
  return skill === 'reading'
    ? 'from-blue-500 to-cyan-500 shadow-blue-200'
    : 'from-purple-500 to-pink-500 shadow-purple-200';
};

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
    (async () => {
      setLoading(true);
      try {
        const response = await getLessonDetail(lessonId);
        setLesson(response.lesson);
        try { await updateRoadmapProgress({ type: 'lesson', itemId: lessonId }); } catch { }
      } catch (error: any) {
        toast.error('Không thể tải bài học.');
        navigate('/lessons');
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId, navigate]);

  const formattedDate = useMemo(() => {
    if (!lesson?.createdAt) return '...';
    return new Date(lesson.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [lesson?.createdAt]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader /></div>;
  if (!lesson) return null;

  const isReading = lesson.skill === 'reading';

  return (
    <div className="min-h-screen font-sans pb-20 pt-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- BREADCRUMB NAV --- */}
        <button
          onClick={() => navigate('/lessons')}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium w-fit"
        >
          <div className="p-2 bg-white rounded-full border border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
            <ChevronLeftIcon className="h-4 w-4" />
          </div>
          <span>Quay lại thư viện</span>
        </button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* === MAIN CONTENT (Left - 8 Cols) === */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Header Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-10 overflow-hidden relative">
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/3 -translate-y-1/3" />

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r uppercase tracking-wide flex items-center gap-2",
                  getSkillGradient(lesson.skill)
                )}>
                  {isReading ? <BookOpenIcon className="h-3.5 w-3.5" /> : <SpeakerWaveIcon className="h-3.5 w-3.5" />}
                  {lesson.skill}
                </span>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                  getLevelGradient(lesson.levelGroup)
                )}>
                  {lesson.levelGroup}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
                {lesson.title}
              </h1>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5 text-indigo-400" />
                  <span>{lesson.viewCount} lượt xem</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-indigo-400" />
                  <span>~10 phút đọc</span>
                </div>
              </div>
            </div>

            {/* 2. Cover Image (Nếu có)
            {lesson.coverImage && (
              <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-md">
                <img 
                  src={lesson.coverImage} 
                  alt={lesson.title} 
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            )} */}

            {/* 3. Content Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-10">

              {/* --- SUMMARY --- */}
              {lesson.summary && (
                <div className="mb-10 p-6 bg-slate-50/80 rounded-2xl border-l-4 border-indigo-500 text-slate-700 text-base leading-relaxed">
                  {lesson.summary}
                </div>
              )}
              {/* --- NỘI DUNG BÀI HỌC --- */}
              <div
                className="prose prose-lg prose-slate max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-6
                  prose-p:text-slate-600 prose-p:leading-8 prose-p:mb-6
                  prose-li:text-slate-600 prose-li:mb-3
                  prose-a:text-indigo-600 prose-a:font-semibold hover:prose-a:underline
                  prose-img:rounded-2xl prose-img:shadow-md prose-img:my-8
                  prose-strong:text-slate-900
                  prose-li:marker:text-indigo-500
                  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-md [&_iframe]:my-10"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>

          </div>

          {/* === SIDEBAR (Right - 4 Cols - Sticky) === */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* Info Box */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                Thông tin bài học
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm text-slate-500 font-medium">Trình độ</span>
                  <span className={clsx("px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                    getLevelGradient(lesson.levelGroup))}>
                    {lesson.levelGroup}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm text-slate-500 font-medium">Kỹ năng</span>
                  <span className={clsx("px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r uppercase tracking-wide flex items-center gap-2",
                    getSkillGradient(lesson.skill))}>
                    {lesson.skill.toUpperCase()}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button fullWidth onClick={() => navigate('/practice')} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                    Làm bài tập thực hành
                  </Button>
                </div>
              </div>
            </div>

            {/* Share / Tools */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Công cụ</h3>
              <div className="flex gap-2">
                <button className="flex-1 py-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium text-sm">
                  <BookmarkIcon className="h-5 w-5" /> Lưu bài
                </button>
                <button className="flex-1 py-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium text-sm">
                  <ShareIcon className="h-5 w-5" /> Chia sẻ
                </button>
              </div>
            </div>

            {/* Related Suggestion (Fake) */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] shadow-lg p-6 text-white text-center">
              <SparklesIcon className="h-10 w-10 mx-auto mb-3 text-yellow-300 animate-pulse" />
              <h3 className="font-bold text-lg mb-2">Đã học xong?</h3>
              <p className="text-indigo-100 text-sm mb-6">Thử sức ngay với các bài kiểm tra Mock Test để đánh giá năng lực!</p>
              <button
                onClick={() => navigate('/mock-test')}
                className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Thi thử ngay
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default LessonDetailPage;
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  EyeIcon,
  ClockIcon,
  ArrowRightIcon,
  XMarkIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { LessonSummary, PracticeLevelGroup, PracticeSkill } from '../../types';
import { getPublicLessons } from '../../services/api';
import Button from '../../components/ui/Button';

interface LessonPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LessonFilters {
  keyword: string;
  skill: PracticeSkill | '';
  levelGroup: PracticeLevelGroup | '';
}

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

const levelOptions: { value: PracticeLevelGroup | ''; label: string }[] = [
  { value: '', label: 'Tất cả trình độ' },
  { value: 'AV1-AV3', label: 'Cơ bản (AV1-AV3)' },
  { value: 'AV4-AV5', label: 'Trung cấp (AV4-AV5)' },
  { value: 'AV6', label: 'Nâng cao (AV6)' },
  { value: 'AV7', label: 'Chuyên sâu (AV7)' }
];

const LessonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [pagination, setPagination] = useState<LessonPagination>({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<LessonFilters>({ keyword: '', skill: '', levelGroup: '' });
  const [activeFilters, setActiveFilters] = useState<LessonFilters>({ keyword: '', skill: '', levelGroup: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const PAGE_SIZE = 6;

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPublicLessons({
        keyword: activeFilters.keyword || undefined,
        skill: activeFilters.skill || undefined,
        levelGroup: activeFilters.levelGroup || undefined,
        page: currentPage,
        limit: PAGE_SIZE
      });
      const payload = response.data;
      setLessons(payload?.items ?? []);
      setPagination(payload?.pagination || { page: currentPage, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    } catch (error: any) {
      console.error('Fetch lessons error:', error);
      toast.error(error.message || 'Không thể tải bài học.');
    } finally {
      setLoading(false);
    }
  }, [activeFilters, currentPage, PAGE_SIZE]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const handleSearch = () => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof LessonFilters, value: string) => {
    setFilters(prev => {
      const newState = { ...prev, [key]: value };
      if (key !== 'keyword') {
        setActiveFilters(newState);
        setCurrentPage(1);
      }
      return newState;
    });
  };

  return (
    <div className="min-h-screen font-sans pb-20">
      {/* --- HERO HEADER (Giống trang Ôn luyện) --- */}
      <div className="pt-10 pb-5 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 mb-6 animate-bounce">
            <BookOpenIcon className="h-4 w-4 text-indigo-400" />
            Thư viện kiến thức
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Kiến thức là <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              chìa khóa thành công
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8 items-start">

          {/* === SIDEBAR FILTERS (Sticky) === */}
          {/* Thêm nền kính mờ nhẹ cho Sidebar để dễ đọc hơn trên nền Gradient */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm" data-aos="fade-right">

            {/* Search */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-indigo-500" />
                Tìm kiếm
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Từ khóa..."
                  value={filters.keyword}
                  onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Skill Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-indigo-500" />
                Kỹ năng
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Tất cả kỹ năng' },
                  { value: 'reading', label: 'Reading' },
                  { value: 'listening', label: 'Listening' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilterChange('skill', opt.value)}
                    className={clsx(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                      filters.skill === opt.value
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm ring-1 ring-indigo-200"
                        : "bg-white text-slate-600 border-transparent hover:bg-white/80 hover:shadow-sm"
                    )}
                  >
                    {opt.label}
                    {filters.skill === opt.value && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-indigo-500" />
                Trình độ
              </h3>
              <div className="flex flex-col gap-2">
                {levelOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilterChange('levelGroup', opt.value)}
                    className={clsx(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                      filters.levelGroup === opt.value
                        ? "bg-purple-50 text-purple-700 border-purple-200 shadow-sm ring-1 ring-purple-200"
                        : "bg-white text-slate-600 border-transparent hover:bg-white/80 hover:shadow-sm"
                    )}
                  >
                    {opt.label}
                    {filters.levelGroup === opt.value && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {(filters.keyword || filters.skill || filters.levelGroup) && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setFilters({ keyword: '', skill: '', levelGroup: '' });
                  setActiveFilters({ keyword: '', skill: '', levelGroup: '' });
                  setCurrentPage(1);
                }}
                className="text-red-500 hover:text-red-500 hover:bg-red-50"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* === LESSON LIST (HORIZONTAL CARDS) === */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row bg-white/80 rounded-2xl border border-white/50 shadow-sm overflow-hidden h-auto md:h-56 animate-pulse">
                  <div className="w-full md:w-1/3 bg-slate-200" />
                  <div className="flex-1 p-6 space-y-4">
                    <div className="h-4 w-1/4 bg-slate-200 rounded" />
                    <div className="h-6 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-full bg-slate-200 rounded" />
                    <div className="h-4 w-full bg-slate-200 rounded" />
                  </div>
                </div>
              ))
            ) : lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  onClick={() => navigate(`/lessons/${lesson._id}`)}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative flex flex-col md:flex-row bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* --- Left: Image Section --- */}
                  <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                    {lesson.coverImage ? (
                      <img
                        src={lesson.coverImage}
                        alt={lesson.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                        <BookOpenIcon className="h-16 w-16 text-indigo-200" />
                      </div>
                    )}

                    {/* Badge: Skill (Đã dùng hàm màu chuẩn) */}
                    <div className="absolute top-3 left-3">
                      <span className={clsx(
                        "px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r uppercase tracking-wide flex items-center gap-2",
                        getSkillGradient(lesson.skill)
                      )}>
                        {lesson.skill}
                      </span>
                    </div>
                  </div>

                  {/* --- Right: Content Section --- */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {/* Meta Info: Level & Date */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Badge: Level (Đã dùng hàm màu chuẩn) */}
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                          getLevelGradient(lesson.levelGroup)
                        )}>
                          {lesson.levelGroup}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium ml-auto">
                          <CalendarDaysIcon className="h-3.5 w-3.5" />
                          <span>{new Date(lesson.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {lesson.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-sm text-slate-500 line-clamp-2 md:line-clamp-3 leading-relaxed">
                        {lesson.summary || 'Bài học chuyên sâu giúp nâng cao kỹ năng ngôn ngữ của bạn một cách hiệu quả...'}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <EyeIcon className="h-4 w-4 text-slate-400" />
                          {lesson.viewCount}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4 text-slate-400" />
                          10 phút
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-indigo-600 font-bold group-hover:underline">
                        Đọc tiếp <ArrowRightIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300">
                <BookOpenIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Không tìm thấy bài học nào</h3>
                <p className="text-slate-500 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé.</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setFilters({ keyword: '', skill: '', levelGroup: '' });
                    setActiveFilters({ keyword: '', skill: '', levelGroup: '' });
                    setCurrentPage(1);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pt-8 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Trước
                </Button>
                <div className="flex items-center px-4 bg-white/80 rounded-lg border border-slate-200 font-bold text-sm text-slate-700">
                  {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;
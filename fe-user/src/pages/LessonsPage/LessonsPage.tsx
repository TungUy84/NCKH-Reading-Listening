import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookOpen, Search, Target, Eye } from 'lucide-react';
import { LessonSummary, PracticeLevelGroup, PracticeSkill } from '../../types';
import { getPublicLessons } from '../../services/api';

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

const skillOptions: { value: PracticeSkill | ''; label: string }[] = [
  { value: '', label: 'Tất cả kỹ năng' },
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' }
];

const levelOptions: { value: PracticeLevelGroup | ''; label: string }[] = [
  { value: '', label: 'Tất cả trình độ' },
  { value: 'AV1-AV3', label: 'AV1 - AV3' },
  { value: 'AV4-AV5', label: 'AV4 - AV5' },
  { value: 'AV6', label: 'AV6' },
  { value: 'AV7', label: 'AV7' }
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

  // Hàm tải danh sách bài học từ API công khai
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
      const items = payload?.items ?? [];
      const paginationData = payload?.pagination;

      setLessons(items);
      setPagination(
        paginationData || {
          page: currentPage,
          limit: PAGE_SIZE,
          total: items.length,
          totalPages: 1
        }
      );
    } catch (error: any) {
      console.error('Fetch lessons error:', error);
      toast.error(error.message || 'Không thể tải bài học, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [activeFilters.keyword, activeFilters.levelGroup, activeFilters.skill, currentPage, PAGE_SIZE]);

  useEffect(() => {
    fetchLessons().catch((error) => console.error(error));
  }, [fetchLessons]);

  const skillLabel = useMemo(() => new Map(skillOptions.map((item) => [item.value, item.label])), []);
  const levelLabel = useMemo(() => new Map(levelOptions.map((item) => [item.value, item.label])), []);

  const handleNavigateDetail = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <div className="section-container py-16 lg:py-20">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1.5 text-sm font-medium text-white shadow-md">
            <BookOpen className="h-4 w-4" />
            Bộ sưu tập bài học
          </span>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Khám phá bài học theo <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">kỹ năng & trình độ</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Chọn bài học phù hợp để trau dồi kỹ năng Reading và Listening. Mỗi bài học được biên soạn chuyên sâu, dễ theo dõi với nội dung chất lượng.
          </p>
        </div>

        <div className="grid gap-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg sm:grid-cols-[2fr_1fr_1fr] sm:items-end">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Search className="h-4 w-4" />
              Tìm kiếm bài học
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="Nhập tiêu đề hoặc từ khóa..."
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <BookOpen className="h-4 w-4" />
              Kỹ năng
            </label>
            <select
              value={filters.skill}
              onChange={(event) => setFilters((prev) => ({ ...prev, skill: event.target.value as PracticeSkill | '' }))}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {skillOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Target className="h-4 w-4" />
              Trình độ
            </label>
            <select
              value={filters.levelGroup}
              onChange={(event) => setFilters((prev) => ({ ...prev, levelGroup: event.target.value as PracticeLevelGroup | '' }))}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {levelOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setCurrentPage(1);
                setActiveFilters({ ...filters });
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl sm:w-auto"
            >
              Lọc bài học
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <div className="h-48 w-full rounded-2xl bg-slate-200" />
                <div className="h-5 w-3/4 rounded-full bg-slate-200" />
                <div className="h-4 w-full rounded-full bg-slate-200" />
                <div className="h-4 w-2/3 rounded-full bg-slate-200" />
              </div>
            ))
          ) : lessons.length ? (
            lessons.map((lesson) => (
              <button
                key={lesson._id}
                type="button"
                onClick={() => handleNavigateDetail(lesson._id)}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-slate-100 bg-white text-left shadow-md transition hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200"
              >
                {lesson.coverImage ? (
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={lesson.coverImage}
                      alt={lesson.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
                    <span className="text-5xl font-black text-blue-600/30">{lesson.title ? lesson.title.slice(0, 2).toUpperCase() : 'BH'}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col space-y-4 p-6">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1.5 text-white shadow-md">
                      {skillLabel.get(lesson.skill) || 'Skill'}
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1.5 text-purple-700 shadow-sm">
                      {levelLabel.get(lesson.levelGroup) || lesson.levelGroup}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                    {lesson.title}
                  </h3>
                  <p className="line-clamp-3 flex-1 text-sm text-slate-600">
                    {lesson.summary || 'Bài học chưa có mô tả chi tiết.'}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span className="font-semibold">{lesson.viewCount}</span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                      Xem ngay →
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-16 text-center">
              <BookOpen className="mb-4 h-16 w-16 text-slate-300" />
              <p className="text-lg font-semibold text-slate-700">Không tìm thấy bài học nào</p>
              <p className="mt-2 text-sm text-slate-500">Hãy thử điều chỉnh bộ lọc hoặc quay lại sau nhé!</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5 text-sm text-slate-600 shadow-md sm:flex-row">
          <p className="font-medium">
            Hiển thị <span className="font-bold text-blue-600">{lessons.length}</span> / <span className="font-bold text-slate-800">{pagination.total ?? lessons.length}</span> bài học
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (pagination.page > 1 && !loading) {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                }
              }}
              disabled={pagination.page <= 1 || loading}
              className="rounded-full border-2 border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Trước
            </button>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700">
              {pagination.page}/{pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                if (pagination.page < pagination.totalPages && !loading) {
                  setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1));
                }
              }}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="rounded-full border-2 border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;

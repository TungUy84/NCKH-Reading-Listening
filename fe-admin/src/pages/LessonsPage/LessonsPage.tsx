import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Lesson, LessonListResult, LessonQueryParams, PracticeLevelGroup, PracticeSkill } from '../../types';
import { LessonAPI, RoadmapAPI } from '../../services/api';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SKILL_OPTIONS: { value: PracticeSkill; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' }
];

const LEVEL_OPTIONS: { value: PracticeLevelGroup; label: string }[] = [
  { value: 'AV1-AV3', label: 'AV1 - AV3' },
  { value: 'AV4-AV5', label: 'AV4 - AV5' },
  { value: 'AV6', label: 'AV6' },
  { value: 'AV7', label: 'AV7' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang kích hoạt' },
  { value: 'inactive', label: 'Chưa kích hoạt' }
];

const LessonsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<Omit<LessonQueryParams, 'page' | 'limit'>>({ keyword: '', skill: '', levelGroup: '', status: '' });
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm tải danh sách bài học dựa trên bộ lọc hiện tại
  const fetchLessons = useCallback(async (page = pagination.page) => {
    setLoading(true);
    try {
      const params: LessonQueryParams = {
        page,
        limit: pagination.limit,
        keyword: filters.keyword,
        skill: filters.skill,
        levelGroup: filters.levelGroup,
        status: filters.status
      };
      const result: LessonListResult = await LessonAPI.getLessons(params);
      setLessons(result.items);
      setPagination(result.pagination);
    } catch (error: any) {
      console.error('Fetch lessons error:', error);
      toast.error(error.message || 'Không thể tải danh sách bài học');
    } finally {
      setLoading(false);
    }
  }, [filters.keyword, filters.levelGroup, filters.skill, filters.status, pagination.limit]);

  useEffect(() => {
    fetchLessons(1).catch((error) => {
      console.error(error);
    });
  }, [filters.keyword, filters.levelGroup, filters.skill, filters.status, fetchLessons]);

  // Hàm xóa bài học với xác nhận từ người dùng
  const handleDelete = async (lessonId: string) => {
    try {
      // Check roadmap usage first
      const usageCheck = await RoadmapAPI.checkLessonUsageInRoadmap(lessonId);
      
      let confirmText = 'Điều này không thể hoàn tác!';
      let htmlContent = undefined;
      
      if (usageCheck.isUsed && usageCheck.roadmaps.length > 0) {
        const roadmapList = usageCheck.roadmaps
          .map(r => `<li><strong>${r.levelGroup}</strong>: ${r.title}</li>`)
          .join('');
        htmlContent = `
          <div style="text-align: left; margin: 1rem 0;">
            <p style="margin-bottom: 0.5rem;">⚠️ <strong>Bài học này đang được sử dụng trong các lộ trình:</strong></p>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">${roadmapList}</ul>
            <p style="margin-top: 0.5rem; color: #dc2626;">
              Nếu xóa, bài học sẽ bị gỡ khỏi các lộ trình trên.
            </p>
          </div>
        `;
      }

      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa bài học này?',
        text: htmlContent ? undefined : confirmText,
        html: htmlContent,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
      });

      if (!result.isConfirmed) return;

      await LessonAPI.deleteLesson(lessonId);
      toast.success('Đã xóa bài học');
      const shouldReloadCurrentPage = lessons.length > 1 || pagination.page === 1;
      await fetchLessons(shouldReloadCurrentPage ? pagination.page : Math.max(1, pagination.page - 1));
    } catch (error: any) {
      console.error('Delete lesson error:', error);
      toast.error(error.message || 'Không thể xóa bài học');
    }
  };

  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeBadge = useCallback((lesson: Lesson) => {
    if (lesson.isActive) {
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Đang kích hoạt</span>;
    }
    return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Chưa kích hoạt</span>;
  }, []);

  const skillLabel = useMemo(() => new Map(SKILL_OPTIONS.map((item) => [item.value, item.label])), []);

  const levelLabel = useMemo(() => new Map(LEVEL_OPTIONS.map((item) => [item.value, item.label])), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý bài học</h1>
        <p className="text-sm text-slate-500">Tạo, chỉnh sửa và theo dõi nội dung bài học cho học viên.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-slate-700">Từ khóa</label>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc mô tả"
            value={filters.keyword || ''}
            onChange={(event) => handleFilterChange('keyword', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Kỹ năng</label>
            <select
              value={filters.skill || ''}
              onChange={(event) => handleFilterChange('skill', event.target.value as PracticeSkill | '')}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Tất cả</option>
              {SKILL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Trình độ</label>
            <select
              value={filters.levelGroup || ''}
              onChange={(event) => handleFilterChange('levelGroup', event.target.value as PracticeLevelGroup | '')}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Tất cả</option>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={filters.status || ''}
              onChange={(event) => handleFilterChange('status', event.target.value as 'active' | 'inactive' | '')}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/lessons/create')}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all hover:bg-indigo-700"
          >
            + Tạo bài học
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Bài học</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Kỹ năng</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trình độ</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Lượt xem</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : lessons.length ? (
                lessons.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-slate-50/60 transition">
                    <td className="max-w-md px-6 py-4">
                      <div className="space-y-1">
                        <p className="truncate text-sm font-semibold text-slate-900" title={lesson.title}>{lesson.title}</p>
                        <p className="line-clamp-2 text-xs text-slate-500">{lesson.summary || 'Chưa có mô tả ngắn'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {skillLabel.get(lesson.skill) || lesson.skill}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        {levelLabel.get(lesson.levelGroup) || lesson.levelGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">
                      <span className="font-medium">{lesson.viewCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center">{activeBadge(lesson)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/lessons/${lesson._id}`)}
                          className="rounded-lg border border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-all"
                        >
                          Xem
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/lessons/edit/${lesson._id}`)}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 hover:shadow-md transition-all"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(lesson._id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 hover:shadow-md transition-all"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    Không tìm thấy bài học nào. Hãy tạo bài học đầu tiên!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600 md:flex-row">
          <p>
            Hiển thị {lessons.length} / {pagination.total} bài học
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchLessons(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trước
            </button>
            <span className="text-xs font-medium text-slate-500">Trang {pagination.page}/{pagination.totalPages}</span>
            <button
              type="button"
              onClick={() => fetchLessons(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsListPage;

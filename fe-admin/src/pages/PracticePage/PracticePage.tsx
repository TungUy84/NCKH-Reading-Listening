import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FiEye, FiEdit2, FiTrash2, FiRefreshCw, FiUploadCloud } from 'react-icons/fi';
import { PracticeAPI } from '../../services/api';
import { Practice, PracticeLevelGroup, PracticeQueryParams, PracticeSkill } from '../../types';

const PAGE_SIZE = 10;

const SKILL_LABEL: Record<PracticeSkill, string> = {
  reading: 'Reading',
  listening: 'Listening',
};

const LEVEL_LABEL: Record<PracticeLevelGroup, string> = {
  'AV1-AV3': 'AV1 - AV3',
  'AV4-AV5': 'AV4 - AV5',
  AV6: 'AV6',
  AV7: 'AV7',
};

const STATUS_LABEL = (isActive: boolean) => (isActive ? 'Hoạt động' : 'Tạm ẩn');

// Quản lý danh sách bài ôn luyện kỹ năng
const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Practice[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [skill, setSkill] = useState<PracticeSkill | ''>('');
  const [levelGroup, setLevelGroup] = useState<PracticeLevelGroup | ''>('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeOnPage = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const load = async () => {
    try {
      setLoading(true);
      const params: PracticeQueryParams = {
        page,
        limit: PAGE_SIZE,
      };

      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (skill) params.skill = skill;
      if (levelGroup) params.levelGroup = levelGroup;
      if (status) params.status = status;

      const response = await PracticeAPI.getPractices(params);
      setItems(response.items);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Không thể tải danh sách ôn luyện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, skill, levelGroup, status]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedKeyword, skill, levelGroup, status]);

  const clearFilters = () => {
    setKeyword('');
    setSkill('');
    setLevelGroup('');
    setStatus('');
    setPage(1);
    load();
  };

  const handleToggleStatus = async (practice: Practice) => {
    if (togglingId) return;
    const nextStatus = !practice.isActive;
    setTogglingId(practice._id);
    setItems((prev) => prev.map((item) => (item._id === practice._id ? { ...item, isActive: nextStatus } : item)));
    try {
      await PracticeAPI.updatePractice(practice._id, { isActive: nextStatus });
      toast.success('Đã cập nhật trạng thái bài ôn luyện');
    } catch (error: any) {
      setItems((prev) => prev.map((item) => (item._id === practice._id ? { ...item, isActive: practice.isActive } : item)));
      toast.error(error.message || 'Không thể cập nhật trạng thái bài ôn luyện');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (practice: Practice) => {
    const result = await Swal.fire({
      title: 'Xóa bài ôn luyện?',
      text: `Bạn sắp xóa "${practice.title}" khỏi hệ thống.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(practice._id);
      await PracticeAPI.deletePractice(practice._id);
      toast.success('Đã xóa bài ôn luyện');
      const nextCount = items.length - 1;
      if (nextCount === 0 && page > 1) {
        setPage(page - 1);
      } else {
        load();
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa bài ôn luyện');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (practice: Practice) => {
    navigate(`/admin/practice/${practice._id}/view`);
  };

  const handleEdit = (practice: Practice) => {
    navigate(`/admin/practice/${practice._id}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bài ôn luyện</h1>
          <p className="text-slate-500">Quản lý các bài ôn luyện kỹ năng nghe và đọc.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-100"
          >
            {React.createElement(FiRefreshCw as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
            Tải lại
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/practice/import')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            {React.createElement(FiUploadCloud as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
            Import từ file
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/practice/create')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Tạo bài ôn luyện
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Tổng số bài</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Hoạt động (trang hiện tại)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{activeOnPage}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Đang xem trang</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{page}/{totalPages}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="px-3 py-2 border rounded-lg"
          placeholder="Tìm kiếm theo tiêu đề..."
        />
        <select
          value={skill}
          onChange={(event) => setSkill(event.target.value as PracticeSkill | '')}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả kỹ năng</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
        </select>
        <select
          value={levelGroup}
          onChange={(event) => setLevelGroup(event.target.value as PracticeLevelGroup | '')}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả nhóm level</option>
          <option value="AV1-AV3">AV1 - AV3</option>
          <option value="AV4-AV5">AV4 - AV5</option>
          <option value="AV6">AV6</option>
          <option value="AV7">AV7</option>
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as 'active' | 'inactive' | '')}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm ẩn</option>
        </select>
        <button
          type="button"
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg border hover:bg-slate-100"
        >
          Xóa lọc
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="text-left p-3 font-medium">Tiêu đề</th>
                <th className="text-left p-3 font-medium">Kỹ năng</th>
                <th className="text-left p-3 font-medium">Level</th>
                <th className="text-left p-3 font-medium">Thời lượng</th>
                <th className="text-center p-3 font-medium">Câu hỏi</th>
                <th className="text-center p-3 font-medium">Trạng thái</th>
                <th className="text-right p-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="relative">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-0">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
                      </div>
                      <p className="text-sm text-slate-600">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">Chưa có bài ôn luyện nào</td>
                </tr>
              ) : (
                items.map((practice) => {
                  const questionsCount = practice.totalQuestions ?? practice.questions?.length ?? 0;
                  return (
                    <tr key={practice._id} className="border-t hover:bg-slate-50/60">
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{practice.title}</div>
                        <div className="text-xs text-slate-500">Cập nhật: {new Date(practice.updatedAt).toLocaleString()}</div>
                      </td>
                      <td className="p-3">{SKILL_LABEL[practice.skill]}</td>
                      <td className="p-3">{LEVEL_LABEL[practice.levelGroup]}</td>
                      <td className="p-3">{practice.estimatedTime ? `${practice.estimatedTime} phút` : '—'}</td>
                      <td className="p-3 text-center">
                        <div className="text-sm font-semibold text-slate-700">{questionsCount}</div>
                        <div className="text-xs text-slate-500">{practice.sections?.length || 0} phần</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            aria-pressed={practice.isActive}
                            disabled={togglingId === practice._id}
                            onClick={() => handleToggleStatus(practice)}
                            title={STATUS_LABEL(practice.isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              practice.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            } ${togglingId === practice._id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                practice.isActive ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${practice.isActive ? 'text-emerald-700' : 'text-slate-600'} w-24 text-left`}>
                            {STATUS_LABEL(practice.isActive)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleView(practice)}
                            title="Xem"
                            aria-label="Xem"
                            className="p-2 rounded-lg border text-slate-700 hover:bg-slate-50"
                          >
                            {React.createElement(FiEye as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                          </button>
                          <button
                            onClick={() => handleEdit(practice)}
                            title="Sửa"
                            aria-label="Sửa"
                            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          >
                            {React.createElement(FiEdit2 as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                          </button>
                          <button
                            onClick={() => handleDelete(practice)}
                            title="Xóa"
                            aria-label="Xóa"
                            disabled={deletingId === practice._id}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {React.createElement(FiTrash2 as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t text-sm">
          <div className="text-slate-500">Tổng: {total}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
            >
              Trước
            </button>
            <span>Trang {page}/{totalPages}</span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;

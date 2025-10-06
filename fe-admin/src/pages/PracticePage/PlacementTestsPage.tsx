import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest } from '../../types';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PAGE_SIZE = 10;

const categoryLabel: Record<string, string> = {
  reading: 'Reading',
  listening: 'Listening',
  general: 'General',
};

const statusLabel = (isActive: boolean) => (isActive ? 'Hoạt động' : 'Tạm ẩn');

const PlacementTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await PlacementTestAPI.getTests({
        page,
        limit: PAGE_SIZE,
        category: category || undefined,
        search: debouncedSearch || undefined,
        status: status as any,
      });
      setTests(res.data || []);
  setTotal(res.pagination?.totalItems || (res.data?.length ?? 0));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input to avoid calling API on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Auto-load whenever page, filters, or debounced search change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, status, debouncedSearch]);

  // Reset to first page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [category, status, debouncedSearch]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPage(1);
    load();
  };

  const onToggleStatus = async (test: PlacementTest) => {
    if (togglingId) return; // prevent parallel toggles
    setTogglingId(test._id);
    // Optimistic update for snappy UI
    setTests((prev) => prev.map((x) => (x._id === test._id ? { ...x, isActive: !x.isActive } : x)));
    try {
      await PlacementTestAPI.updateTestInfo(test._id, { isActive: !test.isActive });
      toast.success('Đã cập nhật trạng thái');
    } catch (err: any) {
      // Revert optimistic change on error
      setTests((prev) => prev.map((x) => (x._id === test._id ? { ...x, isActive: test.isActive } : x)));
      toast.error(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setTogglingId(null);
    }
  };

  const remove = async (test: PlacementTest) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: `Bài test: ${test.title}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: false,
    });
    if (!result.isConfirmed) return;
    try {
      await PlacementTestAPI.deleteTest(test._id);
      toast.success('Đã xóa');
      const newCount = tests.length - 1;
      if (newCount === 0 && page > 1) setPage(page - 1);
      else load();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Kiểm tra đầu vào</h1>
          <p className="text-slate-500">Danh sách bài test</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/placement-tests/import')}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
          >
            Import từ Word
          </button>
          <button
            onClick={() => navigate('/admin/placement-tests/create')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Tạo bài test
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg"
          placeholder="Tìm kiếm theo tiêu đề..."
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả loại</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
          <option value="general">General</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm ẩn</option>
        </select>
        <div className="flex gap-2">
          <button type="button" onClick={clearFilters} className="px-4 py-2 rounded-lg border">Xóa lọc</button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="text-left p-3 font-medium">Tiêu đề</th>
                <th className="text-left p-3 font-medium">Loại</th>
                <th className="text-left p-3 font-medium">Thời gian</th>
                <th className="text-left p-3 font-medium">Số phần</th>
                <th className="text-left p-3 font-medium">Câu hỏi</th>
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
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-sm text-slate-600">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && tests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">Chưa có bài test</td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t._id} className="border-t hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{t.title}</div>
                      <div className="text-xs text-slate-500">Cập nhật: {new Date(t.updatedAt).toLocaleString()}</div>
                    </td>
                    <td className="p-3">{categoryLabel[t.category] || t.category}</td>
                    <td className="p-3">{t.timeLimit} phút</td>
                    <td className="p-3">{Array.isArray(t.sections) ? t.sections.length : ((t as any).totalSections ?? 0)}</td>
                    <td className="p-3">{t.totalQuestions}</td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <button
                          type="button"
                          aria-pressed={t.isActive}
                          disabled={togglingId === t._id}
                          onClick={() => onToggleStatus(t)}
                          title={t.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${t.isActive ? 'bg-green-500' : 'bg-slate-300'}
                            ${togglingId === t._id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
                              ${t.isActive ? 'translate-x-5' : 'translate-x-1'}`}
                          />
                        </button>
                        <span className={`text-xs font-medium ${t.isActive ? 'text-green-700' : 'text-slate-600'} w-24 text-left`}>
                          {statusLabel(t.isActive)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/admin/placement-tests/${t._id}/view`)}
                          title="Xem"
                          aria-label="Xem"
                          className="p-2 rounded-lg border text-slate-700 hover:bg-slate-50"
                        >
                          {React.createElement(FiEye as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/placement-tests/${t._id}/edit`)}
                          title="Sửa"
                          aria-label="Sửa"
                          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {React.createElement(FiEdit2 as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                        </button>
                        <button
                          onClick={() => remove(t)}
                          title="Xóa"
                          aria-label="Xóa"
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          {React.createElement(FiTrash2 as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t text-sm">
          <div className="text-slate-500">Tổng: {total}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
            >Trước</button>
            <span>Trang {page}/{totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-lg border disabled:opacity-50"
            >Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementTestsPage;

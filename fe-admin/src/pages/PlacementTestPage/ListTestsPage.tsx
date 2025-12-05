import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import type { PlacementTest } from '../../types';
import { PlacementTestAPI, RoadmapAPI } from '../../services/api';
import { FiEye, FiEdit2, FiTrash2, FiTarget, FiFileText, FiCheckCircle } from 'react-icons/fi';

const PAGE_SIZE = 10;

const categoryLabel: Record<string, string> = {
  reading: 'Reading',
  listening: 'Listening',
};

const testTypeLabel: Record<string, string> = {
  placement: 'Kiểm tra đầu vào',
  'mock-exam': 'Thi thử',
  checkpoint: 'Kiểm tra chặng',
};

const statusLabel = (isActive: boolean) => (isActive ? 'Hoạt động' : 'Tạm ẩn');

// Trang quản lý danh sách bài kiểm tra đầu vào
const PlacementTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [testType, setTestType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  // Lấy dữ liệu bài test theo trang và bộ lọc hiện tại
  const load = async () => {
    try {
      setLoading(true);
      const res = await PlacementTestAPI.getTests({
        page,
        limit: PAGE_SIZE,
        category: category || undefined,
        testType: testType || undefined,
        search: debouncedSearch || undefined,
        status: (status as 'active' | 'inactive' | undefined) || undefined,
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

  // Độ trễ mỗi khi người dùng gõ tìm kiếm
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
  }, [page, category, testType, status, debouncedSearch]);

  // Reset to first page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [category, testType, status, debouncedSearch]);

  // Đưa bộ lọc về trạng thái ban đầu và tải lại dữ liệu
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setTestType('');
    setStatus('');
    setPage(1);
    load();
  };

  // Bật/tắt trạng thái hoạt động của từng bài test
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

  // Xác nhận trước khi xóa hẳn bài test khỏi hệ thống
  const remove = async (test: PlacementTest) => {
    try {
      // Kiểm tra xem test có trong roadmap không
      const usageCheck = await RoadmapAPI.checkTestUsageInRoadmap(test._id);
      
      let confirmText = `Bài test: ${test.title}`;
      let warningHtml = '';
      
      if (usageCheck.isUsed && usageCheck.roadmaps.length > 0) {
        const roadmapList = usageCheck.roadmaps
          .map(r => `<li><strong>${r.levelGroup}</strong>: ${r.title}</li>`)
          .join('');
        
        warningHtml = `
          <div class="text-left mb-3">
            <p class="text-red-600 font-semibold mb-2">⚠️ Bài test này đang được sử dụng trong roadmap:</p>
            <ul class="list-disc pl-5 text-sm">${roadmapList}</ul>
            <p class="text-gray-600 text-sm mt-3">Nếu xóa, checkpoint test sẽ bị gỡ khỏi các roadmap trên.</p>
          </div>
        `;
      }

      const result = await Swal.fire({
        title: 'Bạn có chắc muốn xóa?',
        html: warningHtml || confirmText,
        icon: usageCheck.isUsed ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        reverseButtons: false,
      });
      
      if (!result.isConfirmed) return;
      
      await PlacementTestAPI.deleteTest(test._id);
      toast.success(usageCheck.isUsed ? 'Đã xóa và gỡ khỏi roadmap' : 'Đã xóa');
      
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
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Tạo bộ đề thi</h1>
          <p className="text-slate-500">Danh sách bài test</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/placement-tests/import')}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
          >
            Import
          </button>
          <button
            onClick={() => navigate('/admin/placement-tests/create')}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            + Tạo bài test
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
          <option value="">Tất cả kỹ năng</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
        </select>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả mục đích</option>
          <option value="placement">Kiểm tra đầu vào</option>
          <option value="mock-exam">Thi thử</option>
          <option value="checkpoint">Kiểm tra chặng</option>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Tiêu đề</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Kỹ năng</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Loại bài</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Thời gian</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Số phần</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Câu hỏi</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="relative">
              {loading && (
                <tr>
                  <td colSpan={8} className="p-0">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-sm text-slate-600">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && tests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">Chưa có bài test</td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t._id} className="border-t hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{t.title}</div>
                      <div className="text-xs text-slate-500">Cập nhật: {new Date(t.updatedAt).toLocaleString()}</div>
                    </td>
                    <td className="p-3 text-center">{categoryLabel[t.category] || t.category}</td>
                    <td className="p-3">
                      <select
                        value={t.testType || 'placement'}
                        onChange={async (e) => {
                          const newType = e.target.value as 'placement' | 'mock-exam' | 'checkpoint';
                          try {
                            await PlacementTestAPI.updateTestInfo(t._id, { testType: newType });
                            setTests(prev => prev.map(test => 
                              test._id === t._id ? { ...test, testType: newType } : test
                            ));
                            toast.success('Đã cập nhật loại bài');
                          } catch (err: any) {
                            toast.error(err.message || 'Không thể cập nhật');
                          }
                        }}
                        className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="placement">Kiểm tra đầu vào</option>
                        <option value="mock-exam">Thi thử</option>
                        <option value="checkpoint">Kiểm tra chặng</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">{t.timeLimit} phút</td>
                    <td className="p-3 text-center">{Array.isArray(t.sections) ? t.sections.length : ((t as any).totalSections ?? 0)}</td>
                    <td className="p-3 text-center">{t.totalQuestions}</td>
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
                          className="p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all"
                        >
                          {React.createElement(FiEye as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/placement-tests/${t._id}/edit`)}
                          title="Sửa"
                          aria-label="Sửa"
                          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all"
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

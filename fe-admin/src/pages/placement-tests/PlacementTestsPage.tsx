import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlacementTestAPI } from '../../services/api';
import { PlacementTest } from '../../types';

const PAGE_SIZE = 10;

const categoryLabel: Record<string, string> = {
  reading: 'Reading',
  listening: 'Listening',
  general: 'General',
};

const statusLabel = (isActive: boolean) => (isActive ? 'Đang hoạt động' : 'Tạm ẩn');

const PlacementTestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await PlacementTestAPI.getTests({
        page,
        limit: PAGE_SIZE,
        category: category || undefined,
        search: search || undefined,
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPage(1);
    load();
  };

  const toggleStatus = async (test: PlacementTest) => {
    try {
      await PlacementTestAPI.updateTestInfo(test._id, { isActive: !test.isActive });
      toast.success('Đã cập nhật trạng thái');
      load();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const remove = async (test: PlacementTest) => {
    if (!window.confirm(`Xóa bài test "${test.title}"?`)) return;
    try {
      await PlacementTestAPI.deleteTest(test._id);
      toast.success('Đã xóa');
      // reload current page; if empty, go to previous
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
            onClick={() => toast.info('Chức năng tạo mới sẽ được bổ sung')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Tạo bài test
          </button>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          <button type="submit" className="px-4 py-2 rounded-lg bg-slate-800 text-white">Lọc</button>
          <button type="button" onClick={clearFilters} className="px-4 py-2 rounded-lg border">Xóa lọc</button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="text-left p-3 font-medium">Tiêu đề</th>
                <th className="text-left p-3 font-medium">Loại</th>
                <th className="text-left p-3 font-medium">Thời gian</th>
                <th className="text-left p-3 font-medium">Câu hỏi</th>
                <th className="text-left p-3 font-medium">Trạng thái</th>
                <th className="text-right p-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">Chưa có bài test</td>
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
                    <td className="p-3">{t.totalQuestions}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleStatus(t)}
                        className={`px-2 py-1 rounded-full text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                        title="Bấm để đổi trạng thái"
                      >
                        {statusLabel(t.isActive)}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/admin/placement-tests/${t._id}/view`)}
                          className="px-3 py-1 rounded-lg border text-slate-700 hover:bg-slate-50"
                        >Xem</button>
                        <button
                          onClick={() => navigate(`/admin/placement-tests/${t._id}/edit`)}
                          className="px-3 py-1 rounded-lg border text-slate-700 hover:bg-slate-50"
                        >Sửa</button>
                        <button
                          onClick={() => remove(t)}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >Xóa</button>
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

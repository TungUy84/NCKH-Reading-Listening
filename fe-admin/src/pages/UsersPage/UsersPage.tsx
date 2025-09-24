import React, { useEffect, useMemo, useState } from 'react';
import { AdminUser, UserQueryParams, UsersListResult } from '../../types';
import { deleteUser, getUserStats, getUsers, toggleUserStatus, updateUserRole } from '../../services/api';
import { toast } from 'react-toastify';

const Badge: React.FC<{ color: 'green' | 'red' | 'indigo'; children: React.ReactNode }> = ({ color, children }) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
};

const UsersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersListResult['pagination']>();
  const [query, setQuery] = useState<UserQueryParams>({ page: 1, limit: 10 });
  const [stats, setStats] = useState<{ totalUsers: number; activeUsers: number; inactiveUsers: number; adminUsers: number; regularUsers: number; newUsersLast30Days: number }>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getUsers(query),
        getUserStats(),
      ]);
      setUsers(listRes.users);
      setPagination(listRes.pagination);
      setStats(statsRes);
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.limit, query.search, query.role, query.isActive]);

  const onToggleStatus = async (u: AdminUser) => {
    try {
      await toggleUserStatus(u._id);
      toast.success(u.isActive ? 'Đã vô hiệu hóa người dùng' : 'Đã kích hoạt người dùng');
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onChangeRole = async (u: AdminUser, role: 'admin' | 'user') => {
    try {
      await updateUserRole(u._id, role);
      toast.success('Cập nhật quyền thành công');
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onDelete = async (u: AdminUser) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await deleteUser(u._id);
      toast.success('Đã xóa người dùng');
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = useMemo(() => Math.max(1, pagination?.pages || 1), [pagination]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Quản lý người dùng</h1>
      </div>

      {/* Stats */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
          <div className="text-slate-500 text-sm">Tổng</div>
          <div className="text-2xl font-semibold">{stats?.totalUsers ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
          <div className="text-slate-500 text-sm">Hoạt động</div>
          <div className="text-2xl font-semibold text-green-600">{stats?.activeUsers ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
          <div className="text-slate-500 text-sm">Vô hiệu</div>
          <div className="text-2xl font-semibold text-red-600">{stats?.inactiveUsers ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
          <div className="text-slate-500 text-sm">Admin</div>
          <div className="text-2xl font-semibold">{stats?.adminUsers ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
          <div className="text-slate-500 text-sm">User</div>
          <div className="text-2xl font-semibold">{stats?.regularUsers ?? '-'}</div>
        </div>
        {/* Removed '30 ngày qua' card for cleaner header */}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow border border-slate-100 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 flex gap-3">
          <input
            value={query.search || ''}
            onChange={(e) => setQuery((q) => ({ ...q, page: 1, search: e.target.value }))}
            placeholder="Tìm theo tên, email, MSSV, username..."
            className="w-full md:w-80 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={(query.role as string) || ''}
            onChange={(e) => setQuery((q) => ({ ...q, page: 1, role: (e.target.value || '') as any }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            value={(query.isActive as any) ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setQuery((q) => ({ ...q, page: 1, isActive: v === '' ? '' : v === 'true' }));
            }}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Vô hiệu</option>
          </select>
        </div>
      </div>

      {/* Table (aligned with PlacementTestsPage) */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Người dùng</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Thông tin</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Quyền</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Hành động</th>
            </tr>
            </thead>
            <tbody className="relative">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-0">
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
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">Không có người dùng</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-slate-50/60">
                    <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((u.firstName || '') + ' ' + (u.lastName || ''))} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-slate-800">{u.firstName || ''} {u.lastName || ''}</div>
                        <div className="text-xs text-slate-500">@{u.username || '-'}</div>
                      </div>
                    </div>
                    </td>
                    <td className="p-3 text-sm text-slate-600">
                    <div>{u.email}</div>
                    <div className="text-xs text-slate-400">Tạo: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</div>
                    </td>
                    <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge color={u.role === 'admin' ? 'indigo' : 'green'}>{u.role}</Badge>
                      <select
                        value={u.role}
                        onChange={(e) => onChangeRole(u, e.target.value as any)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="admin">admin</option>
                        <option value="user">user</option>
                      </select>
                    </div>
                    </td>
                    <td className="p-3">
                    {u.isActive ? <Badge color="green">Hoạt động</Badge> : <Badge color="red">Vô hiệu</Badge>}
                    </td>
                    <td className="p-3 text-right text-sm">
                    <div className="inline-flex gap-2">
                      <button onClick={() => onToggleStatus(u)} className={`px-3 py-1 rounded-lg border ${u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {u.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                        <button onClick={() => onDelete(u)} className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700">Xóa</button>
                    </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (match PlacementTestsPage style) */}
      <div className="flex items-center justify-end p-3 border-t text-sm">
        <div className="flex items-center gap-2">
          <button
            disabled={(query.page || 1) <= 1}
            onClick={() => setQuery((q) => ({ ...q, page: Math.max(1, (q.page || 1) - 1) }))}
            className="px-3 py-1 rounded-lg border disabled:opacity-50"
          >Trước</button>
          <span>Trang {pagination?.page ?? query.page ?? 1}/{totalPages}</span>
          <button
            disabled={(query.page || 1) >= totalPages}
            onClick={() => setQuery((q) => ({ ...q, page: Math.min(totalPages, (q.page || 1) + 1) }))}
            className="px-3 py-1 rounded-lg border disabled:opacity-50"
          >Sau</button>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

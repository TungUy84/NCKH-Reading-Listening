import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminUser, UserQueryParams, UsersListResult } from '../../types';
import { deleteUser, getUserById, getUserStats, getUsers, toggleUserStatus, updateUserRole } from '../../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

// Helpers
const placeholder = 'Chưa có';
const formatDate = (v?: string | number | Date): string => (v ? new Date(v).toLocaleDateString('vi-VN') : placeholder);
const formatDateTime = (v?: string | number | Date): string => (v ? new Date(v).toLocaleString('vi-VN', { hour12: false }) : placeholder);
const showOrPlaceholder = (v?: string | null): string => (v && v.trim() !== '' ? v : placeholder);

// Trang liệt kê và quản trị tài khoản người dùng
const UsersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersListResult['pagination']>();
  const [query, setQuery] = useState<UserQueryParams>({ page: 1, limit: 10 });
  const [stats, setStats] = useState<{ totalUsers: number; activeUsers: number; inactiveUsers: number; adminUsers: number; regularUsers: number; newUsersLast30Days: number }>();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<{ open: boolean; user?: AdminUser; loading?: boolean }>({ open: false });
  const navigate = useNavigate();

  // Lấy danh sách người dùng kèm thống kê tổng quan
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
  // Mở modal xem chi tiết người dùng
  const openView = async (userId: string) => {
    try {
      setViewing({ open: true, loading: true });
      const user = await getUserById(userId);
      setViewing({ open: true, user, loading: false });
    } catch (e: any) {
      setViewing({ open: false });
      toast.error(e.message || 'Không thể xem thông tin người dùng');
    }
  };

  const closeView = () => setViewing({ open: false });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.limit, query.search, query.role, query.isActive]);

  // Đổi trạng thái hoạt động của người dùng
  const onToggleStatus = async (u: AdminUser) => {
    try {
      setTogglingId(u._id);
      await toggleUserStatus(u._id, !u.isActive);
      toast.success(u.isActive ? 'Đã vô hiệu hóa người dùng' : 'Đã kích hoạt người dùng');
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  // Cập nhật quyền người dùng ngay trên bảng
  const onChangeRole = async (u: AdminUser, role: 'admin' | 'user') => {
    try {
      await updateUserRole(u._id, role);
      toast.success('Cập nhật quyền thành công');
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Xác nhận và xóa hẳn người dùng khỏi hệ thống
  const onDelete = async (u: AdminUser) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: u.email || `@${u.username || ''}`,
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
      await deleteUser(u._id);
      toast.success('Đã xóa người dùng');
      const newCount = users.length - 1;
      const currentPage = query.page || 1;
      if (newCount === 0 && currentPage > 1) {
        setQuery((q) => ({ ...q, page: currentPage - 1 }));
      } else {
        fetchData();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = useMemo(() => Math.max(1, pagination?.pages || 1), [pagination]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý người dùng</h1>
          <Link to="/admin/users/create" className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">+ Tạo người dùng</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Tổng */}
          <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
            <div className="text-slate-500 text-sm">Tổng</div>
            <div className="text-2xl font-semibold">{stats?.totalUsers ?? '-'}</div>
          </div>
          {/* Admin */}
          <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
            <div className="text-slate-500 text-sm">Admin</div>
            <div className="text-2xl font-semibold">{stats?.adminUsers ?? '-'}</div>
          </div>
          {/* User */}
          <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
            <div className="text-slate-500 text-sm">User</div>
            <div className="text-2xl font-semibold">{stats?.regularUsers ?? '-'}</div>
          </div>
          {/* Hoạt động (move to end) */}
          <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
            <div className="text-slate-500 text-sm">Hoạt động</div>
            <div className="text-2xl font-semibold text-green-600">{stats?.activeUsers ?? '-'}</div>
          </div>
          {/* Vô hiệu (move to end) */}
          <div className="p-4 bg-white rounded-xl shadow border border-slate-100">
            <div className="text-slate-500 text-sm">Vô hiệu</div>
            <div className="text-2xl font-semibold text-red-600">{stats?.inactiveUsers ?? '-'}</div>
          </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Họ tên</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tài khoản</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Thông tin</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Quyền</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="relative">
                {loading && (
                  <tr>
                    <td colSpan={7} className="p-0">
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
                {!loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">Không có người dùng</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-t hover:bg-slate-50/60">
                      {/* Họ tên */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((u.firstName || '') + ' ' + (u.lastName || ''))} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <div className="font-medium text-slate-800">{u.firstName || ''} {u.lastName || ''}</div>
                          </div>
                        </div>
                      </td>
                      {/* Tài khoản */}
                      <td className="p-3 text-sm text-slate-600">@{u.username || '-'}</td>
                      <td className="p-3 text-sm text-slate-600">
                        <div>{u.email}</div>
                        <div className="text-xs text-slate-400">Tạo: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</div>
                      </td>
                      {/* Số điện thoại */}
                      <td className="p-3 text-sm text-slate-600">{u.phoneNumber || '-'}</td>
                      <td className="p-3 text-center">
                        <select
                          value={u.role}
                          onChange={(e) => onChangeRole(u, e.target.value as any)}
                          className={`text-xs rounded px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-indigo-500 
                          ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-green-100 text-green-700 border-green-200'}`}
                          title="Chọn quyền"
                        >
                          <option value="admin">admin</option>
                          <option value="user">user</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-2 justify-center w-full">
                          <button
                            type="button"
                            aria-pressed={u.isActive}
                            disabled={togglingId === u._id}
                            onClick={() => onToggleStatus(u)}
                            title={u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${u.isActive ? 'bg-green-500' : 'bg-slate-300'}
                            ${togglingId === u._id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
                              ${u.isActive ? 'translate-x-5' : 'translate-x-1'}`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${u.isActive ? 'text-green-700' : 'text-slate-600'} w-20 text-left`}>
                            {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openView(u._id)}
                            title="Xem"
                            aria-label="Xem"
                            className="p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all"
                          >
                            {React.createElement(FiEye as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}/edit`)}
                            title="Sửa"
                            aria-label="Sửa"
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all"
                          >
                            {React.createElement(FiEdit2 as unknown as React.ComponentType<any>, { className: 'w-4 h-4' })}
                          </button>
                          <button
                            onClick={() => onDelete(u)}
                            title="Xóa"
                            aria-label="Xóa"
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:shadow-md transition-all"
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
        </div>

        {/* Pagination (with page size selector on the left) */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <select
              value={query.limit || 10}
              onChange={(e) => setQuery((q) => ({ ...q, page: 1, limit: Number(e.target.value) }))}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={(query.page || 1) <= 1}
              onClick={() => setQuery((q) => ({ ...q, page: Math.max(1, (q.page || 1) - 1) }))}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
            >Trước</button>
            <span className="text-sm font-medium text-slate-700">Trang {pagination?.page ?? query.page ?? 1}/{totalPages}</span>
            <button
              disabled={(query.page || 1) >= totalPages}
              onClick={() => setQuery((q) => ({ ...q, page: Math.min(totalPages, (q.page || 1) + 1) }))}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
            >Sau</button>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {viewing.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeView} />
          <div className="relative bg-white rounded-xl shadow-xl border w-full max-w-lg mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thông tin người dùng</h3>
              <button onClick={closeView} className="px-2 py-1 rounded hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4">
              {viewing.loading ? (
                <div className="text-center text-slate-600">Đang tải...</div>
              ) : viewing.user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={viewing.user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(((viewing.user?.firstName || '') + ' ' + (viewing.user?.lastName || '')))} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-semibold text-slate-800">{showOrPlaceholder(viewing.user?.firstName)} {showOrPlaceholder(viewing.user?.lastName)}</div>
                      </div>
                      <div className="text-slate-500 text-sm">@{showOrPlaceholder(viewing.user?.username)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Email</div>
                      <div className="font-medium">
                        {viewing.user?.email ? (
                          <a href={`mailto:${viewing.user.email}`} className="text-slate-800 hover:underline">{viewing.user.email}</a>
                        ) : (
                          <span className="text-slate-400 italic">{placeholder}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">SĐT</div>
                      <div className="font-medium">
                        {viewing.user?.phoneNumber ? (
                          <a href={`tel:${viewing.user.phoneNumber}`} className="text-slate-800 hover:underline">{viewing.user.phoneNumber}</a>
                        ) : (
                          <span className="text-slate-400 italic">{placeholder}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">MSSV</div>
                      <div className="font-medium">{viewing.user?.studentId ? viewing.user.studentId : <span className="text-slate-400 italic">{placeholder}</span>}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Ngày sinh</div>
                      <div className="font-medium">{formatDate(viewing.user?.dateOfBirth as any)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Quyền</div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${viewing.user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-green-100 text-green-700 border-green-200'}`}>{viewing.user?.role === 'admin' ? 'Admin' : 'User'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Trạng thái</div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${viewing.user?.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{viewing.user?.isActive ? 'Hoạt động' : 'Vô hiệu'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Tạo lúc</div>
                      <div className="font-medium">{formatDateTime(viewing.user?.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wide text-xs mb-1">Cập nhật</div>
                      <div className="font-medium">{formatDateTime(viewing.user?.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-600">Không có dữ liệu</div>
              )}
            </div>
            <div className="p-4 border-t text-right">
              <button onClick={closeView} className="px-4 py-2 rounded-lg border hover:bg-slate-50">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersPage;


import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminUser, UpdateUserInput, UserRole } from '../../types';
import { getUserById, updateUser } from '../../services/api';
import { toast } from 'react-toastify';

// Trang chỉnh sửa thông tin người dùng hiện có
const EditUserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UpdateUserInput>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    studentId: '',
    dateOfBirth: '',
    role: 'user',
    isActive: true,
    password: '',
  });

  useEffect(() => {
    // Lấy dữ liệu người dùng để điền sẵn vào form
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const u = await getUserById(userId);
        setInitial(u);
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          phoneNumber: u.phoneNumber || '',
          studentId: u.studentId || '',
          dateOfBirth: (u.dateOfBirth || '').slice(0, 10) || '',
          role: u.role,
          isActive: u.isActive,
        });
      } catch (e: any) {
        toast.error(e.message || 'Không thể tải người dùng');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, navigate]);

  // Cập nhật state form mỗi khi admin chỉnh input
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Đảo trạng thái hoạt động khi admin gạt công tắc
  const onToggleActive = () => setForm((f) => ({ ...f, isActive: !f.isActive }));

  // Kiểm tra dữ liệu trước khi gửi cập nhật
  const validate = (): string | null => {
    if (!form.firstName || !form.lastName) return 'Vui lòng nhập đầy đủ Họ và Tên';
    if (form.phoneNumber && !/^\d{10,11}$/.test(form.phoneNumber)) return 'Số điện thoại không hợp lệ (10-11 chữ số)';
    if (form.password && form.password.length < 6) return 'Mật khẩu mới phải có ít nhất 6 ký tự';
    return null;
  };

  // Gửi yêu cầu cập nhật người dùng sau khi hợp lệ hóa dữ liệu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const err = validate();
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const payload: UpdateUserInput = { ...form };
      if (!payload.phoneNumber) delete (payload as any).phoneNumber;
      if (!payload.studentId) delete (payload as any).studentId;
      if (!payload.dateOfBirth) payload.dateOfBirth = null; // allow clearing
      if (!payload.password) delete (payload as any).password; // only send when changing

      await updateUser(userId, payload);
      toast.success('Cập nhật người dùng thành công');
      navigate('/admin/users');
    } catch (e: any) {
      toast.error(e.message || 'Không thể cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Sửa người dùng</h1>
        <Link to="/admin/users" className="px-3 py-2 rounded-lg border hover:bg-slate-50">Quay lại</Link>
      </div>

      {!initial ? (
        <div className="bg-white p-6 rounded-xl border">Đang tải...</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border border-slate-100 space-y-6">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <img
              src={initial.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(((initial.firstName || '') + ' ' + (initial.lastName || '')))}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <div className="text-lg font-semibold text-slate-800">{(initial.firstName || '') + ' ' + (initial.lastName || '')}</div>
              <div className="text-slate-500 text-sm">@{initial.username}</div>
            </div>
          </div>
          {/* Account (readonly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tên đăng nhập</label>
              <input value={initial.username || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input value={initial.email} disabled className="w-full px-3 py-2 border rounded-lg bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Vai trò</label>
              <select name="role" value={form.role as UserRole} onChange={onChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                name="password"
                value={form.password || ''}
                onChange={onChange}
                placeholder="Để trống nếu không đổi"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Profile info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Họ</label>
              <input name="firstName" value={form.firstName || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tên</label>
              <input name="lastName" value={form.lastName || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Số điện thoại</label>
              <input name="phoneNumber" value={form.phoneNumber || ''} onChange={onChange} placeholder="10-11 chữ số" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">MSSV</label>
              <input name="studentId" value={form.studentId || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Ngày sinh</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth || ''} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Trạng thái</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onToggleActive} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm ${form.isActive ? 'text-green-700' : 'text-slate-600'}`}>{form.isActive ? 'Hoạt động' : 'Vô hiệu'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/admin/users" className="px-4 py-2 rounded-lg border hover:bg-slate-50">Hủy</Link>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditUserPage;

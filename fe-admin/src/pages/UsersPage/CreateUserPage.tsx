import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreateUserInput, UserRole } from '../../types';
import { createUser } from '../../services/api';
import { toast } from 'react-toastify';

// Form tạo mới người dùng cho quản trị viên
const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    studentId: '',
    dateOfBirth: '',
    role: 'user',
  });

  // Đồng bộ giá trị từ các input vào state form
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Kiểm tra dữ liệu cơ bản trước khi gửi
  const validate = (): string | null => {
    const username = form.username?.trim() || '';
    if (!username || username.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
    if (username.length > 30) return 'Tên đăng nhập không quá 30 ký tự';

    const email = (form.email || '').trim().toLowerCase();
    if (!email) return 'Email không hợp lệ';

    const pwd = form.password || '';
    if (pwd.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!form.firstName || !form.lastName) return 'Vui lòng nhập đầy đủ Họ và Tên';
    if (form.phoneNumber && !/^\d{10,11}$/.test(form.phoneNumber)) return 'Số điện thoại không hợp lệ (10-11 chữ số)';
    return null;
  };

  // Gửi yêu cầu tạo người dùng sau khi đã hợp lệ hóa dữ liệu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const payload: CreateUserInput = { ...form, email: form.email.trim().toLowerCase(), username: form.username.trim() };
      // Clean optional fields
      if (!payload.phoneNumber) delete (payload as any).phoneNumber;
      if (!payload.studentId) delete (payload as any).studentId;
      if (!payload.dateOfBirth) delete (payload as any).dateOfBirth;
      if (!payload.role) delete (payload as any).role;

      await createUser(payload);
      toast.success('Tạo người dùng thành công');
      navigate('/admin/users');
    } catch (e: any) {
      toast.error(e.message || 'Không thể tạo người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Tạo người dùng</h1>
        <Link to="/admin/users" className="px-3 py-2 rounded-lg border hover:bg-slate-50">Quay lại</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border border-slate-100 space-y-6">
        {/* Account info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Tên đăng nhập</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="vd: hongson123"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="vd: email@example.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Vai trò</label>
            <select
              name="role"
              value={form.role as UserRole}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </div>

        {/* Profile info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Họ</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Tên</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Số điện thoại</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber || ''}
              onChange={onChange}
              placeholder="10-11 chữ số"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">MSSV</label>
            <input
              name="studentId"
              value={form.studentId || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/users" className="px-4 py-2 rounded-lg border hover:bg-slate-50">Hủy</Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >{loading ? 'Đang tạo...' : 'Tạo người dùng'}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;

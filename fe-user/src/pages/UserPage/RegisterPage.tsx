import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  // Giữ sẵn nút xem/ẩn để người dùng coi mật khẩu bất cứ lúc nào
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('Mật khẩu cần chữ hoa, chữ thường và số');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (formData.username.length < 3 || formData.username.length > 30) {
      toast.error('Tên đăng nhập phải từ 3-30 ký tự');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Tên đăng nhập chỉ gồm chữ, số, gạch dưới');
      return false;
    }
    if (!formData.firstName.trim()) {
      toast.error('Họ là bắt buộc');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Tên là bắt buộc');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...cleanData } = formData;

      const success = await register(cleanData);
      if (success) {
        toast.success('Đăng ký thành công!');
        setTimeout(() => {
          // Lấy URL đã lưu trước khi redirect đến register, nếu không có thì về trang chủ
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl, { replace: true });
        }, 700);
      } else {
        toast.error('Đăng ký thất bại, vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none';

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center px-4 pt-10">
      <div className="w-full max-w-[1280px] rounded-[36px] overflow-hidden bg-white shadow-2xl" data-aos="fade-up">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div
            className="relative flex flex-col justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-10 py-12 sm:px-16"
            data-aos="fade-right"
          >
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -left-10 top-14 h-32 w-32 rounded-full bg-purple-200/50 blur-3xl" />
              <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-indigo-200/60 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-xl">
              {/* <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                EnglishMaster
              </span> */}
              <h1 className="mt-6 text-4xl font-bold text-slate-900">Tạo tài khoản mới</h1>
              <p className="mt-3 text-base text-slate-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Đăng nhập ngay
                </Link>
              </p>

              <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tên đăng nhập
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Nhập địa chỉ email"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Họ
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Nhập họ"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Tên
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Nhập tên"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`${inputClass} pr-12`}
                        placeholder="Ít nhất 6 ký tự, có chữ hoa, thường và số"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-indigo-500"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`${inputClass} pr-12`}
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-indigo-500"
                        aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiển thị xác nhận mật khẩu'}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                </button>
              </form>
            </div>
          </div>

          <div
            className="hidden md:block bg-no-repeat bg-center bg-contain"
            data-aos="fade-left"
            style={{
              backgroundImage: "url('/img/register.jpg')"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

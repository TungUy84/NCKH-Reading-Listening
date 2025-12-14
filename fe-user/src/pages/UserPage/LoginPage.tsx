import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ClipLoader } from 'react-spinners';

// Trang đăng nhập cho người dùng cuối trên ứng dụng khách
const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  // Giữ nút xem/ẩn mật khẩu luôn hiển thị dù ô đang trống
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  // Đồng bộ giá trị input vào state biểu mẫu
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gửi thông tin đăng nhập và điều hướng khi thành công
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!formData.identifier || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.identifier, formData.password);
      if (success) {
        toast.success('Đăng nhập thành công!');
        setTimeout(() => {
          // Lấy URL đã lưu trước khi redirect đến login, nếu không có thì về trang chủ
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/';
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl, { replace: true });
        }, 700);
      } else {
        toast.error('Thông tin đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error?.response?.status === 401) {
        toast.error('Thông tin đăng nhập hoặc mật khẩu không đúng!');
      } else if (error?.response?.status === 429) {
        toast.error('Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau!');
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none';

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center px-4 pt-10 ">
      <div className="w-full max-w-[1280px] rounded-[36px] overflow-hidden bg-white shadow-2xl" data-aos="fade-up">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="relative flex flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-10 py-12 sm:px-16" data-aos="fade-right">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -left-10 top-14 h-32 w-32 rounded-full bg-indigo-200/50 blur-3xl" />
              <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-purple-200/60 blur-3xl" />
            </div>
            <div className="relative z-10 max-w-lg">
              <h1 className="mt-6 text-4xl font-bold text-slate-900">Chào mừng quay lại!</h1>
              <p className="mt-3 text-base text-slate-600">
                Đăng nhập để tiếp tục lộ trình học tập, theo dõi tiến độ và trải nghiệm những tài liệu luyện thi mới nhất.
              </p>

              <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email hoặc tên đăng nhập
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Nhập email hoặc tên đăng nhập"
                  />
                </div>

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
                      placeholder="Nhập mật khẩu"
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

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="flex items-center text-slate-600">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="mr-2 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <ClipLoader color="#FFFFFF" size={16} />
                      Đang đăng nhập...
                    </span>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>

              <p className="mt-8 text-sm text-slate-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          <div
            className="hidden md:block bg-no-repeat bg-center bg-contain"
            data-aos="fade-left"
            style={{
              backgroundImage: "url('/img/login.jpg')"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ClipLoader } from 'react-spinners';

import { resetPassword } from '../../services/api';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error('Link đặt lại không hợp lệ, vui lòng thử lại.');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => navigate('/login', { replace: true }), 3200);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.password) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm() || !token || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      toast.success('Mật khẩu đã được đặt lại thành công!');
    } catch (error: any) {
      console.error('Reset password error:', error);

      if (error.response?.data?.message) {
        toast.error(`${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        toast.error('Link reset mật khẩu không hợp lệ hoặc đã hết hạn');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 pt-10 pb-20">
        <div className="w-full max-w-[720px] rounded-[32px] overflow-hidden bg-white shadow-2xl" data-aos="fade-up">
          <div className="relative flex flex-col items-center bg-gradient-to-br from-emerald-50 via-white to-green-50 px-10 py-14 sm:px-16">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
              <div className="absolute -bottom-8 right-16 h-24 w-24 rounded-full bg-lime-200/50 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-lg text-center space-y-6">
              <h1 className="text-4xl font-bold text-slate-900">Mật khẩu mới đã sẵn sàng</h1>
              <p className="mt-3 text-base text-slate-600">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
              <div className="rounded-2xl bg-white/80 p-6 text-sm text-slate-600 shadow-lg backdrop-blur">
                Hệ thống sẽ tự động chuyển về trang đăng nhập sau vài giây.
              </div>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 pt-10 pb-20">
      <div className="w-full max-w-[720px] rounded-[32px] overflow-hidden bg-white shadow-2xl" data-aos="fade-up">
        <div className="relative flex flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-10 py-14 sm:px-16" data-aos="fade-right">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="absolute -bottom-8 right-16 h-28 w-28 rounded-full bg-purple-200/60 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-xl">
            {/* <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
              EnglishMaster
            </span> */}

            <h1 className="mt-6 text-4xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
            <p className="mt-3 text-base text-slate-600">Nhập mật khẩu mới và xác nhận để bảo vệ tài khoản của bạn.</p>

            <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-12 placeholder:text-slate-400`}
                    placeholder="Nhập mật khẩu mới"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-indigo-500"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${inputClass} pr-12 placeholder:text-slate-400`}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-indigo-500"
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận'}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <ClipLoader color="#FFFFFF" size={16} />
                    Đang xử lý...
                  </span>
                ) : (
                  'Xác nhận mật khẩu mới'
                )}
              </button>
              <Link to="/login" className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Quay lại đăng nhập
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

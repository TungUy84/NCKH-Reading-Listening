import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ClipLoader } from 'react-spinners';
import { forgotPassword } from '../../services/api';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:outline-none';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Địa chỉ email không hợp lệ');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      setSuccess(true);
      toast.success('Link reset mật khẩu đã được gửi! Kiểm tra email của bạn');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 pt-10 pb-20">
      <div className="w-full max-w-[720px] rounded-[32px] overflow-hidden bg-white shadow-2xl" data-aos="fade-up">
        <div
          className="relative flex flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-10 py-14 sm:px-16"
          data-aos="fade-right"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="absolute -bottom-8 right-16 h-28 w-28 rounded-full bg-purple-200/60 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-xl">
            {/* <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
              EnglishMaster
            </span> */}

            {success ? (
              <div className="mt-8 space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Kiểm tra email của bạn</h1>
                  <p className="mt-3 text-base text-slate-600">
                    Chúng tôi đã gửi đường dẫn đặt lại mật khẩu tới địa chỉ:
                  </p>
                  <p className="mt-4 inline-flex items-center rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-600 shadow-sm">
                    {email}
                  </p>
                </div>

                {/* <div className="rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tiếp theo</h2>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      Mở hộp thư và tìm email từ EnglishMaster.
                    </li>
                    <li className="flex items-start gap-3">
                      Nhấn vào nút đặt lại mật khẩu trong email trong vòng 1 giờ.
                    </li>
                    <li className="flex items-start gap-3">
                      Tạo mật khẩu mới thật mạnh để bảo vệ tài khoản của bạn.
                    </li>
                  </ul>
                </div> */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Quay lại đăng nhập
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
                  >
                    Gửi lại yêu cầu
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Quên mật khẩu?</h1>
                  <p className="mt-3 text-base text-slate-600">
                    Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu trong giây lát.
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Địa chỉ email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    className={`${inputClass} placeholder:text-slate-400`}
                    placeholder="Nhập địa chỉ email của bạn"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <ClipLoader color="#FFFFFF" size={16} />
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi link đặt lại mật khẩu'
                  )}
                </button>

                <div className="flex flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Bạn đã nhớ mật khẩu?</span>
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                      Quay lại đăng nhập
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chưa có tài khoản?</span>
                    <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                      Tạo tài khoản mới
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

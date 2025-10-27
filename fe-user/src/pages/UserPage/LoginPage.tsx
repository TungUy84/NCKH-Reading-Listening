import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Prevent multiple submissions
    if (isLoading) return;

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('❌ Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('❌ Email không hợp lệ!');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('🎉 Đăng nhập thành công!');
        // Delay navigation để user nhìn thấy toast
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        toast.error('❌ Email hoặc mật khẩu không đúng!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error?.response?.status === 401) {
        toast.error('❌ Email hoặc mật khẩu không đúng!');
      } else if (error?.response?.status === 429) {
        toast.error('⚠️ Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau!');
      } else {
        toast.error('❌ Đã xảy ra lỗi. Vui lòng thử lại sau!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-down">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hoặc{' '}
            <Link
              to="/register"
              className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              tạo tài khoản mới ✨
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-up" data-aos-delay="200">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                  placeholder="Nhập địa chỉ email của bạn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔐 Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                  placeholder="Nhập mật khẩu của bạn"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                  💾 Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  🤔 Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    🔄 Đang đăng nhập...
                  </>
                ) : (
                  '🚀 Đăng nhập'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

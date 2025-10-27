import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../../services/api';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.password) {
      toast.error('❌ Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('❌ Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('❌ Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('❌ Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      toast.success('🎉 Mật khẩu đã được đặt lại thành công!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        toast.error('❌ Link reset mật khẩu không hợp lệ hoặc đã hết hạn');
      } else {
        toast.error('❌ Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md" data-aos="zoom-in">
          <div className="bg-white py-12 px-8 shadow-2xl rounded-2xl sm:px-12 border border-green-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="text-8xl mb-6">🎉</div>
              
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Reset mật khẩu thành công!
              </h2>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Mật khẩu của bạn đã được cập nhật thành công ✨<br />
                Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              
              <p className="text-sm text-gray-500 mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                ⏰ Đang chuyển hướng đến trang đăng nhập...
              </p>
              
              <Link
                to="/login"
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transform transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">🚀</span>
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-down">
        <div className="text-center">
          <div className="text-8xl mb-6">🔐</div>
          <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn ✨
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-up" data-aos-delay="200">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-3">
                🔒 Mật khẩu mới
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-4 border-2 border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 text-sm bg-white shadow-sm hover:shadow-md"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-3">
                🔐 Xác nhận mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-4 border-2 border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 text-sm bg-white shadow-sm hover:shadow-md"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            {/* Password Requirements */}
            {/* Password Requirements */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm font-bold text-gray-700 mb-3">Yêu cầu mật khẩu:</p>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-center justify-center"><span className="mr-2">🔢</span>Ít nhất 6 ký tự</li>
                  <li className="flex items-center justify-center"><span className="mr-2">🔤</span>Có ít nhất 1 chữ hoa (A-Z)</li>
                  <li className="flex items-center justify-center"><span className="mr-2">📝</span>Có ít nhất 1 chữ thường (a-z)</li>
                  <li className="flex items-center justify-center"><span className="mr-2">🔢</span>Có ít nhất 1 chữ số (0-9)</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🔐</span>
                    Đặt lại mật khẩu
                  </span>
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

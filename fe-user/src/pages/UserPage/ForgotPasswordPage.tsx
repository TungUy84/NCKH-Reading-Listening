import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email 📧');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Địa chỉ email không hợp lệ 📧');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success('Link reset mật khẩu đã được gửi! Kiểm tra email của bạn 📧✨');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại. ⚠️');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md" data-aos="zoom-in">
          <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-100 to-green-200 mb-6 animate-bounce">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                ✉️ Email đã được gửi!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi link reset mật khẩu đến địa chỉ email:
              </p>
              
              <p className="text-blue-600 font-semibold mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                📧 {email}
              </p>
              
              <p className="text-sm text-gray-500 mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                💡 Vui lòng kiểm tra email của bạn và làm theo hướng dẫn để reset mật khẩu. 
                Nếu không thấy email, hãy kiểm tra thư mục spam.
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-300 hover:scale-105"
                >
                  🔐 Quay lại đăng nhập
                </Link>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full flex justify-center py-3 px-4 border-2 border-orange-200 rounded-xl shadow-sm text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-md"
                >
                  <span className="mr-2">📧</span>
                  Gửi lại email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-down">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập email của bạn để nhận link reset mật khẩu ✨
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-up" data-aos-delay="200">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="appearance-none block w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                  placeholder="Nhập địa chỉ email của bạn"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="mr-2">📧</span>
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2">Đang gửi...</span>
                  </>
                ) : (
                  'Gửi link reset mật khẩu'
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Hoặc</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border-2 border-orange-200 rounded-xl shadow-sm text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-md"
                >
                  <span className="mr-2">🔙</span>
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-orange-600">Lưu ý:</strong> Nếu email của bạn có trong hệ thống, bạn sẽ nhận được link reset mật khẩu trong vài phút. 
                Link này có hiệu lực trong <span className="font-semibold text-orange-600">1 giờ</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

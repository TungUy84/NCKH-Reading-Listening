import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('🎉 Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('❌ Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20" data-aos="fade-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-8xl mb-6">📞</div>
            <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình học tiếng Anh 🚀<br />
              Hãy liên hệ để được tư vấn và hỗ trợ tốt nhất ✨
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div data-aos="fade-right">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Thông tin liên hệ
              </h2>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl">📍</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Địa chỉ</h3>
                  <p className="text-gray-600 leading-relaxed">
                    123 Đường ABC, Quận 1<br />
                    Thành phố Hồ Chí Minh, Việt Nam 🇻🇳
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl">📱</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Điện thoại</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <a href="tel:+84123456789" className="hover:text-green-600 transition-colors duration-300 font-medium">
                      📞 +84 123 456 789
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <a href="tel:+84987654321" className="hover:text-green-600 transition-colors duration-300 font-medium">
                      📞 +84 987 654 321
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl">📧</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Email</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <a href="mailto:info@englishtest.vn" className="hover:text-purple-600 transition-colors duration-300 font-medium">
                      ✉️ info@englishtest.vn
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <a href="mailto:support@englishtest.vn" className="hover:text-purple-600 transition-colors duration-300 font-medium">
                      🛠️ support@englishtest.vn
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl">⏰</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Giờ làm việc</h3>
                  <p className="text-gray-600 leading-relaxed">
                    📅 Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                    🕐 Thứ 7: 8:00 - 12:00<br />
                    😴 Chủ nhật: Nghỉ
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Theo dõi chúng tôi
                </h3>
              </div>
              <div className="flex justify-center space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg">
                  <div className="text-xl">📘</div>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg">
                  <div className="text-xl">📷</div>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg">
                  <div className="text-xl">📺</div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div data-aos="fade-left">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">📝</div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Gửi tin nhắn cho chúng tôi
                </h2>
                <p className="text-gray-600">Chúng tôi sẽ phản hồi trong vòng 24 giờ ⚡</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-3">
                    👤 Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 hover:shadow-md bg-white"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3">
                    📧 Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 hover:shadow-md bg-white"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="general">Câu hỏi chung</option>
                    <option value="technical">Hỗ trợ kỹ thuật</option>
                    <option value="test">Thắc mắc về bài test</option>
                    <option value="partnership">Hợp tác</option>
                    <option value="feedback">Góp ý</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tin nhắn *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tin nhắn của bạn..."
                />
              </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang gửi...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Gửi tin nhắn
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <div className="text-center">
                  <div className="text-3xl mb-2">💡</div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Cần hỗ trợ ngay lập tức?
                  </h3>
                  <p className="text-gray-600">
                    Bạn có thể liên hệ qua email, điện thoại hoặc gửi tin nhắn qua form trên trang này. 📞
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20" data-aos="fade-up">
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Câu hỏi thường gặp
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
              <div className="text-2xl mb-3">🆓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Bài test placement có miễn phí không?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Có, chúng tôi cung cấp nhiều bài test miễn phí để bạn có thể đánh giá trình độ tiếng Anh của mình.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kết quả test có chính xác không?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Các bài test được thiết kế dựa trên tiêu chuẩn quốc tế và đã được kiểm nghiệm với độ chính xác cao.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="300">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Tôi có thể làm lại bài test không?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Có, bạn có thể làm lại bài test sau một khoảng thời gian để theo dõi sự tiến bộ của mình.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="400">
              <div className="text-2xl mb-3">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Làm thế nào để liên hệ hỗ trợ?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bạn có thể liên hệ qua email, điện thoại hoặc gửi tin nhắn qua form trên trang này.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

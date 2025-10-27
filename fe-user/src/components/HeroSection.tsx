import { Link } from 'react-router-dom';

// Phần hero giới thiệu thông điệp chính và CTA
const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8" data-aos="fade-right">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Luyện thi <span className="text-orange-300">Nghe-Đọc</span>
              <br /> tiếng Anh
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              Cải thiện kỹ năng tiếng Anh với hệ thống ôn luyện thông minh. Phản hồi tức thì và lộ trình cá nhân hóa giúp bạn chinh phục mục tiêu nhanh chóng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/tests"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-[1.02] text-center"
              >
                Bắt đầu làm test
              </Link>
              <Link
                to="/lessons"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all duration-200 text-center"
              >
                Khám phá bài học
              </Link>
            </div>
          </div>

          <div className="relative" data-aos="fade-left" data-aos-delay="150">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-500/40 via-indigo-500/20 to-transparent blur-3xl -z-10" />
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184318/pexels-photo-3184318.jpeg"
                alt="Students studying English"
                className="w-full h-64 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

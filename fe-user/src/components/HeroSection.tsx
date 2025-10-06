import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Card from './ui/Card';

const HeroSection: React.FC = () => {
  const stats = [
    { label: 'Câu hỏi luyện tập', value: '1,000+' },
    { label: 'Bài test', value: '50+' },
    { label: 'Độ chính xác chấm điểm', value: '≈98%' }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      <div className="absolute inset-0 -z-10 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 60%)'}} />
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="text-white" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium ring-1 ring-white/20 mb-6">
              <span className="text-emerald-300">Mới</span> Nâng cấp thuật toán đánh giá
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              Luyện thi tiếng Anh
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-white">chuẩn hoá & cá nhân hoá</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl leading-relaxed">
              Nền tảng luyện nghe & đọc thông minh: phân tích hiệu suất, gợi ý cải thiện và kiểm tra liên tục để bạn tiến bộ mỗi ngày.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/tests">
                <Button size="lg" className="shadow-lg shadow-blue-900/30">
                  🚀 Bắt đầu làm bài
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                  📖 Tìm hiểu thêm
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md" data-aos="fade-up" data-aos-delay="200">
              {stats.map(s => (
                <div key={s.label} className="text-center group">
                  <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-wide text-blue-100/80 font-medium">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="relative" data-aos="fade-left" data-aos-delay="150">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-indigo-400/20 via-blue-300/10 to-transparent blur-2xl" />
            <Card className="relative rounded-3xl overflow-hidden p-0 border-white/10 bg-white/5 backdrop-blur-xl text-white">
              <div className="p-6 pb-4">
                <h3 className="text-sm font-medium tracking-wide text-blue-100 mb-2">Xem trước bài nghe</h3>
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/10 text-xs font-semibold">{i}</div>
                      <div className="flex-1">
                        <div className="h-2.5 rounded-full bg-white/20 w-32 mb-2" />
                        <div className="h-2 rounded-full bg-white/10 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60"
                  alt="Học tiếng Anh"
                  className="w-full aspect-[4/3] object-cover" />
                <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                  <span>✓</span> Chấm điểm tự động
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div>
                  <div className="text-xs text-blue-100 mb-1">Tiến độ tuần</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-to-r from-amber-300 to-yellow-200" />
                    </div>
                    <span className="text-xs font-medium">67%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-100 mb-1">Chuỗi ngày học</div>
                  <p className="text-sm font-semibold">12 ngày 🔥</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

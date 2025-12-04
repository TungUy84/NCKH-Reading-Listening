import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Timer, Award, FileCheck, Target, Sparkles } from 'lucide-react';

const MockTestSection: React.FC = () => {
  return (
    <section className="min-h-screen py-24 bg-white flex items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 mb-6 shadow-sm">
            <Target className="w-4 h-4" />
            <span className="text-sm font-bold tracking-wide uppercase">Thử thách bản thân</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Thi thử như <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Thi thật</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Trải nghiệm áp lực phòng thi với các đề thi mô phỏng sát thực tế nhất, giúp bạn tự tin chinh phục điểm cao
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column - Features */}
          <div className="lg:col-span-7 grid gap-6" data-aos="fade-right">
            {[
              {
                icon: Timer,
                title: 'Áp lực thời gian thực',
                desc: 'Rèn luyện khả năng quản lý thời gian với đồng hồ đếm ngược chuẩn format thi.',
                color: 'text-orange-600',
                bg: 'bg-orange-100'
              },
              {
                icon: FileCheck,
                title: 'Cấu trúc đề chuẩn',
                desc: 'Đề thi được biên soạn và cập nhật liên tục theo xu hướng ra đề mới nhất.',
                color: 'text-red-600',
                bg: 'bg-red-100'
              },
              {
                icon: Award,
                title: 'Phân tích chuyên sâu',
                desc: 'Nhận báo cáo chi tiết về điểm mạnh, điểm yếu và gợi ý cải thiện sau mỗi bài thi.',
                color: 'text-yellow-600',
                bg: 'bg-yellow-100'
              }
            ].map((item, index) => (
              <div key={index} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - CTA Card */}
          <div className="lg:col-span-5" data-aos="fade-left">
            <div className="h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-orange-500/30 flex flex-col justify-between group">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Kết quả tức thì</span>
                </div>
                
                <Trophy className="w-24 h-24 text-yellow-300 mb-8 drop-shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                
                <h3 className="text-3xl font-bold mb-4 leading-tight">
                  Sẵn sàng chinh phục <br/> điểm số mơ ước?
                </h3>
                <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                  Tham gia cùng hơn 10,000+ học viên đã đạt mục tiêu nhờ luyện đề mỗi ngày.
                </p>
              </div>

              <Link
                to="/mock-test"
                className="relative z-10 w-full bg-white text-orange-600 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-50 hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                Vào thi thử ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockTestSection;

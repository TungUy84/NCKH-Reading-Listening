import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  PlayCircleIcon, 
  ChartBarIcon,
  TrophyIcon,
  CalendarDaysIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { getTestForTaking, getMyTestHistory } from '../../services/api';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

interface TestDetail {
  _id: string;
  title: string;
  description?: string;
  category: string;
  timeLimit: number;
  totalQuestions: number;
  sections: Array<{
    _id: string;
    title: string;
    passage?: string;
  }>;
}

interface AttemptHistory {
  _id: string;
  percentage: number;
  ieltsScore?: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  durationSeconds: number;
  completedAt: string;
}

const MockTestDetailPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchTestDetail = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        const response = await getTestForTaking(testId);
        setTest(response.test);
      } catch (err) {
        toast.error('Không thể tải thông tin bài thi');
        navigate('/mock-test');
      } finally {
        setLoading(false);
      }
    };
    fetchTestDetail();
  }, [testId, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!testId) return;
      try {
        setHistoryLoading(true);
        const response = await getMyTestHistory(testId, { page: 1, limit: 5 });
        setAttempts(response.data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [testId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader /></div>;
  if (!test) return null;

  const isListening = test.category === 'listening';
  
  // --- COLOR THEME ---
  const gradientClass = isListening ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500';
  const textClass = isListening ? 'text-purple-600' : 'text-blue-600';
  const bgClass = isListening ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100';
  const iconClass = isListening ? 'text-purple-500' : 'text-blue-500';

  return (
    <div className="min-h-screen font-sans pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/mock-test')}
          data-aos="fade-up"
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium w-fit bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Quay lại danh sách
        </button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* === LEFT COLUMN: INFO (8 Cols) === */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative p-8 md:p-12" data-aos="fade-up" data-aos-delay="100">
              <div className={clsx("absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br opacity-10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3", gradientClass)} />
              
              <div className="flex items-center gap-3 mb-6">
                <span className={clsx("flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wide shadow-md bg-gradient-to-r", gradientClass)}>
                  {isListening ? <SpeakerWaveIcon className="h-4 w-4" /> : <BookOpenIcon className="h-4 w-4" />}
                  {test.category}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide border border-slate-200">
                  Mock Exam
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                {test.title}
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
                {test.description || 'Bài thi thử chuẩn format quốc tế, giúp bạn rèn luyện kỹ năng và quản lý thời gian hiệu quả.'}
              </p>

              <div className="flex flex-wrap gap-4 md:gap-8 text-sm font-medium text-slate-500 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2.5 rounded-2xl shadow-sm border", bgClass)}><ClockIcon className={clsx("h-6 w-6", iconClass)} /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Thời gian</p>
                    <p className="text-slate-900 font-bold text-lg">{test.timeLimit} phút</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2.5 rounded-2xl shadow-sm border", bgClass)}><DocumentTextIcon className={clsx("h-6 w-6", iconClass)} /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Số câu hỏi</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {test.totalQuestions} câu <span className="text-slate-400 text-sm font-medium mx-1">•</span> {test.sections.length} phần
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8" data-aos="fade-up" data-aos-delay="200">
              <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-2">
                <ChartBarIcon className={clsx("h-6 w-6", textClass)} />
                Lịch sử làm bài
              </h3>
              
              {historyLoading ? (
                <div className="text-center py-8 text-slate-400">Đang tải dữ liệu...</div>
              ) : attempts.length > 0 ? (
                <div className="space-y-4">
                  {attempts.map((attempt, idx) => (
                    <div
                      key={attempt._id}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-100 bg-white transition-all duration-200 hover:shadow-md hover:border-blue-100"
                    >
                      <div className="flex items-center gap-4">
                        {/* Score Badge */}
                        <div className={clsx(
                          "flex flex-col items-center justify-center w-16 h-16 rounded-xl font-bold border",
                          attempt.percentage >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            attempt.percentage >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          <span className="text-xl">
                            {attempt.ieltsScore !== undefined ? attempt.ieltsScore : `${attempt.percentage.toFixed(0)}%`}
                          </span>
                          <span className="text-[10px] uppercase opacity-70">
                            {attempt.ieltsScore !== undefined ? 'IELTS' : 'Điểm'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-800">Lần thi #{attempts.length - idx}</p>
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                              {new Date(attempt.completedAt).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="flex items-center gap-1">
                              <CheckBadgeIcon className="h-4 w-4 text-slate-400" />
                              Đúng {attempt.correctCount}/{test.totalQuestions}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/mock-test/result/${attempt._id}`)}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                      >
                        Xem chi tiết
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <ChartBarIcon className="h-8 w-8" />
                  </div>
                  <p className="text-slate-500 font-medium">Bạn chưa làm bài thi này lần nào.</p>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: ACTIONS (Sticky) === */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* CTA Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 text-center relative overflow-hidden group" data-aos="fade-left" data-aos-delay="100">
              <div className={clsx("absolute top-0 left-0 w-full h-2 bg-gradient-to-r", gradientClass)} />
              
              <div className={clsx("mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl bg-gradient-to-br text-white transform group-hover:scale-110 transition-transform duration-500", gradientClass)}>
                <PlayCircleIcon className="h-10 w-10" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sẵn sàng thử sức?</h3>
              <p className="text-slate-500 text-sm mb-8 px-4">
                Hãy đảm bảo bạn có không gian yên tĩnh, tai nghe tốt và kết nối mạng ổn định.
              </p>

              <Button 
                onClick={() => navigate(`/mock-test/${test._id}/take`)}
                fullWidth
                className={clsx(
                  "py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r border-none font-bold",
                  gradientClass
                )}
              >
                Bắt đầu làm bài
              </Button>
            </div>

            {/* Tips Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg"><TrophyIcon className="h-5 w-5 text-yellow-400" /></div>
                Mẹo làm bài thi
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <span>Đọc kỹ hướng dẫn từng phần thi trước khi bắt đầu làm bài.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <span>Phân bổ thời gian hợp lý cho từng câu hỏi khó/dễ.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <span>Kiểm tra kỹ kết nối mạng và thiết bị âm thanh (Listening).</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MockTestDetailPage;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ClockIcon,
  PlayCircleIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  ChevronLeftIcon,
  RectangleStackIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { getTestForTaking, getMyTestHistory } from '../../services/api';
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

const CheckpointDetailPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const levelGroup = location.state?.levelGroup;

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
        toast.error('Không thể tải thông tin bài kiểm tra');
        navigate('/roadmap');
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader /></div>;
  if (!test) return null;

  const isListening = test.category === 'listening';

  // --- COLOR THEME ---
  const gradientClass = isListening ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500';

  return (
    <div className="min-h-screen font-sans pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation */}
        <button
          onClick={() => navigate('/roadmap')}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="font-semibold text-sm">Quay lại lộ trình</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-start mb-16">

          {/* === LEFT COLUMN: INFO & ACTIONS === */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r from-slate-500 to-slate-600">
                CHECKPOINT
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
              {test.title}
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl whitespace-pre-line">
              {test.description || 'Bài kiểm tra đánh giá năng lực cuối chặng, giúp xác định mức độ hoàn thành lộ trình của bạn.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/roadmap/checkpoint/${test._id}/take`, { state: { levelGroup } })}
                className={clsx(
                  "flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r w-full sm:w-auto",
                  gradientClass
                )}
              >
                <PlayCircleIcon className="h-7 w-7" />
                Bắt đầu làm bài
              </button>
            </div>
          </div>

          {/* === RIGHT COLUMN: STATS CARDS === */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-center min-h-[140px]">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-inner">
                <RectangleStackIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Số phần</p>
              <p className="text-2xl font-black text-slate-800">{test.sections.length}</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-center min-h-[140px]">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                <ListBulletIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Câu hỏi</p>
              <p className="text-2xl font-black text-slate-800">{test.totalQuestions}</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-center min-h-[140px]">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
                <ClockIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Thời gian</p>
              <p className="text-2xl font-black text-slate-800">
                {test.timeLimit} <span className="text-sm font-bold text-slate-400">phút</span>
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-center min-h-[140px]">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
                <TrophyIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Thang điểm</p>
              <p className="text-2xl font-black text-slate-800">10</p>
            </div>
          </div>
        </div>

        {/* === HISTORY SECTION === */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-slate-800 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-900">Lịch sử làm bài</h2>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-lg p-6 lg:p-8">
            {historyLoading ? (
              <div className="text-center py-8 text-slate-400">Đang tải dữ liệu...</div>
            ) : attempts.length > 0 ? (
              <div className="space-y-4">
                {attempts.map((attempt, idx) => {
                  const score = attempt.ieltsScore || (attempt as any).score || 0;

                  return (
                    <div key={attempt._id} className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "flex flex-col items-center justify-center w-16 h-16 rounded-xl font-bold border",
                          attempt.percentage >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            attempt.percentage >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          <span className="text-xl">{Number(score).toFixed(1)}</span>
                          <span className="text-[10px] uppercase opacity-70">Điểm</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900">Lần thi #{attempts.length - idx}</p>
                            {attempt.ieltsScore && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">IELTS</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" /> {new Date(attempt.completedAt).toLocaleDateString('vi-VN')}</span>
                            <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" /> {formatDuration(attempt.durationSeconds)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate(`/roadmap/checkpoint/result/${attempt._id}`)}
                          className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                          Xem chi tiết
                          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Bạn chưa làm bài kiểm tra này lần nào.</p>
                <p className="text-slate-400 text-sm mt-1">Hãy nhấn "Bắt đầu làm bài" để thử sức nhé!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckpointDetailPage;
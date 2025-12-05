import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PracticeAttemptDetail, PracticeDetail } from '../../types';
import Button from '../../components/ui/Button';
import {
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  TrophyIcon,
  MapIcon,
  ArrowPathIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { getPracticeAttemptDetail } from '../../services/api';
import Loader from '../../components/ui/Loader';

interface QuestionTypeStats {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

interface AttemptDetailResponse {
  message: string;
  data?: {
    attempt: PracticeAttemptDetail;
    practice?: PracticeDetail | null;
  };
}

const PracticeResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<PracticeAttemptDetail | null>(location.state?.result || null);
  const [practice, setPractice] = useState<PracticeDetail | null>(location.state?.practice || null);
  const [loading, setLoading] = useState(!attempt);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) return;
      // If we already have data from state, we might not need to fetch, but fetching ensures fresh data
      // However, if we have attempt but not practice, we should fetch.
      if (attempt && practice) {
          setLoading(false);
          return;
      }

      try {
        setLoading(true);
        const res = (await getPracticeAttemptDetail(attemptId)) as AttemptDetailResponse;
        if (res.data?.attempt) {
            setAttempt(res.data.attempt);
        }
        if (res.data?.practice) {
            setPractice(res.data.practice);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId, attempt, practice]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!attempt) return null;

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const byType: Record<string, QuestionTypeStats> = {};

    attempt.answers.forEach(ans => {
      if (ans.isSkipped) skipped++;
      else if (ans.isCorrect) correct++;
      else incorrect++;

      // Practice answers might not have 'type' directly on them depending on the structure
      // Assuming they do or we can infer it. If not, we might skip the type breakdown or use a default.
      const type = (ans as any).type || 'Trắc nghiệm'; // Fallback

      if (!byType[type]) {
        byType[type] = { total: 0, correct: 0, incorrect: 0, skipped: 0 };
      }

      byType[type].total++;
      if (ans.isSkipped) byType[type].skipped++;
      else if (ans.isCorrect) byType[type].correct++;
      else byType[type].incorrect++;
    });

    return { correct, incorrect, skipped, byType };
  }, [attempt]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!attempt) return <div className="text-center p-10">Không tìm thấy kết quả</div>;

  const isPassed = attempt.percentage >= 80; // Or whatever threshold
  // Theme based on skill if available, else default
  const isListening = practice?.skill === 'listening';

  const theme = {
    gradient: isListening ? 'from-violet-600 via-fuchsia-600 to-purple-600' : 'from-cyan-500 via-blue-600 to-indigo-600',
    shadow: isListening ? 'shadow-fuchsia-500/30' : 'shadow-cyan-500/30',
    text: isListening ? 'text-fuchsia-600' : 'text-cyan-600',
    bg: isListening ? 'bg-fuchsia-50' : 'bg-cyan-50',
    border: isListening ? 'border-fuchsia-200' : 'border-cyan-200',
    lightBg: isListening ? 'bg-fuchsia-50/50' : 'bg-cyan-50/50',
  };

  const practiceId = practice?._id || (typeof attempt.practiceId === 'string' ? attempt.practiceId : (attempt.practiceId as any)?._id);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pb-20">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50 via-white to-slate-50 -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(practiceId ? `/practice/${practiceId}` : '/practice')}
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium w-fit bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay về bài ôn luyện</span>
          </button>

          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">
              Kết quả <span className={clsx("text-transparent bg-clip-text bg-gradient-to-r", theme.gradient)}>Ôn luyện</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium">{practice?.title || 'Bài ôn luyện'}</p>
          </div>
        </div>

        {/* Top Summary Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50 -z-10" />

          <div className="p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12">

            {/* Left: Score Circle & Level */}
            <div className="flex flex-col xl:flex-row items-center gap-12 flex-1">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Circle 2: Score */}
                <div className="relative w-48 h-48 flex-shrink-0 flex flex-col items-center justify-center">
                  {/* Decorative background */}
                  <div className={clsx("absolute inset-0 rounded-[2rem] rotate-6 opacity-10", `bg-gradient-to-br ${theme.gradient}`)} />
                  <div className="absolute inset-0 bg-white rounded-[2rem] shadow-xl border border-slate-100" />

                  <div className="relative flex flex-col items-center z-10">
                    <span className={clsx("text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br", theme.gradient)}>
                      {(attempt.score || 0).toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Điểm số</span>
                  </div>
                </div>

                {/* Circle 1: Correct Answers */}
                <div className="relative w-48 h-48 flex-shrink-0">
                  {/* Circular Progress */}
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 224 224">
                    <circle
                      cx="112"
                      cy="112"
                      r="90"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                      fill="transparent"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="90"
                      stroke={attempt.percentage >= 50 ? "url(#gradient-score)" : "#f43f5e"}
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={565.48}
                      strokeDashoffset={565.48 - (565.48 * attempt.percentage) / 100}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient-score" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isListening ? "#8b5cf6" : "#06b6d4"} />
                        <stop offset="100%" stopColor={isListening ? "#d946ef" : "#3b82f6"} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={clsx("text-4xl font-black tracking-tighter", attempt.percentage >= 50 ? "text-slate-800" : "text-rose-600")}>
                      {attempt.correctCount}<span className="text-2xl text-slate-400">/{attempt.totalQuestions || (attempt.correctCount + attempt.incorrectCount + attempt.skippedCount)}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Câu đúng</span>
                  </div>
                </div>
              </div>

              <div className="text-center xl:text-left space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-3">
                    {isPassed ? "Xuất sắc!" : attempt.percentage >= 50 ? "Làm tốt lắm!" : "Cần cố gắng hơn!"}
                  </h2>

                  {practice?.levelGroup && (
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 text-amber-800 font-bold text-xl shadow-sm mb-4">
                      <TrophyIcon className="w-6 h-6 text-amber-500" />
                      <span>Level: {practice.levelGroup}</span>
                    </div>
                  )}

                  <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                    {isPassed
                      ? 'Bạn đã hoàn thành bài ôn luyện này.'
                      : 'Lần sau hãy cố gắng hơn nhé.'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm" title="Đúng">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{stats?.correct}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-5 py-2.5 rounded-2xl border border-rose-100 shadow-sm" title="Sai">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{stats?.incorrect}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm" title="Bỏ qua">
                    <MinusCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{stats?.skipped}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-col gap-4 w-full lg:w-80">
              <Button
                variant="primary"
                onClick={() => navigate(`/practice/${practiceId}/review/${attemptId}`, { state: { result: attempt, practice } })}
                className={clsx(
                  "w-full py-4 rounded-2xl border-none text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1",
                  `bg-gradient-to-r ${theme.gradient}`
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <EyeIcon className="w-6 h-6" />
                  <span>Xem chi tiết đáp án</span>
                </div>
              </Button>

              <Button
                variant="primary"
                onClick={() => navigate('/practice')}
                className="w-full py-4 rounded-2xl border-none text-lg font-bold shadow-lg shadow-blue-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <MapIcon className="w-6 h-6" />
                  <span>Danh sách bài tập</span>
                </div>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate(`/practice/${practiceId}`)}
                className="w-full py-3 rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-semibold"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Làm lại bài</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* Statistics Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden h-full">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className={clsx("p-2 rounded-xl", theme.bg)}>
                  <ChartBarIcon className={clsx("w-6 h-6", theme.text)} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Thống kê theo dạng bài</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Dạng bài</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng câu</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider">Đúng</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-rose-600 uppercase tracking-wider">Sai</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Bỏ qua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats && Object.entries(stats.byType).map(([type, stat]) => (
                      <tr key={type} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{type}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">{stat.total}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600">{stat.correct}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-rose-600">{stat.incorrect}</td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{stat.skipped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             {/* Additional Info or Empty for now to match layout */}
             <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden h-full p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Thông tin thêm</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500">Thời gian làm bài</span>
                        <span className="font-bold text-slate-700">
                            {attempt.durationSeconds ? `${Math.round(attempt.durationSeconds / 60)} phút` : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500">Ngày làm bài</span>
                        <span className="font-bold text-slate-700">
                            {new Date(attempt.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeResultPage;

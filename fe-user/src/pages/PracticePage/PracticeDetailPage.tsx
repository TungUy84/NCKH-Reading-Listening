import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ClockIcon,
  BookOpenIcon,
  TrophyIcon,
  PlayCircleIcon,
  ChevronLeftIcon,
  SpeakerWaveIcon,
  ListBulletIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { getMyPracticeAttempts, getPracticeForLearner } from '../../services/api';
import { PracticeAttemptSummary, PracticeDetail } from '../../types';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

// --- HELPER FUNCTIONS ---
const getLevelGradient = (level: string) => {
  if (['AV1-AV3'].includes(level)) return 'from-emerald-400 to-teal-500 shadow-emerald-200';
  if (['AV4-AV5'].includes(level)) return 'from-amber-400 to-orange-500 shadow-amber-200';
  if (['AV6', 'AV7'].includes(level)) return 'from-rose-400 to-pink-500 shadow-rose-200';
  return 'from-blue-400 to-indigo-500 shadow-blue-200';
};

const getSkillGradient = (skill: string) => {
  return skill === 'reading'
    ? 'from-blue-500 to-cyan-500 shadow-blue-200'
    : 'from-purple-500 to-pink-500 shadow-purple-200';
};

interface PracticeDetailResponse {
  message: string;
  practice: PracticeDetail;
}

interface PracticeHistoryResponse {
  message: string;
  data?: {
    items: PracticeAttemptSummary[];
  };
}

const PracticeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceId } = useParams<{ practiceId: string }>();

  const [practice, setPractice] = useState<PracticeDetail | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const lastAttemptId = (location.state as { lastAttemptId?: string } | null)?.lastAttemptId;

  const fetchPracticeDetail = useCallback(async () => {
    if (!practiceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = (await getPracticeForLearner(practiceId)) as PracticeDetailResponse;
      if (!response?.practice) throw new Error('Không tìm thấy bài ôn luyện');
      setPractice(response.practice);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết bài ôn luyện');
    } finally {
      setIsLoading(false);
    }
  }, [practiceId]);

  const fetchHistory = useCallback(async () => {
    if (!practiceId) return;
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = (await getMyPracticeAttempts(practiceId, { page: 1, limit: 10 })) as PracticeHistoryResponse;
      setAttempts(response?.data?.items || []);
    } catch (err: any) {
      setHistoryError(err?.response?.data?.message || err?.message || 'Không thể tải lịch sử làm bài');
    } finally {
      setHistoryLoading(false);
    }
  }, [practiceId]);

  useEffect(() => { fetchPracticeDetail(); }, [fetchPracticeDetail]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const historyItems = useMemo(() => {
    return attempts.map((attempt) => ({
      id: attempt._id,
      createdAt: new Date(attempt.createdAt).toLocaleString('vi-VN'),
      earnedPoints: attempt.earnedPoints,
      percentage: attempt.percentage,
      score: attempt.score || 0
    }));
  }, [attempts]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader /></div>;
  }

  if (error || !practice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-slate-500 mb-6">{error || 'Không tìm thấy bài tập này.'}</p>
          <Button onClick={() => navigate('/practice')} variant="outline">Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const isReading = practice.skill === 'reading';

  return (
    <div className="font-sans pb-12">

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        <button
          onClick={() => navigate('/practice')}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="font-semibold text-sm">Quay lại thư viện</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-start">

          {/* === LEFT COLUMN: INFO & ACTIONS === */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r uppercase tracking-wide flex items-center gap-2",
                getSkillGradient(practice.skill)
              )}>
                {isReading ? <BookOpenIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
                {practice.skill}
              </span>
              <span className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                getLevelGradient(practice.levelGroup)
              )}>
                {practice.levelGroup}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
              {practice.title}
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl whitespace-pre-line">
              {practice.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/practice/${practice._id}/take`)}
                className={clsx(
                  "flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r w-full sm:w-auto",
                  isReading
                    ? "from-blue-600 to-indigo-600 hover:shadow-blue-500/30"
                    : "from-purple-600 to-pink-600 hover:shadow-purple-500/30"
                )}
              >
                <PlayCircleIcon className="h-7 w-7" />
                Bắt đầu làm bài
              </button>

              {lastAttemptId && (
                <button
                  onClick={() => navigate(`/practice/attempts/${lastAttemptId}`)}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all w-full sm:w-auto"
                >
                  <ChartBarIcon className="h-5 w-5 text-slate-500" />
                  Xem kết quả gần nhất
                </button>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: STATS CARDS === */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Thời gian</p>
                <p className="text-3xl font-black text-slate-800">
                  {practice.estimatedTime || 15} <span className="text-lg font-bold text-slate-400">phút</span>
                </p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                <ClockIcon className="h-8 w-8" />
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-center min-h-[140px]">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                <ListBulletIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Câu hỏi</p>
              <p className="text-2xl font-black text-slate-800">{practice.totalQuestions}</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-center min-h-[140px]">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
                <TrophyIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">Tổng số câu</p>
              <p className="text-2xl font-black text-slate-800">{practice.totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* === HISTORY SECTION === */}
        <div className="mt-16 lg:mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-slate-800 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-900">Lịch sử làm bài</h2>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-lg p-6 lg:p-8">
            {historyLoading && <div className="text-center py-8 text-slate-500">Đang tải dữ liệu...</div>}
            {historyError && <div className="text-center py-8 text-red-500">{historyError}</div>}

            {!historyLoading && !historyError && historyItems.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDaysIcon className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Bạn chưa làm bài tập này lần nào.</p>
                <p className="text-slate-400 text-sm mt-1">Hãy nhấn "Bắt đầu làm bài" để thử sức nhé!</p>
              </div>
            )}

            {!historyLoading && !historyError && historyItems.length > 0 && (
              <div className="space-y-4">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className={clsx(
                      "group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md",
                      item.id === lastAttemptId
                        ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200"
                        : "bg-white border-slate-100 hover:border-blue-100"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Score Badge */}
                      <div className={clsx(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-xl font-bold border",
                        item.score >= 8 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          item.score >= 5 ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        <span className="text-xl">{item.score}</span>
                        <span className="text-[10px] uppercase opacity-70">Điểm</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-800">{item.createdAt}</p>
                          {item.id === lastAttemptId && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">Mới nhất</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CheckBadgeIcon className="h-4 w-4 text-slate-400" />
                            Đúng {item.percentage}%
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>Điểm: {item.score || 0}/10</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/practice/attempts/${item.id}`)}
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                      Xem chi tiết
                      <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PracticeDetailPage;
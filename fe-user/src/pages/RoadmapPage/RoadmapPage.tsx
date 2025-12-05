import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCurrentUserRoadmap, syncRoadmapContent, getAllMyTestAttempts } from '../../services/api';
import { UserRoadmap, RoadmapStage } from '../../types';
import {
  MapIcon,
  CheckCircleIcon,
  LockClosedIcon,
  PlayCircleIcon,
  TrophyIcon,
  ArrowRightIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  FireIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Loader from '../../components/ui/Loader';

const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<UserRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadRoadmap();
    loadStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStreak = async () => {
    try {
      const response = await getAllMyTestAttempts({ limit: 50 });
      const attempts = response.data?.items || [];
      setStreak(calculateStreak(attempts));
    } catch (err) {
      console.error('Failed to load streak:', err);
      setStreak(0);
    }
  };

  const calculateStreak = (attempts: any[]) => {
    if (!attempts.length) return 0;

    const uniqueDates = Array.from(new Set(
      attempts.map(a => new Date(a.createdAt).toISOString().split('T')[0])
    )).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const lastActivity = uniqueDates[0];
    
    if (lastActivity !== today && lastActivity !== yesterday) {
      return 0;
    }

    let streakCount = 1;
    let currentDateStr = lastActivity;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(currentDateStr);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedPrevDateStr = prevDate.toISOString().split('T')[0];
      
      if (uniqueDates[i] === expectedPrevDateStr) {
        streakCount++;
        currentDateStr = expectedPrevDateStr;
      } else {
        break;
      }
    }

    return streakCount;
  };

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      try { await syncRoadmapContent(); } catch (err) { /* Silent sync */ }
      const res = await getCurrentUserRoadmap();
      if (!res.hasRoadmap || !res.data) {
        navigate('/roadmap/setup');
        return;
      }
      setRoadmap(res.data);
    } catch (err: any) {
      toast.error('Không thể tải lộ trình.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 border-emerald-200 ring-emerald-500/20';
      case 'in-progress': return 'bg-white border-indigo-200 ring-4 ring-indigo-500/10 shadow-xl shadow-indigo-500/10';
      case 'checkpoint-ready': return 'bg-amber-50 border-amber-200 ring-amber-500/20';
      default: return 'bg-slate-50/50 border-slate-200 opacity-70 grayscale';
    }
  };

  const getOverallProgress = () => {
    if (!roadmap) return 0;
    const totalStages = roadmap.stages.length;
    const completedStages = roadmap.stages.filter(s => s.status === 'completed').length;
    const activeStage = roadmap.stages.find(s => s.status === 'in-progress' || s.status === 'checkpoint-ready');

    let progress = (completedStages / totalStages) * 100;
    if (activeStage) {
      progress += (activeStage.progress.overallPercentage / 100) * (100 / totalStages);
    }
    return Math.min(Math.round(progress), 100);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader /></div>;
  if (!roadmap) return null;

  const overallProgress = getOverallProgress();
  const currentStageIndex = roadmap.stages.findIndex(s => s.status === 'in-progress' || s.status === 'checkpoint-ready');

  return (
    <div className="min-h-screen font-sans pb-20 pt-8">
      {/* Mở rộng max-width lên 7xl để đồng bộ với các trang khác */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12" data-aos="fade-up">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm animate-bounce">
              <MapIcon className="h-4 w-4" />
              Lộ trình cá nhân hóa
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Hành trình <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                chinh phục {roadmap.targetLevel}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm">
            <div className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              Bắt đầu: <span className="font-bold text-slate-900">{roadmap.currentLevel}</span>
            </div>
            <ArrowRightIcon className="h-4 w-4 text-slate-300" />
            <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm">
              Mục tiêu: <span className="font-bold">{roadmap.targetLevel}</span>
            </div>
          </div>
        </div>

        {/* --- STATS DASHBOARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Overall Progress */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-lg shadow-indigo-500/5 relative overflow-hidden group hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="100">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ChartBarIcon className="h-24 w-24 text-indigo-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tiến độ tổng thể</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-black text-slate-900">{overallProgress}%</span>
              <span className="text-sm font-medium text-emerald-500 mb-1.5 flex items-center">
                <ArrowRightIcon className="h-3 w-3 -rotate-45" /> Tốt
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>

          {/* Card 2: Current Focus */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="200">
            <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl" />
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2">Đang tập trung</p>
            {currentStageIndex !== -1 ? (
              <>
                <h3 className="text-3xl font-black mb-1">{roadmap.stages[currentStageIndex].levelGroup}</h3>
                <p className="text-indigo-100 text-sm opacity-90">Chặng {currentStageIndex + 1} trên tổng số {roadmap.stages.length}</p>
                <button
                  onClick={() => navigate(`/roadmap/stage/${roadmap.stages[currentStageIndex].levelGroup}`)}
                  className="mt-6 px-5 py-2.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <PlayCircleIcon className="h-5 w-5" /> Tiếp tục học
                </button>
              </>
            ) : (
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold flex items-center gap-2"><CheckCircleIcon className="h-8 w-8" /> Hoàn thành!</h3>
                <p className="text-indigo-100 text-sm mt-2">Bạn đã xuất sắc vượt qua mọi thử thách.</p>
              </div>
            )}
          </div>

          {/* Card 3: Streak/Motivation */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-lg shadow-orange-500/5 relative overflow-hidden group hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FireIcon className="h-24 w-24 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                <FireIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{streak > 0 ? 'Đang học tập' : 'Chưa bắt đầu'}</p>
                <p className="text-xs text-slate-500">{streak > 0 ? 'Giữ vững phong độ nhé!' : 'Hãy bắt đầu ngay hôm nay!'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <div key={d} className={clsx("h-2 flex-1 rounded-full", d <= (streak > 7 ? 7 : streak) ? "bg-orange-400" : "bg-slate-200")} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">Tuần này</p>
          </div>
        </div>

        {/* --- DETAILED TIMELINE --- */}
        <div className="relative pl-8 md:pl-0">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent -z-10 hidden md:block" />
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 -z-10 md:hidden" />

          <div className="space-y-12">
            {roadmap.stages.map((stage, index) => {
              const isCompleted = stage.status === 'completed';
              const isActive = stage.status === 'in-progress' || stage.status === 'checkpoint-ready';
              const isLocked = stage.status === 'locked';

              return (
                <div key={stage._id} className="relative md:grid md:grid-cols-[100px_1fr] gap-8 group" data-aos="fade-up" data-aos-delay={index * 100}>

                  {/* Timeline Marker (Desktop) */}
                  <div className="hidden md:flex flex-col items-center">
                    <div className={clsx(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border-4 z-10 transition-all duration-500",
                      isCompleted ? "bg-emerald-500 border-emerald-100 text-white shadow-emerald-200" :
                        isActive ? "bg-white border-indigo-600 text-indigo-600 shadow-xl scale-110" :
                          "bg-white border-slate-200 text-slate-300"
                    )}>
                      {isCompleted ? <CheckCircleIcon className="h-8 w-8" /> :
                        isActive ? <PlayCircleIcon className="h-8 w-8" /> :
                          <span className="font-bold text-lg">{index + 1}</span>}
                    </div>
                    {/* Date or Label below marker */}
                    <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Chặng {index + 1}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    onClick={() => !isLocked && navigate(`/roadmap/stage/${stage.levelGroup}`)}
                    className={clsx(
                      "relative rounded-[2rem] p-8 border transition-all duration-300 cursor-pointer overflow-hidden",
                      getStatusColor(stage.status),
                      !isLocked && "hover:shadow-2xl hover:-translate-y-1"
                    )}
                  >
                    {/* Background Blob for Active Card */}
                    {isActive && <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div>
                        {/* Mobile Marker */}
                        <div className="md:hidden flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">Chặng {index + 1}</span>
                          {isActive && <span className="text-xs font-bold text-indigo-600 animate-pulse">● Đang diễn ra</span>}
                        </div>

                        <h3 className={clsx("text-2xl font-black mb-2", isLocked ? "text-slate-400" : "text-slate-900")}>
                          {stage.levelGroup}
                        </h3>

                        <p className={clsx("text-sm max-w-lg leading-relaxed", isLocked ? "text-slate-400" : "text-slate-600")}>
                          {isCompleted ? "Bạn đã hoàn thành xuất sắc các nội dung và bài kiểm tra của chặng này." :
                            isActive ? "Tập trung hoàn thành các bài học và bài tập thực hành để mở khóa bài kiểm tra." :
                              "Hoàn thành chặng trước để mở khóa nội dung này."}
                        </p>

                        {/* Stats Row */}
                        {!isLocked && (
                          <div className="flex items-center gap-6 mt-6">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                              <CheckCircleIcon className={clsx("h-5 w-5", isCompleted ? "text-emerald-500" : "text-slate-300")} />
                              <span>{stage.progress.overallPercentage}% Hoàn thành</span>
                            </div>
                            {stage.checkpointResult && (
                              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                <TrophyIcon className="h-4 w-4" />
                                Điểm thi: {Number((stage.checkpointResult.score || 0) > 10 ? (stage.checkpointResult.score || 0) / 10 : (stage.checkpointResult.score || 0)).toFixed(1)}/10
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {!isLocked && (
                        <div className="shrink-0">
                          <button className={clsx(
                            "h-14 w-14 rounded-full flex items-center justify-center transition-all",
                            isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-110" :
                              "bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200"
                          )}>
                            <ArrowRightIcon className="h-6 w-6" />
                          </button>
                        </div>
                      )}

                      {isLocked && <LockClosedIcon className="h-8 w-8 text-slate-300 md:mr-4" />}
                    </div>

                    {/* Progress Bar Bottom */}
                    {!isLocked && isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-100">
                        <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stage.progress.overallPercentage}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- COMPLETION CTA --- */}
        {overallProgress === 100 && (
          <div className="mt-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 text-center shadow-2xl border border-slate-700">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl opacity-30 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30 mb-6 animate-bounce">
                <TrophyIcon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Chúc mừng bạn đã hoàn thành lộ trình!
              </h2>

              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Bạn đã xuất sắc vượt qua tất cả các chặng đường. Đừng dừng lại ở đây, hãy thiết lập một mục tiêu mới để tiếp tục nâng cao trình độ của mình.
              </p>

              <button
                onClick={() => navigate('/roadmap/setup')}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <RocketLaunchIcon className="w-6 h-6 text-indigo-600 group-hover:rotate-12 transition-transform" />
                <span>Bắt đầu lộ trình mới</span>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/50 group-hover:ring-white/80 transition-all" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RoadmapPage;
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStageDetail, syncRoadmapContent } from '../../services/api';
import { StageDetailResponse, RoadmapLevelGroup } from '../../types';
import { 
  BookOpenIcon, 
  SpeakerWaveIcon, 
  CheckCircleIcon, 
  PlayCircleIcon, 
  ChevronLeftIcon,
  TrophyIcon,
  LockClosedIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Loader from '../../components/ui/Loader';

const StageDetailPage: React.FC = () => {
  const { levelGroup } = useParams<{ levelGroup: RoadmapLevelGroup }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StageDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reading' | 'listening'>('reading');

  // Hàm load dữ liệu, thêm tham số isBackground để không hiện loading khi auto-refresh
  const loadStageDetail = useCallback(async (isBackground = false) => {
    if (!levelGroup) return;
    try {
      if (!isBackground) setLoading(true);
      
      // Sync content nhẹ (có thể bỏ qua nếu muốn nhanh hơn)
      try { await syncRoadmapContent(); } catch (err) {}
      
      const res = await getStageDetail(levelGroup as RoadmapLevelGroup);
      setData(res.data);
    } catch (err: any) {
      if (!isBackground) {
        toast.error('Không thể tải chi tiết chặng');
        navigate('/roadmap');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [levelGroup, navigate]);

  // Load lần đầu
  useEffect(() => {
    loadStageDetail();
  }, [loadStageDetail]);

  // TỰ ĐỘNG CẬP NHẬT: Khi người dùng quay lại tab này (focus)
  useEffect(() => {
    const onFocus = () => {
      // Gọi load lại dữ liệu ngầm (không hiện loading spin)
      loadStageDetail(true);
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadStageDetail]);

  // Hàm mở tab mới
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><Loader /></div>;
  if (!data) return null;

  const { stage, content, checkpointTest } = data;
  const skillContent = content[activeTab];
  const skillProgress = stage.progress[activeTab];
  
  const totalItems = skillContent.lessons.length + skillContent.practices.length;
  const completedItems = skillProgress.completedLessons.length + skillProgress.completedPractices.length;

  return (
    <div className="min-h-screen font-sans pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/roadmap')}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium w-fit bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200"
        >
          <ChevronLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          Quay lại lộ trình
        </button>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 mb-10">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/3 -translate-y-1/3" />
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100 w-fit mb-4">
              Chặng hiện tại
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">{stage.levelGroup}</h1>
            <p className="text-lg text-slate-600">
              Hoàn thành các bài học và bài tập để nắm vững kiến thức và mở khóa bài kiểm tra cuối chặng.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-lg p-8 flex flex-col justify-center items-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * stage.progress.overallPercentage) / 100} className="text-indigo-600 transition-all duration-1000" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-indigo-900">{stage.progress.overallPercentage}%</span>
              </div>
            </div>
            <p className="font-bold text-slate-900 text-lg">Tiến độ hoàn thành</p>
            <p className="text-slate-500 text-sm">Cố gắng lên nhé!</p>
          </div>
        </div>

        {/* Checkpoint Banner */}
        {stage.status === 'checkpoint-ready' && checkpointTest && (
          <div className="bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md">
                <TrophyIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-amber-900 text-2xl mb-1">Đã mở khóa bài kiểm tra chặng!</h3>
                <p className="text-amber-800 font-medium">Bạn đã đủ điều kiện để thực hiện bài kiểm tra đánh giá năng lực.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/placement-test/${checkpointTest._id}/take`)}
              className="px-8 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              Làm bài ngay
            </button>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
          <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('reading')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                activeTab === 'reading' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <BookOpenIcon className="h-5 w-5" /> Reading
            </button>
            <button
              onClick={() => setActiveTab('listening')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-300",
                activeTab === 'listening' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
              )}
            >
              <SpeakerWaveIcon className="h-5 w-5" /> Listening
            </button>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-bold text-slate-900 text-2xl flex items-center gap-3">
                <span className={clsx("w-3 h-8 rounded-full", activeTab === 'reading' ? "bg-blue-500" : "bg-purple-500")} />
                Nội dung {activeTab === 'reading' ? 'Đọc hiểu' : 'Nghe hiểu'}
              </h3>
              <span className="text-sm font-bold bg-slate-100 text-slate-600 px-4 py-2 rounded-xl border border-slate-200">
                {completedItems}/{totalItems} hoàn thành
              </span>
            </div>

            <div className="space-y-12">
              {/* Lessons */}
              {skillContent.lessons.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Bài học (Lessons)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {skillContent.lessons.map(lesson => {
                      const isDone = skillProgress.completedLessons.includes(lesson._id);
                      return (
                        <div 
                          key={lesson._id} 
                          // SỬA: Dùng window.open thay vì navigate
                          onClick={() => openInNewTab(`/lessons/${lesson._id}`)} 
                          className={clsx(
                            "group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                            isDone ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={clsx("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                              {isDone ? <CheckCircleIcon className="h-6 w-6" /> : <DocumentTextIcon className="h-6 w-6" />}
                            </div>
                            <div>
                              <h5 className={clsx("font-bold text-lg", isDone ? "text-emerald-900 line-through opacity-70" : "text-slate-900 group-hover:text-indigo-700")}>
                                {lesson.title}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1 font-medium">Lý thuyết & Ví dụ minh họa</p>
                            </div>
                          </div>
                          <div className={clsx("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors", isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white")}>
                            {isDone ? 'Đã học' : 'Học ngay'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Practices */}
              {skillContent.practices.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Thực hành (Practice)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {skillContent.practices.map(practice => {
                      const isDone = skillProgress.completedPractices.includes(practice._id);
                      return (
                        <div 
                          key={practice._id} 
                          // SỬA: Dùng window.open thay vì navigate
                          onClick={() => openInNewTab(`/practice/${practice._id}`)}
                          className={clsx(
                            "group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                            isDone ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={clsx("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", isDone ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                              {isDone ? <CheckCircleIcon className="h-6 w-6" /> : <PlayCircleIcon className="h-6 w-6" />}
                            </div>
                            <div>
                              <h5 className={clsx("font-bold text-lg", isDone ? "text-emerald-900 line-through opacity-70" : "text-slate-900 group-hover:text-indigo-700")}>
                                {practice.title}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1 font-medium">{practice.totalQuestions} câu hỏi • ~{practice.estimatedTime} phút</p>
                            </div>
                          </div>
                          <div className={clsx("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors", isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white")}>
                            {isDone ? 'Hoàn thành' : 'Làm bài'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StageDetailPage;
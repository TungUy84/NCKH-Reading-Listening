import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createUserRoadmap, getSuggestedLevel } from '../../services/api';
import { RoadmapLevelGroup, SuggestedLevelResponse } from '../../types';
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  TrophyIcon, 
  RocketLaunchIcon, 
  ChartBarIcon, 
  StarIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  MapIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

const LEVEL_GROUPS: RoadmapLevelGroup[] = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];

const LEVEL_INFO: Record<RoadmapLevelGroup, { label: string; description: string; color: string; icon: any }> = {
  'AV1-AV3': { label: 'Khởi động', description: 'Nền tảng từ vựng & ngữ pháp', color: 'from-emerald-400 to-teal-500', icon: RocketLaunchIcon },
  'AV4-AV5': { label: 'Tăng tốc', description: 'Phát triển kỹ năng đọc & nghe', color: 'from-blue-400 to-indigo-500', icon: ChartBarIcon },
  'AV6': { label: 'Bứt phá', description: 'Tư duy phản biện chuyên sâu', color: 'from-purple-400 to-pink-500', icon: StarIcon },
  'AV7': { label: 'Về đích', description: 'Chinh phục đỉnh cao học thuật', color: 'from-orange-400 to-red-500', icon: TrophyIcon }
};

const RoadmapSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<RoadmapLevelGroup | ''>('');
  const [targetLevel, setTargetLevel] = useState<RoadmapLevelGroup | ''>('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestedLevelResponse | null>(null);

  useEffect(() => {
    getSuggestedLevel().then(setSuggestion).catch(console.error);
  }, []);

  useEffect(() => {
    if (suggestion?.hasSuggestion && suggestion.data?.suggestedLevel) {
      setCurrentLevel(suggestion.data.suggestedLevel);
    }
  }, [suggestion]);

  const handleCreateRoadmap = async () => {
    if (!currentLevel || !targetLevel) return toast.error('Vui lòng chọn đủ thông tin');
    if (LEVEL_GROUPS.indexOf(targetLevel) < LEVEL_GROUPS.indexOf(currentLevel)) {
      return toast.error('Mục tiêu phải cao hơn hoặc bằng trình độ hiện tại');
    }
    setLoading(true);
    try {
      await createUserRoadmap({ currentLevel, targetLevel });
      toast.success('Khởi tạo thành công!');
      navigate('/roadmap');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tạo lộ trình');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán các chặng sẽ đi qua
  const getPreviewStages = () => {
    if (!currentLevel || !targetLevel) return [];
    const startIdx = LEVEL_GROUPS.indexOf(currentLevel);
    const endIdx = LEVEL_GROUPS.indexOf(targetLevel);
    if (startIdx > endIdx) return [];
    return LEVEL_GROUPS.slice(startIdx, endIdx + 1);
  };

  const previewStages = getPreviewStages();

  const LevelCard = ({ level, selected, onSelect, disabled }: any) => {
    const info = LEVEL_INFO[level as RoadmapLevelGroup];
    const Icon = info.icon;
    return (
      <button
        onClick={() => !disabled && onSelect(level)}
        disabled={disabled}
        className={clsx(
          "relative group w-full p-6 rounded-3xl border-2 text-left transition-all duration-300 h-full flex flex-col",
          disabled ? "opacity-40 grayscale cursor-not-allowed border-slate-100 bg-slate-50" : 
          selected ? "border-indigo-600 bg-indigo-50/20 shadow-xl scale-[1.02] ring-1 ring-indigo-500" : 
          "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1"
        )}
      >
        {selected && (
          <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1 rounded-full shadow-sm animate-fade-in">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
        )}
        <div className={clsx(
          "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md bg-gradient-to-br transition-transform group-hover:scale-110",
          info.color
        )}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="mt-auto">
          <h3 className="text-xl font-black text-slate-900 mb-1">{level}</h3>
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-2">{info.label}</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{info.description}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen font-sans pb-20 pt-12 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Thiết kế lộ trình
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Chọn điểm xuất phát và đích đến để chúng tôi xây dựng kế hoạch học tập cá nhân hóa cho bạn.
          </p>
        </div>

        {/* --- PLACEMENT TEST BANNER (NEW) --- */}
        {/* Nếu chưa có suggestion (chưa làm test), hiển thị cái này */}
        {!suggestion?.hasSuggestion && (
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-1 shadow-xl mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
              <div className="flex items-start gap-5">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Bạn chưa rõ trình độ của mình?</h3>
                  <p className="text-indigo-100 leading-relaxed max-w-lg">
                    Hãy dành ít thời gian làm bài kiểm tra năng lực chuẩn hóa để hệ thống gợi ý lộ trình chính xác nhất cho bạn.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/tests')}
                className="shrink-0 px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all hover:-translate-y-1 whitespace-nowrap flex items-center gap-2"
              >
                <SparklesIcon className="h-5 w-5" />
                Kiểm tra ngay
              </button>
            </div>
          </div>
        )}

        {/* --- SUGGESTION BOX --- */}
        {suggestion?.hasSuggestion && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-1 shadow-lg shadow-indigo-500/10 mb-16 border border-indigo-100 animate-fade-in-up">
            <div className="bg-indigo-50/50 rounded-xl p-5 flex items-center gap-4">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-100">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 text-lg">Gợi ý từ kết quả kiểm tra</h3>
                <p className="text-slate-600 text-sm mt-0.5">
                  Bạn đạt <span className="font-bold text-indigo-600">{suggestion.data?.score.percentage}%</span>. 
                  Khuyến nghị bắt đầu từ: <span className="font-black text-indigo-600 text-base px-2 py-0.5 bg-indigo-100 rounded-md ml-1">{suggestion.data?.suggestedLevel}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- STEPS CONTAINER --- */}
        <div className="space-y-12">
          
          {/* Step 1: Current Level */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-lg">1</span>
              <h2 className="text-2xl font-bold text-slate-900">Trình độ hiện tại của bạn</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {LEVEL_GROUPS.map(lvl => (
                <LevelCard key={lvl} level={lvl} selected={currentLevel === lvl} onSelect={setCurrentLevel} />
              ))}
            </div>
          </section>

          {/* Step 2: Target Level */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-lg">2</span>
              <h2 className="text-2xl font-bold text-slate-900">Mục tiêu hướng tới</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {LEVEL_GROUPS.map(lvl => {
                const disabled = !!currentLevel && LEVEL_GROUPS.indexOf(lvl) < LEVEL_GROUPS.indexOf(currentLevel);
                return <LevelCard key={lvl} level={lvl} selected={targetLevel === lvl} onSelect={setTargetLevel} disabled={disabled} />;
              })}
            </div>
          </section>
        </div>

        {/* --- ROADMAP PREVIEW (NEW FEATURE) --- */}
        {previewStages.length > 0 && (
          <div className="mt-16 animate-fade-in-up">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 mt-2">Lộ trình dự kiến của bạn</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 relative">
                
                {/* Horizontal Line (Desktop) */}
                <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 -z-10 hidden md:block rounded-full" />

                {previewStages.map((stage, idx) => {
                  const info = LEVEL_INFO[stage];
                  const Icon = info.icon;
                  const isFirst = idx === 0;
                  const isLast = idx === previewStages.length - 1;

                  return (
                    <React.Fragment key={stage}>
                      {/* Arrow Connector (Mobile only or between items) */}
                      {idx > 0 && (
                        <div className="md:hidden">
                          <ArrowRightIcon className="h-6 w-6 text-slate-300 rotate-90" />
                        </div>
                      )}
                      
                      {/* Stage Node */}
                      <div className="flex-1 flex flex-col items-center text-center group w-full md:w-auto">
                        <div className={clsx(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white transition-transform group-hover:scale-110 relative z-10",
                          "bg-gradient-to-br", info.color,
                          "text-white"
                        )}>
                          <Icon className="h-8 w-8" />
                          {/* Step Number Badge */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full text-xs flex items-center justify-center font-bold border-2 border-white">
                            {idx + 1}
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 w-full md:w-auto min-w-[140px]">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {isFirst ? 'Bắt đầu' : isLast ? 'Đích đến' : `Chặng ${idx + 1}`}
                          </p>
                          <h4 className="font-bold text-slate-900 text-lg">{stage}</h4>
                          <p className="text-xs text-slate-500 font-medium">{info.label}</p>
                        </div>
                      </div>

                      {/* Arrow Connector (Desktop) */}
                      {idx < previewStages.length - 1 && (
                        <div className="hidden md:flex items-center px-4 text-slate-300">
                          <ArrowRightIcon className="h-6 w-6" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="mt-10 text-center border-t border-slate-100 pt-6">
                <p className="text-slate-500 text-sm">
                  Tổng thời gian dự kiến: <span className="font-bold text-slate-900">{previewStages.length * 6} tuần</span> 
                  <span className="mx-2">•</span>
                  Số chặng: <span className="font-bold text-slate-900">{previewStages.length}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- CTA FOOTER --- */}
        <div className="mt-16 flex justify-center pb-20">
          <button
            onClick={handleCreateRoadmap}
            disabled={!currentLevel || !targetLevel || loading}
            className="group relative px-12 py-5 bg-slate-900 text-white rounded-full font-bold text-xl shadow-2xl shadow-indigo-500/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? 'Đang khởi tạo...' : 'Bắt đầu hành trình ngay'} 
              {!loading && <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoadmapSetupPage;
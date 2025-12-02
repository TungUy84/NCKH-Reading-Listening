import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  BookOpenIcon, 
  SpeakerWaveIcon, 
  ClockIcon, 
  AcademicCapIcon,
  TrophyIcon,
  PlayCircleIcon
} from '@heroicons/react/24/solid'; // Dùng icon solid cho nổi bật
import clsx from 'clsx';
import { getPublicPractices } from '../../services/api';
import { PracticeSummary } from '../../types';
import Button from '../../components/ui/Button';

// Helper lấy màu gradient cho từng level
const getLevelGradient = (level: string) => {
  if (['AV1-AV3'].includes(level)) return 'from-emerald-400 to-teal-500 shadow-emerald-200';
  if (['AV4-AV5'].includes(level)) return 'from-amber-400 to-orange-500 shadow-amber-200';
  if (['AV6', 'AV7'].includes(level)) return 'from-rose-400 to-pink-500 shadow-rose-200';
  return 'from-blue-400 to-indigo-500 shadow-blue-200';
};

interface PracticeListResponse {
  message: string;
  data?: {
    items: PracticeSummary[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

const PracticeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'reading' | 'listening'>('reading');
  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [levelGroup, setLevelGroup] = useState<string>(searchParams.get('levelGroup') || '');
  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  const fetchPractices = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = { 
        page: pagination.page, 
        limit: pagination.limit, 
        skill: activeTab 
      };
      if (levelGroup) params.levelGroup = levelGroup;
      if (keyword.trim()) params.keyword = keyword.trim();

      const response = (await getPublicPractices(params)) as PracticeListResponse;
      setPractices(response?.data?.items || []);
      setPagination(response?.data?.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 });
    } catch (error) {
      console.error('Failed to fetch practices', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, levelGroup, keyword, pagination.page]);

  useEffect(() => { setPagination(p => ({ ...p, page: 1 })); }, [activeTab, levelGroup, keyword]);
  useEffect(() => { fetchPractices(); }, [fetchPractices]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50 via-white to-slate-50 -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center max-w-3xl mx-auto mb-10 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 mb-6 animate-bounce">
            <AcademicCapIcon className="h-4 w-4 text-amber-400" />
            <span>Thư viện Ôn luyện</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Chinh phục <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">kỹ năng</span> <br />
            bứt phá điểm số.
          </h1>
        </div>

        {/* --- FLOATING FILTER BAR --- */}
        <div className="sticky top-20 z-30 mb-12">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-2xl p-2 max-w-4xl mx-auto flex flex-col md:flex-row gap-2">
            
            {/* Tabs Switcher */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex shrink-0">
              <button
                onClick={() => setActiveTab('reading')}
                className={clsx(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                  activeTab === 'reading' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <BookOpenIcon className="h-5 w-5" /> Reading
              </button>
              <button
                onClick={() => setActiveTab('listening')}
                className={clsx(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300",
                  activeTab === 'listening' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <SpeakerWaveIcon className="h-5 w-5" /> Listening
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 my-auto hidden md:block mx-2" />

            {/* Filter Inputs */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bài tập..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full h-full pl-10 pr-4 bg-transparent rounded-xl focus:bg-slate-50 focus:outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-colors"
                />
              </div>
              
              <div className="relative w-40 shrink-0">
                <select 
                  value={levelGroup}
                  onChange={(e) => setLevelGroup(e.target.value)}
                  className="w-full h-full pl-3 pr-8 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
                >
                  <option value="">Mọi cấp độ</option>
                  <option value="AV1-AV3">Cơ bản</option>
                  <option value="AV4-AV5">Trung cấp</option>
                  <option value="AV6">Nâng cao</option>
                </select>
                <FunnelIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* --- LOADING SKELETON --- */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 h-80 shadow-sm animate-pulse flex flex-col gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                <div className="w-3/4 h-6 bg-slate-200 rounded-full mt-4" />
                <div className="w-full h-4 bg-slate-200 rounded-full" />
                <div className="w-2/3 h-4 bg-slate-200 rounded-full" />
                <div className="mt-auto w-full h-12 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* --- CONTENT GRID --- */}
        {!isLoading && practices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {practices.map((practice) => (
              <div 
                key={practice._id}
                onClick={() => navigate(`/practice/${practice._id}`)}
                className="group relative bg-white rounded-[2rem] p-1 border border-white shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-[2rem] -z-10" />
                
                <div className="p-6 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                      activeTab === 'reading' ? "from-blue-500 to-cyan-500 shadow-blue-200" : "from-purple-500 to-pink-500 shadow-purple-200"
                    )}>
                      {activeTab === 'reading' ? <BookOpenIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}
                    </div>
                    
                    <div className={clsx(
                      "px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                      getLevelGradient(practice.levelGroup)
                    )}>
                      {practice.levelGroup}
                    </div>
                  </div>

                  {/* Card Body */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {practice.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                    {practice.description || "Bài tập được thiết kế giúp bạn nắm vững kiến thức cốt lõi và nâng cao kỹ năng."}
                  </p>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <TrophyIcon className="h-4 w-4 text-amber-400" />
                        {practice.totalPoints} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {practice.estimatedTime || 15}'
                      </span>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <PlayCircleIcon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!isLoading && practices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
               <MagnifyingGlassIcon className="h-24 w-24 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy bài tập nào</h3>
            <p className="text-slate-500 max-w-md">
              Có vẻ như chưa có bài tập nào khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa hoặc cấp độ xem sao nhé!
            </p>
            <Button 
              className="mt-8 shadow-xl shadow-blue-500/20" 
              onClick={() => { setKeyword(''); setLevelGroup(''); }}
            >
              Làm mới bộ lọc
            </Button>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {pagination.totalPages > 1 && (
          <div className="mt-20 flex justify-center gap-4">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              &larr; Trang trước
            </button>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1"
            >
              Trang sau &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeListPage;
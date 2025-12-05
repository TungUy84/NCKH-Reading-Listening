import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { PlacementTest } from '../../types';
import { getActiveTests } from '../../services/api';
import Button from '../../components/ui/Button';

type PlacementCategory = 'listening' | 'reading' | '';
type MockTestSummary = Pick<PlacementTest, '_id' | 'title' | 'description' | 'category'> &
  Partial<Pick<PlacementTest, 'timeLimit' | 'totalQuestions'>>;

interface TestFilters {
  keyword: string;
  category: PlacementCategory;
}

// --- COLOR HELPERS (ĐỒNG BỘ TUYỆT ĐỐI) ---
const getSkillGradient = (category: string) => {
  return category === 'reading'
    ? 'from-blue-500 to-cyan-500 shadow-blue-200'
    : 'from-purple-500 to-pink-500 shadow-purple-200';
};

const getSkillColor = (category: string) => {
  return category === 'reading' ? 'text-blue-600' : 'text-purple-600';
};

const getSkillBg = (category: string) => {
  return category === 'reading' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-purple-50 border-purple-100 text-purple-700';
};

const MockTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<MockTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TestFilters>({ keyword: '', category: '' });
  const [activeFilters, setActiveFilters] = useState<TestFilters>({ keyword: '', category: '' });

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getActiveTests();
      const mockTests = (response.tests || []).filter((test: any) => test.testType === 'mock-exam');
      setTests(mockTests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
    AOS.init({ duration: 500, once: true });
  }, [fetchTests]);

  // Client-side filtering
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchCategory = activeFilters.category ? test.category === activeFilters.category : true;
      const matchKeyword = activeFilters.keyword
        ? test.title.toLowerCase().includes(activeFilters.keyword.toLowerCase())
        : true;
      return matchCategory && matchKeyword;
    });
  }, [tests, activeFilters]);

  const handleSearch = () => {
    setActiveFilters(filters);
  };

  const handleFilterChange = (key: keyof TestFilters, value: any) => {
    setFilters(prev => {
      const newState = { ...prev, [key]: value };
      if (key !== 'keyword') { // Auto apply category filter
        setActiveFilters(newState);
      }
      return newState;
    });
  };

  return (
    <div className="min-h-screen font-sans pb-20">

      {/* --- HERO HEADER --- */}
      <div className="pt-10 pb-10 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 text-amber-600 text-xs font-bold uppercase tracking-wider mb-6 animate-bounce shadow-sm">
            <StarIcon className="h-4 w-4 text-amber-500" />
            Cổng thi thử
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Đánh giá năng lực <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
              của bạn ngay hôm nay!
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8 items-start relative">

          {/* === SIDEBAR FILTERS (STICKY) === */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm transition-all duration-300 z-10" data-aos="fade-right">

            {/* Search */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-indigo-500" />
                Tìm kiếm đề thi
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên bài thi..."
                  value={filters.keyword}
                  onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-indigo-500" />
                Kỹ năng
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { value: '', label: 'Tất cả đề thi', icon: SparklesIcon, color: 'text-slate-600' },
                  { value: 'reading', label: 'Reading Test', icon: BookOpenIcon, color: 'text-blue-600' },
                  { value: 'listening', label: 'Listening Test', icon: SpeakerWaveIcon, color: 'text-purple-600' }
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isActive = filters.category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange('category', opt.value)}
                      className={clsx(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                        isActive
                          ? "bg-white shadow-md border-slate-200 ring-1 ring-slate-200"
                          : "bg-transparent border-transparent hover:bg-white/50 text-slate-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={clsx("h-5 w-5", isActive ? opt.color : "text-slate-400")} />
                        <span className={clsx(isActive ? "text-slate-900 font-bold" : "")}>{opt.label}</span>
                      </div>
                      {isActive && <div className={clsx("h-2 w-2 rounded-full", opt.value === 'reading' ? "bg-blue-500" : opt.value === 'listening' ? "bg-purple-500" : "bg-slate-400")} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset Button */}
            {(filters.keyword || filters.category) && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setFilters({ keyword: '', category: '' });
                  setActiveFilters({ keyword: '', category: '' });
                }}
                className="text-slate-500 hover:text-red-500 hover:bg-red-50"
              >
                <XMarkIcon className="h-4 w-4 mr-2" /> Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* === CONTENT LIST (HORIZONTAL CARDS) === */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              // Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-64 w-full shadow-sm border border-slate-100 animate-pulse" />
              ))
            ) : filteredTests.length > 0 ? (
              filteredTests.map((test, index) => (
                <div
                  key={test._id}
                  onClick={() => navigate(`/mock-test/${test._id}`)}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative flex flex-col md:flex-row bg-white/90 backdrop-blur-sm rounded-[2rem] border border-white/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* --- Left: Image/Icon Section --- */}
                  <div className={clsx(
                    "relative w-full md:w-72 h-40 md:h-auto shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br",
                    getSkillGradient(test.category)
                  )}>
                    {/* Icon lớn ở giữa */}
                    {test.category === 'reading' ? (
                      <BookOpenIcon className="h-20 w-20 text-white/30 rotate-12" />
                    ) : (
                      <SpeakerWaveIcon className="h-20 w-20 text-white/30 -rotate-12" />
                    )}

                    {/* Badge: Skill (Góc trên trái) */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30 shadow-sm">
                        {test.category}
                      </span>
                    </div>
                  </div>

                  {/* --- Right: Content Section --- */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                          Mock Exam
                        </span>
                      </div>

                      <h3 className={clsx(
                        "text-2xl font-bold text-slate-900 mb-3 line-clamp-2 transition-colors",
                        test.category === 'reading' ? "group-hover:text-blue-600" : "group-hover:text-purple-600"
                      )}>
                        {test.title}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                        {test.description || 'Bài thi thử chuẩn format quốc tế, giúp bạn rèn luyện kỹ năng và quản lý thời gian hiệu quả.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex gap-6 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <ClockIcon className={clsx("h-4 w-4", getSkillColor(test.category))} />
                          {test.timeLimit} phút
                        </span>
                        <span className="flex items-center gap-1.5">
                          <DocumentTextIcon className={clsx("h-4 w-4", getSkillColor(test.category))} />
                          {test.totalQuestions} câu hỏi
                        </span>
                      </div>

                      <span className={clsx(
                        "flex items-center gap-1 font-bold text-sm transition-transform group-hover:translate-x-1",
                        getSkillColor(test.category)
                      )}>
                        Chi tiết <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <DocumentTextIcon className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Không tìm thấy đề thi</h3>
                <p className="text-slate-500 mt-2">Hãy thử thay đổi bộ lọc tìm kiếm nhé.</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => { setFilters({ keyword: '', category: '' }); setActiveFilters({ keyword: '', category: '' }); }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestPage;
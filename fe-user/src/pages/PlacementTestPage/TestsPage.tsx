import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ClockIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TrophyIcon,
  PlayCircleIcon,
  BoltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';
import AOS from 'aos';
import 'aos/dist/aos.css';
import clsx from 'clsx';
import { PlacementTest } from '../../types';
import { getActiveTests, getTestForTaking } from '../../services/api';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

type PlacementCategory = 'listening' | 'reading';
type PlacementTestSummary = Pick<PlacementTest, '_id' | 'title' | 'description' | 'category'> &
  Partial<Pick<PlacementTest, 'timeLimit' | 'totalQuestions'>>;

const CATEGORY_ORDER: PlacementCategory[] = ['listening', 'reading'];

const CATEGORY_META: Record<PlacementCategory, {
  label: string;
  tabLabel: string;
  icon: any;
  gradient: string;
  shadowColor: string;
  activeTabClass: string;
  fallbackDescription: string;
  fallbackInstructions: string[];
}> = {
  listening: {
    label: 'Listening Test',
    tabLabel: 'Listening',
    icon: SpeakerWaveIcon,
    gradient: 'from-violet-600 via-fuchsia-600 to-purple-600',
    shadowColor: 'shadow-fuchsia-500/30',
    activeTabClass: 'bg-white text-fuchsia-600 shadow-lg shadow-fuchsia-200 ring-1 ring-fuchsia-100',
    fallbackDescription: 'Đánh giá khả năng nghe hiểu tiếng Anh qua nhiều tình huống thực tế.',
    fallbackInstructions: [
      'Sử dụng tai nghe chất lượng tốt để nghe rõ từng đoạn hội thoại.',
      'Bạn chỉ được nghe mỗi đoạn ghi âm một lần duy nhất.',
      'Trả lời theo đúng thứ tự câu hỏi hiển thị để không bỏ sót.'
    ],
  },
  reading: {
    label: 'Reading Test',
    tabLabel: 'Reading',
    icon: DocumentTextIcon,
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    shadowColor: 'shadow-cyan-500/30',
    activeTabClass: 'bg-white text-cyan-600 shadow-lg shadow-cyan-200 ring-1 ring-cyan-100',
    fallbackDescription: 'Kiểm tra kỹ năng đọc hiểu, suy luận và phân tích cấu trúc văn bản.',
    fallbackInstructions: [
      'Đọc kỹ yêu cầu trước khi trả lời từng câu hỏi.',
      'Quản lý thời gian giữa các đoạn văn để hoàn thành toàn bộ bài.',
      'Chú ý các từ khóa và cụm từ được lặp lại trong đoạn văn.'
    ],
  },
};

const TestsPage: React.FC = () => {
  const normalizeSectionTitle = useCallback((title?: string) => {
    if (!title) return '';
    return title.replace(/^(passage)/i, 'Part');
  }, []);

  const navigate = useNavigate();
  const [tests, setTests] = useState<PlacementTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<PlacementCategory>('listening');
  const [previewTest, setPreviewTest] = useState<PlacementTestSummary | null>(null);
  const [previewDetail, setPreviewDetail] = useState<PlacementTest | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const detailCache = useRef<Map<string, PlacementTest>>(new Map());

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Only fetch 'placement' type tests for this page
      const response = await getActiveTests(undefined, 'placement');
      setTests(response.tests || []);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách bài thi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
    AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });
  }, [fetchTests]);

  useEffect(() => {
    if (!tests.length) return;
    if (tests.some(test => test.category === activeTab)) return;
    const fallbackCategory = CATEGORY_ORDER.find(category => tests.some(test => test.category === category));
    if (fallbackCategory && fallbackCategory !== activeTab) {
      setActiveTab(fallbackCategory);
    }
  }, [tests, activeTab]);

  const getRandomTest = useCallback((pool: PlacementTestSummary[], excludeId?: string) => {
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    let candidate: PlacementTestSummary;
    do {
      candidate = pool[Math.floor(Math.random() * pool.length)];
    } while (candidate._id === excludeId);
    return candidate;
  }, []);

  useEffect(() => {
    const pool = tests.filter(test => test.category === activeTab);
    if (!pool.length) {
      setPreviewTest(null);
      return;
    }
    setPreviewTest(previous => {
      if (previous && pool.some(test => test._id === previous._id)) return previous;
      return getRandomTest(pool) ?? null;
    });
  }, [activeTab, tests, getRandomTest]);

  useEffect(() => {
    let ignore = false;
    const loadDetail = async () => {
      if (!previewTest) {
        setPreviewDetail(null);
        setIsDetailLoading(false);
        return;
      }
      const cached = detailCache.current.get(previewTest._id);
      if (cached) {
        setPreviewDetail(cached);
        setIsDetailLoading(false);
        return;
      }
      setPreviewDetail(null);
      setIsDetailLoading(true);
      try {
        const response = await getTestForTaking(previewTest._id);
        const detail = response?.test as PlacementTest | undefined;
        if (!ignore) {
          if (detail) {
            detailCache.current.set(previewTest._id, detail);
            setPreviewDetail(detail);
          } else setPreviewDetail(null);
        }
      } catch (err) {
        if (!ignore) setPreviewDetail(null);
      } finally {
        if (!ignore) setIsDetailLoading(false);
      }
    };
    loadDetail();
    return () => { ignore = true; };
  }, [previewTest]);

  const sectionsWithQuestions = useMemo(() => {
    if (!previewDetail) return [];
    const questionCountBySection = (previewDetail.questions || []).reduce<Record<string, number>>((acc, question) => {
      if (question.sectionId) acc[question.sectionId] = (acc[question.sectionId] || 0) + 1;
      return acc;
    }, {});
    return (previewDetail.sections || []).map(section => ({
      ...section,
      questionCount: questionCountBySection[section._id] || 0,
    }));
  }, [previewDetail]);

  const totalQuestions = useMemo(() => {
    if (previewDetail?.totalQuestions) return previewDetail.totalQuestions;
    if (previewTest?.totalQuestions) return previewTest.totalQuestions;
    if (!sectionsWithQuestions.length) return 0;
    return sectionsWithQuestions.reduce((sum, section) => sum + section.questionCount, 0);
  }, [previewDetail, previewTest, sectionsWithQuestions]);

  const handleStartTest = () => {
    if (!previewTest) {
      toast.warning('Hiện chưa có đề nào cho phần thi này. Vui lòng thử lại sau.');
      return;
    }
    setIsStarting(true);
    navigate(`/test/${previewTest._id}`);
  };

  const meta = CATEGORY_META[activeTab];
  const isListening = activeTab === 'listening';

  return (
    <div className="min-h-screen bg-transparent font-sans pb-20 pt-12 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* --- HERO HEADER --- */}
        <div className="text-center mb-10" data-aos="fade-down">
          {/* <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/60  text-xs font-extrabold uppercase tracking-widest mb-8 shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform cursor-default animate-bounce">
            <ClipboardDocumentCheckIcon className="h-4 w-4 text-indigo-500" />
            <span>Kiểm tra đầu vào</span>
          </div> */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900  tracking-tighter mb-6 leading-[1.1]">
            Kiểm tra năng lực{' '}
            <span className={clsx("text-transparent bg-clip-text bg-gradient-to-r", meta.gradient)}>
              của bản thân
            </span>
          </h1>
        </div>

        {/* --- TAB SWITCHER --- */}
        <div className="flex justify-center mb-10" data-aos="fade-up" data-aos-delay="100">
          <div className="bg-white/70 backdrop-blur-xl p-2.5 rounded-full border border-white/60 shadow-2xl shadow-slate-200/60 flex gap-3 relative">
            {CATEGORY_ORDER.map(tab => {
              const tabMeta = CATEGORY_META[tab];
              const Icon = tabMeta.icon;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "relative flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold transition-all duration-500 overflow-hidden group",
                    isActive ? tabMeta.activeTabClass : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                  )}
                >
                  <div className={clsx("absolute inset-0 opacity-0 transition-opacity duration-500", isActive ? "opacity-100" : "group-hover:opacity-10")}>
                    {/* Subtle background effect for active tab */}
                  </div>
                  <Icon className={clsx("h-6 w-6 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="relative z-10">{tabMeta.tabLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-10 bg-red-50/90 backdrop-blur-sm text-red-700 px-8 py-6 rounded-2xl border border-red-100 flex items-center justify-between animate-fade-in shadow-lg shadow-red-500/5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchTests} className="border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300">
              Thử lại
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader size="lg" />
            <p className="text-slate-400 font-medium animate-pulse">Đang chuẩn bị đề thi...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* --- INFO CARDS (Below Main Card) --- */}
            <div className="grid md:grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="300">

              {/* Instruction Card */}
              <div className="bg-white rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/40 p-10 relative overflow-hidden h-full group hover:shadow-2xl transition-shadow duration-500">
                <div className={clsx("absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-20 transition-opacity duration-500 group-hover:opacity-30", isListening ? "bg-fuchsia-400" : "bg-cyan-400")} />

                <h3 className="font-black text-slate-900 text-xl mb-8 flex items-center gap-4">
                  <div className={clsx("p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20", meta.gradient)}>
                    <InformationCircleIcon className="h-6 w-6 text-sky-600" />
                  </div>
                  Hướng dẫn làm bài
                </h3>

                <ul className="space-y-6 relative z-10">
                  {(isDetailLoading
                    ? meta.fallbackInstructions
                    : previewDetail?.instructions?.length ? previewDetail.instructions : meta.fallbackInstructions
                  ).map((inst, idx) => (
                    <li key={idx} className="flex gap-5 text-base text-slate-600 leading-relaxed group/li">
                      <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 shadow-sm", isListening ? "bg-fuchsia-50 text-fuchsia-600 group-hover/li:bg-fuchsia-600 group-hover/li:text-white group-hover/li:shadow-fuchsia-200" : "bg-cyan-50 text-cyan-600 group-hover/li:bg-cyan-600 group-hover/li:text-white group-hover/li:shadow-cyan-200")}>
                        <span className="text-sm font-bold">{idx + 1}</span>
                      </div>
                      <span className="group-hover/li:text-slate-900 transition-colors pt-1">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips Card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden h-full flex flex-col justify-center group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/40 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 group-hover:bg-purple-500/30 transition-colors duration-500" />

                <h3 className="font-black text-xl mb-8 flex items-center gap-4 relative z-10">
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                    <TrophyIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  Lưu ý quan trọng
                </h3>

                <div className="space-y-8 relative z-10">
                  <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                    Kết quả bài kiểm tra này sẽ là cơ sở để hệ thống xây dựng <span className="text-white font-bold border-b-2 border-indigo-400/50">lộ trình học tập cá nhân hóa</span> dành riêng cho bạn.
                  </p>

                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                    <div className="flex gap-4">
                      <div className="p-2 bg-emerald-500/20 rounded-full h-fit">
                        <ShieldCheckIcon className="h-6 w-6 text-emerald-400 shrink-0" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Hệ thống lưu tự động</h4>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed">
                          Đảm bảo kết nối mạng ổn định. Kết quả sẽ được ghi nhận ngay cả khi bạn mất kết nối tạm thời.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            {/* --- MAIN TEST CARD --- */}
            <div className="w-full" data-aos="fade-up" data-aos-delay="200">
              <div className={clsx(
                "group relative bg-white rounded-[3rem] border border-white/60 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]",
                meta.shadowColor
              )}>

                <div className="grid lg:grid-cols-12 min-h-[500px]">

                  {/* LEFT SIDE: VISUAL & CTA */}
                  <div className={clsx("lg:col-span-5 relative p-12 md:p-16 flex flex-col justify-between overflow-hidden bg-gradient-to-br", meta.gradient)}>
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    {/* Big Icon Decor */}
                    <div className="absolute -right-12 -bottom-12 text-white/10 transform rotate-12 transition-transform duration-1000 group-hover:rotate-6 group-hover:scale-110 group-hover:-translate-y-4">
                      {isListening ? <SpeakerWaveIcon className="h-[28rem] w-[28rem]" /> : <DocumentTextIcon className="h-[28rem] w-[28rem]" />}
                    </div>

                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold uppercase tracking-wide mb-8 shadow-inner">
                        <BoltIcon className="h-4 w-4 text-yellow-300" />
                        <span>Đề xuất thông minh</span>
                      </div>

                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg tracking-tight">
                        {previewTest ? previewTest.title : 'Đang tìm đề thi...'}
                      </h2>

                      <p className="text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-md border-l-4 border-white/30 pl-6">
                        {previewDetail?.description || previewTest?.description || meta.fallbackDescription}
                      </p>
                    </div>

                    <div className="relative z-10 mt-12">
                      <button
                        onClick={handleStartTest}
                        disabled={isStarting || !previewTest}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300 w-full hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isStarting ? (
                          <Loader size="sm" />
                        ) : (
                          <PlayCircleIcon className={clsx("h-7 w-7", isListening ? "text-fuchsia-600" : "text-cyan-600")} />
                        )}
                        <span>{isStarting ? 'Đang vào bài thi...' : 'Bắt đầu làm bài'}</span>
                      </button>
                    </div>
                  </div>

                  {/* RIGHT SIDE: DETAILS */}
                  <div className="lg:col-span-7 p-12 md:p-16 bg-white flex flex-col justify-center relative">
                    {/* Decorative background pattern */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                      <AcademicCapIcon className="w-64 h-64" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                      <div className="group/stat bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 flex flex-col items-center justify-center text-center">
                        <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform group-hover/stat:scale-110 duration-300", isListening ? "bg-purple-100 text-purple-600" : "bg-cyan-100 text-cyan-600")}>
                          <ClockIcon className="h-8 w-8" />
                        </div>
                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                          {previewDetail?.timeLimit || previewTest?.timeLimit || '--'}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-wider">Phút làm bài</span>
                      </div>

                      <div className="group/stat bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 flex flex-col items-center justify-center text-center">
                        <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform group-hover/stat:scale-110 duration-300", isListening ? "bg-fuchsia-100 text-fuchsia-600" : "bg-blue-100 text-blue-600")}>
                          <DocumentTextIcon className="h-8 w-8" />
                        </div>
                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                          {totalQuestions || '--'}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-wider">Câu hỏi</span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <ChartBarIcon className="h-5 w-5" />
                          Cấu trúc đề thi
                        </h3>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                          {sectionsWithQuestions.length} Phần thi
                        </span>
                      </div>

                      {isDetailLoading ? (
                        <div className="flex flex-col gap-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                          ))}
                        </div>
                      ) : sectionsWithQuestions.length > 0 ? (
                        <div className="space-y-3">
                          {sectionsWithQuestions.map((section, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group/item cursor-default">
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className={clsx(
                                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-300 shadow-sm",
                                  "bg-white text-slate-300 border border-slate-200",
                                  isListening
                                    ? "group-hover/item:bg-fuchsia-500 group-hover/item:text-white group-hover/item:border-fuchsia-500 group-hover/item:shadow-fuchsia-200"
                                    : "group-hover/item:bg-cyan-500 group-hover/item:text-white group-hover/item:border-cyan-500 group-hover/item:shadow-cyan-200"
                                )}>
                                  {idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Part {idx + 1}</p>
                                  <h4 className="font-bold text-slate-700 text-base truncate group-hover/item:text-indigo-900 transition-colors pr-4">
                                    {normalizeSectionTitle(section.title)}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                <span className={clsx(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-300 whitespace-nowrap",
                                  "bg-white border-slate-200 text-slate-500 shadow-sm",
                                  isListening
                                    ? "group-hover/item:text-fuchsia-600 group-hover/item:border-fuchsia-200 group-hover/item:bg-fuchsia-50"
                                    : "group-hover/item:text-cyan-600 group-hover/item:border-cyan-200 group-hover/item:bg-cyan-50"
                                )}>
                                  {section.questionCount}
                                  <span className="text-[10px] uppercase font-extrabold opacity-70">Câu</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-12 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center gap-3">
                          <InformationCircleIcon className="h-8 w-8 text-slate-300" />
                          <span>Thông tin chi tiết sẽ hiển thị khi bắt đầu.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
};

export default TestsPage;
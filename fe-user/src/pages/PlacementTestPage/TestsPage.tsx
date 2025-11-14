import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, CheckCircle, Clock, FileText, HeadphonesIcon } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { PlacementTest } from '../../types';
import { getActiveTests, getTestForTaking } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

type PlacementCategory = 'listening' | 'reading';
type PlacementTestSummary = Pick<PlacementTest, '_id' | 'title' | 'description' | 'category'> &
  Partial<Pick<PlacementTest, 'timeLimit' | 'totalQuestions'>>;

const CATEGORY_ORDER: PlacementCategory[] = ['listening', 'reading'];

const CATEGORY_META: Record<PlacementCategory, {
  label: string;
  tabLabel: string;
  icon: JSX.Element;
  gradient: string;
  activeTabClass: string;
  fallbackDescription: string;
  fallbackInstructions: string[];
}> = {
  listening: {
    label: 'Listening Placement Test',
    tabLabel: 'Listening',
    icon: <HeadphonesIcon className="w-12 h-12" />,
    gradient: 'from-emerald-500 to-emerald-700',
    activeTabClass: 'bg-emerald-600 text-white shadow-md',
    fallbackDescription: 'Đánh giá khả năng nghe hiểu tiếng Anh qua nhiều tình huống thực tế.',
    fallbackInstructions: [
      'Sử dụng tai nghe chất lượng tốt để nghe rõ từng đoạn hội thoại.',
      'Bạn chỉ được nghe mỗi đoạn ghi âm một lần, hãy tập trung tối đa.',
      'Trả lời theo đúng thứ tự câu hỏi hiển thị để không bỏ sót.'
    ],
  },
  reading: {
    label: 'Reading Placement Test',
    tabLabel: 'Reading',
    icon: <FileText className="w-12 h-12" />,
    gradient: 'from-purple-500 to-purple-700',
    activeTabClass: 'bg-purple-600 text-white shadow-md',
    fallbackDescription: 'Kiểm tra kỹ năng đọc hiểu, suy luận và phân tích cấu trúc văn bản.',
    fallbackInstructions: [
      'Đọc kỹ yêu cầu trước khi trả lời từng câu hỏi.',
      'Quản lý thời gian giữa các đoạn văn để hoàn thành toàn bộ bài.',
      'Chú ý các từ khóa và cụm từ được lặp lại trong đoạn văn.'
    ],
  },
};

// Trang liệt kê các đề kiểm tra đầu vào kèm xem trước thông tin chi tiết
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

  // Tải danh sách đề kiểm tra đang hoạt động cho từng danh mục
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveTests();
      setTests(response.tests || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách bài thi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    if (!tests.length) {
      return;
    }

    if (tests.some(test => test.category === activeTab)) {
      return;
    }

    // Nếu tab hiện tại không có đề, chọn danh mục đầu tiên còn dữ liệu
    const fallbackCategory = CATEGORY_ORDER.find(category => tests.some(test => test.category === category));

    if (fallbackCategory && fallbackCategory !== activeTab) {
      setActiveTab(fallbackCategory);
    }
  }, [tests, activeTab]);

  // Lấy ngẫu nhiên một đề trong danh sách, tránh lặp lại đề trước đó nếu có thể
  const getRandomTest = useCallback((pool: PlacementTestSummary[], excludeId?: string) => {
    if (!pool.length) {
      return null;
    }

    if (pool.length === 1) {
      return pool[0];
    }

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
      if (previous && pool.some(test => test._id === previous._id)) {
        return previous;
      }
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

      // Dùng cache trong phiên để giảm số lần gọi API cho cùng một đề
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
          } else {
            setPreviewDetail(null);
          }
        }
      } catch (err: unknown) {
        console.error('Không thể tải chi tiết bài test:', err);
        if (!ignore) {
          setPreviewDetail(null);
          toast.error('Không thể tải chi tiết bài kiểm tra. Vui lòng thử lại.');
        }
      } finally {
        if (!ignore) {
          setIsDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [previewTest]);

  const sectionsWithQuestions = useMemo(() => {
    if (!previewDetail) {
      return [];
    }

    const questionCountBySection = (previewDetail.questions || []).reduce<Record<string, number>>((acc, question) => {
      if (question.sectionId) {
        acc[question.sectionId] = (acc[question.sectionId] || 0) + 1;
      }
      return acc;
    }, {});

    return (previewDetail.sections || []).map(section => ({
      ...section,
      questionCount: questionCountBySection[section._id] || 0,
    }));
  }, [previewDetail]);

  const totalQuestions = useMemo(() => {
    if (previewDetail?.totalQuestions) {
      return previewDetail.totalQuestions;
    }

    if (previewTest?.totalQuestions) {
      return previewTest.totalQuestions;
    }

    if (!sectionsWithQuestions.length) {
      return 0;
    }

    return sectionsWithQuestions.reduce((sum, section) => sum + section.questionCount, 0);
  }, [previewDetail, previewTest, sectionsWithQuestions]);

  const handleStartTest = () => {
    if (!previewTest) {
      toast.warning('Hiện chưa có đề nào cho phần thi này. Vui lòng thử lại sau.');
      return;
    }

    setIsStarting(true);
    try {
      navigate(`/test/${previewTest._id}`);
    } finally {
      setIsStarting(false);
    }
  };

  const startButtonClasses = activeTab === 'reading'
    ? 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
    : 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700';

  const loadingState = (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-48" />
        <div className="p-8 space-y-6">
          <div className="h-6 w-1/3 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (!loading) {
      AOS.refresh();
    }
  }, [loading, activeTab, previewTest, previewDetail, sectionsWithQuestions.length]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white rounded-xl shadow-lg p-2 mb-8 max-w-md mx-auto"
          data-aos="fade-down"
        >
          <div className="flex">
            {CATEGORY_ORDER.map((tab) => {
              const meta = CATEGORY_META[tab];
              const Icon = tab === 'listening' ? HeadphonesIcon : FileText;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === tab
                    ? meta.activeTabClass
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{meta.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 text-red-700 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={fetchTests}>
                Thử lại
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          loadingState
        ) : (
          <>
            <div
              className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
              data-aos="fade-up"
            >
              <div
                className={`bg-gradient-to-r ${CATEGORY_META[activeTab].gradient} p-8 text-white`}
                data-aos="fade-up"
                data-aos-delay="50"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {CATEGORY_META[activeTab].icon}
                    <div>
                      <p className="text-sm uppercase tracking-wide text-white/70">Danh mục</p>
                      <h2 className="text-3xl font-bold">{CATEGORY_META[activeTab].label}</h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                    <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-brightness-110">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{previewDetail?.timeLimit || previewTest?.timeLimit ? `${previewDetail?.timeLimit ?? previewTest?.timeLimit} phút` : 'Không giới hạn thời gian'}</span>
                      </div>
                      <div className="w-px h-6 bg-white/30" />
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        <span>{totalQuestions ? `${totalQuestions} câu hỏi` : 'Chưa có dữ liệu'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-2 text-center md:text-left">
                  <p className="text-sm uppercase tracking-wide text-white/70">Đề được chọn</p>
                  <h3 className="text-2xl font-semibold">
                    {previewTest ? previewTest.title : 'Chưa có đề khả dụng'}
                  </h3>
                  <p className="text-sm text-white/80 max-w-3xl mx-auto md:mx-0">
                    {previewDetail?.description || previewTest?.description || CATEGORY_META[activeTab].fallbackDescription}
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-8" data-aos="fade-up" data-aos-delay="100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center md:text-left">
                    Cấu trúc bài thi
                  </h3>
                  {isDetailLoading ? (
                    <Card className="bg-gray-50 text-sm text-gray-600">
                      Đang tải cấu trúc bài thi...
                    </Card>
                  ) : sectionsWithQuestions.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sectionsWithQuestions.map(section => (
                        <div key={section._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-medium text-gray-900 leading-snug flex-1 break-words">
                              {normalizeSectionTitle(section.title)}
                            </h4>
                            <span className="text-sm text-blue-600 font-semibold whitespace-nowrap flex-shrink-0">
                              {section.questionCount} câu
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50 text-sm text-gray-600">
                      Thông tin về cấu trúc sẽ được cập nhật khi đề khả dụng.
                    </Card>
                  )}
                </div>

                <div className="mb-8" data-aos="fade-up" data-aos-delay="150">
                  <h3 className="font-semibold text-gray-900 mb-3">Hướng dẫn quan trọng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(isDetailLoading
                      ? CATEGORY_META[activeTab].fallbackInstructions
                      : previewDetail?.instructions?.length
                        ? previewDetail.instructions
                        : CATEGORY_META[activeTab].fallbackInstructions
                    ).map((instruction, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-gray-600"
                        data-aos="fade-up"
                        data-aos-delay={200 + index * 50}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-sm md:text-base">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center" data-aos="zoom-in" data-aos-delay="250">
                  <Button
                    onClick={handleStartTest}
                    disabled={isStarting || !previewTest}
                    loading={isStarting}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    size="lg"
                    className={`bg-gradient-to-r ${startButtonClasses} px-10 py-4 text-lg shadow-lg hover:shadow-xl`}
                  >
                    Bắt đầu kiểm tra
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-lg p-8 mb-12"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin quan trọng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div data-aos="fade-up" data-aos-delay="200">
                  <h3 className="font-semibold text-gray-900 mb-3">Trước khi bắt đầu</h3>
                  <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                    <li>• Chuẩn bị tai nghe chất lượng tốt (cho Listening test)</li>
                    <li>• Tìm không gian yên tĩnh, không bị gián đoạn</li>
                    <li>• Đảm bảo kết nối internet ổn định</li>
                    <li>• Chuẩn bị tinh thần tập trung trong suốt quá trình làm bài</li>
                  </ul>
                </div>
                <div data-aos="fade-up" data-aos-delay="250">
                  <h3 className="font-semibold text-gray-900 mb-3">Sau khi hoàn thành</h3>
                  <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                    <li>• Nhận kết quả và phân tích chi tiết ngay lập tức</li>
                    <li>• Được đề xuất lộ trình học tập cá nhân hóa</li>
                    <li>• Truy cập vào các bài luyện tập phù hợp với trình độ</li>
                    <li>• Theo dõi tiến độ học tập và cải thiện kỹ năng</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestsPage;

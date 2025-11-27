import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Clock, HeadphonesIcon, FileText, ArrowRight } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { PlacementTest } from '../../types';
import { getActiveTests } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

type PlacementCategory = 'listening' | 'reading';
type MockTestSummary = Pick<PlacementTest, '_id' | 'title' | 'description' | 'category'> &
  Partial<Pick<PlacementTest, 'timeLimit' | 'totalQuestions'>>;

const CATEGORY_ORDER: PlacementCategory[] = ['listening', 'reading'];

const CATEGORY_META: Record<PlacementCategory, {
  label: string;
  tabLabel: string;
  icon: JSX.Element;
  gradient: string;
  activeTabClass: string;
}> = {
  listening: {
    label: 'Mock Test Listening',
    tabLabel: 'Listening',
    icon: <HeadphonesIcon className="w-12 h-12" />,
    gradient: 'from-purple-500 to-purple-700',
    activeTabClass: 'bg-purple-600 text-white shadow-md',
  },
  reading: {
    label: 'Mock Test Reading',
    tabLabel: 'Reading',
    icon: <FileText className="w-12 h-12" />,
    gradient: 'from-violet-500 to-violet-700',
    activeTabClass: 'bg-violet-600 text-white shadow-md',
  },
};

const MockTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<MockTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PlacementCategory>('listening');

  // Tải danh sách bài thi thử (filter testType='mock-exam')
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveTests();
      // Filter chỉ lấy mock-exam
      const mockTests = (response.tests || []).filter((test: any) => test.testType === 'mock-exam');
      setTests(mockTests);
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

  // Filter tests theo category
  const filteredTests = useMemo(() => {
    return tests.filter(test => test.category === activeTab);
  }, [tests, activeTab]);

  // Kiểm tra category nào có tests
  const availableCategories = useMemo(() => {
    return CATEGORY_ORDER.filter(category => tests.some(test => test.category === category));
  }, [tests]);

  // Auto switch to available category
  useEffect(() => {
    if (!availableCategories.includes(activeTab) && availableCategories.length > 0) {
      setActiveTab(availableCategories[0]);
    }
  }, [availableCategories, activeTab]);

  const handleViewDetail = (testId: string) => {
    navigate(`/mock-test/${testId}`);
  };

  const meta = CATEGORY_META[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${meta.gradient} text-white py-16`}>
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center" data-aos="fade-down">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileCheck className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-black mb-4">Thi Thử IELTS</h1>
            <p className="text-xl text-purple-100">
              Làm quen với format thi thật, đánh giá năng lực và cải thiện kỹ năng
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12" data-aos="fade-up">
          {CATEGORY_ORDER.map(category => {
            const categoryMeta = CATEGORY_META[category];
            const isActive = activeTab === category;
            const hasTests = tests.some(test => test.category === category);

            return (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                disabled={!hasTests}
                className={`
                  px-8 py-4 rounded-2xl font-bold text-lg transition-all
                  ${isActive ? categoryMeta.activeTabClass : 'bg-white text-slate-600 hover:bg-slate-50'}
                  ${!hasTests && 'opacity-50 cursor-not-allowed'}
                  border-2 ${isActive ? 'border-transparent' : 'border-slate-200'}
                `}
              >
                {categoryMeta.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-600">Đang tải danh sách bài thi thử...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center border-red-200 bg-red-50">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <Button onClick={fetchTests} variant="primary">
                Thử lại
              </Button>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTests.length === 0 && (
          <div className="max-w-2xl mx-auto" data-aos="fade-up">
            <Card className="p-12 text-center">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${meta.gradient} bg-opacity-10 flex items-center justify-center mx-auto mb-6`}>
                {meta.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Chưa có bài thi thử {meta.tabLabel}
              </h3>
              <p className="text-slate-600">
                Hiện tại chưa có đề thi thử {meta.tabLabel.toLowerCase()} nào. Vui lòng quay lại sau.
              </p>
            </Card>
          </div>
        )}

        {/* Tests List */}
        {!loading && !error && filteredTests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, index) => (
              <Card
                key={test._id}
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={() => handleViewDetail(test._id)}
              >
                <div className={`h-2 rounded-t-xl bg-gradient-to-r ${meta.gradient}`} />
                <div className="p-6">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                      <FileCheck className="w-3 h-3" />
                      THI THỬ
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {test.title}
                  </h3>

                  {/* Description */}
                  {test.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {test.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    {test.timeLimit && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{test.timeLimit} phút</span>
                      </div>
                    )}
                    {test.totalQuestions && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>{test.totalQuestions} câu</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(test._id);
                    }}
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestPage;

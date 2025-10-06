import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlacementTest, TestFilters } from '../types';
import { getActiveTests } from '../services/api';
import TestCard from '../components/TestCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const TestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTestId, setLoadingTestId] = useState<string | null>(null);

  const [filters, setFilters] = useState<TestFilters>({
    category: 'all',
    search: '',
  });

  // Load tests on component mount
  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests when filters change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests, filters]);

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveTests();
      setTests(response.tests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách bài thi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tests];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(test => test.category === filters.category);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchLower) ||
        test.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTests(filtered);
  };

  const handleStartTest = async (testId: string) => {
    try {
      setLoadingTestId(testId);
      // Navigate to test taking page
      navigate(`/test/${testId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoadingTestId(null);
    }
  };

  const handleFilterChange = (newFilters: Partial<TestFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const loadingState = (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="flex justify-between mb-5">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
            <div className="h-6 w-12 bg-gray-200 rounded-full" />
          </div>
          <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-full bg-gray-100 rounded mb-2" />
          <div className="h-4 w-5/6 bg-gray-100 rounded mb-6" />
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="h-14 bg-gray-100 rounded-lg" />
            <div className="h-14 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-9 bg-gray-200 rounded-md" />
        </Card>
      ))}
    </div>
  );

  const categoryChips: { value: TestFilters['category']; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'listening', label: 'Nghe hiểu' },
    { value: 'reading', label: 'Đọc hiểu' }
  ];

  const emptyState = (
    <Card className="text-center py-16">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy bài test phù hợp</h3>
      <p className="text-sm text-gray-600 mb-6">
        {filters.category !== 'all' || filters.search
          ? 'Hãy điều chỉnh từ khóa hoặc chọn loại khác.'
          : 'Hiện chưa có bài test công khai.'}
      </p>
      {(filters.category !== 'all' || filters.search) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ category: 'all', search: '' })}
        >
          Xóa bộ lọc
        </Button>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Chọn bài kiểm tra phù hợp
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Luyện Listening hoặc Reading với ngân hàng câu hỏi liên tục được mở rộng.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryChips.map(c => {
              const active = filters.category === c.value;
              return (
                <Button
                  key={c.value}
                  size="sm"
                  variant={active ? 'primary' : 'outline'}
                  className={active ? '' : 'bg-white'}
                  onClick={() => handleFilterChange({ category: c.value })}
                >
                  {c.label}
                </Button>
              );
            })}
          </div>
          <div className="w-full lg:w-80">
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={e => handleFilterChange({ search: e.target.value })}
                placeholder="Tìm kiếm bài test..."
                className="w-full h-11 rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 shadow-sm"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange({ search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 text-red-700 text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={loadTests}>Thử lại</Button>
            </div>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          loadingState
        ) : filteredTests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map(test => (
              <TestCard
                key={test._id}
                test={test}
                onStart={handleStartTest}
                isLoading={loadingTestId === test._id}
              />
            ))}
          </div>
        ) : (
          emptyState
        )}
      </div>
    </div>
  );
};

export default TestsPage;

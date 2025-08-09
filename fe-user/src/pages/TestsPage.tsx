import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlacementTest, TestFilters } from '../types';
import { getActiveTests } from '../services/api';
import TestCard from '../components/TestCard';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="section-container py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách bài test...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn bài kiểm tra phù hợp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lựa chọn bài test Listening hoặc Reading để kiểm tra trình độ tiếng Anh của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Loại test:</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange({ category: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="listening">Nghe hiểu</option>
                <option value="reading">Đọc hiểu</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài test..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={loadTests}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Tests Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onStart={handleStartTest}
                isLoading={loadingTestId === test._id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Không tìm thấy bài test nào
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.category !== 'all' || filters.search 
                ? 'Thử thay đổi bộ lọc để tìm thấy bài test phù hợp'
                : 'Hiện tại chưa có bài test nào khả dụng'
              }
            </p>
            {(filters.category !== 'all' || filters.search) && (
              <button
                onClick={() => setFilters({ category: 'all', search: '' })}
                className="btn-secondary"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {filteredTests.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-6 bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{filteredTests.length}</div>
                <div className="text-sm text-gray-600">Bài test khả dụng</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredTests.reduce((total, test) => total + test.totalQuestions, 0)}
                </div>
                <div className="text-sm text-gray-600">Tổng câu hỏi</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestsPage;

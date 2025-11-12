import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPublicPractices } from '../../services/api';
import { PracticeSummary } from '../../types';

interface PracticeListResponse {
  message: string;
  data?: {
    items: PracticeSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 1
};

// Trang hiển thị danh sách bài ôn luyện với bộ lọc và phân trang.
const PracticeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [practices, setPractices] = useState<PracticeSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [skill, setSkill] = useState<'all' | 'reading' | 'listening'>(
    (searchParams.get('skill') as 'all' | 'reading' | 'listening') || 'all'
  );
  const [levelGroup, setLevelGroup] = useState<string>(searchParams.get('levelGroup') || '');
  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');

  // Hàm lấy danh sách bài ôn luyện dựa trên bộ lọc hiện tại.
  const fetchPractices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (skill !== 'all') {
        params.skill = skill;
      }
      if (levelGroup) {
        params.levelGroup = levelGroup;
      }
      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const response = (await getPublicPractices(params)) as PracticeListResponse;
      const items = response?.data?.items || [];
      const paginated = response?.data?.pagination || DEFAULT_PAGINATION;

      setPractices(items);
      setPagination({
        page: paginated.page || 1,
        limit: paginated.limit || DEFAULT_PAGINATION.limit,
        total: paginated.total || items.length,
        totalPages: paginated.totalPages || 1
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Không thể tải danh sách bài ôn luyện';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, levelGroup, pagination.limit, pagination.page, skill]);

  // Hàm cập nhật query string để giữ bộ lọc khi reload.
  const syncSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (skill !== 'all') params.set('skill', skill);
    if (levelGroup) params.set('levelGroup', levelGroup);
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (pagination.page > 1) params.set('page', String(pagination.page));

    setSearchParams(params, { replace: true });
  }, [keyword, levelGroup, pagination.page, setSearchParams, skill]);

  const handleResetFilters = () => {
    setSkill('all');
    setLevelGroup('');
    setKeyword('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleGotoDetail = (practiceId: string) => {
    navigate(`/practice/${practiceId}`);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage === pagination.page || nextPage > pagination.totalPages) {
      return;
    }
    setPagination((prev) => ({ ...prev, page: nextPage }));
  };

  useEffect(() => {
    syncSearchParams();
  }, [syncSearchParams]);

  useEffect(() => {
    fetchPractices();
  }, [fetchPractices]);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bài ôn luyện</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Lựa chọn bài ôn luyện theo kỹ năng và trình độ để rèn luyện mỗi ngày.
            </p>
          </div>
        </div>

        <div className="mt-10 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1" htmlFor="skill-filter">
                Kỹ năng
              </label>
              <select
                id="skill-filter"
                value={skill}
                onChange={(event) => {
                  setSkill(event.target.value as 'all' | 'reading' | 'listening');
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1" htmlFor="level-filter">
                Nhóm trình độ
              </label>
              <select
                id="level-filter"
                value={levelGroup}
                onChange={(event) => {
                  setLevelGroup(event.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="AV1-AV3">AV1-AV3</option>
                <option value="AV4-AV5">AV4-AV5</option>
                <option value="AV6">AV6</option>
                <option value="AV7">AV7</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1" htmlFor="keyword-filter">
                Từ khóa
              </label>
              <div className="flex gap-3">
                <input
                  id="keyword-filter"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      fetchPractices();
                    }
                  }}
                  placeholder="Tìm kiếm theo tiêu đề bài ôn luyện"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    setPagination((prev) => ({ ...prev, page: 1 }));
                    fetchPractices();
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Đang hiển thị {practices.length} bài | Trang {pagination.page}/{pagination.totalPages}
            </p>
            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        <div className="mt-10">
          {isLoading && (
            <p className="text-gray-500 text-center">Đang tải danh sách...</p>
          )}

          {error && !isLoading && (
            <p className="text-red-500 text-center">{error}</p>
          )}

          {!isLoading && !error && (
            <>
              {practices.length === 0 ? (
                <p className="text-gray-500 text-center">Chưa có bài ôn luyện phù hợp với bộ lọc.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {practices.map((practice) => (
                    <button
                      key={practice._id}
                      onClick={() => handleGotoDetail(practice._id)}
                      className="text-left bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase">
                          {practice.skill}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {practice.levelGroup}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mt-4">{practice.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {practice.description || 'Bài ôn luyện đang chờ bạn trải nghiệm.'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-5">
                        <span>{practice.totalQuestions} câu hỏi</span>
                        <span>•</span>
                        <span>{practice.totalPoints} điểm</span>
                        {typeof practice.estimatedTime === 'number' && practice.estimatedTime > 0 && (
                          <>
                            <span>•</span>
                            <span>{practice.estimatedTime} phút</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeListPage;

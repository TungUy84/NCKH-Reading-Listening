import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMyPracticeAttempts, getPracticeForLearner } from '../../services/api';
import { PracticeAttemptSummary, PracticeDetail } from '../../types';

interface PracticeDetailResponse {
  message: string;
  practice: PracticeDetail;
}

interface PracticeHistoryResponse {
  message: string;
  data?: {
    items: PracticeAttemptSummary[];
  };
}

// Hàm đổi điểm sang thang 10 để hiển thị ngắn gọn.
const convertToTenScale = (earnedPoints: number, totalPoints: number): number => {
  if (!totalPoints) return 0;
  return parseFloat(((earnedPoints / totalPoints) * 10).toFixed(2));
};

// Trang chi tiết bài ôn luyện và lịch sử làm bài của học viên.
const PracticeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceId } = useParams<{ practiceId: string }>();

  const [practice, setPractice] = useState<PracticeDetail | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const lastAttemptId = (location.state as { lastAttemptId?: string } | null)?.lastAttemptId;

  // Hàm lấy thông tin chi tiết bài ôn luyện.
  const fetchPracticeDetail = useCallback(async () => {
    if (!practiceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = (await getPracticeForLearner(practiceId)) as PracticeDetailResponse;
      if (!response?.practice) {
        throw new Error('Không tìm thấy bài ôn luyện');
      }
      setPractice(response.practice);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể tải chi tiết bài ôn luyện';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [practiceId]);

  // Hàm lấy lịch sử làm bài của người dùng cho bài hiện tại.
  const fetchHistory = useCallback(async () => {
    if (!practiceId) return;
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = (await getMyPracticeAttempts(practiceId, { page: 1, limit: 10 })) as PracticeHistoryResponse;
      const items = response?.data?.items || [];
      setAttempts(items);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể tải lịch sử làm bài';
      setHistoryError(message);
    } finally {
      setHistoryLoading(false);
    }
  }, [practiceId]);

  // Hàm điều hướng tới trang làm bài.
  const handleStartPractice = () => {
    if (!practiceId) return;
    navigate(`/practice/${practiceId}/take`);
  };

  const historyItems = useMemo(() => {
    return attempts.map((attempt) => ({
      id: attempt._id,
      createdAt: new Date(attempt.createdAt).toLocaleString('vi-VN'),
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      score10: convertToTenScale(attempt.earnedPoints, attempt.totalPoints)
    }));
  }, [attempts]);

  useEffect(() => {
    fetchPracticeDetail();
  }, [fetchPracticeDetail]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!practiceId) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-red-500">Thiếu thông tin bài ôn luyện.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-gray-500">Đang tải thông tin bài ôn luyện...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          practice && (
            <div className="space-y-10">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{practice.title}</h1>
                    <p className="text-gray-600 mt-3 whitespace-pre-line">{practice.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                        Kỹ năng: {practice.skill}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        Nhóm: {practice.levelGroup}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        {practice.totalQuestions} câu hỏi
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        {practice.totalPoints} điểm
                      </span>
                      {typeof practice.estimatedTime === 'number' && practice.estimatedTime > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                          ~{practice.estimatedTime} phút
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-3">
                    <button
                      onClick={handleStartPractice}
                      className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Làm bài
                    </button>
                    {lastAttemptId && (
                      <button
                        onClick={() => navigate(`/practice/attempts/${lastAttemptId}`)}
                        className="rounded-lg border border-blue-200 px-5 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Xem kết quả gần nhất
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử làm bài</h2>

                {historyLoading && <p className="text-gray-500">Đang tải lịch sử...</p>}
                {historyError && <p className="text-red-500">{historyError}</p>}

                {!historyLoading && !historyError && historyItems.length === 0 && (
                  <p className="text-sm text-gray-500">Bạn chưa có lịch sử làm bài cho nội dung này.</p>
                )}

                {!historyLoading && !historyError && historyItems.length > 0 && (
                  <div className="space-y-3">
                    {historyItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border px-4 py-3 ${
                          item.id === lastAttemptId ? 'border-blue-400 bg-blue-50/40' : 'border-gray-200'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Ngày làm: {item.createdAt}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Điểm: <span className="font-semibold text-blue-600">{item.score10}/10</span> • Tỉ lệ đúng {item.percentage}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.earnedPoints}/{item.totalPoints} điểm gốc
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.id === lastAttemptId && (
                            <span className="text-xs font-semibold text-blue-600 uppercase">Vừa hoàn thành</span>
                          )}
                          <button
                            onClick={() => navigate(`/practice/attempts/${item.id}`)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PracticeDetailPage;

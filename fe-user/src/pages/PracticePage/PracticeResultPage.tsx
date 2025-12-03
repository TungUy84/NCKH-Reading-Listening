import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPracticeAttemptDetail } from '../../services/api';
import {
  PracticeAttemptAnswer,
  PracticeAttemptDetail,
  PracticeDetail
} from '../../types';

interface AttemptDetailResponse {
  message: string;
  data?: {
    attempt: PracticeAttemptDetail;
    practice?: PracticeDetail | null;
  };
}

// Trang hiển thị chi tiết kết quả một lần làm bài ôn luyện.
const PracticeResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();

  const [attempt, setAttempt] = useState<PracticeAttemptDetail | null>(null);
  const [practice, setPractice] = useState<PracticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (!attempt) return null;
    return {
      score10: attempt.score || 0,
      percentage: attempt.percentage,
      earnedPoints: attempt.earnedPoints,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      skippedCount: attempt.skippedCount
    };
  }, [attempt]);

  // Hàm lấy chi tiết kết quả bài làm.
  const fetchAttemptDetail = useCallback(async () => {
    if (!attemptId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = (await getPracticeAttemptDetail(attemptId)) as AttemptDetailResponse;
      const attemptData = response?.data?.attempt;
      if (!attemptData) {
        throw new Error('Không tìm thấy lịch sử làm bài');
      }
      setAttempt(attemptData);

      const practiceData = response?.data?.practice || null;
      if (practiceData) {
        setPractice(practiceData);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể tải kết quả làm bài';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

  const renderAnswerDetails = (answer: PracticeAttemptAnswer) => {
    const hasOptions = Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0;
    const hasText = !!answer.userAnswer;
    const hasMatching = Array.isArray(answer.matchingAnswers) && answer.matchingAnswers.length > 0;

    if (!hasOptions && !hasText && !hasMatching) {
      return <p className="text-sm text-gray-500">Bạn đã bỏ qua câu hỏi này.</p>;
    }

    return (
      <div className="space-y-2 text-sm text-gray-700">
        {hasOptions && (
          <p>
            <span className="font-medium text-gray-800">Đáp án đã chọn:</span> {answer.selectedOptions.join(', ')}
          </p>
        )}
        {hasText && (
          <p>
            <span className="font-medium text-gray-800">Câu trả lời:</span> {answer.userAnswer}
          </p>
        )}
        {hasMatching && (
          <div className="space-y-1">
            <p className="font-medium text-gray-800">Các cặp đã chọn:</p>
            {answer.matchingAnswers?.map((pair) => (
              <p key={pair.prompt} className="text-gray-700">
                {pair.prompt}: {pair.selected}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchAttemptDetail();
  }, [fetchAttemptDetail]);

  if (!attemptId) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-red-500">Thiếu thông tin lịch sử làm bài.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-gray-500">Đang tải kết quả...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          attempt && (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Kết quả bài ôn luyện</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Hoàn thành ngày {new Date(attempt.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (!practice) return;
                      const destinationId = practice._id || practice._id;
                      if (destinationId) {
                        navigate(`/practice/${destinationId}`);
                      }
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Quay lại bài ôn luyện
                  </button>
                </div>
              </div>

              {practice && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900">{practice.title}</h2>
                  <p className="text-gray-600 mt-2">{practice.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                      Kỹ năng: {practice.skill}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                      Nhóm: {practice.levelGroup}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                      {practice.totalQuestions} câu hỏi
                    </span>
                  </div>
                </div>
              )}

              {summary && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-5">
                    <p className="text-sm text-blue-600">Điểm quy đổi</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{summary.score10}/10</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {summary.earnedPoints}/{practice?.totalQuestions || 0} câu đúng
                    </p>
                  </div>
                  <div className="bg-white border border-green-100 rounded-2xl shadow-sm p-5">
                    <p className="text-sm text-green-600">Tỉ lệ đúng</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{summary.percentage}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Đúng {summary.correctCount} • Sai {summary.incorrectCount} • Bỏ qua {summary.skippedCount}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {attempt.durationSeconds ? `${Math.round(attempt.durationSeconds / 60)} phút` : 'Không ghi nhận'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Bắt đầu: {attempt.startedAt ? new Date(attempt.startedAt).toLocaleString('vi-VN') : '—'}</p>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết từng câu hỏi</h3>
                <div className="space-y-4">
                  {attempt.answers.map((answer: PracticeAttemptAnswer) => (
                    <div
                      key={answer.questionId || answer.questionNumber}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                        <span className="text-gray-900">Câu {answer.questionNumber}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs uppercase ${
                            answer.isCorrect
                              ? 'bg-green-100 text-green-700'
                              : answer.isSkipped
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {answer.isCorrect ? 'Đúng' : answer.isSkipped ? 'Bỏ qua' : 'Sai'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {answer.earnedPoints === 1 ? '+1 điểm' : '0 điểm'}
                        </span>
                      </div>

                      <div className="mt-3 space-y-3">
                        {renderAnswerDetails(answer)}
                        {Array.isArray(answer.correctAnswers) && answer.correctAnswers.length > 0 && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">Đáp án đúng:</span>{' '}
                            {answer.correctAnswers.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PracticeResultPage;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, FileText, ArrowLeft, Eye, Clock } from 'lucide-react';
import { getTestAttemptDetail } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface Answer {
  questionId: string;
  questionNumber: number;
  type: string;
  selectedOptions: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  earnedPoints: number;
  isSkipped?: boolean;
}

interface ResultData {
  _id: string;
  testTitle: string;
  category: string;
  totalQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  ieltsScore?: number;
  avLevel?: string;
  recommendation?: string;
  durationSeconds: number;
  startedAt: string;
  completedAt: string;
  answers: Answer[];
}

interface QuestionTypeStats {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

const MockTestResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { resultId } = useParams<{ resultId: string }>();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      console.log('MockTestResultPage - resultId from URL:', resultId);
      
      if (!resultId) {
        setError('Result ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching result for ID:', resultId);
        const response = await getTestAttemptDetail(resultId);
        console.log('Result response:', response);
        console.log('Attempt data:', response?.data?.attempt);
        setResult(response?.data?.attempt);
      } catch (err: any) {
        console.error('Failed to fetch result:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.message || 'Failed to load result');
        toast.error('Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  // Calculate statistics by question type
  const statsByType = React.useMemo(() => {
    if (!result?.answers) return {};

    const stats: Record<string, QuestionTypeStats> = {};
    
    result.answers.forEach((ans) => {
      if (!stats[ans.type]) {
        stats[ans.type] = { total: 0, correct: 0, incorrect: 0, skipped: 0 };
      }
      
      stats[ans.type].total++;
      if (ans.isSkipped) {
        stats[ans.type].skipped++;
      } else if (ans.isCorrect) {
        stats[ans.type].correct++;
      } else {
        stats[ans.type].incorrect++;
      }
    });

    return stats;
  }, [result]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải kết quả</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy kết quả'}</p>
          <Button variant="primary" onClick={() => navigate('/mock-test')}>
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="section-container max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/mock-test')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{result.testTitle}</h1>
          <p className="text-gray-600">Kết quả thi thử</p>
        </div>

        {/* Overall Statistics */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score */}
              <div className="text-center">
                <div className="text-5xl font-black mb-2">{result.percentage.toFixed(1)}%</div>
                <div className="text-purple-100">Điểm tổng</div>
              </div>

              {/* Duration */}
              <div className="text-center">
                <div className="text-5xl font-black mb-2">{formatDuration(result.durationSeconds)}</div>
                <div className="text-purple-100">Thời gian làm bài</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{result.correctCount}</span>
                </div>
                <div className="text-sm text-gray-600">Đúng</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{result.incorrectCount}</span>
                </div>
                <div className="text-sm text-gray-600">Sai</div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-400">{result.skippedCount}</span>
                </div>
                <div className="text-sm text-gray-600">Bỏ qua</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics by Question Type */}
        {Object.keys(statsByType).length > 0 && (
          <Card className="mb-8 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Thống kê theo dạng câu hỏi
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dạng câu hỏi</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Tổng</th>
                    <th className="text-center py-3 px-4 font-semibold text-green-600">Đúng</th>
                    <th className="text-center py-3 px-4 font-semibold text-red-600">Sai</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-500">Bỏ qua</th>
                    <th className="text-center py-3 px-4 font-semibold text-purple-600">Độ chính xác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statsByType).map(([type, stats]) => {
                    const accuracy = stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={type} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                          {type.replace('_', ' ')}
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">{stats.total}</td>
                        <td className="text-center py-3 px-4 text-green-600 font-semibold">{stats.correct}</td>
                        <td className="text-center py-3 px-4 text-red-600 font-semibold">{stats.incorrect}</td>
                        <td className="text-center py-3 px-4 text-gray-500">{stats.skipped}</td>
                        <td className="text-center py-3 px-4 text-purple-600 font-bold">{accuracy}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Answer Key Grid */}
        <Card className="mb-8 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            Đáp án
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {result.answers.map((ans, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-bold
                  ${ans.isSkipped 
                    ? 'bg-gray-200 text-gray-500' 
                    : ans.isCorrect 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-red-100 text-red-700 border-2 border-red-300'
                  }
                `}
                title={`Question ${ans.questionNumber}: ${ans.isSkipped ? 'Skipped' : ans.isCorrect ? 'Correct' : 'Incorrect'}`}
              >
                {ans.questionNumber}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-gray-700">Đúng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
              <span className="text-gray-700">Sai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span className="text-gray-700">Bỏ qua</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/mock-test/result/${resultId}/details`)}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Eye className="w-5 h-5" />
            Xem chi tiết đáp án
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/mock-test')}
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </Button>
        </div>

        {/* Metadata */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Hoàn thành lúc {new Date(result.completedAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestResultPage;
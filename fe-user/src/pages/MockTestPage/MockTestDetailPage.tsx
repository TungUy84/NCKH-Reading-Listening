import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Play, 
  History,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  FileCheck
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getTestForTaking, getMyTestHistory } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface TestDetail {
  _id: string;
  title: string;
  description?: string;
  category: string;
  timeLimit: number;
  totalQuestions: number;
  sections: Array<{
    _id: string;
    title: string;
    passage?: string;
  }>;
}

interface AttemptHistory {
  _id: string;
  percentage: number;
  ieltsScore?: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  durationSeconds: number;
  completedAt: string;
}

const MockTestDetailPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [attempts, setAttempts] = useState<AttemptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    const fetchTestDetail = async () => {
      if (!testId) {
        setError('Test ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getTestForTaking(testId);
        setTest(response.test);
      } catch (err: any) {
        console.error('Failed to fetch test:', err);
        setError(err.response?.data?.message || 'Failed to load test details');
        toast.error('Failed to load test details');
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetail();
  }, [testId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!testId) return;

      try {
        setHistoryLoading(true);
        const response = await getMyTestHistory(testId, { page: 1, limit: 10 });
        setAttempts(response.data?.items || []);
      } catch (err: any) {
        console.error('Failed to fetch history:', err);
        // Don't show error toast for history, just log it
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [testId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartTest = () => {
    if (!testId) return;
    navigate(`/mock-test/${testId}/take`);
  };

  const handleViewResult = (attemptId: string) => {
    navigate(`/mock-test/result/${attemptId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Test does not exist'}</p>
          <Button variant="primary" onClick={() => navigate('/mock-test')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Mock Tests
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="section-container max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/mock-test')}
          className="mb-6"
          data-aos="fade-right"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mock Tests
        </Button>

        {/* Test Header */}
        <div className="mb-8" data-aos="fade-down">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase">
                  {test.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                  Mock Test
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{test.title}</h1>
            </div>
          </div>
          {test.description && (
            <p className="text-lg text-gray-600 leading-relaxed">{test.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Test Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Overview */}
            <Card className="p-6" data-aos="fade-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Test Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{test.timeLimit}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-lg border border-violet-100">
                  <FileText className="w-8 h-8 text-violet-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{test.totalQuestions}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Test Sections */}
            <Card className="p-6" data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Test Sections
              </h2>
              <div className="space-y-3">
                {test.sections.map((section, index) => (
                  <div
                    key={section._id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                        {section.passage && (
                          <p className="text-sm text-gray-600 line-clamp-2">{section.passage.substring(0, 150)}...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Test History */}
            <Card className="p-6" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-6 h-6 text-purple-600" />
                Lịch sử làm bài ({attempts.length})
              </h2>

              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="h-8 w-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Đang tải lịch sử...</p>
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Bạn chưa làm bài thi này</p>
                  <p className="text-sm text-gray-500 mt-2">Bắt đầu làm bài ngay!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.map((attempt, index) => (
                    <div
                      key={attempt._id}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                      onClick={() => handleViewResult(attempt._id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-gray-500">
                            Attempt #{attempts.length - index}
                          </div>
                          {attempt.ieltsScore && (
                            <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                              IELTS {attempt.ieltsScore.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {attempt.percentage.toFixed(1)}%
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="flex items-center gap-1 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{attempt.correctCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">{attempt.incorrectCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatDuration(attempt.durationSeconds)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(attempt.completedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Start Test Card */}
            <Card className="p-6 sticky top-6" data-aos="fade-left">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
                <p className="text-sm text-gray-600">
                  Test your skills with this {test.category} mock exam
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg"
              >
                <Play className="w-5 h-5" />
                Start Test
              </Button>

              {attempts.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold">
                      Best Score: {Math.max(...attempts.map(a => a.percentage)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Tips Card */}
            <Card className="p-6" data-aos="fade-left" data-aos-delay="100">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Find a quiet place without distractions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Use headphones for better audio quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Read all questions carefully before answering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Manage your time wisely across sections</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestDetailPage;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStageDetail, syncRoadmapContent } from '../../services/api';
import { StageDetailResponse, RoadmapLevelGroup } from '../../types';
import { BookOpen, Headphones, CheckCircle, Circle } from 'lucide-react';

const StageDetailPage: React.FC = () => {
  const { levelGroup } = useParams<{ levelGroup: RoadmapLevelGroup }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<StageDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reading' | 'listening'>('reading');

  useEffect(() => {
    if (levelGroup) {
      loadStageDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelGroup]);

  const loadStageDetail = async () => {
    try {
      setLoading(true);
      
      // Sync content trước để có nội dung mới nhất
      try {
        await syncRoadmapContent();
      } catch (err) {
        console.log('Sync skipped');
      }
      
      const res = await getStageDetail(levelGroup as RoadmapLevelGroup);
      setData(res.data);
    } catch (err: any) {
      toast.error('Không thể tải chi tiết chặng');
      navigate('/roadmap');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stage, content, checkpointTest, requirements } = data;
  const skillContent = content[activeTab];
  const skillProgress = stage.progress[activeTab];

  // Calculate totals from actual content in stage
  const totalItems = skillContent.lessons.length + skillContent.practices.length;
  const completedItems = skillProgress.completedLessons.length + skillProgress.completedPractices.length;
  const skillPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/roadmap')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Quay lại lộ trình
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chặng: {stage.levelGroup}
          </h1>
          <p className="text-gray-600 mt-2">
            Hoàn thành tất cả nội dung để mở khóa bài kiểm tra chặng
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tiến độ tổng thể</h2>
            <span className="text-2xl font-bold text-blue-600">{stage.progress.overallPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${stage.progress.overallPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Reading</div>
              <div className="font-semibold">
                {stage.progress.reading.completedLessons.length + stage.progress.reading.completedPractices.length}/
                {content.reading.lessons.length + content.reading.practices.length}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Listening</div>
              <div className="font-semibold">
                {stage.progress.listening.completedLessons.length + stage.progress.listening.completedPractices.length}/
                {content.listening.lessons.length + content.listening.practices.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('reading')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'reading'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Reading
            </button>
            <button
              onClick={() => setActiveTab('listening')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'listening'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Headphones className="w-5 h-5" />
              Listening
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Tiến độ {activeTab === 'reading' ? 'Reading' : 'Listening'}</span>
                <span className="font-semibold">{skillPercentage}% ({completedItems}/{totalItems})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${skillPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Lessons */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📖 Lessons - Lý thuyết & Chiến lược
              </h3>
              {skillContent.lessons.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có lesson nào</p>
              ) : (
                <div className="space-y-3">
                  {skillContent.lessons.map((lesson, index) => {
                    const isCompleted = skillProgress.completedLessons.includes(lesson._id);
                    return (
                      <div
                        key={lesson._id}
                        className={`border rounded-lg p-4 transition-all ${
                          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {index + 1}. {lesson.title}
                            </h4>
                            {lesson.summary && (
                              <p className="text-sm text-gray-600 mb-2">{lesson.summary}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {isCompleted && <span className="text-green-600 font-medium">✓ Đã xem</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => navigate(`/lessons/${lesson._id}`)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isCompleted
                                  ? 'border border-green-600 text-green-700 hover:bg-green-100'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isCompleted ? 'Xem lại' : 'Xem ngay'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Practices */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✍️ Practices - Bài tập thực hành
              </h3>
              {skillContent.practices.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có practice nào</p>
              ) : (
                <div className="space-y-3">
                  {skillContent.practices.map((practice, index) => {
                    const isCompleted = skillProgress.completedPractices.includes(practice._id);
                    return (
                      <div
                        key={practice._id}
                        className={`border rounded-lg p-4 transition-all ${
                          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {index + 1}. {practice.title}
                            </h4>
                            {practice.description && (
                              <p className="text-sm text-gray-600 mb-2">{practice.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{practice.totalQuestions} câu</span>
                              {practice.estimatedTime && <span>• ~{practice.estimatedTime} phút</span>}
                              {isCompleted && <span className="text-green-600 font-medium">• ✓ Đã hoàn thành</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => navigate(`/practice/${practice._id}`)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isCompleted
                                  ? 'border border-green-600 text-green-700 hover:bg-green-100'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isCompleted ? 'Xem kết quả' : 'Làm bài'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Checkpoint Info */}
        {stage.status === 'checkpoint-ready' && checkpointTest && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Bài kiểm tra chặng - Đã mở khóa
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{checkpointTest.title}</h4>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Thời gian:</span> {checkpointTest.timeLimit} phút
                </div>
                <div>
                  <span className="font-medium">Số câu:</span> {checkpointTest.totalQuestions}
                </div>
                <div>
                  <span className="font-medium">Điểm đạt:</span> ≥{requirements.passingScore}%
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 border-2 border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-100 font-semibold"
              >
                📖 Ôn tập lại
              </button>
              <button
                onClick={() => navigate(`/placement-test/${checkpointTest._id}/take`, {
                  state: { 
                    isCheckpoint: true, 
                    levelGroup: stage.levelGroup,
                    testId: checkpointTest._id
                  }
                })}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
              >
                🚀 Làm bài kiểm tra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageDetailPage;

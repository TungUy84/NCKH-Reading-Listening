import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCurrentUserRoadmap, syncRoadmapContent } from '../../services/api';
import { UserRoadmap, RoadmapStage } from '../../types';
import { CheckCircle, Lock, PlayCircle, Award } from 'lucide-react';

const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<UserRoadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      
      // Đồng bộ content từ template trước (để có content mới nhất)
      try {
        await syncRoadmapContent();
        console.log('✓ Synced roadmap content from template');
      } catch (syncErr) {
        // Nếu sync fail (vd: chưa có roadmap), tiếp tục load
        console.log('Sync skipped:', syncErr);
      }
      
      const res = await getCurrentUserRoadmap();
      
      if (!res.hasRoadmap || !res.data) {
        // Chưa có roadmap -> chuyển sang setup
        navigate('/roadmap/setup');
        return;
      }
      
      setRoadmap(res.data);
    } catch (err: any) {
      console.error('Error loading roadmap:', err);
      toast.error('Không thể tải lộ trình. Vui lòng thử lại.');
      // Nếu có lỗi nghiêm trọng, redirect về home
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
      case 'checkpoint-ready':
        return <PlayCircle className="w-6 h-6 text-blue-600" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Hoàn thành</span>;
      case 'checkpoint-ready':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Sẵn sàng kiểm tra</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Đang học</span>;
      case 'locked':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">Bị khóa</span>;
      default:
        return null;
    }
  };

  const calculateDaysLearning = () => {
    if (!roadmap) return 0;
    const created = new Date(roadmap.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOverallProgress = () => {
    if (!roadmap) return 0;
    const totalStages = roadmap.stages.length;
    const completedStages = roadmap.stages.filter(s => s.status === 'completed').length;
    const inProgressStages = roadmap.stages.filter(s => s.status === 'in-progress' || s.status === 'checkpoint-ready');
    
    // Nếu có stage đang học, tính thêm progress của stage đó
    if (inProgressStages.length > 0) {
      const currentStage = inProgressStages[0];
      const stageProgress = currentStage.progress.overallPercentage / 100;
      return Math.round(((completedStages + stageProgress) / totalStages) * 100);
    }
    
    return Math.round((completedStages / totalStages) * 100);
  };

  const getEstimatedWeeksRemaining = () => {
    if (!roadmap) return 0;
    const remainingStages = roadmap.stages.filter(s => s.status !== 'completed').length;
    return remainingStages * 6; // 6 tuần mỗi chặng
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải lộ trình...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return null;
  }

  const overallProgress = getOverallProgress();
  const daysLearning = calculateDaysLearning();
  const weeksRemaining = getEstimatedWeeksRemaining();
  const currentStageIndex = roadmap.stages.findIndex(s => s.status === 'in-progress' || s.status === 'checkpoint-ready');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🗺️ Lộ trình học tập của bạn
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Trang chủ
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Tổng quan</h2>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                Trình độ hiện tại: <span className="font-semibold">{roadmap.currentLevel}</span>
                <span className="mx-2">→</span>
                Mục tiêu: <span className="font-semibold">{roadmap.targetLevel}</span>
              </span>
              <span className="font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>
              Chặng <span className="font-semibold">{currentStageIndex + 1}/{roadmap.stages.length}</span> đang học
            </span>
            <span>•</span>
            <span>
              <span className="font-semibold">{daysLearning}</span> ngày đã học
            </span>
            <span>•</span>
            <span>
              Còn ~<span className="font-semibold">{weeksRemaining}</span> tuần
            </span>
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">🛣️ Các chặng học tập</h2>

          {roadmap.stages.map((stage, index) => {
            const isLocked = stage.status === 'locked';
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'in-progress' || stage.status === 'checkpoint-ready';
            const canTakeCheckpoint = stage.status === 'checkpoint-ready';
            
            // Calculate totals from actual content in stage
            const totalReadingItems = stage.content.reading.lessons.length + stage.content.reading.practices.length;
            const completedReadingItems = stage.progress.reading.completedLessons.length + stage.progress.reading.completedPractices.length;
            
            const totalListeningItems = stage.content.listening.lessons.length + stage.content.listening.practices.length;
            const completedListeningItems = stage.progress.listening.completedLessons.length + stage.progress.listening.completedPractices.length;

            return (
              <div
                key={stage._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Stage Header */}
                <div className={`p-6 ${isCompleted ? 'bg-green-50' : isActive ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Chặng {index + 1}: {stage.levelGroup}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isCompleted ? 'Đã hoàn thành' : isActive ? 'Đang học' : 'Chưa mở khóa'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(stage.status)}
                  </div>

                  {/* Progress Bar */}
                  {!isLocked && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Tiến độ</span>
                        <span className="font-semibold">{stage.progress.overallPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${stage.progress.overallPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stage Content */}
                {!isLocked && (
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Reading */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          📚 Reading ({completedReadingItems}/{totalReadingItems} hoàn thành)
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lessons:</span>
                            <span className="font-medium">
                              {stage.progress.reading.completedLessons.length}/{stage.content.reading.lessons.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Practices:</span>
                            <span className="font-medium">
                              {stage.progress.reading.completedPractices.length}/{stage.content.reading.practices.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Listening */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          🎧 Listening ({completedListeningItems}/{totalListeningItems} hoàn thành)
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lessons:</span>
                            <span className="font-medium">
                              {stage.progress.listening.completedLessons.length}/{stage.content.listening.lessons.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Practices:</span>
                            <span className="font-medium">
                              {stage.progress.listening.completedPractices.length}/{stage.content.listening.practices.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {canTakeCheckpoint ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-yellow-900 mb-1">
                              🎯 Bài kiểm tra chặng - Đã mở khóa
                            </h5>
                            <p className="text-sm text-yellow-800 mb-3">
                              Xuất sắc! Bạn đã hoàn thành tất cả nội dung chặng {index + 1}. 
                              Làm bài kiểm tra để mở khóa chặng tiếp theo.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/roadmap/stage/${stage.levelGroup}`)}
                                className="px-4 py-2 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm"
                              >
                                📖 Ôn tập lại
                              </button>
                              <button
                                onClick={() => {
                                  // Navigate to checkpoint test
                                  if (stage.checkpointTestId) {
                                    navigate(`/placement-test/${stage.checkpointTestId}/take`);
                                  }
                                }}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                              >
                                🚀 Làm bài kiểm tra
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isActive && stage.progress.overallPercentage < 100 ? (
                      <div className="flex justify-end">
                        <button
                          onClick={() => navigate(`/roadmap/stage/${stage.levelGroup}`)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Tiếp tục học →
                        </button>
                      </div>
                    ) : isCompleted && stage.checkpointResult ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-900">
                              Đã hoàn thành chặng {index + 1}
                            </p>
                            <p className="text-sm text-green-700">
                              Điểm kiểm tra: {stage.checkpointResult.score}% • 
                              {stage.checkpointResult.passed ? ' Đạt' : ' Chưa đạt'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Locked Stage */}
                {isLocked && (
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">Chặng này đang bị khóa</p>
                      <p className="text-sm mt-1">
                        Hoàn thành chặng {index} và đạt điểm kiểm tra để mở khóa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completed Roadmap */}
        {roadmap.status === 'completed' && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-8 text-center">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <Award className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              🎊 Chúc mừng! Bạn đã hoàn thành lộ trình!
            </h2>
            <p className="text-green-700 mb-4">
              Bạn đã vượt qua tất cả {roadmap.stages.length} chặng từ {roadmap.currentLevel} đến {roadmap.targetLevel}
            </p>
            <button
              onClick={() => navigate('/lessons')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Tiếp tục học nâng cao →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;

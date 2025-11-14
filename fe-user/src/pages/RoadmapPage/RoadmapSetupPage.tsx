import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createUserRoadmap, getSuggestedLevel } from '../../services/api';
import { RoadmapLevelGroup, SuggestedLevelResponse } from '../../types';

const LEVEL_GROUPS: RoadmapLevelGroup[] = ['AV1-AV3', 'AV4-AV5', 'AV6', 'AV7'];

const LEVEL_INFO: Record<RoadmapLevelGroup, { label: string; description: string; color: string }> = {
  'AV1-AV3': {
    label: 'Cơ bản',
    description: 'Nền tảng từ vựng và ngữ pháp cơ bản',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  'AV4-AV5': {
    label: 'Trung cấp',
    description: 'Phát triển kỹ năng đọc và nghe',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  'AV6': {
    label: 'Khá',
    description: 'Nâng cao khả năng phân tích',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  'AV7': {
    label: 'Tiên tiến',
    description: 'Hoàn thiện kỹ năng học thuật',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  }
};

const RoadmapSetupPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentLevel, setCurrentLevel] = useState<RoadmapLevelGroup | ''>('');
  const [targetLevel, setTargetLevel] = useState<RoadmapLevelGroup | ''>('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestedLevelResponse | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);

  useEffect(() => {
    loadSuggestion();
  }, []);

  const loadSuggestion = async () => {
    try {
      setLoadingSuggestion(true);
      const res = await getSuggestedLevel();
      setSuggestion(res);
      
      // Auto-fill current level nếu có suggestion
      if (res.hasSuggestion && res.data?.suggestedLevel) {
        setCurrentLevel(res.data.suggestedLevel);
      }
    } catch (err) {
      console.error('Failed to load suggestion:', err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleCreateRoadmap = async () => {
    if (!currentLevel || !targetLevel) {
      toast.error('Vui lòng chọn trình độ hiện tại và mục tiêu');
      return;
    }

    const currentIdx = LEVEL_GROUPS.indexOf(currentLevel);
    const targetIdx = LEVEL_GROUPS.indexOf(targetLevel);

    if (targetIdx < currentIdx) {
      toast.error('Mục tiêu phải cao hơn hoặc bằng trình độ hiện tại');
      return;
    }

    try {
      setLoading(true);
      await createUserRoadmap({
        currentLevel,
        targetLevel
      });
      
      toast.success('Tạo lộ trình thành công!');
      navigate('/roadmap');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const calculateStages = () => {
    if (!currentLevel || !targetLevel) return 0;
    const currentIdx = LEVEL_GROUPS.indexOf(currentLevel);
    const targetIdx = LEVEL_GROUPS.indexOf(targetLevel);
    return targetIdx - currentIdx + 1;
  };

  const getEstimatedWeeks = () => {
    const stages = calculateStages();
    return stages * 6; // 6 tuần mỗi chặng
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Tạo lộ trình học tập cá nhân
          </h1>
          <p className="text-lg text-gray-600">
            Xây dựng lộ trình phù hợp với trình độ và mục tiêu của bạn
          </p>
        </div>

        {/* Suggestion từ Placement Test */}
        {loadingSuggestion ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải gợi ý...</p>
          </div>
        ) : suggestion?.hasSuggestion && suggestion.data ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  💡 Đã làm bài kiểm tra đầu vào
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Kết quả: </span>
                    <span className="text-blue-900">{suggestion.data.avLevel} ({suggestion.data.category})</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Điểm: </span>
                    <span className="text-blue-900">{suggestion.data.score.percentage}%</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">IELTS tương đương: </span>
                    <span className="text-blue-900">
                      {suggestion.data.ieltsRange.min} - {suggestion.data.ieltsRange.max}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Gợi ý bắt đầu từ: </span>
                    <span className="text-blue-900 font-semibold">{suggestion.data.suggestedLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                  Chưa có kết quả kiểm tra đầu vào
                </h3>
                <p className="text-yellow-800 text-sm">
                  Bạn nên làm bài kiểm tra đầu vào để nhận gợi ý chính xác về trình độ hiện tại.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bước 1: Chọn trình độ hiện tại */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📊 BƯỚC 1: Chọn trình độ hiện tại
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVEL_GROUPS.map((level) => (
              <button
                key={level}
                onClick={() => setCurrentLevel(level)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  currentLevel === level
                    ? `${LEVEL_INFO[level].color} border-current shadow-md scale-105`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                }`}
              >
                <div className="font-bold text-lg mb-1">{level}</div>
                <div className="text-sm">{LEVEL_INFO[level].label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bước 2: Chọn mục tiêu */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🎯 BƯỚC 2: Chọn mục tiêu
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LEVEL_GROUPS.map((level) => {
              const isDisabled = !!currentLevel && LEVEL_GROUPS.indexOf(level) < LEVEL_GROUPS.indexOf(currentLevel);
              return (
                <button
                  key={level}
                  onClick={() => !isDisabled && setTargetLevel(level)}
                  disabled={isDisabled}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isDisabled
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : targetLevel === level
                      ? `${LEVEL_INFO[level].color} border-current shadow-md scale-105`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow'
                  }`}
                >
                  <div className="font-bold text-lg mb-1">{level}</div>
                  <div className="text-sm">{LEVEL_INFO[level].label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tóm tắt lộ trình */}
        {currentLevel && targetLevel && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📋 Tóm tắt lộ trình
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-3">
                <span className="font-semibold min-w-[140px]">Từ:</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                  {currentLevel}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold">Đến:</span>
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                  {targetLevel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold min-w-[140px]">Số chặng:</span>
                <span>{calculateStages()} chặng</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold min-w-[140px]">Thời gian dự kiến:</span>
                <span>{getEstimatedWeeks()} tuần (~{Math.ceil(getEstimatedWeeks() / 4)} tháng)</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleCreateRoadmap}
            disabled={!currentLevel || !targetLevel || loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang tạo...
              </>
            ) : (
              <>
                🚀 Tạo lộ trình
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSetupPage;

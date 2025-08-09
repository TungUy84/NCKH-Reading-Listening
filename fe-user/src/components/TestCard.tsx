import React from 'react';
import { PlacementTest } from '../types';

interface TestCardProps {
  test: PlacementTest;
  onStart: (testId: string) => void;
  isLoading?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({ test, onStart, isLoading = false }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'listening':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 8l4-4v16l-4-4H3a1 1 0 01-1-1V9a1 1 0 011-1h3z" />
          </svg>
        );
      case 'reading':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'listening':
        return 'Nghe hiểu';
      case 'reading':
        return 'Đọc hiểu';
      default:
        return 'Tổng hợp';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'listening':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reading':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} giờ`;
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-300 group cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getCategoryColor(test.category)}`}>
          {getCategoryIcon(test.category)}
          <span className="text-sm font-medium">{getCategoryLabel(test.category)}</span>
        </div>
        <div className="text-sm text-gray-500">
          {test.totalQuestions} câu hỏi
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {test.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {test.description}
        </p>
      </div>

      {/* Test Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Thời gian:</span>
          <span className="font-medium text-gray-900">{formatDuration(test.timeLimit)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tổng điểm:</span>
          <span className="font-medium text-gray-900">{test.totalPoints} điểm</span>
        </div>
      </div>

      {/* Instructions Preview */}
      {test.instructions && test.instructions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Hướng dẫn:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {test.instructions.slice(0, 2).map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                <span className="line-clamp-2">{instruction}</span>
              </li>
            ))}
            {test.instructions.length > 2 && (
              <li className="text-gray-400">
                +{test.instructions.length - 2} hướng dẫn khác...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onStart(test._id)}
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-orange-600 transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Đang tải...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Bắt đầu làm bài</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

export default TestCard;

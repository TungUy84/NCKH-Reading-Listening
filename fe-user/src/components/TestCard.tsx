import React from 'react';
import { PlacementTest } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface TestCardProps {
  test: PlacementTest;
  onStart: (testId: string) => void;
  isLoading?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({ test, onStart, isLoading = false }) => {

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
    <Card interactive className="group h-full flex flex-col border-gray-200/70">
      <div className="flex items-start justify-between mb-5">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getCategoryColor(test.category)}`}>
          {getCategoryLabel(test.category)}
        </span>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2 py-1">
          {test.totalQuestions} câu hỏi
        </span>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {test.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {test.description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500 mb-1">Thời gian</p>
          <p className="font-medium text-gray-900">{formatDuration(test.timeLimit)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-gray-500 mb-1">Tổng điểm</p>
          <p className="font-medium text-gray-900">{test.totalPoints}</p>
        </div>
      </div>
      {test.instructions && test.instructions.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-700 mb-2">Hướng dẫn</p>
          <ul className="space-y-1">
            {test.instructions.slice(0, 2).map((instruction, i) => (
              <li key={i} className="text-[11px] text-gray-600 line-clamp-2 relative pl-3">
                <span className="absolute left-0 top-1 w-1 h-1 bg-gray-400 rounded-full" />
                {instruction}
              </li>
            ))}
            {test.instructions.length > 2 && (
              <li className="text-[11px] text-gray-400">+{test.instructions.length - 2} mục khác...</li>
            )}
          </ul>
        </div>
      )}
      <div className="mt-auto pt-2">
        <Button
          onClick={() => onStart(test._id)}
          disabled={isLoading}
          loading={isLoading}
          fullWidth
          size="sm"
          className="justify-center"
        >
          Bắt đầu làm bài
        </Button>
      </div>
    </Card>
  );
};

export default TestCard;

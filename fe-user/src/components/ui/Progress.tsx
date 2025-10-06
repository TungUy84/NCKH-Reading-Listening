import React from 'react';
import clsx from 'clsx';

export interface ProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5'
};

export const Progress: React.FC<ProgressProps> = ({ value, size = 'md', showLabel }) => {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full flex flex-col gap-1">
      <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', heightMap[size])}>
        <div
          className={clsx('bg-blue-600 h-full rounded-full transition-all duration-300')}
          style={{ width: `${safe}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600">{safe.toFixed(0)}%</span>
      )}
    </div>
  );
};

export default Progress;

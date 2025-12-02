import React from 'react';
import clsx from 'clsx';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'inverse';
  className?: string;
}

// Mapping kích thước spinner
const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
// Màu sắc phù hợp với từng nền
const variantMap = {
  default: 'text-gray-400',
  primary: 'text-blue-600',
  inverse: 'text-white'
};

// Spinner hiển thị trạng thái loading
export const Loader: React.FC<LoaderProps> = ({ size = 'md', variant = 'default' }) => {
  return (
    <span
      className={clsx('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', sizeMap[size], variantMap[variant])}
      role="status"
      aria-label="loading"
    />
  );
};

export default Loader;

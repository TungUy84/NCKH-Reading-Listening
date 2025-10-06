import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8'
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  interactive,
  padding = 'md',
  ...rest
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        interactive && 'transition hover:shadow-md hover:border-gray-300',
        paddingMap[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;

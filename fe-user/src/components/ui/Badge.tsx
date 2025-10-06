import React from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pill?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  outline: 'border border-gray-300 text-gray-600'
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', pill, className, ...rest }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center text-xs font-medium px-2.5 py-1',
        pill ? 'rounded-full' : 'rounded-md',
        variantStyles[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;
